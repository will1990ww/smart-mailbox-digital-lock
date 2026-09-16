/* checks.mjs — deployment quality gate. Exits non-zero on failure. */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("./", import.meta.url)).replace(/\/?$/, "/");
const fails = [], warns = [];
function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n === "node_modules" || n.startsWith(".git")) continue;
    const f = dir + "/" + n;
    statSync(f).isDirectory() ? walk(f, out) : out.push(f);
  }
  return out;
}
const htmlFiles = walk(root).filter((f) => f.endsWith(".html") && !f.endsWith("preview.html"));
for (const file of htmlFiles) {
  const rel = file.replace(root, "");
  const html = readFileSync(file, "utf8");
  const isHome = rel === "index.html";
  const tagRe = /<([a-zA-Z][\w-]*)\b([^>]*)>/g; let m;
  while ((m = tagRe.exec(html))) { const c = (m[2].match(/\bclass\s*=/g) || []).length; if (c > 1) fails.push(`${rel}: <${m[1]}> has ${c} class attributes`); }
  if (/\son\w+\s*=/.test(html)) fails.push(`${rel}: inline event handler present`);
  if (/\sstyle\s*=/.test(html)) fails.push(`${rel}: inline style= present (breaks strict CSP)`);
  const ldRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g; let ld, n = 0;
  while ((ld = ldRe.exec(html))) { n++; try { JSON.parse(ld[1]); } catch (e) { fails.push(`${rel}: invalid JSON-LD #${n}: ${e.message}`); } }
  if (isHome && n < 1) fails.push(`${rel}: no JSON-LD found`);
  if (/"aggregateRating"/.test(html)) fails.push(`${rel}: aggregateRating present — self-serving review markup`);
  if (isHome && /"@type":"BreadcrumbList"/.test(html)) fails.push(`${rel}: homepage must not emit BreadcrumbList`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fails.push(`${rel}: expected exactly 1 <h1>, found ${h1}`);
  const textOnly = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
  if (/[\u0400-\u04FF]/.test(textOnly)) fails.push(`${rel}: Cyrillic characters found in English content`);
  if (/\uFFFD/.test(textOnly)) fails.push(`${rel}: encoding corruption detected`);
  for (const link of (html.match(/https:\/\/wa\.me\/[^"'\s]+/g) || [])) {
    const t = decodeURIComponent(link).split("?text=")[1] || "";
    if (/#\d{1,3}-\d{1,4}/.test(t)) fails.push(`${rel}: unit number in a WhatsApp link`);
    if (/\b\d{6}\b/.test(t)) fails.push(`${rel}: full postal code in a WhatsApp link`);
    if (/\bBlock:\s*\d/i.test(t)) fails.push(`${rel}: block number in a WhatsApp link`);
  }
  if (/\b24\/7\b|24 hours a day|round-the-clock/i.test(html)) fails.push(`${rel}: unsupported 24/7 availability claim`);
  const island = html.match(/<script type="application\/json" id="site-data">([\s\S]*?)<\/script>/);
  if (island) { try { JSON.parse(island[1].replace(/\\u003c/g, "<")); } catch (e) { fails.push(`${rel}: site-data JSON invalid: ${e.message}`); } }
  const hrefRe = /href="([^"#:]+)"/g; let h;
  while ((h = hrefRe.exec(html))) {
    const t = h[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(t)) continue;
    const dir = file.substring(0, file.lastIndexOf("/"));
    let r = t.startsWith("/") ? root + t.slice(1) : dir + "/" + t;
    if (r.endsWith("/")) r += "index.html";
    if (!existsSync(r)) { if (t.includes("assets/")) continue; warns.push(`${rel}: link may be broken -> ${t}`); }
  }
}
const placeholders = [/example\.sg/i, /yourdomain/i, /TODO /i, /6500000000/];
for (const f of [...htmlFiles, root + "sitemap.xml", root + "robots.txt"].filter(existsSync)) {
  const txt = readFileSync(f, "utf8");
  placeholders.forEach((re) => { if (re.test(txt)) warns.push(`${f.replace(root, "")}: placeholder ${re} still present (blocks launch)`); });
}
const imgDir = root + "assets/img";
if (existsSync(imgDir)) for (const f of walk(imgDir)) {
  if (/\.(jpe?g|png|webp|avif)$/i.test(f)) { const kb = statSync(f).size / 1024; if (kb > 300) fails.push(`${f.replace(root, "")}: ${kb.toFixed(0)} KB exceeds the 300 KB budget`); }
}
["sitemap.xml", "robots.txt", "404.html"].forEach((f) => { if (!existsSync(root + f)) fails.push(`missing ${f}`); });
if (!existsSync(root + ".nojekyll")) fails.push("missing .nojekyll — GitHub Pages would let Jekyll drop underscore-prefixed files");
for (const file of htmlFiles) {
  const rel = file.replace(root, "");
  if (rel.replace(/^\//, "") === "404.html") continue;
  const html = readFileSync(file, "utf8");
  if (/(?:src|href)="\/assets\//.test(html)) fails.push(`${rel}: root-absolute /assets/ path breaks sub-folder hosting`);
}
console.log(`checks: ${htmlFiles.length} HTML file(s) scanned.`);
if (warns.length) { console.log("\nWARNINGS (launch blockers, safe in preview):"); warns.forEach((w) => console.log("  ⚠ " + w)); }
if (fails.length) { console.log("\nFAILURES:"); fails.forEach((f) => console.log("  ✗ " + f)); process.exit(1); }
console.log(`✓ All hard checks passed${warns.length ? ` (${warns.length} warning(s))` : ""}.`);

/* checks.mjs — deployment quality gate. Exits non-zero on any failure. */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("./", import.meta.url));
const fails = [], warns = [];
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".git")) continue;
    const full = dir + "/" + name; const st = statSync(full);
    if (st.isDirectory()) walk(full, out); else out.push(full);
  }
  return out;
}
const htmlFiles = walk(root).filter((f) => f.endsWith(".html") && !f.endsWith("preview.html"));
for (const file of htmlFiles) {
  const rel = file.replace(root, ""); const html = readFileSync(file, "utf8");
  const tagRe = /<([a-zA-Z][\w-]*)\b([^>]*)>/g; let m;
  while ((m = tagRe.exec(html))) { const c = (m[2].match(/\bclass\s*=/g) || []).length; if (c > 1) fails.push(`${rel}: <${m[1]}> has ${c} class attributes`); }
  if (/\son\w+\s*=/.test(html)) fails.push(`${rel}: inline event handler present`);
  if (/\sstyle\s*=/.test(html)) fails.push(`${rel}: inline style= present (breaks strict CSP)`);
  const ldRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g; let ld, ldCount = 0;
  while ((ld = ldRe.exec(html))) { ldCount++; try { JSON.parse(ld[1]); } catch (e) { fails.push(`${rel}: invalid JSON-LD (${ldCount}): ${e.message}`); } }
  if (rel === "index.html" && ldCount < 1) fails.push(`${rel}: no JSON-LD found`);
  const island = html.match(/<script type="application\/json" id="site-data">([\s\S]*?)<\/script>/);
  if (island) { try { JSON.parse(island[1].replace(/\\u003c/g, "<")); } catch (e) { fails.push(`${rel}: site-data JSON invalid: ${e.message}`); } }
  const h1 = (html.match(/<h1[\s>]/g) || []).length; if (h1 !== 1) fails.push(`${rel}: expected exactly 1 <h1>, found ${h1}`);
  const hrefRe = /href="([^"#:]+)"/g; let h;
  while ((h = hrefRe.exec(html))) {
    const t = h[1]; if (/^(https?:|mailto:|tel:|data:)/.test(t) || t.startsWith("/")) continue;
    const dir = file.substring(0, file.lastIndexOf("/")); let r = dir + "/" + t; if (r.endsWith("/")) r += "index.html";
    if (!existsSync(r) && !existsSync(dir + "/" + t)) { if (t.startsWith("assets/img/")) continue; warns.push(`${rel}: link may be broken -> ${t}`); }
  }
}
const placeholder = [/yourdomain\.sg/i, /example\.sg/i, /xxxx/i, /0000\s?0000/, /6500000000/, /20XXXXXXXK/i];
for (const file of [...htmlFiles, root + "sitemap.xml", root + "robots.txt"].filter(existsSync)) {
  const txt = readFileSync(file, "utf8");
  placeholder.forEach((re) => { if (re.test(txt)) warns.push(`${file.replace(root, "")}: placeholder ${re} (fine in preview, blocks launch)`); });
}
const imgDir = root + "assets/img";
if (existsSync(imgDir)) for (const f of walk(imgDir)) if (/\.(jpe?g|png|webp|avif)$/i.test(f)) { const kb = statSync(f).size / 1024; if (kb > 300) fails.push(`${f.replace(root, "")}: ${kb.toFixed(0)} KB exceeds 300 KB budget`); }
["sitemap.xml", "robots.txt"].forEach((f) => { if (!existsSync(root + f)) fails.push(`missing ${f}`); });
console.log(`checks: ${htmlFiles.length} HTML file(s) scanned.`);
if (warns.length) { console.log("\nWARNINGS:"); warns.forEach((w) => console.log("  ⚠ " + w)); }
if (fails.length) { console.log("\nFAILURES:"); fails.forEach((f) => console.log("  ✗ " + f)); process.exit(1); }
console.log("✓ All hard checks passed" + (warns.length ? ` (${warns.length} warning(s))` : "") + ".");

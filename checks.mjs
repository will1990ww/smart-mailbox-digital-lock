/* =============================================================================
 * checks.mjs — deployment quality gate (run in CI after build).
 * Covers: HTML sanity, duplicate class attributes, JSON-LD validity, internal
 * link integrity, placeholder detection, and image-size limits.
 * Exits non-zero on any failure. (Lighthouse/a11y run separately in CI.)
 * ========================================================================== */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./", import.meta.url));
const fails = [];
const warns = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".git")) continue;
    const full = dir + "/" + name;
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const htmlFiles = walk(root).filter((f) => f.endsWith(".html") && !f.endsWith("preview.html"));

for (const file of htmlFiles) {
  const rel = file.replace(root, "");
  const html = readFileSync(file, "utf8");

  // 1) Duplicate class attributes on a single tag (invalid HTML).
  const tagRe = /<([a-zA-Z][\w-]*)\b([^>]*)>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    const attrs = m[2];
    const classCount = (attrs.match(/\bclass\s*=/g) || []).length;
    if (classCount > 1) fails.push(`${rel}: <${m[1]}> has ${classCount} class attributes`);
  }

  // 2) Basic well-formedness: no stray inline event handlers / inline styles.
  if (/\son\w+\s*=/.test(html)) fails.push(`${rel}: inline event handler (on*=) present`);
  if (/\sstyle\s*=/.test(html)) fails.push(`${rel}: inline style= present (breaks strict CSP)`);

  // 3) JSON-LD blocks must be valid JSON.
  const ldRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let ld, ldCount = 0;
  while ((ld = ldRe.exec(html))) {
    ldCount++;
    try { JSON.parse(ld[1]); } catch (e) { fails.push(`${rel}: invalid JSON-LD (block ${ldCount}): ${e.message}`); }
  }
  if (rel === "index.html" && ldCount < 1) fails.push(`${rel}: no JSON-LD found`);

  // 4) runtime data island must be valid JSON after un-escaping.
  const island = html.match(/<script type="application\/json" id="site-data">([\s\S]*?)<\/script>/);
  if (island) {
    try { JSON.parse(island[1].replace(/\\u003c/g, "<")); }
    catch (e) { fails.push(`${rel}: site-data JSON invalid: ${e.message}`); }
  }

  // 5) Internal link integrity (relative hrefs to local files/dirs).
  const hrefRe = /href="([^"#:]+)"/g;
  let h;
  while ((h = hrefRe.exec(html))) {
    const target = h[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(target)) continue;
    if (target.startsWith("/")) continue; // server-absolute; can't resolve at build
    const dir = file.substring(0, file.lastIndexOf("/"));
    let resolved = dir + "/" + target;
    if (resolved.endsWith("/")) resolved += "index.html";
    if (!existsSync(resolved) && !existsSync(dir + "/" + target)) {
      // allow asset paths that will exist post-image-drop
      if (target.startsWith("assets/img/")) continue;
      warns.push(`${rel}: link may be broken -> ${target}`);
    }
  }
}

// 6) Placeholder detection across generated output.
const placeholder = [/yourdomain\.sg/i, /example\.sg/i, /xxxx/i, /0000\s?0000/, /6500000000/, /20XXXXXXXK/i];
for (const file of [...htmlFiles, root + "sitemap.xml", root + "robots.txt"].filter(existsSync)) {
  const txt = readFileSync(file, "utf8");
  placeholder.forEach((re) => { if (re.test(txt)) warns.push(`${file.replace(root, "")}: placeholder ${re} (fine in preview, blocks launch)`); });
}

// 7) Image-size limits (fail if any shipped image > 300 KB).
const imgDir = root + "assets/img";
if (existsSync(imgDir)) {
  for (const f of walk(imgDir)) {
    if (/\.(jpe?g|png|webp|avif)$/i.test(f)) {
      const kb = statSync(f).size / 1024;
      if (kb > 300) fails.push(`${f.replace(root, "")}: ${kb.toFixed(0)} KB exceeds 300 KB image budget`);
    }
  }
}

// 8) sitemap.xml + robots.txt exist.
["sitemap.xml", "robots.txt"].forEach((f) => { if (!existsSync(root + f)) fails.push(`missing ${f}`); });

console.log(`checks: ${htmlFiles.length} HTML file(s) scanned.`);
if (warns.length) { console.log("\nWARNINGS:"); warns.forEach((w) => console.log("  ⚠ " + w)); }
if (fails.length) {
  console.log("\nFAILURES:"); fails.forEach((f) => console.log("  ✗ " + f));
  process.exit(1);
}
console.log("✓ All hard checks passed" + (warns.length ? ` (${warns.length} warning(s))` : "") + ".");

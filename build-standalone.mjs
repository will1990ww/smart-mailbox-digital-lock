/* build-standalone.mjs — single-file preview.html (inlined CSS+JS). Run after build.mjs. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("./", import.meta.url));
const read = (p) => readFileSync(root + p, "utf8");
if (!existsSync(root + "index.html")) { console.error("✗ run build.mjs first."); process.exit(1); }
let html = read("index.html");
const css = read("assets/css/site.css");
html = html.replace(/<link rel="preload" as="style" href="assets\/css\/site\.css">\n/, "");
html = html.replace(/<link rel="stylesheet" href="assets\/css\/site\.css">/, `<style>\n${css}\n</style>`);
const order = ["pricing", "validation", "order-message", "app"];
let bundle = "";
for (const name of order) { let src = read(`assets/js/${name}.mjs`); src = src.replace(/^\s*import[^\n]*\n/gm, ""); src = src.replace(/^export\s+/gm, ""); bundle += `\n/* ===== ${name}.mjs ===== */\n${src}\n`; }
html = html.replace(/<script type="module" src="assets\/js\/app\.mjs"><\/script>/, `<script type="module">\n${bundle}\n</script>`);
writeFileSync(root + "preview.html", html);
console.log("✓ Wrote preview.html (single-file, offline-openable preview).");

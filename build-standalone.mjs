/* =============================================================================
 * build-standalone.mjs — produce a single self-contained preview.html.
 * Inlines CSS + bundles the ES modules so you can DOUBLE-CLICK to view it
 * (ES modules are blocked over file://). LOCAL PREVIEW ONLY — do not deploy
 * (inlining reintroduces inline CSS/JS which strict CSP forbids).
 * ========================================================================== */
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("./assets/css/site.css", import.meta.url), "utf8");

const moduleFiles = [
  "./assets/js/pricing.mjs",
  "./assets/js/validation.mjs",
  "./assets/js/order-message.mjs",
  "./assets/js/app.mjs",
];
const bundle = moduleFiles
  .map((f) => readFileSync(new URL(f, import.meta.url), "utf8"))
  .join("\n\n")
  .replace(/import\s+\{[\s\S]*?\}\s+from\s+["'][^"']+["'];?/g, "")
  .replace(/import\s+[^;]+from\s+["'][^"']+["'];?/g, "")
  .replace(/export\s+function/g, "function")
  .replace(/export\s+const/g, "const")
  .replace(/export\s+default\s+/g, "");

// IMPORTANT: FUNCTION replacers — a string replacement would treat `$$` (used by
// our DOM helper) as a special pattern and corrupt the script.
const out = html
  .replace(/<link rel="stylesheet" href="assets\/css\/site\.css">/, () => `<style>\n${css}\n</style>`)
  .replace(/<script type="module" src="assets\/js\/app\.mjs"><\/script>/, () => `<script>\n(function(){\n"use strict";\n${bundle}\n})();\n</script>`);

writeFileSync(new URL("./preview.html", import.meta.url), out);
console.log(`✓ Wrote preview.html (${(out.length / 1024).toFixed(1)} KB) — double-click to open, fully self-contained.`);

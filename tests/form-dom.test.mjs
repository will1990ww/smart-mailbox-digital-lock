import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeDom } from "./_dom-harness.mjs";

// Build the bundle the same way the browser sees it (modules concatenated).
function loadBundle() {
  const files = ["pricing", "validation", "order-message", "app"].map(
    (n) => readFileSync(new URL(`../assets/js/${n}.mjs`, import.meta.url), "utf8")
  );
  return files.join("\n")
    .replace(/import\s+\{[\s\S]*?\}\s+from\s+["'][^"']+["'];?/g, "")
    .replace(/export\s+function/g, "function")
    .replace(/export\s+const/g, "const")
    .replace(/export\s+default\s+/g, "");
}

function boot() {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const { document } = makeDom(html);
  global.document = document;
  global.window = { open: () => ({ opener: null }) };
  global.console = console;
  // run the app bundle in this DOM
  new Function(loadBundle())();
  return document;
}

test("product dropdown has all 9 products", () => {
  const doc = boot();
  const opts = doc.getElementById("orderProduct").options;
  assert.equal(opts.length, 9);
  assert.equal(opts[0].value, "P1");
});

test("colour dropdown is POPULATED on load (first product's colours)", () => {
  const doc = boot();
  const colour = doc.getElementById("orderColour");
  assert.ok(colour, "colour select exists");
  assert.ok(colour.options.length >= 1, `expected >=1 colour option, got ${colour.options.length}`);
  // P1 = Traditional Key Lock -> Silver
  assert.equal(colour.options[0].textContent, "Silver");
});

test("changing product updates the colour options", () => {
  const doc = boot();
  const prod = doc.getElementById("orderProduct");
  const colour = doc.getElementById("orderColour");
  // switch to P2 (Battery-Free Mechanical) -> Black/White/Grey
  prod.value = "P2";
  prod.dispatch("change");
  const labels = colour.options.map((o) => o.textContent);
  assert.deepEqual(labels, ["Black", "Grey", "White"]);
});

test("estimate is rendered on load", () => {
  const doc = boot();
  const est = doc.getElementById("estimate");
  assert.match(est.textContent, /Estimated total/);
});

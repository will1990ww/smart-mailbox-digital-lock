import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { makeDom } from "./_dom-harness.mjs";

// Verifies the self-contained preview.html actually runs and fills the colour box.
const previewUrl = new URL("../preview.html", import.meta.url);

test("preview.html inlined bundle populates colour dropdown", { skip: !existsSync(previewUrl) }, () => {
  const html = readFileSync(previewUrl, "utf8");
  const bundle = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).pop();
  const { document } = makeDom(html);
  global.document = document;
  global.window = { open: () => ({ opener: null }) };
  new Function(bundle)();
  const colour = document.getElementById("orderColour");
  assert.ok(colour.options.length >= 1, `colour options: ${colour.options.length}`);
});

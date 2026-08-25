/* =============================================================================
 * colour-form.test.mjs — INTEGRATION test.
 * Loads the built index.html, runs the real app.mjs against a DOM shim, then
 * selects each product P1..P9 and asserts the colour dropdown updates to match
 * the owner's spec. This is what proves the "colour follows product" fix works.
 * ========================================================================== */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeDom } from "./_dom-harness.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const INDEX = root + "index.html";

const EXPECTED = {
  P1: ["SILVER"],
  P2: ["BLACK", "WHITE", "SILVER"],
  P3: ["BLACK", "WHITE"],
  P4: ["BLACK"],
  P5: ["BLACK"],
  P6: ["SILVER"],
  P7: ["BLACK"],
  P8: ["BLACK"],
  P9: ["SILVER"],
};

test("colour dropdown updates to the correct colours for every product", async () => {
  assert.ok(existsSync(INDEX), "index.html must be built first (run: node build.mjs)");
  const html = readFileSync(INDEX, "utf8");

  // Set up a browser-like global environment for app.mjs.
  const { document } = makeDom(html);
  globalThis.document = document;
  globalThis.window = {
    innerWidth: 1200,
    addEventListener() {},
    open() { return { opener: null }; },
  };
  // Deliberately DO NOT define IntersectionObserver so that guard is skipped.
  delete globalThis.IntersectionObserver;

  // Import the real application module (fresh) — it wires up the form on load.
  await import("../assets/js/app.mjs?colourtest=" + Date.now());

  const selP = document.getElementById("orderProduct");
  const selC = document.getElementById("orderColour");
  assert.ok(selP && selC, "product and colour selects must exist");

  const readColours = () => selC.options.map((o) => o.value);

  // On load, P1 is selected → Silver only.
  assert.deepEqual(readColours(), EXPECTED.P1, "initial (P1) colours");

  // Now walk every product and assert the colour options update on change.
  for (const id of Object.keys(EXPECTED)) {
    selP.value = id;            // select the product
    selP.dispatch("change");    // fire the change handler app.mjs attached
    assert.deepEqual(
      readColours(),
      EXPECTED[id],
      `colours for ${id} should be ${EXPECTED[id].join("/")}`
    );
  }

  // Clean up globals so other test files aren't affected.
  delete globalThis.document;
  delete globalThis.window;
});

/* colour-form.test.mjs — INTEGRATION: loads built index.html, runs app.mjs,
 * selects each product P1..P9 and asserts the colour dropdown updates. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeDom } from "./_dom-harness.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const INDEX = root + "index.html";

const EXPECTED = {
  P1: ["SILVER"], P2: ["BLACK", "WHITE", "SILVER"], P3: ["BLACK", "WHITE"],
  P4: ["BLACK"], P5: ["BLACK"], P6: ["SILVER"], P7: ["BLACK"], P8: ["BLACK"], P9: ["SILVER"],
};

test("colour dropdown updates to the correct colours for every product", async () => {
  assert.ok(existsSync(INDEX), "index.html must be built first (run: node build.mjs)");
  const html = readFileSync(INDEX, "utf8");
  const { document } = makeDom(html);
  const setG = (n, v) => Object.defineProperty(globalThis, n, { value: v, configurable: true, writable: true });
  setG("document", document);
  setG("window", { innerWidth: 1200, addEventListener() {}, open() { return { opener: null }; } });
  setG("navigator", {}); // no sendBeacon → analytics stays inert (disabled anyway)
  delete globalThis.IntersectionObserver;

  await import("../assets/js/app.mjs?colourtest=" + Date.now());

  const selP = document.getElementById("orderProduct");
  const selC = document.getElementById("orderColour");
  assert.ok(selP && selC, "product and colour selects must exist");
  const readColours = () => selC.options.map((o) => o.value);

  assert.deepEqual(readColours(), EXPECTED.P1, "initial (P1) colours");
  for (const id of Object.keys(EXPECTED)) {
    selP.value = id;
    selP.dispatch("change");
    assert.deepEqual(readColours(), EXPECTED[id], `colours for ${id}`);
  }
  for (const n of ["document", "window", "navigator"]) { try { delete globalThis[n]; } catch {} }
});

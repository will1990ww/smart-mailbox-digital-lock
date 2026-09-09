/* cart-dom.test.mjs — INTEGRATION: loads built index.html, runs app.mjs, clicks
 * add-to-cart on real product cards, and asserts the cart UI updates correctly. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeDom } from "./_dom-harness.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const INDEX = root + "index.html";

test("add-to-cart on product cards updates the cart panel + fab", async () => {
  assert.ok(existsSync(INDEX), "index.html must be built first");
  const html = readFileSync(INDEX, "utf8");
  const { document } = makeDom(html);
  const setG = (n, v) => Object.defineProperty(globalThis, n, { value: v, configurable: true, writable: true });
  setG("document", document);
  setG("window", { innerWidth: 1200, addEventListener() {}, open() { return { opener: null }; } });
  setG("navigator", {});
  delete globalThis.IntersectionObserver;

  await import("../assets/js/app.mjs?cartdom=" + Date.now());

  const addBtns = document.querySelectorAll("[data-add-product]");
  assert.equal(addBtns.length, 9, "one add-to-cart button per product");

  const p2 = addBtns.find((b) => b.getAttribute("data-add-product") === "P2");
  const p6 = addBtns.find((b) => b.getAttribute("data-add-product") === "P6");
  p2.dispatch("click"); p2.dispatch("click"); p6.dispatch("click");

  assert.equal(document.getElementById("cartCount").textContent, "3", "badge counts total quantity");
  assert.equal(document.getElementById("cartLines").children.length, 2, "two distinct lines");
  assert.match(document.getElementById("cartTotal").textContent, /S\$165/, "P2x2 (100) + P6x1 (65) = 165");
  assert.equal(document.getElementById("cartPanel").hidden, false, "panel is visible once items exist");

  for (const n of ["document", "window", "navigator"]) { try { delete globalThis[n]; } catch {} }
});

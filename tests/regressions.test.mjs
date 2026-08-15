import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRODUCTS, COLOURS } from "../src/data.mjs";

/* Guard: nav/brand links must not start with "/" (breaks on file://). */
test("no absolute-root hrefs in generated index.html (file:// safe)", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const badRootLinks = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(badRootLinks, [], `found root-absolute hrefs: ${badRootLinks.join(", ")}`);
});

test("primary nav links point to index.html#section", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  for (const id of ["products", "why", "reviews", "group", "areas", "faq"]) {
    assert.ok(html.includes(`href="index.html#${id}"`), `missing nav link for #${id}`);
  }
});

/* Guard: product→colour spec (P1 silver; P2 black grey white; P3 black white; ...). */
const SPEC = {
  P1: ["SILVER"],
  P2: ["BLACK", "GREY", "WHITE"],
  P3: ["BLACK", "WHITE"],
  P4: ["BLACK"],
  P5: ["BLACK"],
  P6: ["SILVER"],
  P7: ["BLACK"],
  P8: ["BLACK"],
  P9: ["SILVER"],
};

test("each product exposes exactly the specified colours in order", () => {
  for (const p of PRODUCTS) {
    assert.deepEqual(p.colours, SPEC[p.id], `colour mismatch for ${p.id}`);
  }
});

test("every colour key is defined in the whitelist", () => {
  for (const p of PRODUCTS) {
    for (const k of p.colours) assert.ok(COLOURS[k], `undefined colour ${k} on ${p.id}`);
  }
});

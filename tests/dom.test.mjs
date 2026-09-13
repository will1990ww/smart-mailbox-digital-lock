/* Integration: load the BUILT pages, run the real app.mjs, exercise the UI. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeDom } from "./_dom-harness.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const EXPECTED = { P1:["SILVER"],P2:["BLACK","WHITE","SILVER"],P3:["BLACK","WHITE"],P4:["BLACK"],P5:["BLACK"],P6:["SILVER"],P7:["BLACK"],P8:["BLACK"],P9:["SILVER"] };

async function boot(file, tag) {
  const path = root + file;
  assert.ok(existsSync(path), `${file} must be built first`);
  const { document } = makeDom(readFileSync(path, "utf8"));
  const set = (n,v)=>Object.defineProperty(globalThis,n,{value:v,configurable:true,writable:true});
  set("document", document);
  set("window", { innerWidth:1200, addEventListener(){}, open:()=>({opener:null}) });
  set("navigator", {});
  set("localStorage", undefined);
  delete globalThis.IntersectionObserver;
  await import(`../assets/js/app.mjs?${tag}=${Date.now()}`);
  return document;
}
const teardown = () => { for (const n of ["document","window","navigator","localStorage"]) { try { delete globalThis[n]; } catch {} } };

test("colour dropdown follows the selected product for P1..P9", async () => {
  const doc = await boot("index.html", "col");
  const selP = doc.getElementById("qProduct"), selC = doc.getElementById("qColour");
  assert.deepEqual(selC.options.map(o=>o.value), EXPECTED.P1);
  for (const id of Object.keys(EXPECTED)) {
    selP.value = id; selP.dispatch("change");
    assert.deepEqual(selC.options.map(o=>o.value), EXPECTED[id], `colours for ${id}`);
  }
  teardown();
});

test("E-04: itemised breakdown renders on load", async () => {
  const doc = await boot("index.html", "bd");
  const t = doc.getElementById("breakdown").textContent;
  assert.match(t, /Lock \+ standard installation/);
  assert.match(t, /Estimated total/);
  assert.match(t, /not a confirmed price/i);
  teardown();
});

test("E-01/M13: adding to the quote list switches mode and hides the single pane", async () => {
  const doc = await boot("index.html", "mode");
  const single = doc.getElementById("singlePane"), multi = doc.getElementById("multiPane");
  assert.equal(single.hidden, false);
  assert.equal(multi.hidden, true);
  const add = doc.querySelectorAll("[data-add-product]");
  assert.ok(add.length >= 3, "homepage features recommended models");
  add[0].dispatch("click");
  assert.equal(doc.getElementById("modeMulti").checked, true);
  assert.equal(single.hidden, true, "only one model is ever visible");
  assert.equal(multi.hidden, false);
  assert.equal(doc.getElementById("quoteCount").textContent, "1");
  teardown();
});

test("products page: 9 cards, compare tool and G-03 focus removal", async () => {
  const doc = await boot("products/index.html", "pdp");
  assert.equal(doc.querySelectorAll("[data-add-product]").length, 9);
  const keyBtn = doc.querySelectorAll(".filter-row [data-filter]").find(b=>b.getAttribute("data-filter")==="key");
  keyBtn.dispatch("click");
  const hidden = doc.querySelectorAll("#productGrid > [data-categories]").find(c=>c.hidden);
  assert.ok(hidden, "non-matching cards hide");
  assert.equal(hidden.getAttribute("aria-hidden"), "true");
  hidden.querySelectorAll("a,button,select,input").forEach(n=>assert.equal(n.getAttribute("tabindex"), "-1"));
  // M18 compare
  const boxes = doc.querySelectorAll("[data-compare]");
  assert.equal(boxes.length, 9);
  boxes[0].checked = true; boxes[0].dispatch("change");
  assert.match(doc.getElementById("compareNote").textContent, /Comparing 1 model/);
  teardown();
});

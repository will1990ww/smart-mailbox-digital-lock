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
  set("navigator", {}); set("localStorage", undefined);
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
test("homepage shows ALL NINE products and the comparison table", async () => {
  const doc = await boot("index.html", "nine");
  assert.equal(doc.querySelectorAll("[data-add-product]").length, 9);
  assert.equal(doc.querySelectorAll("[data-compare]").length, 9);
  teardown();
});
test("itemised breakdown renders on load", async () => {
  const doc = await boot("index.html", "bd");
  const t = doc.getElementById("breakdown").textContent;
  assert.match(t, /professional installation/i);
  assert.match(t, /Estimated total/);
  teardown();
});
test("adding to the quote list switches mode and hides the single pane", async () => {
  const doc = await boot("index.html", "mode");
  const single = doc.getElementById("singlePane"), multi = doc.getElementById("multiPane");
  assert.equal(single.hidden, false); assert.equal(multi.hidden, true);
  doc.querySelectorAll("[data-add-product]")[0].dispatch("click");
  assert.equal(doc.getElementById("modeMulti").checked, true);
  assert.equal(single.hidden, true); assert.equal(multi.hidden, false);
  assert.equal(doc.getElementById("quoteCount").textContent, "1");
  teardown();
});
test("keyword pages exist and own their H1", () => {
  const pages = {
    "letterbox-lock-price/index.html": "Letterbox Lock Replacement Cost in Singapore",
    "letterbox-lock-replacement/index.html": "HDB &amp; Condo Letterbox Lock Replacement in Singapore",
    "mailbox-lock-replacement/index.html": "Mailbox Lock Replacement for Landed Homes &amp; Outdoor Letterboxes",
    "letterbox-lock-installation/index.html": "Letterbox &amp; Mailbox Lock Installation Singapore",
    "wt-digital-letterbox-lock/index.html": "WT Digital Letterbox Locks in Singapore",
    "hdb-letterbox-lock/index.html": "HDB Letterbox Lock Replacement &amp; Cost",
  };
  for (const [file, h1] of Object.entries(pages)) {
    assert.ok(existsSync(root + file), `${file} must exist`);
    const html = readFileSync(root + file, "utf8");
    assert.ok(html.includes(`<h1>${h1}</h1>`), `${file} H1 mismatch`);
  }
});
test("cost page carries a price table and pricing FAQ schema", () => {
  const html = readFileSync(root + "letterbox-lock-price/index.html", "utf8");
  assert.match(html, /class="compare cost"/, "cost table present");
  assert.match(html, /S\$85/, "open+replace figure shown");
  assert.match(html, /"@type":"FAQPage"/, "pricing FAQ schema present");
  const home = readFileSync(root + "index.html", "utf8");
  assert.match(home, /id="cost"/, "homepage cost section present");
});
test("homepage keyword and hygiene guarantees", () => {
  const home = readFileSync(root + "index.html", "utf8");
  assert.match(home, /<title>[^<]*Letterbox Lock Installation[^<]*<\/title>/);
  assert.ok(home.includes("WT letterbox locks"), "brand named in hero");
  assert.ok(/"brand":\{"@type":"Brand","name":"WT"\}/.test(home), "Brand entity in JSON-LD");
  assert.ok(!/id="payment"/.test(home), "no Payment & GST section");
  assert.ok(!/\(optional\)/i.test(home), "no (optional) labels");
});
test("products page: 9 cards and filtering removes hidden from tab order", async () => {
  const doc = await boot("products/index.html", "pdp");
  assert.equal(doc.querySelectorAll("[data-add-product]").length, 9);
  const keyBtn = doc.querySelectorAll(".filter-row [data-filter]").find(b=>b.getAttribute("data-filter")==="key");
  keyBtn.dispatch("click");
  const hidden = doc.querySelectorAll("#productGrid > [data-categories]").find(c=>c.hidden);
  assert.ok(hidden);
  assert.equal(hidden.getAttribute("aria-hidden"), "true");
  hidden.querySelectorAll("a,button,select,input").forEach(n=>assert.equal(n.getAttribute("tabindex"), "-1"));
  teardown();
});

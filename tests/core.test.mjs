/* Core rules: pricing, privacy, validation, quote list, brand, SEO integrity. */
import test from "node:test";
import assert from "node:assert/strict";
import { calculateLine, calculateOrder, resolveTier, buildBreakdown } from "../assets/js/pricing.mjs";
import { waLink, buildQuoteMessage, buildDetailsForClipboard, consolidateItems, containsNoPreciseIdentifiers, MAX_MESSAGE_CHARS } from "../assets/js/quote-message.mjs";
import { postalSector, normalisePostal, validateQuote } from "../assets/js/validation.mjs";
import { initAnalytics, track } from "../assets/js/analytics.mjs";
import { createQuoteList } from "../assets/js/quote-list.mjs";
import { SITE, PRODUCTS, COLOURS, REVIEWS, FAQS, COMPATIBILITY, SERVICE_PAGES } from "../src/data.mjs";

const TIERS = SITE.pricing.tiers;
const memStore = () => { const m = new Map(); return { getItem:(k)=>m.has(k)?m.get(k):null, setItem:(k,v)=>m.set(k,String(v)), removeItem:(k)=>m.delete(k) }; };
const mkList = () => createQuoteList({ products: PRODUCTS, colours: COLOURS, tiers: TIERS, storage: memStore() });

test("tier boundaries 1/4/5/9/10/19/20/100", () => {
  assert.equal(resolveTier(1, TIERS), null); assert.equal(resolveTier(4, TIERS), null);
  assert.equal(resolveTier(5, TIERS).rate, 0.05); assert.equal(resolveTier(9, TIERS).rate, 0.05);
  assert.equal(resolveTier(10, TIERS).rate, 0.10); assert.equal(resolveTier(19, TIERS).rate, 0.10);
  assert.equal(resolveTier(20, TIERS).rate, null); assert.equal(resolveTier(100, TIERS).rate, null);
});
test("opening fee is charged PER UNIT", () => {
  assert.equal(calculateLine({ unitPrice: 60, quantity: 10, accessFeePerUnit: 25, tiers: [] }).subtotal, 850);
});
test("20+ units never returns a total", () => {
  const o = calculateOrder([{ unitPrice: 95, quantity: 25 }], TIERS);
  assert.equal(o.requiresQuote, true); assert.equal(o.total, null);
});
test("breakdown itemises lock+installation, opening fee, subtotal and discount", () => {
  const o = calculateOrder([{ unitPrice: 60, quantity: 10 }], TIERS, 25);
  const bd = buildBreakdown(o, { accessLabel: "Locked, key lost", accessFeePerUnit: 25 });
  assert.match(bd.rows[0].label, /professional installation/i);
  assert.equal(bd.rows[0].value, "S$600"); assert.equal(bd.rows[1].value, "S$250");
  assert.equal(bd.total, "S$765");
});
test("block, unit and full postal never enter the WhatsApp message", () => {
  const result = calculateOrder([{ unitPrice: 60, quantity: 2 }], TIERS, 25);
  const items = [{ id:"P2", name:"Battery-Free Mechanical", colourLabel:"Black", quantity:2, unitPrice:60 }];
  const msg = buildQuoteMessage({ items, result, accessLabel:"Locked, key lost", accessFeePerUnit:25, postal:"520123" });
  assert.ok(containsNoPreciseIdentifiers(msg));
  assert.ok(!/520123/.test(msg));
  assert.ok(msg.includes("Postal sector: 52"));
  assert.ok(containsNoPreciseIdentifiers(decodeURIComponent(waLink("6583417888", msg))));
});
test("clipboard keeps precise details out of the URL", () => {
  const t = buildDetailsForClipboard({ block:"123a", unit:"1518", postal:"520123" });
  assert.ok(t.includes("Block: 123A") && t.includes("Unit: #1518") && t.includes("Postal code: 520123"));
});
test("duplicates consolidate and the message stays within limits", () => {
  const merged = consolidateItems([{id:"P2",colour:"BLACK",quantity:2},{id:"P2",colour:"BLACK",quantity:3},{id:"P6",colour:"SILVER",quantity:1}]);
  assert.equal(merged.length, 2); assert.equal(merged[0].quantity, 5);
  const many = Array.from({length:40},(_,i)=>({id:"P2",name:"Battery-Free Mechanical Long Name",colourLabel:"Black",quantity:i+1,unitPrice:60}));
  const result = calculateOrder(many.map(x=>({unitPrice:60,quantity:x.quantity})), TIERS, 0);
  assert.ok(buildQuoteMessage({ items: many, result, postal:"52" }).length <= MAX_MESSAGE_CHARS);
});
test("validation: postal required, block/unit optional and forgiving", () => {
  const base = { productId:"P2", colour:"BLACK", quantity:"1", postal:"520123" };
  assert.equal(validateQuote(base, { validColours:["BLACK"] }).valid, true);
  assert.equal(validateQuote({ ...base, unit:"1518" }, { validColours:["BLACK"] }).valid, true);
  assert.equal(validateQuote({ ...base, postal:"5" }, { validColours:["BLACK"] }).valid, false);
  assert.equal(validateQuote({ postal:"52" }, { requireProduct:false }).valid, true);
  assert.equal(normalisePostal("S 520123"), "520123"); assert.equal(postalSector("520123"), "52");
});
test("analytics drops personal and precise properties", () => {
  const sent = [];
  const set = (n,v)=>Object.defineProperty(globalThis,n,{value:v,configurable:true,writable:true});
  set("navigator",{ sendBeacon:(u,b)=>{sent.push(b);return true;} });
  set("Blob", class { constructor(p){ this.t=String(p[0]); } });
  set("location",{ pathname:"/" });
  initAnalytics({ enabled:true, endpoint:"/api/collect" });
  track("quote_submit", { product:"P2", unit:"12-345", postal:"520123", phone:"91234567", name:"Zhang Wei" });
  const p = JSON.parse(sent[0].t).p;
  assert.equal(p.product, "P2");
  ["unit","postal","phone","name"].forEach(k=>assert.equal(p[k], undefined));
  for (const n of ["navigator","Blob","location"]) { try { delete globalThis[n]; } catch {} }
});
test("quote list: merge, edit, remove, clear, access fee, stale products", () => {
  const q = mkList();
  q.add("P2","BLACK",2); q.add("P2","BLACK",3);
  assert.equal(q.state().count, 5);
  q.add("P2","WHITE",1); assert.equal(q.state().items.length, 2);
  q.setQuantity("P2","WHITE",0); assert.equal(q.state().items.length, 1);
  assert.equal(q.add("P4","PURPLE",1).items.find(i=>i.id==="P4").colour, "BLACK");
  q.clear(); q.add("P1","SILVER",2); assert.equal(q.state().total, 120);
  q.setAccessFee(25); assert.equal(q.state().total, 170);
  const store = memStore();
  store.setItem("llsg_quote_v1", JSON.stringify([{id:"P2",colour:"BLACK",quantity:2},{id:"GONE",colour:"BLACK",quantity:5}]));
  assert.equal(createQuoteList({ products:PRODUCTS, colours:COLOURS, tiers:TIERS, storage:store }).state().count, 2);
});
test("owner-confirmed colours and prices", () => {
  const c = Object.fromEntries(PRODUCTS.map(p=>[p.id,p.colours]));
  assert.deepEqual(c.P1,["SILVER"]); assert.deepEqual(c.P2,["BLACK","WHITE","SILVER"]);
  assert.deepEqual(c.P3,["BLACK","WHITE"]); assert.deepEqual(c.P6,["SILVER"]); assert.deepEqual(c.P9,["SILVER"]);
  assert.deepEqual(Object.fromEntries(PRODUCTS.map(p=>[p.id,p.price])), { P1:60,P2:60,P3:65,P4:70,P5:70,P6:75,P7:75,P8:85,P9:95 });
});
test("owner-confirmed access & backup-key rules", () => {
  const by = Object.fromEntries(PRODUCTS.map((p) => [p.id, p.specs]));
  assert.equal(by.P1.access, "Key");
  ["P2","P3","P4","P5","P6","P7","P8","P9"].forEach((id) => assert.equal(by[id].access, "Code", `${id} must be code access`));
  ["P3","P5","P6","P8","P9"].forEach((id) => assert.equal(by[id].backupAccess, "Backup key retrieves the code only", `${id} backup key`));
  PRODUCTS.forEach((p) => {
    if (p.id === "P1") return;
    assert.ok(!/key (that )?(actually )?opens the lock/i.test(JSON.stringify(p)), `${p.id} must not claim the key opens the lock`);
  });
  PRODUCTS.forEach((p) => {
    assert.equal("material" in p.specs, false, `${p.id} must not publish a material spec`);
    assert.equal("outdoorSuitable" in p.specs, false, `${p.id} must not publish an outdoor claim`);
  });
});
test("BRAND: every product carries the confirmed WT brand", () => {
  assert.equal(SITE.brand.name, "WT");
  PRODUCTS.forEach((p) => assert.equal(p.brand, "WT", `${p.id} must declare its brand`));
  assert.ok(SITE.brand.points.length >= 3);
  assert.match(SITE.brand.statement, /install/i);
});
test("COST: scenarios are consistent with the product and fee data", () => {
  const cheapest = Math.min(...PRODUCTS.map((p) => p.price));
  const openFee = SITE.pricing.accessFees.LOST_KEY_LOCKED.perUnit;
  const byH = Object.fromEntries(SITE.costScenarios.map((c) => [c.h, c]));
  assert.equal(byH["Standard HDB letterbox lock replacement"].from, cheapest, "base price must match the cheapest model");
  assert.equal(byH["Lost key — open and replace"].from, cheapest + openFee, "open+replace must equal lock + opening fee");
  const bulk5 = Math.round(cheapest * 0.95 * 100) / 100;
  assert.equal(byH["Bulk / MCST (5+ units)"].from, bulk5, "5-unit tier must reflect the 5% discount");
  SITE.costScenarios.forEach((c) => {
    assert.ok(typeof c.from === "number" && c.from > 0, `${c.h} needs a numeric price`);
    assert.ok(c.detail && c.note, `${c.h} needs detail and a note`);
  });
});
test("SEO: no two service pages share a title, slug or H1", () => {
  const slugs = SERVICE_PAGES.map((s) => s.slug);
  const titles = SERVICE_PAGES.map((s) => s.title);
  const h1s = SERVICE_PAGES.map((s) => s.h1);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  assert.equal(new Set(titles).size, titles.length, "duplicate title");
  assert.equal(new Set(h1s).size, h1s.length, "duplicate H1");
  SERVICE_PAGES.forEach((s) => {
    assert.ok(s.title.length <= 65, `${s.slug} title ${s.title.length} chars`);
    assert.ok(s.desc.length <= 165, `${s.slug} desc ${s.desc.length} chars`);
    assert.ok(s.sections.length >= 3, `${s.slug} needs at least 3 sections`);
  });
});
test("SEO: the target commercial keywords each own a page", () => {
  const blob = SERVICE_PAGES.map((s) => `${s.slug} ${s.title} ${s.h1}`).join(" ").toLowerCase();
  ["letterbox lock replacement cost", "letterbox lock replacement", "mailbox lock replacement",
   "letterbox & mailbox lock installation", "wt digital letterbox lock", "hdb letterbox lock",
   "keyless", "bulk letterbox lock replacement"].forEach((k) =>
    assert.ok(blob.includes(k.toLowerCase()), `no page targets "${k}"`));
});
test("every published testimonial is marked verified with a source", () => {
  REVIEWS.forEach((r) => {
    assert.equal(r.verified, true);
    assert.ok(r.source && r.source.length > 3, `${r.name} needs a source reference`);
  });
});
test("specs needing a datasheet are null, never invented", () => {
  PRODUCTS.forEach((p) => {
    assert.ok("doorThicknessMm" in p.specs, `${p.id} must declare doorThicknessMm`);
    assert.ok(p.warrantyMonths === null || typeof p.warrantyMonths === "number");
    if (p.specs.battery !== "None") assert.ok("batteryType" in p.specs, `${p.id} electronic model must declare batteryType`);
  });
});
test("every product carries honest guidance", () => {
  PRODUCTS.forEach((p) => {
    assert.ok(p.bestFor && p.bestFor.length > 10, `${p.id} bestFor`);
    assert.ok(p.advantages.length >= 2 && p.considerations.length >= 1, `${p.id} pros/cons`);
    assert.ok(p.notSuitable && p.notSuitable.length > 10, `${p.id} notSuitable`);
  });
});
test("compatibility leads with ONE photo; the rest are follow-ups", () => {
  const primary = COMPATIBILITY.photos.filter((p) => p.primary);
  assert.equal(primary.length, 1);
  assert.match(primary[0].h, /front/i);
  COMPATIBILITY.photos.filter((p) => !p.primary).forEach((p) => assert.match(p.p, /only if|we will ask/i));
});
test("hours are stated and no 24/7 claim exists", () => {
  assert.equal(SITE.openingHours.opens, "09:00");
  assert.equal(SITE.urgent.afterHours, false);
  const all = FAQS.map(f=>f.q+f.a).join(" ");
  assert.ok(!/24\/7/.test(all));
  assert.ok(/not a 24-hour/i.test(all));
});

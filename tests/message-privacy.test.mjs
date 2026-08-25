import test from "node:test";
import assert from "node:assert/strict";
import { waLink, buildQuoteMessage, buildProductEnquiry, toDistrict, fmtUnit, containsNoContactPII } from "../assets/js/order-message.mjs";
import { calculateLine } from "../assets/js/pricing.mjs";
import { validateOrder } from "../assets/js/validation.mjs";
import { SITE, PRODUCTS } from "../src/data.mjs";

const TIERS = SITE.pricing.tiers;

test("message includes block + unit but NEVER a phone number or email", () => {
  const price = calculateLine({ unitPrice: 50, quantity: 1, tiers: TIERS });
  const msg = buildQuoteMessage({ productId: "P2", productName: "Battery-Free Mechanical", colour: "Black", quantity: 1, accessLabel: "Open, key available", block: "123A", unit: "12-345", timing: "Sat afternoon", district: "52", priceResult: price });
  assert.ok(containsNoContactPII(msg));
  assert.ok(msg.includes("Block: 123A"));
  assert.ok(msg.includes("Unit: #12-345"));
  assert.ok(msg.includes("Postal district: 52"));
});

test("estimate is labelled as an estimate, not a confirmed price", () => {
  const price = calculateLine({ unitPrice: 50, quantity: 1, tiers: TIERS });
  const msg = buildQuoteMessage({ productId: "P2", productName: "x", quantity: 1, accessLabel: "a", district: "52", priceResult: price });
  assert.ok(/not a confirmed price/i.test(msg));
});

test("20+ units shows written-quote line instead of a total", () => {
  const price = calculateLine({ unitPrice: 85, quantity: 25, tiers: TIERS });
  const msg = buildQuoteMessage({ productId: "P9", productName: "x", quantity: 25, accessLabel: "a", district: "52", priceResult: price });
  assert.ok(/written group quote/i.test(msg));
  assert.ok(!/S\$/.test(msg.split("\n").find((l) => l.startsWith("Estimate")) || ""));
});

test("toDistrict reduces a full postal code to 2 digits", () => {
  assert.equal(toDistrict("520123"), "52");
  assert.equal(toDistrict("07"), "07");
  assert.equal(toDistrict("abc52xyz"), "52");
});

test("fmtUnit normalises to #dd-dddd", () => {
  assert.equal(fmtUnit("12-345"), "#12-345");
  assert.equal(fmtUnit("#02-100"), "#02-100");
  assert.equal(fmtUnit(""), "");
});

test("waLink encodes text and never bare-passes it", () => {
  const url = waLink("6512345678", "a b\nc");
  assert.ok(url.startsWith("https://wa.me/6512345678?text="));
  assert.ok(!url.includes("\n"));
  assert.ok(url.includes("%20") && url.includes("%0A"));
});

test("product enquiry stays minimal (no phone/email)", () => {
  assert.ok(containsNoContactPII(buildProductEnquiry({ productId: "P2", productName: "Battery-Free Mechanical", price: 50 })));
});

test("order validation requires block + unit when placing an order", () => {
  const r = validateOrder({ productId: "P1", colour: "SILVER", quantity: "1", access: "OPEN_WITH_KEY", district: "52", block: "", unit: "" }, { validColours: ["SILVER"], requireAddress: true });
  assert.equal(r.valid, false);
  assert.ok(r.errors.block && r.errors.unit);
});

test("order validation accepts valid block + unit", () => {
  const r = validateOrder({ productId: "P2", colour: "BLACK", quantity: "2", access: "OPEN_WITH_KEY", district: "52", block: "123A", unit: "12-345" }, { validColours: ["BLACK","WHITE","SILVER"], requireAddress: true });
  assert.equal(r.valid, true, JSON.stringify(r.errors));
});

test("colour spec matches the owner's confirmation exactly", () => {
  const map = Object.fromEntries(PRODUCTS.map((p) => [p.id, p.colours]));
  assert.deepEqual(map.P1, ["SILVER"]);
  assert.deepEqual(map.P2, ["BLACK","WHITE","SILVER"]);
  assert.deepEqual(map.P3, ["BLACK","WHITE"]);
  assert.deepEqual(map.P4, ["BLACK"]);
  assert.deepEqual(map.P5, ["BLACK"]);
  assert.deepEqual(map.P6, ["SILVER"]);
  assert.deepEqual(map.P7, ["BLACK"]);
  assert.deepEqual(map.P8, ["BLACK"]);
  assert.deepEqual(map.P9, ["SILVER"]);
});

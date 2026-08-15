import test from "node:test";
import assert from "node:assert/strict";
import { waLink, buildQuoteMessage, buildProductEnquiry, toDistrict, containsNoPII } from "../assets/js/order-message.mjs";
import { calculateLine } from "../assets/js/pricing.mjs";
import { SITE } from "../src/data.mjs";

const TIERS = SITE.pricing.tiers;

test("WhatsApp message contains NO personal identifiers", () => {
  const price = calculateLine({ unitPrice: 50, quantity: 1, tiers: TIERS });
  const msg = buildQuoteMessage({
    productId: "P2", productName: "Battery-Free Mechanical", colour: "Black",
    quantity: 1, accessLabel: "Open, key available", timing: "Sat afternoon",
    district: "52", priceResult: price,
  });
  assert.ok(containsNoPII(msg), "message must not contain phone/unit/email patterns");
  assert.ok(!/\bZhang\b/i.test(msg));
  assert.ok(msg.includes("Postal district: 52"));
  assert.ok(!/520123/.test(msg), "full postal code must not appear");
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

test("waLink encodes text and never bare-passes it", () => {
  const url = waLink("6512345678", "a b\nc");
  assert.ok(url.startsWith("https://wa.me/6512345678?text="));
  assert.ok(!url.includes("\n"));
  assert.ok(url.includes("%20") && url.includes("%0A"));
});

test("product enquiry stays minimal (asks for district, no PII)", () => {
  const t = buildProductEnquiry({ productId: "P2", productName: "Battery-Free Mechanical", price: 50 });
  assert.ok(containsNoPII(t));
  assert.ok(/postal district/i.test(t));
});

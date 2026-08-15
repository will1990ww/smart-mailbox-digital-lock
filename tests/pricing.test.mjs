import test from "node:test";
import assert from "node:assert/strict";
import { calculateLine, calculateOrder, resolveTier } from "../assets/js/pricing.mjs";
import { SITE } from "../src/data.mjs";

const TIERS = SITE.pricing.tiers;

test("unit-price calculation: single unit", () => {
  assert.equal(calculateLine({ unitPrice: 50, quantity: 1, tiers: TIERS }).total, 50);
});

test("per-unit unlocking fee (batch bug fixed)", () => {
  const r = calculateLine({ unitPrice: 50, quantity: 10, accessFeePerUnit: 25, tiers: [] });
  assert.equal(r.subtotal, 750); // not 525
});

test("5% discount for 5+ units", () => {
  const r = calculateLine({ unitPrice: 50, quantity: 5, tiers: TIERS });
  assert.equal(r.discountRate, 0.05);
  assert.equal(r.total, 237.5);
});

test("10% discount for 10+ units", () => {
  const r = calculateLine({ unitPrice: 60, quantity: 10, tiers: TIERS });
  assert.equal(r.discountRate, 0.10);
  assert.equal(r.total, 540);
});

test("written quotation for 20+ units (no computed total)", () => {
  const r = calculateLine({ unitPrice: 85, quantity: 25, tiers: TIERS });
  assert.equal(r.requiresQuote, true);
  assert.equal(r.total, null);
});

test("quantity clamped to a sane minimum", () => {
  assert.equal(calculateLine({ unitPrice: 50, quantity: 0, tiers: [] }).quantity, 1);
  assert.equal(calculateLine({ unitPrice: 50, quantity: -3, tiers: [] }).quantity, 1);
});

test("resolveTier picks the highest applicable tier", () => {
  assert.equal(resolveTier(4, TIERS), null);
  assert.equal(resolveTier(5, TIERS).rate, 0.05);
  assert.equal(resolveTier(12, TIERS).rate, 0.10);
  assert.equal(resolveTier(50, TIERS).rate, null);
});

test("mixed-item order discounts on total quantity", () => {
  const o = calculateOrder([
    { unitPrice: 50, quantity: 6 },
    { unitPrice: 55, quantity: 4 },
  ], TIERS);
  assert.equal(o.totalQty, 10);
  assert.equal(o.discountRate, 0.10);
  assert.equal(o.subtotal, 520);
  assert.equal(o.total, 468);
});

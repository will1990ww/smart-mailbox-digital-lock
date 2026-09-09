/* cart.test.mjs — verifies the shopping cart logic + WhatsApp message. */
import test from "node:test";
import assert from "node:assert/strict";
import { createCart, buildCartMessage } from "../assets/js/cart.mjs";
import { PRODUCTS, COLOURS, SITE } from "../src/data.mjs";

const TIERS = SITE.pricing.tiers;

/* An in-memory storage stub so tests never touch a real localStorage. */
function memStore() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}
const mk = () => createCart({ products: PRODUCTS, colours: COLOURS, tiers: TIERS, storage: memStore() });

test("add items and compute a resolved state", () => {
  const cart = mk();
  const s = cart.add("P2", "BLACK", 2);
  assert.equal(s.count, 2);
  assert.equal(s.items[0].name, "Battery-Free Mechanical");
  assert.equal(s.items[0].colourLabel, "Black");
  assert.equal(s.subtotal, 100); // 2 x 50
});

test("same product+colour merges; different colour is a separate line", () => {
  const cart = mk();
  cart.add("P2", "BLACK", 1);
  cart.add("P2", "BLACK", 2);
  let s = cart.state();
  assert.equal(s.items.length, 1);
  assert.equal(s.items[0].quantity, 3);
  s = cart.add("P2", "WHITE", 1);
  assert.equal(s.items.length, 2);
});

test("invalid colour falls back to the product's first colour", () => {
  const cart = mk();
  const s = cart.add("P4", "PURPLE", 1); // P4 only has BLACK
  assert.equal(s.items[0].colour, "BLACK");
});

test("unknown product id is ignored", () => {
  const cart = mk();
  const s = cart.add("P99", "BLACK", 1);
  assert.equal(s.count, 0);
});

test("setQuantity updates; zero removes the line", () => {
  const cart = mk();
  cart.add("P1", "SILVER", 1);
  let s = cart.setQuantity("P1", "SILVER", 5);
  assert.equal(s.items[0].quantity, 5);
  s = cart.setQuantity("P1", "SILVER", 0);
  assert.equal(s.count, 0);
});

test("bulk discount applies on total quantity across lines", () => {
  const cart = mk();
  cart.add("P2", "BLACK", 6);
  cart.add("P3", "WHITE", 4); // total 10 -> 10% off
  const s = cart.state();
  assert.equal(s.totalQty, 10);
  assert.equal(s.discountRate, 0.10);
  assert.equal(s.subtotal, 6 * 50 + 4 * 55); // 520
  assert.equal(s.total, 468);
});

test("20+ units requires a written quote (no fake total)", () => {
  const cart = mk();
  cart.add("P9", "SILVER", 25);
  const s = cart.state();
  assert.equal(s.requiresQuote, true);
  assert.equal(s.total, null);
});

test("persists across cart instances via shared storage", () => {
  const store = memStore();
  const c1 = createCart({ products: PRODUCTS, colours: COLOURS, tiers: TIERS, storage: store });
  c1.add("P6", "SILVER", 3);
  const c2 = createCart({ products: PRODUCTS, colours: COLOURS, tiers: TIERS, storage: store });
  assert.equal(c2.state().count, 3);
});

test("clear empties the cart", () => {
  const cart = mk();
  cart.add("P1", "SILVER", 2);
  assert.equal(cart.clear().count, 0);
});

test("subscribe fires on change", () => {
  const cart = mk();
  let fired = 0;
  const off = cart.subscribe(() => { fired++; });
  cart.add("P1", "SILVER", 1);
  cart.setQuantity("P1", "SILVER", 2);
  off();
  cart.add("P2", "BLACK", 1);
  assert.equal(fired, 2, "listener should fire twice before unsubscribe");
});

test("buildCartMessage lists items, keeps full postal code, no forced dash", () => {
  const cart = mk();
  cart.add("P2", "BLACK", 2);
  cart.add("P6", "SILVER", 1);
  const msg = buildCartMessage(cart.state(), { block: "123A", unit: "1518", district: "520123", accessLabel: "Open, key available" });
  assert.ok(/1\. P2 Battery-Free Mechanical \(Black\) x2/.test(msg));
  assert.ok(/2\. P6 Zinc Alloy Code Lock \(Silver\) x1/.test(msg));
  assert.ok(msg.includes("Block: 123A"));
  assert.ok(msg.includes("Unit: 1518"));
  assert.ok(msg.includes("Postal code: 520123"));
  assert.ok(/not a confirmed price/i.test(msg));
  assert.ok(!/\b\d{8}\b/.test(msg), "no phone number in message");
});

test("buildCartMessage shows written-quote line for 20+", () => {
  const cart = mk();
  cart.add("P9", "SILVER", 30);
  const msg = buildCartMessage(cart.state(), { block: "1", unit: "2-3", district: "52" });
  assert.ok(/written group quote/i.test(msg));
});

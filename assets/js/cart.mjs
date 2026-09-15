/* =============================================================================
 * cart.mjs — small, pure-ish shopping cart for letterbox locks.
 * -----------------------------------------------------------------------------
 * • Items are { id, colour, quantity }. Product name/price are resolved from the
 *   product catalogue at read time (never trusted from storage).
 * • Totals reuse the shared pricing engine (calculateOrder) so the bulk-discount
 *   rules are identical to the single-item estimate.
 * • Persists to localStorage when available; degrades to in-memory otherwise.
 * • No PII is ever stored — only product id, colour token and quantity.
 * ========================================================================== */
import { calculateOrder } from "./pricing.mjs";

const STORAGE_KEY = "llsg_cart_v1";
const MAX_QTY = 100;

function clampQty(q) {
  let n = Math.floor(Number(q));
  if (!Number.isFinite(n) || n < 1) n = 1;
  return Math.min(MAX_QTY, n);
}

export function createCart({ products = [], colours = {}, tiers = [], storage } = {}) {
  const byId = (id) => products.find((p) => p && p.id === id) || null;

  // Storage adapter (localStorage or a safe no-op fallback).
  let store = storage;
  if (!store) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("__t", "1"); localStorage.removeItem("__t");
        store = localStorage;
      }
    } catch { /* private mode / disabled */ }
  }
  const mem = new Map();
  const read = () => {
    try { return store ? store.getItem(STORAGE_KEY) : (mem.get(STORAGE_KEY) || null); } catch { return null; }
  };
  const write = (v) => {
    try { store ? store.setItem(STORAGE_KEY, v) : mem.set(STORAGE_KEY, v); } catch { mem.set(STORAGE_KEY, v); }
  };

  let items = load();
  const listeners = new Set();

  function load() {
    const raw = read();
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((it) => it && byId(it.id))
        .map((it) => ({ id: String(it.id), colour: String(it.colour || (byId(it.id).colours[0] || "")), quantity: clampQty(it.quantity) }));
    } catch { return []; }
  }
  function persist() { write(JSON.stringify(items)); listeners.forEach((fn) => { try { fn(state()); } catch {} }); }

  function keyOf(id, colour) { return id + "::" + colour; }

  /** Add (or increment) an item. Returns the new state. */
  function add(id, colour, quantity = 1) {
    const p = byId(id);
    if (!p) return state();
    const col = p.colours.includes(colour) ? colour : (p.colours[0] || "");
    const qty = clampQty(quantity);
    const existing = items.find((it) => keyOf(it.id, it.colour) === keyOf(id, col));
    if (existing) existing.quantity = clampQty(existing.quantity + qty);
    else items.push({ id, colour: col, quantity: qty });
    persist();
    return state();
  }
  function setQuantity(id, colour, quantity) {
    const it = items.find((x) => keyOf(x.id, x.colour) === keyOf(id, colour));
    if (!it) return state();
    const q = Math.floor(Number(quantity));
    if (!Number.isFinite(q) || q <= 0) return remove(id, colour);
    it.quantity = clampQty(q);
    persist();
    return state();
  }
  function remove(id, colour) {
    items = items.filter((x) => keyOf(x.id, x.colour) !== keyOf(id, colour));
    persist();
    return state();
  }
  function clear() { items = []; persist(); return state(); }

  /** Rich, resolved view of the cart with per-line and order totals. */
  function state() {
    const lines = items.map((it) => {
      const p = byId(it.id);
      return {
        id: it.id, colour: it.colour,
        colourLabel: colours[it.colour]?.label || it.colour,
        name: p ? p.name : it.id,
        unitPrice: p ? p.price : 0,
        quantity: it.quantity,
        lineSubtotal: (p ? p.price : 0) * it.quantity,
      };
    });
    const order = calculateOrder(items.map((it) => ({ unitPrice: byId(it.id)?.price || 0, quantity: it.quantity })), tiers);
    const count = items.reduce((s, it) => s + it.quantity, 0);
    return { items: lines, count, totalQty: order.totalQty, subtotal: order.subtotal,
      discountRate: order.discountRate, discountAmount: order.discountAmount,
      total: order.total, requiresQuote: order.requiresQuote, tierLabel: order.tierLabel };
  }

  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  return { add, remove, setQuantity, clear, state, subscribe };
}

/** Build a WhatsApp order message from a cart state + delivery details. */
export function buildCartMessage(cartState, { block, unit, district, access, accessLabel, timing } = {}) {
  const lines = ["Letterbox lock order", "----------------------------"];
  cartState.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.id} ${it.name} (${it.colourLabel}) x${it.quantity} — S$${it.unitPrice} each`);
  });
  lines.push("----------------------------");
  if (accessLabel) lines.push(`Mailbox: ${accessLabel}`);
  const b = String(block || "").trim().toUpperCase();
  const u = String(unit || "").trim().toUpperCase().replace(/\s+/g, " ");
  const d = String(district || "").replace(/\D/g, "").slice(0, 6);
  if (b) lines.push(`Block: ${b}`);
  if (u) lines.push(`Unit: ${u}`);
  if (d) lines.push(`Postal code: ${d}`);
  if (timing) lines.push(`Preferred: ${timing}`);
  if (cartState.requiresQuote) {
    lines.push(`Total items: ${cartState.totalQty} — written group quote required (20+ units)`);
  } else {
    if (cartState.discountRate) lines.push(`Bulk discount: ${Math.round(cartState.discountRate * 100)}% (${cartState.totalQty} units)`);
    lines.push(`Estimated total (not a confirmed price): S$${cartState.total}`);
  }
  lines.push("----------------------------");
  lines.push("I'll share my name and contact number here to confirm. I understand the final price is confirmed in writing after a photo, and payment is by PayNow/cash after the job.");
  return lines.join("\n");
}

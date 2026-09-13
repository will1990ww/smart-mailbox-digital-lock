/* quote-list.mjs — M12: a QUOTE LIST, never a payment basket.
 * Stores only product id, colour token and quantity. No personal data. */
import { calculateOrder } from "./pricing.mjs";
const KEY = "llsg_quote_v1";
const MAX_QTY = 100;
const clampQty = (q) => { let n = Math.floor(Number(q)); if (!Number.isFinite(n) || n < 1) n = 1; return Math.min(MAX_QTY, n); };

export function createQuoteList({ products = [], colours = {}, tiers = [], storage } = {}) {
  const byId = (id) => products.find((p) => p && p.id === id) || null;
  let store = storage;
  if (!store) { try { if (typeof localStorage !== "undefined") { localStorage.setItem("__t","1"); localStorage.removeItem("__t"); store = localStorage; } } catch {} }
  const mem = new Map();
  const read = () => { try { return store ? store.getItem(KEY) : (mem.get(KEY) || null); } catch { return null; } };
  const write = (v) => { try { store ? store.setItem(KEY, v) : mem.set(KEY, v); } catch { mem.set(KEY, v); } };

  let items = load();
  const listeners = new Set();
  let accessFeePerUnit = 0;

  function load() {
    const raw = read(); if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter((it) => it && byId(it.id)).map((it) => ({
        id: String(it.id),
        colour: byId(it.id).colours.includes(it.colour) ? String(it.colour) : byId(it.id).colours[0],
        quantity: clampQty(it.quantity),
      }));
    } catch { return []; }
  }
  const persist = () => { write(JSON.stringify(items)); listeners.forEach((fn) => { try { fn(state()); } catch {} }); };
  const keyOf = (id, c) => id + "::" + c;

  function add(id, colour, quantity = 1) {
    const p = byId(id); if (!p) return state();
    const col = p.colours.includes(colour) ? colour : (p.colours[0] || "");
    const ex = items.find((it) => keyOf(it.id, it.colour) === keyOf(id, col));
    if (ex) ex.quantity = clampQty(ex.quantity + clampQty(quantity));
    else items.push({ id, colour: col, quantity: clampQty(quantity) });
    persist(); return state();
  }
  function setQuantity(id, colour, quantity) {
    const it = items.find((x) => keyOf(x.id, x.colour) === keyOf(id, colour));
    if (!it) return state();
    const q = Math.floor(Number(quantity));
    if (!Number.isFinite(q) || q <= 0) return remove(id, colour);
    it.quantity = clampQty(q); persist(); return state();
  }
  function remove(id, colour) { items = items.filter((x) => keyOf(x.id, x.colour) !== keyOf(id, colour)); persist(); return state(); }
  function clear() { items = []; persist(); return state(); }
  function setAccessFee(fee) { accessFeePerUnit = Number(fee) || 0; listeners.forEach((fn) => { try { fn(state()); } catch {} }); }

  function state() {
    const lines = items.map((it) => {
      const p = byId(it.id);
      return { id: it.id, colour: it.colour, colourLabel: colours[it.colour]?.label || it.colour,
        name: p ? p.name : it.id, unitPrice: p ? p.price : 0, quantity: it.quantity,
        lineSubtotal: (p ? p.price : 0) * it.quantity };
    });
    const o = calculateOrder(items.map((it) => ({ unitPrice: byId(it.id)?.price || 0, quantity: it.quantity })), tiers, accessFeePerUnit);
    return { items: lines, count: items.reduce((s, it) => s + it.quantity, 0), accessFeePerUnit,
      totalQty: o.totalQty, subtotal: o.subtotal, discountRate: o.discountRate, discountAmount: o.discountAmount,
      total: o.total, requiresQuote: o.requiresQuote, tierLabel: o.tierLabel };
  }
  const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
  return { add, remove, setQuantity, clear, setAccessFee, state, subscribe };
}

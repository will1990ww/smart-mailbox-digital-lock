/* PRICING — pure functions, no DOM. The DOM is NEVER the source of truth for money. */
export function resolveTier(quantity, tiers) {
  const q = Number(quantity) || 0;
  for (const t of tiers) if (q >= t.minQty) return t;
  return null;
}
export function calculateLine({ unitPrice, quantity, accessFeePerUnit = 0, tiers = [] }) {
  const qty = clampInt(quantity, 1, Number.MAX_SAFE_INTEGER);
  const unit = num(unitPrice);
  const fee = num(accessFeePerUnit);
  const subtotal = (unit + fee) * qty;
  const tier = resolveTier(qty, tiers);
  if (tier && tier.rate === null) {
    return { quantity: qty, unitPrice: unit, accessFeePerUnit: fee, subtotal, discountRate: 0, discountAmount: 0, total: null, requiresQuote: true, tierLabel: tier.label };
  }
  const rate = tier ? tier.rate : 0;
  const discountAmount = round2(subtotal * rate);
  return { quantity: qty, unitPrice: unit, accessFeePerUnit: fee, subtotal, discountRate: rate, discountAmount, total: round2(subtotal - discountAmount), requiresQuote: false, tierLabel: tier ? tier.label : null };
}
export function calculateOrder(items, tiers = []) {
  const totalQty = items.reduce((s, i) => s + clampInt(i.quantity, 1, 1e9), 0);
  const lines = items.map((i) => calculateLine({ ...i, tiers: [] }));
  const tier = resolveTier(totalQty, tiers);
  const subtotal = sum(lines, "subtotal");
  if (tier && tier.rate === null) return { lines, totalQty, subtotal, discountRate: 0, discountAmount: 0, total: null, requiresQuote: true, tierLabel: tier.label };
  const rate = tier ? tier.rate : 0;
  const discountAmount = round2(subtotal * rate);
  return { lines, totalQty, subtotal, discountRate: rate, discountAmount, total: round2(subtotal - discountAmount), requiresQuote: false, tierLabel: tier ? tier.label : null };
}
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function clampInt(v, min, max) { let n = Math.floor(Number(v)); if (!Number.isFinite(n)) n = min; return Math.min(max, Math.max(min, n)); }
function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function sum(arr, key) { return round2(arr.reduce((s, x) => s + x[key], 0)); }

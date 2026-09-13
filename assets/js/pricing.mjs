/* PRICING — pure functions. Browser figures are ESTIMATES; the written quote is authority. */
export function resolveTier(quantity, tiers) {
  const q = Number(quantity) || 0;
  for (const t of tiers) if (q >= t.minQty) return t;
  return null;
}
export function calculateLine({ unitPrice, quantity, accessFeePerUnit = 0, tiers = [] }) {
  const qty = clampInt(quantity, 1, Number.MAX_SAFE_INTEGER);
  const unit = num(unitPrice), fee = num(accessFeePerUnit);
  const subtotal = (unit + fee) * qty;
  const tier = resolveTier(qty, tiers);
  if (tier && tier.rate === null) {
    return { quantity: qty, unitPrice: unit, accessFeePerUnit: fee, subtotal, discountRate: 0, discountAmount: 0, total: null, requiresQuote: true, tierLabel: tier.label };
  }
  const rate = tier ? tier.rate : 0;
  const discountAmount = round2(subtotal * rate);
  return { quantity: qty, unitPrice: unit, accessFeePerUnit: fee, subtotal, discountRate: rate, discountAmount, total: round2(subtotal - discountAmount), requiresQuote: false, tierLabel: tier ? tier.label : null };
}
export function calculateOrder(items, tiers = [], accessFeePerUnit = 0) {
  const fee = num(accessFeePerUnit);
  const totalQty = items.reduce((s, i) => s + clampInt(i.quantity, 1, 1e9), 0);
  const lines = items.map((i) => calculateLine({ ...i, accessFeePerUnit: fee, tiers: [] }));
  const tier = resolveTier(totalQty, tiers);
  const subtotal = sum(lines, "subtotal");
  if (tier && tier.rate === null) {
    return { lines, totalQty, subtotal, accessFeePerUnit: fee, discountRate: 0, discountAmount: 0, total: null, requiresQuote: true, tierLabel: tier.label };
  }
  const rate = tier ? tier.rate : 0;
  const discountAmount = round2(subtotal * rate);
  return { lines, totalQty, subtotal, accessFeePerUnit: fee, discountRate: rate, discountAmount, total: round2(subtotal - discountAmount), requiresQuote: false, tierLabel: tier ? tier.label : null };
}
/** E-04/M14: itemised breakdown rows. Never returns a total when a written quote is required. */
export function buildBreakdown(result, { accessLabel = "", accessFeePerUnit = 0 } = {}) {
  const rows = [];
  const qty = result.totalQty ?? result.quantity ?? 0;
  const locks = round2(result.subtotal - (num(accessFeePerUnit) * qty));
  rows.push({ label: `Lock + standard installation × ${qty}`, value: money(locks) });
  if (num(accessFeePerUnit) > 0) rows.push({ label: `Mailbox opening fee (${accessLabel || "access"}) × ${qty}`, value: money(round2(num(accessFeePerUnit) * qty)) });
  rows.push({ label: "Subtotal", value: money(result.subtotal) });
  if (result.discountRate) rows.push({ label: `Bulk discount (${Math.round(result.discountRate * 100)}% · ${qty} units)`, value: "−" + money(result.discountAmount) });
  return { rows, requiresQuote: !!result.requiresQuote, total: result.requiresQuote ? null : money(result.total),
    note: result.requiresQuote
      ? "20+ units are priced by written group quote after a site survey, so the rate reflects the real scope."
      : "Estimate only — not a confirmed price. We confirm the final price in writing after reviewing your photos." };
}
export function money(n) { return "S$" + (Math.round(num(n) * 100) / 100); }
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function clampInt(v, min, max) { let n = Math.floor(Number(v)); if (!Number.isFinite(n)) n = min; return Math.min(max, Math.max(min, n)); }
function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
function sum(a, k) { return round2(a.reduce((s, x) => s + x[k], 0)); }

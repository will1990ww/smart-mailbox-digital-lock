/* VALIDATION — pure functions (client-side is UX only; a server must re-check). */
export const RULES = {
  // Postal code: allow 2 to 6 digits — they can type the sector (52) OR the full
  // 6-digit code (520123), whichever they prefer.
  district: { pattern: /^[0-9]{2,6}$/ },
  quantity: { min: 1, max: 100 },
  timing:   { max: 80 },
  productId:{ pattern: /^P([1-9]|1[0-2])$/ },
  block:    { pattern: /^[0-9]{1,4}[A-Z]?$/ },
  // Unit: forgiving. Accept pure numbers (1518, 13533), or with a dash/space
  // (12-345, 12 345), optionally with a leading # and a trailing letter (12-345A).
  unit:     { pattern: /^#?[0-9]{2,6}([-\s][0-9]{1,4})?[A-Z]?$/ },
};
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
export function sanitizeText(value, max) {
  const s = String(value ?? "").replace(CONTROL_CHARS, "").trim();
  return typeof max === "number" ? s.slice(0, max) : s;
}
export function normaliseUnit(value) {
  const s = sanitizeText(value, 12).toUpperCase();
  if (!s) return "";
  return s.startsWith("#") ? s : "#" + s;
}
export function validateQuantity(value, { min = 1, max = 100 } = {}) {
  const raw = String(value ?? "").trim();
  if (raw === "" || !/^\d+$/.test(raw)) return { ok: false, value: null };
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) return { ok: false, value: null };
  return { ok: true, value: n };
}
export function validateOrder(data, { validColours = [], requireAuthorisation = false, requireAddress = false } = {}) {
  const errors = {};
  const colourSet = new Set(validColours);
  if (!RULES.productId.pattern.test(String(data.productId || ""))) errors.productId = "Please choose a product.";
  if (colourSet.size && !colourSet.has(data.colour)) errors.colour = "Please choose an available colour.";
  const q = validateQuantity(data.quantity, RULES.quantity);
  if (!q.ok) errors.quantity = "Quantity must be a whole number between 1 and 100.";
  // Postal code: keep only digits, accept 2–6 of them.
  const district = sanitizeText(data.district).replace(/\D/g, "");
  if (!RULES.district.pattern.test(district)) errors.district = "Enter your postal code (2–6 digits, e.g. 52 or 520123).";
  const block = sanitizeText(data.block, 6).toUpperCase();
  // Unit: normalise spaces, keep an optional leading # off for the test.
  const unit  = String(data.unit ?? "").trim().toUpperCase().replace(/^#/, "");
  if (requireAddress || block) { if (!RULES.block.pattern.test(block)) errors.block = "Enter your block number (e.g. 123 or 123A)."; }
  if (requireAddress || unit)  { if (!RULES.unit.pattern.test(unit)) errors.unit = "Enter your unit number (e.g. 12-345 or 1518)."; }
  if (requireAuthorisation && data.authorised !== true) errors.authorised = "Please confirm you are the resident, owner or authorised person.";
  return { valid: Object.keys(errors).length === 0, errors };
}
export function accessRequiresAuthorisation(accessKey, accessFees) {
  const meta = accessFees?.[accessKey];
  if (meta && typeof meta.unlock === "boolean") return meta.unlock;
  return accessKey === "LOST_KEY_LOCKED" || accessKey === "DAMAGED_OR_JAMMED";
}

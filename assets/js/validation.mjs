/* VALIDATION — pure functions. F-07: allowlist, length, type and business rules. */
export const RULES = {
  postal:   { pattern: /^[0-9]{2,6}$/ },
  quantity: { min: 1, max: 100 },
  timing:   { max: 80 },
  productId:{ pattern: /^P([1-9]|1[0-2])$/ },
  block:    { pattern: /^[0-9]{1,4}[A-Z]?$/ },
  unit:     { pattern: /^#?[0-9]{2,6}([-\s][0-9]{1,4})?[A-Z]?$/ },
};
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
export function sanitizeText(v, max) {
  const s = String(v ?? "").replace(CONTROL, "").trim();
  return typeof max === "number" ? s.slice(0, max) : s;
}
export const normalisePostal = (v) => String(v ?? "").replace(/\D/g, "").slice(0, 6);
/** F-01: only the 2-digit sector may ever leave the site in a URL. */
export const postalSector = (v) => normalisePostal(v).slice(0, 2);
export const normaliseUnit = (v) => sanitizeText(v, 12).toUpperCase().replace(/\s+/g, " ");
export function validateQuantity(value, { min = 1, max = 100 } = {}) {
  const raw = String(value ?? "").trim();
  if (raw === "" || !/^\d+$/.test(raw)) return { ok: false, value: null };
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) return { ok: false, value: null };
  return { ok: true, value: n };
}
export function validateQuote(data, { validColours = [], requireAuthorisation = false, requireProduct = true } = {}) {
  const errors = {};
  const colourSet = new Set(validColours);
  if (requireProduct) {
    if (!RULES.productId.pattern.test(String(data.productId || ""))) errors.productId = "Please choose a product.";
    if (colourSet.size && !colourSet.has(data.colour)) errors.colour = "Please choose an available colour.";
    const q = validateQuantity(data.quantity, RULES.quantity);
    if (!q.ok) errors.quantity = "Quantity must be a whole number between 1 and 100.";
  }
  const postal = normalisePostal(data.postal);
  if (!RULES.postal.pattern.test(postal)) errors.postal = "Enter your postal code (2–6 digits, e.g. 52 or 520123).";
  const block = sanitizeText(data.block, 6).toUpperCase();
  if (block && !RULES.block.pattern.test(block)) errors.block = "Block should look like 123 or 123A.";
  const unit = normaliseUnit(data.unit).replace(/^#/, "");
  if (unit && !RULES.unit.pattern.test(unit)) errors.unit = "Unit should look like 12-345 or 1518.";
  if (requireAuthorisation && data.authorised !== true) errors.authorised = "Please confirm you are the resident, owner, tenant or an authorised person.";
  return { valid: Object.keys(errors).length === 0, errors };
}
export function accessRequiresAuthorisation(key, fees) {
  const m = fees?.[key];
  if (m && typeof m.unlock === "boolean") return m.unlock;
  return key === "LOST_KEY_LOCKED" || key === "DAMAGED_OR_JAMMED";
}

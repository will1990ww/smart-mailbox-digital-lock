/* VALIDATION — pure functions (client-side is UX only; a server must re-check). */
export const RULES = {
  district: { pattern: /^[0-9]{2}$/ },
  quantity: { min: 1, max: 100 },
  timing:   { max: 80 },
  productId:{ pattern: /^P([1-9]|1[0-2])$/ },
  block:    { pattern: /^[0-9]{1,4}[A-Z]?$/ },
  // 修改后：允许纯数字（最长6位），也兼容带 "-" 连字符格式和末尾字母
  unit:     { pattern: /^#?[0-9]{1,6}(-[0-9]{1,5})?[A-Z]?$/ },
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
  const district = sanitizeText(data.district);
  if (!RULES.district.pattern.test(district)) errors.district = "Enter the first 2 digits of your postal code (e.g. 52).";
  const block = sanitizeText(data.block, 6).toUpperCase();
  const unit  = String(data.unit ?? "").trim().toUpperCase().replace(/^#/, "");
  if (requireAddress || block) { if (!RULES.block.pattern.test(block)) errors.block = "Enter your block number (e.g. 123 or 123A)."; }
  if (requireAddress || unit)  { if (!RULES.unit.pattern.test("#" + unit)) errors.unit = "Enter your unit number (e.g. 14533 or 12-345)."; }
  if (requireAuthorisation && data.authorised !== true) errors.authorised = "Please confirm you are the resident, owner or authorised person.";
  return { valid: Object.keys(errors).length === 0, errors };
}
export function accessRequiresAuthorisation(accessKey, accessFees) {
  const meta = accessFees?.[accessKey];
  if (meta && typeof meta.unlock === "boolean") return meta.unlock;
  return accessKey === "LOST_KEY_LOCKED" || accessKey === "DAMAGED_OR_JAMMED";
}

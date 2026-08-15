/* =============================================================================
 * VALIDATION — pure functions (client-side is UX only; a server must re-check).
 * -----------------------------------------------------------------------------
 * PRIVACY-MINIMAL form: we DO NOT collect name / mobile / street / unit before
 * WhatsApp. The only fields are product, colour, quantity, mailbox condition,
 * postal district (2 digits) and optional timing, plus a conditional
 * authorisation checkbox for unlock jobs.
 * ========================================================================== */

export const RULES = {
  district: { pattern: /^[0-9]{2}$/ },              // Singapore 2-digit postal sector
  quantity: { min: 1, max: 100 },
  timing:   { max: 80 },
  productId:{ pattern: /^P([1-9]|1[0-2])$/ },        // P1..P12
};

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeText(value, max) {
  const s = String(value ?? "").replace(CONTROL_CHARS, "").trim();
  return typeof max === "number" ? s.slice(0, max) : s;
}

/** Strict integer quantity check: rejects blank, NaN, ≤0, fractional, >max. */
export function validateQuantity(value, { min = 1, max = 100 } = {}) {
  const raw = String(value ?? "").trim();
  if (raw === "" || !/^\d+$/.test(raw)) return { ok: false, value: null }; // no signs, no decimals
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) return { ok: false, value: null };
  return { ok: true, value: n };
}

/**
 * Validate the privacy-minimal order payload.
 * @param {object} data { productId, colour, quantity, access, district, authorised }
 * @param {object} opts { validColours:Set|Array, requireAuthorisation:boolean }
 */
export function validateOrder(data, { validColours = [], requireAuthorisation = false } = {}) {
  const errors = {};
  const colourSet = new Set(validColours);

  if (!RULES.productId.pattern.test(String(data.productId || "")))
    errors.productId = "Please choose a product.";

  if (colourSet.size && !colourSet.has(data.colour))
    errors.colour = "Please choose an available colour.";

  const q = validateQuantity(data.quantity, RULES.quantity);
  if (!q.ok) errors.quantity = "Quantity must be a whole number between 1 and 100.";

  // Do NOT pre-truncate: truncating to 2 would let "520" pass as "52".
  const district = sanitizeText(data.district);
  if (!RULES.district.pattern.test(district))
    errors.district = "Enter the first 2 digits of your postal code (e.g. 52).";

  if (requireAuthorisation && data.authorised !== true)
    errors.authorised = "Please confirm you are the resident, owner or authorised person.";

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Access conditions that open a mailbox and therefore need authorisation. */
export function accessRequiresAuthorisation(accessKey, accessFees) {
  const meta = accessFees?.[accessKey];
  if (meta && typeof meta.unlock === "boolean") return meta.unlock;
  // Fallback for older data shapes:
  return accessKey === "LOST_KEY_LOCKED" || accessKey === "DAMAGED_OR_JAMMED";
}

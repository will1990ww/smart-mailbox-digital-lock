/* ORDER MESSAGE — builds the WhatsApp deep link. Includes block/unit; never phone/email. */
export function waLink(whatsappNumber, text) {
  const base = "https://wa.me/" + encodeURIComponent(whatsappNumber);
  return text ? base + "?text=" + encodeURIComponent(text) : base;
}
export function toDistrict(value) { const s = String(value || "").replace(/\D/g, ""); return s.slice(0, 2); }
export function fmtUnit(value) {
  const s = String(value || "").trim().toUpperCase();
  if (!s) return "";
  return s.startsWith("#") ? s : "#" + s;
}
export function buildQuoteMessage({ productId, productName, colour, quantity, accessLabel, block, unit, timing, district, priceResult }) {
  const lines = [
    "Letterbox lock quote request",
    "----------------------------",
    `Product: ${productId} ${productName}` + (colour ? ` (${colour})` : ""),
    `Quantity: ${quantity}`,
    `Mailbox: ${accessLabel}`,
  ];
  const b = String(block || "").trim().toUpperCase();
  const u = fmtUnit(unit);
  if (b) lines.push(`Block: ${b}`);
  if (u) lines.push(`Unit: ${u}`);
  const d = toDistrict(district);
  if (d) lines.push(`Postal district: ${d}`);
  if (timing) lines.push(`Preferred: ${timing}`);
  if (priceResult) {
    if (priceResult.requiresQuote) lines.push("Estimate: written group quote required (20+ units)");
    else if (priceResult.discountRate) lines.push(`Estimate (not a confirmed price): S$${priceResult.total} incl. ${Math.round(priceResult.discountRate * 100)}% bulk discount`);
    else lines.push(`Estimate (not a confirmed price): S$${priceResult.total}`);
  }
  lines.push("----------------------------");
  lines.push("I'll share my name and contact number here to confirm the appointment.");
  return lines.join("\n");
}
export function buildProductEnquiry({ productId, productName, price }) {
  return `Hi, I'd like a quote for the ${productId} ${productName} (from S$${price}). My block/unit is __ and postal district is __.`;
}
export function containsNoContactPII(text) {
  const t = String(text || "");
  const phone = /\b\d{8}\b/;
  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/;
  return !(phone.test(t) || email.test(t));
}

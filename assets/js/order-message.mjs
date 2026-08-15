/* =============================================================================
 * ORDER MESSAGE — builds the WhatsApp deep link (PRIVACY-MINIMAL).
 * -----------------------------------------------------------------------------
 * The prefilled message is passed through the WhatsApp link as a URL query
 * parameter (?text=...). Because a URL can be logged by browsers, proxies and
 * the OS, we deliberately include ONLY: product, colour, quantity, mailbox
 * condition, postal district (2 digits) and an optional preferred time.
 * NO name, phone, street or unit number ever enters the URL — those are typed
 * by the customer inside the encrypted WhatsApp chat.
 * ========================================================================== */

export function waLink(whatsappNumber, text) {
  const base = "https://wa.me/" + encodeURIComponent(whatsappNumber);
  return text ? base + "?text=" + encodeURIComponent(text) : base;
}

/** Keep only the 2-digit postal sector even if a full code is passed. */
export function toDistrict(value) {
  const s = String(value || "").replace(/\D/g, "");
  return s.slice(0, 2);
}

/**
 * Build the minimal quote message. `priceResult` is calculateLine output.
 * The estimate is always labelled as an estimate, and 20+ shows the written-quote line.
 */
export function buildQuoteMessage({ productId, productName, colour, quantity,
  accessLabel, timing, district, priceResult }) {
  const lines = [
    "Letterbox lock quote request",
    "----------------------------",
    `Product: ${productId} ${productName}` + (colour ? ` (${colour})` : ""),
    `Quantity: ${quantity}`,
    `Mailbox: ${accessLabel}`,
  ];
  const d = toDistrict(district);
  if (d) lines.push(`Postal district: ${d}`);
  if (timing) lines.push(`Preferred: ${timing}`);

  if (priceResult) {
    if (priceResult.requiresQuote) {
      lines.push("Estimate: written group quote required (20+ units)");
    } else if (priceResult.discountRate) {
      lines.push(`Estimate (not a confirmed price): S$${priceResult.total} incl. ${Math.round(priceResult.discountRate * 100)}% bulk discount`);
    } else {
      lines.push(`Estimate (not a confirmed price): S$${priceResult.total}`);
    }
  }
  lines.push("----------------------------");
  lines.push("I'll share my name, unit and contact number here to confirm the appointment.");
  return lines.join("\n");
}

/** Simple per-product enquiry for the "Quick WhatsApp quote" buttons. */
export function buildProductEnquiry({ productId, productName, price }) {
  return `Hi, I'd like a quote for the ${productId} ${productName} (from S$${price}). My postal district is __.`;
}

/** Assert (for tests) that a WhatsApp text contains no obvious PII. */
export function containsNoPII(text) {
  const t = String(text || "");
  const phone = /\b\d{8}\b/;             // 8-digit SG mobile
  const unit = /#\d{1,3}-\d{1,4}/;       // #12-345
  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/;
  return !(phone.test(t) || unit.test(t) || email.test(t));
}

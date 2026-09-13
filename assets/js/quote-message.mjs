/* =============================================================================
 * QUOTE MESSAGE — builds the WhatsApp deep link.
 * F-01/M20: a URL can be logged, so the message carries only NON-PRECISE data:
 * products, quantity, mailbox condition, the 2-digit postal SECTOR and the
 * estimate. Block, unit, full postal code, name and phone are NEVER in the URL.
 * ========================================================================== */
import { postalSector, normaliseUnit, sanitizeText } from "./validation.mjs";
import { buildBreakdown } from "./pricing.mjs";

export const MAX_MESSAGE_CHARS = 1200;

export function waLink(whatsappNumber, text) {
  const base = "https://wa.me/" + encodeURIComponent(whatsappNumber);
  return text ? base + "?text=" + encodeURIComponent(text) : base;
}
/** E-06/M14: merge duplicate product+colour rows so the message stays short. */
export function consolidateItems(items = []) {
  const map = new Map();
  for (const it of items) {
    const key = `${it.id}::${it.colour}`;
    if (map.has(key)) map.get(key).quantity += Number(it.quantity) || 0;
    else map.set(key, { ...it, quantity: Number(it.quantity) || 0 });
  }
  return [...map.values()];
}
export function buildQuoteMessage({ items = [], result, accessLabel = "", accessFeePerUnit = 0, postal = "", timing = "", urgent = false }) {
  const merged = consolidateItems(items);
  const lines = [urgent ? "Letterbox lock — URGENT request" : "Letterbox lock — written quote request", "------------------------------"];
  merged.forEach((it, i) => {
    const colour = it.colourLabel ? ` (${it.colourLabel})` : "";
    lines.push(`${i + 1}. ${it.id} ${it.name}${colour} × ${it.quantity}`);
  });
  lines.push("------------------------------");
  if (accessLabel) lines.push(`Mailbox: ${accessLabel}`);
  const sector = postalSector(postal);
  if (sector) lines.push(`Postal sector: ${sector}`);
  const t = sanitizeText(timing, 80);
  if (t) lines.push(`Preferred: ${t}`);
  if (result) {
    const bd = buildBreakdown(result, { accessLabel, accessFeePerUnit });
    bd.rows.forEach((r) => lines.push(`  ${r.label}: ${r.value}`));
    lines.push(bd.requiresQuote ? "  Estimate: written group quote required (20+ units)" : `  Estimated total: ${bd.total}`);
    lines.push(`  (${bd.note})`);
  }
  lines.push("------------------------------");
  lines.push("I'll send photos of the mailbox front, inside latch and door edge, plus my name, block and unit, here in the chat.");
  let msg = lines.join("\n");
  if (msg.length > MAX_MESSAGE_CHARS) msg = msg.slice(0, MAX_MESSAGE_CHARS - 40).replace(/\n[^\n]*$/, "") + "\n… (full list shared in chat)";
  return msg;
}
/** E-07: precise details for clipboard only — never placed in a URL. */
export function buildDetailsForClipboard({ block = "", unit = "", postal = "" }) {
  const out = [];
  const b = sanitizeText(block, 6).toUpperCase();
  const u = normaliseUnit(unit);
  const p = String(postal ?? "").replace(/\D/g, "").slice(0, 6);
  if (b) out.push(`Block: ${b}`);
  if (u) out.push(`Unit: ${u.startsWith("#") ? u : "#" + u}`);
  if (p) out.push(`Postal code: ${p}`);
  return out.join("\n");
}
export function buildProductEnquiry({ productId, productName, price }) {
  return `Hi, I'd like a written quote for the ${productId} ${productName} (from S$${price}). I'll send photos of my mailbox.`;
}
export function containsNoPreciseIdentifiers(text) {
  const t = String(text || "");
  return !(/\b\d{8}\b/.test(t) || /[\w.+-]+@[\w-]+\.[\w.-]+/.test(t) || /#\d{1,3}-\d{1,4}/.test(t) || /\b\d{6}\b/.test(t));
}

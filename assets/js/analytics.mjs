/* =============================================================================
 * analytics.mjs — privacy-friendly, cookieless, CSP-safe event tracking.
 * -----------------------------------------------------------------------------
 * Design goals:
 *  • NO cookies, NO localStorage, NO fingerprinting, NO personal data.
 *  • CSP-safe: sends to a FIRST-PARTY endpoint on your own domain, so the strict
 *    `connect-src 'self'` policy is respected (no third-party script needed).
 *  • Fails silent + no-ops when disabled or unconfigured — zero user impact.
 *  • Uses navigator.sendBeacon so events don't delay navigation (important for
 *    outbound WhatsApp/tel links that leave the page immediately).
 *
 * The payload is intentionally minimal: an event name, a few safe properties
 * (e.g. product id, page path), and a coarse timestamp. Never phone/name/email.
 * ========================================================================== */

let CONFIG = { enabled: false, endpoint: "" };

/** Initialise from runtime config (called once by app.mjs). */
export function initAnalytics(cfg) {
  CONFIG = {
    enabled: !!(cfg && cfg.enabled),
    endpoint: (cfg && cfg.endpoint) || "",
  };
  return CONFIG.enabled && !!CONFIG.endpoint;
}

/** Whitelist + shallow-sanitise properties so no accidental PII is sent. */
function safeProps(props) {
  const out = {};
  if (!props || typeof props !== "object") return out;
  const allow = ["event", "product", "colour", "quantity", "district", "value", "path", "label", "category"];
  for (const k of allow) {
    if (props[k] == null) continue;
    let v = props[k];
    if (typeof v === "string") v = v.slice(0, 40);
    out[k] = v;
  }
  return out;
}

/**
 * Track an event. No-ops unless analytics is enabled AND an endpoint is set.
 * @param {string} event  e.g. "whatsapp_click", "order_submit"
 * @param {object} [props] small, non-PII properties
 */
export function track(event, props = {}) {
  try {
    if (!CONFIG.enabled || !CONFIG.endpoint) return false;
    if (typeof navigator === "undefined") return false;

    const payload = {
      e: String(event || "event").slice(0, 40),
      p: safeProps(props),
      path: (typeof location !== "undefined" ? location.pathname : "").slice(0, 120),
      ts: Date.now(),
      ref: (typeof document !== "undefined" ? (document.referrer || "").split("/").slice(0, 3).join("/") : "").slice(0, 80),
    };
    const body = JSON.stringify(payload);

    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      return navigator.sendBeacon(CONFIG.endpoint, blob);
    }
    // Fallback: fire-and-forget fetch with keepalive.
    if (typeof fetch === "function") {
      fetch(CONFIG.endpoint, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
      return true;
    }
    return false;
  } catch {
    return false; // analytics must never break the site
  }
}

/** Convenience: wire click tracking to any element carrying data-ev="name". */
export function wireEventClicks(root = (typeof document !== "undefined" ? document : null)) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll("[data-ev]").forEach((el) => {
    el.addEventListener("click", () => {
      const name = el.getAttribute("data-ev") || "click";
      const product = el.getAttribute("data-wa-product") || el.getAttribute("data-scroll-product") || undefined;
      track(name, product ? { product } : {});
    }, { passive: true });
  });
}

/* analytics.mjs — cookieless, first-party, CSP-safe. Hard PII allowlist. */
let CONFIG = { enabled: false, endpoint: "" };
export function initAnalytics(cfg) {
  CONFIG = { enabled: !!(cfg && cfg.enabled), endpoint: (cfg && cfg.endpoint) || "" };
  return CONFIG.enabled && !!CONFIG.endpoint;
}
const ALLOWED = ["product", "colour", "quantity", "value", "label", "mode"];
function safeProps(props) {
  const out = {};
  if (!props || typeof props !== "object") return out;
  for (const k of ALLOWED) {
    if (props[k] == null) continue;
    let v = props[k];
    if (typeof v === "string") v = v.slice(0, 40);
    if (typeof v === "number") v = String(v);
    out[k] = v;
  }
  return out;
}
export function track(event, props = {}) {
  try {
    if (!CONFIG.enabled || !CONFIG.endpoint || typeof navigator === "undefined") return false;
    const body = JSON.stringify({
      e: String(event || "event").slice(0, 40), p: safeProps(props),
      path: (typeof location !== "undefined" ? location.pathname : "").slice(0, 120), ts: Date.now(),
    });
    if (typeof navigator.sendBeacon === "function" && typeof Blob !== "undefined") {
      return navigator.sendBeacon(CONFIG.endpoint, new Blob([body], { type: "application/json" }));
    }
    if (typeof fetch === "function") { fetch(CONFIG.endpoint, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {}); return true; }
    return false;
  } catch { return false; }
}
export function wireEventClicks(root = (typeof document !== "undefined" ? document : null)) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll("[data-ev]").forEach((el) => {
    el.addEventListener("click", () => {
      const product = el.getAttribute("data-wa-product") || el.getAttribute("data-add-product") || undefined;
      track(el.getAttribute("data-ev") || "click", product ? { product } : {});
    }, { passive: true });
  });
}

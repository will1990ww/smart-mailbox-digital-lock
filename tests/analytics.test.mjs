/* =============================================================================
 * analytics.test.mjs — verifies the privacy-friendly tracker:
 *  • no-ops (sends nothing) when disabled
 *  • sends a beacon when enabled + endpoint configured
 *  • strips anything outside the safe property whitelist (no PII leakage)
 * ========================================================================== */
import test from "node:test";
import assert from "node:assert/strict";
import { initAnalytics, track } from "../assets/js/analytics.mjs";

function setGlobal(name, value) {
  // Node 24 exposes some globals (e.g. navigator) as read-only getters, so we
  // must defineProperty rather than assign.
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}
function withBeacon(fn) {
  const calls = [];
  setGlobal("navigator", { sendBeacon: (url, blob) => { calls.push({ url, blob }); return true; } });
  setGlobal("location", { pathname: "/test" });
  setGlobal("document", { referrer: "" });
  setGlobal("Blob", class { constructor(parts) { this.parts = parts; this._t = String(parts[0] || ""); } text() { return Promise.resolve(this._t); } });
  try { return fn(calls); }
  finally {
    for (const n of ["navigator", "location", "document", "Blob"]) {
      try { delete globalThis[n]; } catch { Object.defineProperty(globalThis, n, { value: undefined, configurable: true }); }
    }
  }
}

test("no-ops when analytics is disabled", () => {
  withBeacon((calls) => {
    initAnalytics({ enabled: false, endpoint: "/api/collect" });
    const sent = track("whatsapp_click", { product: "P2" });
    assert.equal(sent, false);
    assert.equal(calls.length, 0);
  });
});

test("no-ops when endpoint is missing", () => {
  withBeacon((calls) => {
    initAnalytics({ enabled: true, endpoint: "" });
    assert.equal(track("order_submit"), false);
    assert.equal(calls.length, 0);
  });
});

test("sends a beacon when enabled + endpoint set", () => {
  withBeacon((calls) => {
    initAnalytics({ enabled: true, endpoint: "/api/collect" });
    const ok = track("order_submit", { product: "P2", quantity: "3" });
    assert.equal(ok, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "/api/collect");
    const payload = JSON.parse(calls[0].blob._t);
    assert.equal(payload.e, "order_submit");
    assert.equal(payload.p.product, "P2");
    assert.equal(payload.p.quantity, "3");
  });
});

test("drops non-whitelisted properties (no accidental PII)", () => {
  withBeacon((calls) => {
    initAnalytics({ enabled: true, endpoint: "/api/collect" });
    track("order_submit", { product: "P2", phone: "91234567", name: "Zhang Wei", email: "a@b.com" });
    const payload = JSON.parse(calls[0].blob._t);
    assert.equal(payload.p.product, "P2");
    assert.equal(payload.p.phone, undefined, "phone must be dropped");
    assert.equal(payload.p.name, undefined, "name must be dropped");
    assert.equal(payload.p.email, undefined, "email must be dropped");
  });
});

test("track never throws even if the environment is broken", () => {
  // No navigator/Blob defined here → must fail-soft, not throw.
  initAnalytics({ enabled: true, endpoint: "/api/collect" });
  assert.doesNotThrow(() => track("whatsapp_click", { product: "P1" }));
});

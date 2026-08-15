/* =============================================================================
 * app.mjs — progressive enhancement ONLY. Core content is static HTML.
 * Safe DOM throughout: no innerHTML with data; JSON.parse + textContent/createElement.
 * ========================================================================== */
import { calculateLine } from "./pricing.mjs";
import { validateOrder, validateQuantity, accessRequiresAuthorisation, sanitizeText } from "./validation.mjs";
import { waLink, buildQuoteMessage, buildProductEnquiry } from "./order-message.mjs";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---- Load + VALIDATE runtime data (handle broken JSON gracefully) --------- */
function loadData() {
  const node = document.getElementById("site-data");
  if (!node) return null;
  let d;
  try { d = JSON.parse(node.textContent || "{}"); }
  catch { console.error("[app] site-data JSON failed to parse"); return null; }
  // structural validation
  if (!d || typeof d !== "object") return null;
  if (!d.site || typeof d.site !== "object") return null;
  if (!Array.isArray(d.products)) return null;
  if (!d.colours || typeof d.colours !== "object") return null;
  const p = d.site.pricing;
  if (!p || typeof p !== "object" || !p.accessFees || !Array.isArray(p.tiers)) return null;
  return d;
}

const DATA = loadData();
if (!DATA) {
  // Fail soft: static HTML already shows everything; just skip enhancement.
  console.warn("[app] runtime data unavailable — static content remains usable.");
}

const SITE = DATA?.site || {};
const PRODUCTS = DATA?.products || [];
const COLOURS = DATA?.colours || {};
const PRICING = SITE.pricing || { accessFees: {}, tiers: [], quantity: { min: 1, max: 100 } };
const byId = (id) => PRODUCTS.find((p) => p && p.id === id) || null;

/* ---- Contact links (guarded) ---------------------------------------------- */
if (SITE.phoneE164) $$("[data-tel]").forEach((a) => { a.href = "tel:+" + SITE.phoneE164; });
if (SITE.whatsappNumber) {
  $$("[data-wa]").forEach((a) => { a.href = waLink(SITE.whatsappNumber, "Hi, I'd like a quote for a letterbox lock. My postal district is __."); a.rel = "noopener noreferrer"; });
  $$("[data-wa-group]").forEach((a) => { a.href = waLink(SITE.whatsappNumber, "Hi, I'd like a GROUP/BULK quote for letterbox locks. Estate: ___ | Units: ___ | Postal district: __"); a.rel = "noopener noreferrer"; });
}
if (SITE.phoneDisplay) $$("[data-phone-display]").forEach((s) => { s.textContent = "Call " + SITE.phoneDisplay; });
const yr = $("#yr"); if (yr) yr.textContent = String(new Date().getFullYear());

/* ---- Per-product "Quick WhatsApp quote" ----------------------------------- */
$$("[data-wa-product]").forEach((a) => {
  const p = byId(a.getAttribute("data-wa-product"));
  if (!p || !SITE.whatsappNumber) return;
  a.href = waLink(SITE.whatsappNumber, buildProductEnquiry({ productId: p.id, productName: p.name, price: p.price }));
  a.rel = "noopener noreferrer";
});

/* ---- Product filter (visual + aria-pressed kept in sync) ------------------ */
const filterBtns = $$(".filter-row [data-filter]");
if (filterBtns.length) {
  filterBtns.forEach((btn) => btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    const f = btn.dataset.filter;
    $$("#productGrid > [data-categories]").forEach((el) => {
      const cats = (el.dataset.categories || "").split(",");
      el.hidden = !(f === "all" || cats.includes(f));
    });
  }));
}

/* ===========================================================================
 * ORDER FORM (privacy-minimal). Fields: product, colour, quantity, access,
 * district, timing (optional) + conditional authorisation.
 * ========================================================================= */
const form = $("#orderForm");
if (form && DATA) {
  const selP = $("#orderProduct", form);
  const selC = $("#orderColour", form);
  const selA = $("#orderAccess", form);
  const qty  = $("#orderQuantity", form);
  const dist = $("#orderDistrict", form);
  const timing = form.elements["timing"];
  const est  = $("#estimate", form);
  const consent = $("#authGroup", form);
  const consentBox = $("#authorised", form);
  const status = $("#formStatus", form);

  const validColoursFor = (id) => (byId(id)?.colours || []);

  // Populate colours for the selected product (this is the product↔colour link).
  function fillColours(preferred) {
    const p = byId(selP.value) || PRODUCTS[0];
    if (!p) return;
    selC.replaceChildren();
    (p.colours || []).forEach((key) => {
      const c = COLOURS[key];
      if (!c) return;
      const o = document.createElement("option");
      o.value = key;
      o.textContent = c.label; // textContent — no injection
      selC.appendChild(o);
    });
    if (preferred && (p.colours || []).includes(preferred)) selC.value = preferred;
  }

  const currentAccessKey = () => selA.selectedOptions[0]?.value || "OPEN_WITH_KEY";

  function syncConsent() {
    const need = accessRequiresAuthorisation(currentAccessKey(), PRICING.accessFees);
    consent.classList.toggle("show", need);
    if (!need) consentBox.checked = false;
  }

  function addNote(txt) {
    const n = document.createElement("span");
    n.className = "note";
    n.textContent = txt;
    est.append(n);
  }

  function calc() {
    const p = byId(selP.value) || PRODUCTS[0];
    const accessKey = currentAccessKey();
    const fee = PRICING.accessFees?.[accessKey]?.perUnit || 0;
    const qv = validateQuantity(qty.value, PRICING.quantity);
    const q = qv.ok ? qv.value : 1;
    const result = calculateLine({ unitPrice: p?.price ?? 0, quantity: q, accessFeePerUnit: fee, tiers: PRICING.tiers });

    est.replaceChildren();
    est.append("Estimated total: ");
    const strong = document.createElement("b");
    if (result.requiresQuote) {
      strong.textContent = "Written group quote required";
      est.append(strong);
      addNote("20+ units are priced by written quote so the rate reflects the full scope.");
    } else {
      strong.textContent = "S$" + result.total;
      est.append(strong);
      if (result.discountRate) addNote(`Estimate only — includes ${Math.round(result.discountRate * 100)}% bulk discount. Final price confirmed in writing.`);
      else addNote("Estimate only, not a confirmed price. Final price confirmed in writing after a photo.");
    }
    return { p, result, accessKey };
  }

  function showError(field, msg) {
    const input = form.elements[field];
    const box = $(`[data-error-for="${field}"]`, form);
    if (input) input.setAttribute("aria-invalid", "true");
    if (box) box.textContent = msg;
  }
  function clearErrors() {
    $$("[aria-invalid]", form).forEach((el) => el.removeAttribute("aria-invalid"));
    $$("[data-error-for]", form).forEach((el) => { el.textContent = ""; });
    if (status) { status.textContent = ""; status.classList.remove("err"); }
  }

  selP.addEventListener("change", () => { fillColours(); calc(); });
  selA.addEventListener("change", () => { syncConsent(); calc(); });
  [qty, selC, dist].forEach((el) => el && el.addEventListener("input", calc));

  fillColours(); syncConsent(); calc();

  // "Select & configure" on a product card presets product + colour, then scrolls.
  $$("[data-scroll-product]").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("data-scroll-product");
    const colour = a.getAttribute("data-scroll-colour") || "";
    if (!byId(id)) return; // invalid id -> let the href jump happen
    e.preventDefault();
    selP.value = id;
    fillColours(colour);
    calc();
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
    selP.focus({ preventScroll: true });
    // brief visual confirmation that the form was pre-filled
    form.classList.add("flash");
    setTimeout(() => form.classList.remove("flash"), 900);
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();
    const accessKey = currentAccessKey();
    const requireAuth = accessRequiresAuthorisation(accessKey, PRICING.accessFees);
    const payload = {
      productId: selP.value, colour: selC.value, quantity: qty.value,
      access: accessKey, district: dist.value, authorised: consentBox.checked,
    };
    const { valid, errors } = validateOrder(payload, { validColours: validColoursFor(selP.value), requireAuthorisation: requireAuth });

    if (!valid) {
      Object.entries(errors).forEach(([f, m]) => showError(f, m));
      if (status) { status.textContent = "Please fix the highlighted fields."; status.classList.add("err"); }
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const { p, result } = calc();
    // Minimal message — NO name/phone/street/unit in the URL.
    const msg = buildQuoteMessage({
      productId: p.id, productName: p.name,
      colour: COLOURS[selC.value]?.label || "",
      quantity: result.quantity,
      accessLabel: PRICING.accessFees?.[accessKey]?.label || "",
      timing: sanitizeText(timing?.value, 80),
      district: dist.value,
      priceResult: result,
    });

    if (!SITE.whatsappNumber) { if (status) { status.textContent = "WhatsApp is not configured yet."; status.classList.add("err"); } return; }
    const url = waLink(SITE.whatsappNumber, msg);
    let win = null;
    try { win = window.open(url, "_blank", "noopener,noreferrer"); } catch { win = null; }
    if (win) { try { win.opener = null; } catch {} return; }

    // Popup blocked / launch failed -> graceful fallback link.
    if (status) {
      status.textContent = "";
      status.classList.remove("err");
      const link = document.createElement("a");
      link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.textContent = "Tap here to open WhatsApp with your request";
      status.append("Popup blocked. ", link);
      link.focus();
    }
  });
}

/* ---- Gallery lightbox ------------------------------------------------------ */
const lightbox = $("#lightbox");
if (lightbox) {
  let lastFocus = null;
  const img = $("#lightboxImg", lightbox);
  const open = (src, alt) => {
    lastFocus = document.activeElement;
    if (img && src) { img.src = src; img.alt = alt || ""; }
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
  };
  const close = () => {
    if (typeof lightbox.close === "function") lightbox.close();
    else lightbox.removeAttribute("open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  };
  $$("[data-gallery-src]").forEach((btn) => btn.addEventListener("click", () => open(btn.dataset.gallerySrc, btn.getAttribute("aria-label"))));
  $$("[data-close]", lightbox).forEach((b) => b.addEventListener("click", close));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
  lightbox.addEventListener("cancel", () => { if (lastFocus?.focus) lastFocus.focus(); });
}

/* ---- Scroll-spy: highlight the nav link for the section in view ----------- */
if ("IntersectionObserver" in window) {
  const navLinks = $$('.links a[href*="#"]');
  if (navLinks.length) {
    const byHash = new Map();
    navLinks.forEach((a) => {
      const hash = a.getAttribute("href").split("#")[1];
      if (hash) byHash.set(hash, a);
    });
    const setCurrent = (id) => navLinks.forEach((a) =>
      a.setAttribute("aria-current", byHash.get(id) === a ? "true" : "false"));
    const sections = [...byHash.keys()].map((id) => document.getElementById(id)).filter(Boolean);
    if (sections.length) {
      const io = new IntersectionObserver((entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis?.target?.id) setCurrent(vis.target.id);
      }, { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] });
      sections.forEach((s) => io.observe(s));
    }
  }
}

/* ---- Mobile menu (aria-expanded synced) ----------------------------------- */
const menuBtn = $(".menu");
const linksNav = $(".links");
if (menuBtn && linksNav) {
  const setOpen = (open) => { linksNav.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); };
  menuBtn.addEventListener("click", () => setOpen(!linksNav.classList.contains("open")));
  linksNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

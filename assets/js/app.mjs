/* =============================================================================
 * app.mjs — progressive enhancement ONLY. Core content is static HTML.
 * ========================================================================== */
import { calculateLine } from "./pricing.mjs";
import { validateOrder, validateQuantity, accessRequiresAuthorisation, sanitizeText } from "./validation.mjs";
import { waLink, buildQuoteMessage, buildProductEnquiry } from "./order-message.mjs";
import { initAnalytics, track, wireEventClicks } from "./analytics.mjs";
import { createCart, buildCartMessage } from "./cart.mjs";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function loadData() {
  const node = document.getElementById("site-data");
  if (!node) return null;
  let d;
  try { d = JSON.parse(node.textContent || "{}"); }
  catch { console.error("[app] site-data JSON failed to parse"); return null; }
  if (!d || typeof d !== "object") return null;
  if (!d.site || typeof d.site !== "object") return null;
  if (!Array.isArray(d.products)) return null;
  if (!d.colours || typeof d.colours !== "object") return null;
  const p = d.site.pricing;
  if (!p || typeof p !== "object" || !p.accessFees || !Array.isArray(p.tiers)) return null;
  return d;
}
const DATA = loadData();
if (!DATA) console.warn("[app] runtime data unavailable — static content remains usable.");

const SITE = DATA?.site || {};
const PRODUCTS = DATA?.products || [];
const COLOURS = DATA?.colours || {};
const PRICING = SITE.pricing || { accessFees: {}, tiers: [], quantity: { min: 1, max: 100 } };
const byId = (id) => PRODUCTS.find((p) => p && p.id === id) || null;

/* ---- Analytics (cookieless, no-ops unless configured) --------------------- */
initAnalytics(SITE.analytics);
wireEventClicks(document);

function coloursForProduct(id, fallbackEl) {
  const p = byId(id);
  if (p && Array.isArray(p.colours) && p.colours.length) return p.colours;
  const raw = fallbackEl?.getAttribute?.("data-colours") || "";
  return raw ? raw.split(",").filter(Boolean) : [];
}

/* ---- Contact links --------------------------------------------------------- */
if (SITE.phoneE164) $$("[data-tel]").forEach((a) => { a.href = "tel:+" + SITE.phoneE164; });
if (SITE.whatsappNumber) {
  $$("[data-wa]").forEach((a) => { a.href = waLink(SITE.whatsappNumber, "Hi, I'd like a quote for a letterbox lock. My postal code is __."); a.rel = "noopener noreferrer"; });
  $$("[data-wa-group]").forEach((a) => { a.href = waLink(SITE.whatsappNumber, "Hi, I'd like a GROUP/BULK quote for letterbox locks. Estate: ___ | Units: ___ | Postal code: __"); a.rel = "noopener noreferrer"; });
}
if (SITE.phoneDisplay) $$("[data-phone-display]").forEach((s) => { s.textContent = "Call " + SITE.phoneDisplay; });
const yr = $("#yr"); if (yr) yr.textContent = String(new Date().getFullYear());

$$("[data-wa-product]").forEach((a) => {
  const p = byId(a.getAttribute("data-wa-product"));
  if (!p || !SITE.whatsappNumber) return;
  a.href = waLink(SITE.whatsappNumber, buildProductEnquiry({ productId: p.id, productName: p.name, price: p.price }));
  a.rel = "noopener noreferrer";
});

/* ---- Product filter -------------------------------------------------------- */
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
    track("product_filter", { label: f });
  }));
}

/* ===========================================================================
 * SHOPPING CART (add-to-cart on product cards; summary in the order section)
 * ========================================================================= */
const CART = DATA ? createCart({ products: PRODUCTS, colours: COLOURS, tiers: PRICING.tiers }) : null;
const cartPanel = $("#cartPanel");
const cartLines = $("#cartLines");
const cartTotal = $("#cartTotal");
const cartFab = $("#cartFab");
const cartCount = $("#cartCount");

function money(n) { return "S$" + n; }

function renderCart(state) {
  const has = state.count > 0;
  if (cartFab) { cartFab.hidden = !has; }
  if (cartCount) cartCount.textContent = String(state.count);
  if (cartPanel) cartPanel.hidden = !has;
  if (!cartLines) return;
  cartLines.replaceChildren();
  state.items.forEach((it) => {
    const li = document.createElement("li");
    li.className = "cart-line";

    const info = document.createElement("div");
    info.className = "cart-line-info";
    const nm = document.createElement("b"); nm.textContent = `${it.id} ${it.name}`;
    const sub = document.createElement("span"); sub.textContent = `${it.colourLabel} · ${money(it.unitPrice)} each`;
    info.append(nm, sub);

    const ctrls = document.createElement("div");
    ctrls.className = "cart-line-ctrls";
    const dec = document.createElement("button"); dec.type = "button"; dec.className = "qty-btn"; dec.textContent = "−"; dec.setAttribute("aria-label", `Decrease ${it.name}`);
    const qty = document.createElement("span"); qty.className = "qty-val"; qty.textContent = String(it.quantity);
    const inc = document.createElement("button"); inc.type = "button"; inc.className = "qty-btn"; inc.textContent = "+"; inc.setAttribute("aria-label", `Increase ${it.name}`);
    const rm = document.createElement("button"); rm.type = "button"; rm.className = "cart-rm"; rm.textContent = "Remove"; rm.setAttribute("aria-label", `Remove ${it.name}`);
    dec.addEventListener("click", () => CART.setQuantity(it.id, it.colour, it.quantity - 1));
    inc.addEventListener("click", () => CART.setQuantity(it.id, it.colour, it.quantity + 1));
    rm.addEventListener("click", () => { CART.remove(it.id, it.colour); track("cart_remove", { product: it.id }); });
    ctrls.append(dec, qty, inc, rm);

    li.append(info, ctrls);
    cartLines.appendChild(li);
  });
  if (cartTotal) {
    cartTotal.replaceChildren();
    const lbl = document.createElement("span"); lbl_text(lbl, state);
    cartTotal.append(lbl);
  }
}
function lbl_text(el, state) {
  if (state.requiresQuote) {
    el.innerHTML = "";
    const b = document.createElement("b"); b.textContent = "Written group quote (20+ units)";
    el.append(`${state.totalQty} items — `, b);
  } else {
    const strong = document.createElement("b"); strong.textContent = money(state.total);
    el.append(`Estimated total: `, strong);
    if (state.discountRate) { const s = document.createElement("small"); s.textContent = ` (incl. ${Math.round(state.discountRate * 100)}% bulk discount)`; el.append(s); }
  }
}

if (CART) {
  CART.subscribe(renderCart);
  renderCart(CART.state());

  // Add-to-cart buttons on product cards.
  $$("[data-add-product]").forEach((btn) => btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-add-product");
    const sel = document.querySelector(`[data-card-colour="${id}"]`);
    const colour = sel ? sel.value : undefined;
    CART.add(id, colour, 1);
    track("add_to_cart", { product: id, colour });
    btn.classList.add("added"); btn.textContent = "Added ✓";
    setTimeout(() => { btn.classList.remove("added"); btn.textContent = "Add to cart"; }, 1100);
  }));

  const cartClear = $("#cartClear");
  if (cartClear) cartClear.addEventListener("click", () => { CART.clear(); track("cart_clear", {}); });
}

/* ===========================================================================
 * ORDER FORM
 * ========================================================================= */
const form = $("#orderForm");
if (form && DATA) {
  const selP = $("#orderProduct", form);
  const selC = $("#orderColour", form);
  const selA = $("#orderAccess", form);
  const qty  = $("#orderQuantity", form);
  const dist = $("#orderDistrict", form);
  const block = $("#orderBlock", form);
  const unit  = $("#orderUnit", form);
  const timing = form.elements["timing"];
  const est  = $("#estimate", form);
  const consent = $("#authGroup", form);
  const consentBox = $("#authorised", form);
  const status = $("#formStatus", form);

  const validColoursFor = (id) => coloursForProduct(id, selP.selectedOptions?.[0]);

  function fillColours(preferred) {
    const id = selP.value;
    const list = coloursForProduct(id, selP.selectedOptions?.[0]);
    const colours = list.length ? list : (PRODUCTS[0]?.colours || ["SILVER"]);
    selC.replaceChildren();
    colours.forEach((key) => {
      const o = document.createElement("option");
      o.value = key;
      o.textContent = COLOURS[key]?.label || key;
      selC.appendChild(o);
    });
    if (preferred && colours.includes(preferred)) selC.value = preferred;
    else selC.value = colours[0];
  }
  const currentAccessKey = () => selA.selectedOptions[0]?.value || "OPEN_WITH_KEY";
  function syncConsent() {
    const need = accessRequiresAuthorisation(currentAccessKey(), PRICING.accessFees);
    consent.classList.toggle("show", need);
    if (!need) consentBox.checked = false;
  }
  function addNote(txt) { const n = document.createElement("span"); n.className = "note"; n.textContent = txt; est.append(n); }
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
    if (result.requiresQuote) { strong.textContent = "Written group quote required"; est.append(strong); addNote("20+ units are priced by written quote so the rate reflects the full scope."); }
    else {
      strong.textContent = "S$" + result.total; est.append(strong);
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
  [qty, selC, dist, block, unit].forEach((el) => el && el.addEventListener("input", calc));
  fillColours(); syncConsent(); calc();

  $$("[data-scroll-product]").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("data-scroll-product");
    const colour = a.getAttribute("data-scroll-colour") || "";
    if (!byId(id)) return;
    e.preventDefault();
    selP.value = id; fillColours(colour); calc();
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
    selP.focus({ preventScroll: true });
    form.classList.add("flash");
    setTimeout(() => form.classList.remove("flash"), 900);
    track("select_configure", { product: id });
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();
    const accessKey = currentAccessKey();
    const requireAuth = accessRequiresAuthorisation(accessKey, PRICING.accessFees);
    const payload = {
      productId: selP.value, colour: selC.value, quantity: qty.value,
      access: accessKey, district: dist.value, block: block?.value, unit: unit?.value, authorised: consentBox.checked,
    };
    const { valid, errors } = validateOrder(payload, { validColours: validColoursFor(selP.value), requireAuthorisation: requireAuth, requireAddress: true });
    if (!valid) {
      Object.entries(errors).forEach(([f, m]) => showError(f, m));
      if (status) { status.textContent = "Please fix the highlighted fields."; status.classList.add("err"); }
      form.querySelector('[aria-invalid="true"]')?.focus();
      track("order_invalid", { product: selP.value });
      return;
    }
    const { p, result } = calc();
    const cartState = CART ? CART.state() : { count: 0 };
    const details = {
      block: sanitizeText(block?.value, 6), unit: sanitizeText(unit?.value, 12),
      district: dist.value, access: accessKey,
      accessLabel: PRICING.accessFees?.[accessKey]?.label || "",
      timing: sanitizeText(timing?.value, 80),
    };
    let msg;
    if (cartState.count > 0) {
      // Cart checkout: send every item in one WhatsApp message.
      msg = buildCartMessage(cartState, details);
      track("order_submit", { label: "cart", quantity: String(cartState.totalQty), value: cartState.requiresQuote ? "quote" : String(cartState.total) });
    } else {
      // Single-item quick order (form selection).
      msg = buildQuoteMessage({
        productId: p.id, productName: p.name, colour: COLOURS[selC.value]?.label || "",
        quantity: result.quantity, accessLabel: details.accessLabel,
        block: details.block, unit: details.unit, timing: details.timing,
        district: details.district, priceResult: result,
      });
      track("order_submit", { product: p.id, colour: selC.value, quantity: String(result.quantity), value: result.requiresQuote ? "quote" : String(result.total) });
    }
    if (!SITE.whatsappNumber) { if (status) { status.textContent = "WhatsApp is not configured yet."; status.classList.add("err"); } return; }
    const url = waLink(SITE.whatsappNumber, msg);
    let win = null;
    try { win = window.open(url, "_blank", "noopener,noreferrer"); } catch { win = null; }
    if (win) { try { win.opener = null; } catch {} return; }
    if (status) {
      status.textContent = ""; status.classList.remove("err");
      const link = document.createElement("a");
      link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.textContent = "Tap here to open WhatsApp with your request";
      status.append("Popup blocked. ", link); link.focus();
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

/* ---- Scroll-spy ----------------------------------------------------------- */
if (typeof window !== "undefined" && "IntersectionObserver" in window) {
  const navLinks = $$('.links a[href*="#"]');
  if (navLinks.length) {
    const byHash = new Map();
    navLinks.forEach((a) => { const hash = a.getAttribute("href").split("#")[1]; if (hash) byHash.set(hash, a); });
    const setCurrent = (id) => navLinks.forEach((a) => a.setAttribute("aria-current", byHash.get(id) === a ? "true" : "false"));
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

/* ---- Mobile menu ---------------------------------------------------------- */
const menuBtn = $(".menu");
const linksNav = $(".links");
if (menuBtn && linksNav) {
  const setOpen = (open) => { linksNav.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); };
  menuBtn.addEventListener("click", () => setOpen(!linksNav.classList.contains("open")));
  linksNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  if (typeof document !== "undefined") document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  if (typeof window !== "undefined" && window.addEventListener) window.addEventListener("resize", () => { if (window.innerWidth > 860) setOpen(false); });
}

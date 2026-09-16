/* =============================================================================
 * app.mjs — progressive enhancement only. All content exists in static HTML.
 * ========================================================================== */
import { calculateLine, buildBreakdown, money } from "./pricing.mjs";
import { validateQuote, validateQuantity, accessRequiresAuthorisation, sanitizeText } from "./validation.mjs";
import { waLink, buildQuoteMessage, buildDetailsForClipboard, buildProductEnquiry } from "./quote-message.mjs";
import { initAnalytics, track, wireEventClicks } from "./analytics.mjs";
import { createQuoteList } from "./quote-list.mjs";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function loadData() {
  const node = document.getElementById("site-data");
  if (!node) return null;
  let d; try { d = JSON.parse(node.textContent || "{}"); } catch { return null; }
  if (!d?.site || !Array.isArray(d.products) || !d.colours) return null;
  if (!d.site.pricing?.accessFees || !Array.isArray(d.site.pricing.tiers)) return null;
  return d;
}
const DATA = loadData();
if (!DATA) console.warn("[app] runtime data unavailable — static content remains usable.");

const SITE = DATA?.site || {};
const PRODUCTS = DATA?.products || [];
const COLOURS = DATA?.colours || {};
const PRICING = SITE.pricing || { accessFees: {}, tiers: [], quantity: { min: 1, max: 100 } };
const byId = (id) => PRODUCTS.find((p) => p && p.id === id) || null;

initAnalytics(SITE.analytics);
wireEventClicks(document);

const coloursFor = (id, el) => {
  const p = byId(id);
  if (p?.colours?.length) return p.colours;
  const raw = el?.getAttribute?.("data-colours") || "";
  return raw ? raw.split(",").filter(Boolean) : [];
};

if (SITE.phoneE164) $$("[data-tel]").forEach((a) => { a.href = "tel:+" + SITE.phoneE164; });
if (SITE.phoneDisplay) $$("[data-phone-display]").forEach((s) => { s.textContent = "Call " + SITE.phoneDisplay; });
$$("[data-wa-product]").forEach((a) => {
  const p = byId(a.getAttribute("data-wa-product"));
  if (!p || !SITE.whatsappNumber) return;
  a.href = waLink(SITE.whatsappNumber, buildProductEnquiry({ productId: p.id, productName: p.name, price: p.price }));
  a.rel = "noopener noreferrer";
});
const yr = $("#yr"); if (yr) yr.textContent = String(new Date().getFullYear());

const filterBtns = $$(".filter-row [data-filter]");
if (filterBtns.length) {
  filterBtns.forEach((btn) => btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    const f = btn.dataset.filter;
    $$("#productGrid > [data-categories]").forEach((el) => {
      const show = f === "all" || (el.dataset.categories || "").split(",").includes(f);
      el.hidden = !show;
      el.setAttribute("aria-hidden", show ? "false" : "true");
      $$("a,button,select,input", el).forEach((c) => { if (show) c.removeAttribute("tabindex"); else c.setAttribute("tabindex", "-1"); });
    });
    track("product_filter", { label: f });
  }));
}

const LIST = DATA ? createQuoteList({ products: PRODUCTS, colours: COLOURS, tiers: PRICING.tiers }) : null;
const form = $("#quoteForm");

const el = {
  modeSingle: $("#modeSingle"), modeMulti: $("#modeMulti"),
  singlePane: $("#singlePane"), multiPane: $("#multiPane"),
  product: $("#qProduct"), colour: $("#qColour"), qty: $("#qQuantity"),
  access: $("#qAccess"), postal: $("#qPostal"), block: $("#qBlock"), unit: $("#qUnit"),
  timing: $("#qTiming"), authGroup: $("#authGroup"), authorised: $("#qAuthorised"),
  breakdown: $("#breakdown"), status: $("#formStatus"),
  listLines: $("#listLines"), listEmpty: $("#listEmpty"), listClear: $("#listClear"),
  count: $("#quoteCount"), copyBtn: $("#copyDetails"), urgentFlag: $("#qUrgent"),
};

const getMode = () => (el.modeMulti?.checked ? "multiple" : "single");
const accessKey = () => el.access?.selectedOptions?.[0]?.value || "OPEN_WITH_KEY";
const accessMeta = () => PRICING.accessFees?.[accessKey()] || { label: "", perUnit: 0 };

function syncMode() {
  const mode = getMode();
  if (el.singlePane) el.singlePane.hidden = mode !== "single";
  if (el.multiPane) el.multiPane.hidden = mode !== "multiple";
  render();
}
function syncConsent() {
  const need = accessRequiresAuthorisation(accessKey(), PRICING.accessFees);
  if (el.authGroup) el.authGroup.classList.toggle("show", need);
  if (!need && el.authorised) el.authorised.checked = false;
}
function fillColours(preferred) {
  if (!el.product || !el.colour) return;
  const list = coloursFor(el.product.value, el.product.selectedOptions?.[0]);
  const cols = list.length ? list : (PRODUCTS[0]?.colours || []);
  el.colour.replaceChildren();
  cols.forEach((k) => { const o = document.createElement("option"); o.value = k; o.textContent = COLOURS[k]?.label || k; el.colour.appendChild(o); });
  el.colour.value = (preferred && cols.includes(preferred)) ? preferred : cols[0];
}
function currentResult() {
  const fee = accessMeta().perUnit || 0;
  if (getMode() === "multiple") { LIST.setAccessFee(fee); const s = LIST.state(); return { result: s, items: s.items, fee }; }
  const p = byId(el.product?.value) || PRODUCTS[0];
  const qv = validateQuantity(el.qty?.value, PRICING.quantity);
  const q = qv.ok ? qv.value : 1;
  const result = calculateLine({ unitPrice: p?.price ?? 0, quantity: q, accessFeePerUnit: fee, tiers: PRICING.tiers });
  const items = p ? [{ id: p.id, name: p.name, colourLabel: COLOURS[el.colour?.value]?.label || "", quantity: q, unitPrice: p.price }] : [];
  return { result, items, fee };
}
function renderBreakdown() {
  if (!el.breakdown) return;
  const { result, items, fee } = currentResult();
  el.breakdown.replaceChildren();
  if (!items.length) {
    const p = document.createElement("p"); p.className = "bd-empty";
    p.textContent = "Add at least one lock to see an estimate.";
    el.breakdown.appendChild(p); return;
  }
  const bd = buildBreakdown(result, { accessLabel: accessMeta().label, accessFeePerUnit: fee });
  const dl = document.createElement("dl"); dl.className = "bd-rows";
  bd.rows.forEach((r) => { const dt = document.createElement("dt"); dt.textContent = r.label; const dd = document.createElement("dd"); dd.textContent = r.value; dl.append(dt, dd); });
  el.breakdown.appendChild(dl);
  const tot = document.createElement("p"); tot.className = "bd-total";
  const b = document.createElement("b");
  if (bd.requiresQuote) { b.textContent = "Written group quote required"; tot.append("Estimate: ", b); }
  else { b.textContent = bd.total; tot.append("Estimated total: ", b); }
  el.breakdown.appendChild(tot);
  const note = document.createElement("p"); note.className = "bd-note"; note.textContent = bd.note;
  el.breakdown.appendChild(note);
}
function renderList(state) {
  if (!el.listLines) return;
  const has = state.count > 0;
  if (el.count) { el.count.hidden = !has; el.count.textContent = String(state.count); }
  if (el.listEmpty) el.listEmpty.hidden = has;
  el.listLines.replaceChildren();
  state.items.forEach((it) => {
    const li = document.createElement("li"); li.className = "ql-line";
    const info = document.createElement("div"); info.className = "ql-info";
    const nm = document.createElement("b"); nm.textContent = `${it.id} ${it.name}`;
    const sub = document.createElement("span"); sub.textContent = `${it.colourLabel} · ${money(it.unitPrice)} each`;
    info.append(nm, sub);
    const ctl = document.createElement("div"); ctl.className = "ql-ctl";
    const dec = document.createElement("button"); dec.type = "button"; dec.className = "qty-btn"; dec.textContent = "−"; dec.setAttribute("aria-label", `Decrease quantity of ${it.name}`);
    const q = document.createElement("span"); q.className = "qty-val"; q.textContent = String(it.quantity);
    const inc = document.createElement("button"); inc.type = "button"; inc.className = "qty-btn"; inc.textContent = "+"; inc.setAttribute("aria-label", `Increase quantity of ${it.name}`);
    const rm = document.createElement("button"); rm.type = "button"; rm.className = "ql-rm"; rm.textContent = "Remove"; rm.setAttribute("aria-label", `Remove ${it.name} from quote list`);
    dec.addEventListener("click", () => LIST.setQuantity(it.id, it.colour, it.quantity - 1));
    inc.addEventListener("click", () => LIST.setQuantity(it.id, it.colour, it.quantity + 1));
    rm.addEventListener("click", () => { LIST.remove(it.id, it.colour); track("quote_remove", { product: it.id }); });
    ctl.append(dec, q, inc, rm);
    li.append(info, ctl);
    el.listLines.appendChild(li);
  });
}
function render() { if (LIST) renderList(LIST.state()); renderBreakdown(); }

if (LIST) {
  LIST.subscribe(() => render());
  $$("[data-add-product]").forEach((btn) => btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-add-product");
    const sel = document.querySelector(`[data-card-colour="${id}"]`);
    LIST.add(id, sel ? sel.value : undefined, 1);
    if (el.modeMulti && !el.modeMulti.checked) { el.modeMulti.checked = true; syncMode(); }
    track("add_to_quote", { product: id, colour: sel ? sel.value : undefined });
    btn.classList.add("added"); btn.textContent = "Added ✓";
    setTimeout(() => { btn.classList.remove("added"); btn.textContent = "Add to quote"; }, 1100);
  }));
  if (el.listClear) el.listClear.addEventListener("click", () => { LIST.clear(); track("quote_clear", {}); });
}

if (form && DATA) {
  [el.modeSingle, el.modeMulti].forEach((r) => r && r.addEventListener("change", syncMode));
  el.product?.addEventListener("change", () => { fillColours(); renderBreakdown(); });
  el.access?.addEventListener("change", () => { syncConsent(); render(); });
  [el.qty, el.colour, el.postal, el.block, el.unit].forEach((n) => n && n.addEventListener("input", renderBreakdown));
  fillColours(); syncConsent(); syncMode();

  $$("[data-pick-product]").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("data-pick-product");
    if (!byId(id) || !el.product) return;
    e.preventDefault();
    if (el.modeSingle) { el.modeSingle.checked = true; syncMode(); }
    el.product.value = id; fillColours(a.getAttribute("data-pick-colour") || ""); renderBreakdown();
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
    el.product.focus({ preventScroll: true });
    track("pick_product", { product: id });
  }));

  const setStatus = (msg, isErr) => {
    if (!el.status) return;
    el.status.replaceChildren(document.createTextNode(msg));
    el.status.classList.toggle("err", !!isErr);
  };
  if (el.copyBtn) el.copyBtn.addEventListener("click", async () => {
    const text = buildDetailsForClipboard({ block: el.block?.value, unit: el.unit?.value, postal: el.postal?.value });
    if (!text) { setStatus("Add your block, unit or postal code first.", true); return; }
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch { ok = false; }
    setStatus(ok ? "Copied — paste your address details inside the WhatsApp chat." : "Copy failed. Please type your block and unit in the chat.", !ok);
    track("copy_details", {});
  });
  const showError = (field, msg) => {
    const input = form.elements[field];
    const box = $(`[data-error-for="${field}"]`, form);
    if (input?.setAttribute) input.setAttribute("aria-invalid", "true");
    if (box) box.textContent = msg;
  };
  const clearErrors = () => {
    $$("[aria-invalid]", form).forEach((n) => n.removeAttribute("aria-invalid"));
    $$("[data-error-for]", form).forEach((n) => { n.textContent = ""; });
    if (el.status) { el.status.replaceChildren(); el.status.classList.remove("err"); }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();
    const mode = getMode();
    const needAuth = accessRequiresAuthorisation(accessKey(), PRICING.accessFees);
    const { result, items, fee } = currentResult();
    if (mode === "multiple" && items.length === 0) { setStatus("Your quote list is empty. Add at least one lock.", true); return; }

    const { valid, errors } = validateQuote({
      productId: el.product?.value, colour: el.colour?.value, quantity: el.qty?.value,
      postal: el.postal?.value, block: el.block?.value, unit: el.unit?.value, authorised: !!el.authorised?.checked,
    }, { validColours: coloursFor(el.product?.value, el.product?.selectedOptions?.[0]), requireAuthorisation: needAuth, requireProduct: mode === "single" });

    if (!valid) {
      Object.entries(errors).forEach(([f, m]) => showError(f, m));
      setStatus("Please fix the highlighted fields.", true);
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    const msg = buildQuoteMessage({
      items, result, accessLabel: accessMeta().label, accessFeePerUnit: fee,
      postal: el.postal?.value, timing: sanitizeText(el.timing?.value, 80),
      urgent: !!el.urgentFlag?.checked,
    });
    track("quote_submit", { mode, quantity: String(result.totalQty ?? result.quantity ?? 0), value: result.requiresQuote ? "written-quote" : String(result.total) });

    if (!SITE.whatsappNumber) { setStatus("WhatsApp is not configured yet. Please call us.", true); return; }
    const url = waLink(SITE.whatsappNumber, msg);
    let win = null;
    try { win = window.open(url, "_blank", "noopener,noreferrer"); } catch { win = null; }
    if (win) { try { win.opener = null; } catch {} return; }

    if (el.status) {
      el.status.replaceChildren();
      el.status.classList.remove("err");
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Tap here to open WhatsApp";
      const copy = document.createElement("button");
      copy.type = "button"; copy.className = "linkish"; copy.textContent = "Copy my quote instead";
      copy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(msg); setStatus("Quote copied. Paste it to us on WhatsApp or SMS.", false); }
        catch { setStatus(`Please call us at ${SITE.phoneDisplay}.`, true); }
      });
      const tel = document.createElement("a");
      tel.href = "tel:+" + SITE.phoneE164; tel.textContent = `or call ${SITE.phoneDisplay}`;
      el.status.append("WhatsApp did not open. ", a, " · ", copy, " · ", tel);
      a.focus();
    }
  });
}

const compareForm = $("#compareTable");
if (compareForm) {
  const boxes = $$("[data-compare]", compareForm);
  const note = $("#compareNote");
  const MAXC = 3;
  const apply = () => {
    const chosen = boxes.filter((b) => b.checked);
    if (chosen.length > MAXC) chosen[0].checked = false;
    const active = boxes.filter((b) => b.checked).map((b) => b.getAttribute("data-compare"));
    $$("tbody tr", compareForm).forEach((tr) => {
      const id = tr.getAttribute("data-row");
      tr.hidden = !(active.length === 0 || active.includes(id));
    });
    if (note) note.textContent = active.length === 0
      ? "Showing all nine models. Tick up to three to compare side by side."
      : `Comparing ${active.length} model${active.length > 1 ? "s" : ""}: ${active.join(", ")}.`;
    boxes.forEach((b) => { b.disabled = !b.checked && active.length >= MAXC; });
    track("compare", { quantity: String(active.length) });
  };
  boxes.forEach((b) => b.addEventListener("change", apply));
  const reset = $("#compareReset");
  if (reset) reset.addEventListener("click", () => { boxes.forEach((b) => { b.checked = false; b.disabled = false; }); apply(); });
}

const lightbox = $("#lightbox");
if (lightbox) {
  const img = $("#lightboxImg", lightbox);
  let lastFocus = null;
  const focusables = () => $$('button, [href], [tabindex]:not([tabindex="-1"])', lightbox);
  const open = (src, alt) => {
    lastFocus = document.activeElement;
    if (img && src) { img.src = src; img.alt = alt || ""; }
    if (typeof lightbox.showModal === "function") lightbox.showModal(); else lightbox.setAttribute("open", "");
    focusables()[0]?.focus();
  };
  const close = () => {
    if (typeof lightbox.close === "function") lightbox.close(); else lightbox.removeAttribute("open");
    lastFocus?.focus?.();
  };
  $$("[data-gallery-src]").forEach((b) => b.addEventListener("click", () => open(b.dataset.gallerySrc, b.getAttribute("data-gallery-alt"))));
  $$("[data-close]", lightbox).forEach((b) => b.addEventListener("click", close));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
  lightbox.addEventListener("cancel", () => { lastFocus?.focus?.(); });
  lightbox.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = focusables(); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}

const menuBtn = $(".menu"), linksNav = $(".links");
if (menuBtn && linksNav) {
  const setOpen = (o) => { linksNav.classList.toggle("open", o); menuBtn.setAttribute("aria-expanded", String(o)); };
  menuBtn.addEventListener("click", () => setOpen(!linksNav.classList.contains("open")));
  linksNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  if (typeof window !== "undefined") window.addEventListener("resize", () => { if (window.innerWidth > 860) setOpen(false); });
}

/* =============================================================================
 * render.mjs — shared, CSP-safe HTML fragments used by both builders.
 * ========================================================================== */
import { SITE, COLOURS, PRODUCTS, FOOTER_SERVICES, GUIDE_PAGES } from "./data.mjs";

const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230b1220'/%3E%3Ctext x='50' y='68' font-size='60' text-anchor='middle' fill='%232563eb'%3E%E2%96%A3%3C/text%3E%3C/svg%3E";

export const esc = (s) => String(s ?? "")
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
export const attr = (s) => String(s ?? "")
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

export const telHref = () => `tel:+${SITE.phoneE164}`;
export const waHref = (text) => `https://wa.me/${SITE.whatsappNumber}` + (text ? `?text=${encodeURIComponent(text)}` : "");
export const quoteHref = (rel = "") => `${rel}index.html#quote`;
export const money = (n) => `S$${n}`;

export const WA_GENERIC = "Hi, I'd like a written quote for a letterbox lock. I'll send a photo of the mailbox front.";
export const WA_URGENT  = "Hi, urgent: my letterbox is locked / jammed. Sending a photo and my postal sector now.";
export const WA_GROUP   = "Hi, I'd like a GROUP/BULK written quote for letterbox locks. Estate: ___ | Units: ___";

export const specValue = (v) => (v === null || v === undefined || v === "")
  ? `<span class="pending">Pending supplier confirmation</span>`
  : esc(String(v));

export function head({ title, description, canonicalPath, rel = "", extraLd = "", noindex = false }) {
  const url = SITE.baseUrl + canonicalPath;
  const ogImg = SITE.baseUrl + SITE.ogImage;
  const t = attr(title), d = attr(description);
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${d}">
<meta name="robots" content="${noindex ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1"}">
<meta name="theme-color" content="#0b1220">
<meta name="geo.region" content="SG"><meta name="geo.placename" content="Singapore">
<meta name="author" content="${attr(SITE.businessName)}">
<link rel="canonical" href="${attr(url)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_SG">
<meta property="og:site_name" content="${attr(SITE.businessName)}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${attr(url)}">
<meta property="og:image" content="${attr(ogImg)}">
<meta property="og:image:alt" content="${attr(SITE.businessName)} — WT letterbox and mailbox lock specialist">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${attr(ogImg)}">
<link rel="icon" href="${ICON}">
<link rel="apple-touch-icon" href="${ICON}">
<link rel="manifest" href="${rel}site.webmanifest">
<link rel="preconnect" href="https://wa.me" crossorigin>
<link rel="stylesheet" href="${rel}assets/css/site.css">${extraLd ? `\n<script type="application/ld+json">${extraLd}</script>` : ""}`;
}

export function header(rel = "") {
  const home = `${rel}index.html`;
  return `<a class="skip" href="#main">Skip to content</a>
<div class="top">WT letterbox &amp; mailbox locks · Supply + professional installation from S$60 · Lost-key opening from S$25 · Open 09:00–21:00 daily</div>
<header class="header">
  <div class="wrap nav">
    <a class="brand" href="${home}" aria-label="${attr(SITE.businessName)} home">
      <span class="mark" aria-hidden="true">▣</span>
      <span><strong>LETTERBOX LOCK</strong><small>SINGAPORE</small></span>
    </a>
    <nav class="links" id="primary-nav" aria-label="Primary">
      <a href="${home}#products">All 9 locks</a><a href="${rel}letterbox-lock-price/index.html">Cost</a><a href="${rel}letterbox-lock-installation/index.html">Installation</a><a href="${rel}wt-digital-letterbox-lock/index.html">WT digital</a><a href="${rel}lost-letterbox-key/index.html">Lost key</a><a href="${home}#reviews">Reviews</a><a href="${home}#faq">FAQ</a>
    </nav>
    <div class="actions">
      <a class="btn white" data-tel data-ev="call" href="${attr(telHref())}">Call</a>
      <a class="btn green" data-wa data-ev="whatsapp" href="${attr(waHref(WA_GENERIC))}" rel="noopener noreferrer">WhatsApp</a>
    </div>
    <a class="btn order header-order" data-ev="quote-nav" href="${attr(quoteHref(rel))}">Get a Written Quote</a>
    <button class="menu" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-nav">☰</button>
  </div>
</header>`;
}

export function footer(rel = "") {
  const services = FOOTER_SERVICES.map((s) => `      <a href="${rel}${s.slug}/index.html">${esc(s.label)}</a>`).join("\n");
  const guides = GUIDE_PAGES.map((g) => `<a href="${rel}${g.slug}/index.html">${esc(g.label)}</a>`).join("");
  const wa = attr(waHref(WA_GENERIC));
  const tel = attr(telHref());
  return `<footer class="footer">
  <div class="wrap footer-grid">
    <div>
      <a class="brand" href="${rel}index.html"><span class="mark mark-light" aria-hidden="true">▣</span>
        <span><strong>LETTERBOX LOCK</strong><small>SINGAPORE</small></span></a>
      <p class="mw-34">Singapore's dedicated letterbox and mailbox lock locksmith. We supply and professionally install WT letterbox locks for HDB, condo, landed and outdoor mailboxes. We do not service door, gate, car or safe locks.</p>
      <p class="mw-34 hours">Open 09:00–21:00 daily · ${esc(SITE.phoneDisplay)}</p>
    </div>
    <nav aria-label="Services"><strong>Services &amp; prices</strong>
${services}
    </nav>
    <nav aria-label="Guides"><strong>Guides &amp; company</strong>
      ${guides}<a href="${rel}about/index.html">About us</a><a href="${rel}index.html#areas">Service areas</a></nav>
    <nav aria-label="Legal and contact"><strong>Legal &amp; contact</strong>
      <a data-tel data-ev="call" href="${tel}" data-phone-display>Call us</a><a data-wa data-ev="whatsapp" href="${wa}" rel="noopener noreferrer">WhatsApp</a>
      <a href="${rel}privacy-policy/index.html">Privacy Policy</a><a href="${rel}terms/index.html">Terms</a><a href="${rel}warranty/index.html">Warranty</a><a href="${rel}cancellation/index.html">Cancellation</a></nav>
  </div>
  <div class="copy">© <span id="yr">2026</span> ${esc(SITE.businessName)} · Website estimates are indicative; the final price is confirmed in writing before work begins.</div>
</footer>
<div class="sticky-mobile">
  <a data-tel data-ev="call" href="${tel}">Call</a>
  <a data-wa data-ev="whatsapp" href="${wa}" rel="noopener noreferrer">WhatsApp</a>
  <a class="sm-order" data-ev="quote-nav" href="${attr(quoteHref(rel))}">Quote<span class="sm-count" id="quoteCount" hidden>0</span></a>
</div>
<noscript><div class="wrap ns-wrap"><p class="noscript-note">JavaScript is off, so the live estimate is disabled. All products, prices and policies above are fully readable. To get a written quote, WhatsApp or call ${esc(SITE.phoneDisplay)}.</p></div></noscript>`;
}

export const scripts = (rel = "") => `<script type="module" src="${rel}assets/js/app.mjs"></script>`;

export function comparisonTable(rel = "", anchorToPage = true) {
  const rows = PRODUCTS.map((p) => {
    const s = p.specs;
    const link = anchorToPage ? `${rel}products/index.html#${attr(p.id)}` : `#${attr(p.id)}`;
    return `      <tr data-row="${attr(p.id)}">
        <th scope="row"><a href="${link}">${esc(p.id)} ${esc(p.name)}</a></th>
        <td data-label="From">${money(p.price)}</td>
        <td data-label="Access">${esc(s.access)}</td>
        <td data-label="Battery">${esc(s.battery)}</td>
        <td data-label="Code digits">${s.codeDigits ? esc(String(s.codeDigits)) : "—"}</td>
        <td data-label="Backup key">${esc(s.backupAccess)}</td>
      </tr>`;
  }).join("\n");
  return `<div class="table-scroll"><table class="compare">
    <caption>All nine WT models compared — price includes supply and professional installation.</caption>
    <thead><tr>
      <th scope="col">Model</th><th scope="col">From</th><th scope="col">Access</th><th scope="col">Battery</th>
      <th scope="col">Code digits</th><th scope="col">Backup key</th>
    </tr></thead>
    <tbody>
${rows}
    </tbody>
  </table></div>`;
}

/** Cost table for the price page — figures derived from SITE.costScenarios. */
export function costTable() {
  const rows = SITE.costScenarios.map((c) => `      <tr>
        <th scope="row">${esc(c.h)}<span class="cost-detail">${esc(c.detail)}</span></th>
        <td data-label="From"><b>${money(c.from)}</b></td>
        <td data-label="What that covers">${esc(c.note)}</td>
      </tr>`).join("\n");
  return `<div class="table-scroll"><table class="compare cost">
    <caption>Typical letterbox and mailbox lock costs in Singapore. Every figure covers supply and professional installation unless stated.</caption>
    <thead><tr><th scope="col">Job</th><th scope="col">From</th><th scope="col">What that covers</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table></div>`;
}

export function runtimeData() {
  return JSON.stringify({
    site: {
      phoneE164: SITE.phoneE164, phoneDisplay: SITE.phoneDisplay, whatsappNumber: SITE.whatsappNumber,
      pricing: SITE.pricing,
      analytics: { enabled: !!SITE.analytics?.enabled, endpoint: SITE.analytics?.endpoint || "" },
    },
    colours: COLOURS,
    products: PRODUCTS.map((p) => ({ id: p.id, name: p.name, price: p.price, colours: p.colours, categories: p.categories })),
  }).replace(/</g, "\\u003c");
}

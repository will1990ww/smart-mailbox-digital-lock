/* =============================================================================
 * render.mjs — shared, CSP-safe HTML fragments used by build.mjs & build-pages.mjs
 * ========================================================================== */
import { SITE, COLOURS, PRODUCTS, FOOTER_SERVICES } from "./data.mjs";

const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230b1220'/%3E%3Ctext x='50' y='68' font-size='60' text-anchor='middle' fill='%232563eb'%3E%E2%96%A3%3C/text%3E%3C/svg%3E";

export function esc(s) {
  return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
export function attr(s) {
  return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
export const telHref = () => `tel:+${SITE.phoneE164}`;
export const waHref = (text) => `https://wa.me/${SITE.whatsappNumber}` + (text ? `?text=${encodeURIComponent(text)}` : "");
export const orderHref = (rel = "") => `${rel}index.html#order`;

export function head({ title, description, canonicalPath, rel = "", extraLd = "" }) {
  const url = SITE.baseUrl + canonicalPath;
  const ogImg = SITE.baseUrl + SITE.ogImage;
  const t = attr(title), d = attr(description);
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${d}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<meta name="theme-color" content="#0b1220">
<meta name="format-detection" content="telephone=no">
<meta name="geo.region" content="SG"><meta name="geo.placename" content="Singapore">
<meta name="author" content="${attr(SITE.businessName)}">
<link rel="canonical" href="${attr(url)}">
<link rel="alternate" hreflang="en-sg" href="${attr(url)}">
<link rel="alternate" hreflang="x-default" href="${attr(url)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_SG">
<meta property="og:site_name" content="${attr(SITE.businessName)}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${attr(url)}">
<meta property="og:image" content="${attr(ogImg)}">
<meta property="og:image:alt" content="${attr(SITE.businessName)} — HDB & condo letterbox lock replacement">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${attr(ogImg)}">
<link rel="icon" href="${ICON}">
<link rel="apple-touch-icon" href="${ICON}">
<link rel="manifest" href="${rel}site.webmanifest">
<link rel="preconnect" href="https://wa.me" crossorigin>
<link rel="preload" as="style" href="${rel}assets/css/site.css">
<link rel="stylesheet" href="${rel}assets/css/site.css">${extraLd ? `\n<script type="application/ld+json">${extraLd}</script>` : ""}`;
}

export function header(rel = "") {
  const home = `${rel}index.html`;
  const link = (hash, label) => `<a href="${home}#${hash}">${esc(label)}</a>`;
  const wa = attr(waHref("Hi, I'd like a quote for a letterbox lock. My postal district is __."));
  const order = attr(orderHref(rel));
  return `<a class="skip" href="#main">Skip to content</a>
<div class="top">Islandwide Singapore service · Letterbox lock installation from S$50 · Lost-key unlocking from S$25</div>
<header class="header">
  <div class="wrap nav">
    <a class="brand" href="${home}" aria-label="${attr(SITE.businessName)} home">
      <span class="mark" aria-hidden="true">▣</span>
      <span><strong>LETTERBOX LOCK</strong><small>SINGAPORE</small></span>
    </a>
    <nav class="links" id="primary-nav" aria-label="Primary">
      ${link("products","Products")}${link("why","Why us")}${link("reviews","Reviews")}
      ${link("group","Group buyers")}${link("areas","Areas")}${link("faq","FAQ")}
    </nav>
    <div class="actions">
      <a class="btn white" data-tel href="${attr(telHref())}">Call</a>
      <a class="btn green" data-wa href="${wa}" rel="noopener noreferrer">WhatsApp</a>
    </div>
    <a class="btn order header-order" href="${order}" aria-label="Order or get a quote">🔒 Order</a>
    <button class="menu" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-nav">☰</button>
  </div>
</header>`;
}

export function footer(rel = "") {
  const services = FOOTER_SERVICES.map((s) => `      <a href="${rel}${s.slug}/">${esc(s.label)}</a>`).join("\n");
  const company = `<a href="${rel}index.html#why">Why us</a><a href="${rel}index.html#reviews">Reviews</a><a href="${rel}index.html#areas">Service areas</a><a href="${rel}index.html#faq">FAQ</a>`;
  const wa = attr(waHref("Hi, I'd like a quote for a letterbox lock. My postal district is __."));
  const tel = attr(telHref());
  const order = attr(orderHref(rel));
  return `<footer class="footer">
  <div class="wrap footer-grid">
    <div>
      <a class="brand" href="${rel}index.html"><span class="mark mark-light" aria-hidden="true">▣</span>
        <span><strong>LETTERBOX LOCK</strong><small>SINGAPORE</small></span></a>
      <p class="mw-34">Professional supply, unlocking and installation for HDB and condominium letterbox locks across Singapore. From S$50.</p>
    </div>
    <nav aria-label="Services"><strong>Services</strong>
${services}
    </nav>
    <nav aria-label="Company"><strong>Company</strong>
      ${company}</nav>
    <nav aria-label="Legal &amp; contact"><strong>Legal &amp; contact</strong>
      <a data-tel href="${tel}" data-phone-display>Call us</a><a data-wa href="${wa}" rel="noopener noreferrer">WhatsApp</a>
      <a href="${rel}privacy-policy/">Privacy Policy</a><a href="${rel}terms/">Terms</a><a href="${rel}warranty/">Warranty</a><a href="${rel}cancellation/">Cancellation</a></nav>
  </div>
  <div class="copy">© <span id="yr"></span> ${esc(SITE.businessName)} · Islandwide letterbox &amp; mailbox lock replacement · Prices subject to written confirmation.</div>
</footer>
<a class="floating" data-wa href="${wa}" rel="noopener noreferrer" aria-label="WhatsApp us">WA</a>
<div class="sticky-mobile">
  <a data-tel href="${tel}">Call</a>
  <a data-wa href="${wa}" rel="noopener noreferrer">WhatsApp</a>
  <a class="sm-order" href="${order}">Order</a>
</div>
<noscript><div class="wrap ns-wrap"><p class="noscript-note">JavaScript is off, so the live estimate and one-tap WhatsApp handoff are disabled. All products, prices, reviews and FAQs above are fully readable. To order, WhatsApp us at ${esc(SITE.phoneDisplay)}.</p></div></noscript>`;
}

export function scripts(rel = "") {
  return `<script type="module" src="${rel}assets/js/app.mjs"></script>`;
}

export function runtimeData() {
  const data = {
    site: { phoneE164: SITE.phoneE164, phoneDisplay: SITE.phoneDisplay, whatsappNumber: SITE.whatsappNumber, pricing: SITE.pricing },
    colours: COLOURS,
    products: PRODUCTS.map((p) => ({ id: p.id, name: p.name, price: p.price, colours: p.colours, categories: p.categories })),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

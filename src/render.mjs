/* =============================================================================
 * render.mjs — shared rendering helpers (escaping, chrome, JSON-LD).
 * Used by build.mjs (home) and build-pages.mjs (service/legal pages) so header,
 * footer, escaping and structured data have ONE definition.
 * ========================================================================== */
import { SITE, COLOURS, PRODUCTS, FAQS, REVIEWS, SERVICE_PAGES } from "./data.mjs";

export const esc = (s) => String(s)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
export const attr = (s) => esc(s);
export const SAFE_HEX = /^#[0-9a-fA-F]{6}$/;
export const safeColour = (hex) => (SAFE_HEX.test(hex) ? hex : "#cccccc");
export const money = (n) => "S$" + n;

export const LOCK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="1.6" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4" fill="#7dd3fc"/></svg>';
export const IMG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-5 4 4 3-3 4 4"/></svg>';

/** <head> block shared by all pages. `rel` is the path prefix ("" for root, "../" for sub-pages). */
export function head({ title, description, canonicalPath = "/", rel = "", extraLd = null }) {
  const B = SITE.baseUrl;
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#0b1220">
<meta name="geo.region" content="SG"><meta name="geo.placename" content="Singapore">
<link rel="canonical" href="${B}${canonicalPath}">
<link rel="alternate" hreflang="en-sg" href="${B}${canonicalPath}">
<link rel="alternate" hreflang="x-default" href="${B}${canonicalPath}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${attr(SITE.businessName)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${B}${canonicalPath}">
<meta property="og:image" content="${B}${SITE.ogImage}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230b1220'/%3E%3Ctext x='50' y='68' font-size='60' text-anchor='middle' fill='%232563eb'%3E%E2%96%A3%3C/text%3E%3C/svg%3E">
<link rel="manifest" href="${rel}site.webmanifest">
<link rel="preconnect" href="https://wa.me">
<link rel="stylesheet" href="${rel}assets/css/site.css">${extraLd ? `\n<script type="application/ld+json">${extraLd}</script>` : ""}`;
}

export function header(rel = "") {
  return `<a class="skip" href="#main">Skip to content</a>
<div class="top">Islandwide Singapore service · Letterbox lock installation from S$50 · Lost-key unlocking from S$25</div>
<header class="header">
  <div class="wrap nav">
    <a class="brand" href="${rel}index.html" aria-label="${attr(SITE.businessName)} home">
      <span class="mark" aria-hidden="true">▣</span>
      <span><strong>LETTERBOX LOCK</strong><small>SINGAPORE</small></span>
    </a>
    <button class="menu" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-nav">☰</button>
    <nav class="links" id="primary-nav" aria-label="Primary">
      <a href="${rel}index.html#products">Products</a><a href="${rel}index.html#why">Why us</a><a href="${rel}index.html#reviews">Reviews</a>
      <a href="${rel}index.html#group">Group buyers</a><a href="${rel}index.html#areas">Areas</a><a href="${rel}index.html#faq">FAQ</a>
    </nav>
    <div class="actions">
      <a class="btn white" data-tel href="#">Call</a>
      <a class="btn green" data-wa href="#" rel="noopener noreferrer">WhatsApp quote</a>
    </div>
  </div>
</header>`;
}

export function footer(rel = "") {
  return `<footer class="footer">
  <div class="wrap footer-grid">
    <div>
      <a class="brand" href="${rel}index.html"><span class="mark mark-light" aria-hidden="true">▣</span>
        <span><strong>LETTERBOX LOCK</strong><small>SINGAPORE</small></span></a>
      <p class="mw-34">Professional supply, unlocking and installation for HDB and condominium letterbox locks across Singapore. From S$50.</p>
      <p class="legal-line">${esc(SITE.legal.entityName)} · UEN ${esc(SITE.legal.uen)}</p>
    </div>
    <nav aria-label="Services"><strong>Services</strong>
      ${SERVICE_PAGES.map((s) => `<a href="${rel}${s.slug}/">${esc(s.h1.length > 34 ? s.title.split("|")[0].trim() : s.h1)}</a>`).join("\n      ")}
    </nav>
    <nav aria-label="Company"><strong>Company</strong>
      <a href="${rel}index.html#why">Why us</a><a href="${rel}index.html#reviews">Reviews</a><a href="${rel}index.html#areas">Service areas</a><a href="${rel}index.html#faq">FAQ</a></nav>
    <nav aria-label="Legal & contact"><strong>Legal & contact</strong>
      <a data-tel href="#" data-phone-display>Call us</a><a data-wa href="#" rel="noopener noreferrer">WhatsApp</a>
      <a href="${rel}privacy-policy/">Privacy Policy</a><a href="${rel}terms/">Terms</a><a href="${rel}warranty/">Warranty</a><a href="${rel}cancellation/">Cancellation</a></nav>
  </div>
  <div class="copy">© <span id="yr"></span> ${esc(SITE.legal.entityName)} (UEN ${esc(SITE.legal.uen)}) · Islandwide letterbox &amp; mailbox lock replacement · Prices subject to written confirmation.</div>
</footer>
<a class="floating" data-wa href="#" rel="noopener noreferrer" aria-label="WhatsApp us">WA</a>
<div class="sticky-mobile">
  <a data-tel href="#">Call now</a>
  <a data-wa href="#" rel="noopener noreferrer">WhatsApp quote</a>
</div>`;
}

export function scripts(rel = "") {
  return `<script type="module" src="${rel}assets/js/app.mjs"></script>`;
}

/** One canonical JSON-LD graph for the homepage. */
export function homeJsonLd() {
  const B = SITE.baseUrl;
  const graph = [
    {
      "@type": ["LocalBusiness", "Locksmith", "HomeAndConstructionBusiness"],
      "@id": `${B}/#business`,
      name: SITE.businessName, alternateName: SITE.alternateName, legalName: SITE.legal.entityName,
      image: B + SITE.ogImage, logo: B + SITE.logo, url: B + "/",
      telephone: SITE.phoneDisplay, email: SITE.legal.contactEmail,
      priceRange: "S$25–S$200", currenciesAccepted: SITE.currency, paymentAccepted: SITE.payment,
      description: "HDB and condo letterbox lock replacement, lost-key unlocking and keyless smart installation across Singapore. Standard installation from S$50, unlocking from S$25.",
      slogan: SITE.slogan,
      address: { "@type": "PostalAddress", addressCountry: "SG", addressRegion: "Singapore", addressLocality: "Singapore" },
      geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
      areaServed: [{ "@type": "Country", name: "Singapore" }],
      openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: SITE.openingHours.opens, closes: SITE.openingHours.closes }],
      contactPoint: { "@type": "ContactPoint", telephone: SITE.phoneDisplay, contactType: "customer service", areaServed: "SG", availableLanguage: SITE.languages },
      sameAs: [SITE.reviewSourceUrl, `https://wa.me/${SITE.whatsappNumber}`],
      aggregateRating: { "@type": "AggregateRating", ratingValue: String(SITE.rating.value), reviewCount: String(SITE.rating.count), bestRating: String(SITE.rating.best) },
      hasOfferCatalog: { "@type": "OfferCatalog", name: "Letterbox lock products", itemListElement: PRODUCTS.map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Product", name: p.name }, priceCurrency: "SGD", price: String(p.price) })) },
      review: REVIEWS.map((r) => ({ "@type": "Review", reviewRating: { "@type": "Rating", ratingValue: String(r.stars), bestRating: "5" }, author: { "@type": "Person", name: r.name }, datePublished: r.date, reviewBody: r.text })),
    },
    { "@type": "WebSite", "@id": `${B}/#website`, url: B + "/", name: SITE.businessName, inLanguage: "en-SG", publisher: { "@id": `${B}/#business` } },
    { "@type": "Service", "@id": `${B}/#service`, serviceType: "Letterbox lock replacement and installation", provider: { "@id": `${B}/#business` }, areaServed: { "@type": "Country", name: "Singapore" }, offers: { "@type": "Offer", priceCurrency: "SGD", price: "50", priceSpecification: { "@type": "PriceSpecification", minPrice: "25", maxPrice: "200", priceCurrency: "SGD" } } },
    { "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Home", item: B + "/" }, { "@type": "ListItem", position: 2, name: "Products", item: B + "/#products" }, { "@type": "ListItem", position: 3, name: "Reviews", item: B + "/#reviews" } ] },
    { "@type": "FAQPage", "@id": `${B}/#faq`, mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

/** Runtime data island (safe: parsed with JSON.parse; <\/script> neutralised). */
export function runtimeData() {
  return JSON.stringify({
    site: { phoneE164: SITE.phoneE164, phoneDisplay: SITE.phoneDisplay, whatsappNumber: SITE.whatsappNumber, pricing: SITE.pricing },
    colours: COLOURS,
    products: PRODUCTS.map((p) => ({ id: p.id, name: p.name, price: p.price, colours: p.colours, categories: p.categories })),
  }).replaceAll("<", "\\u003c");
}

/* =============================================================================
 * build.mjs — generate the homepage (index.html) from the single source of truth.
 * Launch-guard: refuses fabricated ratings. CSP-safe. Images lazy + sized (no CLS).
 * ========================================================================== */
import { writeFileSync } from "node:fs";
import { SITE, COLOURS, PRODUCTS, UPCOMING, FAQS, KNOWLEDGE, AREAS, REVIEWS } from "./src/data.mjs";
import { esc, attr, head, header, footer, scripts, runtimeData, waHref, telHref } from "./src/render.mjs";

const B = SITE.baseUrl;
const root = new URL("./", import.meta.url);

if (!SITE.rating.verified) { console.error("✗ build aborted: SITE.rating.verified is false."); process.exit(1); }
const realCount = REVIEWS.length;
const realAvg = Math.round((REVIEWS.reduce((s, r) => s + r.stars, 0) / realCount) * 10) / 10;
const RATING = { value: realAvg, count: realCount, best: SITE.rating.best };

const money = (n) => `S$${n}`;
const swatch = (code) => `<span class="swatch"><i class="dot dot-${esc(code)}"></i>${esc(COLOURS[code]?.label || code)}</span>`;
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

function productCard(p) {
  const cat = p.categories[0];
  const pop = p.popular ? `<span class="tagpop">Most popular</span>` : "";
  const colours = p.colours.map(swatch).join("");
  const feats = p.features.map((f) => `<li>${esc(f)}</li>`).join("");
  const wa = attr(waHref(`Hi, I'd like a quote for the ${p.id} ${p.name} (from ${money(p.price)}). My block/unit is __ and postal district is __.`));
  return `        <article class="prod" data-categories="${attr(p.categories.join(","))}">
      <div class="thumb">${pop}<span class="tagcat">${esc(cat)}</span>
        <img src="${attr(p.image)}" alt="${attr(p.imageAlt)}" width="600" height="600" loading="lazy" decoding="async">
</div>
      <div class="body">
        <span class="code">${esc(p.id)}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="colours">${colours}</div>
        <ul class="feat">${feats}</ul>
        <div class="foot"><div><small>Supply + install from</small><strong>${money(p.price)}</strong></div></div>
        <div class="actions-2">
          <a class="btn blue" href="#order" data-scroll-product="${attr(p.id)}" data-scroll-colour="${attr(p.colours[0])}">Select &amp; configure</a>
          <a class="btn ghost" href="${wa}" data-wa-product="${attr(p.id)}" rel="noopener noreferrer">Quick WhatsApp quote</a>
        </div>
      </div></article>`;
}
function soonCard(u) {
  const wa = attr(waHref(`Hi, please notify me when the ${u.id} ${u.name} is available.`));
  const feats = u.features.map((f) => `<li>${esc(f)}</li>`).join("");
  return `        <article class="soon-card" data-categories="smart">
      <span class="tag">Coming soon</span><span class="model">${esc(u.id)}</span>
      <h3>${esc(u.id)} · ${esc(u.name)}</h3><p>${esc(u.desc)}</p>
      <ul>${feats}</ul>
      <a class="notify" href="${wa}" data-wa-product="${attr(u.id)}" rel="noopener noreferrer">Notify me when available</a>
    </article>`;
}
function galleryCells() {
  const kinds = ["HDB","HDB","condo","HDB","keyless","condo","HDB","smart","HDB","condo","keyless","HDB"];
  let out = "";
  for (let i = 1; i <= 12; i++) {
    const n = String(i).padStart(2, "0");
    const src = `assets/img/gallery/job-${n}.jpg`;
    const alt = `Completed ${kinds[i - 1]} letterbox lock installation ${i}`;
    out += `        <button class="cell" type="button" data-gallery-src="${attr(src)}" aria-label="Installation photo ${i}"><img src="${attr(src)}" alt="${attr(alt)}" width="400" height="400" loading="lazy" decoding="async"></button>\n`;
  }
  return out.trimEnd();
}
function reviewCard(r) {
  const initial = esc(r.name.charAt(0));
  return `        <figure class="review">
      <div class="stars" aria-label="${r.stars} out of 5 stars">${stars(r.stars)}</div>
      <blockquote><p>${esc(r.text)}</p></blockquote>
      <figcaption class="who"><span class="av" aria-hidden="true">${initial}</span>
      <span><b>${esc(r.name)}</b><span>${esc(r.loc)} · ${esc(r.date)}</span></span></figcaption>
    </figure>`;
}
function graphLd() {
  const dn = { Mo:"Monday",Tu:"Tuesday",We:"Wednesday",Th:"Thursday",Fr:"Friday",Sa:"Saturday",Su:"Sunday" };
  const graph = [
    {
      "@type": ["LocalBusiness","Locksmith","HomeAndConstructionBusiness"], "@id": `${B}/#business`,
      name: SITE.businessName, alternateName: SITE.alternateName, image: B + SITE.ogImage, logo: B + SITE.logo, url: `${B}/`,
      telephone: SITE.phoneDisplay, priceRange: "S$25–S$200", currenciesAccepted: SITE.currency, paymentAccepted: SITE.payment,
      description: "HDB and condo letterbox lock replacement, lost-key unlocking and keyless smart installation across Singapore. Standard installation from S$50, unlocking from S$25.",
      slogan: SITE.slogan,
      address: { "@type": "PostalAddress", addressCountry: "SG", addressRegion: "Singapore", addressLocality: "Singapore" },
      geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
      areaServed: [{ "@type": "Country", name: "Singapore" }],
      openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: SITE.openingHours.days.map((d) => dn[d]), opens: SITE.openingHours.opens, closes: SITE.openingHours.closes }],
      contactPoint: { "@type": "ContactPoint", telephone: SITE.phoneDisplay, contactType: "customer service", areaServed: "SG", availableLanguage: SITE.languages },
      sameAs: [SITE.reviewSourceUrl, `https://wa.me/${SITE.whatsappNumber}`],
      aggregateRating: { "@type": "AggregateRating", ratingValue: String(RATING.value), reviewCount: String(RATING.count), bestRating: String(RATING.best) },
      hasOfferCatalog: { "@type": "OfferCatalog", name: "Letterbox lock products", itemListElement: PRODUCTS.map((p) => ({ "@type": "Offer", itemOffered: { "@type": "Product", name: p.name }, priceCurrency: "SGD", price: String(p.price) })) },
      review: REVIEWS.map((r) => ({ "@type": "Review", reviewRating: { "@type": "Rating", ratingValue: String(r.stars), bestRating: "5" }, author: { "@type": "Person", name: r.name }, datePublished: r.date, reviewBody: r.text })),
    },
    { "@type": "WebSite", "@id": `${B}/#website`, url: `${B}/`, name: SITE.businessName, inLanguage: "en-SG", publisher: { "@id": `${B}/#business` } },
    { "@type": "Service", "@id": `${B}/#service`, serviceType: "Letterbox lock replacement and installation", provider: { "@id": `${B}/#business` }, areaServed: { "@type": "Country", name: "Singapore" }, offers: { "@type": "Offer", priceCurrency: "SGD", price: "50", priceSpecification: { "@type": "PriceSpecification", minPrice: "25", maxPrice: "200", priceCurrency: "SGD" } } },
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${B}/` },
      { "@type": "ListItem", position: 2, name: "Products", item: `${B}/#products` },
      { "@type": "ListItem", position: 3, name: "Reviews", item: `${B}/#reviews` },
    ] },
    { "@type": "FAQPage", "@id": `${B}/#faq`, mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

const productOptions = PRODUCTS.map((p) => `<option value="${attr(p.id)}" data-colours="${attr(p.colours.join(","))}">${esc(p.id)} · ${esc(p.name)} (${money(p.price)})</option>`).join("");
const firstColourOptions = (PRODUCTS[0].colours || ["SILVER"]).map((c) => `<option value="${attr(c)}">${esc(COLOURS[c]?.label || c)}</option>`).join("");
const productsHtml = PRODUCTS.map(productCard).join("\n") + "\n" + UPCOMING.map(soonCard).join("\n");
const knowledgeHtml = KNOWLEDGE.map((k) => `        <div class="info-card"><h3>${esc(k.h)}</h3><p>${esc(k.p)}</p></div>`).join("\n");
const reviewsHtml = REVIEWS.map(reviewCard).join("\n");
const areasHtml = AREAS.map((a) => `<span>${esc(a)}</span>`).join("");
const faqHtml = FAQS.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");

const html = `<!doctype html>
<html lang="en-SG">
<head>
${head({
  title: "HDB & Condo Letterbox Lock Replacement Singapore | from S$50",
  description: "HDB & condo letterbox lock replacement, lost-key unlocking and smart keyless installation across Singapore. Installation from S$50. Photo-first written quote on WhatsApp.",
  canonicalPath: "/", rel: "", extraLd: graphLd(),
})}
</head>
<body>
${header("")}
<main id="main">
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <span class="label">✓ HDB &amp; CONDO LETTERBOX LOCK SPECIALIST</span>
        <h1>HDB &amp; Condo Letterbox Lock Replacement <span>in Singapore</span></h1>
        <p class="lead">Lost-key unlocking, mailbox lock replacement and smart keyless upgrades — nine models with clear installed prices and islandwide appointments. Photo-first written quote.</p>
        <div class="hero-actions">
          <a class="btn order btn-lg" href="#order">🔒 Order now</a>
          <a class="btn blue" href="#products">Compare all 9 locks</a>
        </div>
        <div class="proof">
          <span><i>✓</i> From S$50 installed</span>
          <span><i>✓</i> Unlocking from S$25</span>
          <span><i>✓</i> ${RATING.value}★ · ${RATING.count} reviews</span>
        </div>
      </div>
      <div class="visual">
        <div class="visual-in">
          <div class="visual-top"><span>Most popular</span><span class="pill">NO BATTERY</span></div>
          <h2 class="fs-13">Battery-Free Mechanical</h2>
          <div class="dial" aria-hidden="true"><b>3</b><b>8</b><b>5</b></div>
          <div class="price"><div><small>Supply + standard installation</small><strong>S$50</strong></div>
            <a class="btn white" href="#order">Order</a></div>
        </div>
      </div>
    </div>
  </section>
  <section class="trustbar"><div class="wrap trustgrid">
    <div><b>9 models</b><span>key, mechanical &amp; smart</span></div>
    <div><b>S$50</b><span>installation from</span></div>
    <div><b>S$25</b><span>unlocking from</span></div>
    <div><b>Islandwide</b><span>Singapore service</span></div>
  </div></section>
  <section class="section white">
    <div class="wrap">
      <span class="eyebrow">Singapore's letterbox lock specialist</span>
      <h2>Fast, affordable HDB &amp; condo letterbox lock replacement</h2>
      <p class="section-intro">If your letterbox key is lost, your mailbox lock is jammed, or you want a more secure keyless upgrade, we install and replace HDB and condominium letterbox locks (also spelt letter box locks) across Singapore. Choose from traditional key, battery-free combination code, and electronic smart digital PIN models. Every job starts with a photo and a clear written price. Standard supply and installation starts from S$50, lost-key unlocking from S$25, with nine models up to S$85.</p>
    </div>
  </section>
  <section class="section" id="products">
    <div class="wrap">
      <span class="eyebrow">All lock models &amp; prices</span>
      <div class="section-head">
        <div><h2>Compare all 9 letterbox locks</h2>
          <p class="section-intro">Choose by access method, battery preference and budget. Starting prices include standard supply and installation.</p></div>
        <div class="filter-row" role="group" aria-label="Filter products">
          <button type="button" data-filter="all" aria-pressed="true">All 9</button>
          <button type="button" data-filter="key" aria-pressed="false">Key</button>
          <button type="button" data-filter="mechanical" aria-pressed="false">Mechanical</button>
          <button type="button" data-filter="smart" aria-pressed="false">Smart</button>
        </div>
      </div>
      <div class="catalog-grid" id="productGrid">
${productsHtml}
      </div>
      <p class="fine">Starting prices assume a compatible, accessible mailbox. Lost-key opening is additional (from S$25). Final price is confirmed in writing.</p>
    </div>
  </section>
  <section class="section white" id="gallery">
    <div class="wrap">
      <span class="eyebrow">Installation gallery</span>
      <h2>See the finish before you choose</h2>
      <p class="section-intro">Real completed HDB and condo letterbox lock installations across Singapore.</p>
      <div class="gallery-grid" id="galleryGrid">
${galleryCells()}
      </div>
    </div>
  </section>
  <section class="section" id="learn">
    <div class="wrap">
      <span class="eyebrow">Before you book</span>
      <h2>Compatibility, timing, warranty &amp; pricing</h2>
      <p class="section-intro">Useful details so you know exactly what to expect — no surprises on the day.</p>
      <div class="info-grid">
${knowledgeHtml}
      </div>
    </div>
  </section>
  <section class="section white" id="why">
    <div class="wrap">
      <span class="eyebrow">Why residents choose us</span>
      <h2>The trusted choice for letterbox locks in Singapore</h2>
      <div class="why-grid">
        <div class="why-card"><div class="ic" aria-hidden="true">⚡</div><h3>Same-day service</h3><p>Fast islandwide appointments — many jobs completed the same day you message us.</p></div>
        <div class="why-card"><div class="ic" aria-hidden="true">💰</div><h3>Transparent pricing</h3><p>Written quote before we start. Lock, labour and any surcharge shown separately.</p></div>
        <div class="why-card"><div class="ic" aria-hidden="true">🔧</div><h3>Specialist, not generalist</h3><p>We focus only on letterbox &amp; mailbox locks, so we carry the right parts for HDB and condo doors.</p></div>
        <div class="why-card"><div class="ic" aria-hidden="true">🛡️</div><h3>Warranty backed</h3><p>Selected installed models come with a 1-year workmanship warranty.</p></div>
        <div class="why-card"><div class="ic" aria-hidden="true">📷</div><h3>Photo-first quotes</h3><p>Send one photo on WhatsApp and get an accurate price in minutes.</p></div>
        <div class="why-card"><div class="ic" aria-hidden="true">⭐</div><h3>${RATING.value}★ from ${RATING.count} reviews</h3><p>Singapore households and MCSTs served with consistently high ratings.</p></div>
      </div>
    </div>
  </section>
  <section class="section" id="how">
    <div class="wrap two">
      <div>
        <span class="eyebrow">How it works</span>
        <h2>Photo first. Clear price. Clean installation.</h2>
        <div class="feature-list">
          <div class="mini"><strong>1. Send a photo</strong><p>Show the lock, mailbox door and whether it is open or locked.</p></div>
          <div class="mini"><strong>2. Confirm model</strong><p>We confirm compatibility, colour, access method and price.</p></div>
          <div class="mini"><strong>3. Book a slot</strong><p>Share your block, unit, postal district and preferred time.</p></div>
          <div class="mini"><strong>4. Install and test</strong><p>The lock is fitted, adjusted and demonstrated.</p></div>
        </div>
      </div>
      <div class="steps"><ol>
        <li><strong>Transparent scope</strong><p>Lock, labour, unlocking and surcharges shown separately.</p></li>
        <li><strong>Authorised access</strong><p>Proof of residence is required on site before we open any locked mailbox.</p></li>
        <li><strong>Functional testing</strong><p>Alignment and operation checked before completion.</p></li>
        <li><strong>After-sales record</strong><p>Keep the model and warranty confirmation.</p></li>
      </ol></div>
    </div>
  </section>
  <section class="section group-sec" id="group">
    <div class="wrap"><div class="group-inner">
      <div>
        <span class="eyebrow">Group &amp; bulk orders</span>
        <h2>Ordering for a whole block or condo? Save more together.</h2>
        <p class="lead2">Managing agents, MCSTs, town councils and neighbours upgrading multiple letterboxes at once enjoy group pricing, one coordinated appointment and a single consolidated invoice.</p>
        <div class="tier-grid">
          <div class="tier"><b>5+</b><span>units · 5% off</span></div>
          <div class="tier"><b>10+</b><span>units · 10% off</span></div>
          <div class="tier"><b>20+</b><span>units · written quote</span></div>
        </div>
      </div>
      <div class="group-card">
        <h3>Get a group quote</h3>
        <p class="muted-sm">Tell us how many letterboxes and your estate — we reply with a bulk price.</p>
        <ul>
          <li><i>✓</i> Volume discount from 5 units</li>
          <li><i>✓</i> One scheduled visit, minimal disruption</li>
          <li><i>✓</i> Single invoice for MCST / town council</li>
          <li><i>✓</i> Priority islandwide slots</li>
        </ul>
        <a class="btn green btn-block" data-wa-group href="${attr(waHref("Hi, I'd like a GROUP/BULK quote for letterbox locks. Estate: ___ | Units: ___ | Postal district: __"))}" rel="noopener noreferrer">Request group quote on WhatsApp</a>
        <div class="mt-12"><a class="btn white btn-block" data-tel href="${attr(telHref())}">Call us</a></div>
      </div>
    </div></div>
  </section>
  <section class="section" id="reviews">
    <div class="wrap">
      <span class="eyebrow">Customer reviews</span>
      <h2>What Singapore residents say</h2>
      <p class="section-intro">Feedback from HDB and condo customers across the island. Average rating ${RATING.value} out of 5 from ${RATING.count} verified reviews.</p>
      <div class="reviews-grid" id="reviewsGrid">
${reviewsHtml}
      </div>
      <p class="review-src"><a href="${attr(SITE.reviewSourceUrl)}" rel="noopener noreferrer nofollow" target="_blank">Read and verify these reviews at our review profile →</a></p>
    </div>
  </section>
  <section class="section white" id="areas">
    <div class="wrap">
      <span class="eyebrow">Islandwide service areas</span>
      <h2>Letterbox lock service across Singapore</h2>
      <p class="section-intro">We provide letterbox and mailbox lock replacement, unlocking and smart installation in every HDB town and condominium islandwide, including:</p>
      <div class="areas-grid" id="areasGrid">${areasHtml}</div>
    </div>
  </section>
  <section class="section" id="order">
    <div class="wrap order-layout">
      <div>
        <span class="eyebrow">Order / quotation</span>
        <h2>Place your order — get a WhatsApp confirmation in one tap</h2>
        <p class="section-intro">Pick your lock, colour and mailbox condition, then add your block and unit so we can schedule the visit. WhatsApp opens with your order summary ready to send — you just add your name and contact number in the chat to confirm.</p>
        <ul class="check-list">
          <li>✓ Product, colour, quantity and estimate included</li>
          <li>✓ Block, unit and postal district for scheduling</li>
          <li>✓ Bulk discount applied automatically</li>
          <li>✓ Written price confirmed before any work</li>
        </ul>
        <div class="privacy-box">
          <strong>How your privacy is handled:</strong> pressing “Continue on WhatsApp” builds a prefilled message containing your product choice, quantity, mailbox condition, <strong>block, unit</strong> and postal district. Your <strong>name and phone number are never put in the link</strong> — you type those inside the encrypted WhatsApp chat. See our <a href="privacy-policy/">Privacy Policy</a>.
        </div>
      </div>
      <form class="form" id="orderForm" novalidate>
        <div class="form-grid">
          <label class="full">Product<select name="productId" id="orderProduct">${productOptions}</select>
            <span class="field-error" id="err-productId" data-error-for="productId"></span></label>
          <label>Colour<select name="colour" id="orderColour" aria-describedby="err-colour">${firstColourOptions}</select>
            <span class="field-error" id="err-colour" data-error-for="colour"></span></label>
          <label>Quantity<input id="orderQuantity" name="quantity" type="number" min="1" max="100" step="1" value="1" required aria-describedby="err-quantity">
            <span class="field-error" id="err-quantity" data-error-for="quantity"></span></label>
          <label class="full">Existing mailbox condition
            <select name="access" id="orderAccess"><option value="OPEN_WITH_KEY">Open, key available</option><option value="LOST_KEY_LOCKED">Locked, key lost (opening from S$25)</option><option value="DAMAGED_OR_JAMMED">Lock damaged or jammed (from S$25)</option><option value="NEW_MAILBOX">New mailbox / no existing lock</option></select></label>
          <label>Block no.<input id="orderBlock" name="block" inputmode="text" autocomplete="off" maxlength="6" required placeholder="e.g. 123 or 123A" aria-describedby="err-block">
            <span class="field-error" id="err-block" data-error-for="block"></span></label>
          <label>Unit no.<input id="orderUnit" name="unit" inputmode="text" autocomplete="off" maxlength="12" required placeholder="e.g. 12-345" aria-describedby="err-unit">
            <span class="field-error" id="err-unit" data-error-for="unit"></span></label>
          <label>Postal district (first 2 digits)<input id="orderDistrict" name="district" inputmode="numeric" pattern="[0-9]{2}" minlength="2" maxlength="2" required placeholder="e.g. 52" aria-describedby="err-district">
            <span class="field-error" id="err-district" data-error-for="district"></span></label>
          <label>Preferred date / time (optional)<input name="timing" maxlength="80" placeholder="e.g. Saturday afternoon"></label>
          <div class="consent" id="authGroup">
            <input type="checkbox" id="authorised" name="authorised" aria-describedby="err-authorised">
            <label for="authorised">I confirm I am the resident, owner or an authorised person for this mailbox. Proof of residence will be required on site before any locked mailbox is opened.</label>
          </div>
          <span class="field-error full" id="err-authorised" data-error-for="authorised"></span>
        </div>
        <div id="estimate" class="estimate">Estimated total: <b>S$50</b><span class="note">Estimate only, not a confirmed price.</span></div>
        <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
        <button class="btn order btn-block btn-lg" type="submit">🔒 Continue on WhatsApp</button>
      </form>
    </div>
  </section>
  <section class="section white" id="faq">
    <div class="wrap faq">
      <span class="eyebrow">Frequently asked questions</span>
      <h2>Letterbox lock questions, answered</h2>
      <div id="faqList">${faqHtml}</div>
    </div>
  </section>
</main>
<dialog id="lightbox" aria-label="Installation photo">
  <button type="button" data-close aria-label="Close" class="lb-close">×</button>
  <div class="lb-body">
    <img id="lightboxImg" src="" alt="Enlarged installation photo" width="800" height="600" class="lb-img">
  </div>
</dialog>
${footer("")}
<script type="application/json" id="site-data">${runtimeData()}</script>
${scripts("")}
</body>
</html>
`;

writeFileSync(new URL("./index.html", root), html);
console.log(`✓ Wrote index.html — ${PRODUCTS.length} products, ${REVIEWS.length} reviews, rating ${RATING.value}/${RATING.count}.`);

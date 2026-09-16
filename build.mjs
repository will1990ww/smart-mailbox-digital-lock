/* =============================================================================
 * build.mjs — homepage. All nine WT products sit directly below the hero.
 * ========================================================================== */
import { writeFileSync } from "node:fs";
import { SITE, PRODUCTS, FAQS, AREAS, REVIEWS, COMPATIBILITY, NO_FIT_POLICY, GALLERY, COLOURS } from "./src/data.mjs";
import { esc, attr, head, header, footer, scripts, runtimeData, waHref, telHref, comparisonTable, costTable, money, WA_GENERIC, WA_URGENT, WA_GROUP } from "./src/render.mjs";

const B = SITE.baseUrl;
const root = new URL("./", import.meta.url);
const BRAND = SITE.brand;

const VERIFIED = REVIEWS.filter((r) => r && r.verified === true);
const HAS_REVIEWS = VERIFIED.length > 0;
const AVG = HAS_REVIEWS ? Math.round((VERIFIED.reduce((s, r) => s + r.stars, 0) / VERIFIED.length) * 10) / 10 : null;

function card(p, i) {
  const pop = p.popular ? `<span class="tagpop">Most popular</span>` : "";
  const feats = p.features.map((f) => `<li>${esc(f)}</li>`).join("");
  const opts = p.colours.map((c) => `<option value="${attr(c)}">${esc(COLOURS[c]?.label || c)}</option>`).join("");
  const load = i === 0 ? `fetchpriority="high" decoding="async"` : `loading="lazy" decoding="async"`;
  return `        <article class="prod" id="${attr(p.id)}" data-categories="${attr(p.categories.join(","))}">
      <div class="thumb">${pop}<span class="tagcat">${esc(p.categories[0])}</span>
        <img src="${attr(p.image)}" alt="${attr(p.imageAlt)}" width="600" height="600" ${load}></div>
      <div class="body">
        <span class="code">${esc(p.id)}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <p class="best-for"><strong>Best for:</strong> ${esc(p.bestFor)}</p>
        <ul class="feat">${feats}</ul>
        <div class="foot"><div><small>Supply + installation from</small><strong>${money(p.price)}</strong></div></div>
        <div class="add-row">
          <label class="add-colour"><span class="sr-only">Colour for ${esc(p.name)}</span>
            <select data-card-colour="${attr(p.id)}" aria-label="Colour for ${attr(p.name)}">${opts}</select></label>
          <button type="button" class="btn blue add-btn" data-add-product="${attr(p.id)}" data-ev="add_to_quote">Add to quote</button>
        </div>
        <p class="card-link"><a href="products/index.html#${attr(p.id)}">Full specifications &amp; considerations →</a></p>
      </div></article>`;
}

const galleryCells = GALLERY.map((g) => {
  const src = `assets/img/gallery/${g.file}`;
  return `        <button class="cell" type="button" data-gallery-src="${attr(src)}" data-gallery-alt="${attr(g.alt)}" aria-label="Enlarge: ${attr(g.alt)}"><img src="${attr(src)}" alt="${attr(g.alt)}" width="400" height="400" loading="lazy" decoding="async"></button>`;
}).join("\n");

function graphLd() {
  const dn = { Mo:"Monday",Tu:"Tuesday",We:"Wednesday",Th:"Thursday",Fr:"Friday",Sa:"Saturday",Su:"Sunday" };
  const business = {
    "@type": ["LocalBusiness","Locksmith"], "@id": `${B}/#business`,
    name: SITE.businessName, alternateName: SITE.alternateName,
    image: B + SITE.ogImage, logo: B + SITE.logo, url: `${B}/`,
    telephone: SITE.phoneDisplay, priceRange: "S$25–S$200",
    currenciesAccepted: SITE.currency, paymentAccepted: SITE.payment,
    description: "Singapore's dedicated letterbox and mailbox lock locksmith. We supply and professionally install WT letterbox locks for HDB, condo, landed and outdoor mailboxes — keyed, battery-free combination and electronic digital PIN models from S$60. We do not service door, gate, car or safe locks.",
    slogan: SITE.slogan,
    address: { "@type": "PostalAddress", addressCountry: "SG", addressRegion: "Singapore", addressLocality: "Singapore" },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    areaServed: [{ "@type": "Country", name: "Singapore" }],
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: SITE.openingHours.days.map((d) => dn[d]), opens: SITE.openingHours.opens, closes: SITE.openingHours.closes }],
    contactPoint: { "@type": "ContactPoint", telephone: SITE.phoneDisplay, contactType: "customer service", areaServed: "SG", availableLanguage: SITE.languages },
    hasOfferCatalog: { "@type": "OfferCatalog", name: "WT letterbox lock products",
      itemListElement: PRODUCTS.map((p) => ({ "@type": "Offer",
        itemOffered: { "@type": "Product", name: `${p.brand} ${p.name}`, brand: { "@type": "Brand", name: p.brand } },
        priceCurrency: "SGD", price: String(p.price) })) },
  };
  if (SITE.reviewSourceUrl) business.sameAs = [SITE.reviewSourceUrl];
  if (SITE.reviewSchema?.emit && HAS_REVIEWS) {
    business.aggregateRating = { "@type": "AggregateRating", ratingValue: String(AVG), reviewCount: String(VERIFIED.length), bestRating: "5" };
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [
    business,
    { "@type": "WebSite", "@id": `${B}/#website`, url: `${B}/`, name: SITE.businessName, inLanguage: "en-SG", publisher: { "@id": `${B}/#business` } },
    { "@type": "Service", "@id": `${B}/#service`, serviceType: "Letterbox lock installation, mailbox lock replacement and opening",
      provider: { "@id": `${B}/#business` }, areaServed: { "@type": "Country", name: "Singapore" },
      offers: { "@type": "Offer", priceCurrency: "SGD", price: "60", priceSpecification: { "@type": "PriceSpecification", minPrice: "25", maxPrice: "200", priceCurrency: "SGD" } } },
    { "@type": "FAQPage", "@id": `${B}/#faq`, mainEntity: FAQS.slice(0, 6).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ]});
}

const productOptions = PRODUCTS.map((p) => `<option value="${attr(p.id)}" data-colours="${attr(p.colours.join(","))}">${esc(p.id)} · ${esc(p.name)} (${money(p.price)})</option>`).join("");
const firstColours = (PRODUCTS[0].colours || []).map((c) => `<option value="${attr(c)}">${esc(COLOURS[c]?.label || c)}</option>`).join("");
const accessOptions = Object.entries(SITE.pricing.accessFees).map(([k, v]) => `<option value="${attr(k)}">${esc(v.label)}</option>`).join("");
const noFit = NO_FIT_POLICY.map((n) => `        <div class="info-card"><h3>${esc(n.h)}</h3><p>${esc(n.p)}</p></div>`).join("\n");
const areasHtml = AREAS.map((a) => `<span>${esc(a)}</span>`).join("");
const faqHtml = FAQS.slice(0, 6).map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
const includes = SITE.priceScope.includes.map((i) => `<li>${esc(i)}</li>`).join("");
const excludes = SITE.priceScope.excludes.map((i) => `<li>${esc(i)}</li>`).join("");
const brandPoints = BRAND.points.map((b) => `        <div class="info-card"><h3>${esc(b.h)}</h3><p>${esc(b.p)}</p></div>`).join("\n");
const primaryPhoto = COMPATIBILITY.photos.find((p) => p.primary) || COMPATIBILITY.photos[0];
const followUps = COMPATIBILITY.photos.filter((p) => !p.primary)
  .map((p) => `          <li><strong>${esc(p.h)}</strong> <span>${esc(p.p)}</span></li>`).join("\n");

const reviewsSection = HAS_REVIEWS ? `
  <section class="section" id="reviews">
    <div class="wrap">
      <span class="eyebrow">Customer feedback</span>
      <h2>What Singapore residents say</h2>
      <p class="section-intro">Average ${AVG} out of 5 from ${VERIFIED.length} customers who let us share their feedback.</p>
      <div class="reviews-grid">${VERIFIED.map((r) => `
        <figure class="review"><div class="stars" aria-label="${r.stars} out of 5 stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
        <blockquote><p>${esc(r.text)}</p></blockquote>
        <figcaption class="who"><span class="av" aria-hidden="true">${esc(r.name.charAt(0))}</span>
        <span><b>${esc(r.name)}</b><span>${esc(r.loc)} · ${esc(r.date)}</span></span></figcaption></figure>`).join("")}
      </div>
      ${SITE.reviewSourceUrl ? `<p class="review-src"><a href="${attr(SITE.reviewSourceUrl)}" rel="noopener noreferrer nofollow" target="_blank">Read and verify these on our public profile →</a></p>` : ""}
    </div>
  </section>` : "";

const html = `<!doctype html>
<html lang="en-SG">
<head>
${head({
  title: "Letterbox Lock Installation & Replacement Singapore | WT",
  description: "WT letterbox locks supplied and professionally installed in Singapore. HDB & condo mailbox lock replacement, digital locks and lost-key opening. From S$60.",
  canonicalPath: "/", rel: "", extraLd: graphLd(),
})}
</head>
<body>
${header("")}
<main id="main">
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <span class="label">✓ SINGAPORE'S DEDICATED LETTERBOX LOCKSMITH</span>
        <h1>Letterbox Lock Installation &amp; Mailbox Lock Replacement <span>in Singapore</span></h1>
        <p class="lead">We supply and professionally install <strong>WT letterbox locks</strong> — the range that fits standard Singapore HDB and condominium mailboxes. Send <strong>one photo</strong>, we confirm the model and price in writing, then fit and test it. From S$60 installed.</p>
        <div class="hero-actions">
          <a class="btn order btn-lg" data-ev="quote-hero" href="#products">See all 9 WT locks &amp; prices</a>
          <a class="btn green" data-wa data-ev="whatsapp-hero" href="${attr(waHref(WA_GENERIC))}" rel="noopener noreferrer">Send a photo on WhatsApp</a>
        </div>
        <div class="proof">
          <span><i>✓</i> Installation included, not extra</span>
          <span><i>✓</i> Lost-key opening from S$25</span>
          <span><i>✓</i> Open 09:00–21:00 daily</span>
        </div>
      </div>
      <div class="visual">
        <div class="urgent-card">
          <p class="urgent-h">Lost key or jammed lock?</p>
          <p class="urgent-p">Send one photo of the mailbox door and your postal sector. We reply with today's availability and a written price before we travel.</p>
          <a class="btn white btn-block" data-ev="urgent-wa" href="${attr(waHref(WA_URGENT))}" rel="noopener noreferrer">Send a photo on WhatsApp</a>
          <div class="mt-12"><a class="btn ghost btn-block" data-tel data-ev="urgent-call" href="${attr(telHref())}">Call ${esc(SITE.phoneDisplay)}</a></div>
          <p class="urgent-note">Open 09:00–21:00 daily; we are not a 24-hour emergency service. ${esc(SITE.urgent.surchargeNote)}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="trustbar"><div class="wrap trustgrid">
    <div><b>WT locks</b><span>fits Singapore letterboxes</span></div>
    <div><b>S$60</b><span>supplied + installed from</span></div>
    <div><b>S$25</b><span>lost-key opening from</span></div>
    <div><b>One photo</b><span>is all we need to quote</span></div>
  </div></section>

  <section class="section" id="products">
    <div class="wrap">
      <span class="eyebrow">All WT lock models &amp; prices</span>
      <div class="section-head">
        <div><h2>All 9 WT letterbox locks — installation included</h2>
          <p class="section-intro">Every WT model we fit, with what each is best for. Prices cover supply <strong>and</strong> professional installation on a compatible, accessible mailbox — fitting is not billed separately.</p></div>
        <div class="filter-row" role="group" aria-label="Filter products by type">
          <button type="button" data-filter="all" aria-pressed="true">All 9</button>
          <button type="button" data-filter="key" aria-pressed="false">Key</button>
          <button type="button" data-filter="mechanical" aria-pressed="false">Combination</button>
          <button type="button" data-filter="smart" aria-pressed="false">Digital</button>
        </div>
      </div>
      <div class="catalog-grid" id="productGrid">
${PRODUCTS.map(card).join("\n")}
      </div>
      <h3 class="sub-h">Quick comparison</h3>
      <div id="compareTable">
        <div class="cmp-bar">${PRODUCTS.map((p) => `<label class="cmp-opt"><input type="checkbox" data-compare="${attr(p.id)}" aria-label="Compare ${attr(p.id)} ${attr(p.name)}"> ${esc(p.id)}</label>`).join("")}<button type="button" class="linkish" id="compareReset">Reset</button></div>
        <p class="cmp-note" id="compareNote">Showing all nine models. Tick up to three to compare side by side.</p>
${comparisonTable("", false)}
      </div>
      <p class="fine">Prices assume a compatible, accessible mailbox. Lost-key opening is charged per unit (from S$25). The final price is always confirmed in writing. <a href="products/index.html">Full specifications for every model →</a></p>
    </div>
  </section>

  <section class="section white" id="cost">
    <div class="wrap">
      <span class="eyebrow">What it costs</span>
      <h2>Letterbox &amp; mailbox lock replacement cost</h2>
      <p class="section-intro">No hidden fitting fee and no call-out charge for a job we cannot complete. These are the typical figures — your written quote confirms the exact price after we see one photo.</p>
${costTable()}
      <p class="mt-12"><a class="btn ghost" href="letterbox-lock-price/index.html">Full price list &amp; what changes the cost →</a></p>
    </div>
  </section>

  <section class="section" id="brand">
    <div class="wrap">
      <span class="eyebrow">The brand we fit</span>
      <h2>Why we supply WT letterbox locks</h2>
      <p class="section-intro">${esc(BRAND.statement)}</p>
      <div class="info-grid">
${brandPoints}
      </div>
      <p class="mt-12"><a class="btn ghost" href="wt-digital-letterbox-lock/index.html">More about WT digital letterbox locks →</a></p>
    </div>
  </section>

  <section class="section white" id="compatibility">
    <div class="wrap two">
      <div>
        <span class="eyebrow">Will it fit?</span>
        <h2>${esc(COMPATIBILITY.headline)}</h2>
        <p class="section-intro">${esc(COMPATIBILITY.lead)}</p>
        <div class="photo-primary">
          <h3>${esc(primaryPhoto.h)}</h3>
          <p>${esc(primaryPhoto.p)}</p>
        </div>
        <details class="photo-more">
          <summary>What if one photo is not enough?</summary>
          <ul class="photo-follow">
${followUps}
          </ul>
          <p class="fine">We only ask for these if the first photo is not conclusive — and we ask in the chat, so there is nothing else to prepare now.</p>
        </details>
        <p class="promise">${esc(COMPATIBILITY.promise)}</p>
        <p class="mt-12"><a class="btn green" data-wa data-ev="whatsapp" href="${attr(waHref(WA_GENERIC))}" rel="noopener noreferrer">Send your photo on WhatsApp</a>
        <a class="btn ghost" href="compatibility-guide/index.html">Read the compatibility guide</a></p>
      </div>
      <div>
        <span class="eyebrow">If it still does not fit</span>
        <h2>Our no-fit policy</h2>
        <div class="info-grid one">
${noFit}
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="pricing-scope">
    <div class="wrap two">
      <div>
        <span class="eyebrow">Pricing scope</span>
        <h2>What the S$60 starting price includes</h2>
        <ul class="scope-list yes">${includes}</ul>
      </div>
      <div>
        <span class="eyebrow">Charged separately</span>
        <h2>When extra charges apply</h2>
        <ul class="scope-list no">${excludes}</ul>
        <p class="fine">Anything outside the standard scope is quoted in writing before we begin. You are never charged for an assessment, and there is nothing to pay online — you settle the written price after the job is done and tested.</p>
      </div>
    </div>
  </section>${reviewsSection}

  <section class="section white" id="how">
    <div class="wrap two">
      <div>
        <span class="eyebrow">How it works</span>
        <h2>One photo. Written price. Then we install it.</h2>
        <div class="feature-list">
          <div class="mini"><strong>1. Send one photo</strong><p>A straight-on shot of the mailbox front is usually all we need.</p></div>
          <div class="mini"><strong>2. We confirm the WT model</strong><p>Compatibility checked, then a written price with every charge itemised.</p></div>
          <div class="mini"><strong>3. Book a slot</strong><p>Share your block, unit and preferred time inside the WhatsApp chat.</p></div>
          <div class="mini"><strong>4. Install, test and pay</strong><p>Fitted, aligned and demonstrated. Pay by PayNow, cash or transfer afterwards.</p></div>
        </div>
      </div>
      <div class="steps"><ol>
        <li><strong>Authorised access only</strong><p>We verify you are the resident, owner, tenant or an authorised person before opening any locked mailbox. ID is sighted only — never copied or retained. <a href="about/index.html">Read the full procedure</a>.</p></li>
        <li><strong>Repair before replace</strong><p>A stiff key or a spinning cam is often a service job, not a new lock. <a href="repair-or-replace/index.html">See how we assess it</a>.</p></li>
        <li><strong>Nothing to pay online</strong><p>No deposit, no card details. Payment is due after installation and testing.</p></li>
        <li><strong>Written price wins</strong><p>Website figures are estimates. The written quotation is the price that applies.</p></li>
      </ol></div>
    </div>
  </section>

  <section class="section" id="gallery">
    <div class="wrap">
      <span class="eyebrow">Installation gallery</span>
      <h2>See the finish before you choose</h2>
      <p class="section-intro">Completed HDB, condo and outdoor letterbox lock installations across Singapore.</p>
      <div class="gallery-grid">
${galleryCells}
      </div>
    </div>
  </section>

  <section class="section group-sec" id="group">
    <div class="wrap"><div class="group-inner">
      <div>
        <span class="eyebrow">Group &amp; bulk orders</span>
        <h2>Ordering for a whole block or condo?</h2>
        <p class="lead2">Managing agents, MCSTs, town councils and neighbours upgrading together get group pricing, one coordinated visit and a single invoice. Orders of 20+ units are priced by written quote after a survey — never an automatic total.</p>
        <div class="tier-grid">
          <div class="tier"><b>5+</b><span>units · 5% off</span></div>
          <div class="tier"><b>10+</b><span>units · 10% off</span></div>
          <div class="tier"><b>20+</b><span>units · written quote</span></div>
        </div>
      </div>
      <div class="group-card">
        <h3>Get a group quote</h3>
        <p class="muted-sm">Send your estate name, unit count and a photo of one representative mailbox.</p>
        <ul>
          <li><i>✓</i> Volume discount from 5 units</li>
          <li><i>✓</i> One scheduled visit, minimal disruption</li>
          <li><i>✓</i> Single invoice for MCST / town council</li>
          <li><i>✓</i> MCST approval handled before booking</li>
        </ul>
        <a class="btn green btn-block" data-ev="whatsapp-group" href="${attr(waHref(WA_GROUP))}" rel="noopener noreferrer">Request group quote on WhatsApp</a>
        <div class="mt-12"><a class="btn white btn-block" href="group-letterbox-lock-replacement/index.html">How bulk jobs run</a></div>
      </div>
    </div></div>
  </section>

  <section class="section white" id="areas">
    <div class="wrap">
      <span class="eyebrow">Islandwide service areas</span>
      <h2>Letterbox lock service across Singapore</h2>
      <p class="section-intro">We cover every HDB town and condominium islandwide, including:</p>
      <div class="areas-grid">${areasHtml}</div>
    </div>
  </section>

  <section class="section" id="quote">
    <div class="wrap order-layout">
      <div>
        <span class="eyebrow">Written quotation</span>
        <h2>Get a written quote — no payment, no obligation</h2>
        <p class="section-intro">Choose one lock or build a list for multiple letterboxes. WhatsApp opens with your request ready to send; you add your photo, name, block and unit inside the chat.</p>
        <ul class="check-list">
          <li>✓ Itemised estimate with every charge shown</li>
          <li>✓ Supply and installation in one price</li>
          <li>✓ Bulk discount applied automatically</li>
          <li>✓ Your exact address stays out of the link</li>
        </ul>
        <div class="privacy-box">
          <strong>Your privacy:</strong> the WhatsApp link carries only your product choice, quantity, mailbox condition, the <strong>2-digit postal sector</strong> and the estimate. Your <strong>name, phone, block, unit and full postal code are never placed in the link</strong> — use the copy button and paste them inside the encrypted chat. See our <a href="privacy-policy/index.html">Privacy Policy</a>.
        </div>
      </div>
      <form class="form" id="quoteForm" novalidate>
        <fieldset class="mode-switch">
          <legend>What do you need?</legend>
          <label class="mode-opt"><input type="radio" name="mode" id="modeSingle" value="single" checked> <span><b>One lock</b><small>Quick single quote</small></span></label>
          <label class="mode-opt"><input type="radio" name="mode" id="modeMulti" value="multiple"> <span><b>Multiple / bulk</b><small>Build a quote list</small></span></label>
        </fieldset>
        <div id="singlePane">
          <div class="form-grid">
            <label class="full">Product<select name="productId" id="qProduct">${productOptions}</select>
              <span class="field-error" data-error-for="productId"></span></label>
            <label>Colour<select name="colour" id="qColour">${firstColours}</select>
              <span class="field-error" data-error-for="colour"></span></label>
            <label>Quantity<input id="qQuantity" name="quantity" type="number" min="1" max="100" step="1" value="1" inputmode="numeric">
              <span class="field-error" data-error-for="quantity"></span></label>
          </div>
        </div>
        <div id="multiPane" hidden>
          <div class="ql-panel">
            <div class="ql-head"><h3>Your quote list</h3><button type="button" class="ql-clear" id="listClear">Clear</button></div>
            <p class="ql-empty" id="listEmpty">No locks added yet — use <b>Add to quote</b> on any product above.</p>
            <ul class="ql-lines" id="listLines"></ul>
          </div>
        </div>
        <div class="form-grid">
          <label class="full">Existing mailbox condition
            <select name="access" id="qAccess">${accessOptions}</select></label>
          <label>Postal code<input id="qPostal" name="postal" inputmode="numeric" autocomplete="postal-code" maxlength="6" required placeholder="e.g. 520123 or 52">
            <span class="field-error" data-error-for="postal"></span></label>
          <label>Preferred date / time<input id="qTiming" name="timing" maxlength="80" placeholder="e.g. Saturday afternoon"></label>
          <label>Block no.<input id="qBlock" name="block" autocomplete="off" maxlength="6" placeholder="e.g. 123 or 123A">
            <span class="field-error" data-error-for="block"></span></label>
          <label>Unit no.<input id="qUnit" name="unit" autocomplete="off" maxlength="12" placeholder="e.g. 12-345 or 1518">
            <span class="field-error" data-error-for="unit"></span></label>
          <div class="urgent-opt full">
            <input type="checkbox" id="qUrgent" name="urgent">
            <label for="qUrgent">This is urgent — please tell me today's earliest slot</label>
          </div>
          <div class="consent full" id="authGroup">
            <input type="checkbox" id="qAuthorised" name="authorised">
            <label for="qAuthorised">I confirm I am the resident, owner, tenant or an authorised person for this mailbox, and I understand proof will be required on site before it is opened.</label>
          </div>
          <span class="field-error full" data-error-for="authorised"></span>
        </div>
        <div class="breakdown" id="breakdown" aria-live="polite"></div>
        <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
        <button class="btn order btn-block btn-lg" type="submit">Get a Written Quote on WhatsApp</button>
        <button class="btn ghost btn-block mt-12" type="button" id="copyDetails">Copy my block &amp; unit to paste in chat</button>
      </form>
    </div>
  </section>

  <section class="section white" id="faq">
    <div class="wrap faq">
      <span class="eyebrow">Common questions</span>
      <h2>Letterbox lock questions, answered</h2>
      <div>${faqHtml}</div>
      <p class="mt-12"><a class="btn ghost" href="about/index.html">More about how we work →</a></p>
    </div>
  </section>
</main>
<dialog id="lightbox" aria-label="Installation photo">
  <button type="button" data-close aria-label="Close photo" class="lb-close">×</button>
  <div class="lb-body"><img id="lightboxImg" src="" alt="" width="800" height="600" class="lb-img"></div>
</dialog>
${footer("")}
<script type="application/json" id="site-data">${runtimeData()}</script>
${scripts("")}
</body>
</html>
`;

writeFileSync(new URL("./index.html", root), html);
console.log(`✓ index.html — ${PRODUCTS.length} ${BRAND.name} products, cost table, ${VERIFIED.length} testimonial(s)`);

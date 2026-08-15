/* =============================================================================
 * build.mjs — generate the homepage index.html from the single source of truth.
 * Also runs the LAUNCH GUARD (fails on placeholders / unverified social proof).
 * Sub-pages, robots.txt and sitemap.xml are produced by build-pages.mjs.
 * ========================================================================== */
import { writeFileSync } from "node:fs";
import { SITE, COLOURS, PRODUCTS, UPCOMING, FAQS, AREAS, REVIEWS, KNOWLEDGE } from "./src/data.mjs";
import { esc, attr, safeColour, money, LOCK_SVG, IMG_SVG, head, header, footer, scripts, homeJsonLd, runtimeData } from "./src/render.mjs";

/* ---- partials -------------------------------------------------------------- */
function productCard(p) {
  const cats = p.categories.join(",");
  const swatches = p.colours.map((k) => `<span class="swatch"><i class="dot dot-${attr(k)}"></i>${esc(COLOURS[k].label)}</span>`).join("");
  const feats = p.features.map((f) => `<li>${esc(f)}</li>`).join("");
  // primary colour preselects the order form (product↔colour link)
  const firstColour = p.colours[0] || "";
  return `<article class="prod" data-categories="${attr(cats)}">
      <div class="thumb">${p.popular ? '<span class="tagpop">Most popular</span>' : ""}<span class="tagcat">${esc(p.categories[0])}</span>
        <div class="lockart">${LOCK_SVG}</div></div>
      <div class="body">
        <span class="code">${esc(p.id)}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="colours">${swatches}</div>
        <ul class="feat">${feats}</ul>
        <div class="foot"><div><small>Supply + install from</small><strong>${esc(money(p.price))}</strong></div></div>
        <div class="actions-2">
          <a class="btn blue" href="#order" data-scroll-product="${attr(p.id)}" data-scroll-colour="${attr(firstColour)}">Select &amp; configure</a>
          <a class="btn ghost" href="#" data-wa-product="${attr(p.id)}" rel="noopener noreferrer">Quick WhatsApp quote</a>
        </div>
      </div></article>`;
}
const upcomingCard = (p) => `<article class="soon-card" data-categories="smart">
      <span class="tag">Coming soon</span><span class="model">${esc(p.id)}</span>
      <h3>${esc(p.id)} · ${esc(p.name)}</h3><p>${esc(p.desc)}</p>
      <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <a class="notify" href="#" data-wa-product="${attr(p.id)}" rel="noopener noreferrer">Notify me when available</a>
    </article>`;
const galleryCell = (i) => {
  const src = `assets/img/gallery/job-${String(i).padStart(2, "0")}.jpg`;
  return `<button class="cell" type="button" data-gallery-src="${attr(src)}" aria-label="Installation photo ${i}">${IMG_SVG}</button>`;
};
const reviewCard = (r) => `<figure class="review">
      <div class="stars" aria-label="${r.stars} out of 5 stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
      <blockquote><p>${esc(r.text)}</p></blockquote>
      <figcaption class="who"><span class="av" aria-hidden="true">${esc(r.name.charAt(0))}</span>
      <span><b>${esc(r.name)}</b><span>${esc(r.loc)} · ${esc(r.date)}</span></span></figcaption>
    </figure>`;
const knowledgeCard = (k) => `<div class="info-card"><h3>${esc(k.h)}</h3><p>${esc(k.p)}</p></div>`;
const faqItem = (f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`;
const areaChip = (a) => `<span>${esc(a)}</span>`;
const accessOptions = () => Object.entries(SITE.pricing.accessFees).map(([k, v]) => `<option value="${attr(k)}">${esc(v.label)}</option>`).join("");
const productOptions = () => PRODUCTS.map((p) => `<option value="${attr(p.id)}">${esc(p.id)} · ${esc(p.name)} (${esc(money(p.price))})</option>`).join("");
// Colour options for the FIRST product, rendered at build time so the dropdown
// is populated even with JavaScript disabled (progressive enhancement). JS then
// re-syncs these whenever the product changes.
const colourOptions = () => (PRODUCTS[0]?.colours || []).map((k) => `<option value="${attr(k)}">${esc(COLOURS[k].label)}</option>`).join("");

/* ---- page ------------------------------------------------------------------ */
const B = SITE.baseUrl;
const page = `<!doctype html>
<html lang="en-SG">
<head>
${head({
  title: "HDB & Condo Letterbox Lock Replacement Singapore | from S$50",
  description: "HDB & condo letterbox lock replacement, lost-key unlocking and smart keyless installation across Singapore. Installation from S$50. Photo-first written quote on WhatsApp.",
  canonicalPath: "/",
  rel: "",
  extraLd: homeJsonLd(),
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
          <a class="btn blue" href="#products">Compare all 9 locks</a>
          <a class="btn green" href="#order">Configure your order</a>
        </div>
        <div class="proof">
          <span><i>✓</i> From S$50 installed</span>
          <span><i>✓</i> Unlocking from S$25</span>
          <span><i>✓</i> ${SITE.rating.value}★ · ${SITE.rating.count} reviews</span>
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
      <p class="section-intro">If your letterbox key is lost, your mailbox lock is jammed, or you want a more secure keyless upgrade, we install and replace HDB and condominium letterbox locks across Singapore. Every job starts with a photo and a clear written price. Standard supply and installation starts from S$50, lost-key unlocking from S$25, with nine models up to S$85.</p>
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
        ${PRODUCTS.map(productCard).join("\n        ")}
        ${UPCOMING.map(upcomingCard).join("\n        ")}
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
        ${Array.from({ length: 12 }, (_, i) => galleryCell(i + 1)).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="section" id="learn">
    <div class="wrap">
      <span class="eyebrow">Before you book</span>
      <h2>Compatibility, timing, warranty &amp; pricing</h2>
      <p class="section-intro">Useful details so you know exactly what to expect — no surprises on the day.</p>
      <div class="info-grid">
        ${KNOWLEDGE.map(knowledgeCard).join("\n        ")}
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
        <div class="why-card"><div class="ic" aria-hidden="true">⭐</div><h3>${SITE.rating.value}★ from ${SITE.rating.count} reviews</h3><p>Singapore households and MCSTs served with consistently high ratings.</p></div>
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
          <div class="mini"><strong>3. Book a slot</strong><p>Share your postal district and preferred time in the chat.</p></div>
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
        <a class="btn green btn-block" data-wa-group href="#" rel="noopener noreferrer">Request group quote on WhatsApp</a>
        <div class="mt-12"><a class="btn white btn-block" data-tel href="#">Call us</a></div>
      </div>
    </div></div>
  </section>

  <section class="section" id="reviews">
    <div class="wrap">
      <span class="eyebrow">Customer reviews</span>
      <h2>What Singapore residents say</h2>
      <p class="section-intro">Feedback from HDB and condo customers across the island. Aggregate rating ${SITE.rating.value} out of 5 from ${SITE.rating.count} reviews.</p>
      <div class="reviews-grid" id="reviewsGrid">
        ${REVIEWS.map(reviewCard).join("\n        ")}
      </div>
      <p class="review-src"><a href="${attr(SITE.reviewSourceUrl)}" rel="noopener noreferrer nofollow" target="_blank">Read and verify these reviews at our review profile →</a></p>
    </div>
  </section>

  <section class="section white" id="areas">
    <div class="wrap">
      <span class="eyebrow">Islandwide service areas</span>
      <h2>Letterbox lock service across Singapore</h2>
      <p class="section-intro">We provide letterbox and mailbox lock replacement, unlocking and smart installation in every HDB town and condominium islandwide, including:</p>
      <div class="areas-grid" id="areasGrid">${AREAS.map(areaChip).join("")}</div>
    </div>
  </section>

  <section class="section" id="order">
    <div class="wrap order-layout">
      <div>
        <span class="eyebrow">Order / quotation</span>
        <h2>Get your quote in one step — no personal details needed here</h2>
        <p class="section-intro">Pick your lock and mailbox condition. WhatsApp opens with a short quote summary ready to send. You then share your name, unit and contact number inside the chat to confirm the appointment.</p>
        <ul class="check-list">
          <li>✓ Product, colour and estimate included</li>
          <li>✓ Mailbox condition included</li>
          <li>✓ Postal district only (not your full address)</li>
          <li>✓ Bulk discount applied automatically</li>
        </ul>
        <div class="privacy-box">
          <strong>How your privacy is handled:</strong> this form builds a prefilled WhatsApp message and passes it to WhatsApp through the link (a URL). That message contains only your product choice, quantity, mailbox condition and 2-digit postal district — <strong>no name, phone number, street or unit</strong>. Appointment details are typed by you inside the encrypted WhatsApp chat. See our <a href="privacy-policy/">Privacy Policy</a>.
        </div>
      </div>
      <form class="form" id="orderForm">
        <div class="form-grid">
          <label class="full">Product<select name="productId" id="orderProduct">${productOptions()}</select>
            <span class="field-error" id="err-productId" data-error-for="productId"></span></label>
          <label>Colour<select name="colour" id="orderColour" aria-describedby="err-colour">${colourOptions()}</select>
            <span class="field-error" id="err-colour" data-error-for="colour"></span></label>
          <label>Quantity<input id="orderQuantity" name="quantity" type="number" min="1" max="100" step="1" value="1" required aria-describedby="err-quantity">
            <span class="field-error" id="err-quantity" data-error-for="quantity"></span></label>
          <label class="full">Existing mailbox condition
            <select name="access" id="orderAccess">${accessOptions()}</select></label>
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
        <button class="btn green btn-block" type="submit">Continue on WhatsApp</button>
      </form>
    </div>
  </section>

  <section class="section white" id="faq">
    <div class="wrap faq">
      <span class="eyebrow">Frequently asked questions</span>
      <h2>Letterbox lock questions, answered</h2>
      <div id="faqList">${FAQS.map(faqItem).join("")}</div>
    </div>
  </section>
</main>

<dialog id="lightbox" aria-label="Installation photo">
  <button type="button" data-close aria-label="Close" class="lb-close">×</button>
  <div class="lb-body">
    <img id="lightboxImg" src="" alt="" width="800" height="600" class="lb-img">
    <p class="lb-note">Swap in real installation photos at assets/img/gallery/ before launch.</p>
  </div>
</dialog>

${footer("")}

<noscript><div class="wrap ns-wrap"><p class="noscript-note">JavaScript is off, so the live estimate and one-tap WhatsApp handoff are disabled. All products, prices, reviews and FAQs above are fully readable. To order, WhatsApp us at ${esc(SITE.phoneDisplay)}.</p></div></noscript>

<script type="application/json" id="site-data">${runtimeData()}</script>
${scripts("")}
</body>
</html>
`;

/* ---- LAUNCH GUARD ---------------------------------------------------------- */
const allowPlaceholders = process.env.ALLOW_PLACEHOLDERS === "1";
const allowUnverified = process.env.ALLOW_UNVERIFIED === "1";
const problems = [];
[/yourdomain\.sg/i, /example\.sg/i, /xxxx/i, /0000\s?0000/, /6500000000/, /20XXXXXXXK/i].forEach((re) => { if (re.test(page)) problems.push(`Placeholder found: ${re}`); });
PRODUCTS.forEach((p) => p.colours.forEach((k) => {
  const c = COLOURS[k];
  if (!c) problems.push(`Product ${p.id} references unknown colour "${k}".`);
  else if (safeColour(c.hex) !== c.hex) problems.push(`Colour "${k}" has an unsafe hex "${c.hex}".`);
}));
if (!SITE.rating.verified) problems.push("SITE.rating.verified is false — do not publish unaudited aggregate ratings.");
REVIEWS.filter((r) => !r.verified).forEach((r) => problems.push(`Unverified review from "${r.name}".`));

writeFileSync(new URL("./index.html", import.meta.url), page);
console.log(`✓ Wrote index.html (${(page.length / 1024).toFixed(1)} KB)`);

if (problems.length) {
  console.log(`\nLAUNCH GUARD — ${problems.length} blocking issue(s):`);
  problems.forEach((p) => console.log("  ✗ " + p));
  if (!(allowPlaceholders && allowUnverified)) {
    console.log("\nPREVIEW written but NOT launch-ready. Fix above, or preview with: ALLOW_PLACEHOLDERS=1 ALLOW_UNVERIFIED=1 npm run build");
    process.exitCode = 1;
  }
} else {
  console.log("✓ Launch guard passed.");
}

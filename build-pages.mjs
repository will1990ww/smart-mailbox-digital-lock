/* =============================================================================
 * build-pages.mjs — products catalogue, guides, service pages, About, legal,
 * 404, robots and sitemap. Breadcrumbs only on genuine child pages.
 * ========================================================================== */
import { writeFileSync, mkdirSync } from "node:fs";
import { SITE, PRODUCTS, UPCOMING, COLOURS, SERVICE_PAGES, LEGAL_PAGES, COMPATIBILITY,
         NO_FIT_POLICY, AUTHORISATION, SERVICE_LIMITS, REPAIR_OR_REPLACE, FAQS } from "./src/data.mjs";
import { esc, attr, head, header, footer, scripts, runtimeData, waHref, telHref,
         comparisonTable, costTable, specValue, money, WA_GENERIC, WA_URGENT } from "./src/render.mjs";

const B = SITE.baseUrl;
const root = new URL("./", import.meta.url);
const routes = ["/"];
const today = "2026-01-01";
const WA = attr(waHref(WA_GENERIC));
const BRAND = SITE.brand;

function writePage(slug, html) {
  mkdirSync(new URL(`./${slug}/`, root), { recursive: true });
  writeFileSync(new URL(`./${slug}/index.html`, root), html);
  routes.push(`/${slug}/`);
}
function shell({ slug, title, description, ld, body }) {
  return `<!doctype html>
<html lang="en-SG">
<head>
${head({ title, description, canonicalPath: `/${slug}/`, rel: "../", extraLd: ld })}
</head>
<body>
${header("../")}
<main id="main">
${body}
</main>
${footer("../")}
<script type="application/json" id="site-data">${runtimeData()}</script>
${scripts("../")}
</body>
</html>
`;
}
const crumbLd = (slug, name) => JSON.stringify({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: B + "/" },
    { "@type": "ListItem", position: 2, name, item: `${B}/${slug}/` },
  ],
});
const crumbs = (h1) => `      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a> › <span aria-current="page">${esc(h1)}</span></nav>`;
const cta = `        <p class="mt-12"><a class="btn order btn-lg" data-ev="quote-nav" href="../index.html#quote">Get a Written Quote</a>
        <a class="btn green" data-wa data-ev="whatsapp" href="${WA}" rel="noopener noreferrer">Send a photo on WhatsApp</a></p>`;

/* ---------- /products/ ----------------------------------------------------- */
{
  const slug = "products";
  const h1 = "All 9 WT Letterbox Locks — Prices, Specifications & Which to Choose";
  const specRow = (k, v) => `<div class="spec-row"><dt>${esc(k)}</dt><dd>${v}</dd></div>`;
  const cards = PRODUCTS.map((p, i) => {
    const s = p.specs;
    const load = i === 0 ? `fetchpriority="high" decoding="async"` : `loading="lazy" decoding="async"`;
    const opts = p.colours.map((c) => `<option value="${attr(c)}">${esc(COLOURS[c]?.label || c)}</option>`).join("");
    const adv = p.advantages.map((a) => `<li>${esc(a)}</li>`).join("");
    const con = p.considerations.map((a) => `<li>${esc(a)}</li>`).join("");
    return `      <article class="pdp" id="${attr(p.id)}" data-categories="${attr(p.categories.join(","))}">
        <div class="pdp-media"><img src="../${attr(p.image)}" alt="${attr(p.imageAlt)}" width="600" height="600" ${load}></div>
        <div class="pdp-body">
          <p class="code">${esc(p.id)} · ${esc(p.brand)}${p.popular ? ` · <span class="tagpop-inline">Most popular</span>` : ""}</p>
          <h2>${esc(p.name)}</h2>
          <p class="pdp-price"><strong>${money(p.price)}</strong> <small>supply + professional installation</small></p>
          <p>${esc(p.desc)}</p>
          <p class="best-for"><strong>Best for:</strong> ${esc(p.bestFor)}</p>
          <div class="pros-cons">
            <div><h3>Advantages</h3><ul class="yes">${adv}</ul></div>
            <div><h3>Considerations</h3><ul class="no">${con}</ul></div>
          </div>
          <p class="not-suitable"><strong>Not suitable when:</strong> ${esc(p.notSuitable)}</p>
          <details class="specs"><summary>Full specifications</summary>
            <dl class="spec-list">
              ${specRow("Brand", specValue(p.brand))}
              ${specRow("Access method", specValue(s.access))}
              ${specRow("Battery", specValue(s.battery))}
              ${specRow("Code digits", specValue(s.codeDigits))}
              ${specRow("Orientation", specValue(s.orientation))}
              ${specRow("Backup key", specValue(s.backupAccess))}
              ${specRow("Supplied with", specValue(s.included))}
              ${specRow("Fits door thickness", specValue(s.doorThicknessMm))}
              ${specRow("Lock body length", specValue(s.bodyLengthMm))}
              ${s.batteryType !== undefined ? specRow("Battery type", specValue(s.batteryType)) : ""}
              ${s.batteryLifeMonths !== undefined ? specRow("Expected battery life", specValue(s.batteryLifeMonths)) : ""}
              ${specRow("Workmanship warranty", specValue(p.warrantyMonths ? `${p.warrantyMonths} months` : null))}
            </dl>
            <p class="spec-note">Figures marked “pending supplier confirmation” are verified against the ${esc(p.brand)} datasheet and stated in your written quote before installation. We do not publish specifications we cannot evidence.</p>
          </details>
          <div class="add-row">
            <label class="add-colour"><span class="sr-only">Colour for ${esc(p.name)}</span>
              <select data-card-colour="${attr(p.id)}" aria-label="Colour for ${attr(p.name)}">${opts}</select></label>
            <button type="button" class="btn blue add-btn" data-add-product="${attr(p.id)}" data-ev="add_to_quote">Add to quote</button>
          </div>
        </div>
      </article>`;
  }).join("\n");

  const soon = UPCOMING.map((u) => `      <article class="soon-card">
        <span class="tag">Coming soon</span><span class="model">${esc(u.id)}</span>
        <h3>${esc(u.id)} · ${esc(u.name)}</h3><p>${esc(u.desc)}</p>
        <ul>${u.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <a class="notify" href="${attr(waHref(`Hi, please notify me when the ${u.id} ${u.name} is available.`))}" data-wa-product="${attr(u.id)}" data-ev="notify" rel="noopener noreferrer">Notify me when available</a>
      </article>`).join("\n");

  const compareBoxes = PRODUCTS.map((p) =>
    `<label class="cmp-opt"><input type="checkbox" data-compare="${attr(p.id)}" aria-label="Compare ${attr(p.id)} ${attr(p.name)}"> ${esc(p.id)}</label>`).join("");
  const itemListLd = JSON.stringify({
    "@context": "https://schema.org", "@type": "ItemList", name: "WT letterbox lock models",
    itemListElement: PRODUCTS.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: `${p.id} ${p.brand} ${p.name}`, url: `${B}/products/#${p.id}` })),
  });
  const ld = `${crumbLd(slug, "All WT letterbox locks")}</script><script type="application/ld+json">${itemListLd}`;

  const body = `  <section class="page-hero"><div class="wrap">
${crumbs(h1)}
      <h1>${esc(h1)}</h1>
      <p>Every WT model we fit, with honest advantages and limitations. Prices include supply and professional installation on a compatible, accessible mailbox.</p>
    </div></section>
  <section class="section"><div class="wrap">
      <div class="filter-row" role="group" aria-label="Filter products by type">
        <button type="button" data-filter="all" aria-pressed="true">All 9</button>
        <button type="button" data-filter="key" aria-pressed="false">Key</button>
        <button type="button" data-filter="mechanical" aria-pressed="false">Combination</button>
        <button type="button" data-filter="smart" aria-pressed="false">Digital</button>
      </div>
      <div id="compareTable">
        <h2>Compare up to three models</h2>
        <div class="cmp-bar">${compareBoxes}<button type="button" class="linkish" id="compareReset">Reset</button></div>
        <p class="cmp-note" id="compareNote">Showing all nine models. Tick up to three to compare side by side.</p>
${comparisonTable("../", false)}
      </div>
      <div id="productGrid" class="pdp-grid">
${cards}
      </div>
      <h2 class="sub-h">In development</h2>
      <div class="soon-grid">
${soon}
      </div>
${cta}
    </div></section>`;
  writePage(slug, shell({ slug, title: "All 9 WT Letterbox Locks Singapore | Prices & Specs", description: "Compare all nine WT letterbox lock models we supply and install in Singapore — keyed, combination and digital PIN. From S$60 including installation.", ld, body }));
}

/* ---------- /compatibility-guide/ ------------------------------------------ */
{
  const slug = "compatibility-guide";
  const h1 = "Will a New Lock Fit My Letterbox? Compatibility Guide";
  const primary = COMPATIBILITY.photos.find((p) => p.primary) || COMPATIBILITY.photos[0];
  const more = COMPATIBILITY.photos.filter((p) => !p.primary)
    .map((p) => `        <li><strong>${esc(p.h)}</strong><span>${esc(p.p)}</span></li>`).join("\n");
  const nofit = NO_FIT_POLICY.map((n) => `<h3>${esc(n.h)}</h3><p>${esc(n.p)}</p>`).join("\n      ");
  const limits = SERVICE_LIMITS.map((l) => `<li>${esc(l)}</li>`).join("");
  const body = `  <section class="page-hero"><div class="wrap">
${crumbs(h1)}
      <h1>${esc(h1)}</h1>
      <p>Most standard HDB and condominium letterbox doors take one of our nine WT models. This is how we check before you commit to anything.</p>
    </div></section>
  <section class="section"><div class="wrap narrow prose">
      <h2>Start with one photo</h2>
      <p>${esc(COMPATIBILITY.lead)}</p>
      <div class="photo-primary">
        <h3>${esc(primary.h)}</h3>
        <p>${esc(primary.p)}</p>
      </div>
      <p>${esc(COMPATIBILITY.promise)}</p>
      <h2>If we need more</h2>
      <p>Occasionally a front photo is not conclusive — usually when the lock is recessed or the door has had a previous non-standard repair. In that case we will ask, in the chat, for one or both of these:</p>
      <ul class="photo-follow">
${more}
      </ul>
      <h2>What decides whether a lock fits</h2>
      <p>Three things matter. <strong>Door thickness</strong> decides the lock body length and how much thread is left for the backing nut. <strong>Clearance behind the panel</strong> decides whether the cam can swing without fouling the mail slot or a neighbouring box. <strong>Cut-out shape and size</strong> decides whether a round-bodied lock will seat flush, or whether the existing hole is already oversized from a previous repair.</p>
      <p>The WT range is built around the standard Singapore mailbox cut-out and swivel direction, which is why most of our fittings need no drilling or modification. You do not need to measure anything up front — send the front photo and we will tell you.</p>
      <h2>If the lock still does not fit</h2>
      ${nofit}
      <h2>Mailboxes we may not be able to service</h2>
      <ul>${limits}</ul>
${cta}
    </div></section>`;
  writePage(slug, shell({ slug, title: "Will It Fit? Letterbox Lock Compatibility Guide", description: "How to check a replacement letterbox lock will fit your HDB or condo mailbox — start with one photo, what decides compatibility, and our no-fit policy.", ld: crumbLd(slug, h1), body }));
}

/* ---------- /repair-or-replace/ -------------------------------------------- */
{
  const slug = "repair-or-replace";
  const h1 = "Repair or Replace Your Letterbox Lock?";
  const rows = REPAIR_OR_REPLACE.rows.map((r) => `        <tr>
          <th scope="row">${esc(r.symptom)}</th>
          <td data-label="Likely cause">${esc(r.likely)}</td>
          <td data-label="What usually happens">${esc(r.outcome)}</td>
        </tr>`).join("\n");
  const body = `  <section class="page-hero"><div class="wrap">
${crumbs(h1)}
      <h1>${esc(h1)}</h1>
      <p>${esc(REPAIR_OR_REPLACE.intro)}</p>
    </div></section>
  <section class="section"><div class="wrap narrow prose">
      <div class="table-scroll"><table class="compare">
        <caption>Common letterbox lock problems and what they usually mean.</caption>
        <thead><tr><th scope="col">What you are seeing</th><th scope="col">Likely cause</th><th scope="col">What usually happens</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table></div>
      <p class="promise">${esc(REPAIR_OR_REPLACE.note)}</p>
      <h2>Why we would rather repair</h2>
      <p>A service call that ends in a tightened cam or a cleaned cylinder costs you less and takes less of our time than a replacement. It also means the lock you already know how to use keeps working. We only recommend a new lock when the mechanism is worn past adjustment, the cylinder has seized, or the existing lock cannot be made secure again.</p>
      <h2>When replacement is the honest answer</h2>
      <p>If a key has been forced and the cylinder is damaged, if the code on a combination lock has been forgotten and the model was not supplied with a code-retrieval key, or if the mechanism no longer engages the cam reliably, replacement is the right call. In those cases we open the mailbox first so your mail is accessible the same visit, then fit the WT model you choose.</p>
      <h2>If the door itself is damaged</h2>
      <p>A bent, prised or badly rusted door will not hold any lock securely, however new. We will say so plainly rather than fit a lock that will fail. Door and panel repair is outside what we do, but we can describe what to ask a contractor or your managing agent for.</p>
${cta}
    </div></section>`;
  writePage(slug, shell({ slug, title: "Repair or Replace a Letterbox Lock? Singapore Guide", description: "Stiff key, snapped key, spinning cam or forgotten code — what each symptom usually means, and when a letterbox lock can be repaired instead of replaced.", ld: crumbLd(slug, h1), body }));
}

/* ---------- Service pages -------------------------------------------------- */
for (const s of SERVICE_PAGES) {
  const sections = s.sections.map((sec) => `<h2>${esc(sec.h)}</h2><p>${esc(sec.p)}</p>`).join("\n        ");
  const related = SERVICE_PAGES.filter((x) => x.slug !== s.slug).slice(0, 3)
    .map((x) => `<li><a href="../${x.slug}/index.html">${esc(x.h1)}</a></li>`).join("");
  const serviceLd = JSON.stringify({ "@context": "https://schema.org", "@type": "Service",
    name: s.h1, serviceType: s.h1, provider: { "@id": `${B}/#business` },
    areaServed: { "@type": "Country", name: "Singapore" }, url: `${B}/${s.slug}/`,
    offers: { "@type": "Offer", priceCurrency: "SGD", price: "60" } });

  /* The cost page also carries the pricing FAQs so it can win the FAQ rich result
   * for "how much does letterbox lock replacement cost". */
  const costFaqs = FAQS.filter((f) => /cost|price|installation included|payment/i.test(f.q)).slice(0, 4);
  const faqLd = s.showCostTable && costFaqs.length
    ? `</script><script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org","@type":"FAQPage",
        mainEntity: costFaqs.map((f) => ({ "@type":"Question", name: f.q, acceptedAnswer: { "@type":"Answer", text: f.a } })) })}`
    : "";
  const ld = `${crumbLd(s.slug, s.h1)}</script><script type="application/ld+json">${serviceLd}${faqLd}`;

  const costBlock = s.showCostTable ? `
${costTable()}
      <h2>What each job includes</h2>` : "";
  const costFaqBlock = s.showCostTable && costFaqs.length ? `
      <h2>Pricing questions</h2>
      <div class="faq">${costFaqs.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}</div>` : "";

  const urgentBlock = s.slug === "lost-letterbox-key" ? `
      <div class="urgent-inline">
        <p><strong>Locked out right now?</strong> Send one photo of the mailbox door and your postal sector. We are open 09:00–21:00 daily and will reply with today's earliest slot and a written price before we travel.</p>
        <p><a class="btn green" data-ev="urgent-wa" href="${attr(waHref(WA_URGENT))}" rel="noopener noreferrer">Send a photo on WhatsApp</a>
        <a class="btn white" data-tel data-ev="urgent-call" href="${attr(telHref())}">Call ${esc(SITE.phoneDisplay)}</a></p>
      </div>` : "";

  const body = `  <section class="page-hero"><div class="wrap">
${crumbs(s.h1)}
      <h1>${esc(s.h1)}</h1>
      <p>${esc(s.intro)}</p>
    </div></section>
  <section class="section"><div class="wrap narrow prose">${urgentBlock}${costBlock}
        ${sections}${costFaqBlock}
        <h2>Related letterbox lock services</h2>
        <ul class="related">${related}<li><a href="../compatibility-guide/index.html">Will a new lock fit my letterbox?</a></li></ul>
${cta}
    </div></section>`;
  writePage(s.slug, shell({ slug: s.slug, title: s.title, description: s.desc, ld, body }));
}

/* ---------- /about/ -------------------------------------------------------- */
{
  const slug = "about";
  const h1 = "About Letterbox Lock Singapore";
  const who = AUTHORISATION.who.map((w) => `<h3>${esc(w.h)}</h3><p>${esc(w.p)}</p>`).join("\n      ");
  const limits = SERVICE_LIMITS.map((l) => `<li>${esc(l)}</li>`).join("");
  const ld = `${crumbLd(slug, h1)}</script><script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org","@type":"AboutPage",name:h1,url:`${B}/${slug}/`,about:{ "@id": `${B}/#business` } })}`;
  const body = `  <section class="page-hero"><div class="wrap">
${crumbs(h1)}
      <h1>${esc(h1)}</h1>
      <p>A specialist letterbox and mailbox lock service for Singapore homes, condominiums and managing agents.</p>
    </div></section>
  <section class="section"><div class="wrap narrow prose">
      <h2>What we do — and what we do not</h2>
      <p>We work on letterbox and mailbox locks only: HDB letterboxes, condominium mail compartments, landed-home mailboxes and weather-exposed outdoor letterboxes. We replace worn or jammed locks, open mailboxes when the only key is lost, and upgrade residents to keyless combination or digital PIN locks. We do not take main-door, gate, vehicle, padlock or safe work, so every visit is made by someone who works on letterboxes every day and carries the right parts.</p>
      <h2>The brand we supply</h2>
      <p>${esc(BRAND.statement)}</p>
      <h2>How a job runs</h2>
      <p>You send one photo of the mailbox front on WhatsApp. We assess compatibility, recommend a ${esc(BRAND.name)} model and issue a written price that itemises the lock, the labour and any opening fee. If that first photo is not conclusive we will ask for the inside latch or the door edge in the chat. On site the lock is fitted, aligned, tested and demonstrated to you. Payment is made afterwards by PayNow, cash or bank transfer. There is nothing to pay online, no deposit, and nothing is charged for an assessment.</p>
      <h2>Authorisation before any mailbox is opened</h2>
      <p>${esc(AUTHORISATION.intro)}</p>
      ${who}
      <h3>How we handle your identification</h3>
      <p>${esc(AUTHORISATION.handling)}</p>
      <h2>Our service hours</h2>
      <p>We are open <strong>09:00 to 21:00, seven days a week</strong>. We are deliberately not a 24-hour emergency locksmith — we would rather be a specialist available at sensible hours than a general call-out service. Urgent same-day slots are frequently available subject to your location, stock and the day's bookings, and any urgent surcharge is stated in writing before we travel.</p>
      <h2>Where we will say no</h2>
      <ul>${limits}</ul>
      <h2>Pricing you can check before you commit</h2>
      <p>Supply and professional installation starts from S$60 and lost-key opening from S$25 per unit. The <a href="../letterbox-lock-price/index.html">full price list</a> and the <a href="../products/index.html">nine-model range</a> are both published. Group and MCST orders receive tiered discounts, and orders of twenty units or more are always priced by written quote after a survey rather than an automatic total.</p>
      <h2>Warranty and after-sales</h2>
      <p>Selected installed models carry a workmanship warranty covering the fitting and mechanism under normal use. The exact cover that applies to your job is stated on your written quotation and confirmation — we do not advertise a blanket figure across models we have not verified. If something is not right, message us with the job date and a photo and we will put it right within the warranty period.</p>
${cta}
    </div></section>`;
  writePage(slug, shell({ slug, title: `About Us | ${SITE.businessName}`, description: "Singapore's dedicated letterbox and mailbox lock specialist. The WT range we supply, how we install, our authorisation checks, service hours, limits and warranty.", ld, body }));
}

/* ---------- Legal pages ---------------------------------------------------- */
const legalBody = {
  "privacy-policy": `
    <h2>Who we are</h2>
    <p>${esc(SITE.businessName)} provides letterbox and mailbox lock services across Singapore. You can reach us on WhatsApp or by phone for any privacy request.</p>
    <h2>What this website collects</h2>
    <p>This website has no server-side database and does not create an account for you. The quotation form runs entirely in your browser. Your quote list (product, colour and quantity only) is stored in your own browser so it survives a page refresh; the Clear button removes it.</p>
    <h2>What is placed in the WhatsApp link</h2>
    <p>When you press “Get a Written Quote on WhatsApp”, the form builds a prefilled message and passes it to WhatsApp through a link. Because links can be recorded by browsers, networks and the operating system, that message deliberately contains only your product choice, quantity, mailbox condition, the <strong>first two digits of your postal code</strong> and the estimate. It does <strong>not</strong> contain your name, phone number, block, unit or full postal code. Those are shared by you inside the encrypted WhatsApp chat — the copy button simply places them on your clipboard so you can paste them there.</p>
    <h2>Analytics</h2>
    <p>If analytics is enabled, we use a cookieless, first-party measurement that records only anonymous interaction events such as “a WhatsApp button was clicked”. It sets no cookies, does not follow you across other websites, and an allowlist prevents any name, phone number, block, unit or postal code from being transmitted.</p>
    <h2>Identification sighted on site</h2>
    <p>For lost-key or locked-mailbox jobs we verify authority on site. We <strong>sight</strong> identification only — we do not photograph, scan, copy or retain it. Our job record notes that the check was completed, the type of document sighted and the technician's name.</p>
    <h2>Information you share in WhatsApp</h2>
    <p>Appointment details you type in the chat (name, contact number, block, unit and full address) are processed by WhatsApp under its own terms, and by us solely to quote, schedule, perform and support the job and to keep records required by law.</p>
    <h2>Retention</h2>
    <p>We keep job records only for as long as needed for warranty, accounting and legal obligations, then delete them. Quotation enquiries that do not become jobs are deleted once clearly inactive.</p>
    <h2>Your rights under the PDPA</h2>
    <p>You may request access to, or correction of, the personal data we hold, and you may withdraw consent. Contact us on WhatsApp or by phone and we will respond within a reasonable period.</p>
    <h2>Third parties</h2>
    <p>We rely on WhatsApp for messaging and on PayNow or bank transfer for payment. We do not sell your data or share it for advertising.</p>`,
  "terms": `
    <h2>Scope</h2>
    <p>These terms govern quotations and letterbox-lock services provided by ${esc(SITE.businessName)}.</p>
    <h2>Quotations and estimates</h2>
    <p>Any figure calculated on this website is an <strong>estimate only</strong> and is not a confirmed price or an offer. A binding price is issued in writing after we review a photograph of your mailbox. Orders of 20 units or more are priced by written quote following a survey. Where a browser estimate and our written quotation differ, the written quotation prevails.</p>
    <h2>What the starting price covers</h2>
    <p>The published starting price assumes a compatible, accessible mailbox and covers supply of the lock, removal of the old mechanism, professional fitting, alignment and demonstration. Opening a locked mailbox, repairs to damaged or rusted doors, non-standard enclosures and any urgent surcharge are charged separately and quoted in advance.</p>
    <h2>Compatibility and our no-fit policy</h2>
    <p>Where we have confirmed a model from your photograph and it does not fit, we will fit a suitable alternative at the confirmed price where one exists, or leave the mailbox as found at no charge, including no attendance fee. Where a condition was not reasonably visible in the photograph, we will stop, explain, and provide a revised written price which you are free to decline at no charge.</p>
    <h2>Authorised access</h2>
    <p>For any locked mailbox we require proof of residence, ownership, tenancy or other authority on site before opening. Identification is sighted only. We may decline service where authority cannot be established, and nothing is charged in that event.</p>
    <h2>Service hours</h2>
    <p>We operate 09:00–21:00 daily. We do not hold ourselves out as a 24-hour emergency service. Same-day attendance is subject to availability, location and stock.</p>
    <h2>Payment &amp; GST</h2>
    <p>We accept ${esc(SITE.paymentInfo.methods.join(", ").toLowerCase())}. There is nothing to pay online and no deposit is taken. Payment is due on completion of the work unless otherwise agreed in writing. ${SITE.paymentInfo.gstRegistered ? `All prices are inclusive of ${Math.round(SITE.paymentInfo.gstRate * 100)}% GST.` : "We are not GST-registered, so no GST is added to your bill — the price we confirm in writing is the price you pay."}</p>
    <h2>Liability</h2>
    <p>We are not liable for pre-existing damage, non-standard or unsafe mailboxes, or matters outside the fitted lock and our workmanship. Nothing in these terms excludes liability that cannot be excluded by law.</p>`,
  "warranty": `
    <h2>What is covered</h2>
    <p>Selected installed models carry a workmanship warranty covering the fitting and the lock mechanism under normal use. <strong>The exact warranty period that applies to your job is stated on your written quotation and installation confirmation.</strong> We do not advertise a single blanket figure across models whose manufacturer terms differ.</p>
    <h2>What is not covered</h2>
    <p>Wear from misuse, forced entry, vandalism, water ingress on mailboxes unsuitable for outdoor exposure, or a user-set code that has been forgotten where the model was not supplied with a code-retrieval key. Consumables such as batteries are excluded. Damage arising from the mailbox door itself — rust, distortion or a previous non-standard repair — is not covered by the lock warranty.</p>
    <h2>How to claim</h2>
    <p>Contact us on WhatsApp with your job date and a photograph of the issue. Valid claims are repaired, or the lock re-fitted, at no labour cost within the warranty period.</p>`,
  "cancellation": `
    <h2>Before the appointment</h2>
    <p>You may cancel or reschedule at no charge up to 2 hours before the agreed slot by WhatsApp or phone.</p>
    <h2>Late cancellation &amp; no-show</h2>
    <p>For late cancellations, or where we cannot access the mailbox on arrival, a call-out fee may apply to cover travel. We will always tell you the amount before charging it.</p>
    <h2>If the lock cannot be fitted</h2>
    <p>Where we confirmed a model from your photograph and it cannot be fitted, no charge applies — including no attendance fee. See our compatibility and no-fit policy for the detail.</p>
    <h2>Refunds</h2>
    <p>If a fitted lock fails because of our workmanship and cannot be repaired, we refund the affected item. Estimates are not payments and nothing is charged until the work is agreed and completed.</p>`,
};
for (const p of LEGAL_PAGES) {
  const body = `  <section class="page-hero"><div class="wrap">
${crumbs(p.h1)}
      <h1>${esc(p.h1)}</h1>
      <p>Last updated ${esc(today)}. Please have this reviewed by your own legal adviser before launch.</p>
    </div></section>
  <section class="section"><div class="wrap narrow prose">${legalBody[p.slug]}</div></section>`;
  writePage(p.slug, shell({ slug: p.slug, title: `${p.title} | ${SITE.businessName}`, description: `${p.title} for ${SITE.businessName}.`, ld: crumbLd(p.slug, p.h1), body }));
}

/* ---------- 404 (uses SITE.basePath — can be served at any depth) ---------- */
{
  const BP = (SITE.basePath || "").replace(/\/$/, "");
  const body = `  <section class="page-hero"><div class="wrap">
      <h1>Page not found</h1>
      <p>Sorry — that page does not exist. It may have been moved, or the link may be incomplete.</p>
    </div></section>
  <section class="section"><div class="wrap narrow prose">
      <h2>Try one of these instead</h2>
      <ul class="related">
        <li><a href="${BP}/products/index.html">All 9 WT letterbox locks, prices and specifications</a></li>
        <li><a href="${BP}/letterbox-lock-price/index.html">Letterbox lock replacement cost</a></li>
        <li><a href="${BP}/letterbox-lock-installation/index.html">Letterbox &amp; mailbox lock installation</a></li>
        <li><a href="${BP}/lost-letterbox-key/index.html">Lost letterbox key — opening &amp; re-keying</a></li>
        <li><a href="${BP}/about/index.html">About us</a></li>
      </ul>
      <p class="mt-12"><a class="btn order btn-lg" href="${BP}/index.html#quote">Get a Written Quote</a>
      <a class="btn white" data-tel href="${attr(telHref())}">Call ${esc(SITE.phoneDisplay)}</a></p>
    </div></section>`;
  writeFileSync(new URL("./404.html", root), `<!doctype html>
<html lang="en-SG">
<head>
${head({ title: `Page not found | ${SITE.businessName}`, description: "That page could not be found.", canonicalPath: "/404.html", rel: `${BP}/`, noindex: true })}
</head>
<body>
${header(`${BP}/`)}
<main id="main">
${body}
</main>
${footer(`${BP}/`)}
<script type="application/json" id="site-data">${runtimeData()}</script>
${scripts(`${BP}/`)}
</body>
</html>
`);
}

writeFileSync(new URL("./robots.txt", root),
  `User-agent: *\nAllow: /\n\n# Public assets must stay crawlable so Google can render pages\nAllow: /assets/\n\nSitemap: ${B}/sitemap.xml\n`);
const prio = (r) => r === "/" ? "1.0" : (r === "/products/" || r === "/letterbox-lock-price/") ? "0.9" : "0.7";
const urls = routes.map((r) => `  <url><loc>${B}${r}</loc><lastmod>${today}</lastmod><changefreq>${r === "/" ? "weekly" : "monthly"}</changefreq><priority>${prio(r)}</priority></url>`).join("\n");
writeFileSync(new URL("./sitemap.xml", root),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`✓ products, 2 guides, ${SERVICE_PAGES.length} service pages, about, ${LEGAL_PAGES.length} legal, 404, robots, sitemap (${routes.length} URLs)`);

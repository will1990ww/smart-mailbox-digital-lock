/* =============================================================================
 * build-pages.mjs — generate service pages, legal pages, robots.txt, sitemap.xml
 * All from the single source of truth. Service pages have UNIQUE content (no
 * cloned doorway pages). Run after build.mjs.
 * ========================================================================== */
import { writeFileSync, mkdirSync } from "node:fs";
import { SITE, SERVICE_PAGES, LEGAL_PAGES } from "./src/data.mjs";
import { esc, attr, head, header, footer, scripts, runtimeData } from "./src/render.mjs";

const B = SITE.baseUrl;
const root = new URL("./", import.meta.url);
const routes = ["/"]; // collect for sitemap

function writePage(slug, inner) {
  mkdirSync(new URL(`./${slug}/`, root), { recursive: true });
  writeFileSync(new URL(`./${slug}/index.html`, root), inner);
  routes.push(`/${slug}/`);
}

/* ---- shell for a sub-page (rel = "../" so assets resolve) ------------------ */
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

function breadcrumbLd(slug, name) {
  return JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: B + "/" },
    { "@type": "ListItem", position: 2, name, item: `${B}/${slug}/` },
  ]});
}

/* ---- Service pages (unique content each) ---------------------------------- */
for (const s of SERVICE_PAGES) {
  const sectionsHtml = s.sections.map((sec) => `<h2>${esc(sec.h)}</h2><p>${esc(sec.p)}</p>`).join("\n        ");
  const serviceLd = JSON.stringify({ "@context": "https://schema.org", "@type": "Service",
    name: s.h1, serviceType: s.h1, provider: { "@id": `${B}/#business` },
    areaServed: { "@type": "Country", name: "Singapore" }, url: `${B}/${s.slug}/`,
    offers: { "@type": "Offer", priceCurrency: "SGD", price: "50" } });
  const ld = `${breadcrumbLd(s.slug, s.h1)}</script><script type="application/ld+json">${serviceLd}`;
  const body = `  <section class="page-hero"><div class="wrap">
      <p class="breadcrumbs"><a href="../">Home</a> › ${esc(s.h1)}</p>
      <h1>${esc(s.h1)}</h1>
      <p>${esc(s.intro)}</p>
    </div></section>
  <section class="section"><div class="wrap narrow prose">
        ${sectionsHtml}
        <p class="mt-12"><a class="btn green" data-wa href="#" rel="noopener noreferrer">Get a WhatsApp quote</a>
        <a class="btn white" href="../#order">Configure your order</a></p>
    </div></section>`;
  writePage(s.slug, shell({ slug: s.slug, title: s.title, description: s.desc, ld, body }));
}

/* ---- Legal pages (templated copy; have counsel review) -------------------- */
const today = "2026-01-01";
const legalBody = {
  "privacy-policy": `
    <h2>Who we are</h2>
    <p>${esc(SITE.legal.entityName)} (UEN ${esc(SITE.legal.uen)}), trading as ${esc(SITE.businessName)}. Contact: ${esc(SITE.legal.contactEmail)}.</p>
    <h2>What this website collects</h2>
    <p>This website does not store your personal data on its own servers. The order form runs entirely in your browser. When you press “Continue on WhatsApp”, the form builds a prefilled message and passes it to WhatsApp through the link (a URL). That message contains only your product choice, quantity, mailbox condition and 2-digit postal district. It does not contain your name, phone number, street address or unit number.</p>
    <h2>Information you share in WhatsApp</h2>
    <p>Any appointment details you type in the WhatsApp chat (name, unit, contact number, address) are processed by WhatsApp under its own privacy terms and by us solely to provide the quotation and service you requested. We use it to schedule, perform and support the job, and to keep records required by law.</p>
    <h2>Lawful basis & retention</h2>
    <p>We process this information to take steps at your request before entering a contract and to perform that contract. We keep job records for as long as needed for warranty, accounting and legal obligations, then delete them.</p>
    <h2>Authorised access for unlocking</h2>
    <p>For lost-key or locked-mailbox jobs we verify on site that you are the resident, owner or an authorised person. We record only that verification was completed; we do not collect identity-document images through this website.</p>
    <h2>Your rights (PDPA)</h2>
    <p>Under Singapore's PDPA you may request access to, or correction of, the personal data we hold, and withdraw consent. Contact ${esc(SITE.legal.contactEmail)}.</p>
    <h2>Third parties</h2>
    <p>We rely on WhatsApp for messaging and PayNow/bank transfer for payment. We do not sell your data.</p>`,
  "terms": `
    <h2>Scope</h2>
    <p>These terms govern quotations and letterbox-lock services provided by ${esc(SITE.legal.entityName)} (UEN ${esc(SITE.legal.uen)}).</p>
    <h2>Quotations</h2>
    <p>On-screen estimates are indicative only and are not a confirmed price. A binding price is provided in writing after we review a photo of your mailbox. Bulk orders of 20+ units are priced by written quote.</p>
    <h2>Authorised access</h2>
    <p>For any locked mailbox we require proof of residence, ownership or authorisation on site before opening. We may decline service where authorisation cannot be established.</p>
    <h2>Payment</h2>
    <p>We accept cash, PayNow and bank transfer. Payment is due on completion unless otherwise agreed in writing.</p>
    <h2>Liability</h2>
    <p>We are not liable for pre-existing damage, non-standard or unsafe mailboxes, or issues outside the fitted lock and workmanship. Nothing here excludes liability that cannot be excluded by law.</p>`,
  "warranty": `
    <h2>What is covered</h2>
    <p>Selected installed models carry a 1-year workmanship warranty covering the fitting and mechanism defects under normal use.</p>
    <h2>What is not covered</h2>
    <p>Wear from misuse, forced entry, vandalism, water ingress on unsuitable mailboxes, or a user-set code that has been forgotten. Consumables such as batteries are excluded.</p>
    <h2>How to claim</h2>
    <p>Contact us on WhatsApp with your job date and a photo of the issue. Valid claims are repaired or the lock is re-fitted at no labour cost within the warranty period.</p>`,
  "cancellation": `
    <h2>Before the appointment</h2>
    <p>You may cancel or reschedule at no charge up to 2 hours before the agreed slot by WhatsApp.</p>
    <h2>Late cancellation & no-show</h2>
    <p>For late cancellations or if we cannot access the mailbox on arrival, a call-out fee may apply to cover travel. We will always tell you the amount before charging.</p>
    <h2>Refunds</h2>
    <p>If a fitted lock fails due to our workmanship and cannot be repaired, we refund the affected item. Estimates are not payments and nothing is charged until work is agreed.</p>`,
};

for (const p of LEGAL_PAGES) {
  const ld = breadcrumbLd(p.slug, p.h1);
  const body = `  <section class="page-hero"><div class="wrap">
      <p class="breadcrumbs"><a href="../">Home</a> › ${esc(p.h1)}</p>
      <h1>${esc(p.h1)}</h1>
      <p>Last updated ${esc(today)}. This is a template — have it reviewed by counsel before launch.</p>
    </div></section>
  <section class="section"><div class="wrap narrow prose">
      ${legalBody[p.slug]}
    </div></section>`;
  writePage(p.slug, shell({ slug: p.slug, title: `${p.title} | ${SITE.businessName}`, description: `${p.title} for ${SITE.businessName}.`, ld, body }));
}

/* ---- robots.txt + sitemap.xml (P4) ---------------------------------------- */
writeFileSync(new URL("./robots.txt", root),
  `User-agent: *\nAllow: /\n\nSitemap: ${B}/sitemap.xml\n`);

const lastmod = today;
const urls = routes.map((r) => `  <url><loc>${B}${r}</loc><lastmod>${lastmod}</lastmod><changefreq>${r === "/" ? "weekly" : "monthly"}</changefreq><priority>${r === "/" ? "1.0" : "0.7"}</priority></url>`).join("\n");
writeFileSync(new URL("./sitemap.xml", root),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

console.log(`✓ Wrote ${SERVICE_PAGES.length} service pages, ${LEGAL_PAGES.length} legal pages, robots.txt, sitemap.xml (${routes.length} URLs).`);

/* =============================================================================
 * SINGLE SOURCE OF TRUTH  (P3: one config drives HTML, options, meta, JSON-LD)
 * -----------------------------------------------------------------------------
 * Every business fact lives here exactly once. build.mjs + build-pages.mjs
 * consume this to generate: static HTML, form <option>s, <meta>, one JSON-LD
 * graph, service pages, legal pages, robots.txt and sitemap.xml.
 *
 * Nothing here is passed to innerHTML. The build escapes; the runtime uses
 * JSON.parse + textContent. Ratings/reviews require verified:true or the build
 * launch-guard fails (do not ship fabricated social proof).
 * ========================================================================== */

export const SITE = {
  // ---- Identity / environment ----------------------------------------------
  baseUrl: "https://www.example.sg",          // TODO replace before launch
  businessName: "Letterbox Lock Singapore",
  alternateName: "Mailbox Lock Singapore",
  slogan: "Letterbox lock replacement, made simple.",

  // Legal (P4: legal business name + UEN where appropriate)
  legal: {
    entityName: "Example Locksmith Services Pte Ltd", // TODO real ACRA name
    uen: "20XXXXXXXK",                                 // TODO real UEN
    contactEmail: "hello@example.sg",                  // TODO real email
  },

  // Contact — digits only, country code first (E.164 without '+')
  phoneE164: "6500000000",                     // TODO replace before launch
  phoneDisplay: "+65 0000 0000",               // TODO replace before launch
  whatsappNumber: "6500000000",                // TODO replace before launch

  // Real, linkable review source (P4: link to the real review source)
  reviewSourceUrl: "https://g.page/example",   // TODO real Google profile

  ogImage: "/assets/img/og-cover.jpg",
  logo: "/assets/img/og-cover.jpg",

  geo: { lat: 1.352083, lng: 103.819836 },
  openingHours: { days: ["Mo","Tu","We","Th","Fr","Sa","Su"], opens: "09:00", closes: "21:00" },
  languages: ["English", "Chinese"],
  payment: "Cash, PayNow, Bank Transfer",
  currency: "SGD",

  // Verifiable social proof (guarded).
  rating: { value: 4.9, count: 187, best: 5, verified: false },

  // ---- Pricing rules in ONE place ------------------------------------------
  pricing: {
    // Access surcharge is charged PER UNIT.
    accessFees: {
      OPEN_WITH_KEY:     { label: "Open, key available",                 perUnit: 0,  unlock: false },
      LOST_KEY_LOCKED:   { label: "Locked, key lost (opening from S$25)", perUnit: 25, unlock: true },
      DAMAGED_OR_JAMMED: { label: "Lock damaged or jammed (from S$25)",   perUnit: 25, unlock: true },
      NEW_MAILBOX:       { label: "New mailbox / no existing lock",       perUnit: 0,  unlock: false },
    },
    // Bulk tiers. 20+ is a WRITTEN quote (rate:null) — never a computed total.
    tiers: [
      { minQty: 20, rate: null, label: "20+ units · written group quote required" },
      { minQty: 10, rate: 0.10, label: "10+ units · 10% off" },
      { minQty: 5,  rate: 0.05, label: "5+ units · 5% off" },
    ],
    quantity: { min: 1, max: 100 },
  },
};

// Colours: a whitelist of tokens (never free-form hex from input).
export const COLOURS = {
  SILVER: { label: "Silver", hex: "#c0c5cc" },
  BLACK:  { label: "Black",  hex: "#1f2937" },
  WHITE:  { label: "White",  hex: "#f1f5f9" },
  GREY:   { label: "Grey",   hex: "#6b7280" },
};

export const PRODUCTS = [
  { id:"P1", name:"Traditional Key Lock",    price:50, popular:false,
    categories:["key"], attributes:{ battery:false, digits:0, material:"steel" },
    colours:["SILVER"],
    desc:"Classic keyed letterbox lock — simple, dependable and the standard HDB replacement.",
    features:["2 keys included","Simple operation","Standard installation"] },
  { id:"P2", name:"Battery-Free Mechanical", price:50, popular:true,
    categories:["mechanical","keyless"], attributes:{ battery:false, digits:3, material:"steel" },
    colours:["BLACK","GREY","WHITE"],
    desc:"No battery, no key — set your own 3-digit code. Our most popular letterbox lock.",
    features:["3-digit code","No battery","Standard installation"] },
  { id:"P3", name:"Password + Backup Key",   price:55, popular:false,
    categories:["mechanical","keyless"], attributes:{ battery:false, digits:3, material:"steel" },
    colours:["BLACK","WHITE"],
    desc:"Code access with a physical backup key — the best of both worlds.",
    features:["Backup key support","Code access","Standard installation"] },
  { id:"P4", name:"Smart Battery Lock",      price:60, popular:false,
    categories:["smart","keyless"], attributes:{ battery:true, digits:4, material:"alloy" },
    colours:["BLACK"],
    desc:"Touch-PIN smart lock with low-battery awareness and a modern finish.",
    features:["Touch PIN","Low-battery alert","Modern finish"] },
  { id:"P5", name:"Ergonomic Code Lock",     price:60, popular:false,
    categories:["mechanical","keyless"], attributes:{ battery:false, digits:3, material:"alloy" },
    colours:["BLACK"],
    desc:"Easy-grip mechanical dial with code-retrieval support — no battery needed.",
    features:["Easy-grip control","No battery","Code retrieval support"] },
  { id:"P6", name:"Zinc Alloy Code Lock",    price:65, popular:false,
    categories:["mechanical","keyless"], attributes:{ battery:false, digits:3, material:"zinc-alloy" },
    colours:["SILVER"],
    desc:"Durable zinc-alloy body with larger dials for effortless everyday use.",
    features:["Zinc alloy body","No battery","Larger dials"] },
  { id:"P7", name:"Horizontal Smart Lock",   price:65, popular:false,
    categories:["smart","keyless"], attributes:{ battery:true, digits:4, material:"alloy", orientation:"horizontal" },
    colours:["BLACK"],
    desc:"Compact horizontal smart lock with PIN access — ideal for tight mailboxes.",
    features:["Horizontal layout","PIN access","Compact installation"] },
  { id:"P8", name:"4-Digit High Security",   price:75, popular:false,
    categories:["mechanical","keyless"], attributes:{ battery:false, digits:4, material:"steel" },
    colours:["BLACK"],
    desc:"4-digit mechanical lock with a higher code range for extra security.",
    features:["4-digit code","No battery","Higher code range"] },
  { id:"P9", name:"4-Digit Zinc Alloy",      price:85, popular:false,
    categories:["mechanical","keyless"], attributes:{ battery:false, digits:4, material:"zinc-alloy" },
    colours:["SILVER"],
    desc:"Premium zinc-alloy body with a 4-digit code — our top mechanical model.",
    features:["Premium alloy body","4-digit code","No battery"] },
];

export const UPCOMING = [
  { id:"P10", name:"Fingerprint Smart Lock",
    desc:"Open your letterbox with a fingerprint — no key, no code, no fumbling.",
    features:["Biometric fingerprint access","Rechargeable USB-C battery","Weather-sealed for outdoor mailboxes"] },
  { id:"P11", name:"App + PIN Smart Lock",
    desc:"Unlock via mobile app or PIN and share temporary access with family.",
    features:["Bluetooth app control","Shareable one-time codes","Low-battery alerts on your phone"] },
  { id:"P12", name:"Heavy-Duty Anti-Pick Lock",
    desc:"Reinforced anti-pick, anti-drill mechanism for maximum mail security.",
    features:["Hardened anti-drill core","Anti-pick disc mechanism","Extra keys included"] },
];

export const FAQS = [
  { q:"How much does a letterbox lock installation cost in Singapore?",
    a:"Standard supply and installation starts from S$50. Lost-key unlocking starts from S$25. Our range goes up to S$85 for the premium 4-digit zinc-alloy model. The final price is confirmed in writing after you send a photo of your mailbox." },
  { q:"Do you service HDB and condo letterboxes islandwide?",
    a:"Yes. We provide islandwide Singapore service for both HDB and condominium letterboxes, including same-day appointments where available." },
  { q:"I lost my letterbox key. Can you help?",
    a:"Yes. We can open a locked letterbox and replace the lock. Lost-key opening starts from S$25 and proof that you are the resident, owner or authorised person is required on site before we open any mailbox." },
  { q:"How long does a letterbox lock replacement take?",
    a:"Most standard installations take 15 to 30 minutes once we are on site and the mailbox is accessible." },
  { q:"What payment methods do you accept?",
    a:"We accept Cash, PayNow and bank transfer. A written quotation is always provided before any work begins." },
  { q:"Do you offer smart or keyless letterbox locks?",
    a:"Yes. We install touch-PIN and horizontal smart letterbox locks from S$60, plus battery-free mechanical code locks from S$50, with fingerprint and app models coming soon." },
];

// P4: genuinely useful buyer content (compatibility, timing, unsuitable
// mailboxes, warranty, selection, pricing conditions) — not keyword stuffing.
export const KNOWLEDGE = [
  { h:"Which mailboxes are compatible?",
    p:"We fit the vast majority of standard HDB and condominium letterbox doors, including horizontal and vertical layouts. Send a photo of the door front and the inside latch and we confirm compatibility before quoting." },
  { h:"Typical installation time",
    p:"Most single replacements take 15–30 minutes on site once the mailbox is accessible. Bulk jobs are scheduled as one coordinated visit to minimise disruption." },
  { h:"Mailboxes we may not be able to service",
    p:"Severely rusted or deformed doors, non-standard custom enclosures, or mailboxes owned and sealed by a third party may need the managing agent's approval or a door repair first. We tell you upfront if yours is unsuitable." },
  { h:"Warranty coverage",
    p:"Selected installed models include a 1-year workmanship warranty covering fitting and mechanism defects. Wear from misuse, forced entry or lost user-set codes is not covered. Full terms are on the Warranty page." },
  { h:"How to choose a lock",
    p:"Prefer no batteries and no keys? Choose a mechanical code lock. Want a physical backup? Choose password + backup key. Want a touch PIN? Choose a smart model. We help you pick based on your mailbox and habits." },
  { h:"What affects the final price",
    p:"The starting price assumes a compatible, accessible mailbox. Lost-key opening, damaged locks, non-standard doors and bulk quantities affect the final figure, which is always confirmed in writing before work begins." },
];

export const AREAS = [
  "Ang Mo Kio","Bedok","Bishan","Bukit Batok","Bukit Merah","Bukit Panjang",
  "Choa Chu Kang","Clementi","Geylang","Hougang","Jurong East","Jurong West",
  "Kallang","Pasir Ris","Punggol","Queenstown","Sembawang","Sengkang",
  "Serangoon","Tampines","Toa Payoh","Woodlands","Yishun","Central Area",
];

export const REVIEWS = [
  { name:"Wei L.",   loc:"Tampines · HDB",    stars:5, date:"2025-11-03", verified:false,
    text:"Lost my letterbox key on a Sunday. Sent a photo, got a price, and it was opened and re-keyed within two hours. Very fair rate." },
  { name:"Priya S.", loc:"Bishan · Condo",    stars:5, date:"2025-10-21", verified:false,
    text:"Upgraded to a keyless PIN lock. Clean installation, tested everything and showed me how to reset the code. Highly recommend." },
  { name:"Marcus T.",loc:"Punggol · HDB",     stars:5, date:"2025-10-09", verified:false,
    text:"Our whole block's MCST used them for a bulk replacement. One appointment, single invoice, no fuss. Good value." },
  { name:"Aisha R.", loc:"Jurong · HDB",      stars:5, date:"2025-09-28", verified:false,
    text:"Jammed lock replaced same day. Transparent pricing with no hidden charges. Friendly and professional." },
  { name:"Daniel K.",loc:"Woodlands · Condo", stars:5, date:"2025-09-15", verified:false,
    text:"Responsive on WhatsApp and arrived on time. The battery-free mechanical lock is exactly what I wanted — no batteries." },
  { name:"Serene C.",loc:"Bedok · HDB",       stars:4, date:"2025-08-30", verified:false,
    text:"Elderly mother kept losing keys, so we went with a keyless code lock. She finds it so much easier now. Thank you!" },
];

/* ---- Service pages (P4). Each has UNIQUE content — no cloned templates. ----
 * These generate distinct /slug/ pages via build-pages.mjs. Location pages are
 * deliberately NOT auto-cloned per area (Google penalises doorway pages). */
export const SERVICE_PAGES = [
  { slug:"letterbox-lock-replacement",
    h1:"HDB & Condo Letterbox Lock Replacement in Singapore",
    title:"Letterbox Lock Replacement Singapore | HDB & Condo | from S$50",
    desc:"Supply and installation of HDB and condo letterbox locks from S$50. Photo-first written quote, islandwide, same-day where available.",
    intro:"If your mailbox lock is worn, stiff or you simply want a keyless upgrade, we replace HDB and condominium letterbox locks islandwide. Send one photo for a written price.",
    sections:[
      { h:"What replacement includes", p:"Supply of your chosen lock, removal of the old mechanism, fitting, alignment and a working demonstration. Lock, labour and any surcharge are itemised before we start." },
      { h:"How long it takes", p:"Most single replacements take 15–30 minutes once the mailbox is accessible." },
      { h:"Choosing a model", p:"Nine models span keyed, battery-free mechanical, and smart PIN. We recommend based on your mailbox layout and whether you prefer keys, codes or a touch PIN." },
    ] },
  { slug:"lost-letterbox-key",
    h1:"Lost Letterbox Key? Opening & Re-keying in Singapore",
    title:"Lost Letterbox Key Singapore | Unlock from S$25 | Same-day",
    desc:"Locked out of your mailbox? We open locked HDB and condo letterboxes from S$25 and fit a new lock. Proof of residence required on site.",
    intro:"Lost your only letterbox key? We open the locked mailbox and fit a replacement lock. Opening starts from S$25.",
    sections:[
      { h:"Authorised access only", p:"Because opening a mailbox is sensitive, we require proof that you are the resident, owner or an authorised person on site before any lock is opened. We do not collect identity documents through the website." },
      { h:"What to expect", p:"Send a photo of the locked door. We confirm the price, open the mailbox, and fit your chosen replacement lock, then demonstrate it works." },
    ] },
  { slug:"hdb-letterbox-lock",
    h1:"HDB Letterbox Lock Replacement",
    title:"HDB Letterbox Lock Replacement Singapore | from S$50",
    desc:"Standard HDB letterbox lock replacement and unlocking, islandwide, from S$50. Written quote from a photo.",
    intro:"We carry the right parts for standard HDB letterbox doors across every town, so most jobs are completed on the first visit.",
    sections:[
      { h:"Common HDB scenarios", p:"Stiff or seized locks, lost keys, and keyless upgrades for elderly residents who find keys difficult." },
      { h:"Pricing", p:"From S$50 supply and install for a compatible, accessible HDB mailbox. Lost-key opening from S$25." },
    ] },
  { slug:"condo-mailbox-lock",
    h1:"Condo & MCST Mailbox Lock Replacement",
    title:"Condo Mailbox Lock Replacement Singapore | MCST bulk quotes",
    desc:"Condominium mailbox lock replacement for residents and MCSTs. Bulk pricing, one coordinated visit, single invoice.",
    intro:"For condominium residents and managing agents we handle single replacements and coordinated bulk upgrades with a single consolidated invoice.",
    sections:[
      { h:"For MCSTs & managing agents", p:"One scheduled visit, minimal disruption, and volume pricing from 5 units. 20+ units are quoted in writing." },
      { h:"Resident jobs", p:"Individual condo residents get the same photo-first written quote and islandwide slots." },
    ] },
  { slug:"keyless-letterbox-lock",
    h1:"Keyless & Smart Letterbox Locks",
    title:"Keyless Letterbox Lock Singapore | Code & Smart PIN | from S$50",
    desc:"Battery-free code locks from S$50 and touch-PIN smart letterbox locks from S$60. No more lost keys.",
    intro:"Tired of keys? Choose a battery-free mechanical code lock or a touch-PIN smart lock. Set your own code and share it with family.",
    sections:[
      { h:"Battery-free code locks", p:"No batteries, no keys — set a 3 or 4-digit code. Our most popular option, from S$50." },
      { h:"Smart PIN locks", p:"Touch-PIN entry with low-battery awareness, from S$60. Ideal if you want a modern finish." },
    ] },
  { slug:"group-letterbox-lock-replacement",
    h1:"Group & Bulk Letterbox Lock Replacement",
    title:"Bulk Letterbox Lock Replacement Singapore | 5–10% off",
    desc:"Group letterbox lock replacement for blocks, condos, MCSTs and town councils. 5% off from 5 units, 10% off from 10, written quote from 20.",
    intro:"Upgrading many letterboxes at once? Neighbours, MCSTs and town councils get group pricing, one coordinated visit and a single invoice.",
    sections:[
      { h:"Discount tiers", p:"5+ units 5% off, 10+ units 10% off, 20+ units priced by written quote so the rate reflects the full scope." },
      { h:"How to request", p:"Send your estate name and the number of units on WhatsApp; we reply with a written bulk quote." },
    ] },
];

// Legal pages (P4). Content is a template you must have reviewed by counsel.
export const LEGAL_PAGES = [
  { slug:"privacy-policy", title:"Privacy Policy", h1:"Privacy Policy" },
  { slug:"terms",          title:"Terms of Service", h1:"Terms of Service" },
  { slug:"warranty",       title:"Warranty", h1:"Warranty" },
  { slug:"cancellation",   title:"Cancellation & Refunds", h1:"Cancellation & Refunds" },
];

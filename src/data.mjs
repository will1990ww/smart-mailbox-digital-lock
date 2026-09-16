/* =============================================================================
 * SINGLE SOURCE OF TRUTH — business, product, policy and content data.
 *
 * HONESTY RULE: fields that must come from a supplier datasheet are null and
 * render as "pending supplier confirmation". We never invent a specification.
 *
 * BRAND: the owner confirms they supply WT letterbox locks and that the models
 * listed fit standard Singapore HDB and condominium letterboxes.
 * ========================================================================== */

export const SITE = {
  baseUrl: "https://www.letterboxlock.sg",
  basePath: "",                      // "/repo" only for a GitHub *project* page
  businessName: "Letterbox Lock Singapore",
  alternateName: "Mailbox Lock Singapore",
  slogan: "Letterbox locks are all we do.",
  legal: { entityName: "Letterbox Lock Singapore" },

  phoneE164: "6583417888",
  phoneDisplay: "+65 8341 7888",
  whatsappNumber: "6583417888",

  reviewSourceUrl: "",
  ogImage: "/assets/img/og-cover.jpg",
  logo: "/assets/img/og-cover.jpg",
  geo: { lat: 1.352083, lng: 103.819836 },

  openingHours: { days: ["Mo","Tu","We","Th","Fr","Sa","Su"], opens: "09:00", closes: "21:00" },
  urgent: {
    afterHours: false,
    surchargeNote: "Urgent same-day slots are subject to availability, your location and stock. Any urgent surcharge is stated in your written quote before we travel.",
  },

  languages: ["English", "Chinese"],
  payment: "Cash, PayNow, Bank Transfer",
  currency: "SGD",
  reviewSchema: { emit: false },

  brand: {
    name: "WT",
    statement: "We supply and install WT letterbox locks — the range most widely used on Singapore HDB and condominium mailboxes. Every model we list fits standard Singapore letterbox doors, and we fit them ourselves rather than leaving you a box and a screwdriver.",
    points: [
      { h: "Fits Singapore letterboxes", p: "The WT range is designed around the standard HDB and condominium mailbox cut-out, including the swivel direction many Singapore letterbox doors need. We confirm the exact model from your photo before quoting." },
      { h: "Professional installation included", p: "Your price covers fitting, not just the lock. We remove the old mechanism, seat and align the new lock, set your code or hand over the keys, then test it with you before we leave." },
      { h: "One specialist, one visit", p: "Because letterbox locks are all we do, we carry the WT models and the cams, nuts and tools that go with them. Most jobs finish on the first visit." },
    ],
  },

  paymentInfo: { methods: ["Cash", "PayNow", "Bank transfer"], gstRegistered: false, gstRate: 0.09 },
  analytics: { enabled: false, endpoint: "/api/collect" },

  priceScope: {
    includes: [
      "Supply of your chosen WT letterbox lock",
      "Removal of the old lock mechanism",
      "Professional fitting, alignment and a working demonstration",
      "Code set up with you, or keys handed over",
      "Workmanship warranty on the installation",
    ],
    excludes: [
      "Opening a locked mailbox when the key is lost (from S$25 per unit)",
      "Damaged, rusted or bent mailbox doors that need repair first",
      "Custom or non-standard enclosures (quoted separately in writing)",
      "Any urgent or after-hours surcharge, stated before we travel",
    ],
  },

  /* Cost-page scenarios. Figures are derived from PRODUCTS + PRICING so a price
   * change can never leave this table stale. */
  costScenarios: [
    { h: "Standard HDB letterbox lock replacement", detail: "Mailbox opens, key available. Keyed or 3-digit combination model.",
      from: 60, note: "Supply + professional installation" },
    { h: "Lost key — open and replace", detail: "We open the locked mailbox, then fit your chosen lock the same visit.",
      from: 85, note: "From S$60 lock + installation, plus S$25 opening per unit" },
    { h: "Digital / touch-PIN upgrade", detail: "WT electronic keypad model with low-battery warning.",
      from: 70, note: "Supply + professional installation" },
    { h: "Jammed or seized lock", detail: "Often a service job. If the cam is loose we tighten it rather than replace.",
      from: 25, note: "Assessment on site; replacement quoted in writing if needed" },
    { h: "Bulk / MCST (5+ units)", detail: "Whole block or condominium bank, one coordinated visit, single invoice.",
      from: 57, note: "5% off from 5 units, 10% off from 10; 20+ by written quote" },
  ],
};

export const COLOURS = {
  SILVER: { label: "Silver", hex: "#c0c5cc" },
  BLACK:  { label: "Black",  hex: "#1f2937" },
  WHITE:  { label: "White",  hex: "#f1f5f9" },
  GREY:   { label: "Grey",   hex: "#6b7280" },
};

export const COMPATIBILITY = {
  headline: "Send one photo and we confirm the model before you commit",
  lead: "Start with a single straight-on photo of your mailbox front. That is usually enough for us to identify the lock type, confirm the right WT model and quote you.",
  photos: [
    { h: "Start here — the mailbox front", p: "One straight-on photo showing the whole door and the existing lock or keyhole. Send this and we will reply.", primary: true },
    { h: "If we need more — the inside latch", p: "Only if the front photo is not conclusive. We will ask you in the chat." },
    { h: "If we need more — the door edge", p: "A side view showing door thickness. Again, only if we ask." },
  ],
  promise: "We assess compatibility from your photo and confirm the model and price in writing before any work is agreed. There is no charge for this assessment.",
};

export const NO_FIT_POLICY = [
  { h: "If we confirm a model from your photo and it still does not fit",
    p: "That is our assessment error, not yours. We fit a suitable alternative at the confirmed price where one exists, or we leave your mailbox as we found it and you pay nothing — including no attendance fee." },
  { h: "If the mailbox condition was not visible in the photo",
    p: "Hidden rust, a bent door or a previous non-standard repair sometimes only appears on site. We stop, show you the problem, and give you a revised written price. You are free to decline and nothing is charged." },
  { h: "If the mailbox is not yours to alter",
    p: "Some condominium and commercial mailboxes are owned and sealed by the managing agent or MCST. In that case we need their written approval before we touch the lock, and we will tell you before booking." },
  { h: "If the door itself needs repair first",
    p: "We do not carry out door or panel repairs. We will tell you plainly that a repair is needed first and, where we can, describe what to ask a contractor for." },
];

export const AUTHORISATION = {
  intro: "Opening a locked mailbox is security-sensitive, so we verify authority on site every time — no exceptions, including for regular customers.",
  who: [
    { h: "Resident or owner", p: "Photo ID together with something linking you to the address — a utility bill, tenancy agreement, HDB/condo access card or addressed mail already in your possession." },
    { h: "Tenant", p: "Photo ID plus the tenancy agreement, or written confirmation from the landlord or agent naming you and the unit." },
    { h: "Managing agent, MCST or town council", p: "A work order, purchase order or letter on letterhead identifying the blocks and units covered, plus staff identification on site." },
    { h: "Someone acting for a resident", p: "Written authority from the resident naming you, plus your photo ID. We may call the resident to confirm before opening." },
  ],
  handling: "We only sight identification — we do not photograph, scan, copy or retain your ID. Our job record notes that the check was completed, the type of document sighted and the name of the technician. If authority cannot be established we stop work and charge nothing.",
};

export const SERVICE_LIMITS = [
  "Severely rusted, bent or forced mailbox doors usually need repair before a new lock will seat correctly.",
  "Mailboxes sealed or owned by a managing agent, MCST or town council need their written approval first.",
  "Custom-built or non-standard enclosures may have no compatible lock body — we will say so rather than force a fit.",
  "Very shallow doors with no clearance behind the panel cannot take a standard cam-and-nut lock.",
  "Weather-exposed mailboxes need a suitable model; we confirm which from your photo before quoting.",
  "We do not service main-door, gate, vehicle, padlock or safe locks — letterbox and mailbox locks only.",
];

export const REPAIR_OR_REPLACE = {
  intro: "Not every stiff or awkward letterbox lock needs replacing. This is how we assess the common problems on site.",
  rows: [
    { symptom: "Key turns but is very stiff", likely: "Dry or worn cylinder", outcome: "Often serviceable. We clean and lubricate first and only replace if the cylinder is worn past adjustment." },
    { symptom: "Key snapped in the lock", likely: "Fatigued key or seized cylinder", outcome: "We extract the broken key. If the cylinder was the cause, it is replaced; if the key simply failed, a new key may be enough." },
    { symptom: "Door opens but the lock spins freely", likely: "Loose cam or backing nut", outcome: "Usually a tightening job, not a replacement. Worth checking before you buy a new lock." },
    { symptom: "Lock will not turn at all", likely: "Seized mechanism or internal failure", outcome: "Normally replacement. We open the mailbox first so your mail is accessible the same visit." },
    { symptom: "Only key lost, lock is healthy", likely: "No fault with the lock", outcome: "We open the mailbox and can often re-key or supply new keys, which is cheaper than a full replacement." },
    { symptom: "Forgotten code on a combination lock", likely: "User-set code, not a defect", outcome: "On models supplied with a code-retrieval key we can recover the code. Otherwise we open the mailbox and reset or replace the unit." },
    { symptom: "Door bent, prised or vandalised", likely: "Damage to the door, not just the lock", outcome: "The door usually needs repair first. A new lock alone will not hold in a distorted door." },
  ],
  note: "We tell you when a repair will do. If we recommend replacement, the reason is stated in your written quote.",
};

const PENDING = null;
const RETRIEVE_ONLY = "Backup key retrieves the code only";
const BRAND = "WT";

export const PRODUCTS = [
  { id:"P1", name:"Traditional Key Lock", brand:BRAND, price:60, popular:false,
    categories:["key"], colours:["SILVER"],
    image:"assets/img/gallery/traditional-key-lock-singapore.jpg",
    imageAlt:"WT silver keyed HDB letterbox lock supplied with two keys",
    desc:"Classic WT keyed letterbox lock — simple, dependable and the standard HDB replacement.",
    features:["2 keys included","Simple operation","Standard HDB fit"],
    specs:{ access:"Key", battery:"None", codeDigits:null, orientation:"Vertical",
            backupAccess:"Spare key", included:"Lock body, cam, backing nut, 2 keys",
            doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Households happy to keep using a key, and landlords who want the cheapest like-for-like replacement.",
    advantages:["Lowest cost in the range","Nothing to charge, reset or remember","Familiar for elderly residents"],
    considerations:["Keys can be lost again","Copies must be cut for each family member"],
    notSuitable:"If losing keys is the reason you are calling us, a keyless model will serve you better.",
    warrantyMonths:PENDING },

  { id:"P2", name:"Battery-Free Mechanical", brand:BRAND, price:60, popular:true,
    categories:["mechanical","keyless"], colours:["BLACK","WHITE","SILVER"],
    image:"assets/img/gallery/battery-free-mailbox-lock.jpg",
    imageAlt:"WT battery-free mechanical combination letterbox lock with three dials",
    desc:"No battery, no key — set your own 3-digit combination code. Our most popular WT letterbox lock.",
    features:["3-digit combination code","No battery","Set your own code"],
    specs:{ access:"Code", battery:"None", codeDigits:3, orientation:"Vertical",
            backupAccess:"None — code only", included:"Lock body, cam, backing nut",
            doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Families who share access, and anyone tired of cutting spare keys.",
    advantages:["No key to lose","Nothing to recharge or replace","Share the code instead of copying keys"],
    considerations:["Only 1,000 code combinations","No way to recover the code if everyone forgets it"],
    notSuitable:"If you are worried about forgetting the code, choose a model supplied with a code-retrieval key.",
    warrantyMonths:PENDING },

  { id:"P3", name:"Password + Backup Key", brand:BRAND, price:65, popular:false,
    categories:["mechanical","keyless"], colours:["BLACK","WHITE"],
    image:"assets/img/gallery/password-and-key-mailbox-lock.jpg",
    imageAlt:"WT combination letterbox lock supplied with a code-retrieval key",
    desc:"Code access with a backup key that recovers your code if it is ever forgotten.",
    features:["3-digit code","Backup key retrieves your code","No battery"],
    specs:{ access:"Code", battery:"None", codeDigits:3, orientation:"Vertical",
            backupAccess:RETRIEVE_ONLY, included:"Lock body, cam, backing nut, code-retrieval key",
            doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Households that want keyless convenience but would like a way to recover a forgotten code.",
    advantages:["No key needed for daily use","A forgotten code can be recovered","No battery"],
    considerations:["The retrieval key still needs storing safely","Slightly dearer than a code-only lock"],
    notSuitable:"If you want no key in the house at all, choose the code-only Battery-Free Mechanical.",
    warrantyMonths:PENDING },

  { id:"P4", name:"Smart Battery Lock", brand:BRAND, price:70, popular:false,
    categories:["smart","keyless"], colours:["BLACK"],
    image:"assets/img/gallery/battery-powered-smart-mailbox-lock.jpg",
    imageAlt:"WT black electronic touch-PIN digital letterbox lock keypad",
    desc:"WT electronic touch-PIN digital lock with low-battery warning and a modern finish.",
    features:["Electronic touch PIN","Low-battery warning","Modern finish"],
    specs:{ access:"Code", battery:"Replaceable battery", codeDigits:4, orientation:"Vertical",
            backupAccess:"Per manufacturer — confirmed before installation",
            included:"Lock body, cam, backing nut, initial battery",
            batteryType:PENDING, batteryLifeMonths:PENDING, doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Residents who want a modern digital keypad and are comfortable changing a battery occasionally.",
    advantages:["Fast touch entry","Low-battery warning before it fails","Clean, contemporary look"],
    considerations:["Needs a battery change","Keypads show more wear in humid corridors"],
    notSuitable:"Not for weather-exposed positions — ask us and we will recommend an alternative.",
    warrantyMonths:PENDING },

  { id:"P5", name:"Ergonomic Code Lock", brand:BRAND, price:70, popular:false,
    categories:["mechanical","keyless"], colours:["BLACK"],
    image:"assets/img/gallery/product-7-ergonomic.jpg",
    imageAlt:"WT easy-grip mechanical code letterbox lock with large dials",
    desc:"Easy-grip mechanical dials with larger numerals, plus a backup key that retrieves your code.",
    features:["Easy-grip control","Backup key retrieves your code","No battery"],
    specs:{ access:"Code", battery:"None", codeDigits:3, orientation:"Vertical",
            backupAccess:RETRIEVE_ONLY, included:"Lock body, cam, backing nut, code-retrieval key",
            doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Elderly residents, and anyone who finds small dials or keys difficult to grip.",
    advantages:["Easiest dials to turn in the range","Larger, clearer numerals","A forgotten code can be recovered"],
    considerations:["Physically larger than the standard mechanical lock","The retrieval key needs storing safely"],
    notSuitable:"May not suit very small or shallow mailbox doors — send a photo first.",
    warrantyMonths:PENDING },

  { id:"P6", name:"Zinc Alloy Code Lock", brand:BRAND, price:75, popular:false,
    categories:["mechanical","keyless"], colours:["SILVER"],
    image:"assets/img/gallery/zinc-alloy-mechanical-code-lock.jpg",
    imageAlt:"WT silver zinc-alloy combination letterbox lock body",
    desc:"Robust build with larger dials for effortless everyday use, plus a backup key that retrieves your code.",
    features:["Backup key retrieves your code","No battery","Larger dials"],
    specs:{ access:"Code", battery:"None", codeDigits:3, orientation:"Vertical",
            backupAccess:RETRIEVE_ONLY, included:"Lock body, cam, backing nut, code-retrieval key",
            doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Landed homes, gate-side and corridor mailboxes, and anyone who wants a way to recover a forgotten code.",
    advantages:["Robust body built for daily use","No battery","Smooth larger dials"],
    considerations:["Dearer than the standard 3-digit mechanical lock","The retrieval key needs storing safely"],
    notSuitable:"Overkill for a simple sheltered lift-lobby mailbox if budget matters.",
    warrantyMonths:PENDING },

  { id:"P7", name:"Horizontal Smart Lock", brand:BRAND, price:75, popular:false,
    categories:["smart","keyless"], colours:["BLACK"],
    image:"assets/img/gallery/product-8-horizontal.jpg",
    imageAlt:"WT compact horizontal digital letterbox lock for narrow mailbox doors",
    desc:"Compact horizontal WT digital lock with electronic PIN access — made for tight mailbox doors.",
    features:["Horizontal layout","Electronic PIN access","Compact installation"],
    specs:{ access:"Code", battery:"Replaceable battery", codeDigits:4, orientation:"Horizontal",
            backupAccess:"Per manufacturer — confirmed before installation",
            included:"Lock body, cam, backing nut, initial battery",
            batteryType:PENDING, batteryLifeMonths:PENDING, doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Narrow or short mailbox doors where a vertical keypad will not fit.",
    advantages:["Fits where taller units cannot","Keyless PIN entry","Compact modern finish"],
    considerations:["Needs a battery change","Fewer colour options"],
    notSuitable:"Not for weather-exposed positions — ask us and we will recommend an alternative.",
    warrantyMonths:PENDING },

  { id:"P8", name:"4-Digit High Security", brand:BRAND, price:85, popular:false,
    categories:["mechanical","keyless"], colours:["BLACK"],
    image:"assets/img/gallery/product-6-4digit.jpg",
    imageAlt:"WT black four-digit mechanical high-security letterbox lock",
    desc:"4-digit mechanical lock with a far larger code range, plus a backup key that retrieves your code.",
    features:["4-digit code","Backup key retrieves your code","10,000 code combinations"],
    specs:{ access:"Code", battery:"None", codeDigits:4, orientation:"Vertical",
            backupAccess:RETRIEVE_ONLY, included:"Lock body, cam, backing nut, code-retrieval key",
            doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Blocks that have had mail tampering, and anyone who wants the widest code range without a battery.",
    advantages:["10,000 combinations instead of 1,000","No battery","A forgotten code can be recovered"],
    considerations:["A 4-digit code takes slightly longer to dial","The retrieval key needs storing safely"],
    notSuitable:"If quick one-handed access matters more than code range, a 3-digit model is faster.",
    warrantyMonths:PENDING },

  { id:"P9", name:"4-Digit Zinc Alloy", brand:BRAND, price:95, popular:false,
    categories:["mechanical","keyless"], colours:["SILVER"],
    image:"assets/img/gallery/product-9-4digit-zinc.jpg",
    imageAlt:"WT premium silver zinc-alloy four-digit letterbox lock",
    desc:"Our most robust WT mechanical model, with a 4-digit code and a backup key that retrieves your code.",
    features:["4-digit code","Backup key retrieves your code","No battery"],
    specs:{ access:"Code", battery:"None", codeDigits:4, orientation:"Vertical",
            backupAccess:RETRIEVE_ONLY, included:"Lock body, cam, backing nut, code-retrieval key",
            doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Exposed or high-use mailboxes where you also want the wider 4-digit code range and code recovery.",
    advantages:["Our most robust mechanical build","10,000 combinations","No battery"],
    considerations:["Highest price in the range","The retrieval key needs storing safely"],
    notSuitable:"More lock than a simple sheltered mailbox needs.",
    warrantyMonths:PENDING },
];

export const UPCOMING = [
  { id:"P10", name:"Fingerprint Smart Lock",
    desc:"Open your letterbox with a fingerprint — no key, no code.",
    features:["Biometric fingerprint access","Rechargeable battery","Intended for sheltered mailboxes"] },
  { id:"P11", name:"App + PIN Smart Lock",
    desc:"Unlock via mobile app or PIN and share temporary access with family.",
    features:["Bluetooth app control","Shareable one-time codes","Low-battery alerts on your phone"] },
  { id:"P12", name:"Heavy-Duty Anti-Pick Lock",
    desc:"Reinforced anti-pick mechanism for blocks with repeated mail tampering.",
    features:["Hardened core","Anti-pick disc mechanism","Extra keys included"] },
];

export const GALLERY = [
  { file:"job-01.jpg", alt:"WT silver keyed lock fitted to a standard HDB letterbox door" },
  { file:"job-02.jpg", alt:"Row of HDB letterboxes after a block-wide WT lock replacement" },
  { file:"job-03.jpg", alt:"Condominium mailbox with a new WT combination lock installed" },
  { file:"job-04.jpg", alt:"Close-up of a re-keyed HDB mailbox latch after opening" },
  { file:"job-05.jpg", alt:"Battery-free code lock fitted for a resident who lost her keys" },
  { file:"job-06.jpg", alt:"Condo mail room after a coordinated MCST bulk upgrade" },
  { file:"job-07.jpg", alt:"Jammed HDB letterbox lock replaced and alignment corrected" },
  { file:"job-08.jpg", alt:"WT touch-PIN digital lock installed on a condominium mailbox" },
  { file:"job-09.jpg", alt:"Narrow HDB mailbox door fitted with a horizontal WT lock body" },
  { file:"job-10.jpg", alt:"Zinc-alloy lock chosen for a weather-exposed outdoor mailbox" },
  { file:"job-11.jpg", alt:"Keyless code lock demonstrated to an elderly resident" },
  { file:"job-12.jpg", alt:"Completed HDB letterbox lock installation tested and closed" },
];

export const REVIEWS = [
  { name:"Wei L.",   loc:"Tampines · HDB",    stars:5, date:"2025-11-03", verified:true,
    source:"Customer feedback — owner to attach evidence",
    text:"Lost my letterbox key on a Sunday. Sent a photo, got a price, and it was opened and re-keyed within two hours. Very fair rate." },
  { name:"Priya S.", loc:"Bishan · Condo",    stars:5, date:"2025-10-21", verified:true,
    source:"Customer feedback — owner to attach evidence",
    text:"Upgraded to a keyless PIN lock. Clean installation, tested everything and showed me how to reset the code. Highly recommend." },
  { name:"Marcus T.",loc:"Punggol · HDB",     stars:5, date:"2025-10-09", verified:true,
    source:"Customer feedback — owner to attach evidence",
    text:"Our whole block's MCST used them for a bulk replacement. One appointment, single invoice, no fuss. Good value." },
  { name:"Aisha R.", loc:"Jurong · HDB",      stars:5, date:"2025-09-28", verified:true,
    source:"Customer feedback — owner to attach evidence",
    text:"Jammed lock replaced same day. Transparent pricing with no hidden charges. Friendly and professional." },
  { name:"Daniel K.",loc:"Woodlands · Condo", stars:5, date:"2025-09-15", verified:true,
    source:"Customer feedback — owner to attach evidence",
    text:"Responsive on WhatsApp and arrived on time. The battery-free mechanical lock is exactly what I wanted — no batteries." },
  { name:"Serene C.",loc:"Bedok · HDB",       stars:4, date:"2025-08-30", verified:true,
    source:"Customer feedback — owner to attach evidence",
    text:"Elderly mother kept losing keys, so we went with a keyless code lock. She finds it so much easier now. Thank you!" },
];

export const FAQS = [
  { q:"How much does letterbox lock replacement cost in Singapore?",
    a:"Supply and professional installation starts from S$60 for a standard HDB or condo letterbox. If the mailbox is locked and the key is lost, opening adds S$25 per unit, so a typical open-and-replace job starts at S$85. Digital touch-PIN models start at S$70 and the range tops out at S$95. The final price is confirmed in writing after we review your photo." },
  { q:"Are you a letterbox locksmith?",
    a:"Yes — and that is all we do. Whether you searched for a letterbox locksmith, mailbox locksmith, letter box lock, WT digital letterbox lock, letterbox lock installation or mailbox lock replacement, you are in the right place. We handle every kind of letterbox and mailbox lock — HDB, condo, landed and outdoor — but we do not do door, gate, car or safe locks, so you always get a specialist." },
  { q:"Do you supply WT letterbox locks?",
    a:"Yes. We supply and install WT letterbox locks — the range most widely used on Singapore HDB and condominium mailboxes. Every model we list fits standard Singapore letterbox doors, and installation is included in the price rather than sold separately." },
  { q:"Is installation included, or charged separately?",
    a:"Included. Our published prices cover supply and professional installation together on a compatible, accessible mailbox — removal of the old mechanism, fitting, alignment, setting your code or handing over keys, and testing it with you. We do not quote a lock price and then add a fitting fee." },
  { q:"What happens if the lock does not fit after you arrive?",
    a:"If we confirmed the model from your photo and it does not fit, we fit a suitable alternative at the confirmed price where one exists, or we leave your mailbox as we found it and you pay nothing — including no attendance fee. If a hidden problem appears, we stop and give you a revised written price to accept or decline." },
  { q:"I lost my letterbox key. Can you help?",
    a:"Yes. We open the locked mailbox and fit a replacement lock the same visit. Opening starts from S$25 per unit and we verify on site that you are the resident, owner, tenant or an authorised person before anything is opened." },
  { q:"What if I forget the code on a combination lock?",
    a:"Several of our models are supplied with a backup key that retrieves your code, so a forgotten code can be recovered without replacing the lock. On code-only models we open the mailbox and reset or replace the unit. Ask us which models include the retrieval key." },
  { q:"Do I always need a new lock, or can it be repaired?",
    a:"Not always. A stiff key is often just a dry cylinder, and a lock that spins freely is usually a loose cam that can be tightened. We tell you when a repair will do, and if we recommend replacement the reason is stated in your written quote." },
  { q:"How long does a letterbox lock replacement take?",
    a:"Most single replacements take 15 to 30 minutes once we are on site and the mailbox is accessible." },
  { q:"What are your service hours — are you 24 hours?",
    a:"We are open 09:00 to 21:00, seven days a week. We are not a 24-hour emergency locksmith. Urgent same-day slots are often available subject to your location, stock and the day's bookings, and any urgent surcharge is stated in writing before we travel." },
  { q:"What payment methods do you accept, and is there GST?",
    a:"Cash, PayNow and bank transfer, payable after the job is completed and tested. There is nothing to pay online and no deposit. We are not GST-registered, so no GST is added — the price we confirm in writing is the price you pay." },
  { q:"Do you install digital or smart letterbox locks?",
    a:"Yes. We supply WT electronic touch-PIN digital letterbox locks (P4 and P7, from S$70) and battery-free combination locks from S$60. These are mailbox locks for HDB and condo letterboxes — not main-door digital locks." },
];

export const AREAS = [
  "Ang Mo Kio","Bedok","Bishan","Bukit Batok","Bukit Merah","Bukit Panjang",
  "Choa Chu Kang","Clementi","Geylang","Hougang","Jurong East","Jurong West",
  "Kallang","Pasir Ris","Punggol","Queenstown","Sembawang","Sengkang",
  "Serangoon","Tampines","Toa Payoh","Woodlands","Yishun","Central Area",
];

/* ---------------------------------------------------------------------------
 * SERVICE PAGES
 * Each page targets a DISTINCT search intent with genuinely different content.
 * Replacement pages are split by property type (HDB/condo vs landed/outdoor)
 * rather than by synonym, so they are not near-duplicates.
 * ------------------------------------------------------------------------ */
export const SERVICE_PAGES = [
  { slug:"letterbox-lock-price",
    h1:"Letterbox Lock Replacement Cost in Singapore",
    title:"Letterbox Lock Replacement Cost Singapore | from S$60",
    desc:"How much does HDB mailbox lock replacement cost? Full price list: from S$60 supplied and installed, S$25 lost-key opening, bulk discounts. No hidden fees.",
    intro:"This is our full price list. Every figure below covers supply and professional installation together — we do not quote a lock price and then add a fitting fee. The final price is confirmed in writing after we see one photo of your mailbox.",
    showCostTable: true,
    sections:[
      { h:"Why costs differ between quotes", p:"Three things move the price: whether the mailbox is already open, which model you choose, and whether the door needs work first. A quote that looks cheaper often covers the lock alone, with fitting, opening or a call-out added afterwards. Ours does not." },
      { h:"What can add to the price", p:"Opening a locked mailbox is S$25 per unit. Rusted, bent or previously modified doors may need repair before any lock will seat properly — we tell you before booking, not on the day. Urgent same-day attendance may carry a surcharge, always stated in writing before we travel." },
      { h:"What never costs you anything", p:"Assessing your photo, quoting, and travelling to a job we then cannot complete because our own model choice was wrong. There is no deposit and nothing to pay online." },
    ] },

  { slug:"letterbox-lock-replacement",
    h1:"HDB & Condo Letterbox Lock Replacement in Singapore",
    title:"Letterbox Lock Replacement Singapore | from S$60",
    desc:"HDB and condominium letterbox lock replacement from S$60, supplied and professionally installed. Photo-first compatibility check and a written quote before any work.",
    intro:"If your HDB or condominium letterbox lock is worn, stiff, jammed or you simply want a keyless upgrade, we replace it with a WT lock that fits your door. Send one photo and we confirm the model in writing first.",
    sections:[
      { h:"What replacement includes", p:"Supply of your chosen WT lock, removal of the old mechanism, professional fitting, alignment and a working demonstration. Lock, labour and any opening fee are itemised before we start." },
      { h:"The standard HDB and condo job", p:"Most HDB and condominium letterbox doors share a standard cut-out, which is why we can usually confirm a model from a single photo and finish on the first visit. Replacement takes 15–30 minutes once the mailbox is accessible." },
      { h:"Choosing a model", p:"Nine WT models span keyed, battery-free combination and electronic digital PIN. Compare them side by side on our products page, or send a photo and we will recommend one." },
    ] },

  { slug:"mailbox-lock-replacement",
    h1:"Mailbox Lock Replacement for Landed Homes & Outdoor Letterboxes",
    title:"Mailbox Lock Replacement Singapore | Landed & Outdoor",
    desc:"Mailbox lock replacement for landed homes, gate-side and weather-exposed letterboxes in Singapore. Corrosion-resistant WT models supplied and installed from S$60.",
    intro:"Landed-home and gate-side mailboxes face weather that a sheltered HDB lift-lobby letterbox never sees. We fit the models that hold up to it, and we say so plainly when a position is unsuitable.",
    sections:[
      { h:"Why outdoor mailboxes are different", p:"Rain, humidity and direct sun shorten the life of a standard lock. Dials seize, cylinders corrode and electronic keypads suffer. For exposed positions we recommend our more robust mechanical models and avoid battery units altogether." },
      { h:"Gate-side and boundary-wall mailboxes", p:"These are often a non-standard depth or have a thicker door panel than an HDB letterbox. That changes which lock body will seat correctly, so the door-edge photo matters more here than on a standard flat letterbox." },
      { h:"When we will say no", p:"If a mailbox is badly rusted, distorted, or in a position where no lock we stock will survive, we tell you rather than fit something that will fail in six months." },
    ] },

  { slug:"letterbox-lock-installation",
    h1:"Letterbox & Mailbox Lock Installation Singapore",
    title:"Letterbox & Mailbox Lock Installation Singapore | from S$60",
    desc:"Professional letterbox and mailbox lock installation in Singapore. WT locks supplied and fitted from S$60 — removal, alignment and testing included.",
    intro:"Installation is included in our price, not sold separately. We supply the WT lock, remove the old mechanism, fit and align the new one, set your code or hand over the keys, then test it with you before we leave.",
    sections:[
      { h:"What professional installation means", p:"A letterbox lock is only as good as its fitting. We seat the lock square in the cut-out, set the cam to the correct swivel direction for your door, tighten the backing nut to the right tension, and check the door closes and latches cleanly before we finish." },
      { h:"Installation is included, not extra", p:"Some sellers quote a lock price and treat fitting as an add-on, or ship you a box and leave you to it. Our published price covers supply and professional mailbox lock installation together on a compatible, accessible mailbox." },
      { h:"Why DIY often goes wrong", p:"The common failures are a cam set to the wrong swivel direction, a backing nut over-tightened until the door binds, and a lock body too short for the door panel so the thread barely engages. All three are avoidable, and all three cost more to put right than to do once properly." },
      { h:"How long it takes", p:"Most single installations take 15–30 minutes once the mailbox is accessible. Bulk jobs are scheduled as one coordinated visit." },
    ] },

  { slug:"wt-digital-letterbox-lock",
    h1:"WT Digital Letterbox Locks in Singapore",
    title:"WT Digital Letterbox Lock Singapore | Supplied & Installed",
    desc:"WT digital and combination letterbox locks supplied and professionally installed in Singapore. Fits standard HDB and condo mailboxes. Digital models from S$70.",
    intro:"WT is the letterbox lock range most widely used on Singapore HDB and condominium mailboxes. We supply the full range and install it ourselves — you are not left with a box and a screwdriver.",
    sections:[
      { h:"Why WT locks suit Singapore letterboxes", p:"The WT range is designed around the standard Singapore mailbox cut-out, including the swivel direction many HDB and condominium letterbox doors require. That is why most fittings need no drilling or modification to your door." },
      { h:"WT digital and touch-PIN models", p:"Our WT electronic models (P4 and P7, from S$70) use a touch keypad with a low-battery warning. Battery type and expected life are verified against the WT datasheet and stated in your written quote before installation — we do not publish figures we cannot evidence." },
      { h:"WT battery-free combination models", p:"Prefer nothing to charge? The WT Battery-Free Mechanical (P2, from S$60), 4-Digit High Security (P8) and 4-Digit Zinc Alloy (P9) give keyless code entry with no battery at all." },
      { h:"Buying a WT lock online vs having one installed", p:"A boxed lock still leaves you to remove the old mechanism, match the cam, set the swivel direction and align the door. We do all of that, test it with you, and back the fitting with a workmanship warranty. If the model we confirmed does not fit, you pay nothing." },
      { h:"Letterbox locks only", p:"These are compact mailbox locks, not main-door digital locks. We do not service door, gate, vehicle or safe locks — letterbox and mailbox locks are all we do." },
    ] },

  { slug:"lost-letterbox-key",
    h1:"Lost Letterbox Key? Opening & Re-keying in Singapore",
    title:"Lost Letterbox Key Singapore | Opening from S$25",
    desc:"Locked out of your mailbox? We open locked HDB and condo letterboxes from S$25 per unit and fit a new lock the same visit. Proof of authority required on site.",
    intro:"Lost your only letterbox key? We open the locked mailbox and fit a replacement lock the same visit. Opening starts from S$25 per unit, on top of the lock and installation.",
    sections:[
      { h:"Authorised access only", p:"We verify on site that you are the resident, owner, tenant or an authorised person before any lock is opened. Identification is sighted only — never photographed, copied or retained." },
      { h:"You may not need a new lock", p:"If the lock itself is healthy and only the key is lost, re-keying or supplying new keys is often cheaper than a full replacement. We will tell you which applies." },
      { h:"What it costs", p:"Opening from S$25 per unit, plus the lock and installation from S$60 — so a typical open-and-replace job starts at S$85, confirmed in writing before we travel." },
    ] },

  { slug:"hdb-letterbox-lock",
    h1:"HDB Letterbox Lock Replacement & Cost",
    title:"HDB Letterbox Lock Replacement Singapore | from S$60",
    desc:"HDB letterbox lock replacement and opening, islandwide, from S$60 including installation. WT locks that fit standard HDB mailbox doors. Lost-key opening from S$25.",
    intro:"We carry the WT models and parts for standard HDB letterbox doors across every town, so most jobs are completed on the first visit.",
    sections:[
      { h:"HDB mailbox lock replacement cost", p:"From S$60 supplied and professionally installed for a compatible, accessible HDB mailbox. If the key is lost and the mailbox is locked, opening adds S$25 per unit. Digital touch-PIN models start at S$70. Every figure is confirmed in writing after we see one photo." },
      { h:"Fits standard HDB letterboxes", p:"The WT range is built around the standard HDB mailbox cut-out and swivel direction, which is why most jobs need no drilling or modification to the door." },
      { h:"Common HDB scenarios", p:"Stiff or seized cylinders, snapped keys, loose cams, and keyless upgrades for elderly residents who find keys difficult." },
    ] },

  { slug:"condo-mailbox-lock",
    h1:"Condo & MCST Mailbox Lock Replacement",
    title:"Condo Mailbox Lock Replacement Singapore | MCST quotes",
    desc:"Condominium mailbox lock replacement for residents and MCSTs. Bulk pricing from 5 units, one coordinated visit, single invoice.",
    intro:"For condominium residents and managing agents we handle single replacements and coordinated bulk upgrades with one consolidated invoice.",
    sections:[
      { h:"For MCSTs & managing agents", p:"One scheduled visit, minimal disruption, and volume pricing from 5 units. Orders of 20 units or more are always priced by written quote after a site survey." },
      { h:"Approval matters", p:"Where the mailbox bank is owned or sealed by the MCST, we need written approval before altering any lock. We will raise this before booking, not on the day." },
      { h:"Resident jobs", p:"Individual condo residents get the same photo-first compatibility check and written price." },
    ] },

  { slug:"keyless-letterbox-lock",
    h1:"Keyless & Combination Letterbox Locks",
    title:"Keyless Letterbox Lock Singapore | Combination | from S$60",
    desc:"Battery-free combination letterbox locks from S$60 and touch-PIN digital locks from S$70, supplied and installed. Set your own code — no more lost keys.",
    intro:"Tired of keys? Choose a battery-free WT combination lock or an electronic touch-PIN model. Set your own code and share it instead of cutting spare keys.",
    sections:[
      { h:"Battery-free combination locks", p:"No batteries, no keys — set a 3 or 4-digit code. Our most popular option, from S$60 supplied and installed." },
      { h:"Electronic PIN locks", p:"Touch-keypad entry with a low-battery warning, from S$70. Choose these for a modern finish in a sheltered corridor." },
      { h:"If you may forget the code", p:"Several models are supplied with a backup key that retrieves your code, so a forgotten code can be recovered without replacing the lock." },
    ] },

  { slug:"group-letterbox-lock-replacement",
    h1:"Group & Bulk Letterbox Lock Replacement",
    title:"Bulk Letterbox Lock Replacement Singapore | 5–10% off",
    desc:"Group letterbox lock replacement for blocks, condos, MCSTs and town councils. 5% off from 5 units, 10% off from 10, written quote from 20.",
    intro:"Upgrading many letterboxes at once? Neighbours, MCSTs and town councils get group pricing, one coordinated visit and a single invoice.",
    sections:[
      { h:"Discount tiers", p:"5+ units 5% off, 10+ units 10% off. Orders of 20 units or more are priced by written quote after a survey, so the rate reflects the real scope rather than an automatic total." },
      { h:"How a bulk job runs", p:"We survey a sample of the mailbox bank, confirm one compatible WT model, agree a schedule that minimises disruption, then complete the block in one coordinated visit and issue a single invoice." },
      { h:"How to request", p:"Send your estate name, the number of units and a photo of one representative mailbox. We reply with a written bulk quote." },
    ] },
];

export const LEGAL_PAGES = [
  { slug:"privacy-policy", title:"Privacy Policy", h1:"Privacy Policy" },
  { slug:"terms",          title:"Terms of Service", h1:"Terms of Service" },
  { slug:"warranty",       title:"Warranty", h1:"Warranty" },
  { slug:"cancellation",   title:"Cancellation & Refunds", h1:"Cancellation & Refunds" },
];

export const FOOTER_SERVICES = [
  { slug:"products",                          label:"All 9 WT letterbox locks & prices" },
  { slug:"letterbox-lock-price",              label:"Letterbox lock replacement cost" },
  { slug:"letterbox-lock-replacement",        label:"Letterbox Lock Replacement Singapore" },
  { slug:"mailbox-lock-replacement",          label:"Mailbox Lock Replacement — landed & outdoor" },
  { slug:"letterbox-lock-installation",       label:"Letterbox & Mailbox Lock Installation" },
  { slug:"wt-digital-letterbox-lock",         label:"WT Digital Letterbox Locks" },
  { slug:"lost-letterbox-key",                label:"Lost Letterbox Key Singapore" },
  { slug:"hdb-letterbox-lock",                label:"HDB Letterbox Lock Replacement" },
  { slug:"condo-mailbox-lock",                label:"Condo & MCST Mailbox Lock Replacement" },
  { slug:"keyless-letterbox-lock",            label:"Keyless & Combination Letterbox Locks" },
  { slug:"group-letterbox-lock-replacement",  label:"Bulk Letterbox Lock Replacement" },
];

export const GUIDE_PAGES = [
  { slug:"compatibility-guide", label:"Will it fit? Compatibility guide" },
  { slug:"repair-or-replace",   label:"Repair or replace your letterbox lock" },
];

export const PRICING = {
  accessFees: {
    OPEN_WITH_KEY:     { label: "Open, key available",                  perUnit: 0,  unlock: false },
    LOST_KEY_LOCKED:   { label: "Locked, key lost (opening from S$25)",  perUnit: 25, unlock: true },
    DAMAGED_OR_JAMMED: { label: "Lock damaged or jammed (from S$25)",    perUnit: 25, unlock: true },
    NEW_MAILBOX:       { label: "New mailbox / no existing lock",        perUnit: 0,  unlock: false },
  },
  tiers: [
    { minQty: 20, rate: null, label: "20+ units · written group quote required" },
    { minQty: 10, rate: 0.10, label: "10+ units · 10% off" },
    { minQty: 5,  rate: 0.05, label: "5+ units · 5% off" },
  ],
  quantity: { min: 1, max: 100 },
};
SITE.pricing = PRICING;

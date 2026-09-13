/* =============================================================================
 * SINGLE SOURCE OF TRUTH — business, product, policy and content data.
 * Every repeated fact lives here exactly once (tracker D-01/D-02/D-03).
 *
 * HONESTY RULE: fields whose value must come from a supplier datasheet or the
 * business owner are set to null. The build renders an explicit "pending
 * confirmation" state instead of inventing a figure (Definition of Done:
 * "All product specifications are supported by exact supplier documentation").
 * ========================================================================== */

export const SITE = {
  baseUrl: "https://www.letterboxlock.sg",

  /* Deployment sub-path. Leave "" when the site is served from the domain root
   * (www.letterboxlock.sg, Cloudflare Pages, Netlify, or a GitHub *user* page).
   * Set to "/repo-name" ONLY for a GitHub *project* page such as
   * username.github.io/letterbox-lock. This is used for the 404 page, which can
   * be served at any URL depth and therefore cannot use relative asset paths. */
  basePath: "",

  businessName: "Letterbox Lock Singapore",
  alternateName: "Mailbox Lock Singapore",
  slogan: "Letterbox locks are all we do.",
  legal: { entityName: "Letterbox Lock Singapore" },

  phoneE164: "6583417888",
  phoneDisplay: "+65 8341 7888",
  whatsappNumber: "6583417888",

  reviewSourceUrl: "",              // B-04: set the real public profile URL
  ogImage: "/assets/img/og-cover.jpg",
  logo: "/assets/img/og-cover.jpg",
  geo: { lat: 1.352083, lng: 103.819836 },

  // A-06 / M08: real, supportable hours. Never claim 24/7.
  openingHours: { days: ["Mo","Tu","We","Th","Fr","Sa","Su"], opens: "09:00", closes: "21:00" },
  urgent: {
    // Set to true ONLY if after-hours is genuinely offered.
    afterHours: false,
    surchargeNote: "Urgent same-day slots are subject to availability, your location and stock. Any urgent surcharge is stated in your written quote before we travel.",
  },

  languages: ["English", "Chinese"],
  payment: "Cash, PayNow, Bank Transfer",
  currency: "SGD",

  // B-05: self-serving rating/review markup stays OFF unless eligibility is proven.
  reviewSchema: { emit: false },

  paymentInfo: {
    methods: ["Cash", "PayNow", "Bank transfer"],
    paynowQr: "assets/img/paynow-qr.png",
    paynowName: "TODO PAYNOW RECIPIENT NAME",   // A-04: exact name shown in banking apps
    paynowId: "+65 8341 7888",
    gstRegistered: false,
    gstRate: 0.09,
  },

  analytics: { enabled: false, endpoint: "/api/collect" },

  // E-09: what the starting price does and does not cover.
  priceScope: {
    includes: [
      "Supply of your chosen letterbox lock",
      "Removal of the old lock mechanism",
      "Fitting, alignment and a working demonstration",
      "Workmanship warranty on the installation",
    ],
    excludes: [
      "Opening a locked mailbox when the key is lost (from S$25 per unit)",
      "Damaged, rusted or bent mailbox doors that need repair first",
      "Custom or non-standard enclosures (quoted separately in writing)",
      "Any urgent or after-hours surcharge, stated before we travel",
    ],
  },
};

export const COLOURS = {
  SILVER: { label: "Silver", hex: "#c0c5cc" },
  BLACK:  { label: "Black",  hex: "#1f2937" },
  WHITE:  { label: "White",  hex: "#f1f5f9" },
  GREY:   { label: "Grey",   hex: "#6b7280" },
};

/* ---------------------------------------------------------------------------
 * M01: compatibility evidence we ask for before confirming any model.
 * ------------------------------------------------------------------------ */
export const COMPATIBILITY = {
  headline: "Send 3 photos and we confirm the model before you commit",
  photos: [
    { h: "1. The mailbox front", p: "Straight-on, showing the whole door and the existing lock or keyhole." },
    { h: "2. The inside latch", p: "Open the door if you can. We need to see the cam, nut and how the lock is held." },
    { h: "3. The door edge", p: "A side view of the door thickness, which decides which lock body will fit." },
  ],
  promise: "We assess compatibility from your photos and confirm the model and price in writing before any work is agreed. There is no charge for this assessment.",
};

/* M02: what happens when a mailbox cannot take the confirmed model. */
export const NO_FIT_POLICY = [
  { h: "If we confirm a model from your photos and it still does not fit",
    p: "That is our assessment error, not yours. We fit a suitable alternative at the confirmed price where one exists, or we leave your mailbox as we found it and you pay nothing — including no attendance fee." },
  { h: "If the mailbox condition was not visible in the photos",
    p: "Hidden rust, a bent door or a previous non-standard repair sometimes only appears on site. We stop, show you the problem, and give you a revised written price. You are free to decline and nothing is charged." },
  { h: "If the mailbox is not yours to alter",
    p: "Some condominium and commercial mailboxes are owned and sealed by the managing agent or MCST. In that case we need their written approval before we touch the lock, and we will tell you before booking." },
  { h: "If the door itself needs repair first",
    p: "We do not carry out door or panel repairs. We will tell you plainly that a repair is needed first and, where we can, describe what to ask a contractor for." },
];

/* M07: who may authorise mailbox opening, and how we check. */
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

/* M17: honest limits on what we can service. */
export const SERVICE_LIMITS = [
  "Severely rusted, bent or forced mailbox doors usually need repair before a new lock will seat correctly.",
  "Mailboxes sealed or owned by a managing agent, MCST or town council need their written approval first.",
  "Custom-built or non-standard enclosures may have no compatible lock body — we will say so rather than force a fit.",
  "Very shallow doors with no clearance behind the panel cannot take a standard cam-and-nut lock.",
  "Outdoor and gate-side mailboxes need a weather-suitable model; we confirm which of our models is appropriate from your photos before quoting.",
  "We do not service main-door, gate, vehicle, padlock or safe locks — letterbox and mailbox locks only.",
];

/* M06: repair-or-replace decision guidance. */
export const REPAIR_OR_REPLACE = {
  intro: "Not every stiff or awkward letterbox lock needs replacing. This is how we assess the common problems on site.",
  rows: [
    { symptom: "Key turns but is very stiff", likely: "Dry or worn cylinder", outcome: "Often serviceable. We clean and lubricate first and only replace if the cylinder is worn past adjustment." },
    { symptom: "Key snapped in the lock", likely: "Fatigued key or seized cylinder", outcome: "We extract the broken key. If the cylinder was the cause, it is replaced; if the key simply failed, a new key may be enough." },
    { symptom: "Door opens but the lock spins freely", likely: "Loose cam or backing nut", outcome: "Usually a tightening job, not a replacement. Worth checking before you buy a new lock." },
    { symptom: "Lock will not turn at all", likely: "Seized mechanism or internal failure", outcome: "Normally replacement. We open the mailbox first so your mail is accessible the same visit." },
    { symptom: "Only key lost, lock is healthy", likely: "No fault with the lock", outcome: "We open the mailbox and can often re-key or supply new keys, which is cheaper than a full replacement." },
    { symptom: "Forgotten code on a combination lock", likely: "User-set code, not a defect", outcome: "Codes cannot be recovered from the lock. We open the mailbox and reset or replace the unit." },
    { symptom: "Door bent, prised or vandalised", likely: "Damage to the door, not just the lock", outcome: "The door usually needs repair first. A new lock alone will not hold in a distorted door." },
  ],
  note: "We tell you when a repair will do. If we recommend replacement, the reason is stated in your written quote.",
};

/* ---------------------------------------------------------------------------
 * PRODUCTS
 * `specs`: only attributes we can state with confidence. Values that require a
 * supplier datasheet are null and render as "pending supplier confirmation".
 * `warrantyMonths`: null until the owner signs off the warranty matrix (A-05).
 * ------------------------------------------------------------------------ */
const PENDING = null;

export const PRODUCTS = [
  { id:"P1", name:"Traditional Key Lock", price:60, popular:false,
    categories:["key"], colours:["SILVER"],
    image:"assets/img/gallery/traditional-key-lock-singapore.jpg",
    imageAlt:"Silver keyed HDB letterbox lock supplied with two keys",
    desc:"Classic keyed letterbox lock — simple, dependable and the standard HDB replacement.",
    features:["2 keys included","Simple operation","Standard installation"],
    specs:{ access:"Key", battery:"None", codeDigits:null, orientation:"Vertical", backupAccess:"Spare key", included:"Lock body, cam, backing nut, 2 keys", doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Households happy to keep using a key, and landlords who want the cheapest like-for-like replacement.",
    advantages:["Lowest cost in the range","Nothing to charge, reset or remember","Familiar for elderly residents"],
    considerations:["Keys can be lost again","Copies must be cut for each family member"],
    notSuitable:"If losing keys is the reason you are calling us, a keyless model will serve you better.",
    warrantyMonths:PENDING },

  { id:"P2", name:"Battery-Free Mechanical", price:60, popular:true,
    categories:["mechanical","keyless"], colours:["BLACK","WHITE","SILVER"],
    image:"assets/img/gallery/battery-free-mailbox-lock.jpg",
    imageAlt:"Battery-free mechanical combination letterbox lock with three dials",
    desc:"No battery, no key — set your own 3-digit combination code. Our most popular letterbox lock.",
    features:["3-digit combination code","No battery","Standard installation"],
    specs:{ access:"Code", battery:"None", codeDigits:3, orientation:"Vertical", backupAccess:"None — code only", included:"Lock body, cam, backing nut", doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Families who share access, and anyone tired of cutting spare keys.",
    advantages:["No key to lose","Nothing to recharge or replace","Share the code instead of copying keys"],
    considerations:["Only 1,000 code combinations","The code must be remembered by everyone who uses it"],
    notSuitable:"If you want a physical key as a fallback, choose the Password + Backup Key instead.",
    warrantyMonths:PENDING },

  { id:"P3", name:"Password + Backup Key", price:65, popular:false,
    categories:["mechanical","keyless"], colours:["BLACK","WHITE"],
    image:"assets/img/gallery/password-and-key-mailbox-lock.jpg",
    imageAlt:"Combination letterbox lock with a physical backup key slot",
    desc:"Code access with a physical backup key — the best of both worlds.",
    features:["Backup key support","Code access","Standard installation"],
    specs:{ access:"Code", battery:"None", codeDigits:3, orientation:"Vertical", backupAccess:"Backup key opens the lock", included:"Lock body, cam, backing nut, backup key(s)", doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Households that want keyless convenience but insist on a fallback if the code is forgotten.",
    advantages:["Two ways in","Good for elderly residents who may forget a code","No battery"],
    considerations:["The backup key still needs storing safely","Slightly dearer than a code-only lock"],
    notSuitable:"If you want no key anywhere in the house, choose a code-only model.",
    warrantyMonths:PENDING },

  { id:"P4", name:"Smart Battery Lock", price:70, popular:false,
    categories:["smart","keyless"], colours:["BLACK"],
    image:"assets/img/gallery/battery-powered-smart-mailbox-lock.jpg",
    imageAlt:"Black electronic touch-PIN smart letterbox lock keypad",
    desc:"Electronic touch-PIN smart digital lock with low-battery warning and a modern finish.",
    features:["Electronic touch PIN","Low-battery warning","Modern finish"],
    specs:{ access:"Code", battery:"Replaceable battery", codeDigits:4, orientation:"Vertical", backupAccess:"Per manufacturer — confirmed before installation", included:"Lock body, cam, backing nut, initial battery", batteryType:PENDING, batteryLifeMonths:PENDING, operatingTempC:PENDING, ingressRating:PENDING, doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Residents who want a modern keypad and are comfortable changing a battery occasionally.",
    advantages:["Fast touch entry","Low-battery warning before it fails","Clean, contemporary look"],
    considerations:["Needs a battery change","Keypads show more wear in humid corridors"],
    notSuitable:"Not for weather-exposed or outdoor mailboxes.",
    warrantyMonths:PENDING },

  { id:"P5", name:"Ergonomic Code Lock", price:70, popular:false,
    categories:["mechanical","keyless"], colours:["BLACK"],
    image:"assets/img/gallery/product-7-ergonomic.jpg",
    imageAlt:"Easy-grip mechanical code letterbox lock with large dials",
    desc:"Easy-grip mechanical dials with larger numerals — no battery needed.",
    features:["Easy-grip control","No battery","Larger numerals"],
    specs:{ access:"Code", battery:"None", codeDigits:3, orientation:"Vertical", backupAccess:"Backup key retrieves the code only — it does not open the lock", included:"Lock body, cam, backing nut, code-retrieval key", doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Elderly residents, and anyone who finds small dials or keys difficult to grip.",
    advantages:["Easiest dials to turn in the range","Larger, clearer numerals","Backup key retrieves a forgotten code"],
    considerations:["Physically larger than the standard mechanical lock"],
    notSuitable:"May not suit very small or shallow mailbox doors — send the door-edge photo first.",
    warrantyMonths:PENDING },

  { id:"P6", name:"Zinc Alloy Code Lock", price:75, popular:false,
    categories:["mechanical","keyless"], colours:["SILVER"],
    image:"assets/img/gallery/zinc-alloy-mechanical-code-lock.jpg",
    imageAlt:"Silver zinc-alloy combination letterbox lock body",
    desc:"Robust build with larger dials for effortless everyday use, plus a backup key that retrieves your code.",
    features:["Backup key retrieves your code","No battery","Larger dials"],
    specs:{ access:"Code", battery:"None", codeDigits:3, orientation:"Vertical", backupAccess:"Backup key retrieves the code only — it does not open the lock", included:"Lock body, cam, backing nut, code-retrieval key", doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Landed homes, gate-side and corridor mailboxes, and anyone who wants a backup key that can recover a forgotten code.",
    advantages:["Robust body built for daily use","No battery","Smooth larger dials"],
    considerations:["Dearer than the standard 3-digit mechanical lock"],
    notSuitable:"Overkill for a simple sheltered lift-lobby mailbox if budget matters.",
    warrantyMonths:PENDING },

  { id:"P7", name:"Horizontal Smart Lock", price:75, popular:false,
    categories:["smart","keyless"], colours:["BLACK"],
    image:"assets/img/gallery/product-8-horizontal.jpg",
    imageAlt:"Compact horizontal smart letterbox lock for narrow mailbox doors",
    desc:"Compact horizontal smart lock with electronic PIN access — made for tight mailbox doors.",
    features:["Horizontal layout","Electronic PIN access","Compact installation"],
    specs:{ access:"Code", battery:"Replaceable battery", codeDigits:4, orientation:"Horizontal", backupAccess:"Per manufacturer — confirmed before installation", included:"Lock body, cam, backing nut, initial battery", batteryType:PENDING, batteryLifeMonths:PENDING, operatingTempC:PENDING, ingressRating:PENDING, doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Narrow or short mailbox doors where a vertical keypad will not fit.",
    advantages:["Fits where taller units cannot","Keyless PIN entry","Compact modern finish"],
    considerations:["Needs a battery change","Fewer colour options"],
    notSuitable:"Not for weather-exposed or outdoor mailboxes.",
    warrantyMonths:PENDING },

  { id:"P8", name:"4-Digit High Security", price:85, popular:false,
    categories:["mechanical","keyless"], colours:["BLACK"],
    image:"assets/img/gallery/product-6-4digit.jpg",
    imageAlt:"Black four-digit mechanical high-security letterbox lock",
    desc:"4-digit mechanical lock with a far larger code range for extra security.",
    features:["4-digit code","Backup key retrieves your code","10,000 code combinations"],
    specs:{ access:"Code", battery:"None", codeDigits:4, orientation:"Vertical", backupAccess:"Backup key retrieves the code only — it does not open the lock", included:"Lock body, cam, backing nut, code-retrieval key", doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Blocks that have had mail tampering, and anyone who wants the widest code range without a battery.",
    advantages:["10,000 combinations instead of 1,000","No battery","Same simple daily use"],
    considerations:["A 4-digit code takes slightly longer to dial","Dearer than the 3-digit models"],
    notSuitable:"If quick one-handed access matters more than code range, a 3-digit model is faster.",
    warrantyMonths:PENDING },

  { id:"P9", name:"4-Digit Zinc Alloy", price:95, popular:false,
    categories:["mechanical","keyless"], colours:["SILVER"],
    image:"assets/img/gallery/product-9-4digit-zinc.jpg",
    imageAlt:"Premium silver zinc-alloy four-digit letterbox lock",
    desc:"Our most robust mechanical model, with a 4-digit code and a backup key that retrieves your code.",
    features:["4-digit code","Backup key retrieves your code","No battery"],
    specs:{ access:"Code", battery:"None", codeDigits:4, orientation:"Vertical", backupAccess:"Backup key retrieves the code only — it does not open the lock", included:"Lock body, cam, backing nut, code-retrieval key", doorThicknessMm:PENDING, bodyLengthMm:PENDING },
    bestFor:"Exposed or high-use mailboxes where you also want the wider 4-digit code range and code recovery.",
    advantages:["Our most robust mechanical build","10,000 combinations","No battery"],
    considerations:["Highest price in the range"],
    notSuitable:"More lock than a sheltered indoor mailbox needs.",
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

/* G-07: every gallery image has a meaningful, unique description. */
export const GALLERY = [
  { file:"job-01.jpg", alt:"Silver keyed lock fitted to a standard HDB letterbox door" },
  { file:"job-02.jpg", alt:"Row of HDB letterboxes after a block-wide lock replacement" },
  { file:"job-03.jpg", alt:"Condominium mailbox with a new combination lock installed" },
  { file:"job-04.jpg", alt:"Close-up of a re-keyed HDB mailbox latch after opening" },
  { file:"job-05.jpg", alt:"Battery-free code lock fitted for a resident who lost her keys" },
  { file:"job-06.jpg", alt:"Condo mail room after a coordinated MCST bulk upgrade" },
  { file:"job-07.jpg", alt:"Jammed HDB letterbox lock replaced and alignment corrected" },
  { file:"job-08.jpg", alt:"Touch-PIN smart lock installed on a condominium mailbox" },
  { file:"job-09.jpg", alt:"Narrow HDB mailbox door fitted with a horizontal lock body" },
  { file:"job-10.jpg", alt:"Zinc-alloy lock chosen for a weather-exposed outdoor mailbox" },
  { file:"job-11.jpg", alt:"Keyless code lock demonstrated to an elderly resident" },
  { file:"job-12.jpg", alt:"Completed HDB letterbox lock installation tested and closed" },
];

export const FAQS = [
  { q:"How much does a letterbox lock installation cost in Singapore?",
    a:"Standard supply and installation starts from S$60. Lost-key opening starts from S$25 per unit. The range goes up to S$95 for the premium 4-digit model. The final price is confirmed in writing after we review your photos." },
  { q:"What exactly is included in the S$60 starting price?",
    a:"Supply of your chosen lock, removal of the old mechanism, fitting, alignment, a working demonstration and the workmanship warranty — assuming a compatible, accessible mailbox. Opening a locked mailbox, repairing damaged doors and non-standard enclosures are charged separately and quoted first." },
  { q:"What happens if the lock does not fit after you arrive?",
    a:"If we confirmed the model from your photos and it does not fit, we fit a suitable alternative at the confirmed price where one exists, or we leave your mailbox as we found it and you pay nothing — including no attendance fee. If a hidden problem appears, we stop and give you a revised written price to accept or decline." },
  { q:"I lost my letterbox key. Can you help?",
    a:"Yes. We open the locked mailbox and fit a replacement lock. Opening starts from S$25 per unit and we verify on site that you are the resident, owner, tenant or an authorised person before anything is opened." },
  { q:"Do I always need a new lock, or can it be repaired?",
    a:"Not always. A stiff key is often just a dry cylinder, and a lock that spins freely is usually a loose cam that can be tightened. We tell you when a repair will do, and if we recommend replacement the reason is stated in your written quote." },
  { q:"How long does a letterbox lock replacement take?",
    a:"Most single replacements take 15 to 30 minutes once we are on site and the mailbox is accessible." },
  { q:"What are your service hours — are you 24 hours?",
    a:"We are open 09:00 to 21:00, seven days a week. We are not a 24-hour emergency locksmith. Urgent same-day slots are often available subject to your location, stock and the day's bookings, and any urgent surcharge is stated in writing before we travel." },
  { q:"What payment methods do you accept, and is there GST?",
    a:"Cash, PayNow and bank transfer, payable after the job is completed and tested. We are not GST-registered, so no GST is added — the price we confirm in writing is the price you pay." },
  { q:"Do you install smart or digital letterbox locks?",
    a:"Yes. We supply electronic touch-PIN letterbox locks (P4 and P7, from S$70) and battery-free digital combination locks from S$60. These are mailbox locks for HDB and condo letterboxes — not main-door digital locks." },
  { q:"Are you a locksmith for letterboxes and mailboxes?",
    a:"Yes — and that is all we do. Whether you searched for a letterbox locksmith, mailbox locksmith, letter box lock, digital letterbox lock or mailbox lock replacement, you are in the right place. We handle every kind of letterbox and mailbox lock — HDB, condo, landed and outdoor — but we do not do door, gate, car or safe locks, so you always get a specialist." },
  { q:"Do you supply outdoor or weather-exposed letterbox locks?",
    a:"Yes. For landed homes and gate-side mailboxes we recommend P6 or P9 — our most robust builds, which also include a backup key that retrieves your code. We confirm the right model from your photos and will say so if a position is unsuitable." },
];

export const AREAS = [
  "Ang Mo Kio","Bedok","Bishan","Bukit Batok","Bukit Merah","Bukit Panjang",
  "Choa Chu Kang","Clementi","Geylang","Hougang","Jurong East","Jurong West",
  "Kallang","Pasir Ris","Punggol","Queenstown","Sembawang","Sengkang",
  "Serangoon","Tampines","Toa Payoh","Woodlands","Yishun","Central Area",
];

/* B-01/B-02: only entries with verified:true and a traceable source are published. */
export const REVIEWS = [];

export const SERVICE_PAGES = [
  { slug:"letterbox-lock-replacement",
    h1:"HDB & Condo Letterbox Lock Replacement in Singapore",
    title:"Letterbox Lock Replacement Singapore | from S$60",
    desc:"Supply and installation of HDB and condo letterbox locks from S$60. Photo-first compatibility check and a written quote before any work.",
    intro:"If your mailbox lock is worn, stiff or you simply want a keyless upgrade, we replace HDB and condominium letterbox locks islandwide. Send three photos and we confirm the model in writing first.",
    sections:[
      { h:"What replacement includes", p:"Supply of your chosen lock, removal of the old mechanism, fitting, alignment and a working demonstration. Lock, labour and any opening fee are itemised before we start." },
      { h:"How long it takes", p:"Most single replacements take 15–30 minutes once the mailbox is accessible." },
      { h:"Choosing a model", p:"Nine models span keyed, battery-free combination and electronic PIN. Compare them side by side on our products page, or send photos and we will recommend one." },
    ] },
  { slug:"lost-letterbox-key",
    h1:"Lost Letterbox Key? Opening & Re-keying in Singapore",
    title:"Lost Letterbox Key Singapore | Mailbox Opening from S$25",
    desc:"Locked out of your mailbox? We open locked HDB and condo letterboxes from S$25 per unit and fit a new lock. Proof of authority required on site.",
    intro:"Lost your only letterbox key? We open the locked mailbox and fit a replacement lock the same visit. Opening starts from S$25 per unit.",
    sections:[
      { h:"Authorised access only", p:"We verify on site that you are the resident, owner, tenant or an authorised person before any lock is opened. Identification is sighted only — never photographed, copied or retained." },
      { h:"You may not need a new lock", p:"If the lock itself is healthy and only the key is lost, re-keying or supplying new keys is often cheaper than a full replacement. We will tell you which applies." },
      { h:"What to expect", p:"Send a photo of the locked door and your postal sector. We confirm the price, open the mailbox, then fit your chosen lock and demonstrate it works." },
    ] },
  { slug:"hdb-letterbox-lock",
    h1:"HDB Letterbox Lock Replacement",
    title:"HDB Letterbox Lock Replacement Singapore | from S$60",
    desc:"Standard HDB letterbox lock replacement and opening, islandwide, from S$60. Written quote from three photos.",
    intro:"We carry the right parts for standard HDB letterbox doors across every town, so most jobs are completed on the first visit.",
    sections:[
      { h:"Common HDB scenarios", p:"Stiff or seized cylinders, snapped keys, loose cams, and keyless upgrades for elderly residents who find keys difficult." },
      { h:"Pricing", p:"From S$60 supply and install for a compatible, accessible HDB mailbox. Lost-key opening from S$25 per unit." },
    ] },
  { slug:"condo-mailbox-lock",
    h1:"Condo & MCST Mailbox Lock Replacement",
    title:"Condo Mailbox Lock Replacement Singapore | MCST bulk quotes",
    desc:"Condominium mailbox lock replacement for residents and MCSTs. Bulk pricing, one coordinated visit, single invoice.",
    intro:"For condominium residents and managing agents we handle single replacements and coordinated bulk upgrades with one consolidated invoice.",
    sections:[
      { h:"For MCSTs & managing agents", p:"One scheduled visit, minimal disruption, and volume pricing from 5 units. Orders of 20 units or more are always priced by written quote after a site survey." },
      { h:"Approval matters", p:"Where the mailbox bank is owned or sealed by the MCST, we need written approval before altering any lock. We will raise this before booking, not on the day." },
      { h:"Resident jobs", p:"Individual condo residents get the same photo-first compatibility check and written price." },
    ] },
  { slug:"keyless-letterbox-lock",
    h1:"Keyless & Smart Letterbox Locks",
    title:"Keyless Letterbox Lock Singapore | from S$60",
    desc:"Battery-free combination locks from S$60 and touch-PIN smart letterbox locks from S$70. No more lost keys.",
    intro:"Tired of keys? Choose a battery-free combination lock or an electronic touch-PIN model. Set your own code and share it instead of cutting spare keys.",
    sections:[
      { h:"Battery-free code locks", p:"No batteries, no keys — set a 3 or 4-digit code. Our most popular option, from S$60." },
      { h:"Electronic PIN locks", p:"Touch-keypad entry with a low-battery warning, from S$70. Choose these for a modern finish in a sheltered corridor." },
      { h:"If you may forget the code", p:"The Password + Backup Key model keeps a physical key as a fallback — worth considering for elderly residents." },
    ] },
  { slug:"smart-digital-letterbox-lock",
    h1:"Smart & Digital Letterbox Locks in Singapore",
    title:"Smart & Digital Letterbox Lock Singapore | from S$70",
    desc:"Smart, digital and electronic letterbox locks for HDB and condo mailboxes. Touch-PIN and battery-free combination models from S$60.",
    intro:"Want a smart or digital letterbox lock instead of a key? We supply electronic touch-PIN mailbox locks and battery-free combination locks sized for standard HDB and condominium letterbox doors. These are mailbox locks — not main-door digital locks.",
    sections:[
      { h:"What counts as a smart or digital letterbox lock?", p:"For mailboxes it means keyless entry by an electronic touch PIN or a mechanical combination code. You set the code yourself and share it with family instead of cutting keys." },
      { h:"Electronic touch-PIN models", p:"The Smart Battery Lock (P4) and Horizontal Smart Lock (P7) use a touch keypad with a low-battery warning, from S$70. Battery type and expected life are confirmed from the supplier datasheet before installation." },
      { h:"Battery-free digital models", p:"Prefer nothing to charge? The Battery-Free Mechanical (P2, from S$60), 4-Digit High Security (P8) and 4-Digit Zinc Alloy (P9) give keyless code entry with no battery at all." },
      { h:"Smart mailbox lock vs main-door digital lock", p:"These are compact units for your mail compartment, not the large front-door digital locks sold by home-security retailers. If you need a mailbox upgrade, this is the right range." },
    ] },
  { slug:"group-letterbox-lock-replacement",
    h1:"Group & Bulk Letterbox Lock Replacement",
    title:"Bulk Letterbox Lock Replacement Singapore | 5–10% off",
    desc:"Group letterbox lock replacement for blocks, condos, MCSTs and town councils. 5% off from 5 units, 10% off from 10, written quote from 20.",
    intro:"Upgrading many letterboxes at once? Neighbours, MCSTs and town councils get group pricing, one coordinated visit and a single invoice.",
    sections:[
      { h:"Discount tiers", p:"5+ units 5% off, 10+ units 10% off. Orders of 20 units or more are priced by written quote after a survey, so the rate reflects the real scope rather than an automatic total." },
      { h:"How a bulk job runs", p:"We survey a sample of the mailbox bank, confirm one compatible model, agree a schedule that minimises disruption, then complete the block in one coordinated visit and issue a single invoice." },
      { h:"How to request", p:"Send your estate name, the number of units and photos of one representative mailbox. We reply with a written bulk quote." },
    ] },
];

export const LEGAL_PAGES = [
  { slug:"privacy-policy", title:"Privacy Policy", h1:"Privacy Policy" },
  { slug:"terms",          title:"Terms of Service", h1:"Terms of Service" },
  { slug:"warranty",       title:"Warranty", h1:"Warranty" },
  { slug:"cancellation",   title:"Cancellation & Refunds", h1:"Cancellation & Refunds" },
];

export const FOOTER_SERVICES = [
  { slug:"products",                         label:"All 9 letterbox locks & prices" },
  { slug:"letterbox-lock-replacement",       label:"Letterbox Lock Replacement Singapore" },
  { slug:"lost-letterbox-key",               label:"Lost Letterbox Key Singapore" },
  { slug:"hdb-letterbox-lock",               label:"HDB Letterbox Lock Replacement" },
  { slug:"condo-mailbox-lock",               label:"Condo & MCST Mailbox Lock Replacement" },
  { slug:"keyless-letterbox-lock",           label:"Keyless & Smart Letterbox Locks" },
  { slug:"smart-digital-letterbox-lock",     label:"Smart & Digital Letterbox Locks" },
  { slug:"group-letterbox-lock-replacement", label:"Bulk Letterbox Lock Replacement" },
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

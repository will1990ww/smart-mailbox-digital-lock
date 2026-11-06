# letterboxlock.sg

Bilingual (English + 中文) static site for a Singapore letterbox lock specialist.
Zero runtime dependencies, zero build dependencies — plain Node, no `npm install`.

**Every price on the site comes from one file.** Change `src/data/site.json` and
all five price surfaces update together, in both languages.

---

## Just want to look at it?

**Double-click `index.html`.** This folder is built with relative paths, so it
opens straight from disk with no server. Chinese site: `zh/index.html`.

## Ready to go live?

**Upload the contents of `deploy/` to your web host.** That folder is built with
root-absolute paths, which is what a real server needs.

A browser opening a file from your hard drive resolves a leading `/` against
your **drive root**, so `/assets/css/site.css` is not found and the page loses
all styling. On a web server that same path is correct.

| | Paths | Use it for |
|---|---|---|
| this folder | `assets/css/site.css` | double-clicking, local viewing |
| `deploy/` | `/assets/css/site.css` | uploading to the server |

Both builds are validated separately by CI.

---

## Commands

```bash
npm run package   # build BOTH: deploy/ for the server, this folder for viewing
npm run all       # build + 61 tests + full validation (run before committing)
npm run dev       # build + serve at http://localhost:8080
npm run images    # regenerate the 31 sample images
```

---

## Site structure

44 pages — 22 in English at `/`, 22 in Chinese at `/zh/`.

| Page | Purpose |
|---|---|
| `/` | Homepage: products, pricing, trade partners, reviews, order form |
| `/products/` | **Long-form catalogue** — advantages, considerations, not-suitable |
| `/letterbox-lock-price/` | Price list and what changes it |
| `/24-hour-letterbox-locksmith/` | **24-hour and same-day service** |
| `/letterbox-lock-replacement/` | Replacement service |
| `/letterbox-lock-installation/` | Installation service |
| `/mailbox-lock-replacement/` | Landed homes and outdoor boxes |
| `/interior-designers-developers/` | Trade and projects |
| `/digital-letterbox-lock/` | Digital touch-PIN range |
| `/no-battery-letterbox-lock/` | Battery-free range |
| `/lost-letterbox-key/` | Lost-key opening |
| `/hdb-letterbox-lock/` | HDB-specific |
| `/condo-mailbox-lock/` | Condo and MCST |
| `/group-letterbox-lock-replacement/` | Bulk work |
| `/compatibility-guide/` | Will it fit? |
| `/repair-or-replace/` | Honest diagnostic guide |
| `/about/` | About |
| `/privacy-policy/` `/terms/` `/warranty/` `/cancellation/` | Legal |

---

## Two levels of product detail

The homepage grid shows **short blurbs** — one line each, scannable at a glance.
`/products/` shows the **full picture** for every model:

- **Advantages** — what it does well
- **Considerations** — what to weigh up before choosing
- **Not suitable when** — when it is the wrong lock, and what to take instead
- **At a glance** — access, power, code digits, backup key, finishes, price

Both are generated from the same `site.json` entry, so they cannot disagree.
Saying plainly when a product is *not* right is also a genuine trust signal —
and it is content competitors do not publish.

---

## Repository layout

```
src/
  data/
    site.json        ← SINGLE SOURCE OF TRUTH: prices, products, FAQs, reviews
    i18n.mjs         ← Every UI string, EN + ZH
    pages.mjs        ← Sub-page content, EN + ZH, as block lists
  lib/
    util.mjs         ← Bilingual resolution, escaping, price formatting
    schema.mjs       ← JSON-LD @graph builders
    layout.mjs       ← <head>, header, footer, sticky bar, document shell
    components.mjs   ← Section renderers
    blocks.mjs       ← Block dispatcher for sub-pages
    paths.mjs        ← URL mode handling (production vs preview)
  assets/            ← css/site.css and js/app.mjs (sources of truth)

tools/make-images.mjs  ← Generates the 31 sample images
build.mjs              ← Homepages, 404s, manifest, robots
build-pages.mjs        ← All sub-pages (both languages) + sitemap
checks.mjs             ← Post-build validation (auto-detects build mode)
serve.mjs              ← Zero-dependency dev server
package.mjs            ← Produces both builds with guard assertions
```

> **Edit `src/`, never the generated files.** CI fails if committed output does
> not match a fresh build.

---

## Common tasks

### Change a price

```jsonc
// src/data/site.json
{ "id": "P4", "price": 65, ... }
```

Then `npm run all`. The card, detail panel, comparison table, order dropdown,
JSON-LD and data island all move together — in both languages. If you changed
the most expensive lock, update `pricing.maxPrice` too; the build **refuses to
run** otherwise.

### Change the urgent surcharge

`pricing.urgentFee` and `pricing.scheduling.URGENT.perJob` must match — the
build enforces it. The figure then appears in the form, the live estimate, the
WhatsApp message, the extras table and the FAQ automatically.

### Add a gallery photo

Keep the total a multiple of 6. The build **fails** if `gallery`, `whyUs` or
`partners` stops dividing evenly into its pinned column counts, because that is
what leaves visible blank cells in a grid.

### Replace a sample photo

Drop your real photo at the same path and dimensions. See
`assets/img/REQUIRED-IMAGES.md`. No code change needed.

---

## What the validation covers

`npm run check` inspects all 44 generated pages and **exits non-zero** on any error.

**Structure** — tag balance, exactly one `<h1>`, no skipped heading levels,
`<main>` landmark, `lang` attribute, charset first, viewport present.

**Links** — no `index.html` in production, every internal link resolves, every
`#anchor` has a target, every referenced asset exists on disk.

**Structured data** — JSON-LD parses, has `@context` and `@graph`, every node
has `@type`, no raw `<` in the script body.

**Prices** — every `S$n` visible on any page must exist in `site.json`, as a
product price, a fee, a tier-discounted price, or a legitimate difference
between two models. Every JSON-LD offer must match the catalogue.

**Bilingual parity** — equal page counts, every English page has a Chinese
counterpart, Chinese pages are `lang="zh-SG"` with Chinese in the `<h1>`, and no
untranslated UI strings leaked through.

**Layout maths** — card and gallery counts must divide evenly into their pinned
column counts, and `.mobile-extra` must keep its default `display:none` so the
nav buttons cannot duplicate on desktop.

**Entity hygiene** — no double-escaped `&amp;amp;`, no raw ampersands.

**Accessibility** — every `<img>` has `alt`; `aria-describedby`, `aria-controls`,
`aria-labelledby` and `label[for]` all resolve; no duplicate ids; every button
has an accessible name; emoji hidden from assistive tech.

**SEO** — title and description within per-locale SERP limits (CJK counted at
roughly half the character budget), absolute canonical and `og:url`, all three
hreflang tags.

---

## SEO notes

Structured data is modelled as a **service-area business** — `serviceArea` as a
`GeoCircle` plus all 27 HDB towns in `areaServed`. This is the correct schema
for a mobile trade with no shopfront.

**24-hour availability is now declared three ways:** `openingHoursSpecification`
on the business, `hoursAvailable` on the contact point, and `hoursAvailable` on
the Service node. That combination is what supports "24 hour locksmith" queries.

Google no longer shows FAQ or HowTo rich results, so do not budget for SERP real
estate from those nodes. They are kept because unused structured data causes no
harm and both are increasingly consumed by AI answer engines. Ranking effort
belongs in the `LocalBusiness` / `Service` / `Product` graph.

### Ranking checklist

1. **Google Business Profile as a service-area business, set to 24 hours.**
   No shopfront or UEN required. Without this you are structurally excluded from
   the map pack, which is where "letterbox lock near me" actually converts.
   Setting hours to 24/7 is a meaningful differentiator in that panel.
2. **Search Console + Bing Webmaster Tools.** Verify the domain, submit
   `sitemap.xml`, confirm the `www` HTTPS variant is indexed, and check
   International Targeting picks up both languages.
3. **Ten public Google reviews.** Six self-published testimonials cannot compete
   with a competitor showing forty verified ones. Attach the review link to the
   completion video you already send.
4. **Analytics.** `site.json` → `site.analytics.enabled` is `true` and every CTA
   carries a `data-ev` attribute. Point `endpoint` at a real collector.
5. **Trade outreach.** `/interior-designers-developers/` is your highest
   commercial-value page. One design firm sending repeat handover work outweighs
   a hundred single-unit enquiries.

---

## Browser support

Modern evergreen browsers. Uses `<dialog>`, `:has()`, `aspect-ratio` and ES
modules. Everything degrades: the order form posts to WhatsApp without
JavaScript, `<details>` accordions work natively, and all prices and policies
are plain HTML.

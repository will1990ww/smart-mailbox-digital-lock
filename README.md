# Letterbox Lock Singapore — v3.4 (keyword & cost edition)

Dependency-free static site. One config (`src/data.mjs`) drives **20 pages**.

```bash
npm run build   # all pages + robots + sitemap
npm test        # 29 unit + integration tests
npm run check   # quality gate
npm run preview # http://localhost:8080
```

## v3.4 — the two missing keywords, plus installation/replacement coverage

**New: `/letterbox-lock-price/`** targets *"HDB mailbox lock replacement cost"* —
the term you rank nowhere for. It carries a real cost table (5 scenarios),
pricing FAQ schema for the FAQ rich result, and an honest "what changes the
price" section. A **cost strip also appears on the homepage**.

**Keyword → page map (each owns one intent, no near-duplicates):**

| Page | Targets |
|---|---|
| `/` | letterbox lock installation + replacement Singapore |
| `/letterbox-lock-price/` | **letterbox lock replacement cost**, HDB mailbox lock replacement cost |
| `/letterbox-lock-replacement/` | letterbox lock replacement — **HDB & condo** |
| `/mailbox-lock-replacement/` | mailbox lock replacement — **landed, gate-side, outdoor** |
| `/letterbox-lock-installation/` | letterbox **and mailbox** lock installation |
| `/wt-digital-letterbox-lock/` | WT digital letterbox lock |
| `/hdb-letterbox-lock/` | HDB letterbox lock replacement **& cost** |

> The two replacement pages are split by **property type**, not by synonym, so
> they are genuinely different content rather than near-duplicate doorway pages.

**Cost figures are derived, not hard-coded.** A test asserts the table matches
`PRODUCTS` + `PRICING` — base = cheapest model, open+replace = lock + S$25 fee,
bulk = cheapest − 5%. Change a price and the table cannot go stale.

## Final audit — what it caught

Two real defects, both fixed:

1. **`/letterbox-lock-installation/` meta description was 169 chars** — over
   Google's ~165 display limit, so it would have truncated. My own new SEO test
   caught it.
2. **"installation" density hit 1.21%** on the homepage. Traced to product cards
   saying it twice (footer *and* feature list). Features are now model-specific
   facts instead — better for buyers and density is 1.09%.

**All clean:** 20/20 pages HTML-balanced · every link and asset resolves · 20
unique titles + 20 unique descriptions, all within limits · no duplicate IDs ·
no encoding issues · 163 CSS classes, none unstyled · WT 0.91%.

## ⚠️ Testimonials — action required

The six testimonials ship because they are `verified:true`. **You must be able to
evidence each one.** Under Singapore's CPFTA, publishing testimonials that are
not genuine is a false or misleading representation. Set `verified:false` on
anything you cannot evidence — the build excludes it automatically.

## 🔴 Two commercial realities

1. **Your live site is still the old build.** You already rank **#1** for
   "letterbox lock replacement Singapore", "letterbox lock installation
   Singapore" and "keyless combination letterbox lock Singapore" — with a page
   that still says "from S$50" and "Add to cart". Deploying is the single
   highest-value action available to you.
2. **Pricing.** Shopee and Carousell sellers list WT digital locks with
   installation from ~S$35–60. Your S$60 + S$25 = S$85 is above that. The cost
   page now argues the premium explicitly (fitting included, no-fit guarantee,
   workmanship warranty, written quote) — but with zero published reviews, that
   argument has nothing backing it.

## Deploying

Hosts do not run build scripts — run `npm run build` locally and commit the
generated files.

- **`.nojekyll`** is included; keep it.
- Domain root or GitHub *user* page → leave `SITE.basePath = ""`.
  GitHub *project* page → set `SITE.basePath = "/repo"` (affects `404.html` only).
- ⚠️ **GitHub Pages ignores `_headers`** — CSP and security headers will not
  apply. Prefer **Cloudflare Pages** or **Netlify**.

## Owner actions before launch

| Item | Action |
|---|---|
| Deploy | Push v3.4 — you rank #1 on an outdated page. |
| Search Console | Submit the sitemap so the 20 URLs get indexed. |
| Testimonials | Evidence each one, or set `verified:false`. |
| `reviewSourceUrl` | Set your public review profile URL. |
| WT specs | Fill `doorThicknessMm`, `bodyLengthMm`, `batteryType`, `batteryLifeMonths`, `warrantyMonths` from the WT datasheet. |
| Analytics | Stand up `/api/collect`, then set `analytics.enabled = true`. |
| Google Business Profile | Still the biggest lever for local orders. |

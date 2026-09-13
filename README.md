# Letterbox Lock Singapore — v3.0

Dependency-free static site for a **letterbox/mailbox lock specialist**. One config
(`src/data.mjs`) drives 17 pages: homepage, products catalogue, 2 guides, 7 service
pages, About, 4 legal pages, 404, `robots.txt` and `sitemap.xml`.

```bash
npm run build   # all pages + robots + sitemap
npm test        # 19 unit + integration tests
npm run check   # quality gate (fails on policy/privacy breaches)
npm run preview # http://localhost:8080
```

> The quote form needs a server (browsers block ES modules on `file://`). Use `npm run preview`.

---

## Deploying (GitHub Pages, Cloudflare Pages or Netlify)

The site is pre-built static HTML. **Hosts do not run your build scripts** — run
`npm run build` locally and commit the generated files.

### GitHub Pages
1. `npm run build` locally, then commit the generated `index.html`, `products/`, etc.
2. Keep the **`.nojekyll`** file at the repo root (already included). Without it,
   Jekyll silently drops underscore-prefixed files.
3. Push to `main`, then enable Pages in repo settings.
4. **User/organisation page or custom domain** → leave `SITE.basePath = ""`.
   **Project page** (`username.github.io/repo-name`) → set
   `SITE.basePath = "/repo-name"` in `src/data.mjs` and rebuild. This only affects
   `404.html`, which can be served at any URL depth and therefore cannot use
   relative paths. Every other page already uses relative paths and works anywhere.

> ⚠️ **GitHub Pages ignores `_headers`.** Your strict CSP and security headers will
> **not** apply there — GitHub Pages cannot set custom headers. For a business site
> taking quote requests, prefer **Cloudflare Pages** or **Netlify** (both free, both
> read `_headers`, both deploy from the same GitHub repo).

### Does "Add to quote" work once deployed?
**Yes.** The quote list is plain ES-module JavaScript using `localStorage` — no
server or backend required. It needs a real `http(s)` origin, which every host
provides. It does **not** work by double-clicking a file (`file://`), because
browsers block ES modules there.

Analytics stays off on a static host: `/api/collect` needs a server. Enable it only
once that endpoint exists.

---

## v3.0 — Must-Adopt Competitor Best Practices, implemented

| ID | What was built |
|---|---|
| **M01** | **3-photo compatibility check** (front, inside latch, door edge) on the homepage, in the quote flow and as a full `/compatibility-guide/` page. |
| **M02** | **No-fit policy** in four scenarios — including *"you pay nothing, no attendance fee"* — on the homepage, guide and Terms. |
| **M05** | Every product carries **Best for / Advantages / Considerations / Not suitable when** — written from attributes we can actually evidence. |
| **M06** | **`/repair-or-replace/`** decision table: 7 symptoms → likely cause → what usually happens. |
| **M07** | **Authorisation procedure** on `/about/` — who may authorise (resident, tenant, MCST, third party), what proof, and that ID is **sighted only, never copied or retained**. |
| **M08** | **Urgent route** in the hero and on the lost-key page, using **real hours (09:00–21:00)**. `checks.mjs` now **fails the build** on any "24/7" claim. |
| **M17** | **Service limitations** published on `/about/` and the compatibility guide. |
| **M18** | **Comparison matrix** of all 9 models + a **compare-up-to-3** tool on `/products/`. |
| **M19** | **Homepage shortened** to 3 recommended models; the full catalogue moved to `/products/`. |
| M12–M14, M16, M20 | Already delivered in v2.0 (quote language, separate modes, price breakdown, no self-serving review schema, URL privacy). |

### Where I deliberately did **not** invent data

**M04** (dimensions, thread, cam, door thickness), **M11** (battery type, life,
temperature, IP rating) and **M03** (per-model warranty months) require a supplier
datasheet or your sign-off. Those fields are `null` and render as
**"Pending supplier confirmation"** — 36 such fields across the catalogue — with a
note explaining they are verified before installation. A unit test enforces that
every electronic model declares a `batteryType` key so none is silently forgotten.

This satisfies your Definition of Done: *"All product specifications are supported by
exact supplier/manufacturer documentation or verified measurement."* Fabricating them
would have failed it.

**M09** (named author) and **M15** (real installation photos) also need your input.

---

## Before launch — owner actions

| Tracker | Action |
|---|---|
| **A-04 / A-08** | Set `paymentInfo.paynowName` to the exact name banking apps display; replace `assets/img/paynow-qr.png`; test on two banking apps. *(Only remaining `checks.mjs` warning.)* |
| **M03 / A-05** | Fill `warrantyMonths` per model once the warranty matrix is signed off. |
| **M04 / M11** | Fill the `null` spec fields from supplier datasheets. |
| **B-01 / B-04** | Add sourced reviews (`verified:true`) and set `reviewSourceUrl`. Until then nothing is published — which is correct. |
| **B-05** | Only set `reviewSchema.emit = true` after a Rich Results Test **and** policy review. |
| **J-01 / J-04** | Verify Search Console, submit the sitemap, verify the Google Business Profile. |
| **F-05** | Watch CSP Report-Only, then switch to enforcing. |
| **M09 / M15** | Add a named technical reviewer and real installation photos. |

## Guardrails now enforced by the build

`checks.mjs` **fails** (not warns) on: `aggregateRating` reappearing · homepage
`BreadcrumbList` · any unit, block or 6-digit postal code inside a `wa.me` link ·
any "24/7" claim · inline `style=`/`on*=` · ≠1 `<h1>` per page · invalid JSON-LD ·
images over 300 KB.

## Structure

```
build.mjs · build-pages.mjs · checks.mjs · package.json
src/{data.mjs, render.mjs}
assets/css/site.css
assets/js/{pricing,validation,quote-message,quote-list,analytics,app}.mjs
tests/{core,dom}.test.mjs · tests/_dom-harness.mjs
security/nginx-security.conf · _headers · .github/workflows/ci.yml
(generated) index.html · 404.html · products/ · compatibility-guide/ ·
repair-or-replace/ · about/ · 7 service pages · 4 legal pages · robots · sitemap
```

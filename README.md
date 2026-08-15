# Letterbox Lock Singapore — production package v2

Re-architected build that implements the P1–P4 improvement list: a
**privacy-minimal WhatsApp flow**, hardened form + DOM code, a single source of
truth, service/legal pages, SEO (robots, sitemap, JSON-LD), and CI quality gates.

## See it now (double-click)
Open **`preview.html`** — one self-contained file (CSS+JS inlined) that renders
and is interactive from `file://`. Regenerate with `npm run preview:file`.

> The production `index.html` is intentionally split (CSS/JS/data separate) so a
> **strict CSP with no `unsafe-inline`** applies on a server. Serve it (`npm run
> serve`) or use `preview.html` to view locally.

## Commands
```bash
npm test            # 20 unit tests (pricing, validation, message privacy)
npm run build       # build home + sub-pages + sitemap/robots + LAUNCH GUARD
npm run preview:dev # build with demo placeholders allowed
npm run checks      # CI quality gate (dup-class, JSON-LD, links, images, sitemap)
npm run verify      # test + preview build + checks
npm run serve       # http://localhost:8080
```

## Structure
```
src/data.mjs            SINGLE SOURCE OF TRUTH (config, legal/UEN, pricing, catalog,
                        reviews, FAQ, knowledge, service pages, legal pages)
src/render.mjs          Shared head/header/footer + one canonical JSON-LD + data island
build.mjs               Homepage generator + launch guard
build-pages.mjs         Service pages, legal pages, robots.txt, sitemap.xml
checks.mjs              Deployment quality gate
build-standalone.mjs    preview.html generator (local only)
assets/css/site.css     All styles (zero inline styles anywhere)
assets/js/pricing.mjs   Pure pricing (per-unit fees, tiers, written-quote)
assets/js/validation.mjs Pure validation (district, strict quantity, product/colour)
assets/js/order-message.mjs  PII-minimal WhatsApp message builder
assets/js/app.mjs       Progressive-enhancement controller
tests/                  node --test suites
security/               CSP headers (Netlify/CF + Nginx)
.github/workflows/ci.yml  test → build → checks → launch guard
```

---

## P1 — Privacy flow & WhatsApp validation

**Form no longer collects name / mobile / street / unit.** The only fields are
product, colour, quantity, mailbox condition, **2-digit postal district** and
optional timing (+ conditional authorisation). Appointment details are collected
inside WhatsApp.

- **Minimal URL** — `buildQuoteMessage()` puts only product, qty, condition,
  district and estimate into `?text=`. Proven by `tests/message-privacy.test.mjs`
  (`containsNoPII`, no 8-digit phone / `#12-345` unit / full postal / email).
- **Accurate privacy copy** — the form's blue box and the **Privacy Policy** page
  both state the message "is passed to WhatsApp through the link (a URL)" and
  lists exactly what it contains.
- **Privacy Policy page** at `/privacy-policy/` (PDPA-oriented template).
- **Estimate labelling** — UI and message say "Estimate only, not a confirmed price."
- **20+ units** → "Written group quote required", never a computed total (UI + message + tests).
- **Popup/launch failure** → graceful in-page fallback link (focused for keyboard users).
- **Consistent links** — every WhatsApp link uses `waLink()` + `rel="noopener noreferrer"`.

## P2 — Code & security

- **Duplicate `class` attributes fixed** — merged into e.g. `class="btn green btn-block"`.
  `checks.mjs` fails the build if any tag has two `class` attributes.
- **HTML validator in CI** — `.github/workflows/ci.yml` (vnu) + `checks.mjs` structural gate.
- **app.mjs review**
  - No `innerHTML` with data; only `textContent` / `createElement` / `replaceChildren`.
  - **JSON validated** before use (`loadData()` checks shape; bad JSON → fail soft, static content remains).
  - Handles **missing products, invalid IDs, broken JSON, missing DOM nodes** (null-guards; verified by empty-DOM smoke test).
  - Filtering updates **visual state + `aria-pressed`**; mobile menu keeps **`aria-expanded`** in sync (+ Esc).
- **Form validation**
  - `novalidate` **removed** → native validation stays; JS re-validates every field.
  - Quantity rejects **blank, non-numeric, ≤0, fractional, >100** (`validateQuantity`, tested).
  - Errors use **`aria-describedby`** + **`aria-invalid="true"`**; focus moves to first invalid field.
  - **Authorisation required only** when the mailbox is locked/damaged (`accessRequiresAuthorisation`).
- **Authorisation controls kept** — resident/owner/authorised checkbox; on-site proof of residence
  before opening; **no identity documents via the public form**; internal technician procedure
  documented in Terms + Privacy.
- **Security headers** — strict CSP (no `unsafe-inline`), HSTS, `nosniff`, Referrer-Policy,
  Permissions-Policy, `frame-ancestors 'none'` (`security/_headers`, `nginx-security.conf`).

## P3 — Architecture & maintainability

- **One source of truth** (`src/data.mjs`): domain, phone/WhatsApp, products/prices,
  discounts, reviews + rating totals, FAQ, business hours. HTML, form `<option>`s,
  `<meta>`, JSON-LD and sitemap are all generated from it → no drift.
- **Tests** cover unit price, per-unit unlock fee, 5%/10% discounts, 20+ written quote,
  product+colour selection, form validation, authorisation rules, WhatsApp privacy,
  and tier resolution (20 tests).
- **Deployment quality checks** (`checks.mjs`): duplicate-class, inline-style/handler,
  JSON-LD validity, data-island validity, internal-link integrity, placeholder detection,
  **image-size budget (<300 KB)**, sitemap/robots presence. CI also wires HTML validation,
  Lighthouse and the production launch guard.

## P4 — Google Search

- **robots.txt** + **sitemap.xml** generated (all real URLs from `baseUrl`).
- **Direct H1**: "HDB & Condo Letterbox Lock Replacement in Singapore"; focused `<title>`.
- **Useful content** section (compatibility, install time, unsuitable mailboxes, warranty,
  lock selection, pricing conditions) — `KNOWLEDGE` in data.
- **Distinct service pages** (unique copy, not cloned doorway pages):
  `/letterbox-lock-replacement/`, `/lost-letterbox-key/`, `/hdb-letterbox-lock/`,
  `/condo-mailbox-lock/`, `/keyless-letterbox-lock/`, `/group-letterbox-lock-replacement/`.
  Location pages are deliberately **not** auto-cloned per area.
- **Local-business trust**: single JSON-LD `LocalBusiness` with `legalName` + UEN,
  `sameAs` → real review profile; visible "verify these reviews" link; **Privacy, Terms,
  Warranty, Cancellation** pages; legal name + UEN in footer and schema.
- **Core Web Vitals**: static HTML (fast LCP), no heavy chat/map/tracking, `width/height`
  on media (CLS), tiny JS. Wire `lhci` budgets (LCP≤2.5s, INP≤200ms, CLS≤0.1) in CI.

## Go-live checklist (guard enforces ✅)
1. ✅ Replace `baseUrl`, `phoneE164`, `phoneDisplay`, `whatsappNumber`, `legal.*`,
   `reviewSourceUrl` in `src/data.mjs`.
2. ✅ Set `rating.verified = true` and each review `verified: true` only with real, consented sources.
3. Add real images to `assets/img/` (`og-cover.jpg`, `icon-192/512.png`, `gallery/job-01..12.jpg`, <300 KB, with `srcset`).
4. Have the legal pages reviewed by counsel.
5. Verify the domain in Google Search Console; submit `sitemap.xml`; test with Rich Results.
6. Deploy behind `security/` headers (TLS + strict CSP).
7. `npm run verify` then `npm run build` must pass with **0 blocking issues**.

# Letterbox Lock Singapore — Static Site (single source of truth)

Dependency-free static site. **One config file (`src/data.mjs`) drives everything** —
homepage, seven service pages, four legal pages, form options, `<meta>`, JSON-LD,
`robots.txt` and `sitemap.xml`. The runtime JS is progressive enhancement only.

## Quick start

```bash
npm run build        # node build.mjs && node build-pages.mjs
npm test             # 16 unit + integration tests (node --test)
npm run check        # quality gate (checks.mjs)
npm run standalone   # single-file preview.html (double-click friendly)
npm run preview      # serve at http://localhost:8080
```

## ⚠️ Testing the ORDER form locally

The colour dropdown updates by JavaScript. Browsers block ES-module scripts opened
directly from disk (`file://`), so **double-clicking `index.html` shows only Silver**.
Use **`preview.html`** (from `npm run standalone`) or run `npm run preview`. On real
hosting it works perfectly — proven by `tests/colour-form.test.mjs`.

## What's new in v1.4 — the two final code items

### 1. Privacy-friendly analytics (cookieless, CSP-safe) — `assets/js/analytics.mjs`
- **OFF by default.** Enable in `src/data.mjs` → `SITE.analytics = { enabled:true, endpoint:"/api/collect" }`.
- **No cookies, no localStorage, no fingerprinting, no PII.** A property whitelist
  drops anything like phone/name/email before sending (unit-tested).
- **CSP-safe:** sends to a **first-party** endpoint on your own domain via
  `navigator.sendBeacon`, so the strict `connect-src 'self'` policy is respected —
  no third-party script, no CSP change needed.
- **Events tracked** (via `data-ev` attributes): WhatsApp clicks (nav, footer, float,
  per-product, group), Call clicks, Order-button clicks, product filter,
  select-&-configure, and the key conversion **`order_submit`** (fired with
  `sendBeacon` before the page hands off to WhatsApp).
- You need a tiny server route at the endpoint to receive the JSON (any host/tool).
  If you prefer a hosted tool later, a first-party proxy keeps CSP intact.

### 2. PayNow QR + GST clarity — `#payment` section
- New **Payment & GST** section on the homepage with a **PayNow QR**, payment-method
  chips (Cash · PayNow · Bank transfer) and a clear **GST line**.
- Config in `src/data.mjs` → `SITE.paymentInfo`:
  - `paynowQr`: path to your QR image (**replace the placeholder** at
    `assets/img/paynow-qr.png` with your real PayNow QR before launch).
  - `gstRegistered`: **false** by default → shows *"We are not GST-registered, so no
    GST is added…"*. Set **true** (with `gstRate`, currently 9%) once you register and
    the line — plus the Terms page — automatically switch to *"prices inclusive of 9% GST."*

## Before you go live — edit `src/data.mjs` only, then rebuild

| Field | Placeholder | Action |
|---|---|---|
| `baseUrl` | `https://www.example.sg` | your real domain |
| `phoneE164` / `phoneDisplay` / `whatsappNumber` | `6583417888` / `+65 8341 7888` | confirm real number |
| `reviewSourceUrl` | `https://g.page/example` | your real Google profile |
| `analytics.enabled` / `endpoint` | `false` / `/api/collect` | enable + point to your collector |
| `paymentInfo.paynowQr` | placeholder PNG | your real PayNow QR image |
| `paymentInfo.paynowId` | `+65 8341 7888` | your real PayNow mobile or UEN (shown as text) |
| `paymentInfo.gstRegistered` | `false` | `true` if/when you register for GST |

**PayNow safety:** the page shows the QR **and** the PayNow number **and** asks the
customer to verify the payee name (“Letterbox Lock Singapore”) before paying. A QR/number
can only be changed by someone who edits your hosted files, so keep your host account
secure; the strict security headers already block third-party tampering in the browser.

**Forgiving inputs:** Unit accepts a plain number (e.g. `1518`, `13533`) or a dashed
form (`12-345`); the dash is optional. Postal code accepts anything from the 2-digit
sector (`52`) up to the full 6-digit code (`520123`).
| `assets/img/**` | generated placeholders | real product + installation photos |

## Shopping cart (multi-item orders)

- **Add to cart** on each product card (with a colour picker). A floating 🛒 button
  and an in-page cart summary show your items, quantities and live bulk-discount total.
- Cart persists in `localStorage` (no PII — only product id, colour token, quantity).
- **Checkout = WhatsApp handoff.** Pressing “Continue on WhatsApp” sends the whole
  itemised order (plus block/unit/postal/mailbox condition) in one message.
- **No online payment before the job** — by design. The final price is confirmed in
  writing after a photo, and the customer pays by **PayNow (QR + number on the page)**
  or cash **after** the work is done and tested. This avoids refund/dispute risk and
  matches how a Singapore letterbox service actually operates.
- Logic is fully unit-tested (`tests/cart.test.mjs`) and there is an integration test
  (`tests/cart-dom.test.mjs`) that clicks real product cards in the built page.

## Colour options per product (owner-confirmed, test-locked)

P1 Silver · **P2 Black/White/Silver** · P3 Black/White · P4 Black · P5 Black ·
P6 Silver · P7 Black · P8 Black · P9 Silver.

## Ranking on Google — code vs off-page

The code maximises on-page SEO (crawlable static HTML, unique titles/descriptions,
JSON-LD LocalBusiness + Service + FAQ + Breadcrumb + Reviews, fast CSP-safe assets,
mobile-first, sitemap + robots). Ranking #1 also needs off-page work: verify a
**Google Business Profile**, collect **real Google reviews**, submit the sitemap in
**Search Console**, and get **SG directory listings**. With analytics now in place,
you can finally measure which pages and CTAs convert.

## Project structure

```
build.mjs · build-pages.mjs · build-standalone.mjs · checks.mjs · package.json
src/{data.mjs, render.mjs}
assets/css/site.css
assets/js/{pricing,validation,order-message,analytics,app}.mjs
assets/img/**  (incl. paynow-qr.png)
tests/{message-privacy, colour-form, analytics}.test.mjs · tests/_dom-harness.mjs
security/nginx-security.conf · _headers · .github/workflows/ci.yml · locales/en-SG.json
(generated) index.html · <service>/… · <legal>/… · robots.txt · sitemap.xml
```

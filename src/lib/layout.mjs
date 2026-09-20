/* Page chrome: <head>, header, footer, sticky bar, document shell. */

import { esc, tx, t, wa, map, deco, tidy, localePath } from './util.mjs';
import { depthOf, relativise } from './paths.mjs';
import { ui, waMsg } from '../data/i18n.mjs';

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%230b1220'/%3E%3Ctext x='50' y='68' font-size='60' text-anchor='middle' fill='%232563eb'%3E%E2%96%A3%3C/text%3E%3C/svg%3E";

const NAV = [
  ['#products', 'navProducts'],
  ['#why', 'navWhy'],
  ['#partners', 'navPartners'],
  ['#reviews', 'navReviews'],
  ['#areas', 'navAreas'],
  ['#faq', 'navFaq']
];

export const FOOTER_SERVICES = [
  ['/products/', { en: 'All 9 letterbox locks & prices', zh: '全部 9 款信箱锁与价格' }],
  ['/letterbox-lock-price/', { en: 'Letterbox lock replacement cost', zh: '信箱锁更换费用' }],
  ['/letterbox-lock-replacement/', { en: 'Letterbox Lock Replacement Singapore', zh: '新加坡信箱锁更换' }],
  ['/24-hour-letterbox-locksmith/', { en: '24-Hour Letterbox Locksmith', zh: '24 小时信箱锁服务' }],
  ['/mailbox-lock-replacement/', { en: 'Mailbox Lock Replacement — landed & outdoor', zh: '信箱锁更换 — 有地住宅与户外' }],
  ['/letterbox-lock-installation/', { en: 'Letterbox & Mailbox Lock Installation', zh: '信箱锁安装' }],
  ['/digital-letterbox-lock/', { en: 'Digital Letterbox Locks (touch-PIN)', zh: '数码信箱锁（触控密码）' }],
  ['/no-battery-letterbox-lock/', { en: 'No-Battery Combination Locks', zh: '免电池密码锁' }],
  ['/lost-letterbox-key/', { en: 'Lost Letterbox Key Singapore', zh: '新加坡信箱钥匙遗失' }],
  ['/hdb-letterbox-lock/', { en: 'HDB Letterbox Lock Replacement', zh: '组屋信箱锁更换' }],
  ['/condo-mailbox-lock/', { en: 'Condo & MCST Mailbox Lock Replacement', zh: '公寓与管理机构信箱锁更换' }],
  ['/interior-designers-developers/', { en: 'Interior Designers, Developers & Trade', zh: '室内设计师、发展商与商业合作' }],
  ['/group-letterbox-lock-replacement/', { en: 'Bulk Letterbox Lock Replacement', zh: '批量信箱锁更换' }]
];

export const FOOTER_GUIDES = [
  ['/compatibility-guide/', { en: 'Will it fit? Compatibility guide', zh: '装得上吗？兼容性指南' }],
  ['/repair-or-replace/', { en: 'Repair or replace your letterbox lock', zh: '维修还是更换信箱锁' }],
  ['/about/', { en: 'About us', zh: '关于我们' }],
  ['/#areas', { en: 'Service areas', zh: '服务范围' }]
];

export const FOOTER_LEGAL = [
  ['/privacy-policy/', { en: 'Privacy Policy', zh: '隐私政策' }],
  ['/terms/', { en: 'Terms', zh: '服务条款' }],
  ['/warranty/', { en: 'Warranty', zh: '保固' }],
  ['/cancellation/', { en: 'Cancellation', zh: '取消政策' }]
];

/* ------------------------------------------------------------------ head */
export function head(d, page, locale) {
  const s = d.site;
  const o = s.origin;
  const url = o + page.url;
  const enUrl = o + localePath(page.path, 'en');
  const zhUrl = o + localePath(page.path, 'zh');
  const img = o + s.ogImage;

  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.keywords ? `<meta name="keywords" content="${esc(page.keywords)}">\n` : ''}<meta name="robots" content="${page.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}">
<meta name="theme-color" content="${s.themeColor}">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=yes">
<meta name="geo.region" content="SG">
<meta name="geo.placename" content="Singapore">
<meta name="author" content="${esc(s.name)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en-SG" href="${enUrl}">
<link rel="alternate" hreflang="zh-SG" href="${zhUrl}">
<link rel="alternate" hreflang="x-default" href="${enUrl}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${locale === 'zh' ? 'zh_SG' : 'en_SG'}">
<meta property="og:locale:alternate" content="${locale === 'zh' ? 'en_SG' : 'zh_SG'}">
<meta property="og:site_name" content="${esc(locale === 'zh' ? s.nameZh : s.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:alt" content="${esc(s.name)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${img}">
<link rel="icon" href="${FAVICON}">
<link rel="apple-touch-icon" href="${FAVICON}">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/css/site.css">`;
}

/* ---------------------------------------------------------------- header */
export function header(d, page, locale) {
  const s = d.site;
  const other = locale === 'en' ? 'zh' : 'en';
  const otherUrl = localePath(page.path, other);
  const home = localePath('/', locale);
  const base = home === '/' ? '' : home.replace(/\/$/, '');

  const links = map(NAV, ([href, key]) =>
    `      <a href="${base}/${href}">${tx(ui[key], locale)}</a>`.replace('//#', '/#'));

  return `<a class="skip" href="#main">${tx(ui.skip, locale)}</a>
<div class="top">${tx(ui.topBar, locale)}</div>
<header class="header">
  <div class="wrap nav">
    <a class="brand" href="${home}" aria-label="${esc(t(ui.homeAria, locale))}">
      <span class="mark" aria-hidden="true">▣</span>
      <span><strong>${tx(ui.brandName, locale)}</strong><small>${tx(ui.brandSub, locale)}</small></span>
    </a>
    <nav class="links" id="primary-nav" aria-label="${esc(t(ui.primaryNav, locale))}">
${links}
      <span class="mobile-extra">
        <a class="btn lang" href="${otherUrl}" hreflang="${other}" lang="${other}" data-ev="lang-switch-mobile">${tx(ui.langSwitch, locale)}</a>
      </span>
    </nav>
    <div class="actions">
      <a class="btn lang" href="${otherUrl}" hreflang="${other}" lang="${other}" aria-label="${esc(t(ui.langAria, locale))}" data-ev="lang-switch">${tx(ui.langSwitch, locale)}</a>
      <a class="btn white" data-tel data-ev="call" href="tel:${s.phoneHref}">${tx(ui.call, locale)}</a>
      <a class="btn green" data-wa data-ev="whatsapp" href="${wa(s.whatsappNumber, t(waMsg.quote, locale))}" rel="noopener noreferrer">${tx(ui.whatsapp, locale)}</a>
    </div>
    <a class="btn order header-order" data-ev="order-nav" href="${home}#order">${deco('🔒')} ${tx(ui.order, locale)}</a>
    <button class="menu" type="button" aria-label="${esc(t(ui.openMenu, locale))}" aria-expanded="false" aria-controls="primary-nav">☰</button>
  </div>
</header>`;
}

/* ---------------------------------------------------------------- footer */
export function footer(d, page, locale) {
  const s = d.site;
  const other = locale === 'en' ? 'zh' : 'en';

  const navBlock = (label, items) =>
    `<nav aria-label="${esc(t(label, locale))}"><strong>${tx(label, locale)}</strong>
${map(items, ([href, txt]) => `      <a href="${localePath(href, locale)}">${tx(txt, locale)}</a>`)}
    </nav>`;

  return `<footer class="footer">
  <div class="wrap footer-grid">
    <div>
      <a class="brand" href="${localePath('/', locale)}"><span class="mark mark-light" aria-hidden="true">▣</span>
        <span><strong>${tx(ui.brandName, locale)}</strong><small>${tx(ui.brandSub, locale)}</small></span></a>
      <p class="mw-38">${tx(ui.ftAbout, locale)}</p>
      <p class="mw-38 hours">${tx(ui.ftHours, locale)} · ${s.phoneDisplay}</p>
      <p class="mw-38"><a class="foot-lang" href="${localePath(page.path, other)}" hreflang="${other}" lang="${other}">${tx(ui.langSwitch, locale)}</a></p>
    </div>
    ${navBlock(ui.ftServices, FOOTER_SERVICES)}
    ${navBlock(ui.ftGuides, FOOTER_GUIDES)}
    <nav aria-label="${esc(t(ui.ftLegal, locale))}"><strong>${tx(ui.ftLegal, locale)}</strong>
      <a data-tel data-ev="call" href="tel:${s.phoneHref}" data-phone-display>${tx(ui.ftCallUs, locale)}</a>
      <a data-wa data-ev="whatsapp" href="${wa(s.whatsappNumber, t(waMsg.quote, locale))}" rel="noopener noreferrer">${tx(ui.whatsapp, locale)}</a>
${map(FOOTER_LEGAL, ([href, txt]) => `      <a href="${localePath(href, locale)}">${tx(txt, locale)}</a>`)}
    </nav>
  </div>
  <div class="copy">© <span id="yr">${new Date().getFullYear()}</span> ${esc(locale === 'zh' ? s.nameZh : s.name)} · ${tx(ui.ftCopy, locale)}</div>
</footer>`;
}

export function stickyBar(d, locale) {
  const s = d.site;
  return `<div class="sticky-mobile">
  <a data-tel data-ev="call" href="tel:${s.phoneHref}"><span aria-hidden="true">📞</span> ${tx(ui.call, locale)}</a>
  <a data-wa data-ev="whatsapp" href="${wa(s.whatsappNumber, t(waMsg.quote, locale))}" rel="noopener noreferrer"><span aria-hidden="true">💬</span> ${tx(ui.whatsapp, locale)}</a>
  <a class="sm-order" data-ev="order-nav" href="${localePath('/', locale)}#order">${deco('🔒')} ${tx(ui.order, locale)}<span class="sm-count" id="quoteCount" hidden>0</span></a>
</div>`;
}

export function noscriptNote(d, locale) {
  return `<noscript><div class="wrap ns-wrap"><p class="noscript-note">${tx(ui.noscript, locale)} ${d.site.phoneDisplay}.</p></div></noscript>`;
}

export function lightbox(locale) {
  return `<dialog id="lightbox" aria-label="${esc(t(ui.photoDialog, locale))}">
  <button type="button" data-close aria-label="${esc(t(ui.closePhoto, locale))}" class="lb-close">×</button>
  <div class="lb-body"><img id="lightboxImg" src="" alt="" width="800" height="800" class="lb-img">
    <p class="lb-cap" id="lightboxCap"></p></div>
</dialog>`;
}

/** Inline data island consumed by app.mjs. */
export function dataIsland(d, locale) {
  const localise = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, { ...v, label: t(v.label, locale), note: v.note ? t(v.note, locale) : undefined }]));

  const payload = {
    locale,
    site: {
      phoneE164: d.site.phoneE164,
      phoneDisplay: d.site.phoneDisplay,
      whatsappNumber: d.site.whatsappNumber,
      pricing: {
        ...d.pricing,
        accessFees: localise(d.pricing.accessFees),
        scheduling: localise(d.pricing.scheduling),
        tiers: d.pricing.tiers.map((x) => ({ ...x, label: t(x.label, locale) }))
      },
      analytics: d.site.analytics
    },
    strings: { added: t(ui.added, locale) },
    colours: Object.fromEntries(
      Object.entries(d.colours).map(([k, v]) => [k, { hex: v.hex, label: t(v.label, locale) }])
    ),
    products: d.products.map((p) => ({
      id: p.id, name: t(p.name, locale), price: p.price,
      colours: p.colours, categories: p.categories, powerType: p.powerType
    }))
  };
  return `<script type="application/json" id="site-data">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;
}

/* -------------------------------------------------------------- document */
export function document_(d, page, { body, jsonld, locale = 'en', mode = 'production' }) {
  const html = tidy(`<!doctype html>
<html lang="${locale === 'zh' ? 'zh-SG' : 'en-SG'}">
<head>
${head(d, page, locale)}
<script type="application/ld+json">${jsonld}</script>
</head>
<body${page.bodyClass ? ` class="${page.bodyClass}"` : ''}>
${header(d, page, locale)}
<main id="main">
${body}
</main>
${lightbox(locale)}
${footer(d, page, locale)}
${stickyBar(d, locale)}
${noscriptNote(d, locale)}
${dataIsland(d, locale)}
<script type="module" src="/assets/js/app.mjs"></script>
</body>
</html>`);

  return mode === 'preview' ? relativise(html, depthOf(page.url)) : html;
}

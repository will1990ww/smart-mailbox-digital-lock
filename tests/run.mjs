#!/usr/bin/env node
/* Unit tests for the build layer. checks.mjs validates the emitted HTML. */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as S from '../src/lib/schema.mjs';
import * as U from '../src/lib/util.mjs';
import { pages } from '../src/data/pages.mjs';
import { ui, waMsg } from '../src/data/i18n.mjs';
import { buildHomepage, buildManifest, buildRobots } from '../build.mjs';
import { buildPage, buildSitemap, resolvePage } from '../build-pages.mjs';
import { depthOf, prefixFor, toRelative, relativise } from '../src/lib/paths.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; }
  catch (e) { failures.push(`${name}\n      ${e.message}`); }
}
const eq = (a, b, msg = '') => {
  if (a !== b) throw new Error(`${msg} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
};
const ok = (v, msg = 'expected truthy') => { if (!v) throw new Error(msg); };
const has = (hay, needle, msg = '') => {
  if (!String(hay).includes(needle)) throw new Error(`${msg} missing: ${needle}`);
};
const hasNot = (hay, needle, msg = '') => {
  if (String(hay).includes(needle)) throw new Error(`${msg} should not contain: ${needle}`);
};
const hasCjk = (s) => /[\u4e00-\u9fff]/.test(s);

const d = JSON.parse(await readFile(join(ROOT, 'src/data/site.json'), 'utf8'));
const CSS = await readFile(join(ROOT, 'src/assets/css/site.css'), 'utf8');

/* --------------------------------------------------------------- util --- */
test('t() resolves bilingual fields and falls back to English', () => {
  eq(U.t({ en: 'Hello', zh: '你好' }, 'en'), 'Hello');
  eq(U.t({ en: 'Hello', zh: '你好' }, 'zh'), '你好');
  eq(U.t({ en: 'Hello' }, 'zh'), 'Hello');
  eq(U.t('plain', 'zh'), 'plain');
  eq(U.t(null, 'en'), '');
});

test('esc escapes all five HTML metacharacters', () => {
  eq(U.esc('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});

test('escSoft escapes bare ampersands but preserves entities', () => {
  eq(U.escSoft('Tom &amp; Jerry & Co'), 'Tom &amp; Jerry &amp; Co');
  eq(U.escSoft('a &#39;b'), 'a &#39;b');
});

test('price formats integers and decimals correctly', () => {
  eq(U.price(50), 'S$50');
  eq(U.price(47.5), 'S$47.50');
});

test('localePath puts English at root and Chinese under /zh/', () => {
  eq(U.localePath('/', 'en'), '/');
  eq(U.localePath('/', 'zh'), '/zh/');
  eq(U.localePath('/products/', 'zh'), '/zh/products/');
});

test('wa encodes Chinese message templates safely', () => {
  const link = U.wa('6583417888', U.t(waMsg.quote, 'zh'));
  ok(/^https:\/\/wa\.me\/6583417888\?text=(%[0-9A-F]{2}|[\w.~-])+$/i.test(link), 'must be fully encoded');
});

/* ---------------------------------------------------------------- data --- */
test('every product has a unique id and image filename', () => {
  const ids = d.products.map((p) => p.id);
  eq(new Set(ids).size, ids.length, 'duplicate product ids');
  const files = [...d.products.map((p) => p.image), ...d.gallery.map((g) => g.file)];
  eq(new Set(files).size, files.length, 'duplicate image filenames');
});

test('image filenames are descriptive and kebab-case', () => {
  for (const p of d.products) {
    ok(/^[a-z0-9-]+\.jpg$/.test(p.image), `${p.id} image not kebab-case: ${p.image}`);
    ok(p.image.startsWith(p.id.toLowerCase() + '-'), `${p.image} should start with ${p.id.toLowerCase()}-`);
  }
  for (const g of d.gallery) {
    ok(/^job-\d{2}-[a-z0-9-]+\.jpg$/.test(g.file), `gallery name not conventional: ${g.file}`);
  }
});

test('only P4 carries a brand', () => {
  for (const p of d.products) {
    if (p.id === 'P4') eq(p.brand, 'WT');
    else eq(p.brand, null, `${p.id} should have no brand`);
  }
});

test('no product other than P4 mentions WT in its copy', () => {
  for (const p of d.products) {
    if (p.id === 'P4') continue;
    for (const key of ['name', 'blurb', 'bestFor', 'alt']) {
      for (const loc of U.LOCALES) hasNot(U.t(p[key], loc), 'WT', `${p.id}.${key}.${loc}`);
    }
  }
});

test('pricing bounds match the catalogue', () => {
  eq(d.pricing.maxPrice, Math.max(...d.products.map((p) => p.price)));
  ok(d.pricing.minPrice <= Math.min(...d.products.map((p) => p.price)));
});

test('exactly 7 of 9 models are battery-free', () => {
  eq(d.products.filter((p) => p.powerType === 'none').length, 7);
  eq(d.products.length, 9);
});

test('every product carries the long-form detail /products/ renders', () => {
  for (const p of d.products) {
    for (const key of ['advantages', 'considerations', 'notSuitable']) {
      ok(Array.isArray(p[key]) && p[key].length >= 1, `${p.id}.${key} is empty`);
      for (const item of p[key]) {
        ok(item.en && item.zh, `${p.id}.${key} entry missing a language`);
        ok(hasCjk(item.zh), `${p.id}.${key} zh has no Chinese`);
      }
    }
  }
});

test('every review cites a real product', () => {
  const ids = new Set(d.products.map((p) => p.id));
  for (const r of d.reviews) ok(ids.has(r.model), `review by ${r.name} cites ${r.model}`);
});

test('the urgent surcharge is defined in exactly one place', () => {
  eq(d.pricing.scheduling.URGENT.perJob, d.pricing.urgentFee);
  eq(d.pricing.scheduling.STANDARD.perJob, 0);
});

test('the extras table documents both the unlock and urgent fees', () => {
  const all = d.extras.map((e) => U.t(e.value, 'en')).join(' ');
  has(all, String(d.pricing.unlockFee), 'unlock fee');
  has(all, String(d.pricing.urgentFee), 'urgent fee');
});

test('opening hours are 24/7', () => {
  eq(d.site.hours.alwaysOpen, true);
  const spec = S.business(d, 'en').openingHoursSpecification[0];
  eq(spec.opens, '00:00');
  eq(spec.closes, '23:59');
  eq(spec.dayOfWeek.length, 7);
});

/* ----------------------------------------------------------- bilingual --- */
test('every bilingual data field carries both languages', () => {
  const walk = (node, path) => {
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`));
    if (node && typeof node === 'object') {
      const keys = Object.keys(node);
      if (keys.includes('en') || keys.includes('zh')) {
        ok(node.en, `${path} missing en`);
        ok(node.zh, `${path} missing zh`);
        ok(hasCjk(String(node.zh)), `${path}.zh has no Chinese characters`);
        return;
      }
      keys.forEach((k) => walk(node[k], `${path}.${k}`));
    }
  };
  for (const key of ['products', 'upcoming', 'included', 'extras', 'whyUs', 'partners',
                     'steps', 'reviews', 'gallery', 'faqs']) {
    walk(d[key], key);
  }
});

test('every UI string has both languages', () => {
  // Brand names and numerals stay untranslated by design.
  const NO_CJK_OK = new Set(['whatsapp', 'langSwitch', 'proof2a']);
  for (const [key, val] of Object.entries(ui)) {
    ok(val.en !== undefined, `ui.${key} missing en`);
    ok(val.zh !== undefined, `ui.${key} missing zh`);
    if (NO_CJK_OK.has(key) || typeof val.zh === 'function') continue;
    const zh = Array.isArray(val.zh) ? JSON.stringify(val.zh) : String(val.zh);
    ok(hasCjk(zh), `ui.${key}.zh has no Chinese characters`);
  }
});

test('the data layer stores plain text, not pre-encoded entities', () => {
  for (const [key, val] of Object.entries(ui)) {
    if (typeof val.en === 'function') continue;
    ok(!JSON.stringify(val).includes('&amp;'), `ui.${key} holds a pre-encoded &amp;`);
  }
  for (const p of pages) {
    ok(!p.title.en.includes('&amp;'), `${p.path} title holds &amp;`);
    ok(!p.description.en.includes('&amp;'), `${p.path} description holds &amp;`);
  }
});

test('titles and descriptions respect per-locale SERP limits', () => {
  for (const p of pages) {
    ok(p.title.en.length <= 65, `${p.path} en title ${p.title.en.length} chars`);
    ok(p.title.zh.length <= 34, `${p.path} zh title ${p.title.zh.length} chars`);
    ok(p.description.en.length <= 165, `${p.path} en desc ${p.description.en.length} chars`);
    ok(p.description.zh.length <= 85, `${p.path} zh desc ${p.description.zh.length} chars`);
  }
});

/* ---------------------------------------------------------- layout math -- */
test('why-us cards fill every grid row', () => {
  for (const cols of [1, 2, 4]) eq(d.whyUs.length % cols, 0, `${d.whyUs.length} cards at ${cols} cols:`);
});

test('partner cards fill every grid row', () => {
  for (const cols of [1, 2, 4]) eq(d.partners.length % cols, 0, `${d.partners.length} cards at ${cols} cols:`);
});

test('gallery cells fill every grid row', () => {
  eq(d.gallery.length, 18, 'gallery size');
  for (const cols of [2, 3, 6]) eq(d.gallery.length % cols, 0, `${d.gallery.length} cells at ${cols} cols:`);
});

test('nav extras are hidden by default so they cannot duplicate on desktop', () => {
  // Regression: .mobile-extra had no default display, so the drawer copy of the
  // language switch rendered alongside the desktop one.
  ok(CSS.includes('.mobile-extra { display: none; }'), 'missing default display:none');
});

test('product copy stays short enough for a tidy card', () => {
  for (const p of d.products) {
    ok(p.blurb.en.length <= 80, `${p.id} blurb is ${p.blurb.en.length} chars`);
    ok(p.bestFor.en.length <= 80, `${p.id} bestFor is ${p.bestFor.en.length} chars`);
    ok(p.blurb.zh.length <= 40, `${p.id} zh blurb is ${p.blurb.zh.length} chars`);
  }
});

/* -------------------------------------------------------------- schema --- */
test('business node is a service-area business with enumerated towns', () => {
  const b = S.business(d, 'en');
  ok(b['@type'].includes('LocalBusiness'));
  eq(b.serviceArea['@type'], 'GeoCircle');
  eq(b.areaServed.length, d.towns.length + 1, 'Singapore + every town');
});

test('priceRange matches the catalogue bounds', () => {
  eq(S.business(d, 'en').priceRange, `${U.price(d.pricing.minPrice)}–${U.price(d.pricing.maxPrice)}`);
});

test('JSON-LD offers carry a brand only for P4', () => {
  for (const offer of S.business(d, 'en').hasOfferCatalog.itemListElement) {
    const sku = offer.itemOffered.sku;
    if (sku === 'P4') eq(offer.itemOffered.brand.name, 'WT');
    else eq(offer.itemOffered.brand, undefined, `${sku} should have no brand node`);
  }
});

test('every JSON-LD offer price matches the catalogue', () => {
  for (const offer of S.business(d, 'en').hasOfferCatalog.itemListElement) {
    const p = d.products.find((x) => x.id === offer.itemOffered.sku);
    ok(p, `offer for unknown sku ${offer.itemOffered.sku}`);
    eq(Number(offer.price), p.price, `${p.id} price mismatch:`);
  }
});

test('the Service node advertises 24-hour availability', () => {
  const h = S.service(d, 'en').hoursAvailable;
  eq(h.opens, '00:00');
  eq(h.dayOfWeek.length, 7);
});

test('render escapes "<" so the script tag cannot be broken out of', () => {
  const json = S.render([{ '@type': 'Thing', name: '</script><img onerror=alert(1)>' }]);
  hasNot(json, '</script>');
  has(json, '\\u003c');
});

test('prune removes null/undefined but keeps 0 and false', () => {
  const out = S.prune({ a: null, b: undefined, c: 0, e: false, f: { g: null, h: 1 } });
  eq('a' in out, false); eq(out.c, 0); eq(out.e, false); eq(out.f.h, 1); eq('g' in out.f, false);
});

/* --------------------------------------------------------------- paths --- */
test('depthOf counts directories, not filenames', () => {
  eq(depthOf('/'), 0); eq(depthOf('/404.html'), 0);
  eq(depthOf('/products/'), 1); eq(depthOf('/zh/products/'), 2);
});

test('prefixFor builds the right number of parent hops', () => {
  eq(prefixFor(0), ''); eq(prefixFor(1), '../'); eq(prefixFor(2), '../../');
});

test('toRelative converts directory URLs to explicit index.html', () => {
  eq(toRelative('/', 0), 'index.html');
  eq(toRelative('/zh/products/', 2), '../../zh/products/index.html');
  eq(toRelative('#products', 1), '#products');
  eq(toRelative('https://wa.me/1', 1), 'https://wa.me/1');
});

test('relativise rewrites assets but never canonical or JSON-LD', () => {
  const doc = [
    '<link rel="canonical" href="https://www.letterboxlock.sg/products/">',
    '<link rel="stylesheet" href="/assets/css/site.css">',
    '<script type="application/ld+json">{"url":"https://www.letterboxlock.sg/"}</script>',
    '<a href="/about/">About</a>',
    '<script type="module" src="/assets/js/app.mjs"></script>'
  ].join('\n');
  const out = relativise(doc, 1);
  has(out, 'href="../assets/css/site.css"');
  has(out, 'href="../about/index.html"');
  has(out, '<script defer src="../assets/js/app.mjs">');
  has(out, 'canonical" href="https://www.letterboxlock.sg/products/"');
});

/* -------------------------------------------------------------- output --- */
const homeEn = buildHomepage(d, 'en');
const homeZh = buildHomepage(d, 'zh');

test('homepages declare the correct language', () => {
  has(homeEn, '<html lang="en-SG">');
  has(homeZh, '<html lang="zh-SG">');
});

test('each homepage has exactly one h1', () => {
  eq((homeEn.match(/<h1[\s>]/g) || []).length, 1);
  eq((homeZh.match(/<h1[\s>]/g) || []).length, 1);
});

test('the Chinese homepage is genuinely translated', () => {
  const h1 = homeZh.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g, '');
  ok(hasCjk(h1), 'zh h1 has no Chinese');
  const main = homeZh.match(/<main[\s\S]*?<\/main>/)[0];
  for (const phrase of ['Add to order', 'Best for:', 'Coming soon']) hasNot(main, phrase, 'untranslated UI');
});

test('the header renders Call exactly once', () => {
  const hdr = homeEn.match(/<header class="header">[\s\S]*?<\/header>/)[0];
  eq((hdr.match(/>Call</g) || []).length, 1, 'Call links in header:');
});

test('the hero carries the no-fit-no-fee guarantee card', () => {
  for (const html of [homeEn, homeZh]) {
    const hero = html.match(/<section class="hero">[\s\S]*?<\/section>/)[0];
    has(hero, 'guarantee-card', 'guarantee card in hero');
    has(hero, 'guar-list', 'guarantee list');
  }
  has(homeEn, 'No fit, no fee');
  has(homeZh, '装不上，不收费');
});

test('the order form offers standard and urgent scheduling', () => {
  for (const html of [homeEn, homeZh]) {
    has(html, 'sched-switch', 'scheduling fieldset');
    has(html, 'data-schedule="STANDARD"');
    has(html, 'data-schedule="URGENT"');
    has(html, `S$${d.pricing.urgentFee}`, 'urgent fee shown');
  }
});

test('the site no longer claims to be closed at night', () => {
  for (const html of [homeEn, homeZh]) {
    hasNot(html, 'not a 24-hour', '24h claim');
    hasNot(html, '09:00–21:00', 'old opening hours');
  }
});

test('both homepages render products, partners and the full gallery', () => {
  for (const html of [homeEn, homeZh]) {
    for (const p of d.products) has(html, `id="${p.id}"`, `card for ${p.id}`);
    eq((html.match(/partner-card/g) || []).length, d.partners.length);
    eq((html.match(/class="cell"/g) || []).length, d.gallery.length);
    eq((html.match(/why-card/g) || []).length, d.whyUs.length);
  }
});

test('the why heading is derived from the card count', () => {
  has(homeEn, `${d.whyUs.length} reasons this is a risk-free job`);
  has(homeZh, `${d.whyUs.length} 个让您零风险的理由`);
});

test('production homepage never links to index.html', () => {
  hasNot(homeEn, 'index.html');
  hasNot(homeZh, 'index.html');
});

test('the order form degrades without JavaScript', () => {
  has(homeEn, 'method="get"');
  has(homeEn, 'action="https://wa.me/');
});

test('every form field is wired to its error message', () => {
  for (const f of ['productId', 'colour', 'quantity', 'postal', 'block', 'unit', 'authorised']) {
    has(homeEn, `id="err-${f}"`, `error slot for ${f}`);
    has(homeEn, `aria-describedby="err-${f}"`, `describedby for ${f}`);
  }
});

test('every product image is lazy — the grid is below the fold', () => {
  const grid = homeEn.match(/id="productGrid">([\s\S]*?)<h3 class="sub-h"/)[1];
  const imgs = grid.match(/<img[^>]*>/g) || [];
  eq(imgs.length, d.products.length);
  for (const i of imgs) has(i, 'loading="lazy"', 'product image');
});

test('rendered pages escape ampersands exactly once', () => {
  for (const html of [homeEn, homeZh]) {
    hasNot(html, '&amp;amp;', 'double-escaped entity');
    const noScript = html.replace(/<script[\s\S]*?<\/script>/g, '');
    ok(!/&(?!(?:amp|lt|gt|quot|nbsp|#\d+|#x[0-9a-fA-F]+);)/.test(noScript), 'raw ampersand');
  }
});

test('homepage JSON-LD covers the expected node types', () => {
  const raw = homeEn.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  const types = JSON.parse(raw)['@graph'].flatMap((n) => [].concat(n['@type']));
  for (const t of ['LocalBusiness', 'WebSite', 'WebPage', 'Service', 'HowTo', 'FAQPage']) {
    ok(types.includes(t), `missing ${t} node`);
  }
});

test('the data island exposes the scheduling options to the estimator', () => {
  for (const [html, loc] of [[homeEn, 'en'], [homeZh, 'zh']]) {
    const raw = html.match(/<script type="application\/json" id="site-data">([\s\S]*?)<\/script>/)[1];
    const parsed = JSON.parse(raw.replace(/\\u003c/g, '<'));
    eq(parsed.locale, loc);
    eq(parsed.site.pricing.scheduling.URGENT.perJob, d.pricing.urgentFee);
    ok(parsed.site.pricing.scheduling.URGENT.label, 'urgent label localised');
  }
});

test('the products page renders long-form detail, not compact cards', () => {
  const productsPage = pages.find((p) => p.path === '/products/');
  for (const loc of U.LOCALES) {
    const html = buildPage(d, productsPage, loc);
    eq((html.match(/class="prod-detail"/g) || []).length, d.products.length);
    has(html, 'spec-grid', 'advantages/considerations grid');
    has(html, 'glance', 'at-a-glance spec table');
    // The compact homepage card must not appear here.
    ok(!/class="prod"/.test(html), 'compact cards should not be on /products/');
  }
});

test('sub-pages build in both languages with breadcrumbs', () => {
  const seen = new Set();
  for (const page of pages) {
    for (const loc of U.LOCALES) {
      const html = buildPage(d, page, loc);
      ok(html.startsWith('<!doctype html>'), `${page.path} ${loc} malformed`);
      eq((html.match(/<h1[\s>]/g) || []).length, 1, `${page.path} ${loc} h1 count:`);
      has(html, 'BreadcrumbList', `${page.path} ${loc} breadcrumb`);
      hasNot(html, 'index.html', `${page.path} ${loc} link hygiene`);
      ok(!seen.has(html), `${page.path} ${loc} is byte-identical to another page`);
      seen.add(html);
    }
  }
});

test('a dedicated 24-hour page exists and is indexable', () => {
  const p = pages.find((x) => x.path === '/24-hour-letterbox-locksmith/');
  ok(p, '24-hour page missing');
  has(p.keywords, '24 hour', 'keyword');
  const html = buildPage(d, p, 'en');
  has(html, 'Urgent installation', 'urgent section');
});

test('preview build keeps structured data absolute', () => {
  const prev = buildPage(d, pages[0], 'zh', 'preview');
  has(prev, 'href="../../assets/css/site.css"', 'zh sub-page depth is 2');
  const ld = prev.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  for (const node of JSON.parse(ld.replace(/\\u003c/g, '<'))['@graph']) {
    if (node.url) ok(node.url.startsWith('https://'), `non-absolute url: ${node.url}`);
  }
});

test('sitemap lists both languages with hreflang alternates', () => {
  const xml = buildSitemap(d);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  eq(locs.length, (pages.length + 1) * U.LOCALES.length);
  eq(new Set(locs).size, locs.length, 'duplicate sitemap entries');
  for (const l of locs) ok(l.startsWith('https://'), `${l} is not https`);
  has(xml, 'hreflang="zh-SG"');
  has(xml, 'hreflang="x-default"');
});

test('resolvePage produces the right locale URL', () => {
  eq(resolvePage(pages[0], 'en').url, pages[0].path);
  eq(resolvePage(pages[0], 'zh').url, '/zh' + pages[0].path);
});

test('robots.txt points at the sitemap and never blocks the site', () => {
  const txt = buildRobots(d);
  has(txt, 'Sitemap: https://');
  ok(!/^Disallow:\s*\/\s*$/m.test(txt), 'must not disallow everything');
});

test('the web manifest is valid JSON with a maskable icon', () => {
  const m = JSON.parse(buildManifest(d));
  ok(m.name && m.icons.length >= 2 && m.start_url);
  ok(m.icons.some((i) => i.purpose === 'maskable'), 'needs a maskable icon');
});

/* ------------------------------------------------------ copy guardrails -- */
test('backup-key wording never carries the "does not open" clause', () => {
  for (const prod of d.products) {
    for (const loc of U.LOCALES) {
      hasNot(U.t(prod.backupKey, loc), 'does not open', `${prod.id}.backupKey.${loc}`);
      hasNot(U.t(prod.backupKey, loc), '不能开锁', `${prod.id}.backupKey.${loc}`);
    }
  }
});

test('P3 retrieves the code like the other backup-key models', () => {
  const p3 = d.products.find((p) => p.id === 'P3');
  has(p3.backupKey.en, 'retrieves your code');
  // No page may still claim P3 opens the lock outright.
  for (const page of pages) {
    const blob = JSON.stringify(page);
    hasNot(blob, 'P3 gives you a backup key that opens', page.path);
    hasNot(blob, 'backup key that opens the lock', page.path);
  }
});

test('P4 advertises a 4 to 14 digit code', () => {
  const p4 = d.products.find((p) => p.id === 'P4');
  eq(p4.codeDigits, '4–14');
  has(p4.blurb.en, '4 to 14');
  has(p4.blurb.zh, '4 至 14');
});

test('upcoming entries invite an enquiry instead of naming a product', () => {
  eq(d.upcoming.length, 3);
  for (const u of d.upcoming) {
    eq(u.name.en, 'Tell us your need');
    ok(u.name.zh.includes('告诉我们'), 'zh prompt');
    // Old speculative model names must not reappear.
    for (const banned of ['Fingerprint', 'App + PIN', 'Anti-Pick']) {
      hasNot(JSON.stringify(u), banned, 'upcoming entry');
    }
  }
});

test('urgent wording never promises a specific day', () => {
  const BANNED = ['same-day', 'Same-day', 'same day', 'Same day', '当天紧急', '当天上门'];
  const blobs = [JSON.stringify(d), JSON.stringify(ui), JSON.stringify(pages), homeEn, homeZh];
  for (const blob of blobs) {
    for (const term of BANNED) hasNot(blob, term, `banned phrase "${term}"`);
  }
  eq(d.pricing.scheduling.URGENT.label.en, 'Urgent installation (+S$10)');
});

test('we describe ourselves as a specialist, not a one-person operation', () => {
  const BANNED = ['owner-operated', 'one man', 'one-man', 'small business', '东主亲自经营'];
  for (const blob of [JSON.stringify(ui), JSON.stringify(pages), homeEn, homeZh]) {
    for (const term of BANNED) hasNot(blob, term, `banned phrase "${term}"`);
  }
  has(ui.operatorP.en, 'dedicated letterbox lock specialist');
});

/* --------------------------------------------------------------- report -- */
console.log(`\n${passed} passed, ${failures.length} failed\n`);
if (failures.length) {
  failures.forEach((f) => console.log('  ✗ ' + f));
  console.log('');
  process.exit(1);
}
console.log('✓ all tests passed\n');

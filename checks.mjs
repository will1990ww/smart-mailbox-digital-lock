#!/usr/bin/env node
/* Post-build validation. Exits non-zero on any error so CI fails loudly. */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));

const errors = [];
const warnings = [];
const fail = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const SKIP_DIRS = new Set(['node_modules', 'src', 'tests', 'tools', 'deploy', 'assets']);

async function htmlFiles(dir = ROOT, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await htmlFiles(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

/* ------------------------------------------------------------ tag balance */
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

function checkTagBalance(file, html) {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style></style>');

  const stack = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g;
  let m;
  while ((m = re.exec(cleaned))) {
    const [, closing, rawName, attrs] = m;
    const name = rawName.toLowerCase();
    if (VOID.has(name) || attrs.trim().endsWith('/')) continue;
    if (closing) {
      if (!stack.length) return fail(file, `stray closing </${name}>`);
      const open = stack.pop();
      if (open !== name) return fail(file, `tag mismatch — expected </${open}>, found </${name}>`);
    } else stack.push(name);
  }
  if (stack.length) fail(file, `unclosed tags: ${stack.join(', ')}`);
}

/* ---------------------------------------------------------------- JSON-LD */
function checkJsonLd(file, html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) return fail(file, 'no JSON-LD block');
  let data;
  try { data = JSON.parse(blocks[0][1]); }
  catch (e) { return fail(file, `JSON-LD is not valid JSON — ${e.message}`); }
  if (!data['@context']) fail(file, 'JSON-LD missing @context');
  if (!Array.isArray(data['@graph'])) return fail(file, 'JSON-LD missing @graph array');
  for (const node of data['@graph']) if (!node['@type']) fail(file, 'JSON-LD node without @type');
  if (blocks[0][1].includes('<')) fail(file, 'JSON-LD contains an unescaped "<"');
  return data;
}

/* ------------------------------------------------------------------- meta */
function checkMeta(file, html) {
  const get = (re) => (html.match(re) || [])[1];
  const isZh = /<html lang="zh-SG">/.test(html);
  // CJK renders roughly twice as wide per character in SERPs.
  const titleLimit = isZh ? 34 : 65;
  const descLimit = isZh ? 85 : 165;

  const title = get(/<title>([\s\S]*?)<\/title>/);
  if (!title) fail(file, 'missing <title>');
  else if (title.length > titleLimit) warn(file, `title is ${title.length} chars (>${titleLimit})`);

  const desc = get(/<meta name="description" content="([^"]*)"/);
  if (!desc) fail(file, 'missing meta description');
  else if (desc.length > descLimit) warn(file, `meta description is ${desc.length} chars (>${descLimit})`);

  if (!/<link rel="canonical" href="https:\/\//.test(html)) fail(file, 'missing absolute canonical');
  if (!/<meta property="og:url" content="https:\/\//.test(html)) fail(file, 'og:url is not absolute');
  if (!/<html lang="/.test(html)) fail(file, 'missing lang on <html>');
  if (!/<meta name="viewport"/.test(html)) fail(file, 'missing viewport meta');
  if (!/<meta charset="utf-8">/.test(html)) fail(file, 'missing or non-first charset');

  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s === 0) fail(file, 'no <h1>');
  if (h1s > 1) fail(file, `${h1s} <h1> elements (should be exactly 1)`);

  for (const hl of ['en-SG', 'zh-SG', 'x-default']) {
    if (!new RegExp(`hreflang="${hl}"`).test(html)) fail(file, `missing hreflang ${hl}`);
  }

  // Heading levels must not skip — assistive tech relies on the outline.
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i += 1) {
    if (levels[i] > levels[i - 1] + 1) {
      warn(file, `heading level skips h${levels[i - 1]} → h${levels[i]}`);
      break;
    }
  }
}

/* ---------------------------------------------------------- accessibility */
function checkA11y(file, html) {
  for (const m of html.matchAll(/<img\b([^>]*)>/g)) {
    const attrs = m[1];
    if (!/\balt=/.test(attrs)) fail(file, `<img> without alt: ${m[0].slice(0, 90)}`);
    if (!/\bwidth=/.test(attrs) || !/\bheight=/.test(attrs)) {
      warn(file, `<img> without width/height (CLS risk): ${m[0].slice(0, 70)}`);
    }
  }

  for (const attr of ['aria-describedby', 'aria-controls', 'aria-labelledby']) {
    for (const m of html.matchAll(new RegExp(`${attr}="([^"]+)"`, 'g'))) {
      for (const id of m[1].split(/\s+/)) {
        if (!html.includes(`id="${id}"`)) fail(file, `${attr} points at missing id "${id}"`);
      }
    }
  }

  for (const m of html.matchAll(/<label[^>]*\bfor="([^"]+)"/g)) {
    if (!html.includes(`id="${m[1]}"`)) fail(file, `<label for="${m[1]}"> has no matching control`);
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) fail(file, `duplicate id(s): ${[...new Set(dupes)].join(', ')}`);

  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const text = m[2].replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, '').trim();
    if (!text && !/aria-label=/.test(m[1])) fail(file, `<button> with no accessible name: ${m[0].slice(0, 70)}`);
  }

  // Emoji must not sit bare inside an unlabelled interactive element.
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  for (const m of html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
    if (/aria-label=/.test(m[2])) continue;
    const bare = m[3].replace(/<span aria-hidden="true">[\s\S]*?<\/span>/g, '');
    if (EMOJI.test(bare)) warn(file, `emoji not hidden from assistive tech: ${m[0].slice(0, 80)}`);
  }

  // Entity hygiene. Double-escaping renders a literal "&amp;" in titles and
  // SERPs; a raw "&" is invalid markup.
  if (html.includes('&amp;amp;')) fail(file, 'double-escaped entity — data should hold plain text');
  if (html.includes('&amp;#39;')) fail(file, 'double-escaped apostrophe');
  const noScript = html.replace(/<script[\s\S]*?<\/script>/g, '');
  if (/&(?!(?:amp|lt|gt|quot|nbsp|#\d+|#x[0-9a-fA-F]+);)/.test(noScript)) {
    fail(file, 'unescaped raw ampersand in markup');
  }

  if (!/class="skip"/.test(html)) warn(file, 'no skip link');
  if (!/<main\b/.test(html)) fail(file, 'no <main> landmark');
}

/* --------------------------------------------------------------- SEO links */
async function checkLinks(file, html, allPaths, mode) {
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (href.includes('index.html')) {
      // Legitimate in preview builds; a canonical-splitting bug in production.
      if (mode === 'production') fail(file, `link still uses index.html: ${href}`);
      continue;
    }
    if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:') ||
        href.startsWith('data:') || href.startsWith('#')) continue;

    const [path] = href.split('#');
    if (!path.startsWith('/')) {
      if (mode === 'production') warn(file, `relative link: ${href}`);
      continue;
    }
    if (/\.(css|js|mjs|png|jpg|jpeg|webp|avif|svg|xml|txt|webmanifest)$/.test(path)) {
      if (!existsSync(join(ROOT, path.replace(/^\//, '')))) fail(file, `missing asset: ${path}`);
      continue;
    }
    if (!allPaths.has(path)) fail(file, `link to non-existent page: ${href}`);
  }

  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (m[1] && !html.includes(`id="${m[1]}"`)) fail(file, `in-page anchor #${m[1]} has no target`);
  }
}

/* ------------------------------------------------------ price consistency */
async function checkPrices(files) {
  const d = JSON.parse(await readFile(join(ROOT, 'src/data/site.json'), 'utf8'));
  const fmt = (n) => 'S$' + (Number.isInteger(n) ? n : n.toFixed(2));

  const catMax = Math.max(...d.products.map((p) => p.price));
  const catMin = Math.min(...d.products.map((p) => p.price));
  if (catMax !== d.pricing.maxPrice) {
    fail('site.json', `pricing.maxPrice ${d.pricing.maxPrice} !== catalogue max ${catMax}`);
  }

  // Every price legitimately visible anywhere on the site.
  const known = new Set([
    ...d.products.map((p) => fmt(p.price)),
    fmt(d.pricing.unlockFee), fmt(d.pricing.urgentFee),
    fmt(d.pricing.minPrice), fmt(d.pricing.maxPrice),
    fmt(catMin + d.pricing.unlockFee)          // open-and-replace headline
  ]);
  for (const t of d.pricing.tiers) {
    if (!t.rate) continue;
    for (const p of d.products) known.add(fmt(Number((p.price * (1 - t.rate)).toFixed(2))));
  }
  // Copy cites price differences between models ("only S$5 more").
  for (const a of d.products) {
    for (const b of d.products) {
      const delta = Math.abs(a.price - b.price);
      if (delta > 0) known.add(fmt(delta));
    }
  }

  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const rel = relative(ROOT, file);

    const ld = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1];
    if (ld) {
      let graph;
      try { graph = JSON.parse(ld)['@graph']; } catch { graph = null; }

      const biz = graph?.find((n) => String(n['@type']).includes('LocalBusiness'));
      if (biz) {
        const expected = `${fmt(d.pricing.minPrice)}–${fmt(d.pricing.maxPrice)}`;
        if (biz.priceRange !== expected) fail(rel, `priceRange "${biz.priceRange}" should be "${expected}"`);
        for (const offer of biz.hasOfferCatalog?.itemListElement || []) {
          const sku = offer.itemOffered?.sku;
          const product = d.products.find((p) => p.id === sku);
          if (!product) { fail(rel, `JSON-LD offer for unknown sku ${sku}`); continue; }
          if (Number(offer.price) !== product.price) {
            fail(rel, `JSON-LD ${sku} price ${offer.price} !== catalogue ${product.price}`);
          }
        }
      }

      const svc = graph?.find((n) => n['@type'] === 'Service');
      const ps = svc?.offers?.priceSpecification;
      if (ps) {
        if (Number(ps.maxPrice) !== catMax) fail(rel, `Service maxPrice ${ps.maxPrice} !== ${catMax}`);
        if (Number(ps.minPrice) !== d.pricing.minPrice) fail(rel, `Service minPrice ${ps.minPrice} !== ${d.pricing.minPrice}`);
      }
    }

    const body = html.replace(/<script[\s\S]*?<\/script>/g, '');
    for (const m of body.matchAll(/S\$(\d+(?:\.\d+)?)/g)) {
      const shown = 'S$' + m[1];
      if (!known.has(shown)) fail(rel, `price "${shown}" appears on the page but is not in site.json`);
    }
  }
}

/* ------------------------------------------------------- bilingual parity */
async function checkBilingual(files) {
  const en = files.filter((f) => !relative(ROOT, f).startsWith('zh'));
  const zh = files.filter((f) => relative(ROOT, f).startsWith('zh'));

  if (en.length !== zh.length) fail('i18n', `${en.length} English pages but ${zh.length} Chinese pages`);

  for (const f of en) {
    const rel = relative(ROOT, f);
    if (!existsSync(join(ROOT, 'zh', rel))) fail('i18n', `no Chinese counterpart for /${rel}`);
  }

  for (const f of zh) {
    const rel = relative(ROOT, f);
    const html = await readFile(f, 'utf8');
    if (!/<html lang="zh-SG">/.test(html)) fail(rel, 'Chinese page is not lang="zh-SG"');

    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '';
    const text = h1.replace(/<[^>]*>/g, '').trim();
    if (text && !/[\u4e00-\u9fff]/.test(text)) fail(rel, `h1 has no Chinese characters: "${text.slice(0, 50)}"`);

    const body = (html.match(/<main[\s\S]*?<\/main>/) || [''])[0]
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]*>/g, ' ');
    for (const phrase of ['Add to order', 'Best for:', 'No battery', 'Coming soon',
                          'Showing all', 'Advantages', 'Considerations', 'Not suitable when',
                          'At a glance']) {
      if (body.includes(phrase)) fail(rel, `untranslated UI string: "${phrase}"`);
    }
  }
}

/* ---------------------------------------------------------------- sitemap */
async function checkSitemap(allPaths) {
  const file = join(ROOT, 'sitemap.xml');
  if (!existsSync(file)) return fail('sitemap.xml', 'missing');
  const xml = await readFile(file, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!locs.length) return fail('sitemap.xml', 'no <loc> entries');

  for (const loc of locs) {
    if (!loc.startsWith('https://')) fail('sitemap.xml', `non-https loc: ${loc}`);
    const path = loc.replace(/^https:\/\/[^/]+/, '');
    if (!allPaths.has(path)) fail('sitemap.xml', `lists non-existent page: ${path}`);
  }
  for (const p of allPaths) {
    if (p.endsWith('404.html')) continue;
    if (!locs.some((l) => l.endsWith(p))) warn('sitemap.xml', `page not listed: ${p}`);
  }
  if (!/hreflang=/.test(xml)) warn('sitemap.xml', 'no hreflang alternates');
}

async function checkRobots() {
  const file = join(ROOT, 'robots.txt');
  if (!existsSync(file)) return fail('robots.txt', 'missing');
  const txt = await readFile(file, 'utf8');
  if (!/^Sitemap:\s*https:\/\//m.test(txt)) fail('robots.txt', 'no absolute Sitemap directive');
  if (/^Disallow:\s*\/\s*$/m.test(txt)) fail('robots.txt', 'Disallow: / would deindex the whole site');
}

/* ----------------------------------------------------------------- assets */
async function checkAssets() {
  for (const p of ['assets/css/site.css', 'assets/js/app.mjs', 'site.webmanifest']) {
    if (!existsSync(join(ROOT, p))) fail(p, 'missing');
  }
  const manifestPath = join(ROOT, 'site.webmanifest');
  if (existsSync(manifestPath)) {
    try {
      const m = JSON.parse(await readFile(manifestPath, 'utf8'));
      if (!m.name || !m.icons?.length) fail('site.webmanifest', 'missing name or icons');
      for (const icon of m.icons || []) {
        if (!existsSync(join(ROOT, icon.src.replace(/^\//, '')))) {
          fail('site.webmanifest', `icon not on disk: ${icon.src}`);
        }
      }
    } catch (e) { fail('site.webmanifest', `invalid JSON — ${e.message}`); }
  }
  const css = join(ROOT, 'assets/css/site.css');
  if (existsSync(css)) {
    const txt = await readFile(css, 'utf8');
    const open = (txt.match(/{/g) || []).length;
    const close = (txt.match(/}/g) || []).length;
    if (open !== close) fail('assets/css/site.css', `unbalanced braces (${open} { vs ${close} })`);
  }
}

async function checkImages() {
  const d = JSON.parse(await readFile(join(ROOT, 'src/data/site.json'), 'utf8'));
  const want = [
    ...d.products.map((p) => `assets/img/gallery/${p.image}`),
    ...d.gallery.map((g) => `assets/img/gallery/${g.file}`),
    'assets/img/og-cover.jpg', 'assets/img/icon-192.png',
    'assets/img/icon-512.png', 'assets/img/icon-maskable.png'
  ];
  for (const p of want) {
    if (!existsSync(join(ROOT, p))) fail('images', `missing: ${p} (run npm run images)`);
  }
  if (new Set(want).size !== want.length) fail('images', 'duplicate image filename in site.json');
}

/** Grids are pinned to fixed column counts; odd totals leave visible gaps. */
async function checkGrids() {
  const d = JSON.parse(await readFile(join(ROOT, 'src/data/site.json'), 'utf8'));
  const css = await readFile(join(ROOT, 'assets/css/site.css'), 'utf8');
  for (const [key, cols] of [['whyUs', [1, 2, 4]], ['partners', [1, 2, 4]], ['gallery', [2, 3, 6]]]) {
    for (const c of cols) {
      if (d[key].length % c !== 0) {
        fail('grids', `${key} has ${d[key].length} items — leaves a gap at ${c} columns`);
      }
    }
  }
  if (!css.includes('.mobile-extra { display: none; }')) {
    fail('assets/css/site.css', '.mobile-extra needs a default display:none or nav buttons duplicate');
  }
}

async function checkCssCoverage(files) {
  const cssPath = join(ROOT, 'assets/css/site.css');
  if (!existsSync(cssPath)) return;
  const css = await readFile(cssPath, 'utf8');
  const used = new Set();
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    for (const m of html.matchAll(/class="([^"]+)"/g)) {
      m[1].split(/\s+/).filter(Boolean).forEach((c) => used.add(c));
    }
  }
  const missing = [...used].filter((c) => !css.includes('.' + c));
  if (missing.length) warn('assets/css/site.css', `class(es) used but never styled: ${missing.join(', ')}`);
}

/* -------------------------------------------------------------------- main */
async function main() {
  const files = await htmlFiles();
  if (!files.length) { console.error('✗ no HTML found — run the build first'); process.exit(1); }

  const home = await readFile(join(ROOT, 'index.html'), 'utf8');
  const MODE = /href="assets\/css\/site\.css"/.test(home) ? 'preview' : 'production';
  console.log(`build mode detected: ${MODE}`);

  const allPaths = new Set(files.map((f) => {
    const rel = '/' + relative(ROOT, f).replace(/\\/g, '/');
    return rel.endsWith('/index.html') ? rel.replace(/index\.html$/, '') : rel;
  }));

  for (const file of files) {
    const rel = relative(ROOT, file);
    const html = await readFile(file, 'utf8');
    checkTagBalance(rel, html);
    checkJsonLd(rel, html);
    checkMeta(rel, html);
    checkA11y(rel, html);
    await checkLinks(rel, html, allPaths, MODE);
  }

  await checkPrices(files);
  await checkBilingual(files);
  await checkSitemap(allPaths);
  await checkRobots();
  await checkAssets();
  await checkImages();
  await checkGrids();
  await checkCssCoverage(files);

  console.log(`\nChecked ${files.length} page(s).\n`);

  if (warnings.length) {
    console.log(`⚠  ${warnings.length} warning(s):`);
    warnings.forEach((w) => console.log('   ' + w));
    console.log('');
  }
  if (errors.length) {
    console.log(`✗  ${errors.length} error(s):`);
    errors.forEach((e) => console.log('   ' + e));
    console.log('');
    process.exit(1);
  }
  console.log('✓ all checks passed\n');
}

main().catch((e) => { console.error('✗ checks crashed:', e); process.exit(1); });

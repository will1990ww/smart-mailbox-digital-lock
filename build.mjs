#!/usr/bin/env node
/* Builds the homepage (EN + ZH), 404, manifest and robots.txt. */

import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as S from './src/lib/schema.mjs';
import * as L from './src/lib/layout.mjs';
import * as C from './src/lib/components.mjs';
import { buildMode } from './src/lib/paths.mjs';
import { t, escSoft, localePath, LOCALES } from './src/lib/util.mjs';
import { ui } from './src/data/i18n.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');

export async function loadData() {
  const d = JSON.parse(await readFile(join(SRC, 'data', 'site.json'), 'utf8'));
  validateData(d);
  return d;
}

/** Fail the build on internally inconsistent data rather than shipping it. */
function validateData(d) {
  const ids = new Set();
  for (const p of d.products) {
    if (ids.has(p.id)) throw new Error(`Duplicate product id: ${p.id}`);
    ids.add(p.id);
    if (typeof p.price !== 'number' || p.price <= 0) throw new Error(`Bad price on ${p.id}`);
    for (const c of p.colours) {
      if (!d.colours[c]) throw new Error(`${p.id} references unknown colour ${c}`);
    }
    if (!['none', 'battery'].includes(p.powerType)) throw new Error(`Bad powerType on ${p.id}`);

    for (const key of ['name', 'alt', 'blurb', 'bestFor', 'access', 'backupKey']) {
      const v = p[key];
      if (!v?.en || !v?.zh) throw new Error(`${p.id}.${key} is missing en or zh`);
    }
    // Long-form detail is what /products/ renders; an empty list would leave a gap.
    for (const key of ['features', 'advantages', 'considerations', 'notSuitable']) {
      if (!Array.isArray(p[key]) || p[key].length === 0) throw new Error(`${p.id}.${key} is empty`);
      for (const item of p[key]) {
        if (!item.en || !item.zh) throw new Error(`${p.id}.${key} has an entry missing en or zh`);
      }
    }
  }

  const max = Math.max(...d.products.map((p) => p.price));
  const min = Math.min(...d.products.map((p) => p.price));
  if (max !== d.pricing.maxPrice) {
    throw new Error(`pricing.maxPrice (${d.pricing.maxPrice}) !== catalogue max (${max})`);
  }
  if (d.pricing.minPrice > min) {
    throw new Error(`pricing.minPrice (${d.pricing.minPrice}) exceeds cheapest lock (${min})`);
  }

  for (const r of d.reviews) {
    if (!ids.has(r.model)) throw new Error(`Review by ${r.name} cites unknown model ${r.model}`);
    if (r.stars < 1 || r.stars > 5) throw new Error(`Review by ${r.name} has invalid stars`);
  }

  // Only P4 carries a brand; everything else is unbranded on the page.
  for (const p of d.products) {
    if (p.brand && p.id !== 'P4') throw new Error(`${p.id} should not carry a brand`);
    if (p.brand && !t(p.name, 'en').includes(p.brand)) {
      throw new Error(`${p.id} brand not reflected in its name`);
    }
  }

  // The battery FAQ enumerates models by id — keep both lists honest.
  const faq = d.faqs.find((f) => t(f.q, 'en').toLowerCase().includes('battery'));
  if (faq) {
    const answer = t(faq.a, 'en');
    const comboNoBattery = d.products
      .filter((p) => p.powerType === 'none' && p.categories.includes('combination'))
      .map((p) => p.id);
    const battery = d.products.filter((p) => p.powerType === 'battery').map((p) => p.id);
    for (const id of [...comboNoBattery, ...battery]) {
      if (!answer.includes(id)) throw new Error(`Battery FAQ omits ${id}`);
    }
  }

  // Grids are pinned to fixed column counts; an odd total leaves visible gaps.
  for (const [key, cols] of [['whyUs', [1, 2, 4]], ['partners', [1, 2, 4]], ['gallery', [2, 3, 6]]]) {
    for (const c of cols) {
      if (d[key].length % c !== 0) {
        throw new Error(`${key} has ${d[key].length} items — leaves a gap at ${c} columns`);
      }
    }
  }

  // Image filenames must be unique — a collision would silently overwrite.
  const files = [...d.products.map((p) => p.image), ...d.gallery.map((g) => g.file)];
  if (new Set(files).size !== files.length) throw new Error('Duplicate image filename');

  // The urgent surcharge is quoted in copy; keep the number in one place.
  if (typeof d.pricing.urgentFee !== 'number') throw new Error('pricing.urgentFee missing');
  if (d.pricing.scheduling.URGENT.perJob !== d.pricing.urgentFee) {
    throw new Error('scheduling.URGENT.perJob !== pricing.urgentFee');
  }
}

function homepageMeta(locale) {
  return {
    path: '/',
    url: localePath('/', locale),
    title: t({
      en: 'Letterbox Lock Singapore | 24-Hour Service from S$50',
      zh: '新加坡信箱锁｜24 小时服务 S$50 起'
    }, locale),
    description: t({
      en: "Singapore's letterbox lock specialist, open 24 hours. Supplied and installed from S$50 — digital, no-battery and keyed. Urgent slots available. Pay after you confirm.",
      zh: '新加坡信箱锁专门店，24 小时营业。供应加安装 S$50 起 — 数码、免电池与钥匙款。提供紧急时段。确认后才付款。'
    }, locale),
    keywords: t({
      en: 'letterbox lock singapore, mailbox lock singapore, 24 hour letterbox locksmith, HDB letterbox lock, condo mailbox lock, letterbox lock replacement, lost letterbox key, digital letterbox lock, combination letterbox lock, letterbox lock installation, interior designer letterbox lock',
      zh: '新加坡信箱锁, 24 小时信箱锁, 信箱锁更换, 组屋信箱锁, 公寓信箱锁, 信箱钥匙遗失, 数码信箱锁, 密码信箱锁, 信箱锁安装, 室内设计师信箱锁'
    }, locale),
    h1: t({ en: 'Letterbox Lock Installation & Replacement in Singapore', zh: '新加坡信箱锁安装与更换' }, locale)
  };
}

export function buildHomepage(d, locale = 'en', mode = 'production') {
  const page = homepageMeta(locale);

  const body = [
    C.heroSection(d, locale),
    C.trustbar(d, locale),
    C.productsSection(d, locale),
    C.compareSection(d, locale),
    C.whySection(d, locale),
    C.partnersSection(d, locale),
    C.reviewsSection(d, locale),
    C.howSection(d, locale),
    C.gallerySection(d, locale),
    C.groupSection(d, locale),
    C.areasSection(d, locale),
    C.orderSection(d, locale),
    C.faqSection(d, locale)
  ].join('\n');

  const jsonld = S.render([
    S.business(d, locale),
    S.website(d, locale),
    S.webpage(d, page, locale),
    S.service(d, locale),
    S.howto(d, locale),
    S.faqPage(d, d.faqs, d.site.origin + page.url + '#faq', locale)
  ]);

  return L.document_(d, page, { body, jsonld, locale, mode });
}

export function build404(d, locale = 'en', mode = 'production') {
  const page = {
    path: '/404.html',
    url: localePath('/404.html', locale),
    title: t({ en: 'Page not found', zh: '找不到页面' }, locale) + ' | ' + d.site.name,
    description: t({
      en: 'That page could not be found. Browse all 9 letterbox locks and prices, or send a photo for a written quote.',
      zh: '找不到该页面。浏览全部 9 款信箱锁与价格，或传照片索取书面报价。'
    }, locale),
    noindex: true
  };

  const links = [
    ['/products/', { en: 'All 9 letterbox locks & prices', zh: '全部 9 款信箱锁与价格' }],
    ['/letterbox-lock-price/', { en: 'What a letterbox lock replacement costs', zh: '信箱锁更换费用' }],
    ['/24-hour-letterbox-locksmith/', { en: '24-hour letterbox locksmith', zh: '24 小时信箱锁服务' }],
    ['/lost-letterbox-key/', { en: 'Lost your letterbox key?', zh: '弄丢信箱钥匙了？' }],
    ['/hdb-letterbox-lock/', { en: 'HDB letterbox lock replacement', zh: '组屋信箱锁更换' }],
    ['/interior-designers-developers/', { en: 'Interior designers, developers & trade', zh: '室内设计师、发展商与商业合作' }],
    ['/', { en: 'Back to the homepage', zh: '返回首页' }]
  ];

  const body = `  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow">404</span>
      <h1>${escSoft(t(ui.e404H1, locale))}</h1>
      <p class="lead">${escSoft(t(ui.e404Lead, locale))}</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap prose">
      <h2>${escSoft(t(ui.e404H2, locale))}</h2>
      <ul class="scope-list yes">
${links.map(([href, label]) => `        <li><a href="${localePath(href, locale)}">${escSoft(t(label, locale))}</a></li>`).join('\n')}
      </ul>
    </div>
  </section>
${C.ctaBlock(d, locale)}`;

  const jsonld = S.render([S.business(d, locale), S.website(d, locale)]);
  return L.document_(d, page, { body, jsonld, locale, mode });
}

export function buildManifest(d) {
  return JSON.stringify({
    name: d.site.name,
    short_name: 'Letterbox Lock',
    description: 'Letterbox and mailbox lock supply, installation and lost-key opening across Singapore, 24 hours.',
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: d.site.themeColor,
    lang: 'en-SG',
    dir: 'ltr',
    categories: ['business', 'utilities'],
    icons: [
      { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/assets/img/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ],
    shortcuts: [
      { name: 'WhatsApp a photo', url: `https://wa.me/${d.site.whatsappNumber}` },
      { name: 'All locks & prices', url: '/products/' },
      { name: 'Lost letterbox key', url: '/lost-letterbox-key/' }
    ]
  }, null, 2);
}

export function buildRobots(d) {
  return `# robots.txt — ${d.site.name}
User-agent: *
Allow: /

# Keep tracking-parameter duplicates out of the index
Disallow: /*?utm_
Disallow: /*?fbclid
Disallow: /*?gclid

User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

Sitemap: ${d.site.origin}/sitemap.xml
`;
}

async function main() {
  const d = await loadData();
  const mode = buildMode();

  await mkdir(join(ROOT, 'assets'), { recursive: true });
  for (const sub of ['css', 'js']) {
    const from = join(SRC, 'assets', sub);
    if (existsSync(from)) {
      await rm(join(ROOT, 'assets', sub), { recursive: true, force: true });
      await cp(from, join(ROOT, 'assets', sub), { recursive: true });
    }
  }

  for (const locale of LOCALES) {
    const dir = locale === 'en' ? ROOT : join(ROOT, 'zh');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), buildHomepage(d, locale, mode));
    await writeFile(join(dir, '404.html'), build404(d, locale, mode));
    console.log(`✓ ${localePath('/', locale)} + 404 (${locale})`);
  }

  await writeFile(join(ROOT, 'site.webmanifest'), buildManifest(d) + '\n');
  await writeFile(join(ROOT, 'robots.txt'), buildRobots(d));

  console.log(`build mode: ${mode}`);
  console.log('✓ site.webmanifest');
  console.log('✓ robots.txt');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error('✗ build failed:', e.message);
    process.exit(1);
  });
}

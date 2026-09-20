#!/usr/bin/env node
/* Builds every sub-page in both languages, then emits sitemap.xml. */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { loadData } from './build.mjs';
import { pages } from './src/data/pages.mjs';
import { renderBlock, pageHero, pageFaqs } from './src/lib/blocks.mjs';
import * as S from './src/lib/schema.mjs';
import * as L from './src/lib/layout.mjs';
import { today, t, localePath, LOCALES } from './src/lib/util.mjs';
import { buildMode } from './src/lib/paths.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));

/** Resolve a page's bilingual fields for one locale. */
export function resolvePage(page, locale) {
  return {
    ...page,
    url: localePath(page.path, locale),
    title: t(page.title, locale),
    description: t(page.description, locale),
    keywords: page.keywords,
    h1: t(page.h1, locale),
    eyebrow: page.eyebrow ? t(page.eyebrow, locale) : null,
    intro: page.intro ? t(page.intro, locale) : null,
    bodyClass: page.legal ? 'legal' : ''
  };
}

export function buildPage(d, rawPage, locale = 'en', mode = 'production') {
  const page = resolvePage(rawPage, locale);
  const body = [
    pageHero(page, locale),
    ...rawPage.blocks.map((b) => renderBlock(d, b, locale))
  ].join('\n');

  const graph = [
    S.business(d, locale),
    S.website(d, locale),
    S.webpage(d, page, locale),
    S.breadcrumb(d, page, locale)
  ];

  if (rawPage.path === '/products/') graph.push(S.itemList(d, page.url, locale));

  const faqs = pageFaqs(d, rawPage);
  if (faqs?.length) graph.push(S.faqPage(d, faqs, d.site.origin + page.url + '#faq', locale));

  return L.document_(d, page, { body, jsonld: S.render(graph), locale, mode });
}

function sitemapMeta(path, legal) {
  if (path === '/') return { priority: '1.0', changefreq: 'weekly' };
  if (legal) return { priority: '0.3', changefreq: 'yearly' };
  if (path === '/about/') return { priority: '0.5', changefreq: 'yearly' };
  const high = ['/products/', '/letterbox-lock-price/', '/lost-letterbox-key/',
                '/hdb-letterbox-lock/', '/letterbox-lock-replacement/',
                '/24-hour-letterbox-locksmith/', '/interior-designers-developers/'];
  return high.includes(path)
    ? { priority: '0.9', changefreq: 'monthly' }
    : { priority: '0.7', changefreq: 'monthly' };
}

/** Sitemap with hreflang alternates, so both languages are discovered. */
export function buildSitemap(d) {
  const lastmod = today();
  const all = [{ path: '/', legal: false }, ...pages];
  const o = d.site.origin;

  const urls = all.flatMap(({ path, legal }) => {
    const m = sitemapMeta(path, legal);
    return LOCALES.map((locale) => {
      const links = LOCALES
        .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt === 'en' ? 'en-SG' : 'zh-SG'}" href="${o}${localePath(path, alt)}"/>`)
        .join('\n');
      return `  <url>
    <loc>${o}${localePath(path, locale)}</loc>
${links}
    <xhtml:link rel="alternate" hreflang="x-default" href="${o}${localePath(path, 'en')}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${m.changefreq}</changefreq>
    <priority>${m.priority}</priority>
  </url>`;
    });
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

async function main() {
  const d = await loadData();
  const mode = buildMode();

  const seen = new Set();
  for (const page of pages) {
    if (seen.has(page.path)) throw new Error(`Duplicate page path: ${page.path}`);
    seen.add(page.path);

    for (const locale of LOCALES) {
      const url = localePath(page.path, locale);
      const dir = join(ROOT, url.replace(/^\/|\/$/g, ''));
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'index.html'), buildPage(d, page, locale, mode));
    }
    console.log(`✓ ${page.path} (en + zh)`);
  }

  await writeFile(join(ROOT, 'sitemap.xml'), buildSitemap(d));
  console.log(`✓ sitemap.xml (${(pages.length + 1) * LOCALES.length} urls)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error('✗ page build failed:', e.message);
    process.exit(1);
  });
}

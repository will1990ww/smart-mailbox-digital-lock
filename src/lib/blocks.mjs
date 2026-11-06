/* Renders the block types used by src/data/pages.mjs. */

import { tx, t, esc, escSoft, price, map, localePath } from './util.mjs';
import { ui } from '../data/i18n.mjs';
import * as C from './components.mjs';

export function renderBlock(d, b, locale) {
  switch (b.type) {
    case 'prose':
      return `  <section class="section">
    <div class="wrap prose">
      <h2>${tx(b.h2, locale)}</h2>
${map(t(b.p, locale), (para) => `      <p>${escSoft(para)}</p>`)}
    </div>
  </section>`;

    case 'list':
      return `  <section class="section white">
    <div class="wrap prose">
      <h2>${tx(b.h2, locale)}</h2>
      <ul class="scope-list yes">${d[b.items].map((i) => `<li>${tx(i, locale)}</li>`).join('')}</ul>
    </div>
  </section>`;

    case 'productCatalogue':
      return C.productsSection(d, locale);

    case 'productDetail':
      return C.productDetailSection(d, locale);

    case 'productSubset': {
      const match = (p) =>
        b.filter === 'nobattery' ? p.powerType === 'none' : p.categories.includes(b.filter);
      const subset = d.products.filter(match);
      const cards = map(subset, (p) => C.productCard(d, p, locale));
      return `  <section class="section" id="products">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.prodEyebrow, locale)}</span>
      <h2>${subset.length} ${locale === 'zh' ? '款此系列型号' : `model${subset.length === 1 ? '' : 's'} in this range`}</h2>
      <p class="section-intro">${tx(ui.prodIntro, locale)}</p>
      <div class="catalog-grid" id="productGrid">
${cards}
      </div>
      <p class="mt-12"><a class="btn ghost" href="${localePath('/products/', locale)}">${locale === 'zh' ? `查看全部 ${d.products.length} 款 →` : `See all ${d.products.length} models →`}</a></p>
    </div>
  </section>`;
    }

    case 'compareTable':
      // Sub-pages have no product cards, so model links resolve to /products/.
      return C.compareSection(d, locale, { productHref: b.productHref ?? '/products/' });

    case 'steps':
      // The order form lives on the homepage only.
      return C.howSection(d, locale, { orderHref: localePath('/', locale) + '#order' });

    case 'partners':
      return C.partnersSection(d, locale);

    case 'gallery':
      return C.gallerySection(d, locale);

    case 'townList': {
      const towns = map(d.towns, (x) => `        <li>${escSoft(x)}</li>`);
      return `  <section class="section white" id="areas">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.areaEyebrow, locale)}</span>
      <h2>${tx(ui.townsH3, locale)}</h2>
      <p class="section-intro">${tx(ui.townsIntro, locale)}</p>
      <ul class="town-list">
${towns}
      </ul>
    </div>
  </section>`;
    }

    case 'tiers': {
      const cheapest = Math.min(...d.products.map((p) => p.price));
      const rows = map(
        d.pricing.tiers.slice().sort((a, b2) => a.minQty - b2.minQty),
        (x) => `      <tr>
        <th scope="row">${x.minQty}+ ${tx(ui.units, locale)}</th>
        <td data-label="${esc(t(ui.off, locale))}">${x.rate ? `${Math.round(x.rate * 100)}% ${t(ui.off, locale)}` : t(ui.writtenQuote, locale)}</td>
        <td data-label="${locale === 'zh' ? '范例' : 'Example'}">${x.rate
          ? `${price(cheapest)} → ${price(Number((cheapest * (1 - x.rate)).toFixed(2)))}`
          : (locale === 'zh' ? '依各信箱组报价' : 'Priced per bank')}</td>
      </tr>`
      );
      return `  <section class="section white">
    <div class="wrap">
      <h2>${locale === 'zh' ? '批量价格级距' : 'Group pricing tiers'}</h2>
      <div class="table-scroll"><table class="compare">
        <caption>${locale === 'zh' ? '批量折扣会自动套用于书面报价。' : 'Volume discounts applied automatically to the written quote.'}</caption>
        <thead><tr><th scope="col">${locale === 'zh' ? '数量' : 'Volume'}</th><th scope="col">${tx(ui.off, locale)}</th><th scope="col">${locale === 'zh' ? '范例' : 'Example'}</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table></div>
    </div>
  </section>`;
    }

    case 'faq': {
      const picked = b.pick ? b.pick.map((i) => d.faqs[i]).filter(Boolean) : d.faqs;
      return C.faqSection(d, locale, picked, t(ui.commonQ, locale));
    }

    case 'cta':
      return C.ctaBlock(d, locale, b.msg || 'quote');

    default:
      throw new Error(`Unknown block type: ${b.type}`);
  }
}

/** Page hero used by every sub-page. */
export function pageHero(page, locale) {
  return `  <section class="page-hero">
    <div class="wrap">
      <nav class="crumbs" aria-label="${esc(t(ui.breadcrumb, locale))}">
        <ol>
          <li><a href="${localePath('/', locale)}">${tx(ui.home, locale)}</a></li>
          <li aria-current="page">${escSoft(page.h1)}</li>
        </ol>
      </nav>
      ${page.eyebrow ? `<span class="eyebrow">${escSoft(page.eyebrow)}</span>` : ''}
      <h1>${escSoft(page.h1)}</h1>
      ${page.intro ? `<p class="lead">${escSoft(page.intro)}</p>` : ''}
    </div>
  </section>`;
}

/** The FAQs a page actually shows, for its FAQPage node. */
export function pageFaqs(d, page) {
  const block = page.blocks.find((b) => b.type === 'faq');
  if (!block) return null;
  return block.pick ? block.pick.map((i) => d.faqs[i]).filter(Boolean) : d.faqs;
}

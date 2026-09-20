/* Homepage / shared section renderers. All prices derive from site.json. */

import { esc, escSoft, tx, t, price, wa, map, deco, stars, localePath } from './util.mjs';
import { ui, waMsg } from '../data/i18n.mjs';

const powerTag = (type, locale) =>
  type === 'battery'
    ? `<span class="tagpower batt">${tx(ui.batteryTag, locale)}</span>`
    : `<span class="tagpower none">${tx(ui.noBatteryTag, locale)}</span>`;

const powerPill = (type, locale) =>
  type === 'battery'
    ? `<span class="pill-batt">${tx(ui.batteryTag, locale)}</span>`
    : `<span class="pill-none">${tx(ui.noBatteryTag, locale)}</span>`;

const noBatteryCount = (d) => d.products.filter((p) => p.powerType === 'none').length;
const cheapest = (d) => Math.min(...d.products.map((p) => p.price));

/* ---------------------------------------------------------------- hero -- */
export function heroSection(d, locale) {
  const guar = t(ui.guarList, locale)
    .map((x) => `<li><span class="tick-w" aria-hidden="true">✓</span> ${escSoft(x)}</li>`).join('');

  return `  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <span class="label">${tx(ui.heroLabel, locale)}</span>
        <h1>${tx(ui.heroH1a, locale)} <span>${tx(ui.heroH1b, locale)}</span></h1>
        <p class="lead">${tx(ui.heroLead, locale)}</p>
        <div class="hero-actions">
          <a class="btn order btn-lg" data-ev="order-hero" href="#products">${deco('🔒')} ${tx(ui.heroCtaAll, locale)}</a>
          <a class="btn green btn-lg" data-wa data-ev="whatsapp-hero" href="${wa(d.site.whatsappNumber, t(waMsg.quote, locale))}" rel="noopener noreferrer">${tx(ui.heroCtaWa, locale)}</a>
        </div>
        <div class="proof">
          <span><span class="tick" aria-hidden="true">✓</span> ${tx(ui.proof1, locale)} ${price(cheapest(d))}</span>
          <span><span class="tick" aria-hidden="true">✓</span> ${noBatteryCount(d)} ${tx(ui.proof2a, locale)} ${d.products.length} ${tx(ui.proof2b, locale)}</span>
          <span><span class="tick" aria-hidden="true">✓</span> ${tx(ui.proof3, locale)}</span>
        </div>
      </div>
      <div class="visual">
        <div class="urgent-card">
          <p class="urgent-h">${tx(ui.urgentH, locale)}</p>
          <p class="urgent-p">${tx(ui.urgentP, locale)}</p>
          <a class="btn white btn-block" data-ev="urgent-wa" href="${wa(d.site.whatsappNumber, t(waMsg.urgent, locale))}" rel="noopener noreferrer">${tx(ui.heroCtaWa, locale)}</a>
          <div class="mt-12"><a class="btn ghost btn-block" data-tel data-ev="urgent-call" href="tel:${d.site.phoneHref}">${tx(ui.call, locale)} ${d.site.phoneDisplay}</a></div>
          <p class="urgent-note">${tx(ui.urgentNote, locale)}</p>
        </div>
        <div class="guarantee-card">
          <p class="guar-badge">${deco('🛡️')} ${tx(ui.guarH, locale)}</p>
          <p class="guar-p">${tx(ui.guarP, locale)}</p>
          <ul class="guar-list">${guar}</ul>
          <p class="guar-note">${tx(ui.guarNote, locale)}</p>
        </div>
      </div>
    </div>
  </section>`;
}

export function trustbar(d, locale) {
  return `  <section class="trustbar"><div class="wrap trustgrid">
    <div><b>${tx(ui.trust1a, locale)}</b><span>${tx(ui.trust1b, locale)}</span></div>
    <div><b>${price(cheapest(d))}</b><span>${tx(ui.trust2b, locale)}</span></div>
    <div><b>${tx(ui.trust3a, locale)}</b><span>${tx(ui.trust3b, locale)}</span></div>
    <div><b>${tx(ui.trust4a, locale)}</b><span>${tx(ui.trust4b, locale)}</span></div>
  </div></section>`;
}

/* ------------------------------------------------------- product cards -- */

/** Compact card — used on the homepage grid. */
export function productCard(d, p, locale, { link = '/products/' } = {}) {
  const opts = p.colours
    .map((c) => `<option value="${c}">${tx(d.colours[c].label, locale)}</option>`).join('');
  const name = t(p.name, locale);

  return `        <article class="prod" id="${p.id}" data-categories="${p.categories.join(',')}" data-power="${p.powerType}">
      <div class="thumb">${p.popular ? `<span class="tagpop">${tx(ui.popularTag, locale)}</span>` : ''}${powerTag(p.powerType, locale)}
        <img src="/assets/img/gallery/${p.image}" alt="${esc(t(p.alt, locale))}" width="600" height="600" loading="lazy" decoding="async"></div>
      <div class="body">
        <span class="code">${p.id}</span>
        <h3>${escSoft(name)}</h3>
        <p>${tx(p.blurb, locale)}</p>
        <p class="best-for"><strong>${tx(ui.bestFor, locale)}</strong> ${tx(p.bestFor, locale)}</p>
        <ul class="feat">${p.features.map((f) => `<li>${tx(f, locale)}</li>`).join('')}</ul>
        <div class="foot"><div><small>${tx(ui.priceFrom, locale)}</small><strong>${price(p.price)}</strong></div></div>
        <div class="add-row">
          <label class="add-colour">
            <select data-card-colour="${p.id}" aria-label="${esc(t(ui.colourFor, locale))} ${esc(name)}">${opts}</select></label>
          <button type="button" class="btn blue add-btn" data-add-product="${p.id}" data-ev="add_to_order">${tx(ui.addToOrder, locale)}</button>
        </div>
        <p class="card-link"><a href="${localePath(link, locale)}#${p.id}">${tx(ui.fullSpecs, locale)}</a></p>
      </div></article>`;
}

/** Full detail panel — used on /products/ only. */
export function productDetail(d, p, locale) {
  const name = t(p.name, locale);
  const opts = p.colours
    .map((c) => `<option value="${c}">${tx(d.colours[c].label, locale)}</option>`).join('');
  const list = (items, cls) =>
    `<ul class="spec-list ${cls}">${items.map((i) => `<li>${tx(i, locale)}</li>`).join('')}</ul>`;
  const row = (label, value) =>
    `<div class="glance-row"><dt>${tx(label, locale)}</dt><dd>${value}</dd></div>`;

  return `      <article class="prod-detail" id="${p.id}" data-categories="${p.categories.join(',')}" data-power="${p.powerType}">
        <div class="pd-media">
          <div class="thumb">${p.popular ? `<span class="tagpop">${tx(ui.popularTag, locale)}</span>` : ''}${powerTag(p.powerType, locale)}
            <img src="/assets/img/gallery/${p.image}" alt="${esc(t(p.alt, locale))}" width="600" height="600" loading="lazy" decoding="async"></div>
          <dl class="glance">
            <p class="glance-h">${tx(ui.atAGlance, locale)}</p>
            ${row(ui.specPrice, `<b>${price(p.price)}</b>`)}
            ${row(ui.specAccess, tx(p.access, locale))}
            ${row(ui.specPower, powerPill(p.powerType, locale))}
            ${row(ui.specDigits, p.codeDigits ?? '—')}
            ${row(ui.specBackup, tx(p.backupKey, locale))}
            ${row(ui.specColours, p.colours.map((c) => tx(d.colours[c].label, locale)).join(', '))}
          </dl>
          <div class="add-row">
            <label class="add-colour">
              <select data-card-colour="${p.id}" aria-label="${esc(t(ui.colourFor, locale))} ${esc(name)}">${opts}</select></label>
            <button type="button" class="btn blue add-btn" data-add-product="${p.id}" data-ev="add_to_order">${tx(ui.addToOrder, locale)}</button>
          </div>
        </div>
        <div class="pd-body">
          <span class="code">${p.id}</span>
          <h3>${escSoft(name)}</h3>
          <p class="pd-lead">${tx(p.blurb, locale)}</p>
          <p class="best-for"><strong>${tx(ui.bestFor, locale)}</strong> ${tx(p.bestFor, locale)}</p>
          <div class="spec-grid">
            <div class="spec-col adv">
              <h4>${tx(ui.advantages, locale)}</h4>
              ${list(p.advantages, 'yes')}
            </div>
            <div class="spec-col con">
              <h4>${tx(ui.considerations, locale)}</h4>
              ${list(p.considerations, 'note')}
            </div>
            <div class="spec-col not">
              <h4>${tx(ui.notSuitable, locale)}</h4>
              ${list(p.notSuitable, 'no')}
            </div>
          </div>
        </div>
      </article>`;
}

export function productsSection(d, locale) {
  const cards = map(d.products, (p) => productCard(d, p, locale));
  const soon = map(d.upcoming, (u) => {
    const name = t(u.name, locale);
    return `        <article class="soon-card">
          <div class="soon-head"><span class="model">${u.id}</span><span class="tag">${tx(ui.soonTag, locale)}</span></div>
          <h3>${escSoft(name)}</h3>
          <p>${tx(u.blurb, locale)}</p>
          <div class="soon-power">${powerPill(u.powerType, locale)}</div>
          <ul>${u.features.map((f) => `<li>${tx(f, locale)}</li>`).join('')}</ul>
          <a class="notify" href="${wa(d.site.whatsappNumber, waMsg.notify[locale](u.id, name))}" data-wa-product="${u.id}" data-ev="notify" rel="noopener noreferrer">${tx(ui.registerInt, locale)}</a>
        </article>`;
  });

  return `  <section class="section" id="products">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.prodEyebrow, locale)}</span>
      <div class="section-head">
        <div><h2>${tx(ui.prodH2, locale)}</h2>
          <p class="section-intro">${tx(ui.prodIntro, locale)}</p></div>
        <div class="filter-row" role="group" aria-label="${esc(t(ui.prodEyebrow, locale))}">
          <button type="button" data-filter="all" aria-pressed="true">${tx(ui.filterAll, locale)}</button>
          <button type="button" data-filter="nobattery" aria-pressed="false">${tx(ui.filterNoBat, locale)}</button>
          <button type="button" data-filter="digital" aria-pressed="false">${tx(ui.filterDigi, locale)}</button>
          <button type="button" data-filter="combination" aria-pressed="false">${tx(ui.filterCombo, locale)}</button>
          <button type="button" data-filter="key" aria-pressed="false">${tx(ui.filterKey, locale)}</button>
        </div>
      </div>
      <p class="sr-only" id="filterStatus" role="status" aria-live="polite">${tx(ui.filterStatus, locale)}</p>
      <div class="catalog-grid" id="productGrid">
${cards}
      </div>
      <h3 class="sub-h">${tx(ui.soonH3, locale)}</h3>
      <p class="section-intro">${tx(ui.soonIntro, locale)}</p>
      <div class="soon-grid">
${soon}
      </div>
    </div>
  </section>`;
}

/** Long-form catalogue for /products/. */
export function productDetailSection(d, locale) {
  const panels = map(d.products, (p) => productDetail(d, p, locale));
  return `  <section class="section" id="products">
    <div class="wrap">
      <h2>${tx(ui.catalogueH2, locale)}</h2>
      <div class="filter-row" role="group" aria-label="${esc(t(ui.prodEyebrow, locale))}">
        <button type="button" data-filter="all" aria-pressed="true">${tx(ui.filterAll, locale)}</button>
        <button type="button" data-filter="nobattery" aria-pressed="false">${tx(ui.filterNoBat, locale)}</button>
        <button type="button" data-filter="digital" aria-pressed="false">${tx(ui.filterDigi, locale)}</button>
        <button type="button" data-filter="combination" aria-pressed="false">${tx(ui.filterCombo, locale)}</button>
        <button type="button" data-filter="key" aria-pressed="false">${tx(ui.filterKey, locale)}</button>
      </div>
      <p class="sr-only" id="filterStatus" role="status" aria-live="polite">${tx(ui.filterStatus, locale)}</p>
      <div class="detail-list" id="productGrid">
${panels}
      </div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------- compare -- */
export function compareSection(d, locale, { productHref = '' } = {}) {
  const opts = d.products
    .map((p) => `<label class="cmp-opt"><input type="checkbox" data-compare="${p.id}" aria-label="${esc(t(ui.compareAria, locale))} ${p.id} ${esc(t(p.name, locale))}"> ${p.id}</label>`)
    .join('');

  const rows = map(d.products, (p) => `      <tr data-row="${p.id}" data-power="${p.powerType}">
        <th scope="row"><a href="${productHref ? localePath(productHref, locale) : ''}#${p.id}">${p.id} ${tx(p.name, locale)}</a></th>
        <td data-label="${esc(t(ui.specPrice, locale))}"><b>${price(p.price)}</b></td>
        <td data-label="${esc(t(ui.specAccess, locale))}">${tx(p.access, locale)}</td>
        <td data-label="${esc(t(ui.specPower, locale))}">${powerPill(p.powerType, locale)}</td>
        <td data-label="${esc(t(ui.specDigits, locale))}">${p.codeDigits ?? '—'}</td>
        <td data-label="${esc(t(ui.specBackup, locale))}">${tx(p.backupKey, locale)}</td>
      </tr>`);

  return `  <section class="section white" id="costs">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.cmpEyebrow, locale)}</span>
      <h2>${tx(ui.cmpH2, locale)}</h2>
      <p class="section-intro">${tx(ui.cmpIntro, locale)}</p>
      <div id="compareTable">
        <div class="cmp-bar">${opts}<button type="button" class="linkish" id="compareReset">${tx(ui.cmpReset, locale)}</button></div>
        <p class="cmp-note" id="compareNote">${tx(ui.cmpNote, locale)}</p>
<div class="table-scroll"><table class="compare">
    <caption>${tx(ui.cmpCaption, locale)}</caption>
    <thead><tr>
      <th scope="col">${tx(ui.colModel, locale)}</th><th scope="col">${tx(ui.specPrice, locale)}</th><th scope="col">${tx(ui.specAccess, locale)}</th>
      <th scope="col">${tx(ui.specPower, locale)}</th><th scope="col">${tx(ui.specDigits, locale)}</th><th scope="col">${tx(ui.specBackup, locale)}</th>
    </tr></thead>
    <tbody>
${rows}
    </tbody>
  </table></div>
      </div>
      <div class="cost-split">
        <div>
          <h3>${tx(ui.includedH3, locale)}</h3>
          <ul class="scope-list yes">${d.included.map((i) => `<li>${tx(i, locale)}</li>`).join('')}</ul>
        </div>
        <div>
          <h3>${tx(ui.extrasH3, locale)}</h3>
          <div class="extras">
${map(d.extras, (e) => `          <div class="extra"><b>${tx(e.label, locale)}</b><span class="extra-v">${tx(e.value, locale)}</span><small>${tx(e.note, locale)}</small></div>`)}
          </div>
        </div>
      </div>
      <p class="fine">${tx(ui.priceFine, locale)} <a href="${localePath('/letterbox-lock-price/', locale)}">${tx(ui.fullPriceList, locale)}</a></p>
    </div>
  </section>`;
}

/* ----------------------------------------------------------- why / B2B -- */
export function whySection(d, locale) {
  const cards = map(d.whyUs, (w) =>
    `        <div class="why-card"><div class="ic" aria-hidden="true">${w.icon}</div><h3>${tx(w.title, locale)}</h3><p>${tx(w.text, locale)}</p></div>`);

  const list = t(ui.operatorList, locale)
    .map((x) => `          <li>${escSoft(x)}</li>`).join('\n');

  return `  <section class="section white" id="why">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.whyEyebrow, locale)}</span>
      <h2>${escSoft(t(ui.whyH2, locale)(d.whyUs.length))}</h2>
      <div class="why-grid">
${cards}
      </div>
      <div class="operator-note">
        <h3>${tx(ui.operatorH3, locale)}</h3>
        <p>${tx(ui.operatorP, locale)}</p>
        <ul class="scope-list yes">
${list}
        </ul>
      </div>
    </div>
  </section>`;
}

/** Trade / project partners — interior designers, new construction, MCSTs. */
export function partnersSection(d, locale) {
  const cards = map(d.partners, (p) =>
    `        <div class="partner-card"><div class="ic" aria-hidden="true">${p.icon}</div><h3>${tx(p.title, locale)}</h3><p>${tx(p.text, locale)}</p></div>`);

  return `  <section class="section partner-sec" id="partners">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.partEyebrow, locale)}</span>
      <h2>${tx(ui.partH2, locale)}</h2>
      <p class="section-intro">${tx(ui.partIntro, locale)}</p>
      <div class="partner-grid">
${cards}
      </div>
      <div class="partner-cta">
        <div>
          <h3>${tx(ui.partCtaH, locale)}</h3>
          <p>${tx(ui.partCtaP, locale)}</p>
        </div>
        <a class="btn green btn-lg" data-ev="whatsapp-project" href="${wa(d.site.whatsappNumber, t(waMsg.project, locale))}" rel="noopener noreferrer">${tx(ui.partCtaBtn, locale)}</a>
      </div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------- reviews -- */
export function reviewsSection(d, locale) {
  const avg = (d.reviews.reduce((a, r) => a + r.stars, 0) / d.reviews.length).toFixed(1);
  const byId = Object.fromEntries(d.products.map((p) => [p.id, t(p.name, locale)]));

  const cards = map(d.reviews, (r) => `        <figure class="review">
          <div class="rv-top">
            <span class="av" aria-hidden="true">${r.initial}</span>
            <span class="rv-who"><b>${escSoft(r.name)}</b><span>${tx(r.where, locale)}</span></span>
            <span class="stars" aria-label="${r.stars} ${esc(t(ui.starsAria, locale))}">${stars(r.stars)}</span>
          </div>
          <blockquote><p>${tx(r.text, locale)}</p></blockquote>
          <figcaption class="rv-job"><span class="rv-tag">${tx(r.tag, locale)}</span><span class="rv-model">${r.model} ${escSoft(byId[r.model])}</span><time datetime="${r.date}">${r.date}</time></figcaption>
        </figure>`);

  return `  <section class="section" id="reviews">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.revEyebrow, locale)}</span>
      <div class="section-head">
        <div><h2>${tx(ui.revH2, locale)}</h2>
          <p class="section-intro">${tx(ui.revIntro, locale)}</p></div>
        <div class="rating-badge"><b>${avg}</b><span aria-hidden="true">★★★★★</span><small>${d.reviews.length} ${tx(ui.revCustomers, locale)}</small></div>
      </div>
      <div class="reviews-grid">
${cards}
      </div>
      <p class="review-src">${tx(ui.revSrc, locale)}</p>
    </div>
  </section>`;
}

/* --------------------------------------------------------- how it works - */
export function howSection(d, locale, { orderHref = '#order' } = {}) {
  const steps = map(d.steps, (s, i) => `          <li class="fstep">
            <span class="fstep-n" aria-hidden="true">${i + 1}</span>
            <span class="fstep-h">${tx(s.name, locale)}</span>
            <span class="fstep-p">${tx(s.short, locale)}</span>
            <span class="fstep-tag">${tx(s.tag, locale)}</span>
          </li>`);

  const sched = t(ui.schedList, locale)
    .map(([b, p]) => `          <li><b>${escSoft(b)}</b> ${escSoft(p)}</li>`).join('\n');

  return `  <section class="section white" id="how">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.howEyebrow, locale)}</span>
      <div class="flow-head">
        <div>
          <h2>${tx(ui.howH2, locale)}</h2>
          <p class="section-intro">${tx(ui.howIntro, locale)}</p>
        </div>
        <a class="btn order" data-ev="order-how" href="${orderHref}">${deco('🔒')} ${tx(ui.howCta, locale)}</a>
      </div>
      <ol class="flow">
${steps}
      </ol>
      <div class="flow-extra">
        <div class="sched">
          <h3>${tx(ui.schedH3, locale)}</h3>
          <p>${tx(ui.schedP, locale)}</p>
          <ul class="sched-list">
${sched}
          </ul>
        </div>
        <div class="photo-primary">
          <h3>${tx(ui.photoH3, locale)}</h3>
          <p>${tx(ui.photoP, locale)}</p>
          <p class="mt-12"><a class="btn green" data-wa data-ev="whatsapp" href="${wa(d.site.whatsappNumber, t(waMsg.quote, locale))}" rel="noopener noreferrer">${tx(ui.sendPhoto, locale)}</a>
          <a class="btn ghost" href="${localePath('/compatibility-guide/', locale)}">${tx(ui.willItFit, locale)}</a></p>
        </div>
      </div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------- gallery -- */
export function gallerySection(d, locale) {
  const cells = map(d.gallery, (g) => {
    const cap = `${t(g.title, locale)} · ${t(g.where, locale)}`;
    const alt = t(g.alt, locale);
    return `        <figure class="cell-wrap">
          <button class="cell" type="button" data-gallery-src="/assets/img/gallery/${g.file}" data-gallery-alt="${esc(alt)}" data-gallery-cap="${esc(cap)}" aria-label="${esc(t(ui.enlarge, locale))}: ${esc(alt)}"><img src="/assets/img/gallery/${g.file}" alt="${esc(alt)}" width="800" height="800" loading="lazy" decoding="async"></button>
          <figcaption><b>${tx(g.title, locale)}</b><span>${tx(g.where, locale)}</span></figcaption>
        </figure>`;
  });

  return `  <section class="section" id="gallery">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.galEyebrow, locale)}</span>
      <h2>${tx(ui.galH2, locale)}</h2>
      <p class="section-intro">${tx(ui.galIntro, locale)}</p>
      <div class="gallery-grid">
${cells}
      </div>
    </div>
  </section>`;
}

/* --------------------------------------------------------------- group -- */
export function groupSection(d, locale) {
  const tiers = d.pricing.tiers.slice().sort((a, b) => a.minQty - b.minQty)
    .map((x) => `<div class="tier"><b>${x.minQty}+</b><span>${tx(ui.units, locale)} · ${x.rate ? Math.round(x.rate * 100) + '% ' + t(ui.off, locale) : t(ui.writtenQuote, locale)}</span></div>`)
    .join('');

  const list = t(ui.grpList, locale)
    .map((x) => `          <li><span class="tick" aria-hidden="true">✓</span> ${escSoft(x)}</li>`).join('\n');

  return `  <section class="section group-sec" id="group">
    <div class="wrap"><div class="group-inner">
      <div>
        <span class="eyebrow">${tx(ui.grpEyebrow, locale)}</span>
        <h2>${tx(ui.grpH2, locale)}</h2>
        <p class="lead2">${tx(ui.grpLead, locale)}</p>
        <div class="tier-grid">${tiers}</div>
      </div>
      <div class="group-card">
        <h3>${tx(ui.grpCardH, locale)}</h3>
        <p class="muted-sm">${tx(ui.grpCardP, locale)}</p>
        <ul>
${list}
        </ul>
        <a class="btn green btn-block" data-ev="whatsapp-group" href="${wa(d.site.whatsappNumber, t(waMsg.group, locale))}" rel="noopener noreferrer">${tx(ui.grpBtn, locale)}</a>
        <div class="mt-12"><a class="btn white btn-block" href="${localePath('/group-letterbox-lock-replacement/', locale)}">${tx(ui.grpHow, locale)}</a></div>
      </div>
    </div></div>
  </section>`;
}

/* --------------------------------------------------------------- areas -- */
export function areasSection(d, locale) {
  const lines = map(d.mrt, (l) => `        <details class="mrt-line">
          <summary><span class="mrt-code">${l.code}</span>${tx(l.name, locale)} <span class="mrt-count">${l.stations.length} ${tx(ui.stations, locale)}</span></summary>
          <div class="mrt-stations">${l.stations.map((s) => `<span>${escSoft(s)}</span>`).join('')}</div>
        </details>`);

  const towns = map(d.towns, (x) => `        <li>${escSoft(x)}</li>`);

  return `  <section class="section" id="areas">
    <div class="wrap">
      <span class="eyebrow">${tx(ui.areaEyebrow, locale)}</span>
      <h2>${tx(ui.areaH2, locale)}</h2>
      <p class="section-intro">${tx(ui.areaIntro, locale)}</p>
      <div class="mrt-search">
        <label for="mrtSearch">${tx(ui.mrtLabel, locale)}</label>
        <input type="search" id="mrtSearch" placeholder="${esc(t(ui.mrtPlace, locale))}" autocomplete="off">
        <p class="mrt-result" id="mrtResult" role="status" aria-live="polite"></p>
      </div>
      <div class="mrt-lines">
${lines}
      </div>
      <h3 class="sub-h">${tx(ui.townsH3, locale)}</h3>
      <p class="section-intro">${tx(ui.townsIntro, locale)}</p>
      <ul class="town-list">
${towns}
      </ul>
      <p class="fine">${tx(ui.areaFine, locale)}</p>
    </div>
  </section>`;
}

/* ---------------------------------------------------------------- form -- */
export function orderSection(d, locale) {
  const productOpts = d.products
    .map((p) => `<option value="${p.id}" data-colours="${p.colours.join(',')}">${p.id} · ${tx(p.name, locale)} (${price(p.price)})</option>`).join('');

  const accessOpts = Object.entries(d.pricing.accessFees)
    .map(([k, v]) => `<option value="${k}">${tx(v.label, locale)}</option>`).join('');

  const firstColours = d.products[0].colours
    .map((c) => `<option value="${c}">${tx(d.colours[c].label, locale)}</option>`).join('');

  const schedOpts = Object.entries(d.pricing.scheduling)
    .map(([k, v], i) => `          <label class="sched-opt"><input type="radio" name="schedule" value="${k}" data-schedule="${k}"${i === 0 ? ' checked' : ''}>
            <span><b>${tx(v.label, locale)}</b><small>${tx(v.note, locale)}</small></span></label>`).join('\n');

  const q = d.pricing.quantity;
  const checks = t(ui.ordChecks, locale).map((x) => `          <li>✓ ${escSoft(x)}</li>`).join('\n');

  return `  <section class="section white" id="order">
    <div class="wrap order-layout">
      <div>
        <span class="eyebrow">${tx(ui.ordEyebrow, locale)}</span>
        <h2>${tx(ui.ordH2, locale)}</h2>
        <p class="section-intro">${tx(ui.ordIntro, locale)}</p>
        <ul class="check-list">
${checks}
        </ul>
        <div class="sched-note">
          <strong>${tx(ui.schedNoteB, locale)}</strong> ${tx(ui.schedNoteP, locale)}
        </div>
        <div class="privacy-box">
          <strong>${tx(ui.privacyB, locale)}</strong> ${tx(ui.privacyP, locale)} <a href="${localePath('/privacy-policy/', locale)}">${tx(ui.privacyLink, locale)}</a>.
        </div>
      </div>
      <form class="form" id="quoteForm" method="get" action="https://wa.me/${d.site.whatsappNumber}" target="_blank" rel="noopener" novalidate>
        <fieldset class="mode-switch">
          <legend>${tx(ui.modeLegend, locale)}</legend>
          <label class="mode-opt"><input type="radio" name="mode" id="modeSingle" value="single" checked> <span><b>${tx(ui.modeOneB, locale)}</b><small>${tx(ui.modeOneS, locale)}</small></span></label>
          <label class="mode-opt"><input type="radio" name="mode" id="modeMulti" value="multiple"> <span><b>${tx(ui.modeMultiB, locale)}</b><small>${tx(ui.modeMultiS, locale)}</small></span></label>
        </fieldset>
        <div id="singlePane">
          <div class="form-grid">
            <label class="full">${tx(ui.fProduct, locale)}<select name="productId" id="qProduct" aria-describedby="err-productId" aria-invalid="false">${productOpts}</select>
              <span class="field-error" id="err-productId" data-error-for="productId" role="alert" aria-live="assertive"></span></label>
            <label>${tx(ui.fColour, locale)}<select name="colour" id="qColour" aria-describedby="err-colour" aria-invalid="false">${firstColours}</select>
              <span class="field-error" id="err-colour" data-error-for="colour" role="alert" aria-live="assertive"></span></label>
            <label>${tx(ui.fQuantity, locale)}<input id="qQuantity" name="quantity" type="number" min="${q.min}" max="${q.max}" step="1" value="1" inputmode="numeric" aria-describedby="err-quantity" aria-invalid="false">
              <span class="field-error" id="err-quantity" data-error-for="quantity" role="alert" aria-live="assertive"></span></label>
          </div>
        </div>
        <div id="multiPane" hidden>
          <div class="ql-panel">
            <div class="ql-head"><h3>${tx(ui.yourOrder, locale)}</h3><button type="button" class="ql-clear" id="listClear">${tx(ui.clear, locale)}</button></div>
            <p class="ql-empty" id="listEmpty">${tx(ui.listEmpty, locale)}</p>
            <ul class="ql-lines" id="listLines"></ul>
          </div>
        </div>
        <div class="form-grid">
          <label class="full">${tx(ui.fCondition, locale)}
            <select name="access" id="qAccess">${accessOpts}</select></label>
        </div>
        <fieldset class="sched-switch">
          <legend>${tx(ui.fSchedule, locale)}</legend>
${schedOpts}
        </fieldset>
        <div class="form-grid">
          <label class="full">${tx(ui.fPostal, locale)} <span class="hint">${tx(ui.fPostalHint, locale)}</span>
            <input id="qPostal" name="postal" inputmode="numeric" autocomplete="postal-code" maxlength="6" required placeholder="${esc(t(ui.fPostalPlace, locale))}" aria-describedby="err-postal" aria-invalid="false">
            <span class="field-error" id="err-postal" data-error-for="postal" role="alert" aria-live="assertive"></span></label>
          <label>${tx(ui.fBlock, locale)}<input id="qBlock" name="block" autocomplete="off" maxlength="6" placeholder="${esc(t(ui.fBlockPlace, locale))}" aria-describedby="err-block" aria-invalid="false">
            <span class="field-error" id="err-block" data-error-for="block" role="alert" aria-live="assertive"></span></label>
          <label>${tx(ui.fUnit, locale)}<input id="qUnit" name="unit" autocomplete="off" maxlength="12" placeholder="${esc(t(ui.fUnitPlace, locale))}" aria-describedby="err-unit" aria-invalid="false">
            <span class="field-error" id="err-unit" data-error-for="unit" role="alert" aria-live="assertive"></span></label>
          <div class="consent full" id="authGroup">
            <input type="checkbox" id="qAuthorised" name="authorised" aria-describedby="err-authorised" aria-invalid="false">
            <label for="qAuthorised">${tx(ui.fAuth, locale)}</label>
          </div>
          <span class="field-error full" id="err-authorised" data-error-for="authorised" role="alert" aria-live="assertive"></span>
        </div>
        <div class="breakdown" id="breakdown" aria-live="polite"></div>
        <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
        <button class="btn order btn-block btn-lg" type="submit">${deco('🔒')} ${tx(ui.fSubmit, locale)}</button>
        <button class="btn ghost btn-block mt-12" type="button" id="copyDetails">${tx(ui.fCopy, locale)}</button>
      </form>
    </div>
  </section>`;
}

/* ----------------------------------------------------------------- FAQ -- */
export function faqSection(d, locale, faqs = d.faqs, heading = null) {
  const items = faqs
    .map((f) => `<details><summary>${tx(f.q, locale)}</summary><p>${tx(f.a, locale)}</p></details>`).join('');

  return `  <section class="section" id="faq">
    <div class="wrap faq">
      <span class="eyebrow">${tx(ui.faqEyebrow, locale)}</span>
      <h2>${escSoft(heading || t(ui.faqH2, locale))}</h2>
      <div>${items}</div>
      <p class="mt-12"><a class="btn ghost" href="${localePath('/about/', locale)}">${tx(ui.faqMore, locale)}</a></p>
    </div>
  </section>`;
}

/* ----------------------------------------------------------------- CTA -- */
export function ctaBlock(d, locale, msgKey = 'quote') {
  return `  <section class="section white">
    <div class="wrap">
      <div class="group-card cta-wide">
        <h2>${tx(ui.ctaH2, locale)}</h2>
        <p class="muted-sm">${tx(ui.ctaP, locale)}</p>
        <a class="btn green btn-block btn-lg" data-wa data-ev="whatsapp-cta" href="${wa(d.site.whatsappNumber, t(waMsg[msgKey], locale))}" rel="noopener noreferrer">${tx(ui.ctaWa, locale)}</a>
        <div class="mt-12"><a class="btn white btn-block" data-tel data-ev="call-cta" href="tel:${d.site.phoneHref}">${tx(ui.call, locale)} ${d.site.phoneDisplay}</a></div>
      </div>
    </div>
  </section>`;
}

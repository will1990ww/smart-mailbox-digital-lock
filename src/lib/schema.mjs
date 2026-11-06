/* JSON-LD @graph builders. Every price, FAQ and service area derives from
   site.json, so structured data can never drift from the visible page. */

import { price, t, localePath } from './util.mjs';

const ID = (o, frag) => `${o}/#${frag}`;

const DESCRIPTION = {
  en: "Singapore's dedicated letterbox lock provider, installer and specialist, open 24 hours. We supply and install letterbox locks for HDB, condo, landed and outdoor mailboxes — keyed, no-battery combination and digital touch-PIN models from S$50, installation included. One-stop solution for residents, interior designers, new construction, developers, MCSTs and managing agents. We do not service door, gate, car or safe locks.",
  zh: '新加坡专门的信箱锁供应、安装与维修专家，24 小时营业。我们为组屋、公寓、有地住宅与户外信箱供应并安装信箱锁 — 钥匙款、免电池密码款与数码触控密码款 S$50 起，已含安装。为住户、室内设计师、新建工程、发展商、管理机构与物业经理提供一站式方案。我们不提供大门、闸门、汽车或保险箱锁服务。'
};

/** Core node — a service-area business (we travel; there is no shopfront). */
export function business(d, locale = 'en') {
  const { site, pricing, products, towns } = d;
  const o = site.origin;

  return {
    '@type': ['LocalBusiness', 'Locksmith', 'HomeAndConstructionBusiness'],
    '@id': ID(o, 'business'),
    name: locale === 'zh' ? site.nameZh : site.name,
    alternateName: site.alternateName,
    image: o + site.ogImage,
    logo: o + site.ogImage,
    url: o + localePath('/', locale),
    telephone: site.phoneHref,
    priceRange: `${price(pricing.minPrice)}–${price(pricing.maxPrice)}`,
    currenciesAccepted: pricing.currency,
    paymentAccepted: 'Cash, PayNow, Bank Transfer',
    description: t(DESCRIPTION, locale),
    slogan: t(site.slogan, locale),
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SG', addressRegion: 'Singapore', addressLocality: 'Singapore'
    },
    areaServed: [{ '@type': 'Country', name: 'Singapore' }].concat(
      towns.map((n) => ({ '@type': 'Place', name: `${n}, Singapore` }))
    ),
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: 1.352083, longitude: 103.819836 },
      geoRadius: '30000'
    },
    knowsAbout: [
      'Letterbox lock replacement', 'HDB mailbox lock', 'Condominium mailbox lock',
      'Lost letterbox key opening', 'Digital letterbox lock', 'Combination mailbox lock',
      '24 hour letterbox locksmith', 'Urgent letterbox lock replacement',
      'Bulk MCST letterbox lock replacement', 'Interior designer letterbox lock fit-out',
      'New construction mailbox lock installation'
    ],
    knowsLanguage: ['en', 'zh'],
    // Open 24 hours, every day of the year.
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00', closes: '23:59'
    }],
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: site.phoneHref,
      contactType: 'customer service',
      areaServed: 'SG',
      availableLanguage: ['English', 'Chinese'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00', closes: '23:59'
      }
    }],
    potentialAction: {
      '@type': 'CommunicateAction',
      name: 'WhatsApp us a photo',
      target: `https://wa.me/${site.whatsappNumber}`
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Letterbox lock products',
      itemListElement: products.map((p) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: t(p.name, locale),
          sku: p.id,
          category: 'Letterbox lock',
          ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
          color: p.colours.map((c) => t(d.colours[c].label, locale)).join(', ')
        },
        priceCurrency: pricing.currency,
        price: String(p.price),
        availability: 'https://schema.org/InStock',
        url: `${o}${localePath('/', locale)}#${p.id}`,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          priceCurrency: pricing.currency,
          price: String(p.price),
          valueAddedTaxIncluded: true,
          description: 'Lock and installation included'
        }
      }))
    }
  };
}

export function website(d, locale = 'en') {
  const o = d.site.origin;
  return {
    '@type': 'WebSite', '@id': ID(o, 'website'), url: o + '/',
    name: locale === 'zh' ? d.site.nameZh : d.site.name,
    inLanguage: ['en-SG', 'zh-SG'],
    publisher: { '@id': ID(o, 'business') }
  };
}

export function webpage(d, page, locale = 'en') {
  const o = d.site.origin;
  const url = o + page.url;
  const node = {
    '@type': 'WebPage', '@id': url + '#webpage', url,
    name: page.h1 || page.title,
    description: page.description,
    isPartOf: { '@id': ID(o, 'website') },
    about: { '@id': ID(o, 'business') },
    inLanguage: locale === 'zh' ? 'zh-SG' : 'en-SG',
    primaryImageOfPage: o + d.site.ogImage
  };
  if (page.path !== '/') node.breadcrumb = { '@id': url + '#breadcrumb' };
  return node;
}

export function breadcrumb(d, page, locale = 'en') {
  if (page.path === '/') return null;
  const o = d.site.origin;
  return {
    '@type': 'BreadcrumbList',
    '@id': o + page.url + '#breadcrumb',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'zh' ? '首页' : 'Home', item: o + localePath('/', locale) },
      { '@type': 'ListItem', position: 2, name: page.h1 || page.title, item: o + page.url }
    ]
  };
}

export function service(d, locale = 'en') {
  const o = d.site.origin;
  return {
    '@type': 'Service', '@id': ID(o, 'service'),
    name: locale === 'zh' ? '新加坡信箱锁安装与更换（24 小时）' : 'Letterbox lock installation and replacement Singapore (24 hours)',
    serviceType: 'Letterbox lock installation, mailbox lock replacement and lost-key opening',
    provider: { '@id': ID(o, 'business') },
    areaServed: { '@type': 'Country', name: 'Singapore' },
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00', closes: '23:59'
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'HDB residents, condominium residents, landed homeowners, interior designers, renovation firms, property developers, MCSTs, managing agents, town councils, property agents, landlords'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: d.pricing.currency,
      price: String(Math.min(...d.products.map((p) => p.price))),
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: String(d.pricing.minPrice),
        maxPrice: String(d.pricing.maxPrice),
        priceCurrency: d.pricing.currency
      }
    }
  };
}

export function howto(d, locale = 'en') {
  const o = d.site.origin;
  return {
    '@type': 'HowTo', '@id': ID(o, 'howto'),
    name: locale === 'zh' ? '如何在新加坡订购信箱锁安装' : 'How to order a letterbox lock installation in Singapore',
    description: t({
      en: 'Nothing is charged until you have seen the finished lock working and told us you are happy.',
      zh: '在您看到完工的锁正常运作并表示满意之前，不收取任何费用。'
    }, locale),
    totalTime: 'PT30M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: d.pricing.currency,
      value: String(Math.min(...d.products.map((p) => p.price)))
    },
    step: d.steps.map((s, i) => ({
      '@type': 'HowToStep', position: i + 1,
      name: t(s.name, locale), text: t(s.text, locale)
    }))
  };
}

export function faqPage(d, faqs, id, locale = 'en') {
  return {
    '@type': 'FAQPage', '@id': id,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question', name: t(f.q, locale),
      acceptedAnswer: { '@type': 'Answer', text: t(f.a, locale) }
    }))
  };
}

/** Product nodes for the catalogue page, with the long-form detail. */
export function itemList(d, url, locale = 'en') {
  const o = d.site.origin;
  return {
    '@type': 'ItemList', '@id': o + url + '#itemlist',
    name: locale === 'zh' ? '信箱锁产品' : 'Letterbox locks',
    numberOfItems: d.products.length,
    itemListElement: d.products.map((p, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: {
        '@type': 'Product',
        name: t(p.name, locale),
        sku: p.id,
        description: t(p.blurb, locale),
        image: o + '/assets/img/gallery/' + p.image,
        ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
        url: `${o}${url}#${p.id}`,
        additionalProperty: [
          { '@type': 'PropertyValue', name: t({ en: 'Access', zh: '开启方式' }, locale), value: t(p.access, locale) },
          { '@type': 'PropertyValue', name: t({ en: 'Power', zh: '电源' }, locale),
            value: p.powerType === 'battery' ? t({ en: 'Battery', zh: '需电池' }, locale) : t({ en: 'No battery', zh: '免电池' }, locale) },
          { '@type': 'PropertyValue', name: t({ en: 'Backup key', zh: '备用钥匙' }, locale), value: t(p.backupKey, locale) }
        ],
        offers: {
          '@type': 'Offer',
          priceCurrency: d.pricing.currency,
          price: String(p.price),
          availability: 'https://schema.org/InStock',
          seller: { '@id': ID(o, 'business') }
        }
      }
    }))
  };
}

export function prune(v) {
  if (Array.isArray(v)) return v.map(prune).filter((x) => x !== null && x !== undefined);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (val === null || val === undefined) continue;
      out[k] = prune(val);
    }
    return out;
  }
  return v;
}

/** Serialise, escaping '<' so the script tag cannot be broken out of. */
export function render(graph) {
  return JSON.stringify(
    prune({ '@context': 'https://schema.org', '@graph': graph.filter(Boolean) })
  ).replace(/</g, '\\u003c');
}

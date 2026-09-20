/* Shared helpers — bilingual text, escaping, formatting, URLs. */

export const LOCALES = ['en', 'zh'];

/** Resolve a bilingual field. Accepts a plain string or { en, zh }. */
export const t = (value, locale = 'en') => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && !Array.isArray(value)) return value[locale] ?? value.en ?? '';
  return value;
};

/** Escape for HTML attribute values. */
export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Escape authored copy for text nodes, preserving intentional inline tags. */
export const escSoft = (s) =>
  String(s).replace(/&(?!(?:amp|lt|gt|quot|nbsp|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');

/** Bilingual + escaped — the combination nearly every template needs. */
export const tx = (value, locale) => escSoft(t(value, locale));

export const price = (n) => 'S$' + (Number.isInteger(n) ? String(n) : n.toFixed(2));

export const wa = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

export const map = (arr, fn) => arr.map(fn).join('\n');

export const tidy = (html) =>
  html.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+$/gm, '').trim() + '\n';

export const today = () => new Date().toISOString().slice(0, 10);

export const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

/** Decorative glyph — never announced by assistive technology. */
export const deco = (glyph) => `<span aria-hidden="true">${glyph}</span>`;

/** Locale-aware URL: English at /, Chinese under /zh/. */
export const localePath = (path, locale) =>
  locale === 'en' ? path : '/zh' + (path === '/' ? '/' : path);

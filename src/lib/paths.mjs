/* URL mode handling.
 *
 * production (default) — root-absolute: /assets/css/site.css, /zh/products/
 * preview  (--preview) — depth-relative: ../assets/css/site.css
 *
 * Canonical, hreflang, og:url and every JSON-LD URL stay absolute in BOTH
 * modes: search engines must always be told the real address.
 */

/** Directory depth. '/' -> 0, '/404.html' -> 0, '/zh/products/' -> 2. */
export function depthOf(pagePath) {
  const seg = pagePath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  if (seg.length && seg.at(-1).includes('.')) seg.pop();
  return seg.length;
}

export const prefixFor = (depth) => (depth === 0 ? '' : '../'.repeat(depth));

export function toRelative(url, depth) {
  if (!url.startsWith('/')) return url;
  const [rawPath, frag] = url.split('#');
  const hash = frag ? '#' + frag : '';
  let path = rawPath;
  if (path === '/') path = 'index.html';
  else if (path.endsWith('/')) path = path.slice(1) + 'index.html';
  else path = path.slice(1);
  return prefixFor(depth) + path + hash;
}

const PROTECTED = [
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/g,
  /<link rel="canonical"[^>]*>/g,
  /<link rel="alternate"[^>]*>/g,
  /<meta property="og:[^"]*"[^>]*>/g,
  /<meta name="twitter:[^"]*"[^>]*>/g
];

export function relativise(html, depth) {
  const stash = [];
  let work = html;

  for (const re of PROTECTED) {
    work = work.replace(re, (m) => { stash.push(m); return `\u0000P${stash.length - 1}\u0000`; });
  }

  work = work.replace(/\b(href|src)="(\/[^"]*)"/g,
    (_m, attr, url) => `${attr}="${toRelative(url, depth)}"`);

  // ES modules are CORS-blocked on file://; app.mjs has no import/export,
  // so a classic deferred script behaves identically.
  work = work.replace(/<script type="module" src="([^"]+)"><\/script>/,
    '<script defer src="$1"></script>');

  return work.replace(/\u0000P(\d+)\u0000/g, (_m, i) => stash[Number(i)]);
}

export const buildMode = (argv = process.argv, env = process.env) =>
  argv.includes('--preview') || env.PREVIEW === '1' ? 'preview' : 'production';

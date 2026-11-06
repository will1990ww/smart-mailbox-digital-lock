#!/usr/bin/env node
/* Generates branded sample images so the site renders complete before real
 * photography exists. Every file lands at the exact path and dimensions the
 * templates expect, so replacing one is a straight file swap — no code change.
 *
 * Run: npm run images
 */

import { writeFile, mkdir, readFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'img');

const INK = '#0b1220';
const BRAND = '#2563eb';
const LINE = '#cbd5e1';
const BG = '#eef2f7';

/** Bilingual fields are { en, zh }; images use the English label. */
const t = (v) => (v && typeof v === 'object' ? v.en : v);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, perLine, maxLines) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > perLine && line) {
      lines.push(line.trim());
      line = w;
      if (lines.length === maxLines) break;
    } else line = (line + ' ' + w).trim();
  }
  if (line && lines.length < maxLines) lines.push(line.trim());
  return lines;
}

/** Flat illustration of a lock face, varied by access type. */
function lockArt(cx, cy, r, type, accent) {
  const p = [];
  p.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" stroke="${LINE}" stroke-width="3"/>`);
  p.push(`<circle cx="${cx}" cy="${cy}" r="${r - 10}" fill="none" stroke="${LINE}" stroke-width="1.5" opacity=".7"/>`);

  if (type === 'key') {
    p.push(`<circle cx="${cx}" cy="${cy - r * 0.12}" r="${r * 0.22}" fill="${INK}"/>`);
    p.push(`<path d="M${cx - r * 0.09} ${cy} L${cx + r * 0.09} ${cy} L${cx + r * 0.05} ${cy + r * 0.45} L${cx - r * 0.05} ${cy + r * 0.45} Z" fill="${INK}"/>`);
  } else if (type === 'digital') {
    const s = r * 0.34;
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        const x = cx - s + j * s;
        const y = cy - s + i * s;
        const mid = i === 1 && j === 1;
        p.push(`<circle cx="${x}" cy="${y}" r="${r * 0.11}" fill="${mid ? accent : INK}" opacity="${mid ? 1 : 0.82}"/>`);
      }
    }
  } else {
    const n = type === 'combo4' ? 4 : 3;
    const w = r * 1.35;
    const dw = w / n;
    const y0 = cy - r * 0.3;
    for (let i = 0; i < n; i += 1) {
      const x = cx - w / 2 + dw * i + dw / 2;
      p.push(`<rect x="${x - dw * 0.36}" y="${y0}" width="${dw * 0.72}" height="${r * 0.62}" rx="${dw * 0.16}" fill="${INK}" opacity=".9"/>`);
      p.push(`<text x="${x}" y="${y0 + r * 0.42}" font-family="system-ui,sans-serif" font-size="${r * 0.3}" font-weight="700" fill="#fff" text-anchor="middle">${(i * 3 + 1) % 10}</text>`);
    }
    p.push(`<rect x="${cx - w / 2 - 6}" y="${y0 - 6}" width="${w + 12}" height="${r * 0.62 + 12}" rx="8" fill="none" stroke="${accent}" stroke-width="2.5"/>`);
  }
  return p.join('');
}

function mailboxArt(w, h, accent, variant) {
  const p = [];
  const bw = w * 0.56;
  const bh = h * 0.46;
  const bx = (w - bw) / 2;
  const by = h * 0.28;

  if (variant === 'bank') {
    const cols = 3, rows = 3;
    const cw = bw / cols, ch = bh / rows;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = bx + c * cw, y = by + r * ch;
        p.push(`<rect x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${ch - 6}" rx="3" fill="#fff" stroke="${LINE}" stroke-width="2"/>`);
        p.push(`<rect x="${x + 10}" y="${y + ch * 0.33}" width="${cw * 0.42}" height="3" rx="1.5" fill="${LINE}"/>`);
        p.push(`<circle cx="${x + cw - 13}" cy="${y + ch / 2}" r="3.4" fill="${r === 1 && c === 1 ? accent : INK}"/>`);
      }
    }
  } else {
    p.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="#fff" stroke="${LINE}" stroke-width="3"/>`);
    p.push(`<rect x="${bx + bw * 0.12}" y="${by + bh * 0.24}" width="${bw * 0.5}" height="5" rx="2.5" fill="${LINE}"/>`);
    p.push(`<circle cx="${bx + bw * 0.76}" cy="${by + bh * 0.55}" r="${bh * 0.15}" fill="#fff" stroke="${accent}" stroke-width="3"/>`);
    p.push(`<circle cx="${bx + bw * 0.76}" cy="${by + bh * 0.55}" r="${bh * 0.05}" fill="${INK}"/>`);
  }
  return p.join('');
}

function productSvg({ w, h, code, title, sub, type, accent }) {
  const lines = wrap(title, 22, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="${BG}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="0" y="0" width="${w}" height="6" fill="${accent}"/>
  ${lockArt(w / 2, h * 0.42, w * 0.21, type, accent)}
  <text x="${w / 2}" y="${h * 0.73}" font-family="system-ui,sans-serif" font-size="${w * 0.045}" font-weight="800" fill="${accent}" text-anchor="middle" letter-spacing="2">${esc(code)}</text>
  ${lines.map((l, i) => `<text x="${w / 2}" y="${h * 0.79 + i * w * 0.058}" font-family="system-ui,sans-serif" font-size="${w * 0.048}" font-weight="700" fill="${INK}" text-anchor="middle">${esc(l)}</text>`).join('')}
  <text x="${w / 2}" y="${h * 0.93}" font-family="system-ui,sans-serif" font-size="${w * 0.036}" fill="#64748b" text-anchor="middle">${esc(sub)}</text>
</svg>`;
}

function jobSvg({ w, h, title, place, accent, variant }) {
  const lines = wrap(title, 20, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BG}"/>
  <rect x="0" y="0" width="${w}" height="5" fill="${accent}"/>
  ${mailboxArt(w, h, accent, variant)}
  ${lines.map((l, i) => `<text x="${w / 2}" y="${h * 0.8 + i * w * 0.07}" font-family="system-ui,sans-serif" font-size="${w * 0.058}" font-weight="700" fill="${INK}" text-anchor="middle">${esc(l)}</text>`).join('')}
  <text x="${w / 2}" y="${h * 0.94}" font-family="system-ui,sans-serif" font-size="${w * 0.045}" fill="#64748b" text-anchor="middle">${esc(place)}</text>
</svg>`;
}

function coverSvg({ w, h }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#1e293b"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#c)"/>
  <circle cx="${w * 0.86}" cy="${h * 0.26}" r="${h * 0.40}" fill="${BRAND}" opacity=".13"/>
  <g transform="translate(${w * 0.60}, ${h * 0.12}) scale(0.64)">${mailboxArt(w * 0.62, h * 1.18, BRAND, 'bank')}</g>
  <text x="${w * 0.07}" y="${h * 0.40}" font-family="system-ui,sans-serif" font-size="${h * 0.105}" font-weight="800" fill="#fff">Letterbox Lock</text>
  <text x="${w * 0.07}" y="${h * 0.53}" font-family="system-ui,sans-serif" font-size="${h * 0.105}" font-weight="800" fill="#93c5fd">Singapore</text>
  <text x="${w * 0.07}" y="${h * 0.65}" font-family="system-ui,sans-serif" font-size="${h * 0.042}" fill="#cbd5e1">Open 24 hours · Supply · Installation · Islandwide</text>
  <rect x="${w * 0.07}" y="${h * 0.72}" width="${h * 0.66}" height="${h * 0.1}" rx="${h * 0.05}" fill="${BRAND}"/>
  <text x="${w * 0.07 + h * 0.33}" y="${h * 0.786}" font-family="system-ui,sans-serif" font-size="${h * 0.045}" font-weight="700" fill="#fff" text-anchor="middle">From S$50 installed</text>
</svg>`;
}

function iconSvg({ size, maskable }) {
  const pad = maskable ? size * 0.18 : 0;
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${INK}"${maskable ? '' : ` rx="${size * 0.2}"`}/>
  <rect x="${pad + inner * 0.2}" y="${pad + inner * 0.26}" width="${inner * 0.6}" height="${inner * 0.44}" rx="${inner * 0.05}" fill="none" stroke="${BRAND}" stroke-width="${inner * 0.07}"/>
  <circle cx="${size / 2}" cy="${pad + inner * 0.48}" r="${inner * 0.075}" fill="${BRAND}"/>
  <rect x="${size / 2 - inner * 0.022}" y="${pad + inner * 0.5}" width="${inner * 0.044}" height="${inner * 0.13}" fill="${BRAND}"/>
</svg>`;
}

const ACCENTS = ['#2563eb', '#0891b2', '#7c3aed', '#059669', '#d97706', '#dc2626',
                 '#0d9488', '#4f46e5', '#b45309'];

async function render(svg, outPath, w, h) {
  const tmp = outPath + '.svg';
  await writeFile(tmp, svg);
  execFileSync('magick', ['-background', 'none', '-density', '160', tmp,
                          '-resize', `${w}x${h}!`, '-quality', '82', outPath]);
  await rm(tmp);
}

async function main() {
  await mkdir(join(OUT, 'gallery'), { recursive: true });
  const { products, gallery } = JSON.parse(await readFile(join(ROOT, 'src/data/site.json'), 'utf8'));
  let n = 0;

  for (let i = 0; i < products.length; i += 1) {
    const p = products[i];
    const type = p.categories.includes('key') ? 'key'
      : p.categories.includes('digital') ? 'digital'
      : p.codeDigits === 4 ? 'combo4' : 'combo3';
    await render(productSvg({
      w: 600, h: 600, code: p.id, title: t(p.name),
      sub: p.powerType === 'battery' ? 'Battery · digital keypad' : 'No battery required',
      type, accent: ACCENTS[i % ACCENTS.length]
    }), join(OUT, 'gallery', p.image), 600, 600);
    n += 1;
  }

  for (let i = 0; i < gallery.length; i += 1) {
    const g = gallery[i];
    const label = `${t(g.title)} ${t(g.where)}`;
    const variant = /block|bulk|mcst|mail room|new.?build|bto|designer|town council|office/i.test(label) ? 'bank' : 'single';
    await render(jobSvg({
      w: 800, h: 800, title: t(g.title), place: t(g.where),
      accent: ACCENTS[i % ACCENTS.length], variant
    }), join(OUT, 'gallery', g.file), 800, 800);
    n += 1;
  }

  await render(coverSvg({ w: 1200, h: 630 }), join(OUT, 'og-cover.jpg'), 1200, 630);
  n += 1;

  for (const size of [192, 512]) {
    await render(iconSvg({ size, maskable: false }), join(OUT, `icon-${size}.png`), size, size);
    n += 1;
  }
  await render(iconSvg({ size: 512, maskable: true }), join(OUT, 'icon-maskable.png'), 512, 512);
  n += 1;

  console.log(`✓ generated ${n} images into assets/img/`);
}

main().catch((e) => {
  console.error('✗ image generation failed:', e.message);
  process.exit(1);
});

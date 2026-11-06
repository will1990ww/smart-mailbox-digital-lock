/* ==========================================================================
   Letterbox Lock Singapore — app.mjs
   Progressive enhancement only. Every price, product and policy on the page
   is readable and actionable with this file blocked.
   ========================================================================== */

'use strict';

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const DATA = (() => {
  const el = $('#site-data');
  if (!el) return null;
  try { return JSON.parse(el.textContent); }
  catch (err) { console.error('site-data is not valid JSON', err); return null; }
})();

if (!DATA) console.warn('Letterbox Lock: site data unavailable — interactive features disabled.');

const LOCALE   = DATA?.locale ?? 'en';
const ZH       = LOCALE === 'zh';
const PRODUCTS = DATA ? Object.fromEntries(DATA.products.map((p) => [p.id, p])) : {};
const COLOURS  = DATA ? DATA.colours : {};
const PRICING  = DATA ? DATA.site.pricing : null;
const WA_NUM   = DATA ? DATA.site.whatsappNumber : '';

const money = (n) => 'S$' + (Number.isInteger(n) ? String(n) : n.toFixed(2));

/* Locale-aware micro-copy for strings generated at runtime. */
const T = {
  showing:  (s, t2) => ZH ? `显示 ${t2} 款中的 ${s} 款。` : `Showing ${s} of ${t2} models.`,
  showAll:  (t2) => ZH ? `显示全部 ${t2} 款。` : `Showing all ${t2} models.`,
  comparing:(ids) => ZH ? `正在比较 ${ids.join('、')}。取消勾选可显示全部。`
                        : `Comparing ${ids.join(', ')}. Untick to show all again.`,
  compareHint: (t2, max) => ZH ? `显示全部 ${t2} 款。最多勾选 ${max} 款并排比较。`
                               : `Showing all ${t2} models. Tick up to ${max} to compare side by side.`,
  noStation: ZH ? '没有找到相符的车站 — 我们仍然服务您的区域。请传邮区号码，我们会确认下一趟行程。'
                : 'No station matched — we still cover your area. Send your postal sector and we will confirm the next run.',
  covered: (n) => ZH ? `${n} — 在服务范围内。请传邮区号码，我们会告知下一趟经过的行程。`
                     : `${n} — covered. Send your postal sector and we will tell you the next run passing it.`,
  addOne:   ZH ? '请至少选择一个锁。' : 'Choose at least one lock.',
  qtyRange: (min, max) => ZH ? `请输入 ${min} 到 ${max} 之间的整数。` : `Enter a whole number between ${min} and ${max}.`,
  postalNeeded: ZH ? '我们需要您的邮区号码来安排路线。' : 'We need your postal code to route the visit.',
  postalBad: ZH ? '请输入 6 位邮区号码，或前 2 位数字。' : 'Enter a 6-digit postal code, or just the first 2 digits.',
  blockBad: ZH ? '座号格式应如 123 或 123A。' : 'Block should look like 123 or 123A.',
  unitBad:  ZH ? '单位号码格式应如 12-345。' : 'Unit should look like 12-345.',
  authNeeded: ZH ? '请确认您有权使用此信箱 — 否则我们无法开启。'
                 : 'Please confirm you are authorised for this mailbox — we cannot open it otherwise.',
  fixFields: ZH ? '请修正标示的栏位。' : 'Please correct the highlighted fields.',
  opening:  ZH ? '正在开启 WhatsApp…' : 'Opening WhatsApp with your order…',
  blocked:  ZH ? '弹出视窗被封锁 — ' : 'Pop-up blocked — ',
  tapHere:  ZH ? '点此开启 WhatsApp' : 'tap here to open WhatsApp',
  addFirst: ZH ? '请先加入至少一个锁才能看到估价。' : 'Add at least one lock to see an estimate.',
  estNote:  ZH ? '仅供参考。每个锁的价格皆已含安装。我们看过您的照片后出具的书面报价才是适用价格。'
                : 'Estimate only. Installation is included in every lock price. The written quote issued after we see your photo is the price that applies.',
  quoteOnly: (label, min) => ZH ? `${label}。上方金额仅供参考 — ${min} 个单位以上须经勘察后报价。`
                                : `${label}. The figure above is indicative — orders of ${min}+ units are priced after a short survey.`,
  estTotal: ZH ? '估计总额' : 'Estimated total',
  fillFirst: ZH ? '请先填写座号、单位或邮区号码。' : 'Fill in your block, unit or postal code first.',
  copied:   ZH ? '已复制。请贴到 WhatsApp 对话中 — 不要放进连结。' : 'Copied. Paste it inside the WhatsApp chat — not into the link.',
  copyFail: ZH ? '无法自动复制 — 请手动选取并复制您的地址。' : 'Could not copy automatically — please select and copy your address manually.',
  added:    DATA?.strings?.added ?? (ZH ? '已加入' : 'Added'),
  block:    ZH ? '座号' : 'Block',
  unit:     ZH ? '单位' : 'Unit',
  postal:   ZH ? '邮区号码' : 'Postal code',
  qtyAria:  (n) => ZH ? `数量：${n}` : `Quantity: ${n}`,
  incAria:  (n) => ZH ? `增加 ${n} 的数量` : `Increase quantity of ${n}`,
  decAria:  (n) => ZH ? `减少 ${n} 的数量` : `Decrease quantity of ${n}`,
  delAria:  (n) => ZH ? `从订单移除 ${n}` : `Remove ${n} from order`,
  each:     ZH ? '每个' : 'each'
};

/* ----------------------------------------------------------- analytics -- */
function track(name, detail = {}) {
  if (!DATA?.site?.analytics?.enabled) return;
  const payload = JSON.stringify({ ev: name, ...detail, locale: LOCALE, t: Date.now(), path: location.pathname });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(DATA.site.analytics.endpoint, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(DATA.site.analytics.endpoint, {
        method: 'POST', body: payload, keepalive: true,
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {});
    }
  } catch { /* analytics must never break the page */ }
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-ev]');
  if (el) track(el.dataset.ev, { label: (el.textContent || '').trim().slice(0, 40) });
});

const yr = $('#yr');
if (yr) yr.textContent = String(new Date().getFullYear());

/* ----------------------------------------------------------- mobile nav */
(function nav() {
  const btn = $('.menu');
  const list = $('#primary-nav');
  if (!btn || !list) return;

  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    list.dataset.open = String(open);
  };
  setOpen(false);

  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  list.addEventListener('click', (e) => { if (e.target.tagName === 'A') setOpen(false); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (btn.getAttribute('aria-expanded') !== 'true') return;
    if (!e.target.closest('#primary-nav') && !e.target.closest('.menu')) setOpen(false);
  });
})();

/* -------------------------------------------------------- product filter */
(function filters() {
  const bar = $('.filter-row');
  const grid = $('#productGrid');
  const status = $('#filterStatus');
  if (!bar || !grid) return;

  // Works for both the compact cards and the long-form detail panels.
  const cards = $$('.prod, .prod-detail', grid);
  const total = cards.length;

  const matches = (card, key) => {
    if (key === 'all') return true;
    if (key === 'nobattery') return card.dataset.power === 'none';
    return (card.dataset.categories || '').split(',').includes(key);
  };

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    const key = btn.dataset.filter;
    $$('button[data-filter]', bar).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

    let shown = 0;
    cards.forEach((card) => {
      const ok = matches(card, key);
      card.hidden = !ok;
      if (ok) shown += 1;
    });

    if (status) status.textContent = shown === total ? T.showAll(total) : T.showing(shown, total);
    track('filter', { filter: key, shown });
  });
})();

/* --------------------------------------------------------- compare table */
(function compare() {
  const wrap = $('#compareTable');
  if (!wrap) return;

  const boxes = $$('input[data-compare]', wrap);
  const rows = $$('tr[data-row]', wrap);
  const note = $('#compareNote');
  const reset = $('#compareReset');
  const MAX = 3;
  const total = rows.length;

  const apply = () => {
    const picked = boxes.filter((b) => b.checked).map((b) => b.dataset.compare);
    boxes.forEach((b) => {
      b.disabled = !b.checked && picked.length >= MAX;
      b.closest('.cmp-opt')?.classList.toggle('is-disabled', b.disabled);
    });
    rows.forEach((r) => { r.hidden = picked.length > 0 && !picked.includes(r.dataset.row); });
    if (note) note.textContent = picked.length ? T.comparing(picked) : T.compareHint(total, MAX);
  };

  boxes.forEach((b) => b.addEventListener('change', () => {
    apply();
    track('compare', { picked: boxes.filter((x) => x.checked).length });
  }));
  reset?.addEventListener('click', () => { boxes.forEach((b) => { b.checked = false; }); apply(); });
  apply();
})();

/* ---------------------------------------------------------------- gallery */
(function gallery() {
  const dlg = $('#lightbox');
  const img = $('#lightboxImg');
  const cap = $('#lightboxCap');
  if (!dlg || !img || typeof dlg.showModal !== 'function') return;

  let opener = null;

  $$('[data-gallery-src]').forEach((btn) => {
    btn.addEventListener('click', () => {
      opener = btn;
      img.src = btn.dataset.gallerySrc;
      img.alt = btn.dataset.galleryAlt || '';
      if (cap) cap.textContent = btn.dataset.galleryCap || '';
      dlg.showModal();                 // native focus trap + Esc handling
      track('gallery_open', { src: btn.dataset.gallerySrc });
    });
  });

  const close = () => { if (dlg.open) dlg.close(); };
  $('[data-close]', dlg)?.addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  dlg.addEventListener('close', () => { img.src = ''; opener?.focus(); opener = null; });
})();

/* ------------------------------------------------------------ MRT search */
(function mrtSearch() {
  const input = $('#mrtSearch');
  const result = $('#mrtResult');
  if (!input || !result) return;

  const stations = $$('.mrt-stations span').map((el) => ({
    el, name: el.textContent.trim(), line: el.closest('.mrt-line')
  }));

  let timer;
  const run = () => {
    const q = input.value.trim().toLowerCase();
    stations.forEach((s) => s.el.removeAttribute('data-hit'));

    if (q.length < 2) { result.textContent = ''; result.removeAttribute('data-found'); return; }

    const hits = stations.filter((s) => s.name.toLowerCase().includes(q));
    if (!hits.length) { result.textContent = T.noStation; result.dataset.found = 'no'; return; }

    hits.forEach((h) => { h.el.dataset.hit = 'true'; if (h.line && !h.line.open) h.line.open = true; });
    const names = [...new Set(hits.map((h) => h.name))];
    result.textContent = T.covered(names.length === 1 ? names[0] : names.slice(0, 3).join(', '));
    result.dataset.found = 'yes';
  };

  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 160); });
})();

/* ==========================================================================
   Quote form
   ========================================================================== */

const order = [];   // [{ id, colour, qty }]

function tierFor(qty) {
  if (!PRICING) return null;
  return PRICING.tiers.slice().sort((a, b) => b.minQty - a.minQty).find((t2) => qty >= t2.minQty) || null;
}

function setFieldError(name, message) {
  const field = document.querySelector(`[aria-describedby="err-${name}"]`);
  const slot = document.getElementById(`err-${name}`);
  if (slot) slot.textContent = message || '';
  if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (name === 'authorised') $('#authGroup')?.setAttribute('data-error', message ? 'true' : 'false');
  return !message;
}

function clearErrors() {
  ['productId', 'colour', 'quantity', 'postal', 'block', 'unit', 'authorised']
    .forEach((n) => setFieldError(n, ''));
}

(function colourSync() {
  const product = $('#qProduct');
  const colour = $('#qColour');
  if (!product || !colour) return;

  const fill = () => {
    const ids = (product.selectedOptions[0]?.dataset.colours || '').split(',').filter(Boolean);
    colour.innerHTML = ids.map((c) => `<option value="${c}">${COLOURS[c]?.label || c}</option>`).join('');
    colour.disabled = ids.length <= 1;
  };
  product.addEventListener('change', () => { fill(); recalc(); });
  fill();
})();

(function modeSwitch() {
  const single = $('#modeSingle');
  const multi = $('#modeMulti');
  const singlePane = $('#singlePane');
  const multiPane = $('#multiPane');
  if (!single || !multi || !singlePane || !multiPane) return;

  const apply = () => { singlePane.hidden = multi.checked; multiPane.hidden = !multi.checked; recalc(); };
  single.addEventListener('change', apply);
  multi.addEventListener('change', apply);
  apply();
})();

function renderOrder() {
  const list = $('#listLines');
  const empty = $('#listEmpty');
  const count = $('#quoteCount');
  if (!list) return;

  list.innerHTML = order.map((line, i) => {
    const p = PRODUCTS[line.id];
    if (!p) return '';
    const colour = COLOURS[line.colour]?.label || line.colour;
    return `<li class="ql-line">
        <span><b>${p.id} ${p.name}</b><small>${colour} · ${money(p.price)} ${T.each}</small></span>
        <span class="ql-qty">
          <button type="button" data-qty-dec="${i}" aria-label="${T.decAria(p.name)}">−</button>
          <span aria-label="${T.qtyAria(line.qty)}">${line.qty}</span>
          <button type="button" data-qty-inc="${i}" aria-label="${T.incAria(p.name)}">+</button>
        </span>
        <button type="button" class="ql-del" data-remove="${i}" aria-label="${T.delAria(p.name)}">×</button>
      </li>`;
  }).join('');

  if (empty) empty.hidden = order.length > 0;

  const totalQty = order.reduce((a, l) => a + l.qty, 0);
  if (count) { count.textContent = String(totalQty); count.hidden = totalQty === 0; }
}

$('#listLines')?.addEventListener('click', (e) => {
  const inc = e.target.closest('[data-qty-inc]');
  const dec = e.target.closest('[data-qty-dec]');
  const del = e.target.closest('[data-remove]');
  const max = PRICING?.quantity.max ?? 100;

  if (inc) { const i = Number(inc.dataset.qtyInc); order[i].qty = Math.min(max, order[i].qty + 1); }
  else if (dec) { const i = Number(dec.dataset.qtyDec); order[i].qty -= 1; if (order[i].qty < 1) order.splice(i, 1); }
  else if (del) { order.splice(Number(del.dataset.remove), 1); }
  else return;

  renderOrder();
  recalc();
});

$('#listClear')?.addEventListener('click', () => { order.length = 0; renderOrder(); recalc(); });

$$('[data-add-product]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.addProduct;
    const p = PRODUCTS[id];
    if (!p) return;

    const sel = $(`[data-card-colour="${id}"]`);
    const colour = sel?.value || p.colours[0];
    const max = PRICING?.quantity.max ?? 100;

    const existing = order.find((l) => l.id === id && l.colour === colour);
    if (existing) existing.qty = Math.min(max, existing.qty + 1);
    else order.push({ id, colour, qty: 1 });

    const multi = $('#modeMulti');
    if (multi && !multi.checked) {
      multi.checked = true;
      multi.dispatchEvent(new Event('change', { bubbles: true }));
    }

    renderOrder();
    recalc();

    const original = btn.textContent;
    btn.textContent = T.added + ' ✓';
    btn.dataset.added = 'true';
    setTimeout(() => { btn.textContent = original; delete btn.dataset.added; }, 1400);

    track('add_to_order', { product: id, colour });
  });
});

function currentLines() {
  if ($('#modeMulti')?.checked) {
    return order.map((l) => ({ ...l, product: PRODUCTS[l.id] })).filter((l) => l.product);
  }
  const id = $('#qProduct')?.value;
  const product = PRODUCTS[id];
  if (!product) return [];
  const qty = Math.max(1, Number($('#qQuantity')?.value || 1));
  return [{ id, colour: $('#qColour')?.value || product.colours[0], qty, product }];
}

function computeEstimate() {
  const lines = currentLines();
  const totalQty = lines.reduce((a, l) => a + l.qty, 0);
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);

  const accessKey = $('#qAccess')?.value || 'OPEN_WITH_KEY';
  const access = PRICING?.accessFees[accessKey];
  const accessTotal = (access?.perUnit || 0) * totalQty;

  // Scheduling is per visit, not per unit.
  const schedKey = $('input[name="schedule"]:checked')?.value || 'STANDARD';
  const sched = PRICING?.scheduling[schedKey];
  const schedTotal = sched?.perJob || 0;

  const tier = tierFor(totalQty);
  const rate = tier?.rate ?? 0;
  const discount = Math.round(subtotal * rate * 100) / 100;

  return {
    lines, totalQty, subtotal, access, accessKey, accessTotal,
    sched, schedKey, schedTotal, tier, discount,
    total: Math.round((subtotal - discount + accessTotal + schedTotal) * 100) / 100,
    quoteOnly: Boolean(tier && tier.rate === null)
  };
}

function recalc() {
  const box = $('#breakdown');
  if (!box || !PRICING) return;

  const e = computeEstimate();
  if (!e.lines.length) { box.innerHTML = `<p class="bd-note">${T.addFirst}</p>`; return; }

  const rows = e.lines.map((l) => {
    const colour = COLOURS[l.colour]?.label || l.colour;
    return `<tr><td>${l.product.id} ${l.product.name} <small>(${colour}) × ${l.qty}</small></td><td>${money(l.product.price * l.qty)}</td></tr>`;
  }).join('');

  const parts = [rows];
  if (e.discount > 0) parts.push(`<tr><td>${e.tier.label}</td><td>−${money(e.discount)}</td></tr>`);
  if (e.accessTotal > 0) parts.push(`<tr><td>${e.access.label} × ${e.totalQty}</td><td>${money(e.accessTotal)}</td></tr>`);
  if (e.schedTotal > 0) parts.push(`<tr><td>${e.sched.label}</td><td>${money(e.schedTotal)}</td></tr>`);
  parts.push(`<tr class="bd-total"><td>${T.estTotal}</td><td>${money(e.total)}</td></tr>`);

  const notes = [`<p class="bd-note">${T.estNote}</p>`];
  if (e.quoteOnly) notes.unshift(`<p class="bd-note warn">${T.quoteOnly(e.tier.label, e.tier.minQty)}</p>`);

  box.innerHTML = `<table class="bd-table"><tbody>${parts.join('')}</tbody></table>${notes.join('')}`;
}

['#qProduct', '#qColour', '#qQuantity', '#qAccess'].forEach((sel) => {
  const el = $(sel);
  el?.addEventListener('change', recalc);
  el?.addEventListener('input', recalc);
});
$$('input[name="schedule"]').forEach((el) => el.addEventListener('change', () => {
  recalc();
  track('schedule', { choice: el.value });
}));

function validate() {
  clearErrors();
  let ok = true;

  const e = computeEstimate();
  if (!e.lines.length) ok = setFieldError('productId', T.addOne) && ok;

  if (!$('#modeMulti')?.checked) {
    const qty = Number($('#qQuantity')?.value);
    const { min, max } = PRICING.quantity;
    if (!Number.isInteger(qty) || qty < min || qty > max) {
      ok = setFieldError('quantity', T.qtyRange(min, max)) && ok;
    }
  }

  // Accept a full 6-digit postal code or a 2-digit sector.
  const postal = ($('#qPostal')?.value || '').trim();
  if (!postal) ok = setFieldError('postal', T.postalNeeded) && ok;
  else if (!/^\d{2}$/.test(postal) && !/^\d{6}$/.test(postal)) ok = setFieldError('postal', T.postalBad) && ok;

  const block = ($('#qBlock')?.value || '').trim();
  if (block && !/^[0-9]{1,4}[A-Za-z]?$/.test(block)) ok = setFieldError('block', T.blockBad) && ok;

  const unit = ($('#qUnit')?.value || '').trim();
  if (unit && !/^#?\d{1,3}[-\s]?\d{1,5}$/.test(unit)) ok = setFieldError('unit', T.unitBad) && ok;

  // Authorisation is mandatory only when we must open a locked mailbox.
  const needsAuth = PRICING.accessFees[$('#qAccess')?.value]?.unlock;
  if (needsAuth && !$('#qAuthorised')?.checked) ok = setFieldError('authorised', T.authNeeded) && ok;

  return ok;
}

$('#qAccess')?.addEventListener('change', () => {
  const needsAuth = PRICING?.accessFees[$('#qAccess').value]?.unlock;
  const group = $('#authGroup');
  if (group) group.hidden = !needsAuth;
  if (!needsAuth) setFieldError('authorised', '');
  recalc();
});

function buildMessage() {
  const e = computeEstimate();

  const lines = e.lines.map((l) => {
    const colour = COLOURS[l.colour]?.label || l.colour;
    return `• ${l.product.id} ${l.product.name} (${colour}) × ${l.qty} — ${money(l.product.price * l.qty)}`;
  });

  // PRIVACY: only the 2-digit postal sector travels in the link.
  // Name, phone, block, unit and the full postal code are never placed in a URL.
  const sector = ($('#qPostal')?.value || '').trim().slice(0, 2);

  const head = ZH ? '您好，我想要信箱锁的书面报价。' : 'Hi, I would like a written quote for a letterbox lock.';
  const parts = [head, '', ZH ? '订单' : 'ORDER', ...lines];

  if (e.discount > 0) parts.push(`${ZH ? '批量折扣' : 'Bulk discount'}: −${money(e.discount)} (${e.tier.label})`);
  if (e.accessTotal > 0) parts.push(`${e.access.label} × ${e.totalQty}: ${money(e.accessTotal)}`);
  if (e.schedTotal > 0) parts.push(`${e.sched.label}: ${money(e.schedTotal)}`);

  parts.push(
    `${T.estTotal}: ${money(e.total)}`,
    '',
    `${ZH ? '信箱状况' : 'Mailbox condition'}: ${e.access?.label || '—'}`,
    `${ZH ? '时段' : 'Scheduling'}: ${e.sched?.label || '—'}`,
    `${ZH ? '邮区' : 'Postal sector'}: ${sector}`
  );

  if (e.schedKey === 'URGENT') {
    parts.push(ZH ? '紧急 — 请确认今天能否到达。' : 'URGENT — please confirm whether you can reach me today.');
  }
  if (e.quoteOnly) {
    parts.push(ZH ? '备注：20 个单位以上，我了解需要勘察与书面报价。' : 'Note: 20+ units — I understand this needs a survey and written quote.');
  }

  parts.push('', ZH ? '我会在此对话中传送信箱正面照片，以及座号与单位。'
                    : 'I will send a photo of the mailbox front, plus my block and unit, in this chat.');

  return parts.join('\n');
}

$('#quoteForm')?.addEventListener('submit', (e) => {
  const status = $('#formStatus');

  // Without JS this form GETs to wa.me and still reaches us; here we take over.
  if (!PRICING) return;
  e.preventDefault();

  if (!validate()) {
    if (status) { status.textContent = T.fixFields; status.dataset.state = 'error'; }
    $('[aria-invalid="true"]')?.focus();
    return;
  }

  const url = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(buildMessage())}`;
  const est = computeEstimate();
  track('order_submit', { qty: est.totalQty, total: est.total, schedule: est.schedKey });

  if (status) { status.textContent = T.opening; status.dataset.state = 'ok'; }

  const win = window.open(url, '_blank', 'noopener');
  if (!win && status) {
    status.innerHTML = `${T.blocked}<a href="${url}" rel="noopener noreferrer">${T.tapHere}</a>.`;
    status.dataset.state = 'error';
  }
});

$('#copyDetails')?.addEventListener('click', async () => {
  const status = $('#formStatus');
  const block = ($('#qBlock')?.value || '').trim();
  const unit = ($('#qUnit')?.value || '').trim();
  const postal = ($('#qPostal')?.value || '').trim();

  if (!block && !unit && !postal) {
    if (status) { status.textContent = T.fillFirst; status.dataset.state = 'error'; }
    return;
  }

  const text = [
    block ? `${T.block}: ${block}` : null,
    unit ? `${T.unit}: ${unit}` : null,
    postal ? `${T.postal}: ${postal}` : null
  ].filter(Boolean).join('\n');

  try {
    await navigator.clipboard.writeText(text);
    if (status) { status.textContent = T.copied; status.dataset.state = 'ok'; }
  } catch {
    // Clipboard API unavailable or permission denied — fall back.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let done = false;
    try { done = document.execCommand('copy'); } catch { done = false; }
    document.body.removeChild(ta);
    if (status) {
      status.textContent = done ? T.copied : T.copyFail;
      status.dataset.state = done ? 'ok' : 'error';
    }
  }
  track('copy_details');
});

/* ------------------------------------------------------------ first paint */
(function init() {
  const group = $('#authGroup');
  if (group && PRICING) group.hidden = !PRICING.accessFees[$('#qAccess')?.value]?.unlock;
  renderOrder();
  recalc();
})();

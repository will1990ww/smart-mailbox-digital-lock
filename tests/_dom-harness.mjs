/* Minimal functional DOM to exercise app.mjs form logic in Node (no deps). */
export function makeDom(html) {
  class El {
    constructor(tag = "div") {
      this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {};
      this.listeners = {}; this._text = ""; this.hidden = false; this.classList = new ClassList();
      this.dataset = {}; this.style = {}; this._value = undefined;
    }
    get textContent() { return this._text || this.children.map((c) => c.textContent).join(""); }
    set textContent(v) { this._text = String(v); this.children = []; }
    setAttribute(k, v) { this.attributes[k] = String(v); if (k === "value") this._value = String(v); }
    getAttribute(k) { return this.attributes[k] ?? null; }
    removeAttribute(k) { delete this.attributes[k]; }
    appendChild(c) { c.parent = this; this.children.push(c); return c; }
    append(...ns) { for (const n of ns) { if (typeof n === "string") { const t = new El("#text"); t._text = n; this.children.push(t); } else { n.parent = this; this.children.push(n); } } }
    replaceChildren(...ns) { this.children = []; this._text = ""; this.append(...ns); }
    addEventListener(t, fn) { (this.listeners[t] || (this.listeners[t] = [])).push(fn); }
    dispatch(t) { (this.listeners[t] || []).forEach((fn) => fn({ target: this, preventDefault() {} })); }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
    querySelectorAll(sel) { return findAll(this, sel); }
    get value() { if (this.tagName === "SELECT") { const o = this.options.find((x) => x.selected) || this.options[0]; return o ? o.value : ""; } return this._value ?? (this.attributes.value ?? ""); }
    set value(v) { this._value = String(v); if (this.tagName === "SELECT") { this.options.forEach((o) => o.selected = (o.value === String(v))); } }
    get options() { return this.children.filter((c) => c.tagName === "OPTION"); }
    get selectedOptions() { const o = this.options.find((x) => x.selected) || this.options[0]; return o ? [o] : []; }
    get elements() { const map = {}; findAll(this, "input,select,textarea,button").forEach((e) => { const n = e.attributes.name; if (n && !(n in map)) map[n] = e; }); return map; }
    focus() { dom.activeElement = this; }
    scrollIntoView() {}
    closest() { return null; }
    click() { this.dispatch("click"); }
  }
  class Option extends El { constructor() { super("option"); this.selected = false; } }
  class ClassList {
    constructor() { this.s = new Set(); }
    add(...c) { c.forEach((x) => this.s.add(x)); }
    remove(...c) { c.forEach((x) => this.s.delete(x)); }
    toggle(c, f) { const has = this.s.has(c); const on = (f === undefined) ? !has : f; on ? this.s.add(c) : this.s.delete(c); return on; }
    contains(c) { return this.s.has(c); }
  }
  function findAll(root, sel) {
    const out = []; const sels = sel.split(",").map((s) => s.trim());
    (function walk(n) { for (const c of n.children) { if (matches(c, sels)) out.push(c); walk(c); } })(root);
    return out;
  }
  function matches(el, sels) {
    return sels.some((s) => {
      if (s.startsWith("#")) return el.attributes.id === s.slice(1);
      if (s.startsWith(".")) return el.classList.contains(s.slice(1));
      if (s.startsWith("[")) { const m = s.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/); if (!m) return false;
        return m[2] === undefined ? (m[1] in el.attributes) : el.attributes[m[1]] === m[2]; }
      const m = s.match(/^([\w-]+)(\[[^\]]+\])?$/);
      if (m) { if (el.tagName !== m[1].toUpperCase()) return false;
        if (m[2]) { const am = m[2].match(/^\[([\w-]+)(?:="([^"]*)")?\]$/); if (!am) return false;
          return am[2] === undefined ? (am[1] in el.attributes) : el.attributes[am[1]] === am[2]; }
        return true; }
      return false;
    });
  }
  const root = new El("body");
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^>]*?)?)(\/?)>|([^<]+)/g;
  const VOID = new Set(["input", "img", "meta", "link", "br", "hr", "source"]);
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith("<!--")) continue;
    if (m[5] !== undefined) { const t = new El("#text"); t._text = m[5]; stack[stack.length - 1].appendChild(t); continue; }
    const close = m[1] === "/"; const tag = m[2].toLowerCase(); const attrs = m[3] || ""; const selfClose = m[4] === "/";
    if (close) { for (let i = stack.length - 1; i > 0; i--) { if (stack[i].tagName === tag.toUpperCase()) { stack.length = i; break; } } continue; }
    const el = tag === "option" ? new Option() : new El(tag);
    const ar = /([\w-]+)(?:="([^"]*)")?/g; let a;
    while ((a = ar.exec(attrs))) { if (!a[1]) continue; el.attributes[a[1]] = a[2] ?? ""; if (a[1] === "value") el._value = a[2] ?? ""; if (a[1] === "class") { (a[2] || "").split(/\s+/).forEach((x) => x && el.classList.add(x)); } if (a[1] === "selected") el.selected = true; if (a[1].startsWith("data-")) el.dataset[a[1].slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = a[2] ?? ""; }
    stack[stack.length - 1].appendChild(el);
    if (!VOID.has(tag) && !selfClose) stack.push(el);
  }
  const dom = {
    activeElement: root,
    getElementById: (id) => root.querySelector("#" + id),
    querySelector: (s) => root.querySelector(s),
    querySelectorAll: (s) => root.querySelectorAll(s),
    createElement: (t) => t === "option" ? new Option() : new El(t),
    addEventListener() {}, body: root,
  };
  return { document: dom, El, Option };
}

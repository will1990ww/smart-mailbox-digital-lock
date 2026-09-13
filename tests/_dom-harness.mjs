/* Minimal functional DOM to exercise app.mjs in Node (no dependencies).
 * Supports comma groups, descendant and ">" child combinators. */
export function makeDom(html) {
  class ClassList {
    constructor() { this.s = new Set(); }
    add(...c) { c.forEach((x) => this.s.add(x)); }
    remove(...c) { c.forEach((x) => this.s.delete(x)); }
    toggle(c, f) { const on = (f === undefined) ? !this.s.has(c) : f; on ? this.s.add(c) : this.s.delete(c); return on; }
    contains(c) { return this.s.has(c); }
  }
  class El {
    constructor(tag = "div") {
      this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {};
      this.listeners = {}; this._text = ""; this.hidden = false; this.classList = new ClassList();
      this.dataset = {}; this.style = {}; this._value = undefined; this.checked = false; this.disabled = false;
    }
    get textContent() { return this._text || this.children.map((c) => c.textContent).join(""); }
    set textContent(v) { this._text = String(v); this.children = []; }
    setAttribute(k, v) { this.attributes[k] = String(v); if (k === "value") this._value = String(v); }
    getAttribute(k) { return this.attributes[k] ?? null; }
    removeAttribute(k) { delete this.attributes[k]; }
    appendChild(c) { c.parent = this; this.children.push(c); return c; }
    append(...ns) { for (const n of ns) { if (typeof n === "string" || typeof n === "number") { const t = new El("#text"); t._text = String(n); t.parent = this; this.children.push(t); } else if (n) { n.parent = this; this.children.push(n); } } }
    replaceChildren(...ns) { this.children = []; this._text = ""; this.append(...ns); }
    addEventListener(t, fn) { (this.listeners[t] || (this.listeners[t] = [])).push(fn); }
    dispatch(t, ev = {}) { (this.listeners[t] || []).forEach((fn) => fn({ target: this, preventDefault() {}, ...ev })); }
    querySelector(s) { return findAll(this, s)[0] || null; }
    querySelectorAll(s) { return findAll(this, s); }
    get value() { if (this.tagName === "SELECT") { const o = this.options.find((x) => x.selected) || this.options[0]; return o ? o.value : ""; } return this._value ?? (this.attributes.value ?? ""); }
    set value(v) { this._value = String(v); if (this.tagName === "SELECT") this.options.forEach((o) => o.selected = (o.value === String(v))); }
    get options() { return this.children.filter((c) => c.tagName === "OPTION"); }
    get selectedOptions() { const o = this.options.find((x) => x.selected) || this.options[0]; return o ? [o] : []; }
    get elements() { const m = {}; findAll(this, "input,select,textarea,button").forEach((e) => { const n = e.attributes.name; if (n && !(n in m)) m[n] = e; }); return m; }
    focus() { dom.activeElement = this; }
    scrollIntoView() {}
    click() { this.dispatch("click"); }
  }
  class Option extends El { constructor() { super("option"); this.selected = false; } }

  function findAll(root, sel) {
    const groups = String(sel).split(",").map((s) => s.trim()).filter(Boolean);
    const out = [];
    (function walk(n) { for (const c of n.children) { if (groups.some((g) => matchGroup(c, g))) out.push(c); walk(c); } })(root);
    return out;
  }
  function matchGroup(el, group) {
    const parts = group.split(/\s+/).filter(Boolean);
    if (!parts.length || !simple(el, parts[parts.length - 1])) return false;
    let node = el.parent, i = parts.length - 2;
    while (i >= 0) {
      if (parts[i] === ">") {
        const sel = parts[i - 1];
        if (!node || !simple(node, sel)) return false;
        node = node.parent; i -= 2; continue;
      }
      let found = false;
      while (node) { if (simple(node, parts[i])) { found = true; node = node.parent; break; } node = node.parent; }
      if (!found) return false;
      i -= 1;
    }
    return true;
  }
  function simple(el, s) {
    if (!s) return false;
    if (s.startsWith("#")) return el.attributes.id === s.slice(1);
    if (s.startsWith(".")) return el.classList.contains(s.slice(1));
    if (s.startsWith("[")) { const m = s.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/); if (!m) return false;
      return m[2] === undefined ? (m[1] in el.attributes) : el.attributes[m[1]] === m[2]; }
    const m = s.match(/^([\w-]+)(\[[^\]]+\])?$/);
    if (!m) return false;
    if (el.tagName !== m[1].toUpperCase()) return false;
    if (m[2]) { const a = m[2].match(/^\[([\w-]+)(?:="([^"]*)")?\]$/); if (!a) return false;
      return a[2] === undefined ? (a[1] in el.attributes) : el.attributes[a[1]] === a[2]; }
    return true;
  }

  const root = new El("body");
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^>]*?)?)(\/?)>|([^<]+)/g;
  const VOID = new Set(["input","img","meta","link","br","hr","source"]);
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith("<!--")) continue;
    if (m[5] !== undefined) { const t = new El("#text"); t._text = m[5]; stack[stack.length - 1].appendChild(t); continue; }
    const close = m[1] === "/", tag = m[2].toLowerCase(), attrs = m[3] || "", self = m[4] === "/";
    if (close) { for (let i = stack.length - 1; i > 0; i--) if (stack[i].tagName === tag.toUpperCase()) { stack.length = i; break; } continue; }
    const el = tag === "option" ? new Option() : new El(tag);
    const ar = /([\w-]+)(?:="([^"]*)")?/g; let a;
    while ((a = ar.exec(attrs))) {
      if (!a[1]) continue;
      el.attributes[a[1]] = a[2] ?? "";
      if (a[1] === "value") el._value = a[2] ?? "";
      if (a[1] === "checked") el.checked = true;
      if (a[1] === "hidden") el.hidden = true;
      if (a[1] === "selected") el.selected = true;
      if (a[1] === "class") (a[2] || "").split(/\s+/).forEach((x) => x && el.classList.add(x));
      if (a[1].startsWith("data-")) el.dataset[a[1].slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = a[2] ?? "";
    }
    stack[stack.length - 1].appendChild(el);
    if (!VOID.has(tag) && !self) stack.push(el);
  }
  const dom = {
    activeElement: root,
    getElementById: (id) => root.querySelector("#" + id),
    querySelector: (s) => root.querySelector(s),
    querySelectorAll: (s) => root.querySelectorAll(s),
    createElement: (t) => (t === "option" ? new Option() : new El(t)),
    addEventListener() {}, body: root,
  };
  return { document: dom, El, Option };
}

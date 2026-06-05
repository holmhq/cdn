// flow-globe v0.1.0 — first-party animated geospatial flow visualization.
//
// A dependency-free Shadow-DOM web component. Renders country-to-country flows
// as glowing great-circle arcs with travelling particles, either on a rotating
// 3D wireframe globe (orthographic) or a flat equirectangular map. No charting
// library, no map geodata download — just canvas 2D and a compact built-in
// table of country centroids. Themed via CSS variables.
//
// Replaces the earlier amCharts-backed wrapper (v0.0.x). The public attribute
// surface is unchanged: title, subtitle, theme, height, projection, auto-rotate,
// data, country-names, producers, hubs, consumers, value-suffix.

export const VERSION = '0.1.0';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

// Approximate country centroids as [lng, lat] in degrees. Covers the codes used
// by realistic flow demos; unknown codes are skipped (logged once, not fatal).
export const COUNTRY_CENTROIDS = Object.freeze({
  US: [-98.5, 39.8], CA: [-106.3, 56.1], MX: [-102.5, 23.6], BR: [-51.9, -10.8], AR: [-63.6, -38.4],
  CO: [-74.3, 4.6], PE: [-75.0, -9.2], CL: [-71.5, -35.7], VE: [-66.6, 6.4], EC: [-78.2, -1.8],
  GB: [-1.5, 52.4], IE: [-8.2, 53.4], FR: [2.2, 46.2], DE: [10.5, 51.2], ES: [-3.7, 40.5],
  PT: [-8.2, 39.6], IT: [12.6, 41.9], NL: [5.3, 52.1], BE: [4.5, 50.6], CH: [8.2, 46.8],
  AT: [14.6, 47.6], SE: [15.3, 62.2], NO: [8.5, 60.5], FI: [25.7, 64.0], DK: [9.5, 56.3],
  PL: [19.1, 51.9], CZ: [15.5, 49.8], GR: [21.8, 39.1], RO: [24.9, 45.9], HU: [19.5, 47.2],
  RU: [97.0, 61.5], UA: [31.2, 48.4], TR: [35.2, 38.9], IL: [34.9, 31.0], SA: [45.1, 23.9],
  AE: [54.0, 23.4], EG: [30.8, 26.8], ZA: [24.7, -29.0], NG: [8.7, 9.1], KE: [37.9, 0.2],
  ET: [40.5, 9.1], MA: [-7.1, 31.8], DZ: [2.6, 28.2], GH: [-1.0, 7.9], TZ: [34.9, -6.4],
  IN: [78.9, 20.6], PK: [69.3, 30.4], BD: [90.4, 23.7], CN: [104.2, 35.9], JP: [138.3, 36.2],
  KR: [127.8, 36.4], TW: [121.0, 23.7], HK: [114.2, 22.4], SG: [103.8, 1.35], MY: [101.9, 4.2],
  TH: [101.0, 15.9], VN: [108.3, 14.1], ID: [113.9, -0.8], PH: [122.9, 12.9], AU: [133.8, -25.3],
  NZ: [171.8, -41.5], HN: [-86.6, 15.2], GT: [-90.2, 15.8], CR: [-83.8, 9.7], PA: [-80.1, 8.5],
  KW: [47.6, 29.3], QA: [51.2, 25.3], IR: [53.7, 32.4], IQ: [43.7, 33.2], JO: [36.2, 31.3],
  LK: [80.8, 7.9], NP: [84.1, 28.4], MM: [95.9, 21.9], KH: [104.9, 12.6], KZ: [66.9, 48.0],
  IS: [-18.6, 65.0], LU: [6.1, 49.8], SK: [19.7, 48.7], SI: [14.8, 46.1], HR: [15.2, 45.1],
  RS: [21.0, 44.0], BG: [25.5, 42.7], LT: [23.9, 55.2], LV: [24.6, 56.9], EE: [25.0, 58.6],
});

export const DEFAULT_FLOWS = Object.freeze([
  { sourceId: 'BR', targetId: 'DE', value: 350 }, { sourceId: 'BR', targetId: 'US', value: 450 },
  { sourceId: 'CO', targetId: 'US', value: 250 }, { sourceId: 'ET', targetId: 'DE', value: 90 },
  { sourceId: 'VN', targetId: 'DE', value: 200 }, { sourceId: 'IN', targetId: 'GB', value: 180 },
  { sourceId: 'DE', targetId: 'FR', value: 150 }, { sourceId: 'DE', targetId: 'PL', value: 100 },
  { sourceId: 'US', targetId: 'JP', value: 120 }, { sourceId: 'US', targetId: 'CA', value: 130 },
  { sourceId: 'SG', targetId: 'AU', value: 80 },  { sourceId: 'SG', targetId: 'JP', value: 70 },
]);

export const DEFAULT_COUNTRY_NAMES = Object.freeze({
  BR: 'Brazil', US: 'United States', DE: 'Germany', CO: 'Colombia', ET: 'Ethiopia', VN: 'Vietnam',
  IN: 'India', GB: 'United Kingdom', FR: 'France', PL: 'Poland', JP: 'Japan', CA: 'Canada',
  SG: 'Singapore', AU: 'Australia',
});

// Theme palettes. Each maps to the wireframe-globe surfaces. CSS variables
// (--flow-globe-<key>) override any field per instance.
const PALETTES = Object.freeze({
  ocean:  { sphere1: '#0b3a52', sphere2: '#04141d', graticule: '#2b6f8f', halo: '#22d3ee', arc: '#38bdf8', arcHot: '#a5f3fc', particle: '#e0fbff', producer: '#34d399', hub: '#fbbf24', consumer: '#60a5fa', land: '#0e4a63', title: '#e0f2fe', subtitle: '#7dd3fc', label: '#cffafe', bg: 'transparent' },
  coffee: { sphere1: '#5b3a22', sphere2: '#1c0f07', graticule: '#9c6b43', halo: '#e0a96d', arc: '#f0b27a', arcHot: '#ffe8c9', particle: '#fff3e2', producer: '#a3d977', hub: '#ffcf6b', consumer: '#e8c9a0', land: '#3c2412', title: '#ffedd5', subtitle: '#e7b98c', label: '#f5e6d3', bg: 'transparent' },
  ember:  { sphere1: '#4a1d12', sphere2: '#1a0805', graticule: '#a3502c', halo: '#fb923c', arc: '#fb7c3c', arcHot: '#ffd8a8', particle: '#fff1e0', producer: '#fde047', hub: '#fdba74', consumer: '#fca5a5', land: '#37130b', title: '#ffedd5', subtitle: '#fdba74', label: '#ffe4cc', bg: 'transparent' },
  slate:  { sphere1: '#26304a', sphere2: '#0a0e1a', graticule: '#52617f', halo: '#a78bfa', arc: '#a78bfa', arcHot: '#ddd6fe', particle: '#f5f3ff', producer: '#86efac', hub: '#c4b5fd', consumer: '#93c5fd', land: '#1c2438', title: '#f8fafc', subtitle: '#cbd5e1', label: '#e2e8f0', bg: 'transparent' },
});

const STYLES = `
:host {
  --flow-globe-height: 520px;
  --flow-globe-radius: 22px;
  --flow-globe-shadow: 0 24px 70px rgba(0,0,0,0.28);
  display: block;
  min-width: 260px;
}
:host([hidden]) { display: none; }
.wrapper {
  border-radius: var(--flow-globe-radius);
  box-shadow: var(--flow-globe-shadow);
  height: var(--flow-globe-height);
  overflow: hidden;
  position: relative;
  width: 100%;
}
canvas { display: block; height: 100%; width: 100%; touch-action: none; cursor: grab; }
canvas.dragging { cursor: grabbing; }
.legend {
  align-items: center; bottom: 14px; display: flex; flex-wrap: wrap; gap: 6px 14px;
  font: 600 11px/1.2 system-ui, sans-serif; left: 16px; position: absolute; right: 16px;
}
.legend span { align-items: center; display: inline-flex; gap: 6px; opacity: 0.92; }
.legend i { border-radius: 50%; box-shadow: 0 0 8px currentColor; display: inline-block; height: 9px; width: 9px; }
.titles { left: 18px; pointer-events: none; position: absolute; top: 16px; }
.titles h4 { font: 700 17px/1.2 system-ui, sans-serif; letter-spacing: -0.02em; margin: 0; }
.titles p { font: 500 12px/1.3 system-ui, sans-serif; margin: 3px 0 0; opacity: 0.8; }
.controls { display: flex; gap: 6px; position: absolute; right: 14px; top: 14px; }
.controls button {
  backdrop-filter: blur(6px); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
  border-radius: 999px; color: inherit; cursor: pointer; font: 600 11px/1 system-ui, sans-serif;
  padding: 7px 11px; transition: background 0.15s;
}
.controls button[aria-pressed="true"] { background: rgba(255,255,255,0.26); }
.controls button:hover { background: rgba(255,255,255,0.2); }
@media (prefers-reduced-motion: reduce) { canvas { } }
`;

export function defineFlowGlobe(tagName = 'flow-globe') {
  if (typeof customElements === 'undefined') return undefined;
  if (!customElements.get(tagName)) customElements.define(tagName, FlowGlobe);
  return customElements.get(tagName);
}

export function createFlowGlobe(options = {}) {
  if (typeof document === 'undefined') throw new Error('createFlowGlobe() requires a browser document');
  const tagName = options.tagName || 'flow-globe';
  defineFlowGlobe(tagName);
  const el = document.createElement(tagName);
  applyOptions(el, options);
  return el;
}

export class FlowGlobe extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'theme', 'height', 'projection', 'auto-rotate', 'controls', 'legend', 'data', 'country-names', 'producers', 'hubs', 'consumers', 'value-suffix'];
  }

  constructor() {
    super();
    this._flows = null;
    this._countryNames = null;
    this._raf = 0;
    this._yaw = -1.4;          // current rotation (radians)
    this._pitch = 0.32;        // tilt toward northern hemisphere
    this._spin = true;
    this._t = 0;               // animation clock (seconds-ish)
    this._drag = null;
    this._dpr = 1;
    this._warned = new Set();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
      <div class="wrapper">
        <canvas></canvas>
        <div class="titles"></div>
        <div class="controls"></div>
        <div class="legend"></div>
      </div>`;
    this._canvas = this.shadowRoot.querySelector('canvas');
    this._ctx = this._canvas.getContext('2d');
    this._onResize = this._onResize.bind(this);
    this._frame = this._frame.bind(this);
    this._bindPointer();
  }

  connectedCallback() {
    this._ro = new ResizeObserver(this._onResize);
    this._ro.observe(this.shadowRoot.querySelector('.wrapper'));
    this._sync();
    this._onResize();
    this._start();
  }

  disconnectedCallback() {
    this._stop();
    this._ro?.disconnect();
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'height') this._onResize();
    this._sync();
  }

  get data() { return (this._flows || DEFAULT_FLOWS).map(f => ({ ...f })); }
  set data(flows) { this._flows = normalizeFlows(flows); this._sync(); }
  get countryNames() { return { ...DEFAULT_COUNTRY_NAMES, ...(this._countryNames || {}) }; }
  set countryNames(names) { this._countryNames = names && typeof names === 'object' ? { ...names } : null; this._sync(); }
  configure(options = {}) { applyOptions(this, options); return this; }
  setData(flows) { this.data = flows; return this; }

  // ----- model -----

  _palette() {
    const base = { ...(PALETTES[this.getAttribute('theme')] || PALETTES.ocean) };
    const cs = getComputedStyle(this);
    for (const key of Object.keys(base)) {
      const v = cs.getPropertyValue(`--flow-globe-${kebab(key)}`).trim();
      if (v) base[key] = v;
    }
    return base;
  }

  _sync() {
    const flows = normalizeFlows(this.getAttribute('data') || this._flows || DEFAULT_FLOWS);
    const names = { ...DEFAULT_COUNTRY_NAMES, ...parseObject(this.getAttribute('country-names')), ...(this._countryNames || {}) };
    const groups = this._groups(flows);
    const nodes = new Map();
    const ensure = (id) => {
      if (nodes.has(id)) return nodes.get(id);
      const c = COUNTRY_CENTROIDS[id];
      if (!c) { if (!this._warned.has(id)) { this._warned.add(id); console.warn(`flow-globe: no centroid for "${id}", skipping`); } return null; }
      const role = groups.producers.includes(id) ? 'producer' : groups.hubs.includes(id) ? 'hub' : groups.consumers.includes(id) ? 'consumer' : 'consumer';
      const node = { id, name: names[id] || id, vec: toVec(c[0], c[1]), lnglat: c, role, weight: 0 };
      nodes.set(id, node);
      return node;
    };
    const arcs = [];
    for (const f of flows) {
      const a = ensure(f.sourceId), b = ensure(f.targetId);
      if (!a || !b) continue;
      a.weight += f.value; b.weight += f.value;
      arcs.push({ a, b, value: f.value, pts: greatCircle(a.vec, b.vec, 48) });
    }
    const maxW = Math.max(1, ...[...nodes.values()].map(n => n.weight));
    const maxV = Math.max(1, ...arcs.map(a => a.value));
    for (const n of nodes.values()) n.r = 2.6 + 4.6 * Math.sqrt(n.weight / maxW);
    for (const a of arcs) { a.w = 0.7 + 2.4 * (a.value / maxV); a.particles = 1 + Math.round(2 * (a.value / maxV)); }
    this._model = { nodes: [...nodes.values()], arcs };
    this._spin = this.getAttribute('auto-rotate') !== 'false';
    this._renderChrome(groups);
  }

  _groups(flows) {
    const p = parseList(this.getAttribute('producers'));
    const h = parseList(this.getAttribute('hubs'));
    const c = parseList(this.getAttribute('consumers'));
    if (p.length || h.length || c.length) return { producers: p, hubs: h, consumers: c };
    const sources = new Set(flows.map(f => f.sourceId));
    const targets = new Set(flows.map(f => f.targetId));
    return {
      producers: [...sources].filter(id => !targets.has(id)),
      hubs: [...sources].filter(id => targets.has(id)),
      consumers: [...targets].filter(id => !sources.has(id)),
    };
  }

  _renderChrome(groups) {
    const pal = this._palette();
    const titlesEl = this.shadowRoot.querySelector('.titles');
    const title = this.getAttribute('title');
    const subtitle = this.getAttribute('subtitle');
    titlesEl.innerHTML = `${title ? `<h4 style="color:${esc(pal.title)}">${esc(title)}</h4>` : ''}${subtitle ? `<p style="color:${esc(pal.subtitle)}">${esc(subtitle)}</p>` : ''}`;

    const legendEl = this.shadowRoot.querySelector('.legend');
    if (this.getAttribute('legend') === 'false') { legendEl.innerHTML = ''; }
    else {
      const items = [];
      if (groups.producers.length) items.push(['Source', pal.producer]);
      if (groups.hubs.length) items.push(['Hub', pal.hub]);
      if (groups.consumers.length) items.push(['Destination', pal.consumer]);
      legendEl.innerHTML = items.map(([t, c]) => `<span style="color:${esc(c)}"><i style="background:${esc(c)}"></i><span style="color:${esc(pal.label)}">${esc(t)}</span></span>`).join('');
    }

    const ctrlEl = this.shadowRoot.querySelector('.controls');
    if (this.getAttribute('controls') === 'false') { ctrlEl.innerHTML = ''; return; }
    const proj = this.getAttribute('projection') === 'map' ? 'map' : 'globe';
    ctrlEl.style.color = pal.label;
    ctrlEl.innerHTML = `
      <button data-proj="globe" aria-pressed="${proj === 'globe'}">Globe</button>
      <button data-proj="map" aria-pressed="${proj === 'map'}">Map</button>`;
    ctrlEl.querySelectorAll('button').forEach(btn => btn.onclick = () => this.setAttribute('projection', btn.dataset.proj));
  }

  // ----- sizing + loop -----

  _onResize() {
    const wrap = this.shadowRoot.querySelector('.wrapper');
    const rect = wrap.getBoundingClientRect();
    const dpr = this._dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1) || 1);
    this._w = Math.max(1, Math.round(rect.width));
    this._h = Math.max(1, Math.round(rect.height));
    this._canvas.width = Math.round(this._w * dpr);
    this._canvas.height = Math.round(this._h * dpr);
  }

  _start() { if (!this._raf) { this._last = null; this._raf = requestAnimationFrame(this._frame); } }
  _stop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; }

  _frame(now) {
    this._raf = requestAnimationFrame(this._frame);
    const dt = this._last == null ? 0 : Math.min(0.05, (now - this._last) / 1000);
    this._last = now;
    this._t += dt;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this._spin && !this._drag && !reduce) this._yaw += dt * 0.16;
    this._draw();
  }

  // ----- drawing -----

  _draw() {
    const ctx = this._ctx, dpr = this._dpr, W = this._w, H = this._h;
    if (!ctx || !this._model) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const pal = this._palette();
    const map = this.getAttribute('projection') === 'map';
    if (map) this._drawMap(ctx, W, H, pal);
    else this._drawGlobe(ctx, W, H, pal);
  }

  _project(vec) { // orthographic 3D -> screen; returns {x,y,front}
    const [x, y, z] = rot(vec, this._yaw, this._pitch);
    return { x: x, y: y, z: z, front: z > 0 };
  }

  _drawGlobe(ctx, W, H, pal) {
    const cx = W / 2, cy = H / 2 + 6;
    const R = Math.min(W, H) * 0.40;
    this._view = { cx, cy, R, globe: true };
    const project = (vec) => { const [x, y, z] = rot(vec, this._yaw, this._pitch); return { sx: cx + x * R, sy: cy - y * R, front: z > 0, z }; };

    // sphere body
    const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
    grad.addColorStop(0, pal.sphere1);
    grad.addColorStop(1, pal.sphere2);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fillStyle = grad; ctx.fill();
    // outer halo
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
    ctx.lineWidth = 1.5; ctx.strokeStyle = pal.halo; ctx.globalAlpha = 0.5; ctx.shadowBlur = 18; ctx.shadowColor = pal.halo; ctx.stroke();
    ctx.restore();

    // graticule
    ctx.lineWidth = 0.6; ctx.strokeStyle = pal.graticule;
    for (let lng = -180; lng < 180; lng += 30) this._stroke(ctx, project, meridian(lng), 0.45);
    for (let lat = -60; lat <= 60; lat += 30) this._stroke(ctx, project, parallel(lat), lat === 0 ? 0.6 : 0.4);

    this._drawArcs(ctx, project, pal, true);
    this._drawNodes(ctx, project, pal, true);
  }

  _drawMap(ctx, W, H, pal) {
    const pad = 26, mw = W - pad * 2, mh = H - pad * 2 - 12;
    const cx = pad, cy = pad + 18;
    const project = (vec) => { const [lng, lat] = fromVec(vec); return { sx: cx + (lng + 180) / 360 * mw, sy: cy + (90 - lat) / 180 * mh, front: true, z: 1 }; };
    // backdrop
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, pal.sphere1); g.addColorStop(1, pal.sphere2);
    roundRect(ctx, cx, cy, mw, mh, 14); ctx.fillStyle = g; ctx.fill();
    ctx.save(); roundRect(ctx, cx, cy, mw, mh, 14); ctx.clip();
    this._view = { cx: cx + mw / 2, cy: cy + mh / 2, R: Math.min(mw, mh) * 0.5, globe: false };
    ctx.strokeStyle = pal.graticule; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.5;
    for (let lng = -150; lng < 180; lng += 30) { ctx.beginPath(); const x = cx + (lng + 180) / 360 * mw; ctx.moveTo(x, cy); ctx.lineTo(x, cy + mh); ctx.stroke(); }
    for (let lat = -60; lat <= 60; lat += 30) { ctx.beginPath(); const y = cy + (90 - lat) / 180 * mh; ctx.moveTo(cx, y); ctx.lineTo(cx + mw, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    this._drawArcs(ctx, project, pal, false);
    this._drawNodes(ctx, project, pal, false);
    ctx.restore();
  }

  _stroke(ctx, project, pts, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath();
    let pen = false;
    for (const v of pts) {
      const p = project(v);
      if (!p.front) { pen = false; continue; }
      if (pen) ctx.lineTo(p.sx, p.sy); else { ctx.moveTo(p.sx, p.sy); pen = true; }
    }
    ctx.stroke(); ctx.restore();
  }

  // Arcs are screen-space quadratic Béziers that bulge away from the globe
  // centre (flight-path style). On the globe an arc is drawn only when both
  // endpoints face the viewer, so arcs appear/vanish naturally as it rotates —
  // no great-circle-behind-the-sphere glitches.
  _drawArcs(ctx, project, pal, globe) {
    const { cx, cy } = this._view;
    for (const arc of this._model.arcs) {
      const pa = project(arc.a.vec), pb = project(arc.b.vec);
      if (globe && (!pa.front || !pb.front)) continue;
      const mx = (pa.sx + pb.sx) / 2, my = (pa.sy + pb.sy) / 2;
      const span = Math.hypot(pb.sx - pa.sx, pb.sy - pa.sy);
      let nx, ny;
      if (globe) { // push outward from globe centre
        nx = mx - cx; ny = my - cy; const m = Math.hypot(nx, ny) || 1; nx /= m; ny /= m;
      } else {     // push upward (perpendicular to the chord)
        const dx = pb.sx - pa.sx, dy = pb.sy - pa.sy, m = Math.hypot(dx, dy) || 1;
        nx = -dy / m; ny = dx / m; if (ny > 0) { nx = -nx; ny = -ny; }
      }
      const bulge = span * 0.28 + 18;
      const ctrl = { x: mx + nx * bulge, y: my + ny * bulge };
      ctx.save();
      ctx.lineWidth = arc.w; ctx.lineCap = 'round';
      ctx.strokeStyle = pal.arc; ctx.shadowBlur = 6; ctx.shadowColor = pal.arc; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(pa.sx, pa.sy); ctx.quadraticCurveTo(ctrl.x, ctrl.y, pb.sx, pb.sy); ctx.stroke();
      ctx.restore();
      for (let k = 0; k < arc.particles; k++) {
        const t = (this._t * (0.16 + 0.04 * (arc.value % 5)) + k / arc.particles) % 1;
        const u = 1 - t;
        const sx = u * u * pa.sx + 2 * u * t * ctrl.x + t * t * pb.sx;
        const sy = u * u * pa.sy + 2 * u * t * ctrl.y + t * t * pb.sy;
        const fade = Math.sin(Math.PI * t);
        ctx.save(); ctx.globalAlpha = 0.4 + 0.6 * fade;
        ctx.fillStyle = pal.particle; ctx.shadowBlur = 10; ctx.shadowColor = pal.arcHot;
        ctx.beginPath(); ctx.arc(sx, sy, 1.4 + 1.7 * fade, 0, TAU); ctx.fill(); ctx.restore();
      }
    }
  }

  _drawNodes(ctx, project, pal, cull) {
    const labeled = [];
    for (const n of this._model.nodes) {
      const p = project(n.vec);
      if (cull && !p.front) continue;
      const color = pal[n.role] || pal.consumer;
      ctx.save();
      ctx.fillStyle = color; ctx.shadowBlur = 12; ctx.shadowColor = color;
      ctx.beginPath(); ctx.arc(p.sx, p.sy, n.r, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.9; ctx.lineWidth = 1; ctx.strokeStyle = pal.particle; ctx.stroke();
      ctx.restore();
      if (n.weight > 0) labeled.push({ n, p });
    }
    // labels for the strongest nodes first; skip any that would collide with an
    // already-placed label so dense regions (e.g. Europe) stay legible.
    labeled.sort((a, b) => b.n.weight - a.n.weight);
    ctx.save();
    ctx.font = '600 11px system-ui, sans-serif'; ctx.textBaseline = 'middle';
    const placed = [];
    for (const { n, p } of labeled) {
      const x = p.sx + n.r + 4, y = p.sy;
      if (placed.some(q => Math.abs(q.x - x) < 64 && Math.abs(q.y - y) < 13)) continue;
      placed.push({ x, y });
      ctx.fillStyle = pal.label; ctx.globalAlpha = 0.95;
      ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.fillText(n.name, x, y);
      if (placed.length >= 9) break;
    }
    ctx.restore();
  }

  // ----- interaction -----

  _bindPointer() {
    const c = this._canvas;
    c.addEventListener('pointerdown', (e) => {
      this._drag = { x: e.clientX, y: e.clientY, yaw: this._yaw, pitch: this._pitch };
      c.classList.add('dragging'); c.setPointerCapture?.(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      if (!this._drag) return;
      const k = 0.005;
      this._yaw = this._drag.yaw + (e.clientX - this._drag.x) * k;
      this._pitch = clamp(this._drag.pitch - (e.clientY - this._drag.y) * k, -1.2, 1.2);
    });
    const end = () => { if (this._drag) { this._drag = null; this._canvas.classList.remove('dragging'); } };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener('pointerleave', end);
  }
}

// ----- geometry helpers -----

function toVec(lng, lat) { const p = lat * DEG, l = lng * DEG; return [Math.cos(p) * Math.cos(l), Math.sin(p), Math.cos(p) * Math.sin(l)]; }
function fromVec(v) { const lat = Math.asin(clamp(v[1], -1, 1)) / DEG; const lng = Math.atan2(v[2], v[0]) / DEG; return [lng, lat]; }
function scaleVec(v, s) { return [v[0] * s, v[1] * s, v[2] * s]; }
function rot([x, y, z], yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  let x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  let y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
  return [x1, y2, z2];
}
function greatCircle(a, b, n) {
  const dot = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
  const omega = Math.acos(dot);
  const out = [];
  if (omega < 1e-6) { for (let i = 0; i <= n; i++) out.push(a.slice()); return out; }
  const so = Math.sin(omega);
  for (let i = 0; i <= n; i++) {
    const t = i / n, c1 = Math.sin((1 - t) * omega) / so, c2 = Math.sin(t * omega) / so;
    out.push([a[0] * c1 + b[0] * c2, a[1] * c1 + b[1] * c2, a[2] * c1 + b[2] * c2]);
  }
  return out;
}
function meridian(lng) { const out = []; for (let lat = -90; lat <= 90; lat += 6) out.push(toVec(lng, lat)); return out; }
function parallel(lat) { const out = []; for (let lng = -180; lng <= 180; lng += 6) out.push(toVec(lng, lat)); return out; }

// ----- misc -----

function normalizeFlows(input) {
  if (typeof input === 'string') { try { return normalizeFlows(JSON.parse(input)); } catch { return DEFAULT_FLOWS.map(f => ({ ...f })); } }
  if (!Array.isArray(input)) return DEFAULT_FLOWS.map(f => ({ ...f }));
  return input
    .map(f => ({ sourceId: String(f.sourceId || f.source || '').toUpperCase(), targetId: String(f.targetId || f.target || '').toUpperCase(), value: Number(f.value) || 0 }))
    .filter(f => f.sourceId && f.targetId && f.value > 0);
}
function applyOptions(el, options) {
  if (options.data) el.data = options.data;
  if (options.countryNames) el.countryNames = options.countryNames;
  for (const [key, attr] of Object.entries({ title: 'title', subtitle: 'subtitle', theme: 'theme', height: 'height', projection: 'projection', valueSuffix: 'value-suffix', producers: 'producers', hubs: 'hubs', consumers: 'consumers' })) {
    if (options[key] != null) el.setAttribute(attr, String(options[key]));
  }
  for (const [key, attr] of Object.entries({ autoRotate: 'auto-rotate', controls: 'controls', legend: 'legend' })) {
    if (options[key] != null) el.setAttribute(attr, String(options[key]));
  }
}
function parseList(v) { return String(v || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean); }
function parseObject(v) { if (!v) return {}; try { return JSON.parse(v); } catch { return {}; } }
function kebab(v) { return v.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`); }
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function esc(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

defineFlowGlobe();

export default FlowGlobe;

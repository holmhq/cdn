// poster-charts v0.0.1 — first-party "data-poster" SVG chart web component.
//
// A dependency-free Shadow-DOM custom element for bold, infographic-style data
// visuals: oversized numerals, confident color blocks, bespoke inline SVG. No
// charting library. Built for civic / status-report / dashboard apps that want
// chart-first storytelling instead of generic canvas charts.
//
// One element, eight archetypes selected by `type`:
//   stat       big-number callout (+ optional delta pill)
//   gauge      single value as an arc ring (% of a max; over-100 aware)
//   bars       grouped/paired vertical bars (BE-vs-Actual, A-vs-B) + target line
//   slope      before -> after slope lines (1-3 series), endpoints labelled
//   heatstrip  N discrete cells colored by state (e.g. 12-month calendar)
//   donut      share-of-whole concentration donut
//   stacked    horizontal 100% stacked composition bar (funnel / distribution)
//   capacity   horizontal magnitude bars (opportunity / ranked board)
//
// Usage:
//   import 'https://cdn.jsdelivr.net/gh/holmhq/cdn@<sha>/libs/ui/poster-charts/v-0.0.1/poster-charts.min.mjs';
//   <poster-chart type="gauge" label="Liabilities" data='{"value":35.5,"unit":"%"}'></poster-chart>
//   // or imperatively:
//   const el = document.createElement('poster-chart');
//   el.type = 'bars'; el.theme = 'kerala'; el.data = {...}; container.append(el);
//
// Theming (set --poster-* on host or any ancestor, or use theme="kerala|slate|ink"):
//   --poster-ink, --poster-ink-soft, --poster-surface, --poster-surface-sunk,
//   --poster-line, --poster-good, --poster-bad, --poster-warn, --poster-accent,
//   --poster-series-0..5, --poster-font, --poster-display-font

export const VERSION = '0.0.1';

const NS = 'http://www.w3.org/2000/svg';

export const PALETTES = Object.freeze({
  kerala: {
    ink: '#15211B', inkSoft: '#5A6B61', surface: '#FFFFFF', surfaceSunk: '#F1EADA',
    line: '#E3DAC6', good: '#1FA463', bad: '#E24536', warn: '#F2A73B', accent: '#0F5132',
    series: ['#138E83', '#E24536', '#F2A73B', '#3E55C6', '#8A4FD6', '#5E6E97'],
  },
  slate: {
    ink: '#F4F7FB', inkSoft: '#9AA8BD', surface: '#161C29', surfaceSunk: '#1F2738',
    line: '#2C3650', good: '#34D399', bad: '#F87171', warn: '#FBBF24', accent: '#60A5FA',
    series: ['#60A5FA', '#F87171', '#FBBF24', '#A78BFA', '#34D399', '#94A3B8'],
  },
  ink: {
    ink: '#111111', inkSoft: '#6B6B6B', surface: '#FFFFFF', surfaceSunk: '#F3F3F1',
    line: '#E2E2DE', good: '#157F4B', bad: '#D33A2C', warn: '#D98A1F', accent: '#111111',
    series: ['#111111', '#D33A2C', '#D98A1F', '#2D5BD0', '#7A45C8', '#5A6470'],
  },
});

const STYLES = `
:host {
  --poster-font: var(--poster-body-font, ui-sans-serif, -apple-system, "Segoe UI", Roboto, system-ui, sans-serif);
  --poster-display-font: var(--poster-num-font, var(--poster-font));
  display: block;
  color: var(--_ink);
  font-family: var(--poster-font);
  container-type: inline-size;
}
:host([hidden]) { display: none; }
* { box-sizing: border-box; }
.plate {
  background: var(--_surface);
  border: 1px solid var(--_line);
  border-radius: 18px;
  overflow: hidden;
  position: relative;
}
:host([bare]) .plate { background: transparent; border: 0; border-radius: 0; }
.strip {
  display: flex; align-items: baseline; justify-content: space-between; gap: 10px;
  padding: 14px 18px 12px;
  border-bottom: 1px solid var(--_line);
  background: linear-gradient(180deg, color-mix(in srgb, var(--_accent) 12%, transparent), transparent);
}
:host([bare]) .strip { background: none; border-bottom: 0; padding: 0 2px 10px; }
.strip .label {
  font-size: .72rem; font-weight: 700; letter-spacing: .09em; text-transform: uppercase;
  color: var(--_ink); margin: 0;
}
.strip .accentbar { height: 3px; width: 34px; border-radius: 3px; background: var(--_accent); margin-top: 6px; }
.strip .source {
  font-size: .64rem; letter-spacing: .04em; color: var(--_ink-soft);
  white-space: nowrap; align-self: flex-start; padding: 2px 8px; border-radius: 999px;
  background: var(--_surface-sunk);
}
.body { padding: 16px 18px 18px; }
:host([bare]) .body { padding: 6px 2px 2px; }
.caption { margin: 12px 2px 0; font-size: .8rem; line-height: 1.45; color: var(--_ink-soft); }
svg { display: block; width: 100%; height: auto; overflow: visible; font-family: inherit; }
text { fill: var(--_ink); }
.num { font-family: var(--poster-display-font); font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
.muted { fill: var(--_ink-soft); }

/* big-number stat */
.stat { display: flex; flex-direction: column; gap: 4px; }
.stat .big {
  font-family: var(--poster-display-font); font-weight: 800; line-height: .92;
  font-size: clamp(2.6rem, 13cqw, 5rem); letter-spacing: -0.035em;
  font-variant-numeric: tabular-nums; color: var(--_accent);
}
.stat .big .unit { font-size: .42em; letter-spacing: -0.01em; color: var(--_ink); margin-left: .12em; }
.stat .sub { font-size: .92rem; color: var(--_ink); font-weight: 600; }
.stat .ctx { font-size: .78rem; color: var(--_ink-soft); }
.delta { align-self: flex-start; margin-top: 4px; font-size: .74rem; font-weight: 700;
  padding: 3px 9px; border-radius: 999px; display: inline-flex; gap: 5px; align-items: center; }
.delta.up { background: color-mix(in srgb, var(--_bad) 16%, transparent); color: var(--_bad); }
.delta.down { background: color-mix(in srgb, var(--_good) 16%, transparent); color: var(--_good); }
.delta.flat { background: var(--_surface-sunk); color: var(--_ink-soft); }

/* legend */
.legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 12px; }
.legend span { display: inline-flex; align-items: center; gap: 6px; font-size: .72rem; color: var(--_ink); font-weight: 600; }
.legend i { width: 11px; height: 11px; border-radius: 3px; display: inline-block; }

/* animations (disabled under reduced motion or .static) */
.pc-bar { transform: scaleY(0); transform-box: fill-box; transform-origin: bottom; }
.pc-cell, .pc-seg { opacity: 0; }
.pc-draw { stroke-dasharray: 1; stroke-dashoffset: 1; }
.dot { opacity: 0; }
.ready .pc-bar { transform: scaleY(1); transition: transform .7s cubic-bezier(.2,.85,.25,1); transition-delay: calc(var(--i, 0) * 55ms); }
.ready .pc-cell, .ready .pc-seg { opacity: 1; transition: opacity .5s ease; transition-delay: calc(var(--i, 0) * 35ms); }
.ready .pc-draw { stroke-dashoffset: 0; transition: stroke-dashoffset .95s cubic-bezier(.4,.6,.2,1); transition-delay: calc(var(--i, 0) * 120ms); }
.ready .dot { opacity: 1; transition: opacity .4s ease; transition-delay: calc(var(--i, 0) * 120ms + .6s); }
:host(.static) .pc-bar, .static .pc-bar { transform: scaleY(1); }
:host(.static) .pc-cell, :host(.static) .pc-seg, :host(.static) .dot { opacity: 1; }
:host(.static) .pc-draw { stroke-dashoffset: 0; }
@media (prefers-reduced-motion: reduce) {
  .pc-bar { transform: scaleY(1); }
  .pc-cell, .pc-seg, .dot { opacity: 1; }
  .pc-draw { stroke-dashoffset: 0; }
  .ready .pc-bar, .ready .pc-cell, .ready .pc-seg, .ready .pc-draw, .ready .dot { transition: none; }
}
`;

/* ---------- helpers ---------- */

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function fmt(n, decimals) {
  const v = num(n);
  const d = decimals == null
    ? (Math.abs(v) >= 100 || Number.isInteger(v) ? 0 : (Math.abs(v) >= 10 ? 1 : 2))
    : decimals;
  try {
    return new Intl.NumberFormat('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  } catch (_e) {
    return v.toFixed(d);
  }
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function polar(cx, cy, r, deg) {
  const a = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arc(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, r, endDeg);
  const [x2, y2] = polar(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`;
}

// counter spec collected during render → animated after mount
function counterTag(value, { prefix = '', suffix = '', decimals = null, cls = 'num', extra = '' } = {}) {
  return `<tspan class="pc-count ${cls}"${extra} data-to="${num(value)}" data-prefix="${esc(prefix)}" data-suffix="${esc(suffix)}"${decimals != null ? ` data-dec="${decimals}"` : ''}>${esc(prefix)}0${esc(suffix)}</tspan>`;
}

/* ---------- per-type renderers (return SVG inner markup) ---------- */

function renderStat(cfg, P) {
  const value = cfg.value;
  const display = cfg.display != null ? esc(cfg.display) : null;
  const unit = cfg.unit ? `<span class="unit">${esc(cfg.unit)}</span>` : '';
  let bigInner;
  if (display != null) {
    bigInner = display + unit;
  } else {
    bigInner = `<span class="pc-count" data-to="${num(value)}" data-prefix="${esc(cfg.prefix || '')}" data-suffix="${esc(cfg.suffix || '')}"${cfg.decimals != null ? ` data-dec="${cfg.decimals}"` : ''}>${esc(cfg.prefix || '')}0${esc(cfg.suffix || '')}</span>${unit}`;
  }
  let delta = '';
  if (cfg.delta != null) {
    const dir = cfg.deltaDir || (num(cfg.delta) > 0 ? 'up' : num(cfg.delta) < 0 ? 'down' : 'flat');
    const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '■';
    delta = `<span class="delta ${dir}">${arrow} ${esc(cfg.delta)}</span>`;
  }
  return `<div class="stat">
    <div class="big">${bigInner}</div>
    ${cfg.sub ? `<div class="sub">${esc(cfg.sub)}</div>` : ''}
    ${cfg.context ? `<div class="ctx">${esc(cfg.context)}</div>` : ''}
    ${delta}
  </div>`;
}

function renderGauge(cfg, P, accent) {
  const max = num(cfg.max, 100);
  const value = num(cfg.value);
  const frac = clamp(value / (max || 1), 0, 1);
  const over = value > max;
  const W = 240, H = 168, cx = W / 2, cy = 120, r = 86;
  const start = -120, sweep = 240;
  const col = over ? P.bad : (cfg.color || accent);
  const track = arc(cx, cy, r, start, start + sweep);
  const fillArc = arc(cx, cy, r, start, start + sweep * frac);
  const unit = cfg.unit || '';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label || 'gauge')}: ${fmt(value)}${esc(unit)}">
    <path d="${track}" fill="none" stroke="${P.surfaceSunk}" stroke-width="16" stroke-linecap="round"/>
    <path class="pc-draw" pathLength="1" d="${fillArc}" fill="none" stroke="${col}" stroke-width="16" stroke-linecap="round"/>
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="num" font-size="44" fill="${col}">${counterTag(value, { suffix: unit, decimals: cfg.decimals })}</text>
    ${cfg.label ? `<text x="${cx}" y="${cy + 22}" text-anchor="middle" class="muted" font-size="13" font-weight="600">${esc(cfg.label)}</text>` : ''}
    ${cfg.target != null ? `<text x="${cx}" y="${H - 6}" text-anchor="middle" class="muted" font-size="11">target ${esc(cfg.target)}${esc(unit)}</text>` : ''}
  </svg>`;
}

function renderBars(cfg, P, accent) {
  const groups = Array.isArray(cfg.groups) ? cfg.groups : [];
  const unit = cfg.unit || '';
  const allVals = groups.flatMap(g => (g.bars || []).map(b => num(b.value)))
    .concat(groups.map(g => num(g.target)).filter(Number.isFinite));
  const max = cfg.max != null ? num(cfg.max) : Math.max(1, ...allVals) * 1.15;
  const W = 320, H = 220, padL = 8, padR = 8, padB = 42, padT = 14;
  const plotH = H - padB - padT, plotW = W - padL - padR;
  const gw = plotW / Math.max(1, groups.length);
  const y = v => padT + plotH * (1 - clamp(v / max, 0, 1));
  let i = 0;
  const parts = groups.map((g, gi) => {
    const bars = g.bars || [];
    const innerW = gw * 0.72;
    const bw = innerW / Math.max(1, bars.length);
    const gx = padL + gi * gw + (gw - innerW) / 2;
    const barsSvg = bars.map((b, bi) => {
      const col = b.color || P.series[bi % P.series.length];
      const bx = gx + bi * bw;
      const by = y(num(b.value));
      const bh = (padT + plotH) - by;
      const lbl = `<text x="${bx + bw / 2}" y="${by - 7}" text-anchor="middle" class="num" font-size="15" fill="${col}">${counterTag(b.value, { suffix: unit, decimals: cfg.decimals })}</text>`;
      const rect = `<rect class="pc-bar" style="--i:${i++}" x="${bx + bw * 0.12}" y="${by}" width="${bw * 0.76}" height="${Math.max(0, bh)}" rx="5" fill="${col}"/>`;
      return rect + lbl;
    }).join('');
    let targetLine = '';
    if (g.target != null) {
      const ty = y(num(g.target));
      targetLine = `<line x1="${padL + gi * gw + 4}" y1="${ty}" x2="${padL + gi * gw + gw - 4}" y2="${ty}" stroke="${P.ink}" stroke-width="2" stroke-dasharray="4 3" opacity="0.7"/>
        <text x="${padL + gi * gw + gw - 6}" y="${ty - 4}" text-anchor="end" class="muted" font-size="10">${esc(g.targetLabel || 'target')}</text>`;
    }
    const cap = `<text x="${padL + gi * gw + gw / 2}" y="${H - 22}" text-anchor="middle" class="muted" font-size="11" font-weight="600">${esc(g.label || '')}</text>`;
    return barsSvg + targetLine + cap;
  }).join('');
  const legend = (cfg.legend || []).length
    ? `<div class="legend">${cfg.legend.map((l, li) => `<span><i style="background:${l.color || P.series[li % P.series.length]}"></i>${esc(l.label)}</span>`).join('')}</div>`
    : '';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label || 'bar chart')}">
    <line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" stroke="${P.line}" stroke-width="1.5"/>
    ${parts}
  </svg>${legend}`;
}

function renderSlope(cfg, P) {
  const lines = Array.isArray(cfg.lines) ? cfg.lines : [];
  const unit = cfg.unit || '';
  const vals = lines.flatMap(l => [num(l.from), num(l.to)]);
  const max = Math.max(1, ...vals) * 1.1;
  const min = Math.min(0, ...vals);
  const W = 320, H = 210, padT = 22, padB = 34, padX = 64;
  const plotH = H - padT - padB;
  const x1 = padX, x2 = W - padX;
  const y = v => padT + plotH * (1 - (v - min) / (max - min || 1));
  let i = 0;
  const series = lines.map((l, li) => {
    const col = l.color || P.series[li % P.series.length];
    const ya = y(num(l.from)), yb = y(num(l.to));
    const idx = i++;
    return `<g style="--i:${idx}">
      <path class="pc-draw" pathLength="1" d="M ${x1} ${ya} L ${x2} ${yb}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round"/>
      <circle class="dot" style="--i:${idx}" cx="${x1}" cy="${ya}" r="4.5" fill="${col}"/>
      <circle class="dot" style="--i:${idx}" cx="${x2}" cy="${yb}" r="4.5" fill="${col}"/>
      <text class="dot" style="--i:${idx}" x="${x1 - 8}" y="${ya + 4}" text-anchor="end" class="num" font-size="13" fill="${col}">${fmt(l.from, cfg.decimals)}${esc(unit)}</text>
      <text class="dot" style="--i:${idx}" x="${x2 + 8}" y="${yb + 4}" class="num" font-size="13" fill="${col}">${fmt(l.to, cfg.decimals)}${esc(unit)}</text>
    </g>`;
  }).join('');
  const labels = `<text x="${x1}" y="${H - 12}" text-anchor="middle" class="muted" font-size="11" font-weight="600">${esc(cfg.fromLabel || '')}</text>
    <text x="${x2}" y="${H - 12}" text-anchor="middle" class="muted" font-size="11" font-weight="600">${esc(cfg.toLabel || '')}</text>`;
  const legend = lines.length > 1
    ? `<div class="legend">${lines.map((l, li) => `<span><i style="background:${l.color || P.series[li % P.series.length]}"></i>${esc(l.label)}</span>`).join('')}</div>`
    : '';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label || 'slope chart')}">
    <line x1="${x1}" y1="${padT - 6}" x2="${x1}" y2="${padT + plotH + 6}" stroke="${P.line}" stroke-width="1.5"/>
    <line x1="${x2}" y1="${padT - 6}" x2="${x2}" y2="${padT + plotH + 6}" stroke="${P.line}" stroke-width="1.5"/>
    ${series}${labels}
  </svg>${legend}`;
}

function renderHeatstrip(cfg, P) {
  const cells = Array.isArray(cfg.cells) ? cfg.cells : [];
  const legend = Array.isArray(cfg.legend) ? cfg.legend : [];
  const stateColor = {};
  legend.forEach(l => { stateColor[l.state] = l.color; });
  const cols = cfg.columns || Math.min(12, cells.length || 1);
  const rows = Math.ceil(cells.length / cols);
  const W = 320, gap = 7, pad = 4;
  const cw = (W - pad * 2 - gap * (cols - 1)) / cols;
  const ch = cw;
  const H = pad * 2 + rows * ch + (rows - 1) * gap + 18;
  let i = 0;
  const cellSvg = cells.map((c, ci) => {
    const r = Math.floor(ci / cols), col = ci % cols;
    const x = pad + col * (cw + gap), yy = pad + r * (ch + gap);
    const fill = c.color || stateColor[c.state] || P.surfaceSunk;
    return `<g class="pc-cell" style="--i:${i++}">
      <rect x="${x}" y="${yy}" width="${cw}" height="${ch}" rx="6" fill="${fill}"/>
      ${c.label ? `<text x="${x + cw / 2}" y="${yy + ch / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${c.textColor || '#fff'}">${esc(c.label)}</text>` : ''}
    </g>`;
  }).join('');
  const leg = legend.length
    ? `<div class="legend">${legend.map(l => `<span><i style="background:${l.color}"></i>${esc(l.label)}</span>`).join('')}</div>`
    : '';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label || 'heat strip')}">${cellSvg}</svg>${leg}`;
}

function renderDonut(cfg, P) {
  const segs = Array.isArray(cfg.segments) ? cfg.segments : [];
  const total = segs.reduce((s, x) => s + num(x.value), 0) || 1;
  const W = 240, H = 200, cx = W / 2, cy = 96, r = 74, sw = 26;
  let angle = 0, i = 0;
  const segSvg = segs.map((s, si) => {
    const frac = num(s.value) / total;
    const a0 = angle, a1 = angle + frac * 360;
    angle = a1;
    const col = s.color || P.series[si % P.series.length];
    return `<path class="pc-draw" pathLength="1" style="--i:${i++}" d="${arc(cx, cy, r, a0, a1)}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="butt"/>`;
  }).join('');
  const center = cfg.centerValue != null
    ? `<text x="${cx}" y="${cy - 2}" text-anchor="middle" class="num" font-size="40" fill="${cfg.centerColor || P.ink}">${counterTag(cfg.centerValue, { suffix: cfg.centerUnit || '', decimals: cfg.decimals })}</text>
       ${cfg.centerLabel ? `<text x="${cx}" y="${cy + 20}" text-anchor="middle" class="muted" font-size="12" font-weight="600">${esc(cfg.centerLabel)}</text>` : ''}`
    : '';
  const leg = `<div class="legend">${segs.map((s, si) => `<span><i style="background:${s.color || P.series[si % P.series.length]}"></i>${esc(s.label)}${s.showValue !== false ? ` · ${fmt(s.value, cfg.decimals)}${esc(cfg.unit || '')}` : ''}</span>`).join('')}</div>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label || 'donut chart')}">${segSvg}${center}</svg>${leg}`;
}

function renderStacked(cfg, P) {
  const segs = Array.isArray(cfg.segments) ? cfg.segments : [];
  const total = segs.reduce((s, x) => s + num(x.value), 0) || 1;
  const W = 320, H = 64, pad = 2, barH = 40, y = 8, radius = 8;
  let x = pad, i = 0;
  const segSvg = segs.map((s, si) => {
    const frac = num(s.value) / total;
    const w = frac * (W - pad * 2);
    const col = s.color || P.series[si % P.series.length];
    const seg = `<g class="pc-seg" style="--i:${i++}">
      <rect x="${x}" y="${y}" width="${Math.max(0, w - 1.5)}" height="${barH}" rx="4" fill="${col}"/>
      ${w > 42 ? `<text x="${x + w / 2}" y="${y + barH / 2 + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="${s.textColor || '#fff'}" class="num">${fmt(s.value, cfg.decimals)}${esc(cfg.unit || '')}</text>` : ''}
    </g>`;
    x += w;
    return seg;
  }).join('');
  const leg = `<div class="legend">${segs.map((s, si) => `<span><i style="background:${s.color || P.series[si % P.series.length]}"></i>${esc(s.label)}</span>`).join('')}</div>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label || 'stacked bar')}">${segSvg}</svg>${leg}`;
}

function renderCapacity(cfg, P, accent) {
  const items = Array.isArray(cfg.items) ? cfg.items : [];
  const unit = cfg.unit || '';
  const max = cfg.max != null ? num(cfg.max) : Math.max(1, ...items.map(it => num(it.value)));
  const rowH = 46, padT = 4, W = 320, labelW = 0;
  const H = padT * 2 + items.length * rowH;
  let i = 0;
  const rows = items.map((it, ii) => {
    const y = padT + ii * rowH;
    const w = clamp(num(it.value) / (max || 1), 0, 1) * (W - 4);
    const col = it.color || accent || P.series[ii % P.series.length];
    return `<g>
      <text x="2" y="${y + 13}" font-size="12.5" font-weight="700" fill="${P.ink}">${esc(it.label)}</text>
      <rect x="2" y="${y + 18}" width="${W - 4}" height="16" rx="8" fill="${P.surfaceSunk}"/>
      <rect class="pc-bar" style="--i:${i++}; transform-origin: left;" x="2" y="${y + 18}" width="${Math.max(2, w)}" height="16" rx="8" fill="${col}"/>
      <text x="${W - 4}" y="${y + 13}" text-anchor="end" class="num" font-size="13.5" fill="${col}">${counterTag(it.value, { suffix: unit, decimals: cfg.decimals })}</text>
    </g>`;
  }).join('');
  // capacity bars grow horizontally — override the vertical bar transform
  return `<style>:host(.cap-h) .pc-bar, .cap-h .pc-bar{transform:scaleX(0);transform-origin:left}.cap-h.ready .pc-bar{transform:scaleX(1)}</style>
    <svg class="cap-h" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label || 'capacity bars')}">${rows}</svg>`;
}

const RENDERERS = {
  stat: renderStat, gauge: renderGauge, bars: renderBars, slope: renderSlope,
  heatstrip: renderHeatstrip, donut: renderDonut, stacked: renderStacked, capacity: renderCapacity,
};

/* ---------- element ---------- */

export class PosterChart extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'theme', 'accent', 'data', 'label', 'caption', 'source', 'animate', 'bare'];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._data = null;
    this._io = null;
    this._raf = 0;
    this._fallback = 0;
    this._done = false;
  }

  connectedCallback() { this._render(); this._observe(); }
  disconnectedCallback() {
    if (this._io) this._io.disconnect();
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._fallback) clearTimeout(this._fallback);
  }
  attributeChangedCallback() { if (this.isConnected) this._render(); }

  set data(v) {
    this._data = typeof v === 'string' ? safeParse(v) : v;
    if (this.isConnected) this._render();
  }
  get data() {
    if (this._data) return this._data;
    return safeParse(this.getAttribute('data')) || {};
  }
  set type(v) { this.setAttribute('type', v); }
  get type() { return this.getAttribute('type') || 'stat'; }
  set theme(v) { this.setAttribute('theme', v); }
  get theme() { return this.getAttribute('theme') || 'kerala'; }

  _palette() {
    const base = PALETTES[this.theme] || PALETTES.kerala;
    return base;
  }

  _render() {
    const P = this._palette();
    const accent = this.getAttribute('accent') || P.accent;
    const type = this.type;
    const cfg = this.data || {};
    const renderer = RENDERERS[type] || renderStat;

    const cssVars = `
      --_ink: var(--poster-ink, ${P.ink});
      --_ink-soft: var(--poster-ink-soft, ${P.inkSoft});
      --_surface: var(--poster-surface, ${P.surface});
      --_surface-sunk: var(--poster-surface-sunk, ${P.surfaceSunk});
      --_line: var(--poster-line, ${P.line});
      --_good: var(--poster-good, ${P.good});
      --_bad: var(--poster-bad, ${P.bad});
      --_warn: var(--poster-warn, ${P.warn});
      --_accent: var(--poster-accent, ${accent});
    `;
    const label = this.getAttribute('label');
    const source = this.getAttribute('source');
    const caption = this.getAttribute('caption');

    const strip = (label || source)
      ? `<div class="strip"><div>${label ? `<p class="label">${esc(label)}</p><div class="accentbar"></div>` : ''}</div>${source ? `<span class="source">${esc(source)}</span>` : ''}</div>`
      : '';

    let body;
    try {
      body = renderer(cfg, P, accent);
    } catch (e) {
      body = `<div class="caption">chart error: ${esc(e && e.message)}</div>`;
    }

    this._root.innerHTML = `<style>:host{${cssVars}}${STYLES}</style>
      <div class="plate">
        ${strip}
        <div class="body" part="body">${body}${caption ? `<p class="caption">${esc(caption)}</p>` : ''}</div>
      </div>`;
  }

  _reduceMotion() {
    return this.getAttribute('animate') === 'off'
      || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  _observe() {
    const trigger = () => this._animateIn();
    if (this._reduceMotion() || typeof IntersectionObserver === 'undefined') {
      // mark ready synchronously so static layout is correct
      requestAnimationFrame(trigger);
      return;
    }
    this._io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { trigger(); break; }
      }
    }, { threshold: 0.2 });
    this._io.observe(this);
    // Safety net: content must never stay hidden if IO never fires (off-screen
    // in a non-scrolling context, inside a collapsed/hidden ancestor, etc.).
    this._fallback = setTimeout(trigger, 2200);
  }

  _animateIn() {
    if (this._done) return;
    this._done = true;
    if (this._io) this._io.disconnect();
    if (this._fallback) { clearTimeout(this._fallback); this._fallback = 0; }
    const svgs = this._root.querySelectorAll('svg');
    const plate = this._root.querySelector('.plate');
    if (plate) plate.classList.add('ready');
    svgs.forEach(s => s.classList.add('ready'));
    if (this._reduceMotion()) {
      this._root.querySelectorAll('.pc-count').forEach(el => this._setCount(el, readTo(el)));
      svgs.forEach(s => s.classList.add('ready'));
      return;
    }
    this._countUp();
  }

  _setCount(el, value) {
    const pre = el.getAttribute('data-prefix') || '';
    const suf = el.getAttribute('data-suffix') || '';
    const dec = el.hasAttribute('data-dec') ? Number(el.getAttribute('data-dec')) : null;
    el.textContent = `${pre}${fmt(value, dec)}${suf}`;
  }

  _countUp() {
    const els = Array.from(this._root.querySelectorAll('.pc-count'));
    if (!els.length) return;
    const dur = 650;
    const start = performance.now();
    const tick = (now) => {
      const t = clamp((now - start) / dur, 0, 1);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      for (const el of els) this._setCount(el, readTo(el) * e);
      if (t < 1) this._raf = requestAnimationFrame(tick);
      else for (const el of els) this._setCount(el, readTo(el));
    };
    this._raf = requestAnimationFrame(tick);
  }
}

function readTo(el) { return num(el.getAttribute('data-to')); }
function safeParse(s) { if (!s) return null; try { return JSON.parse(s); } catch (_e) { return null; } }

export function definePosterChart(tagName = 'poster-chart') {
  if (typeof customElements === 'undefined') return undefined;
  if (!customElements.get(tagName)) customElements.define(tagName, PosterChart);
  return customElements.get(tagName);
}

export function createPosterChart(options = {}) {
  if (typeof document === 'undefined') throw new Error('createPosterChart() requires a browser document');
  const tag = options.tagName || 'poster-chart';
  definePosterChart(tag);
  const el = document.createElement(tag);
  if (options.type) el.setAttribute('type', options.type);
  if (options.theme) el.setAttribute('theme', options.theme);
  if (options.accent) el.setAttribute('accent', options.accent);
  if (options.label) el.setAttribute('label', options.label);
  if (options.source) el.setAttribute('source', options.source);
  if (options.caption) el.setAttribute('caption', options.caption);
  if (options.bare) el.setAttribute('bare', '');
  if (options.data) el.data = options.data;
  return el;
}

definePosterChart();

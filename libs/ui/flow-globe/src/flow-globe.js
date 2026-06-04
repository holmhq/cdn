// flow-globe v0.0.1 — configurable animated geospatial flow map.
//
// Adapted from amCharts' "Map Sankey Chart: Global Coffee Supply Chain"
// (https://codepen.io/amcharts/pen/OPRwxBd), MIT licensed in the local
// CodePen export. This component does not mirror amCharts; by default it
// lazy-loads amCharts from cdn.amcharts.com, or it can use already-present
// globals when auto-load="false".

export const VERSION = '0.0.1';

export const DEFAULT_FLOWS = Object.freeze([
  { sourceId: 'BR', targetId: 'DE', value: 350 },
  { sourceId: 'BR', targetId: 'US', value: 450 },
  { sourceId: 'BR', targetId: 'IT', value: 200 },
  { sourceId: 'VN', targetId: 'DE', value: 200 },
  { sourceId: 'VN', targetId: 'BE', value: 150 },
  { sourceId: 'CO', targetId: 'US', value: 250 },
  { sourceId: 'CO', targetId: 'DE', value: 80 },
  { sourceId: 'ET', targetId: 'DE', value: 60 },
  { sourceId: 'ET', targetId: 'BE', value: 40 },
  { sourceId: 'ID', targetId: 'US', value: 80 },
  { sourceId: 'HN', targetId: 'DE', value: 60 },
  { sourceId: 'HN', targetId: 'BE', value: 40 },
  { sourceId: 'DE', targetId: 'FR', value: 150 },
  { sourceId: 'DE', targetId: 'PL', value: 100 },
  { sourceId: 'DE', targetId: 'SE', value: 80 },
  { sourceId: 'DE', targetId: 'RU', value: 120 },
  { sourceId: 'BE', targetId: 'GB', value: 100 },
  { sourceId: 'BE', targetId: 'NL', value: 80 },
  { sourceId: 'IT', targetId: 'GR', value: 50 },
  { sourceId: 'IT', targetId: 'AT', value: 40 },
  { sourceId: 'US', targetId: 'CA', value: 120 },
  { sourceId: 'US', targetId: 'JP', value: 80 },
]);

export const DEFAULT_COUNTRY_NAMES = Object.freeze({
  BR: 'Brazil', VN: 'Vietnam', CO: 'Colombia', ET: 'Ethiopia', ID: 'Indonesia', HN: 'Honduras',
  DE: 'Germany', BE: 'Belgium', IT: 'Italy', US: 'United States', FR: 'France', PL: 'Poland',
  SE: 'Sweden', RU: 'Russia', GB: 'United Kingdom', NL: 'Netherlands', GR: 'Greece', AT: 'Austria',
  CA: 'Canada', JP: 'Japan',
});

const SCRIPT_URLS = Object.freeze([
  'https://cdn.amcharts.com/lib/5/index.js',
  'https://cdn.amcharts.com/lib/5/map.js',
  'https://cdn.amcharts.com/lib/5/geodata/worldLow.js',
  'https://cdn.amcharts.com/lib/5/themes/Animated.js',
]);

const PALETTES = Object.freeze({
  coffee: {
    background: '#f0e6d6', water: '#ede4d4', land: '#f5ece0', stroke: '#c4956a', graticule: '#8b5e3c',
    flow: '#8b5e3c', node: '#3c1e0e', nodeStroke: '#e8d5b7', producer: '#8fae7e', hub: '#c4a878', consumer: '#ddc8a0',
    title: '#3c1e0e', subtitle: '#8b5e3c', bullet: '#3c1e0e', bulletStroke: '#5c3a1e', ui: '#8b5e3c', uiText: '#f5ece0',
  },
  ocean: {
    background: '#071923', water: '#082f49', land: '#dff7ff', stroke: '#38bdf8', graticule: '#7dd3fc',
    flow: '#22d3ee', node: '#ecfeff', nodeStroke: '#0891b2', producer: '#4ade80', hub: '#fde68a', consumer: '#93c5fd',
    title: '#e0f2fe', subtitle: '#7dd3fc', bullet: '#f0fdfa', bulletStroke: '#14b8a6', ui: '#0891b2', uiText: '#ecfeff',
  },
  ember: {
    background: '#1f130f', water: '#2b1812', land: '#fee2b3', stroke: '#fb923c', graticule: '#f97316',
    flow: '#fb923c', node: '#fff7ed', nodeStroke: '#ea580c', producer: '#facc15', hub: '#fdba74', consumer: '#fecaca',
    title: '#ffedd5', subtitle: '#fdba74', bullet: '#fff7ed', bulletStroke: '#dc2626', ui: '#ea580c', uiText: '#fff7ed',
  },
  slate: {
    background: '#111827', water: '#1f2937', land: '#e5e7eb', stroke: '#94a3b8', graticule: '#64748b',
    flow: '#a78bfa', node: '#f8fafc', nodeStroke: '#8b5cf6', producer: '#86efac', hub: '#c4b5fd', consumer: '#bfdbfe',
    title: '#f8fafc', subtitle: '#cbd5e1', bullet: '#f8fafc', bulletStroke: '#7c3aed', ui: '#7c3aed', uiText: '#ffffff',
  },
});

const STYLES = `
:host {
  --flow-globe-height: 560px;
  --flow-globe-radius: 18px;
  --flow-globe-shadow: 0 18px 60px rgba(0, 0, 0, 0.18);
  display: block;
  min-height: 240px;
}
:host([hidden]) { display: none; }
.wrapper {
  border-radius: var(--flow-globe-radius);
  box-shadow: var(--flow-globe-shadow);
  height: var(--flow-globe-height);
  min-height: 240px;
  overflow: hidden;
  position: relative;
  width: 100%;
}
.chart { height: 100%; width: 100%; }
.status {
  align-items: center;
  background: color-mix(in srgb, Canvas 88%, transparent);
  color: CanvasText;
  display: flex;
  font: 14px/1.4 system-ui, sans-serif;
  inset: 0;
  justify-content: center;
  padding: 24px;
  position: absolute;
  text-align: center;
}
.status[hidden] { display: none; }
`;

let loadPromise;

export function loadAmCharts() {
  if (hasAmCharts()) return Promise.resolve(getAmCharts());
  if (!loadPromise) {
    loadPromise = SCRIPT_URLS.reduce((promise, url) => promise.then(() => loadScript(url)), Promise.resolve())
      .then(() => {
        if (!hasAmCharts()) throw new Error('amCharts globals did not load');
        return getAmCharts();
      });
  }
  return loadPromise;
}

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
    return ['title', 'subtitle', 'theme', 'height', 'projection', 'auto-rotate', 'controls', 'bullets', 'data', 'data-url', 'country-names', 'producers', 'hubs', 'consumers', 'value-suffix', 'auto-load'];
  }

  constructor() {
    super();
    this._flows = null;
    this._countryNames = null;
    this._root = null;
    this._rotationAnimation = null;
    this._renderId = 0;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${STYLES}</style><div class="wrapper"><div class="chart"></div><div class="status">Loading map…</div></div>`;
  }

  connectedCallback() { this.refresh(); }
  disconnectedCallback() { this.disposeChart(); }

  attributeChangedCallback() {
    if (this.isConnected) this.refresh();
  }

  get data() { return (this._flows || DEFAULT_FLOWS).map(flow => ({ ...flow })); }
  set data(flows) { this._flows = normalizeFlows(flows); this.refresh(); }

  get countryNames() { return { ...DEFAULT_COUNTRY_NAMES, ...(this._countryNames || {}) }; }
  set countryNames(names) { this._countryNames = names && typeof names === 'object' ? { ...names } : null; this.refresh(); }

  configure(options = {}) { applyOptions(this, options); return this; }
  setData(flows) { this.data = flows; return this; }

  async refresh() {
    const id = ++this._renderId;
    this._setStatus('Loading map…');
    try {
      if (this.getAttribute('data-url')) {
        const response = await fetch(this.getAttribute('data-url'));
        if (!response.ok) throw new Error(`failed to load data-url: ${response.status}`);
        this._flows = normalizeFlows(await response.json());
      }
      const libs = this.getAttribute('auto-load') === 'false' ? getAmCharts() : await loadAmCharts();
      if (id !== this._renderId || !this.isConnected) return;
      this._renderChart(libs);
      this._setStatus('');
    } catch (error) {
      this._setStatus(`flow-globe: ${error.message}`);
    }
  }

  disposeChart() {
    this._rotationAnimation?.stop?.();
    this._rotationAnimation = null;
    this._root?.dispose?.();
    this._root = null;
  }

  _renderChart({ am5, am5map, am5geodata_worldLow, am5themes_Animated }) {
    this.disposeChart();
    this.style.setProperty('--flow-globe-height', cssLength(this.getAttribute('height'), '560px'));

    const container = this.shadowRoot.querySelector('.chart');
    const palette = this._palette();
    const flows = normalizeFlows(this.getAttribute('data') || this._flows || DEFAULT_FLOWS);
    const countryNames = { ...DEFAULT_COUNTRY_NAMES, ...parseObject(this.getAttribute('country-names')), ...(this._countryNames || {}) };
    const { producers, hubs, consumers } = this._groups(flows);
    const valueSuffix = this.getAttribute('value-suffix') || 'k tonnes';
    const title = this.getAttribute('title') || 'Global Coffee Supply Chain';
    const subtitle = this.getAttribute('subtitle') || '(Thousands of tonnes)';

    const root = this._root = am5.Root.new(container);
    const theme = am5.Theme.new(root);
    theme.rule('InterfaceColors').setAll({
      primaryButton: am5.color(toNumberColor(palette.ui)),
      primaryButtonHover: am5.color(toNumberColor(palette.flow)),
      primaryButtonText: am5.color(toNumberColor(palette.uiText)),
      background: am5.color(toNumberColor(palette.background)),
      text: am5.color(toNumberColor(palette.title)),
    });
    root.setThemes([am5themes_Animated.new(root), theme]);

    root.container.set('background', am5.Rectangle.new(root, {
      fill: am5.color(toNumberColor(palette.background)),
      fillPattern: am5.GrainPattern.new(root, {
        density: 0.32,
        maxOpacity: 0.06,
        colors: [am5.color(0x000000)],
      }),
    }));

    const projection = this.getAttribute('projection') === 'map' ? 'map' : 'globe';
    const chart = root.container.children.push(am5map.MapChart.new(root, {
      panX: projection === 'map' ? 'translateX' : 'rotateX',
      panY: projection === 'map' ? 'translateY' : 'rotateY',
      projection: projection === 'map' ? am5map.geoMercator() : am5map.geoOrthographic(),
      rotationX: projection === 'map' ? 0 : -15,
      rotationY: projection === 'map' ? 0 : -20,
      minZoomLevel: projection === 'map' ? 1 : 0.5,
      zoomLevel: projection === 'map' ? 1.7 : 0.9,
    }));

    const bgSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
    bgSeries.mapPolygons.template.setAll({ fill: am5.color(toNumberColor(palette.water)), fillOpacity: projection === 'map' ? 0 : 1, strokeOpacity: 0 });
    bgSeries.data.push({ geometry: am5map.getGeoRectangle(90, 180, -90, -180) });

    const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
    graticuleSeries.mapLines.template.setAll({ stroke: am5.color(toNumberColor(palette.graticule)), strokeOpacity: 0.18, strokeWidth: 0.5 });

    const polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_worldLow }));
    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(toNumberColor(palette.land)),
      stroke: am5.color(toNumberColor(palette.stroke)),
      strokeWidth: 0.5,
      strokeOpacity: 0.55,
    });
    polygonSeries.events.on('datavalidated', () => {
      am5.array.each(polygonSeries.dataItems, (di) => {
        const id = di.get('id');
        if (id && producers.includes(id)) di.get('mapPolygon').setAll({ fill: am5.color(toNumberColor(palette.producer)) });
        else if (id && hubs.includes(id)) di.get('mapPolygon').setAll({ fill: am5.color(toNumberColor(palette.hub)) });
        else if (id && consumers.includes(id)) di.get('mapPolygon').setAll({ fill: am5.color(toNumberColor(palette.consumer)) });
      });
    });

    const sankeySeries = chart.series.push(am5map.MapSankeySeries.new(root, {
      polygonSeries,
      maxWidth: Number(this.getAttribute('max-width')) || 2,
      controlPointDistance: Number(this.getAttribute('curve')) || 0.4,
      resolution: 60,
      nodePadding: 0.3,
    }));
    sankeySeries.mapPolygons.template.setAll({
      fill: am5.color(toNumberColor(palette.flow)),
      fillOpacity: 0.68,
      strokeOpacity: 0,
      tooltipText: `{sourceNode.name} > {targetNode.name}\n{value}${valueSuffix ? ' ' + valueSuffix : ''}`,
    });
    sankeySeries.nodes.mapPolygons.template.setAll({
      fill: am5.color(toNumberColor(palette.node)),
      stroke: am5.color(toNumberColor(palette.nodeStroke)),
      strokeWidth: 1.5,
      fillOpacity: 0.95,
      strokeOpacity: 1,
      tooltipText: `{name}\n{sum}${valueSuffix ? ' ' + valueSuffix : ''}`,
    });

    if (this.getAttribute('bullets') !== 'false') addBullets({ root, am5, sankeySeries, palette });
    sankeySeries.data.setAll(flows);
    sankeySeries.events.on('datavalidated', () => {
      am5.array.each(sankeySeries.nodes.dataItems, (di) => {
        const id = di.get('id');
        if (id && countryNames[id]) di.set('name', countryNames[id]);
      });
      animateBullets({ am5, sankeySeries });
    });

    if (title || subtitle) addTitles({ root, am5, chart, palette, title, subtitle });
    if (this.getAttribute('controls') !== 'false') addProjectionToggle({ root, am5, am5map, chart, bgSeries, palette });

    const zoomControl = chart.set('zoomControl', am5map.ZoomControl.new(root, {}));
    zoomControl.homeButton.set('visible', true);

    if (projection !== 'map' && this.getAttribute('auto-rotate') !== 'false') {
      this._rotationAnimation = chart.animate({ key: 'rotationX', from: -15, to: 345, duration: Number(this.getAttribute('rotate-duration')) || 120000, loops: Infinity, easing: am5.ease.linear });
      chart.chartContainer.events.on('pointerdown', () => {
        this._rotationAnimation?.stop?.();
        this._rotationAnimation = null;
      });
    }

    chart.appear(1000, 100);
  }

  _palette() {
    const base = { ...(PALETTES[this.getAttribute('theme')] || PALETTES.coffee) };
    const styles = getComputedStyle(this);
    for (const key of Object.keys(base)) {
      const css = styles.getPropertyValue(`--flow-globe-${kebab(key)}`).trim();
      if (css) base[key] = css;
    }
    return base;
  }

  _groups(flows) {
    const explicitProducers = parseList(this.getAttribute('producers'));
    const explicitHubs = parseList(this.getAttribute('hubs'));
    const explicitConsumers = parseList(this.getAttribute('consumers'));
    if (explicitProducers.length || explicitHubs.length || explicitConsumers.length) {
      return { producers: explicitProducers, hubs: explicitHubs, consumers: explicitConsumers };
    }
    const sources = new Set(flows.map(flow => flow.sourceId));
    const targets = new Set(flows.map(flow => flow.targetId));
    const hubs = [...sources].filter(id => targets.has(id));
    return {
      producers: [...sources].filter(id => !targets.has(id)),
      hubs,
      consumers: [...targets].filter(id => !sources.has(id)),
    };
  }

  _setStatus(message) {
    const status = this.shadowRoot.querySelector('.status');
    status.textContent = message;
    status.hidden = !message;
  }
}

function addBullets({ root, am5, sankeySeries, palette }) {
  sankeySeries.bullets.push(() => am5.Bullet.new(root, {
    locationX: 0,
    autoRotate: true,
    sprite: am5.Graphics.new(root, {
      svgPath: 'M-4,-2.5 C-4,-5 -1.5,-6.5 1,-6.5 C3.5,-6.5 5,-4.5 5,-2 C5,1 3,3.5 0.5,5 C-0.5,5.7 -1.5,5.7 -2.5,5 C-5,3.5 -6,1 -4,-2.5 Z M-1,-5 C-1,-1 -1,2 -0.5,4.5',
      fill: am5.color(toNumberColor(palette.bullet)),
      stroke: am5.color(toNumberColor(palette.bulletStroke)),
      strokeWidth: 0.5,
      centerX: am5.p50,
      centerY: am5.p50,
      scale: 0.35,
      visible: false,
    }),
  }));
}

function animateBullets({ am5, sankeySeries }) {
  am5.array.each(sankeySeries.dataItems, (dataItem) => {
    const bullets = dataItem.bullets;
    if (!bullets) return;
    am5.array.each(bullets, (bullet) => {
      const duration = 3000 + Math.random() * 3000;
      const delay = Math.random() * duration;
      setTimeout(() => {
        const sprite = bullet.get('sprite');
        if (sprite) sprite.set('visible', true);
        bullet.animate({ key: 'locationX', from: 0, to: 1, duration, easing: am5.ease.linear, loops: Infinity });
      }, delay);
    });
  });
}

function addTitles({ root, am5, chart, palette, title, subtitle }) {
  const cont = chart.children.push(am5.Container.new(root, { layout: root.verticalLayout, x: am5.p50, centerX: am5.p50, y: am5.p100, centerY: am5.p100, position: 'absolute', paddingBottom: 16 }));
  if (title) cont.children.push(am5.Label.new(root, { text: title, fontSize: 18, fontWeight: '600', fill: am5.color(toNumberColor(palette.title)), x: am5.p50, centerX: am5.p50 }));
  if (subtitle) cont.children.push(am5.Label.new(root, { text: subtitle, fontSize: 11, fill: am5.color(toNumberColor(palette.subtitle)), x: am5.p50, centerX: am5.p50 }));
}

function addProjectionToggle({ root, am5, am5map, chart, bgSeries, palette }) {
  const cont = chart.children.push(am5.Container.new(root, { layout: root.horizontalLayout, x: 20, y: 40 }));
  cont.children.push(am5.Label.new(root, { centerY: am5.p50, text: 'Globe', fill: am5.color(toNumberColor(palette.title)), fontSize: 13 }));
  const button = cont.children.push(am5.Button.new(root, { themeTags: ['switch'], centerY: am5.p50, icon: am5.Circle.new(root, { themeTags: ['icon'] }) }));
  const easing = am5.ease.inOut(am5.ease.cubic);
  const duration = 1500;
  const fadeDuration = 300;
  button.on('active', () => {
    chart.goHome(duration);
    setTimeout(() => chart.seriesContainer.animate({ key: 'opacity', to: 0, duration: fadeDuration }), duration - fadeDuration);
    setTimeout(() => {
      if (button.get('active')) {
        chart.set('projection', am5map.geoMercator());
        chart.set('panX', 'translateX');
        chart.set('panY', 'translateY');
        chart.animate({ key: 'rotationX', to: 0, duration, easing });
        chart.animate({ key: 'rotationY', to: 0, duration, easing });
        bgSeries.mapPolygons.template.set('fillOpacity', 0);
        chart.set('minZoomLevel', 1);
        chart.animate({ key: 'zoomLevel', to: 1.7, duration, easing });
      } else {
        chart.set('projection', am5map.geoOrthographic());
        chart.set('panX', 'rotateX');
        chart.set('panY', 'rotateY');
        chart.animate({ key: 'rotationX', to: -15, duration, easing });
        chart.animate({ key: 'rotationY', to: -20, duration, easing });
        bgSeries.mapPolygons.template.set('fillOpacity', 1);
        chart.set('minZoomLevel', 0.9);
        chart.animate({ key: 'zoomLevel', to: 0.9, duration, easing });
      }
      chart.seriesContainer.animate({ key: 'opacity', to: 1, duration: fadeDuration });
    }, duration);
  });
  cont.children.push(am5.Label.new(root, { centerY: am5.p50, text: 'Map', fill: am5.color(toNumberColor(palette.title)), fontSize: 13 }));
}

function normalizeFlows(input) {
  if (typeof input === 'string') {
    try { return normalizeFlows(JSON.parse(input)); } catch { return DEFAULT_FLOWS.map(flow => ({ ...flow })); }
  }
  if (!Array.isArray(input)) return DEFAULT_FLOWS.map(flow => ({ ...flow }));
  return input.map(flow => ({ sourceId: String(flow.sourceId || flow.source || ''), targetId: String(flow.targetId || flow.target || ''), value: Number(flow.value) || 0 })).filter(flow => flow.sourceId && flow.targetId && flow.value > 0);
}

function applyOptions(el, options) {
  if (options.data) el.data = options.data;
  if (options.countryNames) el.countryNames = options.countryNames;
  for (const [key, attr] of Object.entries({ title: 'title', subtitle: 'subtitle', theme: 'theme', height: 'height', projection: 'projection', valueSuffix: 'value-suffix', dataUrl: 'data-url' })) {
    if (options[key] != null) el.setAttribute(attr, String(options[key]));
  }
  for (const [key, attr] of Object.entries({ autoRotate: 'auto-rotate', controls: 'controls', bullets: 'bullets', autoLoad: 'auto-load' })) {
    if (options[key] != null) el.setAttribute(attr, String(options[key]));
  }
}

function hasAmCharts() { return typeof window !== 'undefined' && window.am5 && window.am5map && window.am5geodata_worldLow && window.am5themes_Animated; }
function getAmCharts() {
  if (!hasAmCharts()) throw new Error('amCharts globals missing. Load amCharts or allow auto-load.');
  return { am5: window.am5, am5map: window.am5map, am5geodata_worldLow: window.am5geodata_worldLow, am5themes_Animated: window.am5themes_Animated };
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing?.dataset.loaded) return resolve();
    const script = existing || document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
    script.onerror = () => reject(new Error(`failed to load ${src}`));
    if (!existing) document.head.appendChild(script);
  });
}
function parseList(value) { return String(value || '').split(',').map(item => item.trim()).filter(Boolean); }
function parseObject(value) { if (!value) return {}; try { return JSON.parse(value); } catch { return {}; } }
function cssLength(value, fallback) { if (value == null || value === '') return fallback; return /^-?\d+(\.\d+)?$/.test(String(value)) ? `${value}px` : String(value); }
function toNumberColor(value) { return parseInt(String(value).trim().replace(/^#/, '').slice(0, 6), 16) || 0; }
function kebab(value) { return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`); }

defineFlowGlobe();

export default FlowGlobe;

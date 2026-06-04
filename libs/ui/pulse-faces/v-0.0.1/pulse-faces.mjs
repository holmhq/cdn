// pulse-faces v0.0.1 — animated SVG sentiment faces custom element.
//
// Adapted from Misha Heesakkers' "Simple animating emotions"
// (https://codepen.io/MishaHahaha/pen/grzLJy), MIT licensed.
// Converted to a dependency-free ES module + Shadow DOM web component with
// configurable faces, selection mode, labels, sizing, and CSS-variable theming.

export const VERSION = '0.0.1';

export const FACE_KEYS = Object.freeze(['sad', 'neutral', 'fine', 'happy']);

export const DEFAULT_FACES = Object.freeze([
  Object.freeze({ face: 'sad', value: 'sad', label: 'Sad', color: '#E23D18' }),
  Object.freeze({ face: 'neutral', value: 'neutral', label: 'Neutral', color: '#F9AC1B' }),
  Object.freeze({ face: 'fine', value: 'fine', label: 'Fine', color: '#1988E3' }),
  Object.freeze({ face: 'happy', value: 'happy', label: 'Happy', color: '#248C37' }),
]);

const FACE_SET = new Set(FACE_KEYS);
const UID_PREFIX = 'pulsefaces';
let uid = 0;

const STYLES = `
:host {
  --pulse-faces-size: 72px;
  --pulse-faces-gap: 16px;
  --pulse-faces-ink: #2C0E0F;
  --pulse-faces-sad: #E23D18;
  --pulse-faces-neutral: #F9AC1B;
  --pulse-faces-fine: #1988E3;
  --pulse-faces-happy: #248C37;
  --pulse-faces-focus: #8ab4ff;
  --pulse-faces-selected-ring: currentColor;
  --pulse-faces-caption: currentColor;
  --pulse-faces-caption-size: 0.75rem;
  --pulse-faces-caption-gap: 0.4rem;
  --pulse-faces-disabled-opacity: 0.55;
  display: inline-block;
  color: inherit;
}

:host([hidden]) { display: none; }
:host([disabled]) { opacity: var(--pulse-faces-disabled-opacity); }

.faces {
  align-items: center;
  display: inline-flex;
  flex-direction: row;
  gap: var(--pulse-faces-gap);
}

:host([orientation="vertical"]) .faces { align-items: flex-start; flex-direction: column; }

.face-button {
  align-items: center;
  appearance: none;
  background: transparent;
  border: 0;
  border-radius: 999px;
  color: inherit;
  cursor: default;
  display: inline-flex;
  flex-direction: column;
  gap: var(--pulse-faces-caption-gap);
  margin: 0;
  padding: 4px;
  position: relative;
  transition: transform 0.2s ease, filter 0.2s ease;
  -webkit-appearance: none;
}

:host([interactive]) .face-button,
:host([selectable]) .face-button { cursor: pointer; }
:host([label-position="top"]) .face-button { flex-direction: column-reverse; }
:host([label-position="none"]) .caption,
:host(:not([labels]):not([label-position])) .caption { display: none; }

.face-button:focus-visible {
  outline: 2px solid var(--pulse-faces-focus);
  outline-offset: 3px;
}

.face-button[aria-pressed="true"]::after,
.face-button[aria-checked="true"]::after {
  border: 2px solid var(--pulse-faces-selected-ring);
  border-radius: 999px;
  content: "";
  inset: 0;
  opacity: 0.55;
  pointer-events: none;
  position: absolute;
}

:host([interactive]) .face-button:hover,
:host([selectable]) .face-button:hover {
  filter: saturate(1.12) brightness(1.04);
  transform: translateY(-2px) scale(1.04);
}

.face-svg {
  display: block;
  height: var(--pulse-faces-size);
  overflow: visible;
  width: var(--pulse-faces-size);
}

.caption {
  color: var(--pulse-faces-caption);
  display: block;
  font: inherit;
  font-size: var(--pulse-faces-caption-size);
  line-height: 1;
  max-width: calc(var(--pulse-faces-size) * 1.5);
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.face-svg .body { fill: var(--face-color); }
.face-svg .ink { fill: var(--pulse-faces-ink); }
.face-svg .stroke-ink { fill: none; stroke: var(--pulse-faces-ink); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; }

.face-svg.happy .face { animation: pulsefaces-up-down 0.8s ease infinite; }
.face-svg.happy .scale-face { transform: rotate(12deg); transform-origin: 35px 20px; }
.face-svg.sad .face { animation: pulsefaces-left-right 0.4s linear infinite alternate-reverse; }
.face-svg.sad .left-eye,
.face-svg.sad .right-eye {
  animation: pulsefaces-blink 3s linear infinite, pulsefaces-blink-squeeze 3s linear infinite;
  opacity: 1;
  transform-origin: 0 1px;
}
.face-svg.neutral .face { animation: pulsefaces-up-down 6s ease infinite; }
.face-svg.neutral .left-eye,
.face-svg.neutral .right-eye {
  animation: pulsefaces-blink 3s linear infinite 1s, pulsefaces-blink-squeeze-twice 3s linear infinite 1s;
  opacity: 1;
  transform-origin: 0 1px;
}
.face-svg.neutral .mouth { animation: pulsefaces-scale-x 2s ease infinite alternate-reverse; }
.face-svg.fine .face-container { animation: pulsefaces-rotate-left-right 3s infinite; }
.face-svg.fine .face-up-down { animation: pulsefaces-fine-up-down 3s infinite; }
.face-svg.fine .left-eye,
.face-svg.fine .right-eye {
  animation: pulsefaces-blink 3s linear infinite, pulsefaces-blink-squeeze 3s linear infinite;
  opacity: 1;
  transform-origin: 0 1px;
}

:host([paused]) .face-svg *,
:host([animated="false"]) .face-svg * { animation-play-state: paused !important; }

@keyframes pulsefaces-rotate-left-right { 0% { transform: rotate(15deg); } 50% { transform: rotate(-15deg); } 100% { transform: rotate(15deg); } }
@keyframes pulsefaces-fine-up-down { 0%, 50%, 100% { transform: translate(0, 0); } 25%, 75% { transform: translate(0, -1px); } }
@keyframes pulsefaces-up-down { 0% { transform: translate(0, -1px); } 50% { transform: translate(0, 2px); } 100% { transform: translate(0, -1px); } }
@keyframes pulsefaces-left-right { 0% { transform: translate(-1px, 4px); } 100% { transform: translate(1px, 4px); } }
@keyframes pulsefaces-scale-x { 0% { transform: translate(0, 0) scale(1, 1); } 100% { transform: translate(-9px, 0) scale(2, 1); } }
@keyframes pulsefaces-blink { 0%, 45%, 55%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes pulsefaces-blink-squeeze { 0%, 45%, 55%, 100% { transform: scale(1, 1); } 50% { transform: scale(1, 0); } }
@keyframes pulsefaces-blink-squeeze-twice { 0%, 45%, 55%, 65%, 100% { transform: scale(1, 1); } 50%, 60% { transform: scale(1, 0); } }

@media (prefers-reduced-motion: reduce) {
  .face-svg *, .face-button { animation: none !important; transition: none !important; }
}
`;

export function normalizeFaces(input = DEFAULT_FACES) {
  if (typeof input === 'string') return normalizeFaces(parseFacesAttribute(input));
  if (!Array.isArray(input) || input.length === 0) return cloneDefaultFaces();

  return input.map((raw, index) => {
    const source = typeof raw === 'string' ? { face: raw } : (raw || {});
    const fallback = DEFAULT_FACES[index % DEFAULT_FACES.length];
    const face = FACE_SET.has(source.face) ? source.face : fallback.face;
    return {
      ...source,
      face,
      value: source.value == null ? face : String(source.value),
      label: source.label == null ? titleCase(face) : String(source.label),
      color: source.color || `var(--pulse-faces-${face})`,
    };
  });
}

export function definePulseFaces(tagName = 'pulse-faces') {
  if (typeof customElements === 'undefined') return undefined;
  if (!customElements.get(tagName)) customElements.define(tagName, PulseFaces);
  return customElements.get(tagName);
}

export function createPulseFaces(options = {}) {
  if (typeof document === 'undefined') throw new Error('createPulseFaces() requires a browser document');
  const tagName = options.tagName || 'pulse-faces';
  definePulseFaces(tagName);
  const el = document.createElement(tagName);
  applyOptions(el, options);
  return el;
}

export class PulseFaces extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return ['faces', 'value', 'name', 'size', 'gap', 'labels', 'label-position', 'orientation', 'interactive', 'selectable', 'disabled', 'required', 'paused', 'animated'];
  }

  constructor() {
    super();
    this._uid = `${UID_PREFIX}-${++uid}`;
    this._faces = cloneDefaultFaces();
    this._value = '';
    this._internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null;
    this.attachShadow({ mode: 'open' });
    this._onClick = this._onClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this.shadowRoot.addEventListener('click', this._onClick);
    this.shadowRoot.addEventListener('keydown', this._onKeydown);
  }

  connectedCallback() {
    if (this.hasAttribute('faces')) this._faces = normalizeFaces(this.getAttribute('faces'));
    if (this.hasAttribute('value')) this._value = this.getAttribute('value') || '';
    this._render();
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'faces') this._faces = normalizeFaces(newValue || DEFAULT_FACES);
    if (name === 'value') this._value = newValue || '';
    if (this.isConnected) this._render();
  }

  get value() { return this._value; }
  set value(value) { this._setValue(value == null ? '' : String(value), { reflect: true }); }

  get index() { return this._faces.findIndex(face => face.value === this._value); }
  set index(index) { this.value = this._faces[Number(index)]?.value || ''; }

  get selectedItem() { return this._faces[this.index] || null; }

  get faces() { return this._faces.map(face => ({ ...face })); }
  set faces(faces) { this._faces = normalizeFaces(faces); this._render(); }

  configure(options = {}) { applyOptions(this, options); return this; }
  reset({ emit = false } = {}) { this._setValue('', { reflect: true, user: emit }); }
  select(valueOrIndex, { emit = false } = {}) {
    const item = typeof valueOrIndex === 'number' ? this._faces[valueOrIndex] : this._faces.find(face => face.value === String(valueOrIndex));
    this._setValue(item?.value || '', { reflect: true, user: emit });
  }

  _onClick(event) {
    const button = event.target.closest?.('.face-button');
    if (!button || !this.selectable || this.disabled) return;
    this._setValue(button.dataset.value, { reflect: true, user: true, focusIndex: Number(button.dataset.index) });
  }

  _onKeydown(event) {
    const button = event.target.closest?.('.face-button');
    if (!button || !this.selectable || this.disabled) return;
    const current = this.index >= 0 ? this.index : Number(button.dataset.index || 0);
    let next = current;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(this._faces.length - 1, current + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, current - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this._faces.length - 1;
    else if (event.key === ' ' || event.key === 'Enter') {
      this._setValue(button.dataset.value, { reflect: true, user: true, focusIndex: Number(button.dataset.index) });
      event.preventDefault();
      return;
    } else return;
    event.preventDefault();
    this._setValue(this._faces[next]?.value || '', { reflect: true, user: true, focusIndex: next });
  }

  _setValue(value, { reflect = false, user = false, focusIndex } = {}) {
    const next = value && this._faces.some(face => face.value === value) ? value : '';
    const changed = next !== this._value;
    this._value = next;
    if (reflect) {
      if (next) this.setAttribute('value', next);
      else this.removeAttribute('value');
    }
    this._render();
    if (focusIndex != null) this.shadowRoot.querySelector(`[data-index="${focusIndex}"]`)?.focus();
    if (user && changed) {
      const detail = { value: this._value, index: this.index, item: this.selectedItem };
      this.dispatchEvent(new CustomEvent('input', { detail, bubbles: true, composed: true }));
      this.dispatchEvent(new CustomEvent('change', { detail, bubbles: true, composed: true }));
    }
  }

  _render() {
    if (this._value && !this._faces.some(face => face.value === this._value)) this._value = '';
    const selected = this.index;
    const tabindexIndex = selected >= 0 ? selected : 0;
    const role = this.selectable ? 'radiogroup' : 'group';
    const size = cssLength(this.getAttribute('size'), '72px');
    const gap = cssLength(this.getAttribute('gap'), '16px');

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <style>:host{--pulse-faces-size:${escapeCss(size)};--pulse-faces-gap:${escapeCss(gap)};}</style>
      <div class="faces" role="${role}" aria-label="${escapeAttr(this.getAttribute('name') || 'Emotion faces')}">
        ${this._faces.map((face, index) => this._renderFace(face, index, { selected, tabindexIndex })).join('')}
      </div>
    `;
    this._syncForm();
  }

  _renderFace(face, index, state) {
    const selected = index === state.selected;
    const attrs = this.selectable
      ? `role="radio" aria-checked="${selected ? 'true' : 'false'}" tabindex="${index === state.tabindexIndex ? '0' : '-1'}"`
      : `role="img" aria-label="${escapeAttr(face.label)}" tabindex="-1"`;
    return `
      <button class="face-button" type="button" data-value="${escapeAttr(face.value)}" data-index="${index}" style="--face-color:${escapeCss(face.color)}" ${attrs} ${this.disabled ? 'disabled' : ''}>
        ${faceSvg(face.face)}
        <span class="caption">${escapeHtml(face.label)}</span>
      </button>
    `;
  }

  _syncForm() {
    if (!this._internals) return;
    this._internals.setFormValue?.(this._value || null);
    if (this.required && !this._value) this._internals.setValidity?.({ valueMissing: true }, 'Please select an emotion.', this.shadowRoot.querySelector('button') || undefined);
    else this._internals.setValidity?.({});
  }

  get selectable() { return this.hasAttribute('selectable') || this.hasAttribute('interactive'); }
  set selectable(value) { toggleAttr(this, 'selectable', value); }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { toggleAttr(this, 'disabled', value); }

  get required() { return this.hasAttribute('required'); }
  set required(value) { toggleAttr(this, 'required', value); }
}

function faceSvg(face) {
  if (face === 'neutral') return `
    <svg class="face-svg neutral" viewBox="0 0 44 44" aria-hidden="true">
      <circle class="body" cx="22" cy="22" r="22"></circle>
      <g class="face" transform="translate(13 20)" fill="var(--pulse-faces-ink)">
        <g class="mouth" transform="translate(9 5)"><rect x="-2" y="0" width="4" height="2" rx="2"></rect></g>
        <ellipse class="right-eye" cx="16.094" cy="1.75" rx="1.906" ry="1.75"></ellipse>
        <ellipse class="left-eye" cx="1.906" cy="1.75" rx="1.906" ry="1.75"></ellipse>
      </g>
    </svg>`;
  if (face === 'fine') return `
    <svg class="face-svg fine" viewBox="0 0 44 44" aria-hidden="true">
      <circle class="body" cx="22" cy="22" r="22"></circle>
      <g class="face-container" transform="translate(22 32)"><g class="face" transform="translate(-9 -12)"><g class="face-up-down">
        <g class="eyes"><ellipse class="right-eye ink" cx="16.094" cy="1.756" rx="1.906" ry="1.756"></ellipse><ellipse class="left-eye ink" cx="1.906" cy="1.756" rx="1.906" ry="1.756"></ellipse></g>
        <path class="stroke-ink" d="M6.188,4.905 C6.188,5.952 7.487,7 9.09,7 C10.692,7 11.991,5.952 11.991,4.905"></path>
      </g></g></g>
    </svg>`;
  if (face === 'happy') return `
    <svg class="face-svg happy" viewBox="0 0 44 44" aria-hidden="true">
      <circle class="body" cx="22" cy="22" r="22"></circle>
      <g class="scale-face"><g class="face">
        <ellipse class="ink" cx="29.088" cy="21.75" rx="1.899" ry="1.75"></ellipse>
        <ellipse class="ink" cx="14.899" cy="21.75" rx="1.899" ry="1.75"></ellipse>
        <path class="ink" d="M21.894,27.882 C24.859,27.882 25.494,25.54 25.494,24.565 C25.494,23.589 24.435,23.98 22.106,23.98 C19.776,23.98 18.294,23.589 18.294,24.565 C18.294,25.54 18.929,27.882 21.894,27.882 Z"></path>
        <ellipse fill="#E23D18" cx="21.894" cy="26.439" rx="1.694" ry="0.78"></ellipse>
      </g></g>
    </svg>`;
  return `
    <svg class="face-svg sad" viewBox="0 0 44 44" aria-hidden="true">
      <circle class="body" cx="22" cy="22" r="22"></circle>
      <g transform="translate(13 20)"><g class="face">
        <path class="stroke-ink mouth" d="M7,4 C7,5.105 7.895,6 9,6 C10.105,6 11,5.105 11,4" transform="translate(9 5) rotate(-180) translate(-9 -5)"></path>
        <ellipse class="right-eye ink" cx="16.094" cy="1.756" rx="1.906" ry="1.756"></ellipse>
        <ellipse class="left-eye ink" cx="1.906" cy="1.756" rx="1.906" ry="1.756"></ellipse>
      </g></g>
    </svg>`;
}

function parseFacesAttribute(value) {
  const text = String(value || '').trim();
  if (!text) return cloneDefaultFaces();
  if (text.startsWith('[')) {
    try { return JSON.parse(text); } catch { return cloneDefaultFaces(); }
  }
  return text.split(',').map((part, index) => {
    const [faceRaw, valueRaw, labelRaw, colorRaw] = part.split(':').map(chunk => chunk?.trim());
    const face = FACE_SET.has(faceRaw) ? faceRaw : DEFAULT_FACES[index % DEFAULT_FACES.length].face;
    return { face, value: valueRaw || face, label: labelRaw || titleCase(face), color: colorRaw || `var(--pulse-faces-${face})` };
  });
}

function applyOptions(el, options) {
  if (options.faces) el.faces = options.faces;
  for (const [key, attr] of Object.entries({ value: 'value', name: 'name', size: 'size', gap: 'gap', labelPosition: 'label-position', orientation: 'orientation' })) {
    if (options[key] != null) el.setAttribute(attr, String(options[key]));
  }
  for (const [key, attr] of Object.entries({ labels: 'labels', interactive: 'interactive', selectable: 'selectable', disabled: 'disabled', required: 'required', paused: 'paused' })) {
    if (options[key] != null) toggleAttr(el, attr, options[key]);
  }
}

function cloneDefaultFaces() { return DEFAULT_FACES.map(face => ({ ...face })); }
function cssLength(value, fallback) { if (value == null || value === '') return fallback; return /^-?\d+(\.\d+)?$/.test(String(value)) ? `${value}px` : String(value); }
function titleCase(value) { return String(value || '').replace(/(^|[-_\s])\w/g, match => match.toUpperCase()).replace(/[-_]/g, ' '); }
function toggleAttr(el, name, value) { if (value) el.setAttribute(name, ''); else el.removeAttribute(name); }
function escapeHtml(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function escapeAttr(value) { return escapeHtml(value); }
function escapeCss(value) { return String(value).replace(/[<>{};]/g, ''); }

definePulseFaces();

export default PulseFaces;

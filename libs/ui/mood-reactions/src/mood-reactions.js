// mood-reactions v0.0.1 — animated reaction rating custom element.
//
// Adapted from Aaron Iker's "Feedback Reactions (Dark version)"
// (https://codepen.io/aaroniker/pen/qBjyKGO), MIT licensed.
// Converted to a dependency-free ES module + Shadow DOM web component with
// keyboard support, form participation, custom items, theming variables, and
// programmatic helpers.

export const VERSION = '0.0.1';

export const FACE_KEYS = Object.freeze(['angry', 'sad', 'ok', 'good', 'happy']);

export const DEFAULT_REACTIONS = Object.freeze([
  Object.freeze({ face: 'angry', value: '1', label: 'Angry', ariaLabel: 'Very unhappy' }),
  Object.freeze({ face: 'sad', value: '2', label: 'Sad', ariaLabel: 'Unhappy' }),
  Object.freeze({ face: 'ok', value: '3', label: 'Okay', ariaLabel: 'Neutral' }),
  Object.freeze({ face: 'good', value: '4', label: 'Good', ariaLabel: 'Happy' }),
  Object.freeze({ face: 'happy', value: '5', label: 'Happy', ariaLabel: 'Very happy' }),
]);

const FACE_SET = new Set(FACE_KEYS);
const UID_PREFIX = 'moodreactions';
let uid = 0;

const STYLES = `
:host {
  --mood-reactions-normal: #414052;
  --mood-reactions-normal-shadow: #313140;
  --mood-reactions-normal-shadow-top: #4c4b60;
  --mood-reactions-normal-mouth: #2e2e3d;
  --mood-reactions-normal-eye: #282734;
  --mood-reactions-active: #f8da69;
  --mood-reactions-active-shadow: #f4b555;
  --mood-reactions-active-shadow-top: #fff6d3;
  --mood-reactions-active-mouth: #f05136;
  --mood-reactions-active-eye: #313036;
  --mood-reactions-active-tear: #76b5e7;
  --mood-reactions-active-shadow-angry: #e94f1d;
  --mood-reactions-hover: #454456;
  --mood-reactions-hover-shadow-top: #59586b;
  --mood-reactions-focus: #8ab4ff;
  --mood-reactions-caption: currentColor;
  --mood-reactions-caption-size: 0.72rem;
  --mood-reactions-caption-gap: 0.35rem;
  --mood-reactions-scale: 1;
  --mood-reactions-gap: 20px;
  --mood-reactions-opacity-disabled: 0.52;
  display: inline-block;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
}

:host([hidden]) { display: none; }
:host([disabled]) { opacity: var(--mood-reactions-opacity-disabled); }
:host([readonly]) .reaction { cursor: default; }

.feedback {
  --normal: var(--mood-reactions-normal);
  --normal-shadow: var(--mood-reactions-normal-shadow);
  --normal-shadow-top: var(--mood-reactions-normal-shadow-top);
  --normal-mouth: var(--mood-reactions-normal-mouth);
  --normal-eye: var(--mood-reactions-normal-eye);
  --active: var(--mood-reactions-active);
  --active-shadow: var(--mood-reactions-active-shadow);
  --active-shadow-top: var(--mood-reactions-active-shadow-top);
  --active-mouth: var(--mood-reactions-active-mouth);
  --active-eye: var(--mood-reactions-active-eye);
  --active-tear: var(--mood-reactions-active-tear);
  --active-shadow-angry: var(--mood-reactions-active-shadow-angry);
  --hover: var(--mood-reactions-hover);
  --hover-shadow-top: var(--mood-reactions-hover-shadow-top);
  align-items: center;
  border: 0;
  display: flex;
  flex-direction: row;
  gap: var(--mood-reactions-gap);
  margin: 0;
  padding: 0;
}

:host([orientation="vertical"]) .feedback,
.feedback.vertical {
  align-items: flex-start;
  flex-direction: column;
}

.legend {
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
}

.reaction {
  align-items: center;
  color: var(--mood-reactions-caption);
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  gap: var(--mood-reactions-caption-gap);
  min-width: calc(40px * var(--mood-reactions-scale));
  position: relative;
  transition: transform 0.3s;
}

:host([label-position="top"]) .reaction { flex-direction: column-reverse; }
:host([label-position="none"]) .caption,
:host(:not([labels]):not([label-position])) .caption { display: none; }
:host([label-position="none"]) .reaction { gap: 0; }

.reaction input {
  appearance: none;
  background: var(--sb, var(--normal));
  border: none;
  border-radius: 50%;
  box-shadow: inset 3px -3px 4px var(--sh, var(--normal-shadow)), inset -1px 1px 2px var(--sht, var(--normal-shadow-top));
  display: block;
  height: 40px;
  left: 0;
  margin: 0;
  outline: none;
  padding: 0;
  position: absolute;
  top: 0;
  transform: scale(var(--mood-reactions-scale));
  transform-origin: 0 0;
  transition: background 0.4s, box-shadow 0.4s, transform 0.3s;
  width: 40px;
  -webkit-appearance: none;
  -moz-appearance: none;
  -webkit-tap-highlight-color: transparent;
}

.reaction input:focus-visible {
  outline: 2px solid var(--mood-reactions-focus);
  outline-offset: 3px;
}

.icon {
  display: block;
  height: calc(40px * var(--mood-reactions-scale));
  pointer-events: none;
  position: relative;
  width: calc(40px * var(--mood-reactions-scale));
}

.face {
  display: block;
  height: 40px;
  left: 0;
  position: absolute;
  top: 0;
  transform: scale(var(--mood-reactions-scale));
  transform-origin: 0 0;
  width: 40px;
}

.face-inner {
  display: block;
  height: 40px;
  position: relative;
  transform: perspective(240px) translateZ(4px);
  width: 40px;
}

.face-inner svg,
.face-inner:before,
.face-inner:after {
  display: block;
  height: var(--h, 1px);
  left: var(--l, 9px);
  position: absolute;
  top: var(--t, 13px);
  transform: rotate(var(--r, 0deg)) scale(var(--sc, 1)) translateZ(0);
  width: var(--w, 8px);
}

.face-inner svg {
  fill: none;
  stroke: var(--s);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5px;
  transition: stroke 0.4s;
}

.face-inner svg.eye {
  --s: var(--e, var(--normal-eye));
  --t: 17px;
  --w: 7px;
  --h: 4px;
}

.face-inner svg.eye.right { --l: 23px; }

.face-inner svg.mouth {
  --s: var(--m, var(--normal-mouth));
  --l: 11px;
  --t: 23px;
  --w: 18px;
  --h: 7px;
}

.face-inner:before,
.face-inner:after {
  background: var(--b, var(--e, var(--normal-eye)));
  border-radius: var(--br, 1px);
  content: "";
  transition: background 0.4s;
  z-index: var(--zi, 1);
}

.caption {
  display: block;
  font-size: var(--mood-reactions-caption-size);
  line-height: 1;
  max-width: calc(56px * var(--mood-reactions-scale));
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reaction.angry {
  --step-1-rx: -24deg;
  --step-1-ry: 20deg;
  --step-2-rx: -24deg;
  --step-2-ry: -20deg;
}
.reaction.angry .face-inner:before { --r: 20deg; }
.reaction.angry .face-inner:after { --l: 23px; --r: -20deg; }
.reaction.angry .face-inner svg.eye { stroke-dasharray: 4.55; stroke-dashoffset: 8.15; }
.reaction.angry input:checked { animation: moodreactions-angry 1s linear; }
.reaction.angry input:checked + .icon .face-inner:before {
  --middle-y: -2px;
  --middle-r: 22deg;
  animation: moodreactions-toggle 0.8s linear forwards;
}
.reaction.angry input:checked + .icon .face-inner:after {
  --middle-y: 1px;
  --middle-r: -18deg;
  animation: moodreactions-toggle 0.8s linear forwards;
}

.reaction.sad {
  --step-1-rx: 20deg;
  --step-1-ry: -12deg;
  --step-2-rx: -18deg;
  --step-2-ry: 14deg;
}
.reaction.sad .face-inner:before,
.reaction.sad .face-inner:after {
  --b: var(--active-tear);
  --br: 50%;
  --h: 5px;
  --sc: 0;
  --t: 15px;
  --w: 5px;
}
.reaction.sad .face-inner:after { --l: 25px; }
.reaction.sad .face-inner svg.eye { --t: 16px; }
.reaction.sad .face-inner svg.mouth { --t: 24px; stroke-dasharray: 9.5; stroke-dashoffset: 33.25; }
.reaction.sad input:checked + .icon .face-inner:before,
.reaction.sad input:checked + .icon .face-inner:after { animation: moodreactions-tear 0.6s linear forwards; }

.reaction.ok {
  --step-1-rx: 4deg;
  --step-1-ry: -22deg;
  --step-1-rz: 6deg;
  --step-2-rx: 4deg;
  --step-2-ry: 22deg;
  --step-2-rz: -6deg;
}
.reaction.ok .face-inner:before {
  --br: 50%;
  --h: 4px;
  --l: 12px;
  --t: 17px;
  --w: 4px;
  box-shadow: 12px 0 0 var(--e, var(--normal-eye));
}
.reaction.ok .face-inner:after {
  --b: var(--m, var(--normal-mouth));
  --br: 1px;
  --h: 2px;
  --l: 13px;
  --t: 26px;
  --w: 14px;
}
.reaction.ok input:checked + .icon .face-inner:before { --middle-s-y: 0.35; animation: moodreactions-toggle 0.2s linear forwards; }
.reaction.ok input:checked + .icon .face-inner:after { --middle-s-x: 0.5; animation: moodreactions-toggle 0.7s linear forwards; }

.reaction.good {
  --step-1-rx: -14deg;
  --step-1-rz: 10deg;
  --step-2-rx: 10deg;
  --step-2-rz: -8deg;
}
.reaction.good .face-inner:before {
  --b: var(--m, var(--normal-mouth));
  --br: 50%;
  --h: 5px;
  --t: 22px;
  --w: 5px;
  --zi: 0;
  box-shadow: 16px 0 0 var(--b);
  filter: blur(2px);
  opacity: 0.5;
}
.reaction.good .face-inner:after { --sc: 0; }
.reaction.good .face-inner svg.eye { --sc: -1; --t: 15px; stroke-dasharray: 4.55; stroke-dashoffset: 8.15; }
.reaction.good .face-inner svg.mouth { --sc: -1; --t: 22px; stroke-dasharray: 13.3; stroke-dashoffset: 23.75; }
.reaction.good input:checked + .icon .face-inner svg.mouth { --middle-y: 1px; --middle-s: -1; animation: moodreactions-toggle 0.8s linear forwards; }

.reaction.happy .face-inner {
  --step-1-rx: 18deg;
  --step-1-ry: 24deg;
  --step-2-rx: 18deg;
  --step-2-ry: -24deg;
}
.reaction.happy .face-inner:before { --sc: 0; }
.reaction.happy .face-inner:after {
  --b: var(--m, var(--normal-mouth));
  --br: 0 0 8px 8px;
  --h: 8px;
  --l: 11px;
  --t: 23px;
  --w: 18px;
}
.reaction.happy .face-inner svg.eye { --sc: -1; --t: 14px; }
.reaction.happy input:checked + .icon .face-inner:after { --middle-s-x: 0.95; --middle-s-y: 0.75; animation: moodreactions-toggle 0.8s linear forwards; }

.reaction input:checked {
  --sb: var(--active);
  --sh: var(--active-shadow);
  --sht: var(--active-shadow-top);
}

.reaction input:checked + .icon .face-inner {
  --e: var(--active-eye);
  --m: var(--active-mouth);
  animation: moodreactions-shake 0.8s linear forwards;
}

.reaction input:not(:checked):hover {
  --sb: var(--hover);
  --sht: var(--hover-shadow-top);
}

.reaction input:not(:checked):active { transform: scale(calc(var(--mood-reactions-scale) * 0.925)); }
.reaction input:not(:checked):active + .icon { transform: scale(0.925); transform-origin: center; }
.reaction:not([aria-disabled="true"]):hover { transform: scale(1.08); }
.reaction input:disabled { cursor: not-allowed; }

@keyframes moodreactions-shake {
  30% { transform: perspective(240px) rotateX(var(--step-1-rx, 0deg)) rotateY(var(--step-1-ry, 0deg)) rotateZ(var(--step-1-rz, 0deg)) translateZ(10px); }
  60% { transform: perspective(240px) rotateX(var(--step-2-rx, 0deg)) rotateY(var(--step-2-ry, 0deg)) rotateZ(var(--step-2-rz, 0deg)) translateZ(10px); }
  100% { transform: perspective(240px) translateZ(4px); }
}

@keyframes moodreactions-tear {
  0% { opacity: 0; transform: translateY(-2px) scale(0) translateZ(0); }
  50% { transform: translateY(12px) scale(0.6, 1.2) translateZ(0); }
  20%, 80% { opacity: 1; }
  100% { opacity: 0; transform: translateY(24px) translateX(4px) rotateZ(-30deg) scale(0.7, 1.1) translateZ(0); }
}

@keyframes moodreactions-toggle {
  50% { transform: translateY(var(--middle-y, 0)) scale(var(--middle-s-x, var(--middle-s, 1)), var(--middle-s-y, var(--middle-s, 1))) rotate(var(--middle-r, 0deg)); }
}

@keyframes moodreactions-angry {
  40% { background: var(--active); }
  45% { box-shadow: inset 3px -3px 4px var(--active-shadow), inset 0 8px 10px var(--active-shadow-angry); }
}

@media (prefers-reduced-motion: reduce) {
  .reaction,
  .reaction *,
  .reaction *::before,
  .reaction *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

const SYMBOLS = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol viewBox="0 0 7 4" id="moodreactions-eye">
    <path d="M1,1 C1.83333333,2.16666667 2.66666667,2.75 3.5,2.75 C4.33333333,2.75 5.16666667,2.16666667 6,1"></path>
  </symbol>
  <symbol viewBox="0 0 18 7" id="moodreactions-mouth">
    <path d="M1,5.5 C3.66666667,2.5 6.33333333,1 9,1 C11.6666667,1 14.3333333,2.5 17,5.5"></path>
  </symbol>
</svg>`;

export function normalizeReactions(input = DEFAULT_REACTIONS) {
  if (typeof input === 'string') return normalizeReactions(parseItemsAttribute(input));
  if (!Array.isArray(input) || input.length === 0) return cloneDefaultReactions();

  return input.map((raw, index) => {
    const source = typeof raw === 'string' ? { face: raw } : (raw || {});
    const fallback = DEFAULT_REACTIONS[index % DEFAULT_REACTIONS.length];
    const face = FACE_SET.has(source.face) ? source.face : fallback.face;
    const value = source.value == null ? String(index + 1) : String(source.value);
    const label = source.label == null ? titleCase(face) : String(source.label);
    const ariaLabel = source.ariaLabel == null ? label : String(source.ariaLabel);

    return {
      ...source,
      face,
      value,
      label,
      ariaLabel,
    };
  });
}

export function defineMoodReactions(tagName = 'mood-reactions') {
  if (typeof customElements === 'undefined') return undefined;
  if (!customElements.get(tagName)) customElements.define(tagName, MoodReactions);
  return customElements.get(tagName);
}

export function createMoodReactions(options = {}) {
  if (typeof document === 'undefined') {
    throw new Error('createMoodReactions() requires a browser document');
  }
  const tagName = options.tagName || 'mood-reactions';
  defineMoodReactions(tagName);
  const el = document.createElement(tagName);
  applyOptions(el, options);
  return el;
}

export class MoodReactions extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return [
      'value',
      'items',
      'name',
      'legend',
      'disabled',
      'readonly',
      'required',
      'clearable',
      'labels',
      'label-position',
      'orientation',
      'size',
      'scale',
      'gap',
    ];
  }

  constructor() {
    super();
    this._uid = `${UID_PREFIX}-${++uid}`;
    this._items = cloneDefaultReactions();
    this._value = '';
    this._renderQueued = false;
    this._internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null;
    this.attachShadow({ mode: 'open' });
    this._onClick = this._onClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this.shadowRoot.addEventListener('click', this._onClick);
    this.shadowRoot.addEventListener('keydown', this._onKeydown);
  }

  connectedCallback() {
    if (this.hasAttribute('items')) this._items = normalizeReactions(this.getAttribute('items'));
    if (this.hasAttribute('value')) this._value = this.getAttribute('value') || '';
    this._render();
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'items') this._items = normalizeReactions(newValue || DEFAULT_REACTIONS);
    if (name === 'value') this._value = newValue || '';
    if (this.isConnected) this._queueRender();
  }

  get value() { return this._value; }

  set value(value) {
    const next = value == null ? '' : String(value);
    this._setValue(next, { user: false, reflect: true });
  }

  get index() {
    return this._items.findIndex(item => item.value === this._value);
  }

  set index(index) {
    const item = this._items[Number(index)];
    this.value = item ? item.value : '';
  }

  get selectedItem() {
    return this._items[this.index] || null;
  }

  get items() {
    return this._items.map(item => ({ ...item }));
  }

  set items(items) {
    this._items = normalizeReactions(items);
    if (this._value && !this._items.some(item => item.value === this._value)) this._value = '';
    this._queueRender();
  }

  configure(options = {}) {
    applyOptions(this, options);
    return this;
  }

  reset({ emit = false } = {}) {
    this._setValue('', { user: emit, reflect: true });
  }

  select(valueOrIndex, { emit = false } = {}) {
    const item = typeof valueOrIndex === 'number' ? this._items[valueOrIndex] : this._items.find(candidate => candidate.value === String(valueOrIndex));
    this._setValue(item ? item.value : '', { user: emit, reflect: true });
  }

  _onClick(event) {
    const input = event.target.closest?.('input[type="radio"]');
    if (!input) return;
    event.preventDefault();
    this._choose(input.dataset.value);
  }

  _onKeydown(event) {
    const input = event.target.closest?.('input[type="radio"]');
    if (!input) return;

    const current = this.index >= 0 ? this.index : Number(input.dataset.index || 0);
    let next = current;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(this._items.length - 1, current + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, current - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this._items.length - 1;
    else if (event.key === ' ' || event.key === 'Enter') {
      this._choose(input.dataset.value);
      event.preventDefault();
      return;
    } else return;

    event.preventDefault();
    this._choose(this._items[next]?.value, { focusIndex: next });
  }

  _choose(value, { focusIndex } = {}) {
    if (this.disabled || this.readOnly) return;
    const isCurrent = value === this._value;
    const next = isCurrent && this.clearable ? '' : value;
    this._setValue(next, { user: true, reflect: true, focusIndex });
  }

  _setValue(value, { user = false, reflect = false, focusIndex } = {}) {
    const exists = value === '' || this._items.some(item => item.value === value);
    const next = exists ? value : '';
    const changed = next !== this._value;
    this._value = next;

    if (reflect) {
      if (next) {
        if (this.getAttribute('value') !== next) this.setAttribute('value', next);
      } else if (this.hasAttribute('value')) {
        this.removeAttribute('value');
      }
    }

    this._render();
    if (focusIndex != null) this._focusIndex(focusIndex);

    if (user && changed) {
      const detail = { value: this._value, index: this.index, item: this.selectedItem };
      this.dispatchEvent(new CustomEvent('input', { detail, bubbles: true, composed: true }));
      this.dispatchEvent(new CustomEvent('change', { detail, bubbles: true, composed: true }));
    }
  }

  _queueRender() {
    if (this._renderQueued) return;
    this._renderQueued = true;
    queueMicrotask(() => {
      this._renderQueued = false;
      this._render();
    });
  }

  _render() {
    if (!this.shadowRoot) return;
    if (this._value && !this._items.some(item => item.value === this._value)) this._value = '';

    const scale = getScale(this.getAttribute('scale'), this.getAttribute('size'));
    const gap = cssLength(this.getAttribute('gap'), '20px');
    const legend = this.getAttribute('legend') || 'Feedback reaction';
    const disabled = this.disabled;
    const readonly = this.readOnly;
    const name = this.getAttribute('name') || this._uid;
    const selectedIndex = this.index;
    const tabindexIndex = selectedIndex >= 0 ? selectedIndex : 0;

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <style>:host{--mood-reactions-scale:${scale};--mood-reactions-gap:${escapeCss(gap)};}</style>
      ${SYMBOLS}
      <div class="feedback" role="radiogroup" aria-label="${escapeHtml(legend)}" ${disabled ? 'aria-disabled="true"' : ''} ${readonly ? 'aria-readonly="true"' : ''}>
        <span class="legend">${escapeHtml(legend)}</span>
        ${this._items.map((item, index) => this._renderItem(item, index, { name, disabled, readonly, checked: item.value === this._value, tabindex: index === tabindexIndex ? 0 : -1 })).join('')}
      </div>
    `;

    this._syncForm();
  }

  _renderItem(item, index, state) {
    const style = itemStyle(item);
    return `
      <label class="reaction ${escapeAttr(item.face)}" ${state.readonly || state.disabled ? 'aria-disabled="true"' : ''} ${style ? `style="${style}"` : ''}>
        <input type="radio"
          name="${escapeAttr(state.name)}"
          value="${escapeAttr(item.value)}"
          data-value="${escapeAttr(item.value)}"
          data-index="${index}"
          aria-label="${escapeAttr(item.ariaLabel)}"
          ${state.checked ? 'checked' : ''}
          ${state.disabled ? 'disabled' : ''}
          ${this.required ? 'required' : ''}
          tabindex="${state.tabindex}">
        <span class="icon">${faceMarkup(item.face)}</span>
        <span class="caption">${escapeHtml(item.label)}</span>
      </label>
    `;
  }

  _focusIndex(index) {
    const input = this.shadowRoot.querySelector(`input[data-index="${index}"]`);
    input?.focus();
  }

  _syncForm() {
    if (!this._internals) return;
    this._internals.setFormValue?.(this._value || null);
    if (this.required && !this._value) {
      const anchor = this.shadowRoot.querySelector('input');
      this._internals.setValidity?.({ valueMissing: true }, 'Please select a reaction.', anchor || undefined);
    } else {
      this._internals.setValidity?.({});
    }
  }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { toggleAttr(this, 'disabled', value); }

  get readOnly() { return this.hasAttribute('readonly'); }
  set readOnly(value) { toggleAttr(this, 'readonly', value); }

  get required() { return this.hasAttribute('required'); }
  set required(value) { toggleAttr(this, 'required', value); }

  get clearable() { return this.hasAttribute('clearable'); }
  set clearable(value) { toggleAttr(this, 'clearable', value); }
}

function applyOptions(el, options) {
  if (options.items) el.items = options.items;
  for (const [key, attr] of Object.entries({
    value: 'value',
    name: 'name',
    legend: 'legend',
    labelPosition: 'label-position',
    orientation: 'orientation',
    size: 'size',
    scale: 'scale',
    gap: 'gap',
  })) {
    if (options[key] != null) el.setAttribute(attr, String(options[key]));
  }
  for (const [key, attr] of Object.entries({
    disabled: 'disabled',
    readOnly: 'readonly',
    readonly: 'readonly',
    required: 'required',
    clearable: 'clearable',
    labels: 'labels',
  })) {
    if (options[key] != null) toggleAttr(el, attr, options[key]);
  }
}

function faceMarkup(face) {
  if (face === 'ok') return '<span class="face"><span class="face-inner"></span></span>';
  const mouth = face === 'happy' ? '' : '<svg class="mouth"><use href="#moodreactions-mouth"></use></svg>';
  return `
    <span class="face"><span class="face-inner">
      <svg class="eye left"><use href="#moodreactions-eye"></use></svg>
      <svg class="eye right"><use href="#moodreactions-eye"></use></svg>
      ${mouth}
    </span></span>
  `;
}

function parseItemsAttribute(value) {
  const text = String(value || '').trim();
  if (!text) return cloneDefaultReactions();
  if (text.startsWith('[')) {
    try { return JSON.parse(text); }
    catch { return cloneDefaultReactions(); }
  }
  return text.split(',').map((part, index) => {
    const [faceRaw, valueRaw, labelRaw] = part.split(':').map(chunk => chunk?.trim());
    const face = FACE_SET.has(faceRaw) ? faceRaw : DEFAULT_REACTIONS[index % DEFAULT_REACTIONS.length].face;
    return {
      face,
      value: valueRaw || String(index + 1),
      label: labelRaw || titleCase(face),
    };
  });
}

function cloneDefaultReactions() {
  return DEFAULT_REACTIONS.map(item => ({ ...item }));
}

function itemStyle(item) {
  const map = {
    active: '--mood-reactions-active',
    activeShadow: '--mood-reactions-active-shadow',
    activeShadowTop: '--mood-reactions-active-shadow-top',
    activeMouth: '--mood-reactions-active-mouth',
    activeEye: '--mood-reactions-active-eye',
    activeTear: '--mood-reactions-active-tear',
    activeShadowAngry: '--mood-reactions-active-shadow-angry',
    normal: '--mood-reactions-normal',
    normalShadow: '--mood-reactions-normal-shadow',
    normalShadowTop: '--mood-reactions-normal-shadow-top',
    normalMouth: '--mood-reactions-normal-mouth',
    normalEye: '--mood-reactions-normal-eye',
    hover: '--mood-reactions-hover',
    hoverShadowTop: '--mood-reactions-hover-shadow-top',
  };
  return Object.entries(map)
    .filter(([key]) => item[key] != null)
    .map(([key, variable]) => `${variable}:${escapeCss(String(item[key]))}`)
    .join(';');
}

function getScale(scaleAttr, sizeAttr) {
  if (scaleAttr != null && scaleAttr !== '') {
    const scale = Number(scaleAttr);
    if (Number.isFinite(scale) && scale > 0) return clamp(scale, 0.4, 4);
  }
  if (sizeAttr != null && sizeAttr !== '') {
    const size = Number(String(sizeAttr).replace(/px$/, ''));
    if (Number.isFinite(size) && size > 0) return clamp(size / 40, 0.4, 4);
  }
  return 1;
}

function cssLength(value, fallback) {
  if (value == null || value === '') return fallback;
  if (/^-?\d+(\.\d+)?$/.test(String(value))) return `${value}px`;
  return String(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function titleCase(value) {
  return String(value || '').replace(/(^|[-_\s])\w/g, match => match.toUpperCase()).replace(/[-_]/g, ' ');
}

function toggleAttr(el, name, value) {
  if (value) el.setAttribute(name, '');
  else el.removeAttribute(name);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function escapeCss(value) {
  return String(value).replace(/[<>{};]/g, '');
}

defineMoodReactions();

export default MoodReactions;

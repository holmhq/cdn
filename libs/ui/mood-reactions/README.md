# mood-reactions

Animated 1–5 reaction picker as a vanilla custom element. Adapted from Aaron
Iker's [Feedback Reactions](https://codepen.io/aaroniker/pen/qBjyKGO).

- Single `<mood-reactions>` custom element. No framework and no runtime dependencies.
- Shadow DOM encapsulated, keyboard accessible, form-associated where supported.
- Configurable reaction list, labels, orientation, size, gap, and clearable mode.
- Global and per-item theming through CSS custom properties.
- Honours `prefers-reduced-motion`.

## Use

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/holmhq/cdn@main/libs/ui/mood-reactions/v-0.0.1/mood-reactions.min.mjs"></script>

<mood-reactions value="4" labels clearable></mood-reactions>

<script>
  document.querySelector('mood-reactions').addEventListener('change', (event) => {
    console.log(event.detail.value, event.detail.item);
  });
</script>
```

Pin production consumers to a `v-X.Y.Z` folder. For commit-immutable caching,
replace `@main` with a commit SHA.

## API

### Attributes

- `value` — selected value. Default reactions use values `1` through `5`.
- `items` — CSV (`face:value:label`) or JSON array. Face names: `angry`,
  `sad`, `ok`, `good`, `happy`.
- `clearable` — selecting the current item clears the value.
- `labels` — show captions.
- `label-position` — `bottom` (default), `top`, or `none`.
- `orientation` — `horizontal` (default) or `vertical`.
- `size` — face size in pixels (`40` default). Also accepts `scale`.
- `gap` — space between reactions.
- `legend` — accessible radiogroup label.
- `name`, `required`, `disabled`, `readonly` — form-style controls.

### Properties + methods

- `el.value` — selected value, or `""` when unset.
- `el.index` — selected index, or `-1`.
- `el.items` — array of reaction objects.
- `el.selectedItem` — selected reaction object or `null`.
- `el.select(valueOrIndex, { emit })` — select by value or index.
- `el.reset({ emit })` — clear selection.
- `el.configure(options)` — apply options programmatically.

### Events

- `input` and `change` — dispatched for user selection. `event.detail` is
  `{ value, index, item }`. Events bubble and are composed.

## Theming

| Prop | Default |
| --- | --- |
| `--mood-reactions-normal` | `#414052` |
| `--mood-reactions-normal-shadow` | `#313140` |
| `--mood-reactions-normal-shadow-top` | `#4c4b60` |
| `--mood-reactions-normal-mouth` | `#2e2e3d` |
| `--mood-reactions-normal-eye` | `#282734` |
| `--mood-reactions-active` | `#f8da69` |
| `--mood-reactions-active-shadow` | `#f4b555` |
| `--mood-reactions-active-shadow-top` | `#fff6d3` |
| `--mood-reactions-active-mouth` | `#f05136` |
| `--mood-reactions-active-eye` | `#313036` |
| `--mood-reactions-active-tear` | `#76b5e7` |
| `--mood-reactions-hover` | `#454456` |
| `--mood-reactions-focus` | `#8ab4ff` |
| `--mood-reactions-caption-size` | `0.72rem` |

Per-item JSON can override theme slots (`active`, `normal`, `activeMouth`, etc.):

```html
<mood-reactions labels items='[
  {"face":"sad","value":"bug","label":"Bug","active":"#fb7185"},
  {"face":"ok","value":"meh","label":"Meh","active":"#facc15"},
  {"face":"happy","value":"ship","label":"Ship","active":"#34d399"}
]'></mood-reactions>
```

## Dev

```sh
npm install
node build.js
python3 -m http.server 8090
```

## Publish

```sh
cd ~/Projects/holmhq/cdn
scripts/publish.sh ui mood-reactions 0.0.2
git push
```

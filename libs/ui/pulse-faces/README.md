# pulse-faces

Animated SVG sentiment faces as a vanilla custom element. Adapted from Misha
Heesakkers' [Simple animating emotions](https://codepen.io/MishaHahaha/pen/grzLJy).

- `<pulse-faces>` custom element. No framework and no runtime dependencies.
- Renders one face, a row of faces, or a selectable sentiment picker.
- Configurable `faces`, labels, orientation, size, gap, and paused state.
- Themed through CSS custom properties and per-face colors.
- Honours `prefers-reduced-motion`.

## Use

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/holmhq/cdn@main/libs/ui/pulse-faces/v-0.0.1/pulse-faces.min.mjs"></script>

<pulse-faces labels size="80"></pulse-faces>

<pulse-faces
  selectable
  labels
  value="fine"
  faces="sad:1:Rough,neutral:2:Okay,fine:3:Fine,happy:4:Great"
></pulse-faces>

<script>
  document.querySelector('pulse-faces[selectable]').addEventListener('change', (event) => {
    console.log(event.detail.value, event.detail.item);
  });
</script>
```

Pin production consumers to a `v-X.Y.Z` folder. For commit-immutable caching,
replace `@main` with a commit SHA.

## API

### Attributes

- `faces` — CSV (`face:value:label:color`) or JSON array. Face names:
  `sad`, `neutral`, `fine`, `happy`.
- `value` — selected value when `selectable` / `interactive` is enabled.
- `selectable` / `interactive` — enable click + keyboard selection and
  `input` / `change` events.
- `labels` — show captions.
- `label-position` — `bottom` (default), `top`, or `none`.
- `orientation` — `horizontal` (default) or `vertical`.
- `size` — icon size (`72`, `72px`, `5rem`, etc.).
- `gap` — space between faces.
- `paused` or `animated="false"` — freeze animations.
- `disabled`, `required`, `name` — form-friendly controls.

### Properties + methods

- `el.value` — selected value, or `""` when unset.
- `el.index` — selected index, or `-1`.
- `el.faces` — array of face objects.
- `el.selectedItem` — selected face object or `null`.
- `el.select(valueOrIndex, { emit })` — select by value or index.
- `el.reset({ emit })` — clear selection.
- `el.configure(options)` — apply options programmatically.

### Events

- `input` and `change` — dispatched for user selection. `event.detail` is
  `{ value, index, item }`. Events bubble and are composed.

## Theming

| Prop | Default |
| --- | --- |
| `--pulse-faces-size` | `72px` |
| `--pulse-faces-gap` | `16px` |
| `--pulse-faces-ink` | `#2C0E0F` |
| `--pulse-faces-sad` | `#E23D18` |
| `--pulse-faces-neutral` | `#F9AC1B` |
| `--pulse-faces-fine` | `#1988E3` |
| `--pulse-faces-happy` | `#248C37` |
| `--pulse-faces-focus` | `#8ab4ff` |
| `--pulse-faces-selected-ring` | `currentColor` |
| `--pulse-faces-caption` | `currentColor` |
| `--pulse-faces-caption-size` | `0.75rem` |

Example:

```css
pulse-faces.brand {
  --pulse-faces-size: 56px;
  --pulse-faces-gap: 10px;
  --pulse-faces-ink: #111827;
  --pulse-faces-sad: #fb7185;
  --pulse-faces-neutral: #facc15;
  --pulse-faces-fine: #60a5fa;
  --pulse-faces-happy: #34d399;
}
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
scripts/publish.sh ui pulse-faces 0.0.2
git push
```

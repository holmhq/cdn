# spin-maze

Rotating maze puzzle packaged as a vanilla custom element. Adapted from David
DeSandro's [Cub n Pup](https://codepen.io/desandro/pen/ezNawy) CodePen.

- `<spin-maze>` custom element with no runtime dependencies.
- Iframe-isolated so the game can keep its canvas/input model without leaking CSS.
- Ships the original level set, plus custom level injection.
- `classic`, `night`, `candy`, and `forest` themes with CSS-variable overrides.
- Emits a `complete` event when the player reaches the star.

## Use

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/holmhq/cdn@main/libs/ui/spin-maze/v-0.0.1/spin-maze.min.mjs"></script>

<spin-maze theme="night" height="680"></spin-maze>

<script>
  document.querySelector('spin-maze').addEventListener('complete', (event) => {
    console.log('level complete', event.detail.level);
  });
</script>
```

Pin production consumers to a `v-X.Y.Z` folder. For commit-immutable caching,
replace `@main` with a commit SHA.

## API

### Attributes

- `theme` — `classic` (default), `night`, `candy`, or `forest`.
- `height` — iframe/game height (`720`, `80vh`, etc.).
- `level` — initial level id from the built-in or custom set.
- `storage-key` — localStorage namespace for current/completed levels.
- `show-levels="false"` — hide the level picker button.
- `button-label` — level picker button text.
- `next-label` — next-level button text.
- `levels` — JSON array of custom levels.

Custom levels use the original text-map syntax:

```html
<spin-maze levels='[
  {
    "id":"tiny",
    "blurb":"Demo",
    "instruction":"Drag cub to star",
    "map":"*=.=.\n    !\n. . .\n    !\n@=.=."
  }
]'></spin-maze>
```

### Properties + methods

- `el.levels` — get/set custom level array.
- `el.configure(options)` — apply options programmatically.
- `el.reload()` — rebuild the iframe game.

### Events

- `complete` — fired when the current level is completed. `event.detail` is
  `{ level, completedLevels }`. Event bubbles and is composed.

## Theming

Built-in themes can be overridden from the host element:

| Prop | Purpose |
| --- | --- |
| `--spin-maze-height` | iframe height |
| `--spin-maze-radius` | wrapper radius |
| `--spin-maze-shadow` | wrapper shadow |
| `--spin-maze-background` | game page background |
| `--spin-maze-text` | UI text |
| `--spin-maze-button-bg` | button background |
| `--spin-maze-button-hover` | active/hover button background |
| `--spin-maze-button-text` | button text |
| `--spin-maze-panel-bg` | level picker panel |
| `--spin-maze-level-bg` | level tile background |
| `--spin-maze-level-hover-bg` | level tile hover |
| `--spin-maze-complete-bg` | completed check background |
| `--spin-maze-free` | rotating/free segment color |
| `--spin-maze-fixed` | fixed segment color |
| `--spin-maze-pivot` | pivot segment color |
| `--spin-maze-rotate` | rotating arm color |
| `--spin-maze-cub` | player color |
| `--spin-maze-star` | goal color |
| `--spin-maze-peg` | peg color |
| `--spin-maze-start` | start ring color |
| `--spin-maze-handle` | drag-rotate handle color |

```css
spin-maze.brand {
  --spin-maze-height: 560px;
  --spin-maze-background: #0f172a;
  --spin-maze-free: #38bdf8;
  --spin-maze-fixed: #fb923c;
  --spin-maze-cub: #f472b6;
  --spin-maze-star: #facc15;
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
scripts/publish.sh ui spin-maze 0.0.2
git push
```

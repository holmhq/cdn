# flow-globe

Configurable animated geospatial flow map as a vanilla custom element. Adapted
from amCharts' [Global Coffee Supply Chain](https://codepen.io/amcharts/pen/OPRwxBd)
CodePen into a reusable `<flow-globe>` component.

- Lazy-loads amCharts from `cdn.amcharts.com` by default; does **not** mirror it.
- Ships a coffee-supply demo dataset but accepts custom Sankey flow data.
- Globe or map projection, projection toggle, zoom controls, moving bullets.
- Built-in `coffee`, `ocean`, `ember`, and `slate` themes plus CSS variables.

## Use

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/holmhq/cdn@main/libs/ui/flow-globe/v-0.0.1/flow-globe.min.mjs"></script>

<flow-globe theme="coffee" height="560"></flow-globe>
```

Custom data:

```html
<flow-globe
  title="Design System Adoption"
  subtitle="Component imports by region"
  theme="ocean"
  value-suffix="imports"
  producers="US,IN"
  hubs="DE,SG"
  consumers="GB,FR,JP,AU"
  data='[
    {"sourceId":"US","targetId":"DE","value":120},
    {"sourceId":"IN","targetId":"SG","value":90},
    {"sourceId":"DE","targetId":"GB","value":70},
    {"sourceId":"DE","targetId":"FR","value":55},
    {"sourceId":"SG","targetId":"JP","value":50},
    {"sourceId":"SG","targetId":"AU","value":40}
  ]'
  country-names='{"SG":"Singapore","AU":"Australia"}'
></flow-globe>
```

Pin production consumers to a `v-X.Y.Z` folder. For commit-immutable caching,
replace `@main` with a commit SHA.

## API

### Attributes

- `data` — JSON array of `{ sourceId, targetId, value }` flows.
- `data-url` — fetch JSON flow data from a URL.
- `country-names` — JSON object mapping country IDs to display names.
- `producers`, `hubs`, `consumers` — comma-separated country IDs for coloring.
  If omitted, groups are inferred from source/target positions.
- `title`, `subtitle`, `value-suffix` — chart labels and tooltip units.
- `theme` — `coffee` (default), `ocean`, `ember`, or `slate`.
- `height` — chart height (`560`, `70vh`, etc.).
- `projection` — `globe` (default) or `map`.
- `auto-rotate="false"` — disable globe rotation.
- `controls="false"` — hide Globe/Map switch.
- `bullets="false"` — hide animated flow bullets.
- `auto-load="false"` — do not load amCharts; use already-present globals.

### Properties + methods

- `el.data` — get/set flow array.
- `el.countryNames` — get/set country-name map.
- `el.setData(flows)` — replace flows and refresh.
- `el.refresh()` — rebuild chart.
- `el.disposeChart()` — dispose the amCharts root.
- `el.configure(options)` — apply options programmatically.

## Theming

Built-in themes can be overridden with CSS variables:

| Prop | Purpose |
| --- | --- |
| `--flow-globe-height` | wrapper height |
| `--flow-globe-radius` | wrapper border radius |
| `--flow-globe-shadow` | wrapper shadow |
| `--flow-globe-background` | chart background |
| `--flow-globe-water` | globe/map water |
| `--flow-globe-land` | default country fill |
| `--flow-globe-stroke` | country border |
| `--flow-globe-graticule` | grid lines |
| `--flow-globe-flow` | Sankey ribbons |
| `--flow-globe-node` | flow nodes |
| `--flow-globe-node-stroke` | flow node border |
| `--flow-globe-producer` | inferred/explicit source countries |
| `--flow-globe-hub` | intermediate countries |
| `--flow-globe-consumer` | terminal countries |
| `--flow-globe-title` | title text |
| `--flow-globe-subtitle` | subtitle text |
| `--flow-globe-bullet` | moving bullet fill |
| `--flow-globe-bullet-stroke` | moving bullet stroke |

```css
flow-globe.brand {
  --flow-globe-height: 420px;
  --flow-globe-background: #0f172a;
  --flow-globe-flow: #f472b6;
  --flow-globe-node: #f8fafc;
  --flow-globe-title: #ffffff;
}
```

## Dependency note

This component depends on amCharts 5 globals (`am5`, `am5map`,
`am5geodata_worldLow`, `am5themes_Animated`). By default it loads them from
amCharts' CDN. If your app has its own loading policy, include those scripts
first and set `auto-load="false"`.

## Dev

```sh
npm install
node build.js
python3 -m http.server 8090
```

## Publish

```sh
cd ~/Projects/holmhq/cdn
scripts/publish.sh ui flow-globe 0.0.2
git push
```

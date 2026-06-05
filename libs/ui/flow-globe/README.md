# flow-globe

First-party animated geospatial flow visualization as a vanilla custom element.
A dependency-free `<flow-globe>` that renders country-to-country flows as glowing
great-circle arcs with travelling particles — on a rotating 3D wireframe globe or
a flat equirectangular map.

- **No third-party runtime dependency.** Pure canvas 2D plus a compact built-in
  table of country centroids. No charting library, no map-geodata download.
- Accepts custom flow data; ships a small demo dataset.
- Globe (orthographic, auto-rotating, drag-to-spin) or flat map projection, with
  an in-component Globe/Map toggle.
- Source / hub / destination nodes are color-coded and sized by total flow.
- Built-in `ocean`, `coffee`, `ember`, and `slate` themes plus CSS variables.

> **v0.1.0 is a full rewrite.** The earlier `v-0.0.x` builds wrapped amCharts 5
> and lazy-loaded it from a CDN. v0.1.0 drops that dependency entirely. The public
> attribute surface is unchanged; `auto-load`, `bullets`, and `data-url` are gone.

## Use

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/holmhq/cdn@main/libs/ui/flow-globe/v-0.1.0/flow-globe.min.mjs"></script>

<flow-globe theme="ocean" height="520"></flow-globe>
```

Custom data:

```html
<flow-globe
  title="Design System Adoption"
  subtitle="Component imports by region"
  theme="ocean"
  producers="US,IN"
  hubs="DE,SG"
  consumers="GB,FR,JP,AU"
  data='[
    {"sourceId":"US","targetId":"DE","value":120},
    {"sourceId":"IN","targetId":"SG","value":90},
    {"sourceId":"DE","targetId":"GB","value":70},
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

- `data` — JSON array of `{ sourceId, targetId, value }` flows (ISO-3166 alpha-2 codes).
- `country-names` — JSON object mapping country IDs to display names.
- `producers`, `hubs`, `consumers` — comma-separated country IDs for coloring.
  If omitted, roles are inferred from source/target positions in the flow graph.
- `title`, `subtitle`, `value-suffix` — labels.
- `theme` — `ocean` (default), `coffee`, `ember`, or `slate`.
- `height` — wrapper height (`520`, `70vh`, etc.).
- `projection` — `globe` (default) or `map`.
- `auto-rotate="false"` — disable globe rotation (drag still works).
- `controls="false"` — hide the Globe/Map switch.
- `legend="false"` — hide the role legend.

Unknown country codes are skipped (warned once); supply more centroids by editing
`COUNTRY_CENTROIDS` if you need codes outside the built-in table.

### Properties + methods

- `el.data` — get/set flow array.
- `el.countryNames` — get/set country-name map.
- `el.setData(flows)` — replace flows.
- `el.configure(options)` — apply options programmatically.

## Theming

Built-in themes can be overridden per instance with CSS variables:

| Prop | Purpose |
| --- | --- |
| `--flow-globe-height` | wrapper height |
| `--flow-globe-radius` | wrapper border radius |
| `--flow-globe-shadow` | wrapper shadow |
| `--flow-globe-sphere1` / `--flow-globe-sphere2` | globe gradient (lit → dark) |
| `--flow-globe-halo` | globe rim glow |
| `--flow-globe-graticule` | lat/long grid lines |
| `--flow-globe-arc` / `--flow-globe-arc-hot` | flow arc + particle glow |
| `--flow-globe-particle` | travelling particle fill |
| `--flow-globe-producer` | source-country nodes |
| `--flow-globe-hub` | intermediate-country nodes |
| `--flow-globe-consumer` | destination-country nodes |
| `--flow-globe-title` / `--flow-globe-subtitle` | title + subtitle text |
| `--flow-globe-label` | node + legend label text |

```css
flow-globe.brand {
  --flow-globe-height: 420px;
  --flow-globe-arc: #f472b6;
  --flow-globe-halo: #f472b6;
  --flow-globe-title: #ffffff;
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
scripts/publish.sh ui flow-globe 0.1.1
git push
```

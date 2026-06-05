# poster-charts

Bold **data-poster** SVG charts as a single vanilla custom element. Eight
infographic archetypes for chart-first storytelling — oversized numerals,
confident color blocks, bespoke inline SVG, draw-in + count-up animation,
reduced-motion aware. Zero dependencies, Shadow DOM, themable via CSS variables.

```html
<script type="module"
  src="https://cdn.jsdelivr.net/gh/holmhq/cdn@<sha>/libs/ui/poster-charts/v-0.0.1/poster-charts.min.mjs"></script>

<poster-chart type="gauge" theme="kerala" label="Liabilities vs GSDP"
  source="Table 1.1" data='{"value":35.5,"unit":"%"}'></poster-chart>
```

Imperative:

```js
import { createPosterChart } from '.../poster-charts.min.mjs';
const el = createPosterChart({ type: 'bars', theme: 'kerala', label: 'BE vs Actual' });
el.data = { unit: '%', groups: [{ label: 'Revenue deficit', bars: [
  { label: 'BE', value: 1.90 }, { label: 'Actual', value: 2.58 }] }] };
document.body.append(el);
```

## Attributes

| attr | meaning |
|------|---------|
| `type` | `stat` `gauge` `bars` `slope` `heatstrip` `donut` `stacked` `capacity` |
| `theme` | `kerala` (default) · `slate` (dark) · `ink` (mono) |
| `accent` | accent color override (header strip + default series-less fills) |
| `label` | header strip title (uppercase) |
| `source` | small source chip in the header strip |
| `caption` | supporting text under the chart |
| `data` | JSON config (or set the `.data` property with an object) |
| `bare` | render without the plate frame / header strip |
| `animate` | `off` to disable motion |

## `data` shapes by type

```js
// stat — big number callout
{ value: 48733, prefix: '₹', suffix: ' cr', sub: 'Inherited arrears',
  context: 'as on 31 Mar 2026', delta: '+12%', deltaDir: 'up' }   // or display:'₹48,733 cr'

// gauge — value as arc ring (over-max turns red)
{ value: 92, max: 100, unit: '%', label: 'Own-tax realization', target: 100 }

// bars — grouped/paired vertical bars + optional target marker
{ unit: '%', max: 4,
  groups: [{ label: 'Revenue deficit', target: 1.90, targetLabel: 'BE',
             bars: [{ label: 'BE', value: 1.90 }, { label: 'Actual', value: 2.58 }] }],
  legend: [{ label: 'BE' }, { label: 'Actual' }] }

// slope — before → after (1-3 lines)
{ unit: '%', fromLabel: '2017-18', toLabel: '2025-26',
  lines: [{ label: 'Plan share', from: 23.18, to: 17.55 },
          { label: 'Social services', from: 53.78, to: 30.68 }] }

// heatstrip — N cells colored by state
{ columns: 12,
  cells: [{ state: 'neg' }, { state: 'pos' }, ...],
  legend: [{ state: 'neg', label: 'Negative close', color: '#E24536' },
           { state: 'pos', label: 'Positive', color: '#1FA463' }] }

// donut — share of whole, optional center stat
{ unit: '%', centerValue: 69, centerUnit: '%', centerLabel: 'top 3 utilities',
  segments: [{ label: 'KSRTC+KWA+KSEBL', value: 69 }, { label: 'Others', value: 31 }] }

// stacked — horizontal 100% composition / funnel
{ unit: '', segments: [{ label: 'Committed', value: 56.7 },
  { label: 'Interest', value: 20.9 }, { label: 'Left', value: 22.4 }] }

// capacity — horizontal magnitude / ranked bars
{ unit: ' MW', items: [{ label: 'Solar', value: 6000 }, { label: 'Pumped hydro', value: 8000 }] }
```

Each numeric datum may carry `color` to override the series color. Use
`display` on a `stat` to show a preformatted string instead of a counted number.

## Theming

Override per instance or on any ancestor:

```css
poster-chart {
  --poster-ink: #15211B;  --poster-ink-soft: #5A6B61;
  --poster-surface: #fff; --poster-surface-sunk: #F1EADA; --poster-line: #E3DAC6;
  --poster-good: #1FA463; --poster-bad: #E24536; --poster-warn: #F2A73B;
  --poster-accent: #0F5132;
  --poster-display-font: "Archivo", system-ui;  /* big numerals */
  --poster-body-font: ui-sans-serif, system-ui;
}
```

## Build

```sh
node build.js          # → dist/poster-charts.mjs + .min.mjs
# or publish a version from repo root:
scripts/publish.sh ui poster-charts 0.0.1
```

## License

MIT © Jikku Jose. First-party Holm component.

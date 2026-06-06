# kerala-district-map

A dependency-free `<kerala-district-map>` custom element for rendering a flat SVG map of Kerala's 14 districts with data-driven choropleth fills, Malayalam/English labels, keyboard selection, and optional header/legend overlays.

The component is intentionally map-first and chromeless by default. Apps own the surrounding card/background; the component supplies district geometry, data binding, interaction, accessibility affordances, and styling hooks.

## Status and provenance

- **Status:** experimental for the first CDN release. The public API is designed to be stable enough for demos and early adopters, but district geometry should still be checked against an authoritative Kerala district-boundary source before marking stable.
- **Source geometry:** SVG paths adapted from the MIT CodePen "Show data On Hover of Kerala Map (SaiGramam)" by WebWizard119 / `vishalRamesh22`.
- **Attribution:** keep `LICENSE.txt` with redistributed source or substantial copies. The generated bundles include a short provenance banner.
- **Known source-label fix:** the original SVG path named `KollamThiruvananthapuram` is treated as a source-label mistake. Public ID `13` is `kollam`; public ID `14` is `thiruvananthapuram`.

## Use from CDN

Pin production usage to a `v-X.Y.Z` folder. For commit-immutable caching, replace `@main` with the release commit SHA from the gallery registry.

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/holmhq/cdn@main/libs/ui/kerala-district-map/v-0.0.1/kerala-district-map.min.mjs"></script>

<kerala-district-map></kerala-district-map>
```

A Malayalam rainfall example with data, labels, and the built-in legend:

```html
<kerala-district-map
  locale="ml"
  labels="id"
  size="520"
  tint-color="#0ea5e9"
  heading="കേരള മഴ"
  subheading="സാമ്പിൾ മൺസൂൺ സൂചിക"
  legend="gradient"
  legend-title="മഴ"
  value-suffix=" mm"
  selected-district="ernakulam"
  data='{
    "kasaragod":{"value":312,"rank":"#8","zone":"North"},
    "kannur":{"value":348,"rank":"#5","zone":"North"},
    "wayanad":{"value":414,"rank":"#1","zone":"High range"},
    "kozhikode":{"value":362,"rank":"#4","zone":"North coast"},
    "malappuram":{"value":331,"rank":"#7","zone":"Central"},
    "palakkad":{"value":226,"rank":"#14","zone":"Gap"},
    "thrissur":{"value":284,"rank":"#11","zone":"Central"},
    "ernakulam":{"value":292,"rank":"#10","zone":"Metro"},
    "idukki":{"value":405,"rank":"#2","zone":"High range"},
    "kottayam":{"value":338,"rank":"#6","zone":"Midland"},
    "alappuzha":{"value":276,"rank":"#12","zone":"Backwaters"},
    "pathanamthitta":{"value":388,"rank":"#3","zone":"Forest edge"},
    "kollam":{"value":302,"rank":"#9","zone":"South coast"},
    "thiruvananthapuram":{"value":252,"rank":"#13","zone":"Capital"}
  }'
></kerala-district-map>
```

## Data model

Set data with the `data` JSON attribute, the `data` property, or `setData()`.

Keys can be stable district IDs, slugs, English names, accepted aliases, or exact Malayalam names:

```js
const map = document.querySelector('kerala-district-map');

map.setData({
  ernakulam: { value: 292, rank: '#10', zone: 'Metro' },
  9: { value: 405, rank: '#2', zone: 'High range' },
  'തിരുവനന്തപുരം': { value: 252, rank: '#13', zone: 'Capital' }
});
```

Values can be raw numbers or objects. The numeric field defaults to `value`; change it with `value-key`. Extra object fields are available to hover templates and appear in the default details UI. A per-district `color` or `fill` overrides the generated choropleth color.

## District IDs

| ID | Slug | English | Malayalam | Notes |
| --- | --- | --- | --- | --- |
| 1 | `kasaragod` | Kasaragod | കാസർഗോഡ് | Alias: `kasargod` |
| 2 | `kannur` | Kannur | കണ്ണൂർ |  |
| 3 | `wayanad` | Wayanad | വയനാട് |  |
| 4 | `kozhikode` | Kozhikode | കോഴിക്കോട് | Alias: `calicut` |
| 5 | `malappuram` | Malappuram | മലപ്പുറം |  |
| 6 | `palakkad` | Palakkad | പാലക്കാട് |  |
| 7 | `thrissur` | Thrissur | തൃശ്ശൂർ |  |
| 8 | `ernakulam` | Ernakulam | എറണാകുളം |  |
| 9 | `idukki` | Idukki | ഇടുക്കി |  |
| 10 | `kottayam` | Kottayam | കോട്ടയം |  |
| 11 | `alappuzha` | Alappuzha | ആലപ്പുഴ |  |
| 12 | `pathanamthitta` | Pathanamthitta | പത്തനംതിട്ട |  |
| 13 | `kollam` | Kollam | കൊല്ലം |  |
| 14 | `thiruvananthapuram` | Thiruvananthapuram | തിരുവനന്തപുരം | Alias: `trivandrum` |

## Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | JSON object | `{}` | District-keyed data. Keys may be id, slug, English name, Malayalam name, or accepted alias. |
| `value-key` | string | `value` | Object field used as the numeric choropleth value. |
| `domain-min`, `domain-max` | number | auto | Lock the numeric color-scale domain. |
| `value-label` | string | `Value` | Label used by the default legend/details copy. |
| `value-suffix` | string | empty | Appended to displayed values and legend endpoints. |
| `mode` | enum | `system` | `light`, `dark`, or `system`; system follows `prefers-color-scheme`. |
| `tint-color` | CSS hex color | `#14b8a6` | Seed color for generated choropleth and strokes. Neutral seeds use a neutral ramp. |
| `empty-color` | CSS color | `#e5e7eb` | Fill for districts with missing/non-numeric values. |
| `size` | number | `480` | Desired map width in px, clamped by the component. CSS max-width still applies. |
| `labels` | enum | `off` | `off`, `id`, or `name`. Name labels follow `locale`. |
| `locale` | enum | `en` | `en` or `ml`; `lang="ml"` also activates Malayalam display names. |
| `font-en` | enum | `inter` | English/Latin/default text preset: `inter`, `system`, `baloo-chettan-2`, or `malayalam-system`. |
| `font-ml` | enum | `baloo-chettan-2` | Malayalam text preset: `baloo-chettan-2` or `system`. |
| `load-google-fonts` | boolean | off | Explicit opt-in to load selected Google Fonts. Without it, fallback stacks are used. |
| `selected-district` | id/slug/name | empty | Select and highlight a district. Exact Malayalam names are accepted. |
| `hover-template` | trusted HTML string | built-in | Template for tooltip/details content. Placeholders include `{id}`, `{code}`, `{name}`, `{displayName}`, `{nameEn}`, `{nameMl}`, `{slug}`, `{value}`, `{rawValue}`, `{normalized}`, `{fields}`, and data keys. |
| `heading`, `subheading` | string | empty | Enables the built-in header overlay. |
| `header-position` | enum | `top-right` | `top-left`, `top-right`, `bottom-left`, or `bottom-right`. |
| `legend` | enum/boolean | `off` | `gradient`, empty boolean attr, or `true` show the auto gradient legend. `off` hides it. |
| `legend-title` | string | value label | Auto legend title. |
| `legend-min-label`, `legend-max-label` | string | domain endpoints | Override legend endpoint labels. |
| `legend-position` | enum | `bottom-left` | Same position values as `header-position`. |
| `border-color`, `hover-border-color`, `selected-border-color` | CSS color or `auto` | `auto` | District boundary stroke overrides. |
| `border-width`, `hover-border-width`, `selected-border-width` | number | `1.05`, `1.55`, `1.8` | SVG stroke widths. |

## Fonts and Malayalam support

The component is script-aware inside its Shadow DOM:

- English/Latin/default text uses `font-en`.
- Malayalam text detected in built-in content uses `font-ml`.
- `Baloo Chettan 2` includes Latin glyphs. If you like the consistent look, intentionally set both font presets to Baloo:

```html
<kerala-district-map
  font-en="baloo-chettan-2"
  font-ml="baloo-chettan-2"
  load-google-fonts
></kerala-district-map>
```

`load-google-fonts` is intentionally off by default. If it is enabled, the component appends a Google Fonts stylesheet for the selected presets; if the request is blocked, normal font fallback still renders text.

## Properties and methods

| API | Description |
| --- | --- |
| `districts` | Read-only copy of the stable district list. |
| `data` | Get/set the district-keyed data object. |
| `selectedDistrict` | Get selected district ID or set via id/slug/name. |
| `setData(valuesByDistrict)` | Replace data and rerender; returns the element. |
| `setTintColor(color)` | Set `tint-color`; returns the element. |
| `setHoverTemplate(html)` | Set or clear trusted tooltip/details template; returns the element. |
| `setLabels(mode)` | Set `off`, `id`, or `name`; returns the element. |
| `getDistrict(idOrSlugOrName)` | Return normalized district metadata or `null`. |
| `getDistrictData(idOrSlugOrName)` | Return normalized data for a district or `null`. |
| `highlightDistrict(idOrSlugOrName)` | Select/highlight a district; returns the element. |
| `clearSelection()` | Clear selection and mobile details; returns the element. |

## Events

All events bubble and are composed.

| Event | When | `event.detail` |
| --- | --- | --- |
| `district-hover` | Pointer enters a district and desktop hover is active. | `{ id, slug, name, displayName, nameEn, nameMl, district, value, data, normalized, source }` |
| `district-leave` | Pointer leaves a district. | Same shape as `district-hover`. |
| `district-select` | User clicks/taps or keyboard-selects a district. | Same shape as `district-hover`. |

```js
map.addEventListener('district-select', (event) => {
  console.log(event.detail.slug, event.detail.value, event.detail.data);
});
```

## Styling hooks

Primary custom properties:

| Property | Default | Purpose |
| --- | --- | --- |
| `--kerala-district-map-size` | attribute-driven | Map width override. |
| `--kerala-district-map-background` | `transparent` | Frame background. |
| `--kerala-district-map-stroke` | tint/mode derived | Base district boundary. |
| `--kerala-district-map-hover-stroke` | tint/mode derived | Hover/focus boundary. |
| `--kerala-district-map-selected-stroke` | tint/mode derived | Selected boundary. |
| `--kerala-district-map-empty-fill` | `#e5e7eb` | Missing-data fill. |
| `--kerala-district-map-font-family` | unset | Override all component text. |
| `--kerala-district-map-font-en-family` | preset stack | Override English/Latin font stack. |
| `--kerala-district-map-font-ml-family` | preset stack | Override Malayalam font stack. |
| `--kerala-district-map-label-font` | font stack | Override SVG label font. |
| `--kerala-district-map-label-color` | mode derived | SVG label color. |
| `--kerala-district-map-popup-background` | mode derived translucent | Tooltip/mobile card background. |
| `--kerala-district-map-popup-color` | mode derived | Tooltip/mobile card text. |
| `--kerala-district-map-popup-backdrop-filter` | `blur(18px) saturate(1.35)` | Tooltip/mobile card glass effect. |
| `--kerala-district-map-overlay-background` | mode derived translucent | Header/legend background. |
| `--kerala-district-map-overlay-backdrop-filter` | `blur(18px) saturate(1.35)` | Header/legend glass effect. |
| `--kerala-district-map-overlay-shadow` | mode derived | Header/legend shadow. |
| `--kerala-district-map-overlay-inset` | `8px` | Header/legend inset. |
| `--kerala-district-map-header-weight` | locale-aware | Header title weight. |
| `--kerala-district-map-header-line-height` | locale-aware | Header title line-height. |
| `--kerala-district-map-header-letter-spacing` | locale-aware | Header title tracking. |
| `--kerala-district-map-legend-height` | `9px` | Auto legend swatch height. |

Parts exposed: `base`, `district`, `selected-district`, `header`, `default-header`, `legend`, `auto-legend`, `legend-swatch`, `tooltip`, `tap-hint`, `selection-card`, `selection-close`, `selection-content`.

## Accessibility and interaction

- Each district path is focusable and exposed as a button.
- `Enter`/`Space` selects a focused district.
- Arrow keys move focus through the district list; `Home`/`End` jump to first/last district.
- SVG metadata and district `aria-label`s follow the active locale.
- A screen-reader-only summary lists district values.
- Hover/tap UI is pointer-aware: desktop gets an edge-aware tooltip; coarse pointers get a bottom details card.
- Motion is limited to short transitions and disabled via `prefers-reduced-motion`.

## Slots

Use slots when app-specific chrome is better than the built-in header/legend.

```html
<kerala-district-map legend="off">
  <div slot="header">Custom KPI block</div>
  <div slot="legend">Custom categorical legend</div>
</kerala-district-map>
```

## Local development

```sh
cd ~/Projects/holmhq/cdn/libs/ui/kerala-district-map
npm install
node build.js
python3 -m http.server 8090
```

Open `example.html` through the local server.

## Publish

From the CDN repo root, after source/docs/gallery review:

```sh
cd ~/Projects/holmhq/cdn
node scripts/validate-gallery.mjs
scripts/publish.sh ui kerala-district-map 0.0.1
```

Do not push/deploy until the release commits and gallery registry have been reviewed.

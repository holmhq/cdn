# cdn

First-party browser libraries for holm-apps, served via jsDelivr and Vercel.

- **jsDelivr**: `https://cdn.jsdelivr.net/gh/holmhq/cdn@<ref>/libs/...`
- **Source repo**: <https://github.com/holmhq/cdn>

## What's here

This repo hosts **first-party libraries we authored**. Third-party
packages (pica, preact, etc.) are imported directly from their own CDNs
— we don't mirror them.

## Layout

```
libs/
└── ui/                       # UI components, widgets, animations
    ├── feed-stars/           # 5-star rating custom element
    ├── mood-reactions/       # animated reaction picker
    ├── pulse-faces/          # animated sentiment faces
    ├── flow-globe/           # geospatial flow map custom element
    ├── poster-charts/        # editorial SVG infographic charts
    ├── kerala-district-map/  # Kerala district choropleth/map custom element
    └── spin-maze/            # iframe-isolated rotating maze game
        ├── src/  build.js  package.json  README.md
        ├── v-0.0.1/  v-latest → v-0.0.1
```

Each lib's source, build script, and published versions are co-located.
`v-X.Y.Z/` folders are immutable.

## Using a lib

Pin to a specific version in production:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/gh/holmhq/cdn@main/libs/ui/feed-stars/v-0.0.2/feed-stars.min.mjs"
></script>
```

For commit-immutable caching, replace `@main` with a commit SHA.

## Examples

- `examples/codepen-showcase/` demonstrates the CodePen conversions with
  themed variations and custom data/levels.

## Publishing

```sh
scripts/publish.sh <category> <name> <version>
# example:
scripts/publish.sh ui feed-stars 0.0.3
```

The script installs build deps, runs `node build.js`, copies dist into
`v-X.Y.Z/`, updates `v-latest`, and commits. Push to deploy.

## Adding a new lib

1. `mkdir libs/ui/<name>` (or future category)
2. Drop in `src/`, `build.js`, `package.json`, `README.md`
3. Run the publish script for `v-0.0.1`

See `CLAUDE.md` for full conventions and the no-third-party-mirroring
policy.

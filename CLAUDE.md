# cdn — first-party browser libraries for holm

Single home for first-party JS libs we serve to our holm-apps. Consumers
load these via jsDelivr (the GitHub mirror) or Vercel.

- **GitHub**: `holmhq/cdn` (public)
- **jsDelivr**: `https://cdn.jsdelivr.net/gh/holmhq/cdn@<ref>/<path>`

## Mission

`libs/` contains **first-party libraries we author**. That's it.

### What we DO NOT do

- **No third-party mirrors.** If a package ships on npm, consumers import it
  directly from `https://cdn.jsdelivr.net/npm/<pkg>@<ver>/+esm` or its own
  CDN. We don't copy `pica`, `preact`, `openai-sdk`, etc. into this repo.
- **No wrappers around third-party libs.** If you need a 10-line helper
  around pica to compress images, that helper lives in the consuming app,
  not here. Wrappers are a maintenance trap and add nothing the consumer
  can't write inline.
- **No `v-latest` for production pinning.** `v-latest` is a convenience
  symlink for dev/one-off scripts; production consumers pin to `v-X.Y.Z`.

### What we DO

- Host original components and utilities we wrote (e.g. `feed-stars` — a
  vanilla custom-element 5-star rating widget).
- Co-locate source, build script, and published `v-X.Y.Z/` folders inside
  each lib directory. No separate `pkgs/` or `src/` tree.

## Layout

```
libs/
├── ui/                          # UI components, widgets, animations
│   └── <name>/
│       ├── src/                 # source
│       ├── build.js             # source → dist
│       ├── package.json         # build deps only
│       ├── README.md
│       ├── v-X.Y.Z/<file>.min.mjs   # immutable published artifact
│       └── v-latest → v-X.Y.Z       # symlink (dev only)
└── (other categories appear when 5+ non-UI libs share a theme)
```

`v-X.Y.Z/` folders are **immutable** — never overwrite a published version.
A consumer pinned to `v-0.0.2` sees the same bytes forever.

## Adding a new lib

`scripts/publish.sh <category> <name> <version>` — installs build deps,
runs `node build.js`, copies `dist/*.{mjs,min.mjs}` into the new
`v-X.Y.Z/`, updates `v-latest`, commits. Vercel auto-deploys on push.

Before adding a category beyond `ui/`: check whether a flat `libs/<name>/`
works for now. Add a category only when 5+ libs naturally share one.

## URL conventions for consumers

```
# Production (pinned, immutable, cached forever)
https://cdn.jsdelivr.net/gh/holmhq/cdn@<commit-sha>/libs/ui/feed-stars/v-0.0.2/feed-stars.min.mjs

# Branch ref (12h jsDelivr cache — fine for dev)
https://cdn.jsdelivr.net/gh/holmhq/cdn@main/libs/ui/feed-stars/v-0.0.2/feed-stars.min.mjs
```

Always include `v-X.Y.Z/` in the path, even when using `@main`. The
version-folder is what guarantees no drift across releases.

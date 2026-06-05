#!/usr/bin/env bash
# Publish a new version of a first-party lib.
# Usage: scripts/publish.sh <category> <name> <version>
# Example: scripts/publish.sh ui feed-stars 0.0.3

set -euo pipefail

CATEGORY="${1:?category required (e.g. ui)}"
NAME="${2:?lib name required}"
VERSION="${3:?version required (e.g. 0.0.3)}"
REPO_ROOT="$(git rev-parse --show-toplevel)"

LIB_DIR="libs/$CATEGORY/$NAME"
DEST="$LIB_DIR/v-$VERSION"

if [[ ! -d "$LIB_DIR" ]]; then
  echo "error: $LIB_DIR does not exist" >&2
  exit 1
fi

if [[ -d "$DEST" ]]; then
  echo "error: $DEST already exists — versions are immutable" >&2
  exit 1
fi

cd "$LIB_DIR"

if [[ -f package.json ]]; then
  npm install --silent
fi

if [[ -f build.js ]]; then
  node build.js
elif [[ -f package.json ]] && grep -q '"build"' package.json; then
  npm run build
else
  echo "error: no build.js or build script found in $LIB_DIR" >&2
  exit 1
fi

if [[ ! -d dist ]]; then
  echo "error: build did not produce a dist/ directory" >&2
  exit 1
fi

mkdir -p "v-$VERSION"
cp dist/*.mjs "v-$VERSION/" 2>/dev/null || true
cp dist/*.min.mjs "v-$VERSION/" 2>/dev/null || true

if [[ ! -f gallery.json ]]; then
  echo "error: missing $LIB_DIR/gallery.json (required for released spec snapshot)" >&2
  rmdir "v-$VERSION" 2>/dev/null || true
  exit 1
fi
cp gallery.json "v-$VERSION/gallery.json"

if [[ -z "$(ls -A v-$VERSION/)" ]]; then
  echo "error: nothing copied into v-$VERSION/" >&2
  rmdir "v-$VERSION"
  exit 1
fi

rm -f v-latest
ln -s "v-$VERSION" v-latest

cd - > /dev/null
git add "$LIB_DIR/v-$VERSION" "$LIB_DIR/v-latest"
git commit -m "$NAME: v$VERSION"

cd "$REPO_ROOT"
node scripts/generate-registry.mjs
git add gallery/registry.json
git commit -m "gallery: regenerate registry ($NAME v$VERSION)"

echo
echo "Published $NAME v$VERSION at $DEST"
echo "Push with: git push"

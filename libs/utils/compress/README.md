# compress

Browser-side image compression. Resizes a `File` (or `Blob`) via native
`canvas.drawImage` and quality-steps JPEG output until the result is at
or below a target byte budget. No dependencies.

## Usage

```js
import { compressImage } from 'https://cdn.jsdelivr.net/gh/holmhq/cdn@main/libs/utils/compress/v-0.0.2/compress.min.mjs'

const blob = await compressImage(file, { maxBytes: 250_000, maxDim: 1536 })
formData.append('file', blob, 'upload.jpg')
```

## Options

- `maxBytes` (default `250_000`) — upper bound for the returned blob.
- `maxDim` (default `1536`) — long-edge cap in pixels before compression.

Returns a `Blob` (`image/jpeg`). Quality is stepped 0.85 → 0.75 → 0.65 →
0.55 → 0.5; if the smallest size still exceeds `maxBytes`, the 0.5-quality
blob is returned anyway (best effort, never throws on size).

## Why these defaults

- `250_000` bytes ≈ 250 KB, which fits comfortably under holm's 1 MiB
  egress request body cap with plenty of headroom for multipart framing.
- `1536` matches the largest output dimension we currently request from
  Azure image-edits — no point uploading a higher-resolution reference.

## Notes

- Uses `imageSmoothingQuality: 'high'` for the downscale. Quality is
  slightly below pica's lanczos but visually fine for upload-budget
  compression and works under fingerprinting protection (Brave, Firefox
  strict) which blocks the `getImageData` calls pica relies on.
- v-0.0.1 used pica; dropped in v-0.0.2 because of the fingerprinting
  block plus the dependency cost wasn't justified for this use case.

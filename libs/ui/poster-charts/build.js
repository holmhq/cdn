// Build poster-charts: copy src to dist as .mjs and emit a minified .min.mjs.
// Run with `node build.js`.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(here, 'src/poster-charts.js');
const distDir = resolve(here, 'dist');

const src = await readFile(srcPath, 'utf8');
await mkdir(distDir, { recursive: true });

await writeFile(resolve(distDir, 'poster-charts.mjs'), src);

const min = await minify(src, {
  module: true,
  ecma: 2020,
  compress: { passes: 2 },
  mangle: { properties: false },
  format: { comments: false },
});
if (min.error) throw min.error;
await writeFile(resolve(distDir, 'poster-charts.min.mjs'), min.code);

console.log(`built dist/poster-charts.mjs (${src.length} B) and dist/poster-charts.min.mjs (${min.code.length} B)`);

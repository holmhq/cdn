// Build spin-maze: copy src to dist as .mjs and emit a minified .min.mjs.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(here, 'src/spin-maze.js');
const distDir = resolve(here, 'dist');

const src = await readFile(srcPath, 'utf8');
await mkdir(distDir, { recursive: true });
await writeFile(resolve(distDir, 'spin-maze.mjs'), src);

const min = await minify(src, {
  module: true,
  ecma: 2020,
  compress: { passes: 2 },
  mangle: { properties: false },
  format: { comments: false },
});
if (min.error) throw min.error;
await writeFile(resolve(distDir, 'spin-maze.min.mjs'), min.code);

console.log(`built dist/spin-maze.mjs (${src.length} B) and dist/spin-maze.min.mjs (${min.code.length} B)`);

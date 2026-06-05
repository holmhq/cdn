#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { generateRegistry } from './gallery-tools.mjs';

export { generateRegistry };

async function main() {
  const registry = await generateRegistry({ repoRoot: process.cwd() });
  console.log(`Generated gallery/registry.json with ${registry.components.length} components`);
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

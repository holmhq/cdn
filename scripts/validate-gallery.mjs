#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { validateGallerySpecs } from './gallery-tools.mjs';

export { validateGallerySpecs };

async function main() {
  const result = await validateGallerySpecs({ repoRoot: process.cwd() });
  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`error: ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${result.specsChecked} gallery specs`);
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

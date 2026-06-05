import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { validateGallerySpecs } from '../validate-gallery.mjs';
import { generateRegistry } from '../generate-registry.mjs';

function makeSpec({ category, name, tagName = name, moduleFile = `${name}.min.mjs` }) {
  return {
    schemaVersion: 1,
    component: {
      category,
      name,
      tagName,
      title: `${name} title`,
      summary: `${name} summary`,
      status: 'stable',
      tags: ['demo'],
    },
    module: {
      file: moduleFile,
      format: 'esm',
      defines: [tagName],
      sideEffects: 'custom-elements-define',
    },
    stories: [
      {
        id: 'default',
        title: 'Default',
        html: `<${tagName}></${tagName}>`,
      },
    ],
    snippets: [],
    docs: {
      attributes: [],
      events: [],
    },
  };
}

async function writeJson(filePath, data) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function addComponent(repoRoot, { category = 'ui', dirName, specName = dirName, versions = [] }) {
  const libPath = join(repoRoot, 'libs', category, dirName);
  const rootSpec = makeSpec({ category, name: specName });
  await writeJson(join(libPath, 'gallery.json'), rootSpec);

  for (const version of versions) {
    const versionFolder = join(libPath, `v-${version}`);
    await mkdir(versionFolder, { recursive: true });
    await writeJson(join(versionFolder, 'gallery.json'), rootSpec);
    await writeFile(join(versionFolder, rootSpec.module.file), '// module\n');
  }

  return { libPath, rootSpec };
}

async function withFixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'gallery-tools-'));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('validator passes for valid root and released specs', async () => {
  await withFixture(async (repoRoot) => {
    await addComponent(repoRoot, { dirName: 'alpha-box', versions: ['0.0.1', '0.1.0'] });
    await addComponent(repoRoot, { dirName: 'beta-chip', versions: ['0.0.2'] });

    const result = await validateGallerySpecs({ repoRoot });
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
  });
});

test('validator fails when a required field is missing', async () => {
  await withFixture(async (repoRoot) => {
    await addComponent(repoRoot, { dirName: 'alpha-box', versions: ['0.0.1'] });
    await addComponent(repoRoot, { dirName: 'beta-chip', versions: ['0.0.1'] });

    const brokenPath = join(repoRoot, 'libs', 'ui', 'alpha-box', 'gallery.json');
    const broken = makeSpec({ category: 'ui', name: 'alpha-box' });
    delete broken.component.title;
    await writeJson(brokenPath, broken);

    const result = await validateGallerySpecs({ repoRoot });
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /component\.title/);
  });
});

test('validator fails for duplicate route slugs across components', async () => {
  await withFixture(async (repoRoot) => {
    await addComponent(repoRoot, { dirName: 'alpha-box', versions: ['0.0.1'] });
    await addComponent(repoRoot, { dirName: 'beta-chip', specName: 'alpha-box', versions: ['0.0.1'] });

    const result = await validateGallerySpecs({ repoRoot });
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /Duplicate route slug/);
  });
});

test('validator fails when released module file is missing', async () => {
  await withFixture(async (repoRoot) => {
    await addComponent(repoRoot, { dirName: 'alpha-box', versions: ['0.0.1'] });

    await rm(join(repoRoot, 'libs', 'ui', 'alpha-box', 'v-0.0.1', 'alpha-box.min.mjs'));

    const result = await validateGallerySpecs({ repoRoot });
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /module file .* is missing/);
  });
});

test('validator fails for invalid semver version folder names', async () => {
  await withFixture(async (repoRoot) => {
    await addComponent(repoRoot, { dirName: 'alpha-box', versions: ['0.0.1'] });
    const invalidFolder = join(repoRoot, 'libs', 'ui', 'alpha-box', 'v-next');
    await mkdir(invalidFolder, { recursive: true });

    const result = await validateGallerySpecs({ repoRoot });
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /invalid version folder/);
  });
});

test('generator selects highest semver release and emits sha-pinned urls', async () => {
  await withFixture(async (repoRoot) => {
    await addComponent(repoRoot, { dirName: 'alpha-box', versions: ['0.0.2', '0.0.10'] });

    const registry = await generateRegistry({
      repoRoot,
      sourceRepo: 'holmhq/cdn',
      generatedAt: '2026-06-05T00:00:00.000Z',
      resolveReleaseSha: async () => 'abc1234',
      writeFile: false,
    });

    assert.equal(registry.components.length, 1);

    const [entry] = registry.components;
    assert.equal(entry.latestVersion, '0.0.10');
    assert.equal(entry.versionFolder, 'v-0.0.10');
    assert.equal(entry.releaseSha, 'abc1234');
    assert.equal(
      entry.moduleUrl,
      'https://cdn.jsdelivr.net/gh/holmhq/cdn@abc1234/libs/ui/alpha-box/v-0.0.10/alpha-box.min.mjs',
    );
    assert.equal(
      entry.specUrl,
      'https://cdn.jsdelivr.net/gh/holmhq/cdn@abc1234/libs/ui/alpha-box/v-0.0.10/gallery.json',
    );
    assert.equal(entry.stories[0].id, 'default');
  });
});

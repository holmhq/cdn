import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, relative } from 'node:path';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const VERSION_DIR = /^v-(\d+)\.(\d+)\.(\d+)$/;
const STATUS_VALUES = new Set(['experimental', 'stable', 'deprecated']);
const STORY_THEME_VALUES = new Set(['both', 'light', 'dark']);
const SNIPPET_LANG_VALUES = new Set(['html', 'css', 'js']);

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path, errors) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    errors.push(`${path}: invalid JSON (${error.message})`);
    return null;
  }
}

function parseVersion(folder) {
  const match = VERSION_DIR.exec(folder);
  if (!match) return null;
  return {
    folder,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    text: `${match[1]}.${match[2]}.${match[3]}`,
  };
}

function compareVersionAsc(a, b) {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

function validateSpec(spec, { specPath, expectedCategory, componentPath, releasedDir }, errors) {
  const where = `${specPath}:`;
  if (!isObject(spec)) {
    errors.push(`${where} spec must be an object`);
    return;
  }

  if (spec.schemaVersion !== 1) {
    errors.push(`${where} schemaVersion must be 1`);
  }

  if (!isObject(spec.component)) {
    errors.push(`${where} component is required`);
  } else {
    for (const field of ['category', 'name', 'tagName', 'title', 'summary', 'status']) {
      if (!hasText(spec.component[field])) {
        errors.push(`${where} component.${field} is required`);
      }
    }

    if (!Array.isArray(spec.component.tags) || spec.component.tags.some((tag) => !hasText(tag))) {
      errors.push(`${where} component.tags must be an array of strings`);
    }

    if (hasText(spec.component.status) && !STATUS_VALUES.has(spec.component.status)) {
      errors.push(`${where} component.status must be experimental|stable|deprecated`);
    }

    if (hasText(spec.component.category) && spec.component.category !== expectedCategory) {
      errors.push(
        `${where} component.category (${spec.component.category}) does not match libs/${expectedCategory}/ for ${componentPath}`,
      );
    }
  }

  if (!isObject(spec.module)) {
    errors.push(`${where} module is required`);
  } else {
    for (const field of ['file', 'format', 'sideEffects']) {
      if (!hasText(spec.module[field])) {
        errors.push(`${where} module.${field} is required`);
      }
    }

    if (!Array.isArray(spec.module.defines) || spec.module.defines.some((tag) => !hasText(tag))) {
      errors.push(`${where} module.defines must be an array of strings`);
    }

    if (hasText(spec.module.format) && spec.module.format !== 'esm') {
      errors.push(`${where} module.format must be esm`);
    }
  }

  if (!Array.isArray(spec.stories) || spec.stories.length === 0) {
    errors.push(`${where} stories must contain at least one story`);
  } else {
    const storyIds = new Set();
    for (const story of spec.stories) {
      if (!isObject(story)) {
        errors.push(`${where} stories rows must be objects`);
        continue;
      }

      for (const field of ['id', 'title', 'html']) {
        if (!hasText(story[field])) {
          errors.push(`${where} stories[].${field} is required`);
        }
      }

      if (hasText(story.id)) {
        if (storyIds.has(story.id)) {
          errors.push(`${where} duplicate story id: ${story.id}`);
        }
        storyIds.add(story.id);
      }

      if (story.theme !== undefined && !STORY_THEME_VALUES.has(story.theme)) {
        errors.push(`${where} stories[].theme must be both|light|dark`);
      }
    }
  }

  if (spec.snippets !== undefined) {
    if (!Array.isArray(spec.snippets)) {
      errors.push(`${where} snippets must be an array`);
    } else {
      for (const snippet of spec.snippets) {
        if (!isObject(snippet)) {
          errors.push(`${where} snippets rows must be objects`);
          continue;
        }

        for (const field of ['id', 'title', 'language', 'code']) {
          if (!hasText(snippet[field])) {
            errors.push(`${where} snippets[].${field} is required`);
          }
        }

        if (hasText(snippet.language) && !SNIPPET_LANG_VALUES.has(snippet.language)) {
          errors.push(`${where} snippets[].language must be html|css|js`);
        }
      }
    }
  }

  if (!isObject(spec.docs)) {
    errors.push(`${where} docs is required`);
  } else {
    if (!Array.isArray(spec.docs.attributes)) {
      errors.push(`${where} docs.attributes must be an array`);
    }
    if (!Array.isArray(spec.docs.events)) {
      errors.push(`${where} docs.events must be an array`);
    }
  }

  if (releasedDir && hasText(spec.module?.file)) {
    const modulePath = join(releasedDir, spec.module.file);
    if (!releasedDir || !modulePath) {
      return;
    }

    return exists(modulePath).then((present) => {
      if (!present) {
        errors.push(`${where} released module file ${modulePath} is missing`);
      }
    });
  }

  return undefined;
}

async function listComponentDirs(repoRoot) {
  const libsRoot = join(repoRoot, 'libs');
  const categories = await readdir(libsRoot, { withFileTypes: true });
  const components = [];

  for (const categoryEntry of categories) {
    if (!categoryEntry.isDirectory()) continue;
    const category = categoryEntry.name;
    const categoryPath = join(libsRoot, category);
    const names = await readdir(categoryPath, { withFileTypes: true });

    for (const nameEntry of names) {
      if (!nameEntry.isDirectory()) continue;
      components.push({
        category,
        name: nameEntry.name,
        libPath: join(categoryPath, nameEntry.name),
        relLibPath: `libs/${category}/${nameEntry.name}`,
      });
    }
  }

  return components;
}

async function collectComponentState(repoRoot) {
  const components = await listComponentDirs(repoRoot);
  const entries = [];
  const errors = [];
  const slugOwners = new Map();

  for (const component of components) {
    const dirEntries = (await readdir(component.libPath, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && entry.name.startsWith('v-'))
      .sort((a, b) => a.name.localeCompare(b.name));

    const validVersions = [];
    for (const versionEntry of dirEntries) {
      const parsed = parseVersion(versionEntry.name);
      if (!parsed) {
        errors.push(`${component.relLibPath}: invalid version folder ${versionEntry.name}`);
        continue;
      }
      validVersions.push(parsed);
    }

    const rootSpecPath = join(component.libPath, 'gallery.json');
    if (await exists(rootSpecPath)) {
      const rootSpec = await readJson(rootSpecPath, errors);
      if (rootSpec) {
        entries.push({ ...component, spec: rootSpec, specPath: rootSpecPath, version: null, versionFolder: null });
        const moduleCheck = validateSpec(rootSpec, {
          specPath: rootSpecPath,
          expectedCategory: component.category,
          componentPath: component.relLibPath,
          releasedDir: null,
        }, errors);
        if (moduleCheck) await moduleCheck;

        const slug = rootSpec?.component?.name;
        if (hasText(slug)) {
          const existing = slugOwners.get(slug);
          if (existing && existing !== component.relLibPath) {
            errors.push(`${rootSpecPath}: Duplicate route slug '${slug}' also used by ${existing}`);
          } else {
            slugOwners.set(slug, component.relLibPath);
          }
        }
      }
    }

    for (const version of validVersions) {
      const versionFolder = `v-${version.text}`;
      const releasedDir = join(component.libPath, versionFolder);
      const releasedSpecPath = join(releasedDir, 'gallery.json');
      if (!(await exists(releasedSpecPath))) continue;

      const releasedSpec = await readJson(releasedSpecPath, errors);
      if (!releasedSpec) continue;

      entries.push({ ...component, spec: releasedSpec, specPath: releasedSpecPath, version: version.text, versionFolder });
      const moduleCheck = validateSpec(releasedSpec, {
        specPath: releasedSpecPath,
        expectedCategory: component.category,
        componentPath: component.relLibPath,
        releasedDir,
      }, errors);
      if (moduleCheck) await moduleCheck;

      const slug = releasedSpec?.component?.name;
      if (hasText(slug)) {
        const existing = slugOwners.get(slug);
        if (existing && existing !== component.relLibPath) {
          errors.push(`${releasedSpecPath}: Duplicate route slug '${slug}' also used by ${existing}`);
        } else {
          slugOwners.set(slug, component.relLibPath);
        }
      }
    }

  }

  return { components, entries, errors };
}

export async function validateGallerySpecs({ repoRoot = process.cwd() } = {}) {
  const { entries, errors } = await collectComponentState(repoRoot);
  return {
    ok: errors.length === 0,
    errors,
    specsChecked: entries.length,
  };
}

async function resolveReleaseShaWithGit(repoRoot, relVersionPath) {
  const added = await execFile('git', ['log', '--diff-filter=A', '--format=%H', '--', relVersionPath], {
    cwd: repoRoot,
  });
  const addedSha = added.stdout.trim().split('\n').find(Boolean);
  if (addedSha) return addedSha;

  const touched = await execFile('git', ['rev-list', '-n', '1', 'HEAD', '--', relVersionPath], {
    cwd: repoRoot,
  });
  const touchedSha = touched.stdout.trim();
  if (touchedSha) return touchedSha;

  throw new Error(`Unable to resolve releaseSha for ${relVersionPath}`);
}

function compareVersionDesc(a, b) {
  return compareVersionAsc(b, a);
}

export async function generateRegistry({
  repoRoot = process.cwd(),
  sourceRepo = 'holmhq/cdn',
  generatedAt = new Date().toISOString(),
  outputPath = join(repoRoot, 'gallery', 'registry.json'),
  resolveReleaseSha,
  writeFile: shouldWrite = true,
} = {}) {
  const validation = await validateGallerySpecs({ repoRoot });
  if (!validation.ok) {
    throw new Error(`Gallery validation failed:\n${validation.errors.join('\n')}`);
  }

  const components = await listComponentDirs(repoRoot);
  const entries = [];

  for (const component of components) {
    const dirEntries = await readdir(component.libPath, { withFileTypes: true });
    const releases = dirEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => parseVersion(entry.name))
      .filter(Boolean)
      .sort(compareVersionDesc);

    let selected = null;
    for (const version of releases) {
      const versionFolder = `v-${version.text}`;
      const releasedDir = join(component.libPath, versionFolder);
      const specPath = join(releasedDir, 'gallery.json');
      if (!(await exists(specPath))) continue;

      const spec = JSON.parse(await readFile(specPath, 'utf8'));
      selected = { version, versionFolder, releasedDir, specPath, spec };
      break;
    }

    if (!selected) continue;

    const relVersionPath = relative(repoRoot, selected.releasedDir).replaceAll('\\', '/');
    const relSpecPath = `${relVersionPath}/gallery.json`;
    const releaseSha = resolveReleaseSha
      ? await resolveReleaseSha({ repoRoot, relVersionPath, component })
      : await resolveReleaseShaWithGit(repoRoot, relVersionPath);

    entries.push({
      category: component.category,
      name: component.name,
      slug: selected.spec.component.name,
      tagName: selected.spec.component.tagName,
      title: selected.spec.component.title,
      summary: selected.spec.component.summary,
      status: selected.spec.component.status,
      tags: selected.spec.component.tags,
      latestVersion: selected.version.text,
      versionFolder: selected.versionFolder,
      releaseSha,
      libPath: component.relLibPath,
      moduleFile: selected.spec.module.file,
      moduleUrl: `https://cdn.jsdelivr.net/gh/${sourceRepo}@${releaseSha}/${relVersionPath}/${selected.spec.module.file}`,
      specPath: relSpecPath,
      specUrl: `https://cdn.jsdelivr.net/gh/${sourceRepo}@${releaseSha}/${relSpecPath}`,
      stories: selected.spec.stories,
      snippets: selected.spec.snippets ?? [],
      docs: selected.spec.docs,
    });
  }

  entries.sort((a, b) => a.slug.localeCompare(b.slug));

  const registry = {
    schemaVersion: 1,
    generatedAt,
    sourceRepo,
    components: entries,
  };

  if (shouldWrite) {
    await mkdir(join(repoRoot, 'gallery'), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(registry, null, 2)}\n`);
  }

  return registry;
}

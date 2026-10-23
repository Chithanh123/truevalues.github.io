import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFile, lstat, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildSite, PROJECT_ROOT, SITE_FILES } from '../scripts/build-site.js';

async function withDirectory(run) {
  const directory = await mkdtemp(path.join(tmpdir(), 'political-context-build-test-'));
  try { await run(directory); } finally { await rm(directory, { recursive: true, force: true }); }
}

async function filesIn(directory, prefix = '') {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) found.push(...await filesIn(path.join(directory, entry.name), relative));
    else found.push(relative.split(path.sep).join('/'));
  }
  return found.sort();
}

test('site artifact contains exactly the public allowlist and preserves file bytes', async () => {
  await withDirectory(async directory => {
    const target = path.join(directory, 'site');
    const result = await buildSite(target);
    const expected = [...SITE_FILES, '.nojekyll'].sort();
    assert.deepEqual(await filesIn(target), expected);
    assert.deepEqual(result.files, expected);
    for (const relative of SITE_FILES) {
      assert.deepEqual(await readFile(path.join(target, relative)), await readFile(path.join(PROJECT_ROOT, relative)));
    }
    assert.ok(!result.files.some(file => /(^|\/)(\.git|tests|scripts)(\/|$)/.test(file)));
    assert.ok(!result.files.includes('package.json'));
    assert.ok(!result.files.includes('questions.js'));
    for (const reviewFile of [
      'review.html', 'js/review.js', 'js/translations/vi-items.js',
      'js/translations/vi-worlds.js', 'docs/DESIGN-MATRIX.md', 'docs/PROGRESS.md',
      'js/foundations.js', 'js/translations/vi-foundations.js', 'docs/FOUNDATIONS.md',
      'js/foundation-evidence.js', 'js/review-evidence.js', 'js/review-notes.js', 'docs/SOURCES.md',
    ]) assert.ok(result.files.includes(reviewFile), `Missing bilingual review asset: ${reviewFile}`);
  });
});

test('repeat builds remove stale generated files and produce identical public bytes', async () => {
  await withDirectory(async directory => {
    const target = path.join(directory, 'site');
    await buildSite(target);
    const before = new Map(await Promise.all((await filesIn(target)).map(async relative => [relative, await readFile(path.join(target, relative))])));
    await writeFile(path.join(target, 'stale-export.json'), '{"private":"must not be published"}');
    await buildSite(target);
    assert.deepEqual(await filesIn(target), [...before.keys()]);
    for (const [relative, bytes] of before) assert.deepEqual(await readFile(path.join(target, relative)), bytes);
  });
});

test('builder preserves unowned directories and refuses protected destinations', async () => {
  await withDirectory(async directory => {
    const target = path.join(directory, 'unowned');
    await mkdir(target);
    await writeFile(path.join(target, 'keep.txt'), 'user work');
    await assert.rejects(buildSite(target), /not owned/);
    assert.equal(await readFile(path.join(target, 'keep.txt'), 'utf8'), 'user work');
    const forbidden = [PROJECT_ROOT, path.dirname(PROJECT_ROOT), path.join(PROJECT_ROOT, 'js'), path.join(PROJECT_ROOT, 'dist', 'nested'), '/', tmpdir()];
    for (const destination of forbidden) await assert.rejects(buildSite(destination), /Unsafe output/);
    await assert.rejects(buildSite(''), /non-empty/);
  });
});

test('builder rejects symlink destinations, parent escapes, and stale output links', async () => {
  await withDirectory(async directory => {
    const actual = path.join(directory, 'actual');
    await mkdir(actual);
    const alias = path.join(directory, 'alias');
    await symlink(actual, alias, 'dir');
    await assert.rejects(buildSite(alias), /symlink/);
    await assert.rejects(buildSite(path.join(alias, 'site')), /symlink/);
    assert.deepEqual(await readdir(actual), []);
    const target = path.join(directory, 'site');
    await buildSite(target);
    await symlink(actual, path.join(target, 'escape'), 'dir');
    await assert.rejects(buildSite(target), /symlink/);
    assert.deepEqual(await readdir(actual), []);
  });
});


test('builder refuses an allowlisted source symlink before creating output', async () => {
  await withDirectory(async directory => {
    const fixture = path.join(directory, 'fixture');
    await mkdir(path.join(fixture, 'scripts'), { recursive: true });
    await writeFile(path.join(fixture, 'package.json'), '{"type":"module"}');
    await copyFile(path.join(PROJECT_ROOT, 'scripts/build-site.js'), path.join(fixture, 'scripts/build-site.js'));
    for (const relative of SITE_FILES.filter(file => file !== 'assets/mark.svg')) {
      const destination = path.join(fixture, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(path.join(PROJECT_ROOT, relative), destination);
    }
    await mkdir(path.join(fixture, 'assets'));
    const outside = path.join(directory, 'unpublished.svg');
    await writeFile(outside, 'test-only private fixture');
    await symlink(outside, path.join(fixture, 'assets/mark.svg'));
    const isolated = await import(pathToFileURL(path.join(fixture, 'scripts/build-site.js')).href);
    await assert.rejects(isolated.buildSite(), /symlink/);
    await assert.rejects(lstat(path.join(fixture, 'dist')), { code: 'ENOENT' });
    assert.equal(await readFile(outside, 'utf8'), 'test-only private fixture');
  });
});

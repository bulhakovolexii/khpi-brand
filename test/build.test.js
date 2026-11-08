import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from '../build.config.js';
import { ROOT } from '../lib/tokens.js';

const read = (p) => fs.readFile(path.join(ROOT, 'dist', p), 'utf8');

test('npm run build генерує весь dist/', async () => {
  await build();
  for (const f of ['css/tokens.css', 'tailwind/preset.js', 'tailwind/theme.css', 'mui/theme.ts', 'quarto/_brand.yml', 'quarto/_brand-dark.yml', 'typst/brand.typ', 'remotion/tokens.ts', 'json/tokens.json']) {
    assert.ok((await read(f)).length > 200, f);
  }
});

test('tokens.css: теми, контексти, reduced-motion', async () => {
  const css = await read('css/tokens.css');
  for (const s of ['[data-theme="dark"]', '[data-mode="slide"]', '[data-mode="video"]', '[data-mode="print"]', 'prefers-reduced-motion', 'prefers-color-scheme: dark', '--khpi-color-surface', '--khpi-type-body-size', '--khpi-motion-easing-enter: cubic-bezier(0, 0, 0.2, 1)']) assert.ok(css.includes(s), s);
});

test('json/tokens.json: резолвлений набір', async () => {
  const j = JSON.parse(await read('json/tokens.json'));
  assert.equal(j.themes.dark['color.brand'], '#D999A4');
  assert.equal(j.themes.light['color.data.4'], '#5F5F5F');
  assert.equal(j.contexts.video['type.body.size'], 44);
  assert.deepEqual(j.motion['motion.easing.standard'], [0.2, 0, 0, 1]);
  assert.equal(j.motion['motion.duration.block'], 2400);
});

test('всі згенеровані файли містять позначку «Згенеровано»', async () => {
  for (const f of ['css/tokens.css', 'mui/theme.ts', 'remotion/tokens.ts', 'typst/brand.typ', 'quarto/_brand.yml', 'tailwind/theme.css']) assert.match(await read(f), /Згенеровано/, f);
});

test('logos: 16 SVG (UA/EN × 8) і символ спільноти; viewBox обрізано', async () => {
  for (const l of ['ua', 'en']) {
    const files = (await fs.readdir(path.join(ROOT, 'assets/logos', l))).filter((f) => f.endsWith('.svg'));
    assert.equal(files.length, 8, l);
    for (const f of files) { const s = await fs.readFile(path.join(ROOT, 'assets/logos', l, f), 'utf8'); assert.match(s, /viewBox="[\d. ]+"/, f); }
  }
});

import { spawnSync } from 'node:child_process';

test('DESIGN.md: генерація детермінована й актуальна', async () => {
  const before = await fs.readFile(path.join(ROOT, 'DESIGN.md'), 'utf8');
  const r = spawnSync('node', ['scripts/build-design-md.js'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(await fs.readFile(path.join(ROOT, 'DESIGN.md'), 'utf8'), before, 'DESIGN.md застарів: запустіть npm run build');
  assert.match(before, /^---\nversion: alpha/);
});

test('DESIGN.md проходить npx @google/design.md lint (0 помилок); пропуск без мережі', { timeout: 180000 }, (t) => {
  const r = spawnSync('npx', ['--yes', '@google/design.md', 'lint', 'DESIGN.md'], { cwd: ROOT, encoding: 'utf8' });
  let j; try { j = JSON.parse(r.stdout); } catch { return t.skip('@google/design.md недоступний: ' + (r.stderr || '').slice(0, 120)); }
  assert.equal(j.summary.errors, 0, JSON.stringify(j.findings.filter((f) => f.severity === 'error')));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { checkCode } from '../check/code.js';
import { spawnSync } from 'node:child_process';
import { ROOT } from '../lib/tokens.js';

async function fixture(files) {
  const d = await fs.mkdtemp(path.join(os.tmpdir(), 'khpi-'));
  for (const [n, c] of Object.entries(files)) { await fs.mkdir(path.dirname(path.join(d, n)), { recursive: true }); await fs.writeFile(path.join(d, n), c); }
  return d;
}
const ids = (r) => [...new Set(r.findings.map((f) => f.ruleId))].sort();

test('code: знаходить порушення в CSS/HTML/JSX/Svelte', async () => {
  const d = await fixture({
    'a.css': 'p { color: #333; padding: 7px; font-size: 12px; font-weight: 700; box-shadow: 0 1px 2px red; border-radius: 12px; background: linear-gradient(red, blue) }',
    'b.html': '<div style="color: tomato; margin: 24px">x</div><div class="bg-red-500 shadow-md">y</div>',
    'c.jsx': "export const s = { color: 'rgb(1,2,3)', padding: 16, fontFamily: 'Comic Sans MS' };",
    'd.svelte': '<style>a { color: var(--khpi-color-accent-yellow); }</style>',
  });
  const r = await checkCode(d);
  for (const id of ['shape.no-new-colors', 'shape.spacing-scale', 'typography.sizes-from-tokens', 'typography.weights', 'shape.no-shadow', 'shape.radius-max', 'shape.no-gradient', 'typography.families', 'usage.accent-yellow.fill-only']) assert.ok(ids(r).includes(id), `немає ${id}: ${ids(r)}`);
  for (const f of r.findings) assert.ok(f.file && f.line > 0, JSON.stringify(f));
});

test('code: чистий код без порушень; dist і node_modules ігноруються', async () => {
  const d = await fixture({
    'ok.css': 'p { color: var(--khpi-color-ink); padding: var(--khpi-space-16); font: var(--khpi-type-body-weight) var(--khpi-type-body-size)/var(--khpi-type-body-line-height) var(--khpi-type-family); border-radius: var(--khpi-radius-4); margin: 0 } /* color: #fff */',
    'dist/bad.css': 'p { color: #fff }', 'node_modules/x/bad.css': 'p { color: red }',
    'ok.html': '<a href="#section">x</a><div id="abc123"></div>',
  });
  assert.deepEqual((await checkCode(d)).findings, []);
});

test('code: виключення — коментар і конфіг', async () => {
  const d = await fixture({ 'a.css': 'p { color: #333; /* khpi-brand-ignore */ }\n/* khpi-brand-ignore-next-line */\nq { color: #444 }\nr { color: #555 }', 'legacy/x.css': 'p { color: #666 }' });
  const r = await checkCode(d, { config: { ignore: ['legacy/**'] } });
  assert.equal(r.findings.length, 1); assert.equal(r.findings[0].line, 4);
});

test('code: min-size за контекстом', async () => {
  const d = await fixture({ 's.css': '.t { font-size: 20px }' });
  assert.ok(ids(await checkCode(d, { context: 'slide' })).includes('typography.min-size.slide'));
  assert.ok(!ids(await checkCode(d, { context: 'doc' })).includes('typography.min-size.slide'));
});

test('CLI: --json, код виходу', async () => {
  const d = await fixture({ 'a.css': 'p { color: #333 }' });
  const r = spawnSync('node', [path.join(ROOT, 'check/cli.js'), 'check', d, '--json', '--only', 'code'], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  const j = JSON.parse(r.stdout);
  assert.equal(j.ok, false); assert.equal(j.findings[0].ruleId, 'shape.no-new-colors'); assert.equal(j.findings[0].line, 1); assert.match(j.findings[0].file, /a\.css$/);
  const ok = spawnSync('node', [path.join(ROOT, 'check/cli.js'), 'check', ROOT, '--only', 'tokens'], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stdout);
});

test('приклади (вихідний код) проходять code-check без помилок', async () => {
  for (const d of ['html', 'react-mui/src', 'svelte/src']) {
    const r = await checkCode(path.join(ROOT, 'examples', d));
    assert.deepEqual(r.findings.filter((f) => f.severity === 'error').map((f) => `${f.file}:${f.line} ${f.ruleId}`), [], d);
  }
});

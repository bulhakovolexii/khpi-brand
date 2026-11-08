import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAll, colorHex } from '../lib/tokens.js';
import { contrast, validateRules, loadRules } from '../lib/rules.js';
import { checkTokens } from '../check/tokens.js';

test('rules.json відповідає rules.schema.json, id унікальні', async () => {
  assert.deepEqual(await validateRules(), []);
});

test('кожне правило має id, severity, опис і джерело (сторінка або «похідне»)', async () => {
  const { rules } = await loadRules();
  for (const g of ['contrast', 'usage', 'typography', 'logo', 'shape', 'motion']) for (const r of rules[g]) {
    assert.ok(r.id && r.description && r.source, r.id);
    assert.match(r.source, /Брендбук, с\. \d+|похідне, відсутнє в брендбуку/, r.id);
    assert.ok(['error', 'warning'].includes(r.severity), r.id);
  }
});

test('токени: жодної помилки contrast/usage/структури (попередження дозволені)', async () => {
  const { findings, stats } = await checkTokens();
  const errors = findings.filter((f) => f.severity === 'error');
  assert.deepEqual(errors.map((e) => `${e.ruleId}: ${e.message}`), []);
  assert.ok(stats.contrastChecked >= 30);
});

test('значення брендбука: кольори, відтінки, ролі з таблиці', async () => {
  const a = await loadAll();
  const b = (n) => colorHex(a.base.get(n));
  assert.equal(b('palette.brand.100'), '#A0001B');
  assert.equal(b('palette.yellow.100'), '#FBBA00');
  assert.equal(b('palette.blue.100'), '#3EB1C8');
  assert.equal(b('palette.graphite.100'), '#2A2A2A');
  assert.equal(b('palette.brand.40'), '#D999A4');
  assert.equal(b('palette.graphite.75'), '#5F5F5F');
  assert.equal(b('palette.blue.75'), '#6EC4D6');
  const L = (n) => colorHex(a.themes.light.get(`color.${n}`)), D = (n) => colorHex(a.themes.dark.get(`color.${n}`));
  assert.equal(L('ink'), '#2A2A2A'); assert.equal(D('ink'), '#ECECEC');
  assert.equal(D('brand'), '#D999A4'); assert.equal(D('brand-solid'), '#A0001B');
  assert.equal(L('accent-blue-text'), '#1D7F93'); assert.equal(D('accent-blue-text'), '#6EC4D6');
  assert.equal(D('data.1'), '#D999A4'); assert.equal(L('data.4'), '#5F5F5F');
});

test('контрасти з таблиці ТЗ (±0.1)', async () => {
  const cases = [['#2A2A2A', '#FFFFFF', 14.4], ['#5F5F5F', '#FFFFFF', 6.4], ['#A0001B', '#FFFFFF', 8.4], ['#1D7F93', '#FFFFFF', 4.7], ['#ECECEC', '#2A2A2A', 12.2], ['#AAAAAA', '#2A2A2A', 6.2], ['#D999A4', '#2A2A2A', 6.2], ['#6EC4D6', '#2A2A2A', 7.2]];
  for (const [f, b, want] of cases) assert.ok(Math.abs(contrast(f, b) - want) < 0.1, `${f}/${b}: ${contrast(f, b).toFixed(2)} ≠ ${want}`);
});

test('контексти: розміри з ТЗ', async () => {
  const a = await loadAll(); const v = (c, n) => a.contexts[c].get(n).raw.value;
  assert.deepEqual(['title', 'body', 'label'].map((k) => v('doc', `type.${k}.size`)), [24, 17, 14]);
  assert.deepEqual(['title', 'body', 'label'].map((k) => v('slide', `type.${k}.size`)), [64, 36, 28]);
  assert.deepEqual(['title', 'body', 'label'].map((k) => v('video', `type.${k}.size`)), [72, 44, 36]);
  assert.equal(v('slide', 'layout.margin'), 80); assert.equal(v('video', 'layout.safe-margin'), 96);
  assert.equal(v('slide', 'type.min-size'), 28); assert.equal(v('video', 'type.min-size'), 36);
});

test('кожен токен має опис; похідні позначені', async () => {
  const a = await loadAll();
  for (const set of [a.base, a.motion, ...Object.values(a.themes), ...Object.values(a.contexts)]) for (const [n, t] of set) {
    assert.ok(t.description && t.description.length > 5, `немає $description: ${n}`);
  }
  for (const n of ['palette.derived.gray-50', 'palette.derived.gray-800', 'palette.derived.blue-text', 'space.8', 'radius.4']) assert.match(a.base.get(n).description, /похідне, відсутнє в брендбуку/i, n);
  assert.match(a.themes.light.get("color.surface-raised").description, /похідне, відсутнє в брендбуку/i);
  assert.match(a.motion.get("motion.duration.fast").description, /похідне, відсутнє в брендбуку/i);
});

test('DTCG 2025.10: hex збігається з components', async () => {
  const j = JSON.parse((await import('node:fs')).readFileSync(new URL('../tokens/base.tokens.json', import.meta.url), 'utf8'));
  let n = 0;
  (function walk(o) { for (const [k, v] of Object.entries(o)) { if (v && typeof v === 'object') { if (v.$type === 'color') { n++; const c = v.$value; assert.equal(c.colorSpace, 'srgb'); const hex = '#' + c.components.map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase(); assert.equal(hex, c.hex, k); } else walk(v); } } })(j);
  assert.ok(n >= 24);
});

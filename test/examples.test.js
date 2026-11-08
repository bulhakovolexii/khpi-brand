// Збірка прикладів + візуальна перевірка. Довга (мережа для npm install): KHPI_SKIP_EXAMPLES=1 пропускає.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExamples, checkExamples } from '../scripts/build-examples.js';

const skip = process.env.KHPI_SKIP_EXAMPLES ? 'KHPI_SKIP_EXAMPLES' : false;

test('приклади збираються (react-mui + tsc, svelte, quarto за наявності)', { skip, timeout: 600000 }, () => {
  const built = buildExamples({ log: () => {} });
  assert.ok(built.includes('react-mui') && built.includes('svelte'));
});

test('приклади відкриваються й проходять візуальну перевірку в обох темах', { skip, timeout: 300000 }, async (t) => {
  const r = await checkExamples({ log: () => {} });
  const err = r.visual.filter((f) => f.severity === 'error');
  if (r.visual.some((f) => f.ruleId === 'visual.unavailable')) return t.skip('playwright недоступний');
  assert.deepEqual(err.map((f) => `${f.example}: ${f.message}`), []);
});

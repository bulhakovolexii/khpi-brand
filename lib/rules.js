import fs from 'node:fs/promises';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { ROOT } from './tokens.js';

export async function loadRules() {
  const rules = JSON.parse(await fs.readFile(path.join(ROOT, 'rules/rules.json'), 'utf8'));
  const schema = JSON.parse(await fs.readFile(path.join(ROOT, 'rules/rules.schema.json'), 'utf8'));
  return { rules, schema };
}

/** Валідація rules.json за схемою. Повертає масив помилок (порожній = ок). */
export async function validateRules() {
  const { rules, schema } = await loadRules();
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const errors = [];
  if (!validate(rules)) {
    for (const e of validate.errors) errors.push(`${e.instancePath || '/'} ${e.message}`);
  }
  // унікальність id
  const ids = new Map();
  for (const g of ['contrast', 'usage', 'typography', 'logo', 'shape', 'motion']) {
    for (const r of rules[g] ?? []) {
      if (ids.has(r.id)) errors.push(`дублікат id ${r.id}`);
      ids.set(r.id, g);
    }
  }
  return errors;
}

// ---- контраст WCAG 2.x ----
export function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

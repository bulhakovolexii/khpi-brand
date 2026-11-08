// Перевірка токенів за rules.json: контраст, usage, радіуси/відступи, структура.
import { loadAll, colorHex, dimPx, THEMES } from '../lib/tokens.js';
import { loadRules, validateRules, contrast } from '../lib/rules.js';

const F = (ruleId, severity, message, extra = {}) => ({ ruleId, severity, file: extra.file ?? 'tokens/', line: extra.line ?? null, message, scope: 'tokens', ...extra });

export async function checkTokens() {
  const findings = [];
  const schemaErrors = await validateRules();
  for (const e of schemaErrors) findings.push(F('schema.rules', 'error', `rules.json не відповідає схемі: ${e}`, { file: 'rules/rules.json' }));
  const { rules } = await loadRules();
  const all = await loadAll();
  const role = (theme, name) => all.themes[theme].get(`color.${name}`) ?? all.themes[theme].get(`color.${name.replace(/-(\d)$/, '.$1')}`);

  const stats = { contrastChecked: 0, contrastFailed: 0 };
  for (const r of rules.contrast) {
    const fg = role(r.theme, r.foreground), bg = role(r.theme, r.background);
    if (!fg || !bg) { findings.push(F(r.id, 'error', `роль не знайдена: ${!fg ? r.foreground : r.background}`)); continue; }
    stats.contrastChecked++;
    const ratio = contrast(colorHex(fg), colorHex(bg));
    if (ratio + 1e-9 < r.min) {
      stats.contrastFailed++;
      findings.push(F(r.id, r.severity, `${r.description} Фактично ${ratio.toFixed(2)}:1 (${colorHex(fg)} на ${colorHex(bg)}).`, { ratio: +ratio.toFixed(2) }));
    }
  }
  // usage: forbidden-pair має справді не проходити 4.5 (інакше правило застаріло)
  for (const r of rules.usage.filter((u) => u.kind === 'forbidden-pair')) {
    const fg = role(r.theme, r.foreground), bg = role(r.theme, r.background);
    if (!fg || !bg) { findings.push(F(r.id, 'error', 'роль не знайдена')); continue; }
    const ratio = contrast(colorHex(fg), colorHex(bg));
    if (ratio >= 4.5) findings.push(F(r.id, 'warning', `Заборонена пара тепер проходить (${ratio.toFixed(2)}:1): правило можна прибрати.`));
  }
  for (const r of rules.usage.filter((u) => u.kind === 'role')) {
    for (const th of THEMES) if (!role(th, r.role)) findings.push(F(r.id, 'error', `роль «${r.role}» відсутня в темі ${th}`));
  }
  // обидві теми мають однаковий набір ролей
  const [a, b] = THEMES.map((t) => [...all.themes[t].keys()].sort().join());
  if (a !== b) findings.push(F('structure.themes', 'error', 'Теми light і dark мають різні набори ролей.'));
  // контексти: однакові назви токенів (print — підмножина)
  const docKeys = new Set(all.contexts.doc.keys());
  for (const c of ['slide', 'video', 'print']) for (const k of all.contexts[c].keys()) {
    if (!docKeys.has(k) && !k.startsWith('layout.')) findings.push(F('structure.contexts', 'error', `контекст ${c}: токен ${k} відсутній у doc`));
  }
  // радіуси та відступи
  const radius = rules.shape.find((s) => s.rule === 'radius-max');
  for (const [n, t] of all.base) {
    if (!n.startsWith('radius.')) continue;
    const v = dimPx(t.raw);
    if (v > radius.value && v !== radius.circleValue) findings.push(F(radius.id, radius.severity, `${n} = ${v}px більше ${radius.value}px.`));
  }
  const scale = rules.shape.find((s) => s.rule === 'spacing-scale').values;
  const spaces = [...all.base].filter(([n]) => n.startsWith('space.')).map(([, t]) => dimPx(t.raw));
  if (JSON.stringify(spaces.sort((x, y) => x - y)) !== JSON.stringify(scale)) findings.push(F('shape.spacing-scale', 'error', `space.* (${spaces}) не збігається з rules (${scale}).`));
  // мінімальні кегли контекстів: усі кегли ≥ min-size
  for (const r of rules.typography.filter((t) => t.rule === 'min-size')) {
    const ctx = all.contexts[r.context];
    for (const n of ['type.title.size', 'type.body.size', 'type.label.size']) {
      const t = ctx.get(n); if (!t) continue;
      if (dimPx(t.raw) < r.value) findings.push(F(r.id, r.severity, `${r.context}: ${n} = ${dimPx(t.raw)} менше мінімуму ${r.value}${r.unit}.`));
    }
    const m = ctx.get('type.min-size');
    if (m && dimPx(m.raw) !== r.value) findings.push(F(r.id, 'error', `${r.context}: type.min-size (${dimPx(m.raw)}) не збігається з rules (${r.value}).`));
  }
  // ваги
  const weights = rules.typography.find((t) => t.rule === 'allowed-weights').values;
  for (const set of [...Object.values(all.contexts)]) for (const [n, t] of set) if (n.endsWith('.weight') && !weights.includes(t.raw)) findings.push(F('typography.weights', 'error', `${n} = ${t.raw}`));
  // рух
  const mo = rules.motion.find((m) => m.rule === 'shift-max');
  if (dimPx(all.motion.get('motion.shift-max').raw) > mo.value) findings.push(F(mo.id, mo.severity, 'motion.shift-max перевищує 12px'));
  return { findings, stats: { ...stats, rules: Object.values(rules).filter(Array.isArray).reduce((n, g) => n + g.length, 0) } };
}

// Генерує DESIGN.md: YAML-заголовок із токенів + ручне тіло (design/body.md). Маркери в тілі:
//   <!-- generated:roles -->  таблиця ролей двох тем;  <!-- generated:contexts --> таблиця контекстів.
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadAll, ROOT, colorHex, dimPx, css } from '../lib/tokens.js';

const q = (s) => JSON.stringify(s);
const all = await loadAll();
const pkg = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'));
const L = (n) => colorHex(all.themes.light.get(`color.${n}`));
const D = (n) => colorHex(all.themes.dark.get(`color.${n}`));
const px = (t) => `${dimPx(t.raw)}${t.unit ?? 'px'}`;

const y = [];
y.push('---', 'version: alpha', `name: ${q('НТУ «ХПІ»')}`,
  `description: ${q(`Фірмовий стиль Національного технічного університету «Харківський політехнічний інститут» (брендбук v2.1). Пакет khpi-brand ${pkg.version}. Світла тема за замовчуванням; темна — з префіксом dark-.`)}`);
y.push('colors:');
const roleLight = ['surface', 'surface-raised', 'ink', 'ink-muted', 'border', 'border-strong', 'brand', 'brand-subtle', 'accent-yellow', 'accent-blue', 'accent-blue-text', 'on-brand', 'on-accent'];
y.push(`  primary: ${q(L('brand-solid'))}`, `  on-primary: ${q(L('on-brand'))}`);
for (const r of roleLight.filter((r) => r !== 'on-brand')) y.push(`  ${r}: ${q(L(r))}`);
for (const r of ['surface', 'surface-raised', 'ink', 'ink-muted', 'border', 'border-strong', 'brand', 'brand-subtle', 'accent-blue-text']) y.push(`  dark-${r}: ${q(D(r))}`);
for (const f of ['brand', 'yellow', 'blue', 'graphite']) for (const t of ['75', '60', '40']) y.push(`  ${f}-${t}: ${q(colorHex(all.base.get(`palette.${f}.${t}`)))}`);
y.push('typography:');
for (const c of ['doc', 'slide', 'video']) for (const k of ['title', 'body', 'label']) {
  const g = (n) => all.contexts[c].get(`type.${k}.${n}`);
  y.push(`  ${c}-${k}:`, `    fontFamily: Fira Sans`, `    fontSize: ${px(g('size'))}`, `    fontWeight: ${g('weight').raw}`, `    lineHeight: ${px(g('line-height'))}`);
}
y.push('  # print-body: 14 pt = 18.67 px (формат DESIGN.md не знає одиниці pt)', '  print-body:', '    fontFamily: Times New Roman', `    fontSize: ${+(dimPx(all.contexts.print.get('type.body.size').raw) * 4 / 3).toFixed(2)}px`, '    fontWeight: 400');
y.push('rounded:', '  none: 0px', '  sm: 2px', '  md: 4px', '  full: 9999px');
const sp = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64 };
y.push('spacing:'); for (const [k, v] of Object.entries(sp)) y.push(`  ${k}: ${v}px`);
y.push('components:',
  '  button-primary:', '    backgroundColor: "{colors.primary}"', '    textColor: "{colors.on-primary}"', '    typography: "{typography.doc-label}"', '    rounded: "{rounded.md}"', '    padding: 16px',
  '  card:', '    backgroundColor: "{colors.surface-raised}"', '    textColor: "{colors.ink}"', '    rounded: "{rounded.md}"', '    padding: 24px',
  '  card-muted:', '    backgroundColor: "{colors.surface-raised}"', '    textColor: "{colors.ink-muted}"', '    rounded: "{rounded.md}"',
  '  callout:', '    backgroundColor: "{colors.brand-subtle}"', '    textColor: "{colors.ink}"', '    rounded: "{rounded.sm}"', '    padding: 16px',
  '  link:', '    backgroundColor: "{colors.surface}"', '    textColor: "{colors.brand}"',
  '  link-blue:', '    backgroundColor: "{colors.surface}"', '    textColor: "{colors.accent-blue-text}"',
  '  tag-yellow:', '    backgroundColor: "{colors.accent-yellow}"', '    textColor: "{colors.on-accent}"', '    rounded: "{rounded.sm}"', '    padding: 8px',
  '  tag-blue:', '    backgroundColor: "{colors.accent-blue}"', '    textColor: "{colors.on-accent}"', '    rounded: "{rounded.sm}"', '    padding: 8px',
  '  page-dark:', '    backgroundColor: "{colors.dark-surface}"', '    textColor: "{colors.dark-ink}"',
  '  link-dark:', '    backgroundColor: "{colors.dark-surface}"', '    textColor: "{colors.dark-brand}"',
  '  card-dark:', '    backgroundColor: "{colors.dark-surface-raised}"', '    textColor: "{colors.dark-ink}"', '    rounded: "{rounded.md}"',
  '  muted-dark:', '    backgroundColor: "{colors.dark-surface}"', '    textColor: "{colors.dark-ink-muted}"');
y.push('---', '');

const roles = Object.keys(Object.fromEntries([...all.themes.light].filter(([n]) => !n.startsWith('color.data')).map(([n]) => [n.replace('color.', ''), 1])));
const roleTable = ['| Роль | CSS-змінна | Світла | Темна | Призначення |', '|---|---|---|---|---|',
  ...[...all.themes.light].map(([n, t]) => `| \`${n.replace('color.', '')}\` | \`--khpi-${n.replace(/\./g, '-')}\` | ${colorHex(t)} | ${colorHex(all.themes.dark.get(n))} | ${t.description.split('. ')[0].replace(/\|/g, '/')} |`)].join('\n');
const ctxRows = ['| Токен | doc | slide (1920×1080) | video (1920×1080) | print |', '|---|---|---|---|---|'];
for (const n of ['type.title.size', 'type.title.line-height', 'type.body.size', 'type.body.line-height', 'type.label.size', 'type.label.line-height', 'type.min-size', 'layout.gap', 'layout.margin', 'layout.safe-margin', 'layout.measure']) {
  ctxRows.push(`| \`--khpi-${n.replace(/\./g, '-')}\` | ${['doc', 'slide', 'video', 'print'].map((c) => { const t = all.contexts[c].get(n); return t ? css(t) : '—'; }).join(' | ')} |`);
}
let body = await fs.readFile(path.join(ROOT, 'design/body.md'), 'utf8');
body = body.replace('<!-- generated:roles -->', roleTable).replace('<!-- generated:contexts -->', ctxRows.join('\n'));
await fs.writeFile(path.join(ROOT, 'DESIGN.md'), y.join('\n') + '\n' + body);
console.log('DESIGN.md згенеровано');

#!/usr/bin/env node
// khpi-brand check [шлях] [--json] [--visual URL] [--context doc|slide|video|print] [--only code|tokens|visual]
import path from 'node:path';
import { checkTokens } from './tokens.js';
import { checkCode, loadConfig } from './code.js';
import { checkVisual } from './visual.js';

const HELP = `khpi-brand — перевірка дотримання брендбуку НТУ «ХПІ»

Використання:
  npx khpi-brand check [шлях]            перевірити код у шляху (за замовчуванням .) і токени
  npx khpi-brand check --json            вивід JSON: ruleId, file, line, column, message, fix
  npx khpi-brand check --context slide   контекст для мінімальних кеглів: doc (за замовч.) | slide | video | print
  npx khpi-brand check --visual URL      додатково: Playwright, знімки в обох темах, контраст і кегль на сторінці
  npx khpi-brand check --only code|tokens|visual
  npx khpi-brand check --config файл     конфіг виключень (за замовч. khpi-brand.config.json у шляху)
  npx khpi-brand check --strict          попередження теж дають код виходу 1
  npx khpi-brand check --out папка       куди класти знімки (за замовч. .khpi-brand-shots)

Виключення в коді:  /* khpi-brand-ignore */ у рядку або /* khpi-brand-ignore-next-line */ над ним,
  /* khpi-brand-ignore-file */ на початку файла.
Конфіг: { "ignore": ["legacy/**"], "ignoreDirs": ["vendor"], "allowColors": ["#ffffff"], "context": "slide" }

Код виходу: 0 — немає помилок, 1 — є помилки, 2 — помилка запуску.`;

function parseArgs(argv) {
  const a = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t.startsWith('--')) {
      const [k, v] = t.slice(2).split('=');
      if (['visual', 'context', 'only', 'config', 'out'].includes(k)) a.flags[k] = v ?? argv[++i];
      else a.flags[k] = v ?? true;
    } else a._.push(t);
  }
  return a;
}

function report(findings, meta, color) {
  const c = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
  const byFile = new Map();
  for (const f of findings) { const k = f.file; (byFile.get(k) ?? byFile.set(k, []).get(k)).push(f); }
  const lines = [];
  for (const [file, fs] of byFile) {
    lines.push(c(1, file));
    for (const f of fs) {
      const loc = f.line ? `${f.line}:${f.column ?? 1}` : (f.selector ?? '');
      lines.push(`  ${loc.padEnd(8)} ${f.severity === 'error' ? c(31, 'error  ') : c(33, 'warning')} ${f.message}  ${c(2, f.ruleId)}`);
      if (f.fix) lines.push(`           ${c(2, '→ ' + f.fix)}`);
    }
    lines.push('');
  }
  const e = findings.filter((f) => f.severity === 'error').length, w = findings.length - e;
  lines.push(e ? c(31, `✖ ${e} помилок, ${w} попереджень`) : c(32, `✔ помилок немає, ${w} попереджень`) + c(2, `  (файлів: ${meta.files}, правил: ${meta.rules})`));
  return lines.join('\n');
}

async function main() {
  const { _: pos, flags } = parseArgs(process.argv.slice(2));
  if (flags.help || flags.h || pos[0] !== 'check') { console.log(HELP); process.exit(pos[0] === 'check' || flags.help ? 0 : 2); }
  const target = pos[1] ?? '.';
  const only = flags.only;
  let config = {};
  try { config = flags.config ? JSON.parse(await (await import('node:fs/promises')).readFile(flags.config, 'utf8')) : await loadConfig(path.resolve(target)); }
  catch (e) { console.error(`Не вдалося прочитати конфіг: ${e.message}`); process.exit(2); }
  const context = flags.context ?? config.context ?? 'doc';
  const findings = []; const meta = { files: 0, rules: 0 }; let shots = [];
  try {
    if (!only || only === 'tokens') { const r = await checkTokens(); findings.push(...r.findings); meta.rules = r.stats.rules; }
    if (!only || only === 'code') { const r = await checkCode(target, { config, context }); findings.push(...r.findings); meta.files = r.files; }
    if (flags.visual || only === 'visual') {
      if (!flags.visual) throw new Error('--only visual потребує --visual URL');
      const r = await checkVisual(flags.visual, { context, outDir: flags.out ?? '.khpi-brand-shots' }); findings.push(...r.findings); shots = r.shots;
    }
  } catch (e) { console.error(`Помилка: ${e.message}`); process.exit(2); }
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.length - errors;
  if (flags.json) {
    console.log(JSON.stringify({ ok: errors === 0 && !(flags.strict && warnings), summary: { errors, warnings, files: meta.files, rules: meta.rules, context }, shots, findings }, null, 2));
  } else console.log(report(findings, meta, process.stdout.isTTY) + (shots.length ? `\nЗнімки: ${shots.join(', ')}` : ''));
  process.exit(errors || (flags.strict && warnings) ? 1 : 0);
}
main();

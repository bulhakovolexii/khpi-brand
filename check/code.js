// Перевірка коду: жорстко прописані кольори, пікселі відступів/кеглів, тіні, градієнти, ваги, гарнітури,
// радіуси, заборонене використання ролей. Підхід: власний швидкий сканер (не stylelint), бо потрібно однаково
// читати CSS, SCSS, Svelte, JSX/TSX і HTML, включно з об'єктами стилів у JS, а stylelint не розбирає JSX/HTML.
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadRules } from '../lib/rules.js';

export const EXTENSIONS = ['.css', '.scss', '.svelte', '.jsx', '.tsx', '.html', '.htm', '.vue', '.mdx', '.astro'];
const DEFAULT_IGNORE = ['node_modules', 'dist', 'build', '.git', '.svelte-kit', '.next', 'coverage', '_site', '.quarto', '_freeze'];

const NAMED = new Set(`aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen`.split(/\s+/));

const HEX_HINT = { '#a0001b': 'var(--khpi-color-brand) (текст, лінії) або var(--khpi-color-brand-solid) (заливка)', '#2a2a2a': 'var(--khpi-color-ink) (текст) або var(--khpi-color-surface) у темній темі', '#ffffff': 'var(--khpi-color-surface) або var(--khpi-color-on-brand)', '#fbba00': 'var(--khpi-color-accent-yellow) (лише заливка)', '#3eb1c8': 'var(--khpi-color-accent-blue) (заливка) або accent-blue-text (текст)' };
const COLOR_PROPS = new Set(['color', 'background', 'background-color', 'border', 'border-color', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline', 'outline-color', 'fill', 'stroke', 'text-decoration-color', 'caret-color', 'accent-color', 'column-rule-color', 'stop-color', 'flood-color', 'box-shadow', 'text-shadow']);
const SPACING_PROPS = new Set(['margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline', 'margin-block', 'margin-inline-start', 'margin-inline-end', 'margin-block-start', 'margin-block-end', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-inline', 'padding-block', 'padding-inline-start', 'padding-inline-end', 'padding-block-start', 'padding-block-end', 'gap', 'row-gap', 'column-gap', 'grid-gap']);
const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const ALL_PROPS = new Set([...COLOR_PROPS, ...SPACING_PROPS, 'font-size', 'font-weight', 'font-family', 'line-height', 'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius', 'filter', 'background-image', 'font']);
const propRe = new RegExp(`(?<![\\w$-])(${[...ALL_PROPS].flatMap((p) => [p, p.replace(/-(\w)/g, (_, c) => c.toUpperCase())]).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => b.length - a.length).join('|')})\\s*:\\s*`, 'g');

/** Заміна коментарів пробілами (зберігає довжину й номери рядків). */
function stripComments(text, ext) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  let t = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (['.html', '.htm', '.svelte', '.vue', '.mdx', '.astro'].includes(ext)) t = t.replace(/<!--[\s\S]*?-->/g, blank);
  t = t.replace(/^([ \t]*)\/\/.*$/gm, (m) => blank(m)); // рядки-коментарі JS/SCSS
  t = t.replace(/(?<=[;{}),])\s*\/\/[^\n]*$/gm, blank);   // кінцеві // після ; { } , )
  return t;
}
function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (pos) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= pos) lo = mid; else hi = mid - 1; } return { line: lo + 1, column: pos - starts[lo] + 1 }; };
}
/** Значення декларації від позиції: до ; } або кінця рядка (на глибині дужок 0), з урахуванням лапок. */
function readValue(text, pos) {
  let depth = 0, q = null, i = pos;
  for (; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === q && text[i - 1] !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '(') depth++; else if (c === ')') depth--;
    else if (depth <= 0 && (c === ';' || c === '}' || c === '\n')) break;
    else if (depth <= 0 && c === ',' && /^\s*(\w+)\s*:/.test(text.slice(i + 1, i + 60)) && /^\s*[A-Za-z$]\w*\s*:(?!:)/.test(text.slice(i + 1, i + 60))) break; // наступна властивість JS-об'єкта
  }
  return { value: text.slice(pos, i), end: i };
}

export async function loadConfig(root) {
  const cfgPath = path.join(root, 'khpi-brand.config.json');
  try { return JSON.parse(await fs.readFile(cfgPath, 'utf8')); } catch { return {}; }
}
const globToRe = (g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '§§').replace(/\*/g, '[^/]*').replace(/§§/g, '.*') + '$');

export async function collectFiles(target, config = {}) {
  const ignoreDirs = new Set([...DEFAULT_IGNORE, ...(config.ignoreDirs ?? [])]);
  const ignoreGlobs = (config.ignore ?? []).map(globToRe);
  const base = path.resolve(target);
  const stat = await fs.stat(base);
  if (stat.isFile()) return [base];
  const out = [];
  const walk = async (dir) => {
    for (const e of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      const rel = path.relative(base, full).split(path.sep).join('/');
      if (e.isDirectory()) { if (!ignoreDirs.has(e.name) && !ignoreGlobs.some((r) => r.test(rel + '/') || r.test(rel))) await walk(full); }
      else if (EXTENSIONS.includes(path.extname(e.name)) && !ignoreGlobs.some((r) => r.test(rel))) out.push(full);
    }
  };
  await walk(base);
  return out.sort();
}

export async function checkCode(target = '.', { config = {}, context = 'doc' } = {}) {
  const { rules } = await loadRules();
  const R = (id) => { const r = [...rules.typography, ...rules.shape, ...rules.usage].find((x) => x.id === id); return r; };
  const sev = (id, d = 'error') => R(id)?.severity ?? d;
  const scale = new Set(rules.shape.find((s) => s.rule === 'spacing-scale').values);
  const radiusMax = rules.shape.find((s) => s.rule === 'radius-max');
  const weights = rules.typography.find((t) => t.rule === 'allowed-weights').values;
  const fam = rules.typography.find((t) => t.rule === 'allowed-families');
  const allowedFam = new Set([...fam.values, ...fam.fallbacks].map((s) => s.toLowerCase()));
  const minRule = rules.typography.find((t) => t.rule === 'min-size' && t.context === context);
  const textForbidden = rules.usage.filter((u) => u.kind === 'role' && u.forbiddenUses.includes('text')).map((u) => ({ id: u.id, role: u.role, sev: u.severity, themes: u.themes }));
  const allowColors = new Set((config.allowColors ?? []).map((c) => c.toLowerCase()));
  const files = await collectFiles(target, config);
  const findings = [];

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8');
    const ext = path.extname(file);
    const text = stripComments(raw, ext);
    const at = lineIndex(raw);
    const rawLines = raw.split('\n');
    const ignored = (line) => /khpi-brand-ignore(?!-file)/.test(rawLines[line - 1] ?? '') || /khpi-brand-ignore-next-line/.test(rawLines[line - 2] ?? '');
    if (/khpi-brand-ignore-file/.test(raw.slice(0, 500))) continue;
    const seen = new Set();
    const add = (ruleId, severity, pos, message, fix) => {
      const { line, column } = at(pos);
      if (ignored(line)) return;
      const key = `${ruleId}:${line}:${column}`; if (seen.has(key)) return; seen.add(key);
      findings.push({ ruleId, severity, file: path.relative(process.cwd(), file) || file, line, column, message, fix, snippet: rawLines[line - 1].trim().slice(0, 160), scope: 'code' });
    };

    // 1) кольори будь-де: hex, rgb(), hsl(), hwb(), lab(), lch(), oklab(), oklch(), color()
    for (const m of text.matchAll(/(?<![\w&#-])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g)) {
      const before = text.slice(Math.max(0, m.index - 14), m.index);
      if (/(href|id|for|name|xlink:href|to|src|url\()\s*=?\s*["']?$/i.test(before) || /url\(\s*["']?$/.test(before)) continue;
      if (/\b(href|id|for|name)=["'][^"']*$/i.test(before)) continue;
      if (allowColors.has(m[0].toLowerCase())) continue;
      const norm = m[0].toLowerCase().replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3');
      add('shape.no-new-colors', sev('shape.no-new-colors'), m.index, `Прописаний колір ${m[0]}. Використайте змінну токена: var(--khpi-color-<роль>) (ink, surface, brand, …).`, HEX_HINT[norm]);
    }
    for (const m of text.matchAll(/(?<![\w-])(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*[-\d.%]/g)) {
      const { value } = readValue(text, m.index);
      add('shape.no-new-colors', sev('shape.no-new-colors'), m.index, `Прописаний колір ${value.match(/^[^)]*\)/)?.[0] ?? m[0]}. Використайте змінну токена: var(--khpi-color-<роль>).`);
    }
    // Tailwind: стандартна палітра та довільні значення
    for (const m of text.matchAll(/(?<![\w-])((?:bg|text|border|fill|stroke|ring|outline|from|via|to|decoration|divide|accent|caret|shadow)-)(?:\[(?:#|rgb|hsl)[^\]]*\]|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|(?:black|white))(?![\w-])/g)) {
      add('shape.no-new-colors', sev('shape.no-new-colors'), m.index, `Клас Tailwind «${m[0]}» з поза-токенної палітри. Використайте ролі: bg-surface, text-ink, text-brand, bg-brand-solid тощо.`);
    }
    for (const m of text.matchAll(/(?<![\w-])(?:bg-gradient-to-\w+|bg-linear-\w+|bg-radial|bg-conic)(?![\w-])/g)) add('shape.no-gradient', sev('shape.no-gradient'), m.index, `Градієнт «${m[0]}» заборонений.`);
    for (const m of text.matchAll(/(?<![\w-])(?:shadow(?:-(?:sm|md|lg|xl|2xl|inner|xs|\[[^\]]*\]))?|drop-shadow(?:-\w+)?)(?![\w-])/g)) {
      if (/class|className|clsx|cn\(|tw`/.test(text.slice(Math.max(0, m.index - 200), m.index))) add('shape.no-shadow', sev('shape.no-shadow'), m.index, `Клас тіні «${m[0]}»: тіні заборонені.`);
    }
    for (const m of text.matchAll(/(?<![\w-])rounded(?:-(?:sm|md|lg|xl|2xl|3xl))(?![\w-])/g)) {
      if (/class|className|clsx|cn\(/.test(text.slice(Math.max(0, m.index - 200), m.index)) && !/^rounded-(sm|md)$/.test(m[0])) add('shape.radius-max', sev('shape.radius-max'), m.index, `Клас «${m[0]}» більший за ${radiusMax.value}px. Дозволені rounded-none, rounded-sm (2px), rounded-md (4px), rounded-full (лише кола).`);
    }
    // MUI/JS: градієнти та тіні в рядках
    for (const m of text.matchAll(/(?<![\w-])(?:linear|radial|conic|repeating-linear|repeating-radial)-gradient\(/g)) add('shape.no-gradient', sev('shape.no-gradient'), m.index, 'Градієнти заборонені: їх немає в токенах.');

    // 2) декларації відомих властивостей
    for (const m of text.matchAll(propRe)) {
      const propRaw = m[1];
      const prop = kebab(propRaw);
      // у HTML/JSX-тексті "color: ..." поза стилями рідкість; але фільтр: попередній символ не літера — вже в regex
      const vstart = m.index + m[0].length;
      const { value } = readValue(text, vstart);
      const v = value.trim().replace(/,\s*$/, '');
      if (!v) continue;
      const hasVar = /var\(\s*--khpi-/.test(v);
      const unq = v.replace(/^["'`]|["'`]$/g, '');

      if (COLOR_PROPS.has(prop)) {
        for (const w of unq.split(/[\s,()/]+/)) {
          if (NAMED.has(w.toLowerCase())) { add('shape.no-new-colors', sev('shape.no-new-colors'), vstart, `Іменований колір «${w}» у ${prop}. Використайте var(--khpi-color-<роль>).`); break; }
        }
        // usage: роль-заборона як колір тексту
        if (prop === 'color') {
          const rm = unq.match(/var\(\s*--khpi-color-([a-z0-9-]+)/);
          if (rm) for (const t of textForbidden) if (t.role === rm[1] && (!t.themes || true)) {
            add(t.id, t.sev, vstart, `Роль «${t.role}» не можна використовувати як колір тексту. ${rules.usage.find((u) => u.id === t.id).description}`, t.role === 'accent-blue' ? 'var(--khpi-color-accent-blue-text)' : t.role === 'brand-solid' ? 'var(--khpi-color-brand)' : 'var(--khpi-color-ink)');
          }
        }
        if ((prop === 'box-shadow' || prop === 'text-shadow') && !/^(none|inherit|initial|unset|0)$/.test(unq)) add('shape.no-shadow', sev('shape.no-shadow'), vstart, `${prop}: тіні заборонені (їх немає в токенах).`, `${prop}: none`);
      }
      if (prop === 'filter' && /drop-shadow\(/.test(v)) add('shape.no-shadow', sev('shape.no-shadow'), vstart, 'filter: drop-shadow — тіні заборонені.');
      if ((prop === 'background' || prop === 'background-image') && /gradient\(/.test(v)) add('shape.no-gradient', sev('shape.no-gradient'), vstart, 'Градієнти заборонені (їх немає в токенах).');

      if (SPACING_PROPS.has(prop) && !hasVar) {
        for (const nm of unq.matchAll(/(?<![\w.#-])(-?\d+(?:\.\d+)?)(px|rem|em)?(?![\w%])/g)) {
          const n = parseFloat(nm[1]); const unit = nm[2];
          if (n === 0) continue;
          if (!unit && !/['"`]/.test(v.slice(0, 1)) && !['padding', 'margin', 'gap'].some((p) => prop.startsWith(p))) continue;
          if (/^(auto|inherit|initial|unset)/.test(unq)) continue;
          const px = unit === 'rem' || unit === 'em' ? n * 16 : n;
          const msg = scale.has(Math.abs(px)) ? `Відступ ${nm[0]}${unit ? '' : 'px'} прописаний числом. Використайте var(--khpi-space-${Math.abs(px)}).` : `Відступ ${nm[0]}${unit ? '' : 'px'} не з шкали ${[...scale].join('/')}. Оберіть найближчий крок: var(--khpi-space-*).`;
          add('shape.spacing-scale', sev('shape.spacing-scale', 'warning'), vstart, msg, scale.has(Math.abs(px)) ? `var(--khpi-space-${Math.abs(px)})` : undefined);
          break;
        }
      }
      if ((prop === 'font-size' || prop === 'line-height') && !hasVar && /\d/.test(unq) && !/^(inherit|initial|unset|normal)$/.test(unq)) {
        const n = parseFloat(unq); const unit = unq.match(/(px|pt|rem|em)/)?.[1];
        if (prop === 'line-height' && !unit) { /* безрозмірний множник — не кегль */ }
        else {
          add('typography.sizes-from-tokens', sev('typography.sizes-from-tokens', 'warning'), vstart, `${prop}: ${unq} прописаний. Використайте var(--khpi-type-body-size) / title / label (залежить від data-mode).`);
          const px = unit === 'rem' || unit === 'em' ? n * 16 : unit === 'pt' ? n * 4 / 3 : n;
          if (prop === 'font-size' && minRule && px < (minRule.unit === 'pt' ? minRule.value * 4 / 3 : minRule.value)) add(minRule.id, minRule.severity, vstart, `Кегль ${unq} менший за мінімум контексту «${context}» (${minRule.value}${minRule.unit}).`);
        }
      }
      if (prop === 'font-weight' && !hasVar) {
        const wv = unq.trim().toLowerCase();
        const num = wv === 'bold' ? 700 : wv === 'normal' ? 400 : wv === 'bolder' ? 700 : wv === 'lighter' ? 300 : parseInt(wv, 10);
        if (Number.isFinite(num) && !weights.includes(num)) add('typography.weights', sev('typography.weights'), vstart, `font-weight: ${unq}. Дозволені лише ${weights.join(' і ')}.`, 'var(--khpi-font-weight-semibold)');
      }
      if ((prop === 'font-family' || prop === 'font') && !hasVar) {
        const part = prop === 'font' ? unq.split(/\s+(?=\d)/).pop() : unq;
        const list = part.split(',').map((s) => s.trim().replace(/^["'`]|["'`]$/g, '')).filter(Boolean);
        const generic = /^(sans-serif|serif|monospace|system-ui|inherit|initial|unset|ui-sans-serif|ui-serif)$/i;
        const first = list[0];
        if (first && !generic.test(first) && !/^var\(/.test(first) && fam.fallbacks.map((x) => x.toLowerCase()).includes(first.toLowerCase())) {
          add('typography.families', sev('typography.families'), vstart, `«${first}» дозволений лише як запасний шрифт, а не основний (Arial — варіант 2 брендбуку, не використовуємо). Основним має бути ${fam.values.join(' / ')}.`, 'var(--khpi-type-family)');
        }
        const bad = part.split(',').map((s) => s.trim().replace(/^["'`]|["'`]$/g, '')).filter((s) => s && !/^(inherit|initial|unset)$/i.test(s) && !allowedFam.has(s.toLowerCase()) && !/^\d|^var\(/.test(s) && /^[A-Za-zА-Яа-я][\w \-]*$/.test(s));
        if (bad.length && !(prop === 'font' && !/,/.test(unq) && /^\d/.test(unq))) add('typography.families', sev('typography.families'), vstart, `Гарнітура «${bad[0]}» не з брендбука. Дозволені: ${fam.values.join(', ')}. Використайте var(--khpi-type-family).`, 'var(--khpi-type-family)');
      }
      if (/radius$/.test(prop) && !hasVar) {
        for (const nm of unq.matchAll(/(-?\d+(?:\.\d+)?)(px|rem|em|%)?/g)) {
          const n = parseFloat(nm[1]); const unit = nm[2];
          if (unit === '%') continue;
          const px = unit === 'rem' || unit === 'em' ? n * 16 : n;
          if (px > radiusMax.value && px !== radiusMax.circleValue) { add('shape.radius-max', sev('shape.radius-max'), vstart, `Заокруглення ${nm[0]}${unit ? '' : 'px'} більше ${radiusMax.value}px. Використайте var(--khpi-radius-4) або менше; кола — var(--khpi-radius-full).`, 'var(--khpi-radius-4)'); break; }
        }
      }
    }
  }
  return { findings, files: files.length };
}

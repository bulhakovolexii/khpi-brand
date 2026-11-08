// Спільний завантажувач токенів: Style Dictionary резолвить посилання, далі ми беремо типізовані значення.
import StyleDictionary from 'style-dictionary';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const THEMES = ['light', 'dark'];
export const CONTEXTS = ['doc', 'slide', 'video', 'print'];
const f = (p) => path.join(ROOT, 'tokens', p);

async function loadSet(theme, context) {
  const sd = new StyleDictionary({
    usesDtcg: true,
    log: { verbosity: 'silent', warnings: 'warn' },
    source: [f('base.tokens.json'), f('roles.tokens.json'), f('motion.tokens.json'),
      f(`theme/${theme}.tokens.json`), f(`context/${context}.tokens.json`)],
    platforms: { x: { transformGroup: 'css' } },
  });
  const tree = await sd.exportPlatform('x');
  const map = new Map();
  (function walk(o, p) {
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith('$') || !v || typeof v !== 'object') continue;
      if ('$value' in v) map.set([...p, k].join('.'), v);
      else walk(v, [...p, k]);
    }
  })(tree, []);
  const out = new Map();
  const rawOf = (name) => {
    let v = map.get(name).original.$value;
    while (typeof v === 'string' && /^\{.+\}$/.test(v)) v = map.get(v.slice(1, -1)).original.$value;
    return v;
  };
  for (const [name, t] of map) {
    const unitExt = t.original.$extensions?.khpi?.unit;
    out.set(name, { name, type: t.$type, description: t.$description ?? t.original.$description ?? '', raw: rawOf(name), unit: unitExt,
      ref: typeof t.original.$value === 'string' ? t.original.$value : null });
  }
  return out;
}

export const isRole = (n) => n.startsWith('color.');
export const isContext = (n) => n.startsWith('type.') || n.startsWith('layout.');
export const isMotion = (n) => n.startsWith('motion.');
export const isBase = (n) => /^(palette|font|space|radius|logo)\./.test(n);

/** Повертає { base, motion, themes:{light,dark}, contexts:{doc,...} } — кожен Map(name → токен). */
export async function loadAll() {
  const sets = {};
  for (const t of THEMES) sets[t] = await loadSet(t, 'doc');
  const ctxSets = { doc: sets.light };
  for (const c of CONTEXTS.filter((c) => c !== 'doc')) ctxSets[c] = await loadSet('light', c);
  const pick = (m, pred) => new Map([...m].filter(([n]) => pred(n)));
  return {
    base: pick(sets.light, isBase),
    motion: pick(sets.light, isMotion),
    themes: Object.fromEntries(THEMES.map((t) => [t, pick(sets[t], isRole)])),
    contexts: Object.fromEntries(CONTEXTS.map((c) => [c, pick(ctxSets[c], isContext)])),
  };
}

// ---- форматування значень ----
export const dimPx = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v);
export function fontStack(arr) {
  return (Array.isArray(arr) ? arr : [arr]).map((s) => (/\s/.test(s) ? `'${s}'` : s)).join(', ');
}
export function css(t) {
  const v = t.raw;
  switch (t.type) {
    case 'color': return v.hex.toUpperCase();
    case 'dimension': return `${v.value}${t.unit ?? v.unit}`;
    case 'duration': return `${v.value}${v.unit}`;
    case 'cubicBezier': return `cubic-bezier(${v.join(', ')})`;
    case 'fontFamily': return fontStack(v);
    default: return String(v);
  }
}
/** Значення для JS/JSON: числа в px/ms, масиви для кривих, hex для кольорів. */
export function js(t) {
  const v = t.raw;
  switch (t.type) {
    case 'color': return v.hex.toUpperCase();
    case 'dimension': return t.unit ? `${v.value}${t.unit}` : v.value;
    case 'duration': return v.value;
    case 'fontFamily': return fontStack(v);
    default: return v;
  }
}
export const cssVar = (name) => `--khpi-${name.replace(/\./g, '-')}`;
export const camel = (s) => s.replace(/[-.]+(.)/g, (_, c) => c.toUpperCase());
export const colorHex = (t) => t.raw.hex.toUpperCase();

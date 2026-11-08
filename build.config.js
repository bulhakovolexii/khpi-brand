// Генерація dist/ із ядра (tokens/). Style Dictionary v5 резолвить DTCG 2025.10 (lib/tokens.js),
// а формати нижче — власні, бо кожен стек потребує свого вигляду.
// Запуск: npm run build
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadAll, ROOT, THEMES, CONTEXTS, css, js, cssVar, camel, colorHex } from './lib/tokens.js';

const DIST = path.join(ROOT, 'dist');
const HEADER = 'Згенеровано з tokens/ (npm run build). Не редагувати вручну.';
const write = async (rel, text) => {
  const p = path.join(DIST, rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, text.endsWith('\n') ? text : text + '\n');
};
const decl = (m, indent = '  ') => [...m.values()].map((t) => `${indent}${cssVar(t.name)}: ${css(t)};`).join('\n');
const pkg = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'));

export async function build() {
  const all = await loadAll();
  const { base, motion, themes, contexts } = all;
  const roleNames = [...themes.light.keys()];
  const T = (theme, n) => themes[theme].get(n);

  // ---------- css/tokens.css ----------
  const reduced = [...motion.values()].filter((t) => t.type === 'duration')
    .map((t) => `    ${cssVar(t.name)}: 0ms;`).join('\n');
  const ctxBlock = (c, sel) => `${sel} {\n${decl(contexts[c])}\n}`;
  const cssOut = `/* khpi-brand ${pkg.version}. ${HEADER}
 * Використання: <html data-theme="light|dark" data-mode="doc|slide|video|print">.
 * Без атрибутів: тема за prefers-color-scheme, контекст doc. */

/* Палітра, шрифти, відступи, заокруглення, рух */
:root {
${decl(base)}
${decl(motion)}
}

/* Тема (ролі) */
:root,
[data-theme="light"] {
  color-scheme: light;
${decl(themes.light)}
}
[data-theme="dark"] {
  color-scheme: dark;
${decl(themes.dark)}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    color-scheme: dark;
${decl(themes.dark, '    ')}
  }
}

/* Контекст (формат). doc — за замовчуванням. print змінює лише гарнітуру та основний кегль. */
${ctxBlock('doc', ':root,\n[data-mode="doc"]')}
${CONTEXTS.filter((c) => c !== 'doc').map((c) => ctxBlock(c, `[data-mode="${c}"]`)).join('\n')}

/* prefers-reduced-motion: одразу кінцевий стан */
@media (prefers-reduced-motion: reduce) {
  :root {
${reduced}
  }
}
`;
  await write('css/tokens.css', cssOut);

  // ---------- json/tokens.json ----------
  const flat = (m) => Object.fromEntries([...m].map(([n, t]) => [n, js(t)]));
  const meta = (m) => Object.fromEntries([...m].map(([n, t]) => [n, { type: t.type, description: t.description }]));
  await write('json/tokens.json', JSON.stringify({
    $comment: HEADER, version: pkg.version,
    units: 'dimension → px (число), duration → ms (число), cubicBezier → [x1,y1,x2,y2], color → HEX; print-кегль — рядок з pt',
    base: flat(base), motion: flat(motion),
    themes: Object.fromEntries(THEMES.map((t) => [t, flat(themes[t])])),
    contexts: Object.fromEntries(CONTEXTS.map((c) => [c, flat(contexts[c])])),
    meta: { ...meta(base), ...meta(motion), ...meta(themes.light), ...meta(contexts.doc) },
  }, null, 2));

  // ---------- tailwind ----------
  const alias = (prefix, names, fn) => names.map((n) => `  --${prefix}-${fn(n)}: var(${cssVar(n)});`).join('\n');
  const palette = [...base.keys()].filter((n) => n.startsWith('palette.') && !n.startsWith('palette.derived'));
  await write('tailwind/theme.css', `/* khpi-brand ${pkg.version} — Tailwind v4. ${HEADER}
 * Підключати ПІСЛЯ tokens.css:
 *   @import "tailwindcss";
 *   @import "khpi-brand/dist/css/tokens.css";
 *   @import "khpi-brand/dist/tailwind/theme.css";
 * Стандартну палітру, тіні й радіуси Tailwind вимкнено: бренд не передбачає інших. */
@theme inline {
  --color-*: initial;
  --shadow-*: initial;
  --drop-shadow-*: initial;
  --inset-shadow-*: initial;
  --radius-*: initial;
  --font-*: initial;

${alias('color', roleNames, (n) => n.replace('color.', ''))}
${alias('color', palette, (n) => n.replace('palette.', '').replace('.', '-'))}
  --font-sans: var(--khpi-font-family-sans);
  --font-doc: var(--khpi-font-family-doc);
  --font-soft: var(--khpi-font-family-soft);
  --spacing: 4px;
  --radius-none: var(--khpi-radius-0);
  --radius-sm: var(--khpi-radius-2);
  --radius-md: var(--khpi-radius-4);
  --radius-full: var(--khpi-radius-full);
  --ease-standard: var(--khpi-motion-easing-standard);
  --ease-enter: var(--khpi-motion-easing-enter);
  --ease-exit: var(--khpi-motion-easing-exit);
}
`);
  const twColors = Object.fromEntries([
    ...roleNames.map((n) => [n.replace('color.', ''), `var(${cssVar(n)})`]),
  ]);
  await write('tailwind/preset.js', `// khpi-brand ${pkg.version} — Tailwind v3 preset. ${HEADER}
// Для Tailwind v4 використовуйте theme.css. Підключіть також dist/css/tokens.css.
export default {
  theme: {
    colors: ${JSON.stringify({ transparent: 'transparent', current: 'currentColor', ...twColors }, null, 6).replace(/\n    \}$/, '\n    }')},
    fontFamily: {
      sans: ['var(--khpi-font-family-sans)'],
      doc: ['var(--khpi-font-family-doc)'],
      soft: ['var(--khpi-font-family-soft)'],
    },
    borderRadius: { none: '0', sm: '2px', md: '4px', full: '9999px' },
    boxShadow: { none: 'none' },
    spacing: ${JSON.stringify(Object.fromEntries([['0', '0'], ...[...base].filter(([n]) => n.startsWith('space.')).map(([n, t]) => [n.slice(6), `${js(t)}px`])]))},
    transitionDuration: { fast: '150ms', DEFAULT: '300ms', slow: '600ms' },
    transitionTimingFunction: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)', enter: 'cubic-bezier(0, 0, 0.2, 1)', exit: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
};
`);

  // ---------- MUI ----------
  const sch = (th) => {
    const g = (n) => colorHex(T(th, `color.${n}`));
    return `{
      palette: {
        primary: { main: '${g('brand-solid')}', contrastText: '${g('on-brand')}' },
        secondary: { main: '${g('accent-blue')}', contrastText: '${colorHex(themes.light.get('color.ink'))}' },
        text: { primary: '${g('ink')}', secondary: '${g('ink-muted')}' },
        background: { default: '${g('surface')}', paper: '${g('surface-raised')}' },
        divider: '${g('border')}',
      },
    }`;
  };
  const doc = contexts.doc;
  const px = (n) => js(doc.get(n));
  const fam = css(base.get('font.family.sans'));
  await write('mui/theme.ts', `// khpi-brand ${pkg.version} — MUI v6/v7. ${HEADER}
// Підключення: <ThemeProvider theme={khpiTheme}> + data-theme на <html> (colorSchemeSelector).
// Кольори помилки/попередження/успіху бренд не визначає — лишено значення MUI за замовчуванням (див. README, «Відкриті питання»).
import { createTheme } from '@mui/material/styles';

export const khpiTheme = createTheme({
  cssVariables: { colorSchemeSelector: '[data-theme="%s"]' },
  defaultColorScheme: 'light',
  colorSchemes: {
    light: ${sch('light')},
    dark: ${sch('dark')},
  },
  shape: { borderRadius: ${js(base.get('radius.4'))} },
  // Тіней у бренді немає
  shadows: Array(25).fill('none') as unknown as import('@mui/material/styles').Shadows,
  typography: {
    fontFamily: ${JSON.stringify(fam)},
    fontWeightRegular: ${js(base.get('font.weight.regular'))},
    fontWeightMedium: ${js(base.get('font.weight.semibold'))},
    fontWeightBold: ${js(base.get('font.weight.semibold'))},
    h1: { fontSize: '${px('type.title.size')}px', lineHeight: '${px('type.title.line-height')}px', fontWeight: ${js(doc.get('type.title.weight'))} },
    h2: { fontSize: '${px('type.title.size')}px', lineHeight: '${px('type.title.line-height')}px', fontWeight: ${js(doc.get('type.title.weight'))} },
    body1: { fontSize: '${px('type.body.size')}px', lineHeight: '${px('type.body.line-height')}px' },
    body2: { fontSize: '${px('type.label.size')}px', lineHeight: '${px('type.label.line-height')}px' },
    caption: { fontSize: '${px('type.label.size')}px', lineHeight: '${px('type.label.line-height')}px' },
    button: { textTransform: 'none', fontWeight: ${js(base.get('font.weight.semibold'))} },
  },
  transitions: {
    duration: { shortest: ${js(motion.get('motion.duration.fast'))}, shorter: ${js(motion.get('motion.duration.fast'))}, short: ${js(motion.get('motion.duration.base'))}, standard: ${js(motion.get('motion.duration.base'))}, complex: ${js(motion.get('motion.duration.slow'))}, enteringScreen: ${js(motion.get('motion.duration.base'))}, leavingScreen: ${js(motion.get('motion.duration.fast'))} },
    easing: { easeInOut: '${css(motion.get('motion.easing.standard'))}', easeOut: '${css(motion.get('motion.easing.enter'))}', easeIn: '${css(motion.get('motion.easing.exit'))}', sharp: '${css(motion.get('motion.easing.standard'))}' },
  },
  components: {
    // Текстові й контурні кнопки: колір тексту — роль brand (у темній темі чистий бордовий на графіті дає лише 1.7:1)
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        textPrimary: { color: 'var(${cssVar('color.brand')})' },
        outlinedPrimary: { color: 'var(${cssVar('color.brand')})', borderColor: 'var(${cssVar('color.border-strong')})', '&:hover': { borderColor: 'var(${cssVar('color.brand')})' } },
      },
    },
    // Дрібні компоненти MUI мають кегль 11–13 px: підтягуємо до розміру підпису (мінімум контексту doc — 14 px)
    MuiChip: { styleOverrides: { root: { borderRadius: 'var(${cssVar('radius.2')})', fontSize: 'var(${cssVar('type.label.size')})', fontWeight: ${js(base.get('font.weight.semibold'))} } } },
    MuiToggleButton: { styleOverrides: { root: { fontSize: 'var(${cssVar('type.label.size')})', textTransform: 'none', fontWeight: ${js(base.get('font.weight.semibold'))} } } },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: 'var(${cssVar('type.label.size')})' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    // Посилання та текст-акцент: у темній темі чистий бордовий не читається, тому беремо роль brand
    MuiLink: { styleOverrides: { root: { color: 'var(${cssVar('color.brand')})' } } },
  },
});

export default khpiTheme;
`);

  // ---------- Quarto ----------
  const qpal = (th) => {
    const g = (n) => colorHex(T(th, `color.${n}`));
    return `# khpi-brand ${pkg.version} (${th}). ${HEADER}
# Підключення: у YAML документа  brand: { light: _brand.yml, dark: _brand-dark.yml }  (або просто brand: _brand.yml).
# Скопіюйте всю папку dist/quarto/ у проєкт (наприклад, як _brand/): логотипи лежать у logos/ поруч із цим файлом.
# Typst і Quarto забороняють шляхи за межами кореня проєкту, тому логотипи копіюються, а не підключаються з assets/.
meta:
  name: НТУ «ХПІ»
  link: https://kpi.kharkov.ua

logo:
  images:
    emblem:
      path: logos/${th === 'light' ? 'emblem-direct-brand' : 'emblem-inverse-graphite'}.svg
      alt: Емблема НТУ «ХПІ»
    block:
      path: logos/${th === 'light' ? 'block-direct-brand' : 'block-inverse-graphite'}.svg
      alt: НТУ «ХПІ»
  small: emblem
  medium: block
  large: block

color:
  palette:
    white: "${colorHex(base.get('palette.white'))}"
    brand: "${colorHex(base.get('palette.brand.100'))}"
    yellow: "${colorHex(base.get('palette.yellow.100'))}"
    blue: "${colorHex(base.get('palette.blue.100'))}"
    graphite: "${colorHex(base.get('palette.graphite.100'))}"
    ink: "${g('ink')}"
    ink-muted: "${g('ink-muted')}"
    surface: "${g('surface')}"
    surface-raised: "${g('surface-raised')}"
    brand-text: "${g('brand')}"
    border: "${g('border')}"
  foreground: ink
  background: surface
  primary: brand-text
  secondary: ink-muted
  info: blue
  warning: yellow
  link: brand-text

typography:
  fonts:
    - family: Fira Sans
      source: google
      weight: [400, 600]
  base:
    family: Fira Sans
    weight: 400
    size: ${px('type.body.size')}px
    line-height: ${(px('type.body.line-height') / px('type.body.size')).toFixed(3)}
  headings:
    family: Fira Sans
    weight: 600
    color: brand-text
  link:
    color: brand-text

# Бренд дозволяє лише ваги 400 і 600: Bootstrap за замовчуванням ставить bold = 700 / bolder
defaults:
  bootstrap:
    defaults:
      font-weight-bold: 600
      font-weight-bolder: 600
      headings-font-weight: 600
`;
  };
  await write('quarto/_brand.yml', qpal('light'));
  await write('quarto/_brand-dark.yml', qpal('dark'));
  await write('quarto/typst-header.typ', `// khpi-brand ${pkg.version}. ${HEADER}
// Typst: **виділення** за замовчуванням 700, бренд дозволяє лише 400 і 600.
// Підключення в _quarto.yml:  format: { typst: { include-in-header: _brand/typst-header.typ } }
#set strong(delta: 200) // 400 + 200 = 600 (SemiBold)
#show heading: set text(weight: 600)
`);
  for (const v of ['emblem-direct-brand', 'block-direct-brand', 'emblem-inverse-graphite', 'block-inverse-graphite']) {
    await fs.mkdir(path.join(DIST, 'quarto/logos'), { recursive: true });
    await fs.copyFile(path.join(ROOT, `assets/logos/ua/${v}.svg`), path.join(DIST, `quarto/logos/${v}.svg`));
  }

  // ---------- Typst ----------
  const tcolors = (th) => roleNames.filter((n) => !n.startsWith('color.data'))
    .map((n) => `  ${n.replace('color.', '')}: rgb("${colorHex(T(th, n))}"),`).join('\n');
  const tctx = (c) => [...contexts[c].values()].filter((t) => t.type === 'dimension')
    .map((t) => `    ${t.name.replace(/\./g, '-')}: ${t.raw.value}${t.unit === 'pt' ? 'pt' : 'pt'},`).join('\n');
  await write('typst/brand.typ', `// khpi-brand ${pkg.version}. ${HEADER}
// Використання:  #import "brand.typ": *   потім  #set text(font: font-sans, fill: colors-light.ink)
// Одиниці контекстів: у Typst CSS-піксель = 0.75pt, тому значення перераховано в pt.
#let colors-light = (
${tcolors('light')}
)
#let colors-dark = (
${tcolors('dark')}
)
#let palette = (
${palette.map((n) => `  "${n.replace('palette.', '').replace('.', '-')}": rgb("${colorHex(base.get(n))}"),`).join('\n')}
)
#let font-sans = ("Fira Sans",)
#let font-doc = ("Times New Roman",)
#let font-soft = ("Cambria",)
#let weight-regular = 400
#let weight-semibold = 600
#let contexts = (
${CONTEXTS.map((c) => `  ${c}: (\n${[...contexts[c].values()].filter((t) => t.type === 'dimension' || t.type === 'number').map((t) => {
    const v = t.type === 'number' ? t.raw : t.unit === 'pt' ? `${t.raw.value}pt` : `${+(t.raw.value * 0.75).toFixed(2)}pt`;
    return `    ${t.name.replace(/\./g, '-')}: ${v},`;
  }).join('\n')}\n  ),`).join('\n')}
)
`);

  // ---------- Remotion / TS ----------
  const ts = (v) => JSON.stringify(v);
  const objFromMap = (m, f = js) => Object.fromEntries([...m].map(([n, t]) => [n, f(t)]));
  const nest = (flatObj, strip) => {
    const out = {};
    for (const [k, v] of Object.entries(flatObj)) {
      const parts = k.replace(strip, '').split('.');
      let o = out;
      parts.slice(0, -1).forEach((p) => (o = o[camel(p)] ??= {}));
      o[camel(parts.at(-1))] = v;
    }
    return out;
  };
  const ctxTs = Object.fromEntries(CONTEXTS.map((c) => [c, nest(objFromMap(contexts[c]), /^/)]));
  await write('remotion/tokens.ts', `// khpi-brand ${pkg.version}. ${HEADER}
// Типізовані константи для Remotion (і будь-якого TS-коду). Числа в px і ms; кадри — через msToFrames.
export const colors = ${JSON.stringify({ light: nest(objFromMap(themes.light), 'color.'), dark: nest(objFromMap(themes.dark), 'color.') }, null, 2)} as const;

export const palette = ${JSON.stringify(nest(Object.fromEntries(palette.map((n) => [n, js(base.get(n))])), 'palette.'), null, 2)} as const;

export const fonts = {
  sans: ${ts(css(base.get('font.family.sans')))},
  doc: ${ts(css(base.get('font.family.doc')))},
  soft: ${ts(css(base.get('font.family.soft')))},
  weight: { regular: 400, semibold: 600 },
} as const;

export const space = ${JSON.stringify(Object.fromEntries([...base].filter(([n]) => n.startsWith('space.')).map(([n, t]) => [n.slice(6), js(t)])))} as const;
export const radius = ${JSON.stringify(Object.fromEntries([...base].filter(([n]) => n.startsWith('radius.')).map(([n, t]) => [n.slice(7), js(t)])))} as const;

/** Контексти: Remotion використовує video; slide — для Reveal-подібних композицій. */
export const contexts = ${JSON.stringify(ctxTs, null, 2)} as const;
export const video = contexts.video;

export const motion = {
  durationMs: ${JSON.stringify(Object.fromEntries([...motion].filter(([n]) => n.startsWith('motion.duration.')).map(([n, t]) => [camel(n.replace('motion.duration.', '')), js(t)])))},
  easing: ${JSON.stringify(Object.fromEntries([...motion].filter(([n]) => n.startsWith('motion.easing.')).map(([n, t]) => [n.replace('motion.easing.', ''), js(t)])))},
  shiftMaxPx: ${js(motion.get('motion.shift-max'))},
} as const;

export const msToFrames = (ms: number, fps: number): number => Math.round((ms * fps) / 1000);

/** Безпечна зона відео 1920×1080: поля 96 + 20 % висоти знизу під субтитри. */
export const videoSafeArea = {
  left: ${js(contexts.video.get('layout.safe-margin'))},
  right: ${js(contexts.video.get('layout.safe-margin'))},
  top: ${js(contexts.video.get('layout.safe-margin'))},
  bottom: ${js(contexts.video.get('layout.safe-margin')) + 1080 * contexts.video.get('layout.safe-bottom-ratio').raw},
} as const;

export type Theme = keyof typeof colors;
`);
  return all;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await build();
  console.log('dist/ згенеровано');
}

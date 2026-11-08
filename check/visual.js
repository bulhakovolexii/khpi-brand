// Візуальна перевірка (опційно, потребує playwright): знімки в обох темах, обчислений контраст тексту,
// мінімальні кегли контексту. Запуск: khpi-brand check --visual http://localhost:5173 --context slide
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadRules } from '../lib/rules.js';

// Виконується в браузері: повертає порушення для поточної теми.
function pageProbe({ minSizePx, minContrast, largePx, largeBoldPx, radiusMax, families, fallbacks }) {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
  const lum = ({ r, g, b }) => { const f = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const over = (top, bottom) => { const a = top.a + bottom.a * (1 - top.a); return a === 0 ? { r: 0, g: 0, b: 0, a: 0 } : { r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a, g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a, b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a, a }; };
  const selector = (el) => { const parts = []; for (let e = el; e && e.nodeType === 1 && parts.length < 4; e = e.parentElement) { let s = e.tagName.toLowerCase(); if (e.id) { parts.unshift(`${s}#${e.id}`); break; } const cls = [...e.classList].slice(0, 2).join('.'); if (cls) s += '.' + cls; parts.unshift(s); } return parts.join(' > '); };
  const effectiveBg = (el) => {
    let acc = { r: 0, g: 0, b: 0, a: 0 }; const stack = [];
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none') return { unknown: true }; stack.push(parse(cs.backgroundColor) ?? { r: 0, g: 0, b: 0, a: 0 }); if (stack.at(-1).a === 1) break; }
    acc = { r: 255, g: 255, b: 255, a: 1 }; // нижній шар — біла сторінка
    for (const c of stack.reverse()) acc = over(c, acc);
    return acc;
  };
  const issues = []; const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const size = parseFloat(cs.fontSize); const weight = parseInt(cs.fontWeight, 10);
    const fg0 = parse(cs.color); const bg = effectiveBg(el);
    const text = n.textContent.trim().slice(0, 50);
    if (size < minSizePx) issues.push({ kind: 'min-size', selector: selector(el), text, size, min: minSizePx });
    if (fg0 && bg && !bg.unknown) {
      const fg = over(fg0, bg); const large = size >= largePx || (weight >= 600 && size >= largeBoldPx);
      const need = large ? Math.min(3, minContrast) : minContrast; const got = ratio(fg, bg);
      if (got + 1e-9 < need) issues.push({ kind: 'contrast', selector: selector(el), text, size, ratio: +got.toFixed(2), need, fg: cs.color, bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})` });
    } else if (bg?.unknown) issues.push({ kind: 'contrast-unknown', selector: selector(el), text });
    if (weight !== 400 && weight !== 600 && weight !== 500 && weight < 700) { /* інші ваги розбирає code-check */ }
    if (![400, 600].includes(weight)) issues.push({ kind: 'weight', selector: selector(el), text, weight });
    const first = cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
    if (!families.includes(first.toLowerCase())) issues.push({ kind: 'family', selector: selector(el), text, family: first, mono: /^(monospace|ui-monospace|courier|consolas|menlo|monaco|sfmono)/i.test(first) || /mono/i.test(cs.fontFamily.split(',').pop()) });
  }
  // форма: радіус, тіні, градієнти на всіх елементах
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (!r.width || !r.height || cs.display === 'none') continue;
    const rad = Math.max(...['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'].map((k) => parseFloat(cs[k]) || 0));
    const circle = rad >= Math.min(r.width, r.height) / 2 - 0.5 && Math.abs(r.width - r.height) < 2;
    if (rad > radiusMax && !circle) issues.push({ kind: 'radius', selector: selector(el), radius: rad });
    if (cs.boxShadow !== 'none') issues.push({ kind: 'shadow', selector: selector(el), value: cs.boxShadow.slice(0, 40) });
    if (/gradient/.test(cs.backgroundImage)) issues.push({ kind: 'gradient', selector: selector(el) });
  }
  return issues;
}

export async function checkVisual(url, { context = 'doc', outDir = '.khpi-brand-shots', themes = ['light', 'dark'], viewport } = {}) {
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch { return { findings: [{ ruleId: 'visual.unavailable', severity: 'warning', file: url, line: null, message: 'playwright не встановлений: npm i -D playwright && npx playwright install chromium. Візуальну перевірку пропущено.', scope: 'visual' }], shots: [] }; }
  const { rules } = await loadRules();
  const minRule = rules.typography.find((t) => t.rule === 'min-size' && t.context === context);
  const radiusRule = rules.shape.find((x) => x.rule === 'radius-max');
  const famRule = rules.typography.find((x) => x.rule === 'allowed-families');
  const minPx = minRule.unit === 'pt' ? minRule.value * 4 / 3 : minRule.value;
  const vp = viewport ?? (context === 'slide' || context === 'video' ? { width: 1920, height: 1080 } : { width: 1280, height: 800 });
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const findings = []; const shots = [];
  try {
    for (const theme of themes) {
      const page = await browser.newPage({ viewport: vp, colorScheme: theme });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(([t, c]) => { document.documentElement.setAttribute('data-theme', t); document.documentElement.setAttribute('data-mode', c); }, [theme, context]);
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
      await page.waitForTimeout(200);
      const file = path.join(outDir, `${(new URL(url).host + new URL(url).pathname).replace(/\W+/g, '_').replace(/^_|_$/g, '')}-${context}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: !(context === 'slide' || context === 'video') });
      shots.push(file);
      const issues = await page.evaluate(pageProbe, { minSizePx: minPx, minContrast: 4.5, largePx: 24, largeBoldPx: 18.66, radiusMax: radiusRule.value, families: [...famRule.values, ...famRule.fallbacks].map((x) => x.toLowerCase()), fallbacks: [] });
      for (const i of issues) {
        if (i.kind === 'min-size') findings.push({ ruleId: minRule.id, severity: minRule.severity, file: url, line: null, selector: i.selector, theme, message: `[${theme}] Кегль ${i.size}px менший за мінімум ${minPx}px для «${context}»: «${i.text}»`, scope: 'visual' });
        else if (i.kind === 'contrast') findings.push({ ruleId: 'visual.contrast', severity: 'error', file: url, line: null, selector: i.selector, theme, message: `[${theme}] Контраст ${i.ratio}:1 < ${i.need}:1 (${i.fg} на ${i.bg}), ${i.size}px: «${i.text}»`, scope: 'visual' });
        else if (i.kind === 'weight') findings.push({ ruleId: 'typography.weights', severity: 'error', file: url, line: null, selector: i.selector, theme, message: `[${theme}] Вага ${i.weight}: дозволені 400 і 600: «${i.text}»`, scope: 'visual' });
        else if (i.kind === 'radius') findings.push({ ruleId: 'shape.radius-max', severity: 'error', file: url, line: null, selector: i.selector, theme, message: `[${theme}] Заокруглення ${i.radius}px більше ${radiusRule.value}px.`, scope: 'visual' });
        else if (i.kind === 'shadow') findings.push({ ruleId: 'shape.no-shadow', severity: 'error', file: url, line: null, selector: i.selector, theme, message: `[${theme}] box-shadow: ${i.value}`, scope: 'visual' });
        else if (i.kind === 'gradient') findings.push({ ruleId: 'shape.no-gradient', severity: 'error', file: url, line: null, selector: i.selector, theme, message: `[${theme}] Градієнт у background-image.`, scope: 'visual' });
        else if (i.kind === 'family') findings.push({ ruleId: 'typography.families', severity: i.mono ? 'warning' : 'error', file: url, line: null, selector: i.selector, theme, message: `[${theme}] Гарнітура «${i.family}»${i.mono ? ' (моноширинний шрифт не визначений брендбуком; використовуйте Fira Sans)' : ' не з брендбука'}: «${i.text}»`, scope: 'visual' });
        else findings.push({ ruleId: 'visual.contrast', severity: 'warning', file: url, line: null, selector: i.selector, theme, message: `[${theme}] Фон із зображенням/градієнтом: контраст не перевірено: «${i.text}»`, scope: 'visual' });
      }
      await page.close();
    }
  } finally { await browser.close(); }
  return { findings, shots };
}

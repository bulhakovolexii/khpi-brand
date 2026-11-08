# Changelog

Формат — [Keep a Changelog](https://keepachangelog.com/uk/1.1.0/), версіонування — [SemVer](https://semver.org/lang/uk/).

## [0.1.0] — 2026-11-08

Перша версія: перенесення брендбуку НТУ «ХПІ» v2.1 у машиночитане ядро.

### Додано
- **Токени DTCG 2025.10**: `base` (кольори з відтінками 75/60/40 %, шрифти, відступи, радіуси, охоронне поле логотипа), `roles`, теми `light`/`dark`, контексти `doc`/`slide`/`video`/`print`, `motion`.
- **Правила** `rules/rules.json` + `rules.schema.json`: `contrast`, `usage`, `typography`, `logo`, `shape`, `motion`; кожне з `id`, `severity`, описом і джерелом (сторінка брендбука або «похідне, відсутнє в брендбуку»).
- **Ассети**: 16 SVG емблеми та горизонтального блока (UA і EN × 4 кольорові варіанти × 2 типи), 4 SVG символу спільноти, 2 PNG патерну та `.pat`; вирізано з `.ai` брендбука без змін.
- **Адаптери** (Style Dictionary v5): CSS-змінні, Tailwind v3/v4, MUI, Quarto (html, revealjs, typst), Typst, Remotion/TS, плоский JSON.
- **DESIGN.md** (формат Google Labs, alpha) і **skill/SKILL.md** для агентів.
- **brand-check** (`npx khpi-brand check`): перевірка коду, токенів і (опційно) сторінки через Playwright.
- **Приклади**: чистий HTML, React + MUI, Svelte, Quarto.

### Відхилення від початкового ТЗ
- `border-strong` у світлій темі — графіт 60 % (`#7F7F7F`, 4.0:1) замість `#AAAAAA` (2.32:1 — нижче 3:1 для нетекстових елементів).
- Додано роль `on-accent` (графіт) для тексту на жовтому та блакитному; у темній темі `ink` на жовтому дає лише 1.7:1.

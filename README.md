# khpi-brand

Брендовий пакет НТУ «ХПІ» (брендбук v2.1): DTCG-токени, вимоги як дані та адаптери під стеки для узгодженого оформлення матеріалів, які створюють люди й ШІ-агенти.

```
Брендбук (PDF)                       ← юридичне джерело (brandbook/)
  ↓ перенесено один раз
Ядро: tokens/ + rules/ + assets/     ← єдине, що редагують люди
  ↓ npm run build (Style Dictionary v5)
dist/ (адаптери) + DESIGN.md         ← генерується, не редагується
  ↓ споживають
Артефакти                            ← конспекти, слайди, відео, вебзастосунки
  ↓ перевіряються
npx khpi-brand check
```

Агенти ядро не змінюють: вони читають його й проходять перевірку.

## Швидкий старт

```bash
npm install
npm run build        # dist/ + DESIGN.md
npm test             # схема rules.json, контраст, usage, генерація, brand-check, збірка прикладів
npm run check        # brand-check самого репозиторію
```

`npm test` збирає приклади (потрібна мережа для `npm install` у `examples/*`, `KHPI_SKIP_EXAMPLES=1` їх пропускає), робить знімки в `examples/_shots/` (ігнорується git) і перевіряє їх в обох темах через Playwright. Quarto-приклад збирається, лише якщо встановлений `quarto` (`pip install quarto-cli`).

## Структура

| Шлях | Що це |
|---|---|
| `brandbook/` | PDF брендбука та вихідні `.ai`/PNG/TTF від авторів |
| `tokens/base.tokens.json` | значення з брендбука: кольори й відтінки 75/60/40 %, шрифти, відступи, радіуси, охоронне поле логотипа |
| `tokens/roles.tokens.json` | ролі, незалежні від теми (лише посилання на base) |
| `tokens/theme/{light,dark}.tokens.json` | ролі, що залежать від теми |
| `tokens/context/{doc,slide,video,print}.tokens.json` | розміри за форматом: однакові назви токенів, різні значення |
| `tokens/motion.tokens.json` | тривалості й криві |
| `rules/rules.json`, `rules.schema.json` | вимоги як дані (75 правил) і JSON Schema |
| `assets/logos/{ua,en}/` | 16 SVG, вирізані з `.ai` брендбука без змін |
| `assets/symbol/`, `assets/pattern/`, `assets/fonts/README.md` | символ спільноти, патерн, звідки брати Fira Sans |
| `dist/` | **генерується**: `css/`, `tailwind/`, `mui/`, `quarto/`, `typst/`, `remotion/`, `json/` |
| `DESIGN.md` | для агентів: YAML із токенів + пояснення (`design/body.md`, вручну) |
| `skill/SKILL.md` | покрокова інструкція для Claude Code |
| `check/`, `lib/` | CLI brand-check та спільний код |
| `examples/` | демо: чистий HTML, React + MUI, Svelte, Quarto |

## Як користуватися токенами

Мінімум для будь-якого стеку — `dist/css/tokens.css`:

```html
<link rel="stylesheet" href="node_modules/khpi-brand/dist/css/tokens.css">
<html lang="uk" data-theme="light" data-mode="doc">
```

```css
body { background: var(--khpi-color-surface); color: var(--khpi-color-ink);
       font: var(--khpi-type-body-weight) var(--khpi-type-body-size)/var(--khpi-type-body-line-height) var(--khpi-type-family); }
a { color: var(--khpi-color-brand); }
.btn { background: var(--khpi-color-brand-solid); color: var(--khpi-color-on-brand); border-radius: var(--khpi-radius-4); padding: var(--khpi-space-8) var(--khpi-space-16); }
```

- Тема: `data-theme="light|dark"` (без атрибута — за `prefers-color-scheme`).
- Контекст: `data-mode="doc|slide|video|print"`.
- `prefers-reduced-motion` обнуляє тривалості.
- Fira Sans (400 і 600) підключається окремо: `assets/fonts/README.md`.

Адаптери:

| Стек | Файл | Примітка |
|---|---|---|
| CSS (універсальний) | `dist/css/tokens.css` | змінні, `[data-theme]`, `[data-mode]` |
| Tailwind v4 | `dist/tailwind/theme.css` | `@theme inline`, стандартну палітру вимкнено |
| Tailwind v3 | `dist/tailwind/preset.js` | |
| MUI v6/v7 | `dist/mui/theme.ts` | `createTheme` із `cssVariables`, без тіней |
| Quarto | `dist/quarto/` | копіюється в проєкт цілою папкою (Typst заборонив шляхи за межами проєкту) |
| Typst | `dist/typst/brand.typ` | |
| Remotion/TS | `dist/remotion/tokens.ts` | числа в px і ms, `msToFrames` |
| Усе інше | `dist/json/tokens.json` | плоский резолвлений набір |

## brand-check

```bash
npx khpi-brand check [шлях]               # код + токени
npx khpi-brand check --json               # ruleId, file, line, column, message, fix
npx khpi-brand check --context slide      # мінімальний кегль контексту: doc | slide | video | print
npx khpi-brand check --visual URL         # + Playwright: знімки в обох темах, контраст, кегль, ваги, шрифти, радіуси, тіні
npx khpi-brand check --only code|tokens|visual   --strict   --config файл   --out папка
```

1. **Код** (CSS, SCSS, Svelte, JSX/TSX, HTML, а також Vue/MDX/Astro): прописані кольори (hex, `rgb()`/`hsl()`/…, іменовані, класи Tailwind поза палітрою), пікселі відступів і кеглів замість змінних, тіні, градієнти, радіуси >4 px, ваги не 400/600, сторонні шрифти, `accent-*`/`brand-solid` як колір тексту. Реалізовано власним сканером, а не stylelint: stylelint не розбирає JSX і HTML, а єдиний прохід однаково читає всі формати, включно з об'єктами стилів у JS. Ігнорує `dist`, `node_modules`, `build` тощо.
2. **Токени**: усі `contrast` і `usage` з `rules.json`, структура тем і контекстів, шкала відступів, радіуси, мінімальні кегли. Запускається разом із кодом і в `npm test`. Помилки (`error`) дають код виходу 1; попередження — лише з `--strict`.
3. **Візуальна** (`--visual`, потрібен `playwright` + `npx playwright install chromium`): обидві теми, обчислений контраст тексту, мінімальні кегли контексту, ваги, гарнітури, радіуси, тіні, градієнти.

Виключення: `/* khpi-brand-ignore */` у рядку, `/* khpi-brand-ignore-next-line */` над ним, `/* khpi-brand-ignore-file */` на початку файла або `khpi-brand.config.json` (`ignore`, `ignoreDirs`, `allowColors`, `context`).

Поточні відомі попередження токенів: `data-2` (блакитний) і `data-3` (жовтий) на білому нижче 3:1 — це властивість фірмових кольорів, у `rules` вони `warning`, а в DESIGN.md/SKILL.md вимагається додатково розрізняти серії підписом.

## Фрагмент для CLAUDE.md споживача

```markdown
## Фірмовий стиль НТУ «ХПІ»
Усі матеріали оформлюються за пакетом khpi-brand (`node_modules/khpi-brand/`, правила — `DESIGN.md`, інструкція — `skill/SKILL.md`).
Підключайте `dist/css/tokens.css`; кольори, кегль, відступи беріть лише зі змінних `--khpi-*`; нових кольорів, тіней і градієнтів не вигадуйте; шрифт Fira Sans 400/600.
Перед завершенням роботи запускайте `npx khpi-brand check . --json` і виправляйте всі `error`. Ядро пакета (tokens/, rules/, assets/) не змінюйте.
```

## Як підключити до існуючого проєкту (наприклад, Svelte: pcirmeter-rebuild)

1. **Залежність.** Поки пакет не опубліковано: `npm i -D ../khpi-brand` (локальний шлях; можна `npm link`) або, після пушу, `npm i -D github:<користувач>/khpi-brand`. Для приватного пакета знімається `"private": true` лише з вашого підтвердження.
2. **CSS.** У кореневий layout (`src/routes/+layout.svelte` або `main.js`): `import 'khpi-brand/dist/css/tokens.css';`. На `<html>` у `app.html`: `data-theme="light" data-mode="doc"`.
3. **Шрифт.** `npm i @fontsource/fira-sans`, імпорт `@fontsource/fira-sans/cyrillic-400.css` і `cyrillic-600.css`.
4. **Міграція стилів.** `npx khpi-brand check src --json`: кожне порушення має файл, рядок і `fix`. Замініть прописані кольори й пікселі на змінні (див. `examples/svelte/src/Panel.svelte`).
5. **Логотип.** Скопіюйте SVG з `assets/logos/ua/` (світла тема — `*-direct-brand`, темна — `*-inverse-graphite`) і перемикайте їх за `[data-theme]`.
6. **Агент.** Додайте фрагмент у CLAUDE.md проєкту; за бажання скопіюйте `skill/SKILL.md` у `.claude/skills/khpi-brand/`.
7. **CI.** `npx khpi-brand check src --strict` у GitHub Actions.

Для лабораторій із графіками використовуйте `data-1…4` і підписи, а не лише колір.

## Рішення щодо форматів

- **Style Dictionary v5** (5.8) читає DTCG 2025.10 нативно, зокрема кольори як об'єкти `{ colorSpace, components, hex }`, розміри `{ value, unit }`, тривалості та `cubicBezier`. Тому `base.tokens.json` повністю у форматі 2025.10; перевірка, що `hex` збігається з `components`, є в `npm test`.
- DTCG 2025.10 не має одиниці `pt`. Print-кегль (14 pt) зберігається як розмір із розширенням `$extensions.khpi.unit: "pt"`, а адаптери виводять його в `pt` (CSS, Typst) або в `px` (DESIGN.md: 18.67 px).
- Самі формати вихідних файлів — власні шаблони в `build.config.js`: SD резолвить посилання й типи, а кожен стек потребує свого вигляду.

## DESIGN.md: відповідність специфікації

Формат Google Labs (`@google/design.md` 0.4.0) в альфі (`version: alpha`). `npx @google/design.md lint DESIGN.md` — 0 помилок (є попередження `orphaned-tokens` — кольори без прив'язки до компонентів, бо формат не вміє посилатися на межі та відтінки в `components`). Розбіжності та вимушені рішення:

- Темна тема в YAML — звичайні кольори з префіксом `dark-` (формат не знає тем). Світла тема — без префікса.
- Одиницю `pt` формат не приймає (лише px, rem, em), тому `print-body` задано в px (18.67 = 14 pt), коментар у YAML це пояснює.
- Контексти — токени `doc-title`, `slide-body` тощо; `components` мають лише дозволені властивості (`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`).
- Відтінки 75/60/40 % додано як звичайні кольори (`brand-75` …).
- Розділ `Elevation & Depth` описує відсутність тіней; логотипи й рух не мають структурованих секцій у форматі й описані в прозі.

YAML генерується з токенів (`npm run build`), тіло — із `design/body.md`.

## Похідні рішення (відсутні в брендбуку)

Усі позначені в `$description` токенів як «похідне, відсутнє в брендбуку»:

- нейтральні та підсилені значення: `#F7F7F7`, `#333333`, `#E5E5E5`, `#4A4A4A`, `#ECECEC`, `#F7EBED`, `#3D2A2D`, `#1D7F93`;
- ролі й теми (таблиця з ТЗ), `on-accent`, `data-1…4`;
- відступи 4–64, заокруглення 0/2/4/9999;
- розміри контекстів doc/slide/video/print, поля, безпечна зона, мінімальні кегли;
- рух: тривалості, криві, зсув 12 px;
- охоронне поле емблеми 1,5x (схема на с. 11 неоднозначна).

Відхилення від початкового ТЗ (виявлені перевіркою контрасту): `border-strong` у світлій темі — `#7F7F7F`, а не `#AAAAAA`; нова роль `on-accent`; `accent-blue-text` на `surface-raised` у світлій темі та `brand-subtle` заборонений (4.35:1 і менше 4.5:1).

## Відкриті питання та обмеження

- Кольорів стану (помилка/попередження/успіх) бренд не визначає. MUI-тема лишає значення MUI за замовчуванням: рішення за вами.
- Моноширинний шрифт брендбук не визначає; код у демо набрано Fira Sans, а `check --visual` попереджає про `monospace`.
- Quarto: кольори callout-блоків, коду й частини Bootstrap-компонентів лишаються стандартними; потрібен власний SCSS.
- Малої версії емблеми (8–19 мм, с. 12) у вихідних `.ai` немає, тільки на сторінці PDF, тому її не вирізано.
- Патерн: SVG не вирізано (на с. 18–19 він вбудований у сторінку з текстом); взято готові PNG і `.pat` від авторів.
- Логотипи вирізані без змін; їхній бордовий у файлах — RGB(159, 28, 32) `#9F1C20`, графіт — RGB(44, 42, 41) `#2C2A29` (результат конвертації з CMYK в `.ai`), а не `#A0001B` і `#2A2A2A`. Це розбіжність джерела, яку не виправлено навмисно («вирізані без змін»).
- `playwright` — опційна залежність; `npx khpi-brand` стане доступним після публікації в npm або встановлення з git/локального шляху. У npm не публікувалось і нікуди не пушилось.

## Ліцензії

Код пакета — MIT. Fira Sans — SIL OFL 1.1 (брендбук, с. 15). Логотипи, емблема, символ і патерн — власність НТУ «ХПІ», використовуються за брендбуком.

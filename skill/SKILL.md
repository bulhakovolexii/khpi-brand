---
name: khpi-brand
description: Застосовує фірмовий стиль НТУ «ХПІ» (кольори, шрифти, логотипи, відступи, рух) до нового чи існуючого проєкту на будь-якому стеку (чистий HTML, React+MUI, Svelte, Tailwind, Quarto, Typst, Remotion, Reveal.js) і перевіряє дотримання командою brand-check. Використовувати, коли створюються чи правляться конспекти, слайди, відеолекції, віртуальні лабораторії, вебзастосунки або будь-які матеріали НТУ «ХПІ».
---

# khpi-brand: як застосувати бренд НТУ «ХПІ»

Джерело правди — ядро пакета: `tokens/` (токени DTCG), `rules/rules.json` (вимоги як дані), `assets/` (логотипи). **Ядро не змінюється агентами**: ви його читаєте й проходите перевірку. `dist/` генерується, вручну не редагується.

Усі шляхи нижче — відносно кореня пакета `khpi-brand` (у проєкті це `node_modules/khpi-brand/` або каталог, куди його скопійовано / підключено як git-залежність).

Повний опис стилю — `DESIGN.md`. Читайте його перед роботою, якщо завдання нетривіальне.

## 1. Визначте три речі

| Що | Значення | Як задається |
|---|---|---|
| **Тема** | `light` (за замовчуванням), `dark` | `data-theme` на `<html>`; без атрибута — за `prefers-color-scheme` |
| **Контекст** | `doc` (сайт, конспект, посібник), `slide` (1920×1080), `video` (1920×1080), `print` (офіційний документ) | `data-mode` на `<html>` або контейнері |
| **Стек** | див. таблицю нижче | |

Якщо користувач не сказав — тема `light`, контекст за типом артефакту: слайди → `slide`, відео → `video`, сайти й PDF-конспекти → `doc`, документи для деканату/МОН → `print`.

## 2. Підключіть пакет

**Мінімум для будь-якого стеку** — один файл CSS:

```html
<link rel="stylesheet" href=".../khpi-brand/dist/css/tokens.css">
<html lang="uk" data-theme="light" data-mode="doc">
```

Після цього доступні змінні `--khpi-color-*` (ролі), `--khpi-type-*`, `--khpi-layout-*`, `--khpi-space-*`, `--khpi-radius-*`, `--khpi-motion-*`, `--khpi-font-*`.

Шрифт Fira Sans (400 і 600) підключіть окремо: див. `assets/fonts/README.md` (Google Fonts або `@fontsource/fira-sans`).

Спеціалізований адаптер (додатково до `tokens.css`, якщо стек його має):

| Стек | Файл | Як використати |
|---|---|---|
| Чистий HTML / Svelte / будь-що | `dist/css/tokens.css` | `color: var(--khpi-color-ink)` у стилях |
| React + MUI v6/v7 | `dist/mui/theme.ts` | скопіюйте в проєкт; `<ThemeProvider theme={khpiTheme}>`; `data-theme` на `<html>` |
| Tailwind v4 | `dist/tailwind/theme.css` | `@import "tailwindcss"; @import ".../tokens.css"; @import ".../theme.css";` — класи `bg-surface text-ink text-brand bg-brand-solid` |
| Tailwind v3 | `dist/tailwind/preset.js` | `presets: [khpi]` у `tailwind.config` |
| Quarto (html, revealjs, typst) | `dist/quarto/` | скопіюйте всю папку як `_brand/`; у `_quarto.yml`: `brand: { light: _brand/_brand.yml, dark: _brand/_brand-dark.yml }`; для typst додайте `include-in-header: _brand/typst-header.typ` і `font-paths` на Fira Sans |
| Typst | `dist/typst/brand.typ` | `#import "brand.typ": *` |
| Remotion / TS | `dist/remotion/tokens.ts` | `import { video, colors, motion, msToFrames } from './tokens'` |
| Будь-що інше (Python, Matplotlib, скрипти) | `dist/json/tokens.json` | плоский резолвлений набір |

Логотипи: `assets/logos/{ua,en}/*.svg`. **Лише ці файли, без перемальовування і без растру.**

## 3. Правила застосування

Працюйте **ролями**, а не значеннями.

- Колір: тільки `var(--khpi-color-<роль>)`. Ролі: `surface`, `surface-raised`, `ink`, `ink-muted`, `border`, `border-strong`, `brand`, `brand-solid`, `on-brand`, `brand-subtle`, `accent-yellow`, `accent-blue`, `accent-blue-text`, `on-accent`, `data-1…4`.
- **Текст**: `ink`, `ink-muted`, `brand`, `accent-blue-text` (не на `surface-raised`/`brand-subtle` у світлій темі), `on-brand` (на `brand-solid`), `on-accent` (на жовтому/блакитному).
- **Лише заливка/маркер**: `accent-yellow`, `accent-blue`, `brand-solid`. Ніколи як колір тексту.
- Шрифти: Fira Sans (вага лише 400 і 600), Times New Roman (print), Cambria. Не використовуйте `<b>`/`<strong>` без `font-weight: var(--khpi-font-weight-semibold)`: браузерне 700 заборонене.
- Розміри тексту: `var(--khpi-type-title-size)`, `…-body-size`, `…-label-size` (+ `-line-height`, `-weight`); вони міняються з `data-mode`. Мінімальний кегль: slide 28, video 36, doc 14.
- Відступи: `var(--khpi-space-4|8|16|24|32|48|64)`; проміжок між блоками `--khpi-layout-gap`.
- Форма: `--khpi-radius-0|2|4`; `--khpi-radius-full` лише для кіл. **Без тіней і градієнтів.**
- Рух: тривалості `--khpi-motion-duration-*`, криві `--khpi-motion-easing-*`; лише прозорість і зсув до 12 px; без пружин; поважайте `prefers-reduced-motion`.
- Логотип у світлій темі — `*-direct-brand` (або `-graphite`), у темній — `*-inverse-graphite`, на бордовому фоні — `*-inverse-brand`. Охоронне поле: емблема 1,5x, блок 2x з боків і x зверху/знизу; мінімум: велика емблема 20 мм (≈76 px), мала 8 мм (≈30 px), блок 53 мм (≈200 px).
- Діаграми: серії `data-1…4`; жовтий і блакитний на білому нижче 3:1, тому додавайте підписи або обведення `ink`.
- Відео: контент усередині безпечної зони (96 px з боків, знизу ще 20 % висоти під субтитри).
- Слайди Reveal.js: підключіть `tokens.css`, додайте `data-mode="slide"` на `.reveal`, розміри `1920×1080` у `Reveal.initialize({ width: 1920, height: 1080, margin: 0 })`, поля — `--khpi-layout-margin`.

## 4. Коли потрібного рішення немає в токенах

1. **Не вигадуйте** кольору, відтінку, кегля, відступу, тіні, градієнта, радіуса.
2. Складіть рішення з ролей: наприклад, «попередження» → `brand-subtle` фон + `brand-solid` акцент + текст `ink`; «успіх/помилка» бренд не визначає — не вводьте зелений/червоний, використовуйте текст, значок і `brand`/`ink-muted`.
3. Усередині діапазону токенів: відступ між 16 і 24 → візьміть найближчий крок шкали.
4. Якщо не виходить, лишіть у коді `/* TODO(brand): <що бракує> */` і **повідомте користувача** у відповіді. Не змінюйте `tokens/`, `rules/`, `assets/` і `dist/`.

## 5. Перед завершенням: brand-check

```bash
npx khpi-brand check .                      # код + токени
npx khpi-brand check . --context slide      # мінімальний кегль для слайдів
npx khpi-brand check . --json               # для автовиправлення: ruleId, file, line, fix
npx khpi-brand check . --visual http://localhost:5173 --context doc   # + Playwright, обидві теми
```

Що ловить: прописані кольори (hex, rgb, hsl, іменовані, класи Tailwind поза палітрою), піксельні відступи й кегль замість змінних, тіні, градієнти, заокруглення >4 px, ваги не 400/600, сторонні шрифти, ролі `accent-*`/`brand-solid` як колір тексту. Візуально: обчислений контраст тексту, мінімальні кегли, ваги, гарнітури, радіуси, тіні.

Алгоритм:
1. Запустіть `check --json`, виправте всі `error` (поле `fix` підказує заміну), повторіть до `ok: true`.
2. `warning` виправляйте, якщо це не навмисне; винятки позначайте `/* khpi-brand-ignore */` у рядку або в `khpi-brand.config.json` (`ignore`, `allowColors`) і поясніть користувачу.
3. Для веб-артефакту запустіть `--visual` і перегляньте знімки (`.khpi-brand-shots/`) в обох темах.
4. У відповіді назвіть, що перевірено і які винятки лишилися.

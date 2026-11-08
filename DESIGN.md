---
version: alpha
name: "НТУ «ХПІ»"
description: "Фірмовий стиль Національного технічного університету «Харківський політехнічний інститут» (брендбук v2.1). Пакет khpi-brand 0.1.0. Світла тема за замовчуванням; темна — з префіксом dark-."
colors:
  primary: "#A0001B"
  on-primary: "#FFFFFF"
  surface: "#FFFFFF"
  surface-raised: "#F7F7F7"
  ink: "#2A2A2A"
  ink-muted: "#5F5F5F"
  border: "#E5E5E5"
  border-strong: "#7F7F7F"
  brand: "#A0001B"
  brand-subtle: "#F7EBED"
  accent-yellow: "#FBBA00"
  accent-blue: "#3EB1C8"
  accent-blue-text: "#1D7F93"
  on-accent: "#2A2A2A"
  dark-surface: "#2A2A2A"
  dark-surface-raised: "#333333"
  dark-ink: "#ECECEC"
  dark-ink-muted: "#AAAAAA"
  dark-border: "#4A4A4A"
  dark-border-strong: "#7F7F7F"
  dark-brand: "#D999A4"
  dark-brand-subtle: "#3D2A2D"
  dark-accent-blue-text: "#6EC4D6"
  brand-75: "#B84054"
  brand-60: "#C66676"
  brand-40: "#D999A4"
  yellow-75: "#FCCB40"
  yellow-60: "#FDD666"
  yellow-40: "#FDE399"
  blue-75: "#6EC4D6"
  blue-60: "#8BD0DE"
  blue-40: "#B2E0E9"
  graphite-75: "#5F5F5F"
  graphite-60: "#7F7F7F"
  graphite-40: "#AAAAAA"
typography:
  doc-title:
    fontFamily: Fira Sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
  doc-body:
    fontFamily: Fira Sans
    fontSize: 17px
    fontWeight: 400
    lineHeight: 28px
  doc-label:
    fontFamily: Fira Sans
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
  slide-title:
    fontFamily: Fira Sans
    fontSize: 64px
    fontWeight: 600
    lineHeight: 72px
  slide-body:
    fontFamily: Fira Sans
    fontSize: 36px
    fontWeight: 400
    lineHeight: 48px
  slide-label:
    fontFamily: Fira Sans
    fontSize: 28px
    fontWeight: 600
    lineHeight: 36px
  video-title:
    fontFamily: Fira Sans
    fontSize: 72px
    fontWeight: 600
    lineHeight: 80px
  video-body:
    fontFamily: Fira Sans
    fontSize: 44px
    fontWeight: 400
    lineHeight: 56px
  video-label:
    fontFamily: Fira Sans
    fontSize: 36px
    fontWeight: 600
    lineHeight: 44px
  # print-body: 14 pt = 18.67 px (формат DESIGN.md не знає одиниці pt)
  print-body:
    fontFamily: Times New Roman
    fontSize: 18.67px
    fontWeight: 400
rounded:
  none: 0px
  sm: 2px
  md: 4px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.doc-label}"
    rounded: "{rounded.md}"
    padding: 16px
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
  card-muted:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
  callout:
    backgroundColor: "{colors.brand-subtle}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 16px
  link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand}"
  link-blue:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent-blue-text}"
  tag-yellow:
    backgroundColor: "{colors.accent-yellow}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: 8px
  tag-blue:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: 8px
  page-dark:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-ink}"
  link-dark:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-brand}"
  card-dark:
    backgroundColor: "{colors.dark-surface-raised}"
    textColor: "{colors.dark-ink}"
    rounded: "{rounded.md}"
  muted-dark:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-ink-muted}"
---

## Overview

Фірмовий стиль НТУ «ХПІ» — строгий, академічний, теплий: бордовий колір старовинних корпусів і сургучу, графіт, мало прикрас. Матеріали мають виглядати як документ університету, а не як маркетинговий лендінг: рівна сітка, чіткий текст, жодних тіней і градієнтів, заокруглення не більші за 4 px.

Цей файл — дзеркало ядра пакета `khpi-brand` (`tokens/`, `rules/`, `assets/`). YAML-заголовок вище **генерується** з токенів скриптом; пояснення нижче написані вручну. Якщо щось у заголовку суперечить `tokens/*.json` — правда в токенах.

**Агент не вигадує кольорів, кегля чи відступів. Усе береться з ролей і змінних `--khpi-*`; якщо потрібного немає — див. «Do's and Don'ts».**

Спершу визначте три речі про артефакт:

1. **Тема**: `light` (за замовчуванням) або `dark`. Атрибут `data-theme` на `<html>`.
2. **Контекст (формат)**: `doc` (сайти, конспекти, посібники), `slide` (слайди 1920×1080), `video` (відео 1920×1080), `print` (офіційні документи). Атрибут `data-mode`.
3. **Стек**: який адаптер із `dist/` підключати (див. `skill/SKILL.md`). Мінімум для будь-якого стеку — `dist/css/tokens.css`.

## Colors

Основний колір — бордовий `#A0001B`; додаткові — жовтий `#FBBA00`, блакитний `#3EB1C8` і графіт `#2A2A2A`. Для кожного брендбук (с. 14) дозволяє відтінки 75 %, 60 % і 40 %, змішані з білим; у заголовку це `brand-75…graphite-40`.

Працюйте **ролями**, не відтінками: ролі змінюються разом із темою, а їхні контрасти перевірені (`rules/rules.json`).

| Роль | CSS-змінна | Світла | Темна | Призначення |
|---|---|---|---|---|
| `brand-solid` | `--khpi-color-brand-solid` | #A0001B | #A0001B | Бордова заливка в обох темах (фон кнопки, смуга) |
| `on-brand` | `--khpi-color-on-brand` | #FFFFFF | #FFFFFF | Текст і значки на brand-solid |
| `accent-yellow` | `--khpi-color-accent-yellow` | #FBBA00 | #FBBA00 | Жовтий акцент |
| `accent-blue` | `--khpi-color-accent-blue` | #3EB1C8 | #3EB1C8 | Блакитний акцент |
| `data.1` | `--khpi-color-data-1` | #A0001B | #D999A4 | Похідне, відсутнє в брендбуку |
| `data.2` | `--khpi-color-data-2` | #3EB1C8 | #3EB1C8 | Похідне, відсутнє в брендбуку |
| `data.3` | `--khpi-color-data-3` | #FBBA00 | #FBBA00 | Похідне, відсутнє в брендбуку |
| `data.4` | `--khpi-color-data-4` | #5F5F5F | #AAAAAA | Похідне, відсутнє в брендбуку |
| `on-accent` | `--khpi-color-on-accent` | #2A2A2A | #2A2A2A | Похідне, відсутнє в брендбуку |
| `surface` | `--khpi-color-surface` | #FFFFFF | #2A2A2A | Фон сторінки |
| `surface-raised` | `--khpi-color-surface-raised` | #F7F7F7 | #333333 | Похідне, відсутнє в брендбуку |
| `ink` | `--khpi-color-ink` | #2A2A2A | #ECECEC | Основний текст |
| `ink-muted` | `--khpi-color-ink-muted` | #5F5F5F | #AAAAAA | Другорядний текст, графіт 75 % |
| `border` | `--khpi-color-border` | #E5E5E5 | #4A4A4A | Похідне, відсутнє в брендбуку |
| `border-strong` | `--khpi-color-border-strong` | #7F7F7F | #7F7F7F | Межа елемента керування, графіт 60 % |
| `brand` | `--khpi-color-brand` | #A0001B | #D999A4 | Бордовий як колір тексту, посилань, ліній |
| `brand-subtle` | `--khpi-color-brand-subtle` | #F7EBED | #3D2A2D | Похідне, відсутнє в брендбуку |
| `accent-blue-text` | `--khpi-color-accent-blue-text` | #1D7F93 | #6EC4D6 | Похідне, відсутнє в брендбуку |

Ключові правила:

- **`accent-yellow` і `accent-blue` — лише заливка або маркер**, ніколи колір тексту (на білому 1,7:1 і 2,5:1). Для блакитного тексту є `accent-blue-text`. Текст на жовтій і блакитній заливці — завжди `on-accent` (графіт), навіть у темній темі.
- **`brand-solid` — заливка** (кнопка, смуга, фон блока) з текстом `on-brand`. Як колір тексту використовуйте `brand`: у темній темі це бордовий 40 % (`#D999A4`), бо чистий бордовий на графіті — лише 1,7:1.
- `accent-blue-text` у світлій темі не ставити на `surface-raised` і `brand-subtle` (4,35:1 і менше 4,5:1); на `surface` — можна.
- Діаграми: серії `data-1…4` (brand → accent-blue → accent-yellow → ink-muted). Жовтий і блакитний на білому нижче 3:1, тому кожну серію додатково розрізняйте підписом, маркером чи обведенням `ink`.
- Значення `border-strong` — графіт 60 %: 4,0:1 на білому (нетекстовий елемент ≥3:1).

Похідні значення, яких немає в брендбуку (`#F7F7F7`, `#333333`, `#E5E5E5`, `#4A4A4A`, `#ECECEC`, `#F7EBED`, `#3D2A2D`, `#1D7F93`), позначені в `tokens/base.tokens.json` як «похідне, відсутнє в брендбуку».

## Typography

- **Fira Sans** — універсальний шрифт (OFL): Regular (400) для тексту, SemiBold (600) для виділення. **Не більше 2 варіантів в одному матеріалі** — тобто лише вага 400 і 600. Жодних Bold, Light, Medium.
- **Times New Roman** — офіційні документи (вимоги МОН). **Cambria** — менш формальні друковані матеріали й виділення в документах із Times New Roman.
- Варіант 2 брендбуку (Ledger + Arial) **не використовуємо**. Arial допустимий лише як запасний шрифт у стеку.
- Заголовок і підпис — SemiBold, основний текст — Regular.

Змінні контекстів (однакові назви, різні значення; `data-mode` перемикає набір):

| Токен | doc | slide (1920×1080) | video (1920×1080) | print |
|---|---|---|---|---|
| `--khpi-type-title-size` | 24px | 64px | 72px | — |
| `--khpi-type-title-line-height` | 32px | 72px | 80px | — |
| `--khpi-type-body-size` | 17px | 36px | 44px | 14pt |
| `--khpi-type-body-line-height` | 28px | 48px | 56px | — |
| `--khpi-type-label-size` | 14px | 28px | 36px | — |
| `--khpi-type-label-line-height` | 20px | 36px | 44px | — |
| `--khpi-type-min-size` | 14px | 28px | 36px | 14pt |
| `--khpi-layout-gap` | 16px | 32px | 48px | — |
| `--khpi-layout-margin` | — | 80px | — | — |
| `--khpi-layout-safe-margin` | — | — | 96px | — |
| `--khpi-layout-measure` | 70 | — | — | — |

Мінімальний кегль: slide — 28 px, video — 36 px, doc — 14 px, print — 14 pt. Рядок у doc — до 70 знаків (`max-width: calc(var(--khpi-layout-measure) * 1ch)`).

Приклад:

```css
h1 { font: var(--khpi-type-title-weight) var(--khpi-type-title-size)/var(--khpi-type-title-line-height) var(--khpi-type-family); }
p  { font: var(--khpi-type-body-weight) var(--khpi-type-body-size)/var(--khpi-type-body-line-height) var(--khpi-type-family); }
```

## Layout

- Відступи лише з кроків **4, 8, 16, 24, 32, 48, 64 px**: `--khpi-space-4` … `--khpi-space-64`. У заголовку: `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 32, `2xl` 48, `3xl` 64.
- Проміжок між блоками — `--khpi-layout-gap` (doc 16, slide 32, video 48).
- **slide**: поля 80 px (`--khpi-layout-margin`), полотно 1920×1080.
- **video**: безпечна зона 96 px з усіх боків і ще 20 % висоти (216 px) знизу під субтитри (`--khpi-layout-safe-margin`, `--khpi-layout-safe-bottom-ratio`). Важливі елементи не виходять за неї.
- Логотип: охоронне поле в кроках «x» (x = відстань між верхньою точкою внутрішнього кола і початком даху): емблема — 1,5x; горизонтальний блок — 2x ліворуч і праворуч, x зверху і знизу. Мінімальні розміри: велика емблема ≥ 20 мм (≈ 76 px), мала — від 8 до 19 мм, горизонтальний блок ≥ 53 мм (≈ 200 px).

## Elevation & Depth

Тіней немає. `box-shadow`, `text-shadow`, `drop-shadow` заборонені, градієнти теж. Піднятість виражається роллю `surface-raised` і межею `border` (або `border-strong` для елементів керування). Глибина — лише через тон і лінію.

## Shapes

Стиль строгий. Заокруглення: **0, 2, 4 px**; `9999px` — лише для кіл (аватар, індикатор). Більше 4 px не використовуємо (`--khpi-radius-0/2/4/full`).

## Components

Компоненти в заголовку — мінімальна демонстрація зв'язку ролей; реальні компоненти будуйте в стеку проєкту (MUI, Svelte, чистий HTML), посилаючись на змінні токенів.

- Кнопка: фон `brand-solid`, текст `on-brand`, радіус 4 px, без тіні.
- Картка: `surface-raised` з межею `border`, радіус 4 px.
- Виноска: `brand-subtle`, лівий бордовий акцент 4 px (`brand-solid`).
- Мітки: `accent-yellow` або `accent-blue` із текстом `on-accent`.
- Посилання: колір `brand` (світла й темна теми).

Рух: анімація пояснює, а не прикрашає. Тривалості 150, 300, 600 мс; stagger 80 мс; повна анімація блока до 2400 мс; криві `standard` (0,2; 0; 0; 1), `enter` (0; 0; 0,2; 1), `exit` (0,4; 0; 1; 1). Лише прозорість і зсув до 12 px, без пружин і відскоків. При `prefers-reduced-motion` — одразу кінцевий стан (`tokens.css` обнуляє тривалості).

Логотипи — тільки файли з `assets/logos/{ua,en}/`, без перемальовування:

| Файл | Де використовувати |
|---|---|
| `emblem-direct-brand.svg`, `emblem-direct-graphite.svg` | пряма емблема — на білому або світлому фоні |
| `emblem-inverse-brand.svg` | інверсна — на бордовому фоні (`brand-solid`) |
| `emblem-inverse-graphite.svg` | інверсна — на графітовому фоні (темна тема, `surface`) |
| `block-*` (ті самі 4 варіанти) | горизонтальний фірмовий блок, коли емблема нерозбірлива чи недоречна за пропорціями |

Українська (`ua/`) — за замовчуванням, англійська (`en/`) — для англомовних матеріалів. У світлій темі беріть `*-direct-brand`, у темній — `*-inverse-graphite`.

## Do's and Don'ts

**Do**

- Підключайте `dist/css/tokens.css` (або адаптер стеку) і використовуйте тільки змінні `--khpi-*`, ролі й токени.
- Перевіряйте себе: `npx khpi-brand check` (див. `skill/SKILL.md`) — перед завершенням роботи.
- Для текстових елементів порівнюйте контраст ролей: ≥4,5:1 (або ≥3:1 для тексту від 24 px і нетекстових елементів).
- Якщо готового рішення немає — складіть його з ролей і токенів відступів; якщо й так не виходить, залиште позначку `TODO(brand)` і повідомте користувача.

**Don't**

- Не вигадуйте кольорів, відтінків, кеглів, відступів, тіней, градієнтів і заокруглень поза токенами.
- Не використовуйте `accent-yellow`, `accent-blue` і `brand-solid` (у темній темі) як колір тексту.
- Не використовуйте ваги, окрім 400 і 600; шрифти, окрім Fira Sans, Times New Roman, Cambria.
- Не змінюйте пропорції, колір і форму логотипа; не ставте його на строкатий фон; не розтягуйте; не використовуйте растр замість SVG; не меншіть нижче мінімальних розмірів (брендбук, с. 12–13).
- Не змінюйте ядро пакета (`tokens/`, `rules/`, `assets/`) і не редагуйте `dist/` вручну. Ядро змінюють лише люди.

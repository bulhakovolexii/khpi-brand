# Шрифти

Файли шрифтів у пакет **не входять**: Fira Sans розповсюджується за ліцензією SIL OFL 1.1, брендбук (с. 15) вказує її прямо.

| Гарнітура | Призначення | Звідки брати |
|---|---|---|
| **Fira Sans** (400 Regular, 600 SemiBold) | універсальний шрифт: текст, заголовки, UI, слайди, відео | Google Fonts: <https://fonts.google.com/specimen/Fira+Sans> або `npm i @fontsource/fira-sans` |
| Times New Roman | офіційні документи (вимоги МОН) | системний шрифт Windows/macOS |
| Cambria | менш формальні друковані матеріали | системний шрифт Windows/Office |

Fira Sans потрібні лише дві ваги: **400** і **600** (правило `typography.max-weights`, не більше 2 варіантів в одному матеріалі). Кирилиця є в наборі `cyrillic` та `cyrillic-ext`.

## Підключення

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;600&display=swap&subset=cyrillic" rel="stylesheet">
```

Для офлайн-матеріалів (Remotion, друк): `npm i @fontsource/fira-sans` і `import '@fontsource/fira-sans/cyrillic-400.css'`, `…/cyrillic-600.css`.

TTF для локальної роботи (Remotion, Typst, друк): `npm run fonts` у корені пакета завантажує `FiraSans-Regular.ttf` і `FiraSans-SemiBold.ttf` з репозиторію Google Fonts (`google/fonts/ofl/firasans`) у `examples/shared/fonts/`.

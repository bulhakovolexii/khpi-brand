// khpi-brand 0.1.0. Згенеровано з tokens/ (npm run build). Не редагувати вручну.
// Використання:  #import "brand.typ": *   потім  #set text(font: font-sans, fill: colors-light.ink)
// Одиниці контекстів: у Typst CSS-піксель = 0.75pt, тому значення перераховано в pt.
#let colors-light = (
  brand-solid: rgb("#A0001B"),
  on-brand: rgb("#FFFFFF"),
  accent-yellow: rgb("#FBBA00"),
  accent-blue: rgb("#3EB1C8"),
  on-accent: rgb("#2A2A2A"),
  surface: rgb("#FFFFFF"),
  surface-raised: rgb("#F7F7F7"),
  ink: rgb("#2A2A2A"),
  ink-muted: rgb("#5F5F5F"),
  border: rgb("#E5E5E5"),
  border-strong: rgb("#7F7F7F"),
  brand: rgb("#A0001B"),
  brand-subtle: rgb("#F7EBED"),
  accent-blue-text: rgb("#1D7F93"),
)
#let colors-dark = (
  brand-solid: rgb("#A0001B"),
  on-brand: rgb("#FFFFFF"),
  accent-yellow: rgb("#FBBA00"),
  accent-blue: rgb("#3EB1C8"),
  on-accent: rgb("#2A2A2A"),
  surface: rgb("#2A2A2A"),
  surface-raised: rgb("#333333"),
  ink: rgb("#ECECEC"),
  ink-muted: rgb("#AAAAAA"),
  border: rgb("#4A4A4A"),
  border-strong: rgb("#7F7F7F"),
  brand: rgb("#D999A4"),
  brand-subtle: rgb("#3D2A2D"),
  accent-blue-text: rgb("#6EC4D6"),
)
#let palette = (
  "white": rgb("#FFFFFF"),
  "brand-40": rgb("#D999A4"),
  "brand-60": rgb("#C66676"),
  "brand-75": rgb("#B84054"),
  "brand-100": rgb("#A0001B"),
  "yellow-40": rgb("#FDE399"),
  "yellow-60": rgb("#FDD666"),
  "yellow-75": rgb("#FCCB40"),
  "yellow-100": rgb("#FBBA00"),
  "blue-40": rgb("#B2E0E9"),
  "blue-60": rgb("#8BD0DE"),
  "blue-75": rgb("#6EC4D6"),
  "blue-100": rgb("#3EB1C8"),
  "graphite-40": rgb("#AAAAAA"),
  "graphite-60": rgb("#7F7F7F"),
  "graphite-75": rgb("#5F5F5F"),
  "graphite-100": rgb("#2A2A2A"),
)
#let font-sans = ("Fira Sans",)
#let font-doc = ("Times New Roman",)
#let font-soft = ("Cambria",)
#let weight-regular = 400
#let weight-semibold = 600
#let contexts = (
  doc: (
    type-title-size: 18pt,
    type-title-line-height: 24pt,
    type-body-size: 12.75pt,
    type-body-line-height: 21pt,
    type-label-size: 10.5pt,
    type-label-line-height: 15pt,
    type-min-size: 10.5pt,
    layout-gap: 12pt,
    layout-measure: 70,
  ),
  slide: (
    type-title-size: 48pt,
    type-title-line-height: 54pt,
    type-body-size: 27pt,
    type-body-line-height: 36pt,
    type-label-size: 21pt,
    type-label-line-height: 27pt,
    type-min-size: 21pt,
    layout-gap: 24pt,
    layout-margin: 60pt,
  ),
  video: (
    type-title-size: 54pt,
    type-title-line-height: 60pt,
    type-body-size: 33pt,
    type-body-line-height: 42pt,
    type-label-size: 27pt,
    type-label-line-height: 33pt,
    type-min-size: 27pt,
    layout-gap: 36pt,
    layout-safe-margin: 72pt,
    layout-safe-bottom-ratio: 0.2,
  ),
  print: (
    type-body-size: 14pt,
    type-min-size: 14pt,
  ),
)

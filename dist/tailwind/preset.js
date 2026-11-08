// khpi-brand 0.1.0 — Tailwind v3 preset. Згенеровано з tokens/ (npm run build). Не редагувати вручну.
// Для Tailwind v4 використовуйте theme.css. Підключіть також dist/css/tokens.css.
export default {
  theme: {
    colors: {
      "transparent": "transparent",
      "current": "currentColor",
      "brand-solid": "var(--khpi-color-brand-solid)",
      "on-brand": "var(--khpi-color-on-brand)",
      "accent-yellow": "var(--khpi-color-accent-yellow)",
      "accent-blue": "var(--khpi-color-accent-blue)",
      "data.1": "var(--khpi-color-data-1)",
      "data.2": "var(--khpi-color-data-2)",
      "data.3": "var(--khpi-color-data-3)",
      "data.4": "var(--khpi-color-data-4)",
      "on-accent": "var(--khpi-color-on-accent)",
      "surface": "var(--khpi-color-surface)",
      "surface-raised": "var(--khpi-color-surface-raised)",
      "ink": "var(--khpi-color-ink)",
      "ink-muted": "var(--khpi-color-ink-muted)",
      "border": "var(--khpi-color-border)",
      "border-strong": "var(--khpi-color-border-strong)",
      "brand": "var(--khpi-color-brand)",
      "brand-subtle": "var(--khpi-color-brand-subtle)",
      "accent-blue-text": "var(--khpi-color-accent-blue-text)"
},
    fontFamily: {
      sans: ['var(--khpi-font-family-sans)'],
      doc: ['var(--khpi-font-family-doc)'],
      soft: ['var(--khpi-font-family-soft)'],
    },
    borderRadius: { none: '0', sm: '2px', md: '4px', full: '9999px' },
    boxShadow: { none: 'none' },
    spacing: {"0":"0","4":"4px","8":"8px","16":"16px","24":"24px","32":"32px","48":"48px","64":"64px"},
    transitionDuration: { fast: '150ms', DEFAULT: '300ms', slow: '600ms' },
    transitionTimingFunction: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)', enter: 'cubic-bezier(0, 0, 0.2, 1)', exit: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
};

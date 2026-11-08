// khpi-brand 0.1.0 — MUI v6/v7. Згенеровано з tokens/ (npm run build). Не редагувати вручну.
// Підключення: <ThemeProvider theme={khpiTheme}> + data-theme на <html> (colorSchemeSelector).
// Кольори помилки/попередження/успіху бренд не визначає — лишено значення MUI за замовчуванням (див. README, «Відкриті питання»).
import { createTheme } from '@mui/material/styles';

export const khpiTheme = createTheme({
  cssVariables: { colorSchemeSelector: '[data-theme="%s"]' },
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#A0001B', contrastText: '#FFFFFF' },
        secondary: { main: '#3EB1C8', contrastText: '#2A2A2A' },
        text: { primary: '#2A2A2A', secondary: '#5F5F5F' },
        background: { default: '#FFFFFF', paper: '#F7F7F7' },
        divider: '#E5E5E5',
      },
    },
    dark: {
      palette: {
        primary: { main: '#A0001B', contrastText: '#FFFFFF' },
        secondary: { main: '#3EB1C8', contrastText: '#2A2A2A' },
        text: { primary: '#ECECEC', secondary: '#AAAAAA' },
        background: { default: '#2A2A2A', paper: '#333333' },
        divider: '#4A4A4A',
      },
    },
  },
  shape: { borderRadius: 4 },
  // Тіней у бренді немає
  shadows: Array(25).fill('none') as unknown as import('@mui/material/styles').Shadows,
  typography: {
    fontFamily: "'Fira Sans', 'Helvetica Neue', Arial, sans-serif",
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 600,
    h1: { fontSize: '24px', lineHeight: '32px', fontWeight: 600 },
    h2: { fontSize: '24px', lineHeight: '32px', fontWeight: 600 },
    body1: { fontSize: '17px', lineHeight: '28px' },
    body2: { fontSize: '14px', lineHeight: '20px' },
    caption: { fontSize: '14px', lineHeight: '20px' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  transitions: {
    duration: { shortest: 150, shorter: 150, short: 300, standard: 300, complex: 600, enteringScreen: 300, leavingScreen: 150 },
    easing: { easeInOut: 'cubic-bezier(0.2, 0, 0, 1)', easeOut: 'cubic-bezier(0, 0, 0.2, 1)', easeIn: 'cubic-bezier(0.4, 0, 1, 1)', sharp: 'cubic-bezier(0.2, 0, 0, 1)' },
  },
  components: {
    // Текстові й контурні кнопки: колір тексту — роль brand (у темній темі чистий бордовий на графіті дає лише 1.7:1)
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        textPrimary: { color: 'var(--khpi-color-brand)' },
        outlinedPrimary: { color: 'var(--khpi-color-brand)', borderColor: 'var(--khpi-color-border-strong)', '&:hover': { borderColor: 'var(--khpi-color-brand)' } },
      },
    },
    // Дрібні компоненти MUI мають кегль 11–13 px: підтягуємо до розміру підпису (мінімум контексту doc — 14 px)
    MuiChip: { styleOverrides: { root: { borderRadius: 'var(--khpi-radius-2)', fontSize: 'var(--khpi-type-label-size)', fontWeight: 600 } } },
    MuiToggleButton: { styleOverrides: { root: { fontSize: 'var(--khpi-type-label-size)', textTransform: 'none', fontWeight: 600 } } },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: 'var(--khpi-type-label-size)' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    // Посилання та текст-акцент: у темній темі чистий бордовий не читається, тому беремо роль brand
    MuiLink: { styleOverrides: { root: { color: 'var(--khpi-color-brand)' } } },
  },
});

export default khpiTheme;

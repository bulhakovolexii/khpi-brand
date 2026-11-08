import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import '../../shared/fira.css';
import '../../../dist/css/tokens.css';
import './app.css';
import { khpiTheme } from './khpi-theme';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={khpiTheme} disableTransitionOnChange>
    <CssBaseline />
    <App />
  </ThemeProvider>,
);

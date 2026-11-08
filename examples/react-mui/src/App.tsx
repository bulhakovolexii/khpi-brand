import { useState } from 'react';
import { AppBar, Toolbar, Button, Card, CardContent, Typography, Chip, Container, Stack, TextField, Link, Alert, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import logoLight from '../../../assets/logos/ua/block-direct-brand.svg';
import logoDark from '../../../assets/logos/ua/block-inverse-graphite.svg';

function Panel({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <section className="panel" data-theme={theme} aria-label={theme === 'dark' ? 'Темна тема' : 'Світла тема'}>
      <Typography variant="h2">{theme === 'dark' ? 'Темна' : 'Світла'}</Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Button variant="contained">Основна дія</Button>
        <Button variant="outlined">Другорядна</Button>
        <Chip label="Жовта мітка" sx={{ bgcolor: 'var(--khpi-color-accent-yellow)', color: 'var(--khpi-color-on-accent)' }} />
        <Chip label="Блакитна мітка" sx={{ bgcolor: 'var(--khpi-color-accent-blue)', color: 'var(--khpi-color-on-accent)' }} />
      </Stack>
      <Card variant="outlined"><CardContent>
        <Typography variant="h2" sx={{ fontSize: 'var(--khpi-type-body-size)', lineHeight: 'var(--khpi-type-body-line-height)' }}>Картка MUI</Typography>
        <Typography color="text.secondary">Без тіні: <strong>shadows</strong> усі <code>none</code>, поверхня — <code>surface-raised</code>.</Typography>
      </CardContent></Card>
      <Alert severity="info" icon={false} sx={{ bgcolor: 'var(--khpi-color-brand-subtle)', color: 'var(--khpi-color-ink)', borderLeft: '4px solid var(--khpi-color-brand-solid)' }}>
        Виноска на ролі brand-subtle.
      </Alert>
      <Typography><Link href="#x">Посилання (brand)</Link></Typography>
      <TextField label="Поле введення" size="small" />
    </section>
  );
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const choose = (_: unknown, v: 'light' | 'dark' | null) => { if (!v) return; setTheme(v); document.documentElement.dataset.theme = v; };
  return (
    <>
      <AppBar position="static" color="inherit" elevation={0} sx={{ bgcolor: 'var(--khpi-color-surface)', borderBottom: '1px solid var(--khpi-color-border)' }}>
        <Toolbar>
          <img className="logo logo-light" alt="НТУ «ХПІ»" src={logoLight} />
          <img className="logo logo-dark" alt="НТУ «ХПІ»" src={logoDark} />
          <Box sx={{ flex: 1 }} />
          <ToggleButtonGroup exclusive size="small" value={theme} onChange={choose} aria-label="Тема">
            <ToggleButton value="light">Світла</ToggleButton>
            <ToggleButton value="dark">Темна</ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h1" color="primary" gutterBottom sx={{ color: 'var(--khpi-color-brand)' }}>React + MUI: тема khpi-brand</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Тема створена з <code>dist/mui/theme.ts</code>: <code>createTheme</code> із <code>cssVariables</code>, обидві кольорові схеми, тіней немає.</Typography>
        <div className="duo"><Panel theme="light" /><Panel theme="dark" /></div>
      </Container>
    </>
  );
}

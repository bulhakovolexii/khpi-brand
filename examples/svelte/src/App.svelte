<script>
  import logoLight from '../../../assets/logos/ua/block-direct-brand.svg';
  import logoDark from '../../../assets/logos/ua/block-inverse-graphite.svg';
  import Panel from './Panel.svelte';

  // Контекст: перемикаємо data-mode на <html>; теми показані одночасно
  let mode = $state('doc');
  $effect(() => { document.documentElement.dataset.mode = mode; });
  const modes = [['doc', 'Документ'], ['slide', 'Слайд'], ['video', 'Відео']];
</script>

<header>
  <img class="logo light" alt="НТУ «ХПІ»" src={logoLight} />
  <img class="logo dark" alt="НТУ «ХПІ»" src={logoDark} />
  <div class="spacer"></div>
  <div role="group" aria-label="Контекст">
    {#each modes as [m, label]}
      <button class:on={mode === m} onclick={() => (mode = m)}>{label}</button>
    {/each}
  </div>
</header>

<main>
  <h1>Svelte: змінні khpi-brand у scoped-стилях</h1>
  <p class="lead">Контекст <code>data-mode</code> міняє розміри, тема — кольори. Компонент не прописує жодного значення: лише <code>var(--khpi-*)</code>.</p>
  <div class="duo">
    <Panel theme="light" />
    <Panel theme="dark" />
  </div>
</main>

<style>
  :global(body) { margin: 0; background: var(--khpi-color-surface); color: var(--khpi-color-ink); font: var(--khpi-type-body-weight) var(--khpi-type-body-size) / var(--khpi-type-body-line-height) var(--khpi-type-family); }
  :global(code) { font-family: var(--khpi-type-family); font-weight: var(--khpi-font-weight-semibold); }
  :global(strong) { font-weight: var(--khpi-font-weight-semibold); }
  header { display: flex; align-items: center; padding: var(--khpi-space-16) var(--khpi-space-32); border-bottom: 1px solid var(--khpi-color-border); }
  .logo { height: var(--khpi-space-48); }
  .dark { display: none; }
  :global([data-theme='dark']) .dark { display: block; }
  :global([data-theme='dark']) .light { display: none; }
  .spacer { flex: 1; }
  [role='group'] { display: flex; }
  button { font: var(--khpi-type-label-weight) var(--khpi-type-label-size) / var(--khpi-type-label-line-height) var(--khpi-type-family); background: var(--khpi-color-surface); color: var(--khpi-color-brand); border: 1px solid var(--khpi-color-border-strong); padding: var(--khpi-space-8) var(--khpi-space-16); cursor: pointer; border-radius: var(--khpi-radius-0); }
  button.on { background: var(--khpi-color-brand-solid); color: var(--khpi-color-on-brand); border-color: var(--khpi-color-brand-solid); }
  main { max-width: 1200px; margin: 0 auto; padding: var(--khpi-space-32); }
  h1 { margin: 0 0 var(--khpi-space-16); color: var(--khpi-color-brand); font: var(--khpi-type-title-weight) var(--khpi-type-title-size) / var(--khpi-type-title-line-height) var(--khpi-type-family); }
  .lead { color: var(--khpi-color-ink-muted); max-width: calc(var(--khpi-layout-measure, 70) * 1ch); }
  .duo { display: grid; grid-template-columns: 1fr 1fr; gap: var(--khpi-layout-gap); }
  @media (max-width: 800px) { .duo { grid-template-columns: 1fr; } }
</style>

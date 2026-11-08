<script>
  let { theme } = $props();
  let count = $state(2);
  const series = [['data-1', 'бордовий', 80], ['data-2', 'блакит', 60], ['data-3', 'жовтий', 40], ['data-4', 'сірий', 25]];
</script>

<section data-theme={theme} aria-label={theme === 'dark' ? 'Темна тема' : 'Світла тема'}>
  <h2>{theme === 'dark' ? 'Темна' : 'Світла'}</h2>
  <div class="row">
    <button class="primary" onclick={() => count++}>Лічильник: {count}</button>
    <span class="tag y">Жовта мітка</span>
    <span class="tag b">Блакитна мітка</span>
  </div>
  <div class="card"><strong>Картка</strong><p>Піднята поверхня без тіні: <code>surface-raised</code> і межа.</p></div>
  <div class="callout">Виноска на ролі <code>brand-subtle</code>.</div>
  <p><a href="#x">Посилання (brand)</a> · <a class="blue" href="#x">accent-blue-text</a></p>
  <div class="chart">
    {#each series as [v, name, w]}
      <div class="bar"><span>{name}</span><b style:width="{w}%" style:background="var(--khpi-color-{v})"></b></div>
    {/each}
  </div>
</section>

<style>
  section { background: var(--khpi-color-surface); color: var(--khpi-color-ink); border: 1px solid var(--khpi-color-border); border-radius: var(--khpi-radius-4); padding: var(--khpi-space-24); display: grid; gap: var(--khpi-layout-gap); }
  h2 { margin: 0; font: var(--khpi-type-label-weight) var(--khpi-type-label-size) / var(--khpi-type-label-line-height) var(--khpi-type-family); color: var(--khpi-color-ink-muted); }
  .row { display: flex; gap: var(--khpi-space-8); flex-wrap: wrap; align-items: center; }
  .primary { font: var(--khpi-type-label-weight) var(--khpi-type-label-size) / var(--khpi-type-label-line-height) var(--khpi-type-family); background: var(--khpi-color-brand-solid); color: var(--khpi-color-on-brand); border: 0; border-radius: var(--khpi-radius-4); padding: var(--khpi-space-8) var(--khpi-space-16); cursor: pointer; transition: opacity var(--khpi-motion-duration-fast) var(--khpi-motion-easing-standard); }
  .primary:hover { opacity: 0.9; }
  .tag { padding: var(--khpi-space-4) var(--khpi-space-8); border-radius: var(--khpi-radius-2); color: var(--khpi-color-on-accent); font: var(--khpi-type-label-weight) var(--khpi-type-label-size) / var(--khpi-type-label-line-height) var(--khpi-type-family); }
  .y { background: var(--khpi-color-accent-yellow); }
  .b { background: var(--khpi-color-accent-blue); }
  .card { background: var(--khpi-color-surface-raised); border: 1px solid var(--khpi-color-border); border-radius: var(--khpi-radius-4); padding: var(--khpi-space-16); }
  .card p { margin: 0; color: var(--khpi-color-ink-muted); }
  .callout { background: var(--khpi-color-brand-subtle); border-left: var(--khpi-space-4) solid var(--khpi-color-brand-solid); border-radius: var(--khpi-radius-2); padding: var(--khpi-space-16); }
  a { color: var(--khpi-color-brand); }
  .blue { color: var(--khpi-color-accent-blue-text); }
  .chart { display: grid; gap: var(--khpi-space-8); }
  .bar { display: grid; grid-template-columns: 9ch 1fr; align-items: center; gap: var(--khpi-space-8); }
  .bar b { height: var(--khpi-space-24); border: 1px solid var(--khpi-color-ink); border-radius: var(--khpi-radius-2); }
  .bar span { font: var(--khpi-type-label-weight) var(--khpi-type-label-size) / var(--khpi-type-label-line-height) var(--khpi-type-family); }
</style>

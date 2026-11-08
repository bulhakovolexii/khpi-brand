const ROLES = ['surface', 'surface-raised', 'ink', 'ink-muted', 'border', 'border-strong', 'brand', 'brand-solid', 'on-brand', 'brand-subtle', 'accent-yellow', 'accent-blue', 'accent-blue-text', 'on-accent'];
const root = document.documentElement;

// Ролі: назва, змінна й обчислений HEX у тій темі, в якій стоїть панель
for (const box of document.querySelectorAll('[data-roles]')) {
  const cs = getComputedStyle(box.closest('[data-theme]'));
  box.innerHTML = ROLES.map((r) => {
    const v = cs.getPropertyValue(`--khpi-color-${r}`).trim();
    return `<div class="sw"><i style="background:var(--khpi-color-${r})"></i><span>${r}</span><small>${v}</small></div>`;
  }).join('');
}

const emblemFor = (t) => (t === 'dark' ? '../../assets/logos/ua/emblem-inverse-graphite.svg' : '../../assets/logos/ua/emblem-direct-brand.svg');

for (const c of document.querySelectorAll('.components')) {
  c.innerHTML = `
    <div class="row"><button class="btn" type="button">Основна дія</button><button class="btn ghost" type="button">Другорядна</button>
      <span class="tag y">Жовта мітка</span><span class="tag b">Блакитна мітка</span></div>
    <div class="card"><h4>Картка</h4><p>Піднята поверхня: <code>surface-raised</code> і межа <code>border</code>, без тіні.</p></div>
    <div class="callout">Виноска: <code>brand-subtle</code> і бордовий акцент 4 px.</div>
    <div><a href="#x">Посилання (brand)</a> · <a class="blue" href="#x">Блакитний текст (accent-blue-text)</a></div>
    <input placeholder="Поле введення" aria-label="Поле введення">`;
}
const data = [['data-1', 'бордовий', 80], ['data-2', 'блакит', 62], ['data-3', 'жовтий', 45], ['data-4', 'сірий', 30]];
for (const c of document.querySelectorAll('.chart')) {
  c.innerHTML = data.map(([v, n, w]) => `<div class="bar"><span>${n}</span><b style="width:${w}%;background:var(--khpi-color-${v})"></b></div>`).join('');
}
for (const s of document.querySelectorAll('.slide')) {
  const t = s.closest('[data-theme]').dataset.theme;
  s.innerHTML = `<div class="t">Заголовок слайда: SemiBold 64/72</div>
    <ul><li>Основний текст 36/48, Regular</li><li>Поля 80, проміжок 32</li><li>Мінімальний кегль 28</li></ul>
    <div class="foot"><span>Підпис 28/36 · Слайд 1</span><img alt="" src="${emblemFor(t)}"></div>`;
}
for (const v of document.querySelectorAll('.video')) {
  v.innerHTML = `<div class="safe"><div class="t">Відео: заголовок 72/80</div><p>Основний текст 44/56 у безпечній зоні 96 px.</p>
    <div class="row"><b style="width:480px;background:var(--khpi-color-data-1)"></b><b style="width:320px;background:var(--khpi-color-data-2)"></b><b style="width:200px;background:var(--khpi-color-data-3)"></b></div></div>
    <div class="sub">Зона субтитрів: 20 % висоти знизу</div>`;
}
const fit = () => { for (const st of document.querySelectorAll('.stage')) { const k = st.clientWidth / 1920; st.firstElementChild.style.transform = `scale(${k})`; } };
fit(); new ResizeObserver(fit).observe(document.body);

// Тема
const btn = document.getElementById('toggle');
const set = (t) => { root.dataset.theme = t; btn.textContent = `Тема: ${t === 'dark' ? 'темна' : 'світла'}`; try { localStorage.setItem('khpi-theme', t); } catch {} };
try { const s = localStorage.getItem('khpi-theme'); if (s) set(s); } catch {}
btn.addEventListener('click', () => set(root.dataset.theme === 'dark' ? 'light' : 'dark'));
const m = document.getElementById('motion');
const play = () => { m.classList.remove('play'); void m.offsetWidth; m.classList.add('play'); };
document.getElementById('replay').addEventListener('click', play); play();

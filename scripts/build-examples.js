// Збірка прикладів і (за наявності playwright) візуальна перевірка їх brand-check'ом.
//   node scripts/build-examples.js            зібрати react-mui, svelte, quarto (якщо є quarto)
//   node scripts/build-examples.js --shots    додатково зробити знімки в examples/_shots та перевірити їх
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../lib/tokens.js';
import { checkVisual } from '../check/visual.js';
import { checkCode } from '../check/code.js';

const ex = (n) => path.join(ROOT, 'examples', n);
const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, stdio: 'pipe', encoding: 'utf8', shell: process.platform === 'win32' });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} (${path.basename(cwd)}) завершився з кодом ${r.status}\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
};
export const hasQuarto = () => spawnSync('quarto', ['--version'], { stdio: 'ignore' }).status === 0;

export function buildExamples({ log = console.log } = {}) {
  const built = [];
  for (const name of ['react-mui', 'svelte']) {
    const dir = ex(name);
    if (!fs.existsSync(path.join(dir, 'node_modules'))) { log(`${name}: npm install`); run('npm', ['install', '--no-audit', '--no-fund'], dir); }
    log(`${name}: npm run build`);
    run('npm', ['run', 'build'], dir);
    built.push(name);
  }
  if (hasQuarto()) {
    log('quarto: render');
    run('npm', ['run', 'sync'], ex('quarto'));
    run('quarto', ['render'], ex('quarto'));
    built.push('quarto');
  } else log('quarto: не встановлений, пропущено (pip install quarto-cli)');
  return built;
}

export function serveRoot(port = 0) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.png': 'image/png', '.json': 'application/json' };
  const srv = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    let f = p; try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch { res.writeHead(404).end(); return; }
    fs.readFile(f, (e, d) => (e ? res.writeHead(404).end() : res.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' }).end(d)));
  });
  return new Promise((r) => srv.listen(port, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}

export async function checkExamples({ log = console.log } = {}) {
  const out = { code: [], visual: [] };
  for (const d of ['html', 'react-mui/src', 'svelte/src']) out.code.push(...(await checkCode(ex(d))).findings.map((f) => ({ ...f, example: d })));
  const { srv, port } = await serveRoot();
  try {
    const pages = [['html', '/examples/html/index.html'], ['react-mui', '/examples/react-mui/dist/index.html'], ['svelte', '/examples/svelte/dist/index.html']];
    for (const [name, url] of pages) {
      if (!fs.existsSync(path.join(ROOT, url))) { log(`${name}: немає збірки, пропущено`); continue; }
      const r = await checkVisual(`http://127.0.0.1:${port}${url}`, { outDir: path.join(ROOT, 'examples/_shots') });
      out.visual.push(...r.findings.map((f) => ({ ...f, example: name })));
    }
  } finally { srv.close(); }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildExamples();
  if (process.argv.includes('--shots')) {
    const r = await checkExamples();
    const bad = [...r.code, ...r.visual].filter((f) => f.severity === 'error');
    console.log(`знімки: examples/_shots; помилок: ${bad.length}`);
    for (const f of bad) console.log(' ', f.example, f.ruleId, f.message);
    process.exit(bad.length ? 1 : 0);
  }
}

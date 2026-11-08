// Завантажує Fira Sans 400 і 600 (TTF, OFL) з першоджерела — репозиторію Google Fonts — для прикладів.
// node scripts/fetch-fonts.js   (потрібна мережа; вже наявні файли не перезавантажуються)
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from '../lib/tokens.js';

const BASE = 'https://raw.githubusercontent.com/google/fonts/main/ofl/firasans/';
const dir = path.join(ROOT, 'examples/shared/fonts');
await fs.mkdir(dir, { recursive: true });
for (const f of ['FiraSans-Regular.ttf', 'FiraSans-SemiBold.ttf']) {
  const p = path.join(dir, f);
  try { await fs.access(p); continue; } catch {}
  const r = await fetch(BASE + f);
  if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`);
  await fs.writeFile(p, Buffer.from(await r.arrayBuffer()));
  console.log('завантажено', f);
}

import { spawn } from 'node:child_process';
import { closeSync, openSync } from 'node:fs';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const project = new URL('../', import.meta.url);
const folder = fileURLToPath(project);
const port = '8790';
const url = `http://127.0.0.1:${port}/interface/`;

async function probe() {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(800), redirect: 'manual' });
    return response.ok && (await response.text()).includes('id="app" data-view="list"') ? 'ready' : 'occupied';
  } catch {
    return 'offline';
  }
}

async function start() {
  if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('O ChatBoot requer Node.js 24 ou superior.');
  const initial = await probe();
  if (initial === 'ready') return;
  if (initial === 'occupied') throw new Error(`Outro serviço está respondendo na porta ${port}.`);

  const log = openSync(new URL('dados-locais/natus-launcher.log', project), 'a');
  let child;
  try {
    child = spawn(process.execPath, ['server.mjs', '--demo'], {
      cwd: folder, env: { ...process.env, NATUS_PORT: port }, detached: true,
      windowsHide: true, stdio: ['ignore', log, log],
    });
  } finally {
    closeSync(log);
  }
  let failed;
  child.on('error', error => { failed = error; });
  child.unref();
  for (let attempt = 0; attempt < 28; attempt++) {
    const state = await probe();
    if (state === 'ready') return;
    if (state === 'occupied') throw new Error(`Outro serviço está respondendo na porta ${port}.`);
    if (failed) throw failed;
    if (child.exitCode !== null && attempt > 4) break;
    await setTimeout(250);
  }
  throw new Error('O servidor não iniciou. Consulte dados-locais/natus-launcher.log.');
}

try {
  await start();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

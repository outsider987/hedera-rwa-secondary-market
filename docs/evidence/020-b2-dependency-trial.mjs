// Isolated trial orchestration. Uses public tracked files and npm; no wallet code.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, symlinkSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const read = p => JSON.parse(readFileSync(p));
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
export const overrides = read(join(repo, 'docs/evidence/019-b2-vc-readiness.json')).candidate.overrides;

async function command(cwd, label, args) {
  const log = join(cwd, label + '.log');
  assert(!existsSync(log), 'Do not overwrite trial logs');
  const chunks = [];
  const child = spawn(args[0], args.slice(1), { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', b => chunks.push(b));
  child.stderr.on('data', b => chunks.push(b));
  const code = await new Promise((done, reject) => {
    child.once('error', reject); child.once('exit', done);
  });
  writeFileSync(log, Buffer.concat(chunks), { flag: 'wx' });
  console.log(JSON.stringify({ label, code, log }));
  return code;
}

const [stage, target] = process.argv.slice(2);
if (stage === 'prepare') {
  const parent = join(repo, '.impeccable'); mkdirSync(parent, { recursive: true });
  const trial = mkdtempSync(join(parent, 'b2-020-'));
  for (const name of ['baseline', 'candidate']) {
    const dir = join(trial, name); mkdirSync(dir);
    for (const path of ['package.json', 'package-lock.json', '.npmrc', 'src', 'scripts', 'tests',
      'docs/evidence', 'vite.config.ts', 'tsconfig.json', 'index.html']) {
      cpSync(join(repo, path), join(dir, path), { recursive: true });
    }
  }
  const manifest = read(join(trial, 'candidate/package.json'));
  manifest.overrides = { ...manifest.overrides, ...overrides };
  writeFileSync(join(trial, 'candidate/package.json'), JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(join(trial, 'base.json'), JSON.stringify({
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(),
    hashes: Object.fromEntries(['package.json', 'package-lock.json', 'scripts/rebuild-proto.mjs',
      'scripts/patch-ats-readonly.mjs'].map(p => [p, hash(join(repo, p))])),
  }, null, 2));
  console.log(trial);
} else if (stage === 'browser') {
  const dir = resolve(target), output = process.argv[4], playwright = process.argv[5];
  assert(dir.startsWith(join(repo, '.impeccable/b2-020-')) && output && !existsSync(output) && playwright);
  const require = createRequire(join(dir, 'package.json'));
  const { build, createServer, preview } = await import(pathToFileURL(require.resolve('vite')));
  const { chromium } = createRequire(resolve(playwright))('playwright');
  const root = mkdtempSync(join(dir, 'vc-probe-'));
  cpSync(join(dir, 'vite.config.ts'), join(root, 'vite.config.ts'));
  cpSync(join(dir, 'src/compat'), join(root, 'src/compat'), { recursive: true });
  symlinkSync(join(dir, 'node_modules'), join(root, 'node_modules'), 'dir');
  writeFileSync(join(root, 'package.json'), '{"type":"module"}');
  writeFileSync(join(root, 'index.html'), '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width, initial-scale=1"><title>VC negative checks</title><button id="run">Run unsigned negative checks</button><output id="result">Not checked</output><script type="module" src="/probe.js"></script></html>');
  writeFileSync(join(root, 'probe.js'), `
document.querySelector('#run').onclick = async () => {
  try {
    const { verifyVc } = await import('@terminal3/verify_vc');
    const { prepareCredentialPayload, DID } = await import('@terminal3/vc_core');
    const payload = await prepareCredentialPayload(['SyntheticKyc'],
      new DID('ethr', '0x' + '1'.repeat(40)), new DID('ethr', '0x' + '2'.repeat(40)),
      { passed: true }, new Date('2020-01-01'), new Date('2020-01-02'));
    let missing = false, unsupported = false;
    try { await verifyVc(payload); } catch { missing = true; }
    try { await verifyVc({ ...payload, proof: { type: 'Unsupported' } }); } catch { unsupported = true; }
    const noValue = await verifyVc({ ...payload, proof: { type: 'EcdsaSecp256k1Signature2019' } });
    const expired = await verifyVc({ ...payload, proof: { type: 'EcdsaSecp256k1Signature2019', proofValue: 'invalid-marker' } });
    const passed = missing && unsupported && !noValue.isValid && !expired.isValid && expired.message.includes('expired');
    document.querySelector('#result').textContent = passed ? 'Negative checks passed' : 'Failed';
  } catch { document.querySelector('#result').textContent = 'Failed'; }
};`);
  let dev, production, browser;
  const results = [];
  try {
    await build({ root, logLevel: 'silent' });
    dev = await createServer({ root, logLevel: 'silent', server: { host: '127.0.0.1', port: 5186, strictPort: true } });
    await dev.listen();
    production = await preview({ root, logLevel: 'silent', preview: { host: '127.0.0.1', port: 4186, strictPort: true } });
    browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
    for (const [mode, port] of [['dev', 5186], ['preview', 4186]]) for (const mobile of [false, true]) {
      const origin = 'http://127.0.0.1:' + port;
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, serviceWorkers: 'block' });
      let external = 0, errors = 0;
      await context.route('**/*', route => {
        if (new URL(route.request().url()).origin === origin) return route.continue();
        external++; return route.abort();
      });
      await context.routeWebSocket('**/*', ws => {
        if (ws.url().startsWith('ws://127.0.0.1:' + port + '/')) ws.connectToServer();
        else { external++; ws.close(); }
      });
      await context.addInitScript(() => {
        window.walletAccesses = 0;
        Object.defineProperty(window, 'ethereum', { get() { window.walletAccesses++; throw new Error('Wallet forbidden'); } });
      });
      const page = await context.newPage(); page.on('pageerror', () => errors++);
      await page.goto(origin); await page.getByRole('button').click();
      await page.waitForFunction(() => document.querySelector('#result').textContent === 'Negative checks passed', null, { timeout: 60000 });
      const walletAccesses = await page.evaluate(() => window.walletAccesses);
      assert.equal(walletAccesses, 0); assert.equal(external, 0); assert.equal(errors, 0);
      results.push({ mode, size: mobile ? 'mobile' : 'desktop', negativeChecks: 4, walletAccesses, external, errors });
      await context.close();
    }
  } finally {
    await browser?.close(); await dev?.close();
    if (production) await new Promise(done => production.httpServer.close(done));
    writeFileSync(output, JSON.stringify({ kind: 'actual public verifier; unsigned negative fixtures only', results }, null, 2) + '\n', { flag: 'wx' });
  }
  console.log(JSON.stringify({ cases: results.length }));
} else if (stage) {
  const dir = resolve(target);
  assert(dir.startsWith(join(repo, '.impeccable/b2-020-')) && existsSync(join(dir, 'package.json')));
  const commands = {
    baseline: ['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'],
    resolve: ['npm', 'install', '--package-lock-only',
      '--ignore-scripts', '--no-audit', '--no-fund', '--install-strategy=nested'],
    materialize: ['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'],
    clean: ['npm', 'ci'],
    tests: ['npm', 'test'], typecheck: ['npm', 'run', 'typecheck'], build: ['npm', 'run', 'build'],
  };
  assert(commands[stage], 'Unknown trial stage');
  process.exitCode = await command(dir, stage, commands[stage]);
}

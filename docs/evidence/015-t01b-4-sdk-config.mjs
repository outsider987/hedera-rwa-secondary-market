// Isolated official-entry prerequisite diagnostic; no app/SDK/provider replacement.
// node this-file /external/playwright/package.json NEW-result.json [--live] [--gate]
// --gate fails if the public read-only initialization request is unavailable.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, createServer, preview } from 'vite';
import { encodeFunctionData } from 'viem';

assert.ok(process.argv[2] && process.argv[3], 'Supply external Playwright and a new output path');
const require = createRequire(process.argv[2]);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const hash = value => createHash('sha256').update(value).digest('hex');
const read = path => JSON.parse(readFileSync(join(root, path)));
const lock = read('package-lock.json');
const lockKeys = Object.keys(lock.packages).filter(Boolean).sort((a, b) => b.length - a.length);
const scratch = mkdtempSync(join(tmpdir(), 'holdbook-sdk015-'));
const rpcUrl = 'https://testnet.hashio.io/api';
const mirror = 'https://testnet.mirrornode.hedera.com/api/v1/contracts/';
const ids = ['0.0.9212226', '0.0.9213391'];
const addresses = ['0xba2d5fc2083a0b8f164c50e65d782087fba18e0a', '0xd1f118a40f3b02883d35909ef2517e7edd78379d'];
const configId = `0x${'0'.repeat(63)}1`;
const artifact = read('node_modules/@hashgraph/asset-tokenization-contracts/artifacts/contracts/infrastructure/diamond/DiamondCutManager.sol/DiamondCutManager.json');
const calldata = encodeFunctionData({ abi: artifact.abi, functionName: 'getLatestVersionByConfiguration', args: [configId] });
const probeSource = `
import './styles.css';
import { checkDeployment } from './deployment';
const state = window.probe = { phase: 'idle' };
const button = document.querySelector('button'), status = document.querySelector('#status');
let sdkLoad;
window.prepareSdk = () => sdkLoad ??= import('@hashgraph/asset-tokenization-sdk');
button.onclick = async () => {
  if (state.phase !== 'idle') return;
  state.phase = 'checking'; button.disabled = true; status.textContent = 'Checking…';
  const result = await checkDeployment(new AbortController().signal);
  state.deployment = { status: result.status, chainId: result.chainId, version: result.config.version,
    contracts: result.contracts.map(c => ({ id: c.id, address: c.address, byteLength: c.byteLength })) };
  if (result.status !== 'passed') { state.phase = 'prerequisite-failed'; status.textContent = 'Deployment not verified.'; return; }
  const sdk = await window.prepareSdk();
  state.exports = {
    setNetwork: typeof sdk.Network.setNetwork,
    SetNetworkRequest: typeof sdk.SetNetworkRequest,
    resolveLatestConfigVersion: typeof sdk.Management.resolveLatestConfigVersion,
    ResolveLatestConfigVersionRequest: typeof sdk.ResolveLatestConfigVersionRequest,
  };
  // Negative public-API probe: no fabricated validate() or other SDK bypass.
  try {
    await sdk.Network.setNetwork({ environment: 'testnet',
      mirrorNode: { baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/' },
      rpcNode: { baseUrl: 'https://testnet.hashio.io/api' },
    });
    state.plainObjectRejected = false;
  } catch (error) {
    state.plainObjectRejected = error instanceof TypeError && error.message.endsWith('.validate is not a function');
  }
  state.phase = state.exports.SetNetworkRequest === 'function' ? 'request-available' : 'blocked';
  status.textContent = state.phase === 'blocked' ? 'Blocked: public SetNetworkRequest is unavailable.' : 'Public request is available; re-evaluate the integration gate.';
};
`;
let dev, production, browser;
const results = [], bundle = { packages: [], assets: [], generatedSources: [] };
const record = {
  schemaVersion: 1, date: new Date().toISOString(),
  based_on_commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  lockSha256: hash(readFileSync(join(root, 'package-lock.json'))),
  node: process.version, playwright: require('playwright/package.json').version,
  kind: 'official-sdk-config-prerequisite', candidateSource: probeSource, results, bundle,
  note: 'Real public SDK entry in fresh contexts. Only existing viem deployment/config reads execute. No SDK config result, wallet/profile, signer, VC or transaction. No Network.init, deep import or fabricated validator.',
};
try {
  mkdirSync(join(scratch, 'src/compat'), { recursive: true });
  for (const path of ['package.json', 'package-lock.json', 'vite.config.ts', 'src/styles.css', 'src/deployment.ts', 'src/compat/dotenv.ts', 'src/compat/winston.ts']) copyFileSync(join(root, path), join(scratch, path));
  symlinkSync(join(root, 'node_modules'), join(scratch, 'node_modules'), 'dir');
  writeFileSync(join(scratch, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ATS config diagnostic</title></head><body><main><h1>ATS config diagnostic</h1><p>Isolated public read; no wallet.</p><p id="status" role="status" aria-live="polite">Idle</p><button>Check SDK prerequisite</button></main><script type="module" src="/src/probe.ts"></script></body></html>');
  writeFileSync(join(scratch, 'src/probe.ts'), probeSource);
  const built = await build({ root: scratch, logLevel: 'silent' });
  const packages = new Map(), generated = new Map();
  for (const item of built.output) {
    const content = item.type === 'chunk' ? item.code : item.source;
    assert.equal(hash(content), hash(readFileSync(join(scratch, 'dist', item.fileName))));
    bundle.assets.push({ path: item.fileName, bytes: Buffer.byteLength(content), sha256: hash(content) });
    if (item.type !== 'chunk') continue;
    for (const [id, info] of Object.entries(item.modules)) {
      if (!info.renderedLength || !id.includes('/node_modules/')) continue;
      const local = id.slice(id.indexOf('/node_modules/') + 1).split('?')[0];
      const owner = lockKeys.find(key => local.startsWith(key + '/'));
      assert.ok(owner, 'Every rendered dependency has an owning lock record');
      const entry = packages.get(owner) ?? { path: owner, version: lock.packages[owner].version,
        license: lock.packages[owner].license, modules: 0, renderedBytes: 0 };
      entry.modules++; entry.renderedBytes += info.renderedLength; packages.set(owner, entry);
      if (/node_modules\/@(?:hashgraph|hiero-ledger)\/proto\/(?:lib|src)\/proto.js$/.test(local)) generated.set(local, { path: local, sha256: hash(readFileSync(id.split('?')[0])) });
    }
  }
  bundle.packages = [...packages.values()].sort((a, b) => a.path.localeCompare(b.path));
  bundle.generatedSources = [...generated.values()];
  dev = await createServer({ root: scratch, logLevel: 'silent', server: { host: '127.0.0.1', port: 5185, strictPort: true } });
  await dev.listen();
  production = await preview({ root: scratch, logLevel: 'silent', preview: { host: '127.0.0.1', port: 4185, strictPort: true } });
  browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
  record.browser = browser.version();
  for (const [server, port] of [['dev', 5185], ['preview', 4185]]) {
    for (const scenario of ['desktop', 'mobile', ...(process.argv.includes('--live') ? ['live'] : [])]) {
      const viewport = scenario === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 1000 };
      const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
      const page = await context.newPage(), requests = [], forbidden = [];
      const origin = `http://127.0.0.1:${port}`;
      let pageErrors = 0;
      page.on('pageerror', () => pageErrors++);
      await context.addInitScript(() => {
        window.walletAccesses = 0;
        Object.defineProperty(window, 'ethereum', { get() { window.walletAccesses++; throw new Error('Wallet forbidden'); } });
      });
      await context.routeWebSocket('**/*', socket => {
        if (new URL(socket.url()).origin === `ws://127.0.0.1:${port}`) socket.connectToServer();
        else { forbidden.push(new URL(socket.url()).origin); socket.close(); }
      });
      await context.route('**/*', async route => {
        const request = route.request(), url = request.url();
        if (new URL(url).origin === origin) return route.continue();
        if (url !== rpcUrl && !ids.some(id => url === mirror + id)) { forbidden.push(new URL(url).origin); return route.abort(); }
        if (url !== rpcUrl) {
          requests.push({ method: 'GET', contractId: url.slice(mirror.length) });
          if (scenario === 'live') return route.continue();
          const index = ids.indexOf(url.slice(mirror.length));
          return route.fulfill({ json: { contract_id: ids[index], evm_address: addresses[index], deleted: false } });
        }
        const rpc = request.postDataJSON();
        assert.ok(['eth_chainId', 'eth_getCode', 'eth_call'].includes(rpc.method), 'Only existing viem public reads occur');
        if (rpc.method === 'eth_call') assert.deepEqual(rpc.params, [{ data: calldata, to: addresses[0] }, 'latest']);
        if (rpc.method === 'eth_getCode') assert.ok(addresses.includes(rpc.params[0].toLowerCase()));
        requests.push({ method: rpc.method });
        if (scenario === 'live') return route.continue();
        return route.fulfill({ json: { jsonrpc: '2.0', id: rpc.id, result: rpc.method === 'eth_chainId' ? '0x128' : rpc.method === 'eth_getCode' ? '0x6000' : `0x${'0'.repeat(63)}1` } });
      });
      try {
        await page.goto(origin, { waitUntil: 'networkidle' });
        assert.equal(requests.length, 0);
        // Explicit diagnostic preparation excludes Vite cold prebundling from RPC deadlines.
        await page.evaluate(() => window.prepareSdk().then(() => undefined));
        assert.equal(requests.length, 0, 'SDK import alone makes no public requests');
        await page.keyboard.press('Tab');
        assert.equal(await page.locator('button').evaluate(el => document.activeElement === el), true);
        assert.notEqual(await page.locator('button').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.locator('button').click();
        await page.locator('button').evaluate(el => { el.click(); el.click(); });
        await page.waitForFunction(() => !['idle', 'checking'].includes(window.probe.phase), null, { timeout: 15000 });
        const state = await page.evaluate(() => ({ ...window.probe }));
        if (scenario !== 'live' || state.deployment.status === 'passed') {
          assert.equal(state.phase, 'blocked');
          assert.equal(state.exports.SetNetworkRequest, 'undefined');
          assert.equal(state.plainObjectRejected, true);
          assert.equal(requests.length, 6, 'No SDK RPC or duplicate operation after the preflight');
        }
        const walletAccesses = await page.evaluate(() => window.walletAccesses);
        assert.equal(walletAccesses, 0); assert.deepEqual(forbidden, []); assert.equal(pageErrors, 0);
        await page.reload({ waitUntil: 'networkidle' });
        assert.equal(await page.locator('#status').textContent(), 'Idle');
        const item = { server, scenario, viewport, source: scenario === 'live' ? 'live Testnet preflight; no SDK config read' : 'synthetic preflight; real SDK', state, requests, walletAccesses, forbidden, pageErrors, keyboardAndOverflow: 'passed', reload: 'idle' };
        results.push(item);
        console.log(JSON.stringify({ server, scenario, phase: state.phase, viemVersion: state.deployment.version, publicRequest: state.exports?.SetNetworkRequest }));
      } finally { await context.close(); }
    }
  }
  record.integrationGate = results.every(item => item.state.exports?.SetNetworkRequest === 'function') ? 'passed' : 'blocked';
  record.unexecuted = ['SDK config payload validation', 'SDK cancellation/timeout/retry/redirect browser cases', 'Network.init or any transaction-adapter initialization'];
  writeFileSync(process.argv[3], JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
  if (process.argv.includes('--gate')) assert.equal(record.integrationGate, 'passed', 'Read-only SDK initialization requires its public request constructor');
} finally {
  await browser?.close(); await dev?.close();
  if (production) await new Promise(resolve => production.httpServer.close(resolve));
  rmSync(scratch, { recursive: true, force: true });
}

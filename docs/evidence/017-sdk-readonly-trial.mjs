// Isolated ATS 8.0.0 compatibility trial. No application source changes.
// node this-file /external/playwright/package.json NEW-result.json [--live] [--smoke | --cases=cancel,late]
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, createServer, preview } from 'vite';
import { encodeFunctionData, encodeErrorResult } from 'viem';
import { patches, patchAtsReadonly } from '../../scripts/patch-ats-readonly.mjs';

async function browserProbe(rpcUrl, calldata) {
  const state = window.probe = { phase: 'idle', attempts: 0, ignored: 0, sdkCalls: 0, fetches: 0, aborted: 0, settled: 0, destroyed: 0 };
  const prepare = document.querySelector('#prepare'), check = document.querySelector('#check');
  const cancel = document.querySelector('#cancel'), status = document.querySelector('#status');
  let sdk, ethers, active, epoch = 0;
  const safePayload = window.safePayload = value => {
    if (!Number.isSafeInteger(value) || value < 1) throw new Error('Invalid config version');
    return value;
  };
  const update = phase => { state.phase = phase; status.textContent = phase === 'passed' ? 'SDK config version ' + state.payload : phase; };
  prepare.onclick = async () => {
    prepare.disabled = true;
    try {
      [sdk, ethers] = await Promise.all([import('@hashgraph/asset-tokenization-sdk'), import('ethers')]);
      if (typeof sdk.SetNetworkRequest !== 'function') throw new Error('Missing public request');
      const properties = { environment: 'testnet', mirrorNode: { baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/' }, rpcNode: { baseUrl: rpcUrl } };
      state.validRequest = new sdk.SetNetworkRequest(properties).validate().length === 0;
      try { await sdk.Network.setNetwork(new sdk.SetNetworkRequest({ ...properties, environment: '' })); state.invalidRejected = false; }
      catch { state.invalidRejected = true; }
      if (!state.validRequest || !state.invalidRejected) throw new Error('Request validation changed');
      check.disabled = false;
      update('ready');
    } catch { update('preparation-failed'); }
  };
  const invalidate = () => {
    if (!active) return;
    epoch++;
    active.abort();
    delete state.payload;
    update('cancelled');
  };
  cancel.onclick = invalidate;
  window.addEventListener('holdbook:invalidate', invalidate);
  window.addEventListener('pagehide', invalidate);
  check.onclick = window.runCheck = async () => {
    if (!sdk || active) { state.ignored++; return; }
    const controller = active = new AbortController(), attempt = ++epoch;
    const deadline = AbortSignal.timeout(10_000);
    const signal = AbortSignal.any([controller.signal, deadline]);
    const started = performance.now();
    let provider;
    state.attempts++; delete state.payload; delete state.deployment;
    check.disabled = true; cancel.disabled = false;
    update('preflight');
    try {
      const deployment = await checkDeployment(signal);
      signal.throwIfAborted();
      state.deployment = { status: deployment.status, chainId: deployment.chainId,
        version: deployment.config.version, contracts: deployment.contracts.map(c => ({ id: c.id, address: c.address, byteLength: c.byteLength })) };
      if (deployment.status !== 'passed' || deployment.chainId !== 296) throw new Error('Deployment not verified');
      const resolver = deployment.contracts[0].address;
      const request = new ethers.FetchRequest(rpcUrl);
      request.timeout = 10_000;
      request.retryFunc = async () => false;
      request.setThrottleParams({ maxAttempts: 1 });
      request.getUrlFunc = async req => {
        signal.throwIfAborted();
        if (req.url !== rpcUrl || req.method !== 'POST' || req.credentials) throw new Error('Forbidden transport');
        const rpc = JSON.parse(new TextDecoder().decode(req.body));
        const tx = rpc.params?.[0];
        if (rpc.method !== 'eth_call' || rpc.params.length !== 2 || rpc.params[1] !== 'latest'
          || tx.to?.toLowerCase() !== resolver.toLowerCase() || tx.data !== calldata
          || Object.keys(tx).sort().join(',') !== 'data,to') throw new Error('Forbidden RPC');
        state.fetches++;
        try {
          const response = await fetch(rpcUrl, { method: 'POST', body: req.body,
            headers: { 'content-type': 'application/json' }, signal,
            credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer' });
          const body = new Uint8Array(await response.arrayBuffer());
          signal.throwIfAborted();
          return { statusCode: response.status, statusMessage: response.statusText,
            headers: Object.fromEntries(response.headers), body };
        } catch (error) {
          if (signal.aborted) state.aborted++;
          throw error;
        } finally { state.settled++; }
      };
      // The RPC chain was actually checked above; do not bootstrap/retry network discovery.
      provider = new ethers.JsonRpcProvider(request, 296, { staticNetwork: true, batchMaxCount: 1, cacheTimeout: -1 });
      provider.disableCcipRead = true;
      await sdk.Network.setNetwork(new sdk.SetNetworkRequest({ environment: 'testnet',
        mirrorNode: { baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/' },
        rpcNode: { baseUrl: rpcUrl, queryProvider: provider },
      }));
      signal.throwIfAborted();
      update('sdk'); state.sdkCalls++;
      const result = await sdk.Management.resolveLatestConfigVersion(new sdk.ResolveLatestConfigVersionRequest({
        resolverAddress: resolver, configurationId: equityConfigId,
      }));
      signal.throwIfAborted();
      const payload = safePayload(result.payload);
      if (attempt === epoch) { state.payload = payload; update('passed'); }
    } catch {
      if (attempt === epoch) update(deadline.aborted ? 'timed-out' : 'failed');
    } finally {
      controller.abort();
      if (provider) { provider.destroy(); state.destroyed++; }
      state.elapsedMs = Math.round(performance.now() - started);
      if (active === controller) active = undefined;
      check.disabled = false; cancel.disabled = true;
    }
  };
}

assert.ok(process.argv[2] && process.argv[3], 'Supply external Playwright and a new output path');
assert.equal(patchAtsReadonly(undefined, true).changed, 0);
const require = createRequire(process.argv[2]);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const hash = value => createHash('sha256').update(value).digest('hex');
const read = path => JSON.parse(readFileSync(join(root, path)));
const lock = read('package-lock.json');
const lockKeys = Object.keys(lock.packages).filter(Boolean).sort((a, b) => b.length - a.length);
const scratch = mkdtempSync(join(tmpdir(), 'holdbook-sdk017-'));
const rpcUrl = 'https://testnet.hashio.io/api', mirror = 'https://testnet.mirrornode.hedera.com/api/v1/contracts/';
const ids = ['0.0.9212226', '0.0.9213391'];
const addresses = ['0xba2d5fc2083a0b8f164c50e65d782087fba18e0a', '0xd1f118a40f3b02883d35909ef2517e7edd78379d'];
const configId = '0x' + '0'.repeat(63) + '1', encoded = n => '0x' + BigInt(n).toString(16).padStart(64, '0');
const artifact = read('node_modules/@hashgraph/asset-tokenization-contracts/artifacts/contracts/infrastructure/diamond/DiamondCutManager.sol/DiamondCutManager.json');
const calldata = encodeFunctionData({ abi: artifact.abi, functionName: 'getLatestVersionByConfiguration', args: [configId] });
const offchain = encodeErrorResult({ abi: [{ type: 'error', name: 'OffchainLookup',
  inputs: ['address', 'string[]', 'bytes', 'bytes4', 'bytes'].map(type => ({ type })) }],
  errorName: 'OffchainLookup', args: [addresses[0], ['https://offchain.invalid/{data}'], '0x', '0x00000000', '0x'] });
const probeSource = "import './styles.css';\nimport { checkDeployment, equityConfigId } from './deployment';\n("
  + browserProbe.toString() + ')(' + JSON.stringify(rpcUrl) + ', ' + JSON.stringify(calldata) + ');\n';
const record = { schemaVersion: 1, date: new Date().toISOString(),
  based_on_commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  lockSha256: hash(readFileSync(join(root, 'package-lock.json'))), node: process.version,
  playwright: require('playwright/package.json').version, kind: 'isolated-local-sdk-readonly-patch',
  patch: patches.map(({ path, originalSha256, patchedSha256 }) => ({ path, originalSha256, patchedSha256 })),
  sourceHashes: Object.fromEntries(['scripts/patch-ats-readonly.mjs', 'tests/ats.test.mjs', 'docs/evidence/017-sdk-readonly-trial.mjs', 'src/deployment.ts'].map(path => [path, hash(readFileSync(join(root, path)))])),
  candidateSource: probeSource, results: [], bundle: { packages: [], assets: [], generatedSources: [] },
  note: 'Actual patched public SDK and owned ethers provider. Controlled HTTP responses except live cases. body-timeout uses a synthetic Response stream; late uses a transport ignoring abort. No wallet, VC or mutation; app integration not included.' };
let dev, production, browser;
try {
  mkdirSync(join(scratch, 'src/compat'), { recursive: true });
  for (const path of ['package.json', 'package-lock.json', 'vite.config.ts', 'src/styles.css', 'src/deployment.ts', 'src/compat/dotenv.ts', 'src/compat/winston.ts']) copyFileSync(join(root, path), join(scratch, path));
  symlinkSync(join(root, 'node_modules'), join(scratch, 'node_modules'), 'dir');
  writeFileSync(join(scratch, 'src/probe.js'), probeSource);
  writeFileSync(join(scratch, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ATS read-only trial</title></head><body><main><h1>ATS read-only trial</h1><p>Isolated config read. No wallet.</p><p id="status" role="status" aria-live="polite">idle</p><div class="actions"><button id="prepare">Prepare SDK</button><button id="check" disabled>Check SDK config</button><button id="cancel" disabled>Cancel</button></div></main><script type="module" src="/src/probe.js"></script></body></html>');
  const built = await build({ root: scratch, logLevel: 'silent' });
  const packages = new Map(), generated = new Map();
  for (const item of built.output) {
    const content = item.type === 'chunk' ? item.code : item.source;
    assert.equal(hash(content), hash(readFileSync(join(scratch, 'dist', item.fileName))));
    record.bundle.assets.push({ path: item.fileName, bytes: Buffer.byteLength(content), sha256: hash(content) });
    if (item.type !== 'chunk') continue;
    for (const [id, info] of Object.entries(item.modules)) {
      if (!info.renderedLength || !id.includes('/node_modules/')) continue;
      const local = id.slice(id.indexOf('/node_modules/') + 1).split('?')[0];
      const owner = lockKeys.find(key => local.startsWith(key + '/'));
      assert.ok(owner, 'Every rendered dependency has an owning lock record');
      const entry = packages.get(owner) ?? { path: owner, version: lock.packages[owner].version, license: lock.packages[owner].license, modules: 0, renderedBytes: 0 };
      entry.modules++; entry.renderedBytes += info.renderedLength; packages.set(owner, entry);
      if (/node_modules\/@(?:hashgraph|hiero-ledger)\/proto\/(?:lib|src)\/proto.js$/.test(local)) generated.set(local, { path: local, sha256: hash(readFileSync(id.split('?')[0])) });
    }
  }
  record.bundle.packages = [...packages.values()].sort((a, b) => a.path.localeCompare(b.path));
  record.bundle.generatedSources = [...generated.values()];
  dev = await createServer({ root: scratch, logLevel: 'silent', server: { host: '127.0.0.1', port: 5185, strictPort: true } });
  await dev.listen();
  production = await preview({ root: scratch, logLevel: 'silent', preview: { host: '127.0.0.1', port: 4185, strictPort: true } });
  browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
  record.browser = browser.version();
  const allScenarios = ['success', 'wrong-chain', 'bad-address', 'missing-code',
    'zero', 'unsafe', 'malformed', 'rpc-error', '429', 'network-error', 'redirect', 'offchain', 'timeout', 'shared-timeout', 'body-timeout', 'cancel', 'invalidate', 'late', 'reload-pending', 'retry'];
  const selected = process.argv.find(arg => arg.startsWith('--cases='))?.slice(8).split(',');
  const scenarios = selected ?? (process.argv.includes('--smoke') ? ['success'] : allScenarios);
  assert.ok(scenarios.length && scenarios.every(value => allScenarios.includes(value)));
  record.coverage = selected ? 'selected' : process.argv.includes('--smoke') ? 'smoke' : 'full';
  for (const [server, port] of [['dev', 5185], ['preview', 4185]]) {
    for (const size of ['desktop', 'mobile']) for (const scenario of [...scenarios, ...(process.argv.includes('--live') ? ['live'] : [])]) {
      record.currentCase = { server, size, scenario };
      const viewport = size === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 1000 };
      const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
      const page = await context.newPage(), requests = [], forbidden = [], pendingRoutes = [];
      let pageErrors = 0, rpcCalls = 0, requestFailures = 0;
      const origin = 'http://127.0.0.1:' + port;
      page.on('pageerror', () => pageErrors++);
      page.on('requestfailed', request => { if (request.url() === rpcUrl) requestFailures++; });
      await context.addInitScript(({ scenario, rpcUrl }) => {
        window.walletAccesses = 0;
        Object.defineProperty(window, 'ethereum', { get() { window.walletAccesses++; throw new Error('Wallet forbidden'); } });
        if (!['body-timeout', 'late'].includes(scenario)) return;
        const original = window.fetch;
        let calls = 0;
        window.syntheticBodyStarted = false;
        window.fetch = async (input, init) => {
          const sdkRead = String(input) === rpcUrl && init?.body && JSON.parse(new TextDecoder().decode(
            typeof init.body === 'string' ? new TextEncoder().encode(init.body) : init.body)).method === 'eth_call' && ++calls === 2;
          if (sdkRead && scenario === 'late') return original(input, { ...init, signal: undefined });
          const response = await original(input, init);
          if (!sdkRead) return response;
          window.syntheticBodyStarted = true;
          return new Response(new ReadableStream({ start(controller) {
            const abort = () => controller.error(init.signal.reason);
            if (init.signal.aborted) abort(); else init.signal.addEventListener('abort', abort, { once: true });
          } }), { status: 200, headers: { 'content-type': 'application/json' } });
        };
      }, { scenario, rpcUrl });
      await context.routeWebSocket('**/*', socket => {
        if (new URL(socket.url()).origin === 'ws://127.0.0.1:' + port) socket.connectToServer();
        else { forbidden.push(new URL(socket.url()).origin); socket.close(); }
      });
      await context.route('**/*', async route => {
        const request = route.request(), url = request.url();
        if (new URL(url).origin === origin) return route.continue();
        if (url !== rpcUrl && !ids.some(id => url === mirror + id)) { forbidden.push(new URL(url).origin); return route.abort(); }
        if (url !== rpcUrl) {
          assert.equal(request.method(), 'GET');
          const index = ids.indexOf(url.slice(mirror.length));
          requests.push({ method: 'GET', contractId: ids[index] });
          if (scenario === 'live') return route.continue();
          return route.fulfill({ json: { contract_id: ids[index], evm_address: scenario === 'bad-address' && index === 0 ? 'invalid' : addresses[index], deleted: false } });
        }
        const rpc = request.postDataJSON();
        assert.ok(!Array.isArray(rpc) && ['eth_chainId', 'eth_getCode', 'eth_call'].includes(rpc.method));
        if (rpc.method === 'eth_call') {
          assert.deepEqual(rpc.params, [{ data: calldata, to: addresses[0] }, 'latest']);
          rpcCalls++;
        }
        if (rpc.method === 'eth_getCode') assert.ok(addresses.includes(rpc.params[0].toLowerCase()));
        const sdkRead = rpc.method === 'eth_call' && rpcCalls % 2 === 0;
        requests.push({ method: rpc.method, sdkRead });
        if (scenario === 'live') return route.continue();
        if (scenario === 'shared-timeout' && rpc.method === 'eth_chainId') await new Promise(resolve => setTimeout(resolve, 2500));
        if (sdkRead) {
          if (['timeout', 'shared-timeout', 'cancel', 'invalidate', 'late', 'reload-pending'].includes(scenario)) { pendingRoutes.push({ route, id: rpc.id }); return; }
          if (scenario === '429') return route.fulfill({ status: 429, headers: { 'retry-after': '0' }, body: 'Throttled' });
          if (scenario === 'network-error') return route.abort();
          if (scenario === 'redirect') return route.fulfill({ status: 302, headers: { location: 'https://offchain.invalid/redirect' } });
          if (scenario === 'rpc-error' || scenario === 'offchain' || (scenario === 'retry' && rpcCalls === 2)) return route.fulfill({
            json: { jsonrpc: '2.0', id: rpc.id, error: { code: 3, message: 'Synthetic rejection', ...(scenario === 'offchain' ? { data: offchain } : {}) } } });
        }
        const result = rpc.method === 'eth_chainId' ? (scenario === 'wrong-chain' ? '0x1' : '0x128')
          : rpc.method === 'eth_getCode' ? (scenario === 'missing-code' ? '0x' : '0x6000')
          : sdkRead && scenario === 'malformed' ? '0x1234' : encoded(sdkRead && scenario === 'zero' ? 0 : sdkRead && scenario === 'unsafe' ? 9007199254740992n : 1);
        return route.fulfill({ json: { jsonrpc: '2.0', id: rpc.id, result } });
      });
      try {
        await page.goto(origin, { waitUntil: 'networkidle' });
        assert.equal(requests.length, 0);
        await page.keyboard.press('Tab');
        assert.equal(await page.locator('#prepare').evaluate(el => document.activeElement === el), true);
        assert.notEqual(await page.locator('#prepare').evaluate(el => getComputedStyle(el).outlineStyle), 'none');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.locator('#prepare').click();
        await page.waitForFunction(() => ['ready', 'preparation-failed'].includes(window.probe.phase), null, { timeout: 60000 });
        assert.equal(await page.locator('#status').textContent(), 'ready', 'Public SDK preparation succeeds');
        assert.equal(requests.length, 0, 'Import and invalid request validation perform no RPC');
        assert.equal(await page.evaluate(() => {
          for (const value of [0, -1, 1.5, NaN, Infinity, '1', undefined, 9007199254740992]) {
            try { window.safePayload(value); return false; } catch {}
          }
          return window.safePayload(1) === 1 && window.safePayload(Number.MAX_SAFE_INTEGER) === Number.MAX_SAFE_INTEGER;
        }), true);
        await page.locator('#check').evaluate(el => { el.click(); window.runCheck(); window.runCheck(); });
        if (['cancel', 'invalidate', 'late', 'reload-pending'].includes(scenario)) {
          await page.waitForFunction(() => window.probe.fetches === 1);
          while (!pendingRoutes.length) await new Promise(resolve => setTimeout(resolve, 10));
          if (scenario === 'reload-pending') {
            await page.reload({ waitUntil: 'domcontentloaded' });
            assert.equal(await page.locator('#status').textContent(), 'idle');
          } else {
            if (scenario === 'invalidate') await page.evaluate(() => window.dispatchEvent(new Event('holdbook:invalidate')));
            else await page.locator('#cancel').click();
            if (scenario === 'late') {
              const { route, id } = pendingRoutes.shift();
              await route.fulfill({ json: { jsonrpc: '2.0', id, result: encoded(1) } });
            }
          }
        }
        if (scenario !== 'reload-pending') {
          await page.waitForFunction(() => !document.querySelector('#check').disabled, null, { timeout: 15000 });
          const expected = ['success', 'live'].includes(scenario) ? 'passed' : ['cancel', 'invalidate', 'late'].includes(scenario) ? 'cancelled'
            : ['timeout', 'shared-timeout', 'body-timeout'].includes(scenario) ? 'timed-out' : 'failed';
          if (scenario === 'live') assert.match(await page.locator('#status').textContent(), /^SDK config version [1-9][0-9]*$/);
          else assert.equal(await page.locator('#status').textContent(), expected === 'passed' ? 'SDK config version 1' : expected);
        }
        const requestCount = requests.length;
        await page.waitForTimeout(1200);
        assert.equal(requests.length, requestCount, 'No automatic retry after settle/cancel/reload');
        if (scenario === 'retry') {
          await page.locator('#check').click();
          await page.waitForFunction(() => !document.querySelector('#check').disabled);
          assert.equal(await page.locator('#status').textContent(), 'SDK config version 1');
          assert.equal(requests.length, 14);
        }
        const state = await page.evaluate(() => ({ ...window.probe }));
        if (scenario !== 'reload-pending') {
          assert.equal(state.attempts, scenario === 'retry' ? 2 : 1);
          assert.ok(state.ignored >= 2);
          assert.equal(state.fetches, state.settled);
          assert.equal(state.destroyed, state.sdkCalls);
          if (scenario === 'live') assert.ok(Number.isSafeInteger(state.payload) && state.payload >= 1);
          else if (['success', 'retry'].includes(scenario)) assert.equal(state.payload, 1);
          else assert.equal(state.payload, undefined);
          if (['timeout', 'shared-timeout', 'body-timeout'].includes(scenario)) { assert.ok(state.elapsedMs >= 9800 && state.elapsedMs < 12000); assert.equal(state.aborted, 1); }
          if (scenario === 'body-timeout') assert.equal(await page.evaluate(() => window.syntheticBodyStarted), true);
          if (!['wrong-chain', 'bad-address', 'missing-code'].includes(scenario)) assert.equal(state.fetches, scenario === 'retry' ? 2 : 1);
          else assert.equal(state.sdkCalls, 0);
        }
        if (['timeout', 'shared-timeout', 'cancel', 'invalidate', 'reload-pending'].includes(scenario)) assert.ok(requestFailures >= 1, 'Native request aborted');
        const walletAccesses = await page.evaluate(() => window.walletAccesses);
        assert.equal(walletAccesses, 0); assert.deepEqual(forbidden, []); assert.equal(pageErrors, 0);
        await page.reload({ waitUntil: 'networkidle' });
        assert.equal(await page.locator('#status').textContent(), 'idle');
        const item = { server, size, scenario, source: scenario === 'live' ? 'live Testnet SDK and viem reads' : 'controlled transport; actual SDK',
          state, requests, requestFailures, walletAccesses, forbidden, pageErrors, keyboardAndOverflow: 'passed', reload: 'idle' };
        record.results.push(item);
        console.log(JSON.stringify({ server, size, scenario, phase: state.phase, sdkPayload: state.payload, requests: requests.length }));
      } finally {
        await context.close();
      }
    }
  }
  delete record.currentCase;
  record.integrationGate = 'passed';
} catch (error) {
  record.integrationGate = 'failed';
  // Assertions concern only this synthetic/public diagnostic; do not export SDK errors.
  console.error(error instanceof assert.AssertionError ? error.message : 'Diagnostic failed; inspect locally.');
  throw error;
} finally {
  await browser?.close(); await dev?.close();
  if (production) await new Promise(resolve => production.httpServer.close(resolve));
  rmSync(scratch, { recursive: true, force: true });
  writeFileSync(process.argv[3], JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
}

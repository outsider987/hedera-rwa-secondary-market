// Main-app ATS SDK config acceptance. Actual public SDK; controlled transport unless --live.
// node this-file /external/playwright/package.json NEW-result.json [--live] [--smoke | --cases=cancel,late]
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, symlinkSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, createServer, preview } from 'vite';
import { encodeFunctionData, encodeErrorResult } from 'viem';
import { patches, patchAtsReadonly } from '../../scripts/patch-ats-readonly.mjs';

assert.ok(process.argv[2] && process.argv[3], 'Supply external Playwright and a new output path');
assert.equal(patchAtsReadonly(undefined, true).changed, 0);
const require = createRequire(process.argv[2]);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const hash = value => createHash('sha256').update(value).digest('hex');
const read = path => JSON.parse(readFileSync(join(root, path)));
const lock = read('package-lock.json');
const lockKeys = Object.keys(lock.packages).filter(Boolean).sort((a, b) => b.length - a.length);
const scratch = mkdtempSync(join(tmpdir(), 'holdbook-sdk018-'));
const rpcUrl = 'https://testnet.hashio.io/api', mirror = 'https://testnet.mirrornode.hedera.com/api/v1/contracts/';
const ids = ['0.0.9212226', '0.0.9213391'];
const addresses = ['0xba2d5fc2083a0b8f164c50e65d782087fba18e0a', '0xd1f118a40f3b02883d35909ef2517e7edd78379d'];
const configId = '0x' + '0'.repeat(63) + '1', encoded = n => '0x' + BigInt(n).toString(16).padStart(64, '0');
const artifact = read('node_modules/@hashgraph/asset-tokenization-contracts/artifacts/contracts/infrastructure/diamond/DiamondCutManager.sol/DiamondCutManager.json');
const calldata = encodeFunctionData({ abi: artifact.abi, functionName: 'getLatestVersionByConfiguration', args: [configId] });
const offchain = encodeErrorResult({ abi: [{ type: 'error', name: 'OffchainLookup',
  inputs: ['address', 'string[]', 'bytes', 'bytes4', 'bytes'].map(type => ({ type })) }],
  errorName: 'OffchainLookup', args: [addresses[0], ['https://offchain.invalid/{data}'], '0x', '0x00000000', '0x'] });
const record = { schemaVersion: 1, date: new Date().toISOString(),
  based_on_commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  lockSha256: hash(readFileSync(join(root, 'package-lock.json'))), node: process.version,
  playwright: require('playwright/package.json').version, kind: 'main-app-sdk-config-integration',
  patch: patches.map(({ path, originalSha256, patchedSha256 }) => ({ path, originalSha256, patchedSha256 })),
  sourceHashes: Object.fromEntries(['scripts/patch-ats-readonly.mjs', 'tests/ats.test.mjs', 'tests/shell.test.mjs', 'docs/evidence/018-t01b-4-sdk-integration.mjs', 'src/ats.ts', 'src/App.tsx', 'src/deployment.ts', 'src/wallet.ts'].map(path => [path, hash(readFileSync(join(root, path)))])),
  results: [], bundle: { packages: [], assets: [], generatedSources: [] },
  note: 'Actual app, patched public SDK and owned ethers provider. Controlled HTTP responses except live cases. body-timeout uses a synthetic Response stream; late ignores abort. Wallet events use a synthetic EIP-1193 provider. No signature or transaction; no real MetaMask acceptance.' };
let dev, production, browser;
try {
  cpSync(join(root, 'src'), join(scratch, 'src'), { recursive: true });
  for (const path of ['package.json', 'package-lock.json', 'vite.config.ts', 'index.html']) copyFileSync(join(root, path), join(scratch, path));
  symlinkSync(join(root, 'node_modules'), join(scratch, 'node_modules'), 'dir');
  const built = await build({ root: scratch, logLevel: 'silent' });
  const packages = new Map(), generated = new Map();
  const chunks = built.output.filter(item => item.type === 'chunk');
  const initial = new Set();
  function visit(file) { if (initial.has(file)) return; initial.add(file); for (const dependency of chunks.find(c => c.fileName === file)?.imports ?? []) visit(dependency); }
  for (const chunk of chunks.filter(c => c.isEntry)) visit(chunk.fileName);
  assert.ok(chunks.filter(c => initial.has(c.fileName)).every(c => Object.keys(c.modules).every(id => !id.includes('/@hashgraph/asset-tokenization-sdk/') && !id.includes('/@terminal3/') && !/\/@(?:hashgraph|hiero-ledger)\/proto\/|\/protobufjs\//.test(id))));
  record.bundle.initialChunks = [...initial];
  record.bundle.initialJavaScriptBytes = chunks.filter(c => initial.has(c.fileName)).reduce((sum, c) => sum + Buffer.byteLength(c.code), 0);
  record.bundle.sdkAndTerminal3Deferred = true;
  const sdkChunks = chunks.filter(c => Object.keys(c.modules).some(id => id.includes('/@hashgraph/asset-tokenization-sdk/'))).map(c => c.fileName);
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
    'zero', 'unsafe', 'malformed', 'rpc-error', '429', 'network-error', 'redirect', 'offchain', 'timeout', 'shared-timeout', 'body-timeout', 'cancel', 'late', 'reload-pending', 'retry', 'preflight-only', 'factory-failure', 'preflight-zero', 'account-change', 'chain-change', 'disconnect', 'wallet-after-success', 'load-failure', 'recheck'];
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
      let pageErrors = 0, rpcCalls = 0, requestFailures = 0, blockedSdkLoads = 0;
      const origin = 'http://127.0.0.1:' + port;
      page.on('pageerror', () => pageErrors++);
      page.on('requestfailed', request => { if (request.url() === rpcUrl) requestFailures++; });
      await context.addInitScript(({ scenario, rpcUrl }) => {
        window.walletAccesses = 0; window.walletMethods = [];
        const listeners = new Map();
        const provider = {
          isMetaMask: true,
          on(event, callback) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(callback); },
          removeListener(event, callback) { listeners.get(event)?.delete(callback); },
          async request({ method }) {
            window.walletMethods.push(method);
            if (method === 'eth_chainId') return '0x128';
            if (method === 'eth_requestAccounts' || method === 'eth_accounts') return ['0x' + 'c'.repeat(40)];
            throw new Error('Unapproved wallet method');
          },
        };
        window.walletEmit = (event, value) => { for (const cb of listeners.get(event) ?? []) cb(value); };
        Object.defineProperty(window, 'ethereum', { get() { window.walletAccesses++; return provider; } });
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
        if (new URL(url).origin === origin) {
          if (scenario === 'load-failure' && (url.includes('asset-tokenization-sdk') || sdkChunks.some(file => new URL(url).pathname === '/' + file))) {
            blockedSdkLoads++;
            return route.fulfill({ status: 503, contentType: 'text/javascript', body: '' });
          }
          return route.continue();
        }
        if (url.startsWith('https://testnet.mirrornode.hedera.com/api/v1/accounts/') && /^https:\/\/testnet\.mirrornode\.hedera\.com\/api\/v1\/accounts\/0x[cde]{40}\?limit=1$/.test(url)) {
          const evm = url.split('/accounts/')[1].split('?')[0];
          return route.fulfill({ json: { account: '0.0.' + ({ c: 123, d: 124, e: 125 }[evm[2]]), evm_address: evm, deleted: false } });
        }
        if (url !== rpcUrl && !ids.some(id => url === mirror + id)) { forbidden.push(new URL(url).origin); return route.abort(); }
        if (url !== rpcUrl) {
          assert.equal(request.method(), 'GET');
          const index = ids.indexOf(url.slice(mirror.length));
          requests.push({ method: 'GET', contractId: ids[index] });
          if (scenario === 'live') return route.continue();
          return route.fulfill({ json: { contract_id: ids[index], evm_address: scenario === 'bad-address' && index === 0 ? 'invalid' : addresses[index], deleted: scenario === 'factory-failure' && index === 1 } });
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
          if (scenario === 'recheck' && rpcCalls === 4) { pendingRoutes.push({ route, id: rpc.id }); return; }
          if (['timeout', 'shared-timeout', 'cancel', 'late', 'reload-pending', 'account-change', 'chain-change', 'disconnect'].includes(scenario)) { pendingRoutes.push({ route, id: rpc.id }); return; }
          if (scenario === '429') return route.fulfill({ status: 429, headers: { 'retry-after': '0' }, body: 'Throttled' });
          if (scenario === 'network-error') return route.abort();
          if (scenario === 'redirect') return route.fulfill({ status: 302, headers: { location: 'https://offchain.invalid/redirect' } });
          if (scenario === 'rpc-error' || scenario === 'offchain' || (scenario === 'retry' && rpcCalls === 2)) return route.fulfill({
            json: { jsonrpc: '2.0', id: rpc.id, error: { code: 3, message: 'Synthetic rejection', ...(scenario === 'offchain' ? { data: offchain } : {}) } } });
        }
        const result = rpc.method === 'eth_chainId' ? (scenario === 'wrong-chain' ? '0x1' : '0x128')
          : rpc.method === 'eth_getCode' ? (scenario === 'missing-code' ? '0x' : '0x6000')
          : sdkRead && scenario === 'malformed' ? '0x1234' : encoded(scenario === 'preflight-zero' || sdkRead && scenario === 'zero' ? 0 : sdkRead && scenario === 'unsafe' ? 9007199254740992n : 1);
        return route.fulfill({ json: { jsonrpc: '2.0', id: rpc.id, result } });
      });
      try {
        await page.goto(origin, { waitUntil: 'networkidle' });
        const sdkStatus = page.locator('#sdk-status'), payload = page.getByTestId('sdk-payload');
        const sdkButton = () => page.getByRole('button', { name: /^(Check SDK config|Retry SDK config check|Checking SDK config…)$/ });
        const basicButton = () => page.getByRole('button', { name: /^(Check deployment and config|Retry deployment and config check|Checking deployment and config…)$/ });
        assert.equal(requests.length, 0);
        assert.equal(await sdkStatus.textContent(), 'SDK not prepared.');
        assert.equal(await sdkButton().isDisabled(), true);
        await page.keyboard.press('Tab');
        assert.equal(await page.getByRole('link', { name: 'Skip to content' }).evaluate(el => el === document.activeElement), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        const walletScenario = ['account-change', 'chain-change', 'disconnect', 'wallet-after-success'].includes(scenario);
        if (walletScenario) {
          await page.getByRole('button', { name: 'Connect', exact: true }).click();
          await page.waitForFunction(() => document.querySelector('[data-testid="active-account"]').textContent.toLowerCase() === '0x' + 'c'.repeat(40));
        }
        const walletBaseline = await page.evaluate(() => ({ accesses: window.walletAccesses, methods: window.walletMethods.length }));
        let elapsedMs = 0;
        if (scenario === 'preflight-only') {
          await basicButton().click();
          await page.waitForFunction(() => document.querySelector('#deployment-status').textContent.includes('Deployment and config verified.'));
          assert.equal(requests.length, 6);
          assert.equal(await payload.textContent(), 'Not checked');
          assert.equal(await sdkStatus.textContent(), 'SDK not prepared.');
        } else {
          const prepare = page.getByRole('button', { name: 'Prepare ATS SDK', exact: true });
          await page.keyboard.press('Tab');
          await prepare.focus();
          assert.notEqual(await prepare.evaluate(el => getComputedStyle(el).outlineStyle), 'none');
          await page.keyboard.press('Enter');
          await page.waitForFunction(() => /SDK prepared\.|SDK preparation failed/.test(document.querySelector('#sdk-status').textContent), null, { timeout: 60000 });
          if (scenario === 'load-failure') {
            assert.match(await sdkStatus.textContent(), /SDK preparation failed/);
            assert.ok(blockedSdkLoads >= 1);
            assert.equal(requests.length, 0); assert.equal(await sdkButton().isDisabled(), true);
            assert.equal(await payload.textContent(), 'Not checked');
            const attempts = blockedSdkLoads;
            await page.waitForTimeout(1200); assert.equal(blockedSdkLoads, attempts, 'No automatic load retry');
            assert.equal(pageErrors, 0); assert.deepEqual(forbidden, []);
            assert.deepEqual(await page.evaluate(() => ({ accesses: window.walletAccesses, methods: window.walletMethods.length })), walletBaseline);
            await page.reload({ waitUntil: 'networkidle' });
            assert.equal(await sdkStatus.textContent(), 'SDK not prepared.');
            record.results.push({ server, size, scenario, source: 'controlled chunk failure; actual app', blockedSdkLoads, requests, pageErrors, forbidden, reload: 'manual preparation required' });
            console.log(JSON.stringify({ server, size, scenario, status: 'passed' }));
            continue;
          }
          assert.equal(await sdkStatus.textContent(), 'SDK prepared. Config has not been checked.');
          assert.equal(requests.length, 0, 'Preparation makes no public request');
          assert.deepEqual(await page.evaluate(() => ({ accesses: window.walletAccesses, methods: window.walletMethods.length })), walletBaseline, 'SDK preparation never accesses the wallet');
          const began = Date.now();
          await sdkButton().evaluate(el => { el.click(); el.click(); el.click(); });
          if (['cancel', 'late', 'reload-pending', 'account-change', 'chain-change', 'disconnect'].includes(scenario)) {
            await page.waitForFunction(() => document.querySelector('#sdk-status').textContent.includes('Checking deployment and SDK config'));
            for (let wait = 0; !pendingRoutes.length && wait < 1500; wait++) await new Promise(resolve => setTimeout(resolve, 10));
            assert.ok(pendingRoutes.length, 'Expected a pending SDK transport');
            assert.equal(await basicButton().isDisabled(), true);
            if (scenario === 'reload-pending') {
              await page.reload({ waitUntil: 'networkidle' });
            } else {
              if (walletScenario) {
                await page.evaluate(scenario => window.walletEmit(scenario === 'account-change' ? 'accountsChanged' : scenario === 'chain-change' ? 'chainChanged' : 'disconnect',
                  scenario === 'account-change' ? ['0x' + 'd'.repeat(40)] : scenario === 'chain-change' ? '0x1' : { code: 4900 }), scenario);
              } else {
                await page.getByRole('button', { name: 'Cancel SDK check' }).click();
              }
              if (scenario === 'late') {
                assert.equal(await sdkButton().isDisabled(), true, 'Serialize until the deliberately late transport settles');
                const { route, id } = pendingRoutes.shift();
                await route.fulfill({ json: { jsonrpc: '2.0', id, result: encoded(1) } });
              }
            }
          }
          if (scenario !== 'reload-pending') {
            await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(el => /^(Check SDK config|Retry SDK config check|Checking SDK config…)$/.test(el.textContent.trim())).disabled, null, { timeout: 15000 });
            elapsedMs = Date.now() - began;
            const status = await sdkStatus.textContent();
            if (['success', 'live', 'wallet-after-success', 'recheck'].includes(scenario)) {
              assert.equal(status, 'SDK config verified.');
              assert.ok(Number.isSafeInteger(Number(await payload.textContent())) && Number(await payload.textContent()) >= 1);
            } else if (['timeout', 'shared-timeout', 'body-timeout'].includes(scenario)) {
              assert.match(status, /timed out after 10 seconds/);
              assert.ok(elapsedMs >= 9800 && elapsedMs < 12500);
              if (scenario === 'body-timeout') assert.equal(await page.evaluate(() => window.syntheticBodyStarted), true);
            } else if (walletScenario) assert.match(status, /Wallet changed/);
            else if (['cancel', 'late'].includes(scenario)) assert.match(status, /cancelled/);
            else assert.match(status, /invalid config version|could not complete|SDK check not run/);
            if (!['success', 'live', 'wallet-after-success', 'recheck'].includes(scenario)) assert.equal(await payload.textContent(), 'Not checked');
          }
          const before = requests.length;
          await page.evaluate(() => { window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('online')); document.dispatchEvent(new Event('visibilitychange')); });
          await page.waitForTimeout(1200);
          assert.equal(requests.length, before, 'No automatic retry or refresh');
          if (scenario === 'retry') {
            await sdkButton().click();
            await page.waitForFunction(() => document.querySelector('#sdk-status').textContent === 'SDK config verified.');
            assert.equal(requests.length, 14);
          }
          if (scenario === 'recheck') {
            await sdkButton().click();
            assert.equal(await payload.textContent(), 'Not checked');
            assert.equal(await page.getByTestId('config-version').textContent(), 'Not checked');
            for (let wait = 0; !pendingRoutes.length && wait < 1500; wait++) await new Promise(resolve => setTimeout(resolve, 10));
            assert.ok(pendingRoutes.length);
            const { route, id } = pendingRoutes.shift();
            await route.fulfill({ json: { jsonrpc: '2.0', id, error: { code: 3, message: 'Synthetic rejection' } } });
            await page.waitForFunction(() => document.querySelector('#sdk-status').textContent.includes('could not complete'));
            assert.equal(await payload.textContent(), 'Not checked');
            assert.equal(requests.length, 14);
          }
          if (scenario === 'wallet-after-success') {
            await page.evaluate(() => window.walletEmit('accountsChanged', ['0x' + 'd'.repeat(40)]));
            await page.waitForFunction(() => document.querySelector('#sdk-status').textContent.includes('Wallet changed'));
            assert.equal(await payload.textContent(), 'Not checked');
            assert.equal(await page.getByTestId('config-version').textContent(), 'Not checked');
            assert.equal(requests.length, 7);
          }
          if (scenario === 'chain-change') {
            await page.evaluate(() => window.walletEmit('chainChanged', '0x128'));
            await page.waitForTimeout(100);
            assert.equal(await payload.textContent(), 'Not checked');
            assert.equal(requests.length, 7);
          }
          if (scenario === 'factory-failure') {
            assert.equal(await page.getByTestId('config-version').textContent(), '1');
            assert.equal(requests.filter(r => r.sdkRead).length, 0);
          }
          if (['wrong-chain', 'bad-address', 'missing-code', 'preflight-zero'].includes(scenario)) assert.equal(requests.filter(r => r.sdkRead).length, 0);
          else if (scenario !== 'factory-failure') assert.equal(requests.filter(r => r.sdkRead).length, ['retry', 'recheck'].includes(scenario) ? 2 : 1);
        }
        if (['timeout', 'shared-timeout', 'cancel', 'reload-pending', 'account-change', 'chain-change', 'disconnect'].includes(scenario)) assert.ok(requestFailures >= 1, 'Native pending SDK request aborted');
        const wallet = await page.evaluate(() => ({ accesses: window.walletAccesses, methods: window.walletMethods }));
        assert.ok(wallet.methods.every(m => ['eth_requestAccounts', 'eth_accounts', 'eth_chainId'].includes(m)));
        if (!walletScenario && scenario !== 'reload-pending') assert.equal(wallet.accesses, walletBaseline.accesses, 'SDK read never accesses wallet');
        if (!walletScenario) assert.deepEqual(wallet.methods, []);
        assert.deepEqual(forbidden, []); assert.equal(pageErrors, 0);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        const state = { sdkStatus: await sdkStatus.textContent(), sdkPayload: await payload.textContent(),
          deploymentStatus: await page.locator('#deployment-status').textContent(), configVersion: await page.getByTestId('config-version').textContent(), elapsedMs };
        if (scenario === 'success') {
          mkdirSync(join(root, '.impeccable/review'), { recursive: true });
          await page.screenshot({ path: join(root, '.impeccable/review/t01b4-sdk-' + server + '-' + size + '.png'), fullPage: true });
        }
        const beforeReload = requests.length;
        await page.reload({ waitUntil: 'networkidle' });
        assert.equal(await sdkStatus.textContent(), 'SDK not prepared.');
        assert.equal(await payload.textContent(), 'Not checked');
        assert.equal(requests.length, beforeReload);
        record.results.push({ server, size, scenario, source: scenario === 'live' ? 'live Testnet SDK and viem reads' : 'controlled transport; actual app and SDK',
          state, requests, requestFailures, wallet, forbidden, pageErrors, keyboardAndOverflow: 'passed', reload: 'manual preparation required' });
        console.log(JSON.stringify({ server, size, scenario, ...state, requests: requests.length }));
      } finally { await context.close(); }
    }
  }
  delete record.currentCase;
  record.integrationGate = 'passed';
} catch (error) {
  record.integrationGate = 'failed';
  console.error(error instanceof assert.AssertionError ? error.message : 'Browser check failed; inspect locally.');
  throw error;
} finally {
  await browser?.close(); await dev?.close();
  if (production) await new Promise(resolve => production.httpServer.close(resolve));
  rmSync(scratch, { recursive: true, force: true });
  writeFileSync(process.argv[3], JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
}

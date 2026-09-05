// Real viem HTTP transport; synthetic responses by default, fixed Testnet reads with --live.
// node docs/evidence/010-t01b-3-browser.mjs /absolute/playwright/package.json NEW-output.json [--live]
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const [playwrightPath, output, mode] = process.argv.slice(2);
assert.ok(playwrightPath && output, 'Supply external Playwright and a new evidence path');
const { chromium } = createRequire(playwrightPath)('playwright');
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const { encodeFunctionData, encodeErrorResult } = await import('viem');
const artifact = JSON.parse(await readFile(new URL('../../node_modules/@hashgraph/asset-tokenization-contracts/artifacts/contracts/infrastructure/diamond/DiamondCutManager.sol/DiamondCutManager.json', import.meta.url)));
const calldata = encodeFunctionData({ abi: artifact.abi, functionName: 'getLatestVersionByConfiguration', args: [`0x${'0'.repeat(63)}1`] });
const ids = ['0.0.9212226', '0.0.9213391'];
const addresses = [`0x${'a'.repeat(40)}`, `0x${'b'.repeat(40)}`];
const offchainError = encodeErrorResult({ abi: [{ type: 'error', name: 'OffchainLookup', inputs: ['address', 'string[]', 'bytes', 'bytes4', 'bytes'].map(type => ({ type })) }], errorName: 'OffchainLookup', args: [addresses[0], ['https://offchain.invalid/{data}'], '0x', '0x00000000', '0x'] });
const results = [];
await mkdir('.impeccable/review', { recursive: true });

async function fixture(port, viewport) {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
  const origin = `http://127.0.0.1:${port}`;
  const calls = [], forbidden = [], errors = [], held = [];
  const behavior = { chain: '0x128', code: '0x6000', badFactory: false, hold: false, version: 1n, configError: false, holdConfig: false };
  await context.addInitScript(() => {
    window.deploymentProviderCalls = [];
    // A detected provider must still receive no request from deployment checks.
    window.ethereum = { isMetaMask: true, on() {}, removeListener() {}, request({ method }) {
      window.deploymentProviderCalls.push(method);
      throw new Error('Deployment must not request the wallet');
    } };
  });
  await context.route('**/*', async route => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.origin === origin) return route.continue();
    const rpc = url.href === 'https://testnet.hashio.io/api' && req.method() === 'POST' ? req.postDataJSON() : undefined;
    const index = ids.findIndex(id => url.href === `https://testnet.mirrornode.hedera.com/api/v1/contracts/${id}`);
    if (!(rpc && ['eth_chainId', 'eth_getCode', 'eth_call'].includes(rpc.method)) && !(index >= 0 && req.method() === 'GET')) {
      forbidden.push(`${req.method()} ${url.origin}${url.pathname}`); return route.abort();
    }
    if (rpc?.method === 'eth_getCode') {
      assert.match(rpc.params[0], /^0x[0-9a-f]{40}$/);
      assert.equal(rpc.params[1], 'latest');
      if (mode !== '--live') assert.ok(addresses.includes(rpc.params[0]));
    }
    if (rpc?.method === 'eth_call') {
      assert.equal(rpc.params[0].data, calldata);
      assert.deepEqual(Object.keys(rpc.params[0]).sort(), ['data', 'to']);
      assert.equal(rpc.params[1], 'latest');
      if (mode !== '--live') assert.equal(rpc.params[0].to, addresses[0]);
    }
    calls.push(rpc ? { method: rpc.method, params: rpc.params } : { contractId: ids[index] });
    if (mode === '--live') return route.continue();
    const json = rpc ? { jsonrpc: '2.0', id: rpc.id, result: rpc.method === 'eth_chainId' ? behavior.chain : rpc.method === 'eth_call' ? `0x${behavior.version.toString(16).padStart(64, '0')}` : behavior.code }
      : { contract_id: ids[index], evm_address: addresses[index], deleted: index === 1 && behavior.badFactory };
    if (rpc?.method === 'eth_call' && behavior.configError) { delete json.result; json.error = { code: 3, message: 'Synthetic revert' }; }
    if (rpc?.method === 'eth_call' && behavior.configOffchain) { delete json.result; json.error = { code: 3, message: 'Synthetic offchain lookup', data: offchainError }; }
    const reply = async () => { try { await route.fulfill({ json, headers: { 'access-control-allow-origin': '*' } }); } catch { /* Aborted request. */ } };
    if ((behavior.hold && index >= 0) || (behavior.holdConfig && rpc?.method === 'eth_call')) held.push(reply); else await reply();
  });
  await context.routeWebSocket('**/*', ws => {
    if (new URL(ws.url()).origin === `ws://127.0.0.1:${port}`) ws.connectToServer();
    else { forbidden.push('External WebSocket'); ws.close(); }
  });
  const page = await context.newPage();
  page.on('pageerror', () => errors.push('pageerror'));
  await page.goto(origin, { waitUntil: 'networkidle' });
  const section = page.getByRole('region', { name: 'Testnet deployment' });
  const button = section.getByRole('button');
  const text = value => section.getByText(value, { exact: false }).first().waitFor({ timeout: 15000 });
  const start = () => button.click();
  const finish = async label => {
    assert.deepEqual(forbidden, []);
    assert.deepEqual(errors, []);
    assert.deepEqual(await page.evaluate(() => window.deploymentProviderCalls), []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    results.push({ label, port, viewport, requests: calls, forbiddenRequests: forbidden.length, pageErrors: errors.length, walletRequests: 0 });
    await context.close();
  };
  return { page, context, section, button, text, start, finish, behavior, calls, held };
}

try {
  for (const port of [5173, 4173]) {
    if (mode === '--live') {
      const f = await fixture(port, { width: 1440, height: 1000 });
      await f.text('Not checked');
      assert.equal(f.calls.length, 0);
      await f.start();
      await f.button.waitFor({ state: 'visible' });
      await f.page.waitForFunction(() => !document.querySelector('[aria-labelledby="deployment-heading"] button').disabled, { timeout: 15000 });
      const observation = await f.section.innerText();
      const configVersion = await f.page.getByTestId('config-version').innerText();
      const passed = observation.includes('Deployment and config verified.');
      await f.finish('live fixed Testnet deployment');
      results.at(-1).status = passed ? 'passed' : 'blocked';
      results.at(-1).configVersion = configVersion;
      results.at(-1).observation = observation; // Only the application's whitelisted public result fields.
      continue;
    }
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      const f = await fixture(port, viewport);
      await f.text('Not checked');
      assert.equal(f.calls.length, 0, 'No deployment query on load');
      await f.page.evaluate(() => { delete window.ethereum; });
      await f.button.focus();
      assert.notEqual(await f.button.evaluate(el => getComputedStyle(el).outlineStyle), 'none');
      await f.page.keyboard.press('Enter');
      await f.text('Deployment and config verified.');
      assert.equal(f.calls.length, 6);
      await f.text('On-chain Equity config verified.');
      assert.equal(await f.page.getByTestId('config-version').innerText(), '1');
      await f.text('ATS SDK integration remains unverified.');
      assert.equal(await f.section.getByText('2 bytes', { exact: true }).count(), 2);
      await f.page.screenshot({ path: `.impeccable/review/t01b-3-${port}-${viewport.width}.png`, fullPage: true });
      await f.page.reload({ waitUntil: 'networkidle' });
      await f.text('Not checked');
      assert.equal(f.calls.length, 6, 'Reload does not recheck');
      await f.finish('keyboard, no wallet, presence, layout and reload');
    }
    {
      const f = await fixture(port, { width: 1440, height: 1000 });
      f.behavior.chain = '0x1';
      await f.start();
      await f.text('Wrong RPC network');
      assert.equal(f.calls.length, 1);
      f.behavior.chain = '0x128'; f.behavior.badFactory = true;
      await f.start();
      await f.text('Deployment and config check failed.');
      assert.equal(await f.section.getByText('2 bytes', { exact: true }).count(), 1);
      await f.text('On-chain Equity config verified.');
      f.behavior.badFactory = false; f.behavior.code = '0x';
      await f.start(); await f.text('No runtime bytecode');
      f.behavior.code = '0x6000';
      await f.start(); await f.text('Deployment and config verified.');
      f.behavior.version = 0n;
      await f.start(); await f.text('No registered Equity config version.');
      f.behavior.version = 9007199254740992n;
      await f.start(); await f.text('Config version exceeds the safe SDK integer range.');
      f.behavior.version = 1n; f.behavior.configError = true;
      await f.start(); await f.text('Config lookup could not complete.');
      f.behavior.configError = false; f.behavior.configOffchain = true;
      await f.start(); await f.text('Config lookup could not complete.');
      f.behavior.configOffchain = false;
      await f.start(); await f.text('Deployment and config verified.');
      await f.page.evaluate(() => { AbortSignal.timeout = () => { throw new Error('Synthetic browser API failure'); }; });
      await f.start(); await f.text('Deployment and config check could not complete.');
      assert.equal(await f.section.getByText('2 bytes', { exact: true }).count(), 0, 'Unexpected query errors must not restore old verified records');
      assert.equal(await f.page.getByTestId('config-version').innerText(), 'Not checked');
      await f.finish('wrong chain, independent config/Factory outcomes, zero/unsafe versions, revert, manual retry and unexpected query error');
    }
    {
      const f = await fixture(port, { width: 1440, height: 1000 });
      await f.start(); await f.text('Deployment and config verified.');
      f.behavior.holdConfig = true;
      await f.button.evaluate(el => { el.click(); el.click(); });
      await f.text('Checking deployment and config');
      assert.equal(await f.page.getByTestId('config-version').innerText(), 'Not checked');
      assert.equal(await f.section.getByText('Deployment and config verified.', { exact: true }).count(), 0);
      await f.page.waitForFunction(() => document.querySelector('[aria-labelledby="deployment-heading"] button').disabled);
      await f.text('timed out');
      assert.equal(f.calls.length, 12, 'Duplicate click must not create a second attempt or retry');
      f.behavior.holdConfig = false;
      await f.start(); await f.text('Deployment and config verified.');
      await Promise.all(f.held.splice(0).map(reply => reply()));
      await f.page.evaluate(() => {
        window.dispatchEvent(new Event('focus'));
        window.dispatchEvent(new Event('online'));
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await f.page.waitForTimeout(100);
      await f.text('Deployment and config verified.');
      assert.equal(f.calls.length, 18, 'No late-response requests or automatic refresh');
      f.behavior.holdConfig = true;
      await f.start(); await f.text('Checking deployment and config');
      await f.page.waitForTimeout(100);
      const beforeReload = f.calls.length;
      await f.page.reload({ waitUntil: 'networkidle' });
      await Promise.all(f.held.splice(0).map(reply => reply()));
      await f.text('Not checked');
      assert.equal(f.calls.length, beforeReload);
      await f.finish('same-tick guard, deadline, late responses, no background refresh and reload cancellation');
    }
  }
} catch (error) {
  results.push({ status: 'failed', assertion: error.message });
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(output, `${JSON.stringify({ mode: mode === '--live' ? 'live public reads' : 'synthetic HTTP / real viem', results }, null, 2)}\n`, { flag: 'wx' });
  console.log(JSON.stringify({ cases: results.length, failed: results.filter(r => r.status === 'failed').length, blocked: results.filter(r => r.status === 'blocked').length }));
}

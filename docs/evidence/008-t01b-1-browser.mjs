// Real wagmi + synthetic EIP-1193 provider / Mirror replies. No wallet profile.
// With dev and preview running after build:
// node docs/evidence/008-t01b-1-browser.mjs /absolute/path/to/playwright/package.json NEW-output.json
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

assert.ok(process.argv[2] && process.argv[3], 'Supply external Playwright and a new evidence path');
const require = createRequire(process.argv[2]);
const { chromium } = require('playwright');
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const A = `0x${'a'.repeat(40)}`, B = `0x${'b'.repeat(40)}`, C = `0x${'c'.repeat(40)}`;
const key = 'holdbook.testnet.roles.v1';
const results = [];
await mkdir('.impeccable/review', { recursive: true });

async function fixture(port, viewport, options = {}) {
  const origin = `http://127.0.0.1:${port}`;
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
  const external = [], requests = [], errors = [], consoleErrors = [], held = [];
  const behavior = { hold: false, invalid: false, sameId: false };
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === origin) return route.continue();
    if (url.origin !== 'https://testnet.mirrornode.hedera.com'
      || !/^\/api\/v1\/accounts\/0x[\da-f]{40}$/.test(url.pathname)
      || url.search !== '?limit=1' || route.request().method() !== 'GET') {
      external.push(url.origin); return route.abort();
    }
    const address = url.pathname.split('/').at(-1);
    assert.ok([A, B, C].includes(address), 'Only synthetic public addresses');
    requests.push(address);
    const data = { evm_address: address, account: behavior.sameId ? '0.0.101' : `0.0.${[A, B, C].indexOf(address) + 101}`, deleted: behavior.invalid };
    const reply = async () => {
      try { await route.fulfill({ json: data, headers: { 'access-control-allow-origin': '*' } }); } catch { /* Cancelled browser request. */ }
    };
    if (behavior.hold) held.push(reply);
    else await reply();
  });
  await context.routeWebSocket('**/*', ws => {
    if (new URL(ws.url()).origin === `ws://127.0.0.1:${port}`) ws.connectToServer();
    else { external.push(new URL(ws.url()).origin); ws.close(); }
  });
  await context.addInitScript(({ A, key, options }) => {
    const listeners = new Map();
    const mock = window.holdbookMock = {
      accounts: [A], chainId: '0x128', calls: [], mode: 'accept', release: null,
      emit(event, value) { for (const fn of listeners.get(event) || []) fn(value); },
      account(address) { this.accounts = address ? [address] : []; this.emit('accountsChanged', this.accounts); },
      chain(value) { this.chainId = value; this.emit('chainChanged', value); },
    };
    if (options.seed) localStorage.setItem(key, JSON.stringify(options.seed));
    if (options.storage === 'read') Object.defineProperty(window, 'localStorage', { get() { throw new Error('Synthetic denial'); } });
    if (options.storage === 'write') Storage.prototype.setItem = () => { throw new Error('Synthetic quota failure'); };
    if (options.missing) return;
    window.ethereum = {
      isMetaMask: true,
      on(event, fn) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(fn); },
      removeListener(event, fn) { listeners.get(event)?.delete(fn); },
      async request({ method }) {
        mock.calls.push(method);
        if (method === 'eth_requestAccounts') {
          if (mock.mode === 'reject') throw Object.assign(new Error('Synthetic rejection'), { code: 4001 });
          if (mock.mode === 'hold') await new Promise(resolve => { mock.release = resolve; });
          return mock.accounts;
        }
        if (method === 'eth_accounts') return mock.accounts;
        if (method === 'eth_chainId') return mock.chainId;
        if (method === 'wallet_revokePermissions') return null;
        throw new Error('Forbidden provider method');
      },
    };
  }, { A, key, options });
  const page = await context.newPage();
  page.on('pageerror', () => errors.push('pageerror'));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push('consoleerror'); });
  await page.goto(origin, { waitUntil: 'networkidle' });
  assert.deepEqual(await page.evaluate(() => window.holdbookMock.calls), [], 'No wallet request on load');
  assert.deepEqual(requests, [], 'No Mirror request before Connect');
  const text = value => page.getByText(value, { exact: false }).first().waitFor();
  const role = name => page.getByRole('region', { name, exact: true });
  const connect = async () => { await page.getByRole('button', { name: 'Connect', exact: true }).click(); await text('Current account: Mirror verified'); };
  const release = async () => { behavior.hold = false; await Promise.all(held.splice(0).map(reply => reply())); };
  const close = async (label, extra = {}) => {
    const methods = await page.evaluate(() => window.holdbookMock.calls);
    assert.ok(methods.every(method => ['eth_requestAccounts', 'eth_accounts', 'eth_chainId', 'wallet_revokePermissions'].includes(method)));
    assert.deepEqual(external, []);
    assert.deepEqual(errors, []);
    assert.deepEqual(consoleErrors, []);
    results.push({ label, port, viewport, providerMethods: methods, mirrorRequests: requests.length, forbiddenExternalRequests: external.length, pageErrors: errors.length, consoleErrors: consoleErrors.length, ...extra });
    await release();
    await context.close();
  };
  return { page, context, text, role, connect, release, close, behavior, held, requests };
}

try {
  for (const [server, port] of [['dev', 5173], ['preview', 4173]]) {
    for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
      const f = await fixture(port, viewport);
      const { page, text, role } = f;
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Skip to content');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Connect');
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), 'none');
      await f.connect();
      assert.equal((await page.getByTestId('active-account').textContent()).toLowerCase(), A);
      assert.equal(await page.getByTestId('chain-id').textContent(), '296 / 0x128');
      await role('Admin').getByRole('button', { name: 'Use current account' }).click();
      assert.equal(await role('Seller').getByRole('button', { name: 'Use current account' }).isDisabled(), true);
      for (const [name, address] of [['Seller', B], ['Buyer', C]]) {
        await page.evaluate(address => window.holdbookMock.account(address), address);
        await role(name).getByRole('button', { name: 'Use current account' }).click();
        await role(name).getByText('Mirror verified', { exact: false }).waitFor();
      }
      assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key), { Admin: A, Seller: B, Buyer: C });
      assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [key], 'No wagmi persistence');
      for (const name of ['Admin', 'Seller', 'Buyer']) assert.equal(await role(name).getByRole('button', { name: 'Use current account' }).isDisabled(), true);
      await page.evaluate(() => window.holdbookMock.chain('0x1'));
      await text('Wrong network.');
      assert.equal(await page.getByTestId('chain-id').textContent(), '1 / 0x1');
      await role('Admin').getByText('Saved, awaiting verification.', { exact: false }).waitFor();
      assert.equal(await page.getByText('Mirror verified', { exact: false }).count(), 0);
      f.behavior.hold = true;
      await page.evaluate(() => window.holdbookMock.chain('0x128'));
      await text('Checking Testnet Mirror');
      assert.equal(await role('Admin').getByRole('button', { name: 'Use current account' }).isDisabled(), true);
      await f.release();
      await role('Buyer').getByText('Mirror verified', { exact: false }).waitFor();
      const count = f.requests.length;
      await page.evaluate(() => { window.dispatchEvent(new Event('focus')); window.dispatchEvent(new Event('online')); document.dispatchEvent(new Event('visibilitychange')); });
      await page.waitForTimeout(600);
      assert.equal(f.requests.length, count, 'No focus/reconnect/background refresh');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const screenshot = `.impeccable/review/t01b-1-${server}-${device}.png`;
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: screenshot, fullPage: true });
      await page.reload({ waitUntil: 'networkidle' });
      assert.deepEqual(await page.evaluate(() => window.holdbookMock.calls), []);
      assert.equal(f.requests.length, count, 'No lookup on reload before manual Connect');
      await role('Admin').getByText('Saved, awaiting verification.', { exact: false }).waitFor();
      await f.connect();
      await role('Buyer').getByText('Mirror verified', { exact: false }).waitFor();
      await page.getByRole('button', { name: 'Disconnect', exact: true }).click();
      await text('Wallet not connected. Press Connect');
      assert.equal(await page.getByText('Mirror verified', { exact: false }).count(), 0);
      await role('Admin').getByRole('button', { name: 'Clear', exact: true }).click();
      assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key), { Seller: B, Buyer: C });
      await f.close(`${server}-${device}-lifecycle`, { screenshot, checks: ['keyboard-focus', 'distinct-roles', 'duplicate-guard', 'wrong-chain', 'switch-revalidation', 'no-background-refresh', 'no-overflow', 'reload-manual-connect', 'disconnect', 'clear'] });
    }

    const viewport = { width: 1440, height: 1000 };
    let f = await fixture(port, viewport, { missing: true });
    await f.page.getByRole('button', { name: 'Connect', exact: true }).click();
    await f.text('MetaMask was not found.');
    await f.close(`${server}-missing-provider`);

    f = await fixture(port, viewport);
    await f.page.evaluate(() => { window.holdbookMock.mode = 'reject'; });
    await f.page.getByRole('button', { name: 'Connect', exact: true }).click();
    await f.text('The wallet request was not completed.');
    assert.equal(f.requests.length, 0);
    await f.page.waitForTimeout(500);
    assert.deepEqual(await f.page.evaluate(() => window.holdbookMock.calls), ['eth_requestAccounts']);
    await f.page.evaluate(() => { window.holdbookMock.mode = 'hold'; });
    await f.page.getByRole('button', { name: 'Connect', exact: true }).evaluate(button => { button.click(); button.click(); });
    await f.text('Wallet request pending.');
    assert.equal(await f.page.getByRole('button', { name: 'Connect', exact: true }).isDisabled(), true);
    await f.page.waitForFunction(() => !!window.holdbookMock.release);
    assert.equal(await f.page.evaluate(() => window.holdbookMock.calls.filter(method => method === 'eth_requestAccounts').length), 2);
    await f.page.evaluate(() => window.holdbookMock.release());
    await f.text('Current account: Mirror verified');
    await f.page.evaluate(() => window.holdbookMock.emit('disconnect', { code: 4900 }));
    await f.text('Wallet not connected. Press Connect');
    assert.equal(await f.page.getByText('Mirror verified', { exact: false }).count(), 0);
    await f.close(`${server}-rejection-duplicate-disconnect`);

    f = await fixture(port, viewport);
    f.behavior.hold = true;
    await f.page.getByRole('button', { name: 'Connect', exact: true }).click();
    await f.text('Checking Testnet Mirror');
    await f.page.waitForFunction(() => document.body.textContent.includes('timed out after 10 seconds'), { }, { timeout: 15_000 });
    assert.equal(f.requests.length, 1, 'Timeout never auto retries');
    await f.release();
    await f.page.getByRole('button', { name: 'Retry current account', exact: true }).click();
    await f.text('Current account: Mirror verified');
    await f.page.evaluate(() => window.holdbookMock.account(undefined));
    await f.text('Wallet not connected. Press Connect');
    await f.close(`${server}-timeout-retry-empty-accounts`);

    f = await fixture(port, viewport);
    f.behavior.hold = true;
    f.behavior.invalid = true;
    await f.page.getByRole('button', { name: 'Connect', exact: true }).click();
    await f.text('Checking Testnet Mirror');
    for (let attempt = 0; !f.held.length && attempt < 100; attempt++) await f.page.waitForTimeout(20);
    assert.ok(f.held.length, 'Old request reached the bounded response gate');
    f.behavior.invalid = false;
    f.behavior.hold = false;
    await f.page.evaluate(B => window.holdbookMock.account(B), B);
    await f.text('Current account: Mirror verified · Hedera ID 0.0.102');
    await f.release();
    await f.page.waitForTimeout(100);
    await f.text('Current account: Mirror verified · Hedera ID 0.0.102');
    await f.page.evaluate(A => { window.holdbookMock.account(A); window.holdbookMock.chain('0x1'); window.holdbookMock.chain('0x128'); }, A);
    await f.text('Current account: Mirror verified · Hedera ID 0.0.101');
    const beforeRapid = f.requests.length;
    await f.page.evaluate(({ A, B }) => { window.holdbookMock.account(B); window.holdbookMock.account(A); }, { A, B });
    await f.page.waitForTimeout(300);
    assert.ok(f.requests.length > beforeRapid, 'A-B-A invalidates even within one React batch');
    await f.text('Current account: Mirror verified · Hedera ID 0.0.101');
    await f.close(`${server}-stale-response-and-rapid-transitions`);

    f = await fixture(port, viewport, { seed: { Admin: A, Seller: B } });
    f.behavior.sameId = true;
    await f.connect();
    await f.role('Admin').getByText('Duplicate Hedera ID.', { exact: false }).waitFor();
    await f.role('Seller').getByText('Duplicate Hedera ID.', { exact: false }).waitFor();
    f.behavior.sameId = false;
    f.behavior.hold = true;
    await f.page.evaluate(C => window.holdbookMock.account(C), C);
    await f.text('Checking Testnet Mirror');
    await f.release();
    await f.text('Current account: Mirror verified · Hedera ID 0.0.103');
    // All saved accounts were revalidated after switching; the conflict now clears.
    await f.role('Buyer').getByRole('button', { name: 'Use current account' }).click();
    await f.role('Buyer').getByText('Mirror verified', { exact: false }).waitFor();
    assert.equal(await f.role('Buyer').getByRole('button', { name: 'Use current account' }).isDisabled(), true);
    await f.close(`${server}-restored-id-conflict`);

    f = await fixture(port, viewport);
    await f.page.evaluate(() => window.holdbookMock.chain('0x1'));
    await f.page.getByRole('button', { name: 'Connect', exact: true }).click();
    await f.text('Wrong network.');
    assert.equal(f.requests.length, 0, 'Wrong-chain connect does not request Mirror');
    f.behavior.invalid = true;
    await f.page.evaluate(() => window.holdbookMock.chain('0x128'));
    await f.text('Mirror account does not match, is deleted');
    const failedCount = f.requests.length;
    await f.page.waitForTimeout(400);
    assert.equal(f.requests.length, failedCount, 'Invalid response never retries automatically');
    f.behavior.invalid = false;
    await f.page.getByRole('button', { name: 'Retry current account', exact: true }).evaluate(button => { button.click(); button.click(); });
    await f.text('Current account: Mirror verified');
    assert.equal(f.requests.length, failedCount + 1, 'Repeated Retry starts one lookup');
    await f.page.evaluate(() => {
      document.querySelector('[aria-labelledby="Admin-heading"] button').click();
      document.querySelector('[aria-labelledby="Seller-heading"] button').click();
    });
    assert.deepEqual(await f.page.evaluate(key => JSON.parse(localStorage.getItem(key)), key), { Admin: A }, 'Same-tick role clicks cannot duplicate an account');
    await f.close(`${server}-wrong-chain-connect-invalid-response-retry-role-race`);

    for (const storage of ['read', 'write']) {
      f = await fixture(port, viewport, { storage });
      await f.connect();
      await f.role('Admin').getByRole('button', { name: 'Use current account' }).click();
      await f.text('Changes last only for this page');
      await f.role('Admin').getByText(A, { exact: true }).waitFor();
      await f.role('Admin').getByRole('button', { name: 'Clear', exact: true }).click();
      await f.role('Admin').getByText('Not assigned', { exact: true }).waitFor();
      await f.close(`${server}-storage-${storage}-failure`);
    }
  }
  await writeFile(process.argv[3], JSON.stringify({ schemaVersion: 1, kind: 'synthetic-wallet-browser-verification',
    baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    lockSha256: createHash('sha256').update(await readFile('package-lock.json')).digest('hex'),
    browser: browser.version(), playwright: require('playwright/package.json').version,
    note: 'Real wagmi; synthetic provider and intercepted Mirror responses. No real MetaMask, live account, signature or transaction validation. Mobile is layout only.', results,
  }, null, 2) + '\n', { flag: 'wx' });
  console.log(`${results.length} browser cases passed`);
} finally {
  await browser.close();
}

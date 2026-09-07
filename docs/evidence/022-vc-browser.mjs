// Real wagmi + synthetic EIP-1193 provider / Mirror replies. No wallet profile, private key or valid signature.
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
      accounts: [A], chainId: '0x128', calls: [], mode: 'accept', release: null, signMode: 'reject', signRelease: null, signCalls: [],
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
      async request({ method, params }) {
        mock.calls.push(method);
        if (method === 'personal_sign') {
          mock.signCalls.push(params);
          if (mock.signMode === 'hold') return new Promise(resolve => { mock.signRelease = () => resolve('invalid-signature'); });
          if (mock.signMode === 'reject') throw { code: 4001 };
          return 'invalid-signature';
        }
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
    assert.ok(methods.every(method => ['eth_requestAccounts', 'eth_accounts', 'eth_chainId', 'wallet_revokePermissions', 'personal_sign'].includes(method)));
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
  for (const [mode, port] of [['dev', 5173], ['preview', 4173]]) {
    for (const [size, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
      for (const scenario of (process.argv.includes('--screenshots') ? ['reject'] : ['reject', 'invalid', 'account-change', 'network-change', 'role-change', 'reload', 'expired'])) {
        const f = await fixture(port, viewport, { seed: { Admin: A, Seller: B, Buyer: C } });
        const { page } = f;
        await page.getByRole('button', { name: 'Connect', exact: true }).waitFor();
        await f.connect();
        await page.getByRole('button', { name: 'Prepare Seller VC', exact: true }).click();
        await page.getByTestId('credential-digest').waitFor();
        const digest = await page.getByTestId('credential-digest').textContent();
        assert.match(digest, /^0x[\da-f]{64}$/i);
        assert.equal(await page.getByRole('button', { name: 'Sign in MetaMask and verify' }).isDisabled(), true);
        if (scenario === 'reject') {
          await page.screenshot({path: '.impeccable/review/vc022-' + mode + '-' + size + '.png', fullPage:true});
        }
        await page.getByLabel('I reviewed the issuer, Seller, fixed claims, dates and digest.').check();
        if (scenario === 'expired') {
          await page.evaluate(() => { const now=Date.now(); Date.now=()=>now+8*86400_000; });
        } else if (scenario !== 'reject') {
          await page.evaluate(hold => { window.holdbookMock.signMode=hold?'hold':'invalid'; }, !['invalid'].includes(scenario));
        }
        await page.getByRole('button', { name: 'Sign in MetaMask and verify' }).click();
        if (scenario === 'expired') {
          await page.waitForFunction(()=>document.querySelector('#credential-status').textContent.includes('expired'));
          assert.equal(await page.evaluate(()=>window.holdbookMock.signCalls.length),0);
        } else if (['reject','invalid'].includes(scenario)) {
          await page.waitForFunction(()=>/rejected|verification failed/.test(document.querySelector('#credential-status').textContent));
          assert.equal(await page.evaluate(()=>window.holdbookMock.signCalls.length),1);
        } else {
          await page.waitForFunction(()=>!!window.holdbookMock.signRelease);
          assert.equal(await page.getByRole('button',{name:'Prepare ATS SDK', exact:true}).isDisabled(),true);
          await page.evaluate(()=>document.querySelectorAll('button').forEach(b=>{if(b.textContent==='Sign in MetaMask and verify')b.click();}));
          assert.equal(await page.evaluate(()=>window.holdbookMock.signCalls.length),1);
          if(scenario==='account-change') await page.evaluate(({B,A})=>{window.holdbookMock.account(B);window.holdbookMock.account(A);},{B,A});
          if(scenario==='network-change') await page.evaluate(()=>{window.holdbookMock.chain('0x1');window.holdbookMock.chain('0x128');});
          if(scenario==='role-change') await page.getByRole('region',{name:'Seller',exact:true}).getByRole('button',{name:'Clear',exact:true}).click();
          if(scenario==='reload') {
            await page.reload();await page.getByRole('button',{name:'Connect',exact:true}).waitFor();
          } else {
            await page.evaluate(()=>window.holdbookMock.signRelease());
            await page.waitForFunction(()=>!document.querySelector('[data-testid="credential-digest"]'));
          }
          assert.equal(await page.getByTestId('credential-digest').count(),0);
        }
        assert.doesNotMatch(await page.locator('#credential-status').textContent(),/^Seller VC verified/);
        if(scenario!=='reload' && scenario!=='expired') {
          const params=await page.evaluate(()=>window.holdbookMock.signCalls[0]);
          assert.equal(Buffer.from(params[0].slice(2),'hex').toString('utf8'),digest);
        }
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        await f.close(mode+'-'+size+'-'+scenario,{ scenario, verification:'No valid signature supplied or accepted' });
      }
    }
  }
  await writeFile(process.argv[3],JSON.stringify({schemaVersion:1,kind:'genuine wagmi/Terminal3; controlled provider and Mirror; no valid signature',results},null,2)+'\n',{flag:'wx'});
  console.log(results.length+' VC browser cases passed');
} finally { await browser.close(); }

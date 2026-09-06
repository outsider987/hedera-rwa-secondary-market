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
    if(options.record) localStorage.setItem('holdbook.testnet.nova.v1',JSON.stringify(options.record));
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
 const record={schemaVersion:1,kind:'nova-create',chainId:296,operationId:'synthetic-browser-record',startedAt:new Date().toISOString(),admin:A,configVersion:1,calldataDigest:'0x'+'1'.repeat(64),transactionHash:'0x'+'2'.repeat(64),status:'unknown'};
 for(const [mode,port] of [['dev',5173],['preview',4173]])for(const [size,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  for(const scenario of (process.argv.includes('--smoke')?['gates']:['gates','saved','storage'])){
   const f=await fixture(port,viewport,{seed:{Admin:A,Seller:B,Buyer:C},...(scenario==='saved'?{record}:{}),...(scenario==='storage'?{storage:'write'}:{})});
   const {page}=f,section=page.getByRole('region',{name:'Create NOVA once'});
   assert.equal(await section.getByRole('button',{name:'Create NOVA in MetaMask'}).isDisabled(),true);
   if(mode==='dev')await f.text('Development mode: review settings and query an existing asset.');
   const settings=section.locator('details').first();assert.equal(await settings.getByText('1000',{exact:true}).count(),1);
   await section.getByText('Remaining T01 human acceptance — required before creation',{exact:true}).click();
   const checks=section.locator('details').nth(1).getByRole('checkbox');
   assert.equal(await checks.count(),7);for(const check of await checks.all())await check.check();
   await section.getByLabel('Chrome and MetaMask versions (public observation)').fill('Synthetic browser fixture; not human acceptance');
   assert.equal(await section.getByRole('button',{name:'Create NOVA in MetaMask'}).isDisabled(),true,'Checkboxes cannot replace a genuine verified VC');
   if(scenario==='saved'){
    await f.text('Saved operation (unknown). Query the hash to verify chain state.');
    const other=await f.context.newPage();await other.goto('http://127.0.0.1:'+port);
    await other.evaluate(()=>{const key='holdbook.testnet.nova.v1',r=JSON.parse(localStorage.getItem(key));r.status='pending';localStorage.setItem(key,JSON.stringify(r));});
    await f.text('Saved operation (pending). Query the hash to verify chain state.');
    await page.reload();await f.text('Saved operation (unknown). Query the hash to verify chain state.');
    const download=page.waitForEvent('download');await section.getByRole('button',{name:'Export NOVA result'}).click();
    const file=await download,stream=await file.createReadStream();let json='';for await(const chunk of stream)json+=chunk;
    const exported=JSON.parse(json);assert.equal(exported.transactionHash,record.transactionHash);assert.match(exported.hashScanLink,/hashscan.io\/testnet/);
    assert.doesNotMatch(json,/proofValue|credentialSubject|privateKey/);await other.close();
   }
   if(scenario==='storage'){
    await f.text('Durable storage or browser locking is unavailable.');
    await section.getByLabel('Public transaction hash').fill(record.transactionHash);
    assert.equal(await section.getByRole('button',{name:'Query NOVA transaction'}).isEnabled(),true);
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.keyboard.press('Tab');await section.getByRole('button',{name:'Prepare NOVA review'}).focus();assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle!=='none'),true);
   if(scenario==='gates')await page.screenshot({path:'.impeccable/review/nova023-'+mode+'-'+size+'.png',fullPage:true});
   await f.close(mode+'-'+size+'-'+scenario,{scenario,creationDisabled:true,humanAcceptance:'Not established'});
  }
 }
 await writeFile(process.argv[3],JSON.stringify({date:new Date().toISOString(),kind:'App safety gates and synthetic saved records; no VC or transaction success',results},null,2)+'\n',{flag:'wx'});
 console.log(results.length+' NOVA UI browser cases passed');
}finally{await browser.close()}

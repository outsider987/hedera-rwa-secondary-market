import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, symlinkSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { registerHooks } from 'node:module';

// Resolve this browser-style relative import for Node's native TypeScript loader.
registerHooks({ resolve(specifier, context, next) {
  return next(['./deployment', './guards'].includes(specifier) && context.parentURL?.includes('/src/ats.ts')
    ? new URL(specifier + '.ts', context.parentURL).href : specifier, context);
} });
import { patchAtsReadonly, patches } from '../scripts/patch-ats-readonly.mjs';
import { config } from '../src/compat/dotenv.ts';
import BrowserFileTransport, { createLogger, format } from '../src/compat/winston.ts';

test('browser adapters never inspect or emit SDK payloads or run formatters', (t) => {
  const calls = [];
  for (const method of ['error', 'info', 'debug']) {
    t.mock.method(console, method, (...args) => calls.push(args));
  }
  const forbidden = new Proxy({}, { get() { assert.fail('SDK payload must remain opaque'); } });
  const logger = createLogger({ level: 'TRACE' });
  for (const level of ['ERROR', 'INFO', 'TRACE', forbidden]) logger.log(level, forbidden, forbidden);
  assert.deepEqual(calls, [
    ['[ATS] ERROR: details withheld.'],
    ['[ATS] INFO: details withheld.'],
    ['[ATS] TRACE: details withheld.'],
  ]);
  assert.deepEqual(format.printf(() => assert.fail('formatter must not execute')), {});
  assert.deepEqual(config(), {});
  assert.throws(() => new BrowserFileTransport(), /File logging is unavailable/);
});

test('public SDK types accept a genuine network request with a caller-owned read provider', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const scratch = mkdtempSync(join(tmpdir(), 'holdbook-ats-types-'));
  try {
    symlinkSync(join(root, 'node_modules'), join(scratch, 'node_modules'), 'dir');
    writeFileSync(join(scratch, 'probe.ts'), `
      import { Network, SetNetworkRequest, Management, ResolveLatestConfigVersionRequest } from '@hashgraph/asset-tokenization-sdk';
      import { JsonRpcProvider } from 'ethers';
      const request = new SetNetworkRequest({ environment: 'testnet',
        mirrorNode: { baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/' },
        rpcNode: { baseUrl: 'https://testnet.hashio.io/api', queryProvider: new JsonRpcProvider('https://testnet.hashio.io/api') },
      });
      request.validate();
      Network.setNetwork(request);
      const result: Promise<{ payload: number }> = Management.resolveLatestConfigVersion(new ResolveLatestConfigVersionRequest({
        resolverAddress: '0xba2d5fc2083a0b8f164c50e65d782087fba18e0a', configurationId: '0x' + '0'.repeat(63) + '1',
      }));
      void result;
    `);
    try {
      execFileSync(join(root, 'node_modules/.bin/tsc'), ['--noEmit', '--skipLibCheck', '--strict', '--target', 'ES2022',
        '--module', 'ESNext', '--moduleResolution', 'Bundler', '--types', 'vite/client', 'probe.ts'], { cwd: scratch, stdio: 'pipe' });
    } catch (error) {
      assert.fail(error.stdout?.toString() || 'Public SDK type check failed');
    }
  } finally { rmSync(scratch, { recursive: true, force: true }); }
});

test('SDK patch rejects version/content drift before writing and survives reapplication', () => {
  const source = fileURLToPath(new URL('../node_modules/@hashgraph/asset-tokenization-sdk/', import.meta.url));
  const scratch = mkdtempSync(join(tmpdir(), 'holdbook-ats-patch-'));
  const original = new Map();
  try {
    writeFileSync(join(scratch, 'package.json'), JSON.stringify({ name: '@hashgraph/asset-tokenization-sdk', version: '8.0.0' }));
    for (const entry of patches) {
      let text = readFileSync(join(source, entry.path), 'utf8');
      if (text.startsWith('// HoldBook:')) {
        text = text.slice(text.indexOf('\n') + 1);
        if (entry.append) text = text.slice(0, -entry.append.length);
        for (const [before, after] of [...entry.edits].reverse()) text = text.replace(after, before);
      }
      original.set(entry.path, text);
      mkdirSync(dirname(join(scratch, entry.path)), { recursive: true });
      writeFileSync(join(scratch, entry.path), text);
    }
    assert.throws(() => patchAtsReadonly(scratch, true), /SDK patch missing/);
    writeFileSync(join(scratch, patches.at(-1).path), 'unexpected content');
    assert.throws(() => patchAtsReadonly(scratch), /Unexpected SDK file/);
    assert.equal(readFileSync(join(scratch, patches[0].path), 'utf8'), original.get(patches[0].path));
    writeFileSync(join(scratch, patches.at(-1).path), original.get(patches.at(-1).path));
    writeFileSync(join(scratch, 'package.json'), JSON.stringify({ name: '@hashgraph/asset-tokenization-sdk', version: '8.0.1' }));
    assert.throws(() => patchAtsReadonly(scratch), /Only pinned/);
    writeFileSync(join(scratch, 'package.json'), JSON.stringify({ name: '@hashgraph/asset-tokenization-sdk', version: '8.0.0' }));
    assert.equal(patchAtsReadonly(scratch).changed, 12);
    assert.equal(patchAtsReadonly(scratch).changed, 0);
    assert.equal(patchAtsReadonly(scratch, true).changed, 0);
    assert.equal(patchAtsReadonly(undefined, true).changed, 0, 'The installed SDK must also be patched');
  } finally { rmSync(scratch, { recursive: true, force: true }); }
});

// Unit doubles exercise the loader only. Real SDK readiness requires browser evidence.
test('the loader caches one safe result and never calls the configuration API', async (t) => {
  for (const [name, management, expected] of [
    ['api-present', { resolveLatestConfigVersion() { assert.fail('API must not be called'); } }, 'loaded'],
    ['api-missing', {}, 'failed'],
    ['probe-error', { get resolveLatestConfigVersion() { throw new Error('synthetic-private-error'); } }, 'failed'],
  ]) {
    await t.test(name, async () => {
      const sdk = mock.module('@hashgraph/asset-tokenization-sdk', {
        exports: { Management: management },
      });
      try {
        const { loadAts } = await import(`../src/ats.ts?${name}`);
        const first = loadAts();
        assert.equal(loadAts(), first, 'pending calls share the same attempt');
        assert.equal(await first, expected);
        assert.equal(loadAts(), first, 'settled calls never retry');
        assert.doesNotMatch(JSON.stringify(await loadAts()), /synthetic-private-error/);
      } finally {
        sdk.restore();
      }
    });
  }
});


// SDK doubles test orchestration; the browser harness runs the actual public SDK.
test('SDK config requires manual preparation, verified preflight and an owned restricted provider', async t => {
  const { JsonRpcProvider } = await import('ethers');
  const { equityConfigCalldata } = await import('../src/deployment.ts');
  const addresses = ['0x' + 'a'.repeat(40), '0x' + 'b'.repeat(40)];
  const ids = ['0.0.9212226', '0.0.9213391'];
  const calls = [], requests = [];
  let provider, destroyed = 0, payload = 1, forbiddenMethod = false, hold = false, release, started, invalidPreparation = true;
  const originalDestroy = JsonRpcProvider.prototype.destroy;
  t.mock.method(JsonRpcProvider.prototype, 'destroy', function () { destroyed++; originalDestroy.call(this); });
  class SetNetworkRequest { constructor(props) { Object.assign(this, props); } validate() { return invalidPreparation ? ['Synthetic invalid request'] : []; } }
  class ResolveLatestConfigVersionRequest { constructor(props) { Object.assign(this, props); } }
  const sdk = mock.module('@hashgraph/asset-tokenization-sdk', { exports: {
    SetNetworkRequest, ResolveLatestConfigVersionRequest,
    Network: { async setNetwork(request) {
      assert.ok(request instanceof SetNetworkRequest);
      assert.equal(request.environment, 'testnet');
      provider = request.rpcNode.queryProvider;
      assert.ok(provider instanceof JsonRpcProvider);
      assert.equal(provider.disableCcipRead, true);
      requests.push(request);
    } },
    Management: { async resolveLatestConfigVersion(request) {
      assert.ok(request instanceof ResolveLatestConfigVersionRequest);
      assert.equal(request.resolverAddress, addresses[0]);
      const value = await provider.send(forbiddenMethod ? 'eth_sendTransaction' : 'eth_call', [{ to: request.resolverAddress, data: equityConfigCalldata }, 'latest']);
      assert.equal(value, '0x' + '0'.repeat(63) + '1');
      return { payload, hidden: 'synthetic-untrusted-detail' };
    } },
  } });
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    init.signal.throwIfAborted();
    const rpc = init.body ? JSON.parse(typeof init.body === 'string' ? init.body : new TextDecoder().decode(init.body)) : undefined;
    calls.push(rpc?.method ?? 'Mirror');
    const json = rpc ? { jsonrpc: '2.0', id: rpc.id, result: rpc.method === 'eth_chainId' ? '0x128' : rpc.method === 'eth_getCode' ? '0x6000' : '0x' + '0'.repeat(63) + '1' }
      : { contract_id: ids.find(id => String(url).endsWith(id)), evm_address: addresses[ids.findIndex(id => String(url).endsWith(id))], deleted: false };
    assert.equal(init.credentials, 'omit'); assert.equal(init.redirect, 'error');
    if (hold && rpc?.method === 'eth_call' && calls.filter(c => c === 'eth_call').length % 2 === 0) {
      started();
      return new Promise(resolve => { release = () => resolve(Response.json(json)); });
    }
    return Response.json(json);
  });
  try {
    const ats = await import('../src/ats.ts?config-orchestration');
    assert.equal(typeof ats.prepareAts, 'function');
    assert.equal(typeof ats.checkSdkConfig, 'function');
    await assert.rejects(ats.checkSdkConfig(new AbortController().signal), /Prepare ATS SDK/);
    assert.equal(calls.length, 0);
    assert.equal(await ats.prepareAts(), 'failed');
    assert.equal(calls.length, 0);
    invalidPreparation = false;
    const preparation = ats.prepareAts();
    assert.equal(ats.prepareAts(), preparation);
    assert.equal(await preparation, 'loaded');
    assert.equal(calls.length, 0); assert.equal(requests.length, 0);
    const good = await ats.checkSdkConfig(new AbortController().signal);
    assert.equal(good.status, 'passed'); assert.equal(good.payload, 1);
    assert.equal(good.deployment.status, 'passed'); assert.equal(destroyed, 1);
    assert.equal(calls.length, 7); assert.equal(requests.length, 1);
    assert.doesNotMatch(JSON.stringify(good), /synthetic-untrusted-detail|queryProvider/);
    for (payload of [0, -1, 1.5, NaN, Infinity, '1', undefined, Number.MAX_SAFE_INTEGER + 1]) {
      const result = await ats.checkSdkConfig(new AbortController().signal);
      assert.equal(result.status, 'failed'); assert.equal(result.payload, undefined);
    }
    payload = Number.MAX_SAFE_INTEGER;
    assert.equal((await ats.checkSdkConfig(new AbortController().signal)).payload, payload);
    forbiddenMethod = true;
    const before = calls.length;
    assert.equal((await ats.checkSdkConfig(new AbortController().signal)).status, 'failed');
    assert.equal(calls.length - before, 6, 'Forbidden SDK method never reaches fetch');
    forbiddenMethod = false; payload = 1;
    calls.length = 0; hold = true;
    const controller = new AbortController();
    const waiting = new Promise(resolve => { started = resolve; });
    const pending = ats.checkSdkConfig(controller.signal);
    await waiting;
    await assert.rejects(ats.checkSdkConfig(new AbortController().signal), /already pending/);
    controller.abort();
    await assert.rejects(ats.checkSdkConfig(new AbortController().signal), /already pending/);
    release();
    await assert.rejects(pending, { name: 'AbortError' });
    hold = false;
    assert.equal((await ats.checkSdkConfig(new AbortController().signal)).status, 'passed');
    assert.equal(destroyed, requests.length);
    const deadline = new AbortController(); let deadlines = 0;
    t.mock.method(AbortSignal, 'timeout', ms => { assert.equal(ms, 10_000); deadlines++; return deadline.signal; });
    calls.length = 0; hold = true;
    const timedStart = new Promise(resolve => { started = resolve; });
    const timed = ats.checkSdkConfig(new AbortController().signal);
    await timedStart; deadline.abort(); release();
    const timedResult = await timed;
    assert.equal(timedResult.status, 'failed'); assert.match(timedResult.message, /timed out/);
    assert.equal(timedResult.payload, undefined); assert.equal(deadlines, 1);
    assert.equal(destroyed, requests.length);
  } finally { sdk.restore(); }
});

test('managed wallet patch is pinned, all-or-nothing, idempotent and does not overlap the read-only patch', async () => {
  const { patchAtsWallet, walletPatches } = await import('../scripts/patch-ats-wallet.mjs');
  assert(walletPatches.every(p => !patches.some(other => p.path === other.path)));
  const source = fileURLToPath(new URL('../node_modules/@hashgraph/asset-tokenization-sdk/', import.meta.url));
  const scratch = mkdtempSync(join(tmpdir(), 'holdbook-wallet-patch-'));
  try {
    writeFileSync(join(scratch,'package.json'),JSON.stringify({name:'@hashgraph/asset-tokenization-sdk',version:'8.0.0'}));
    for(const entry of walletPatches){
      let text=readFileSync(join(source,entry.path),'utf8');
      if(text.startsWith('// HoldBook: managed')) {text=text.slice(text.indexOf('\n')+1);if(entry.append)text=text.slice(0,-entry.append.length);for(const [before,after]of [...entry.edits].reverse())text=text.replace(after,before);}
      mkdirSync(dirname(join(scratch,entry.path)),{recursive:true});writeFileSync(join(scratch,entry.path),text);
    }
    assert.throws(()=>patchAtsWallet(scratch,true),/missing/);
    const last=walletPatches.at(-1), original=readFileSync(join(scratch,last.path),'utf8');
    writeFileSync(join(scratch,last.path),'drift');assert.throws(()=>patchAtsWallet(scratch),/Unexpected/);
    assert(!readFileSync(join(scratch,walletPatches[0].path),'utf8').startsWith('// HoldBook: managed'));
    writeFileSync(join(scratch,last.path),original);assert.equal(patchAtsWallet(scratch).changed,16);
    assert.equal(patchAtsWallet(scratch).changed,0);assert.equal(patchAtsWallet(undefined,true).changed,0);
    writeFileSync(join(scratch,'package.json'),JSON.stringify({name:'@hashgraph/asset-tokenization-sdk',version:'8.0.1'}));
    assert.throws(()=>patchAtsWallet(scratch),/Only pinned/);
  }finally{rmSync(scratch,{recursive:true,force:true});}
});

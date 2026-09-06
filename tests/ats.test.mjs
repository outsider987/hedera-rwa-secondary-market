import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, symlinkSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
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

import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
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

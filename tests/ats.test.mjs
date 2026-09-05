import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

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

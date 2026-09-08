import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolvePage } from '../src/lib/navigation.ts';

test('navigation preserves activity legacy links and skip links do not change page', () => {
  for (const hash of ['', '#overview', '#unknown']) assert.equal(resolvePage(hash), 'overview');
  for (const hash of ['#activity', '#trade', '#history', '#my-orders-heading', '#matches-heading']) assert.equal(resolvePage(hash), 'activity');
  assert.equal(resolvePage('#market'), 'market');
  assert.equal(resolvePage('#settings'), 'settings');
  assert.equal(resolvePage('#main'), undefined);
});

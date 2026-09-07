// Reuse all 007 public API, wire/64-bit and bounded malformed-input probes.
// node this-file --candidate --compare baseline.json --record NEW-result.json
// The inherited probes resolve packages from this checkout, never a wallet.
import './007-t01a-protobuf-rebuild.test.mjs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('both public proto entries retain their own decoded classes in either load order', () => {
  for (const order of [['@hashgraph/proto', '@hiero-ledger/proto'], ['@hiero-ledger/proto', '@hashgraph/proto']]) {
    const source = `
      const assert = require('node:assert/strict');
      const first = require(${JSON.stringify(order[0])});
      const second = require(${JSON.stringify(order[1])});
      for (const p of [first, second]) {
        const wire = Uint8Array.from([18, 1, 42]);
        const key = p.proto.Key.decode(wire);
        assert.ok(key instanceof p.proto.Key);
        assert.deepEqual(Array.from(p.proto.Key.encode(key).finish()), Array.from(wire));
      }
    `;
    const result = spawnSync(process.execPath, ['--max-old-space-size=128', '-e', source], {
      cwd: fileURLToPath(new URL('../../', import.meta.url)), encoding: 'utf8',
      timeout: 5000, killSignal: 'SIGKILL', maxBuffer: 4096,
    });
    assert.equal(result.status, 0, `${order.join(' then ')} must preserve class identity`);
  }
});

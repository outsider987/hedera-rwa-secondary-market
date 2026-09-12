import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { encodeFunctionData, encodeAbiParameters, encodeErrorResult } from 'viem';
const artifact = JSON.parse(readFileSync(new URL('../node_modules/@hashgraph/asset-tokenization-contracts/artifacts/contracts/infrastructure/diamond/DiamondCutManager.sol/DiamondCutManager.json', import.meta.url)));
const configId = `0x${'0'.repeat(63)}1`;
const calldata = encodeFunctionData({ abi: artifact.abi, functionName: 'getLatestVersionByConfiguration', args: [configId] });
const encodedVersion = value => encodeAbiParameters([{ type: 'uint256' }], [value]);
import { checkDeployment, validateContract } from '../src/lib/deployment.ts';

const ids = ['0.0.9212226', '0.0.9213391'];
const addresses = [`0x${'a'.repeat(40)}`, `0x${'b'.repeat(40)}`];
const offchainError = encodeErrorResult({ abi: [{ type: 'error', name: 'OffchainLookup', inputs: ['address', 'string[]', 'bytes', 'bytes4', 'bytes'].map(type => ({ type })) }], errorName: 'OffchainLookup', args: [addresses[0], ['https://offchain.invalid/{data}'], '0x', '0x00000000', '0x'] });
const record = (index) => ({ contract_id: ids[index], evm_address: addresses[index], deleted: false });

function fixture(t, options = {}) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    if (!String(url).startsWith('https://testnet.hashio.io/api') && !String(url).startsWith('https://testnet.mirrornode.hedera.com/api/v1/contracts/')) {
      calls.push({ forbidden: String(url) }); throw new Error('Synthetic forbidden request');
    }
    init.signal.throwIfAborted();
    assert.equal(init.credentials, 'omit');
    assert.equal(init.redirect, 'error');
    assert.equal(init.cache, 'no-store');
    assert.equal(init.referrerPolicy, 'no-referrer');
    const rpc = init.body ? JSON.parse(init.body) : undefined;
    calls.push(rpc ?? String(url));
    if (options.hold && ((!rpc && options.holdMirror !== false) || options.hold === 'rpc' || options.hold === rpc?.method)) {
      options.started?.();
      return new Promise((resolve, reject) => {
        if (options.ignoreAbort) options.release = () => resolve(Response.json(rpc ? { jsonrpc: '2.0', id: rpc.id, result: rpc.method === 'eth_call' ? encodedVersion(1n) : '0x128' } : record(0)));
        else init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
      });
    }
    if (rpc) {
      assert.equal(String(url), 'https://testnet.hashio.io/api');
      assert.equal(init.method, 'POST');
      assert.ok(['eth_chainId', 'eth_getCode', 'eth_call'].includes(rpc.method));
      if (rpc.method === 'eth_getCode') {
        assert.ok(addresses.includes(rpc.params[0]));
        assert.equal(rpc.params[1], 'latest');
      }
      if (rpc.method === 'eth_call') {
        assert.deepEqual(rpc.params, [{ data: calldata, to: addresses[0] }, 'latest']);
        if (options.configOffchain) return Response.json({ jsonrpc: '2.0', id: rpc.id, error: { code: 3, message: 'Synthetic offchain lookup', data: offchainError } });
        if (options.configError) return Response.json({ jsonrpc: '2.0', id: rpc.id, error: { code: 3, message: 'synthetic-untrusted-detail' } });
        return Response.json({ jsonrpc: '2.0', id: rpc.id, result: options.configRaw ?? encodedVersion(options.version ?? 1n) });
      }
      if (options.rpcError || (options.codeRpcError && rpc.method === 'eth_getCode')) return Response.json({ jsonrpc: '2.0', id: rpc.id, error: { code: -32000, message: 'synthetic-untrusted-detail' } });
      return Response.json({ jsonrpc: '2.0', id: rpc.id, result: rpc.method === 'eth_chainId' ? (options.chain ?? '0x128') : (options.code ?? '0x6000') });
    }
    assert.equal(init.method, 'GET');
    const index = ids.findIndex(id => String(url) === `https://testnet.mirrornode.hedera.com/api/v1/contracts/${id}`);
    assert.notEqual(index, -1);
    if (options.http && index === 0) return new Response('', { status: options.http });
    return Response.json(options.records?.[index] ?? record(index));
  });
  return calls;
}

test('contract records must match the fixed ID and contain a live, nonzero EVM address', () => {
  assert.equal(validateContract(ids[0], record(0)), addresses[0]);
  assert.equal(validateContract(ids[0], { ...record(0), evm_address: 'A'.repeat(40) }), addresses[0]);
  for (const value of [null, [], {}, { ...record(0), contract_id: ids[1] }, { ...record(0), deleted: true },
    { ...record(0), deleted: undefined }, ...['0x0', 'g'.repeat(40), '0'.repeat(40), ...['\n', '\r', '\r\n', '\u2028'].map(suffix => addresses[0] + suffix)].map(evm_address => ({ ...record(0), evm_address }))]) {
    assert.throws(() => validateContract(ids[0], value));
  }
});

test('real viem performs only the fixed chain, Mirror and bytecode reads; results are whitelisted', async t => {
  const calls = fixture(t);
  const result = await checkDeployment(new AbortController().signal);
  assert.equal(result.status, 'passed');
  assert.equal(result.chainId, 296);
  assert.ok(Number.isFinite(Date.parse(result.checkedAt)));
  assert.deepEqual(result.contracts.map(c => [c.id, c.address, c.status, c.byteLength]), ids.map((id, i) => [id, addresses[i], 'passed', 2]));
  assert.equal(calls[0].method, 'eth_chainId');
  assert.equal(calls.length, 6);
  assert.deepEqual(result.config, { id: configId, version: '1', status: 'passed', message: 'On-chain Equity config verified.' });
  assert.doesNotMatch(JSON.stringify(result), /0x6000|deleted|evm_address|transaction|synthetic-untrusted/);
});

test('wrong or malformed chain and RPC errors stop before contract queries without leaking error objects', async t => {
  for (const options of [{ chain: '0x1' }, { chain: 'garbage' }, { rpcError: true }]) {
    await t.test(JSON.stringify(options), async t => {
      const calls = fixture(t, options);
      const result = await checkDeployment(new AbortController().signal);
      assert.equal(result.status, 'failed');
      assert.ok(result.contracts.every(c => c.status === 'not-checked'));
      assert.equal(calls.length, 1);
      assert.doesNotMatch(JSON.stringify(result), /synthetic-untrusted-detail/);
    });
  }
});

test('duplicate deployment addresses prevent both bytecode reads', async t => {
  const calls = fixture(t, { records: [record(0), { ...record(1), evm_address: addresses[0] }] });
  const result = await checkDeployment(new AbortController().signal);
  assert.equal(result.status, 'failed');
  assert.ok(result.contracts.every(c => c.status === 'failed'));
  assert.equal(calls.length, 3);
});

test('invalid Mirror, HTTP failures, empty and malformed code cannot pass; independent successes survive', async t => {
  for (const options of [{ records: [{ ...record(0), contract_id: ids[1] }, record(1)] }, { http: 404 }, { http: 429 }, { codeRpcError: true },
    ...['0x', '0x0', '0xzz', '6000', 42, '0x6000\r\n'].map(code => ({ code }))]) {
    await t.test(JSON.stringify(options), async t => {
      fixture(t, options);
      const result = await checkDeployment(new AbortController().signal);
      assert.equal(result.status, 'failed');
      assert.equal(result.contracts[0].status, 'failed');
      assert.equal(result.contracts[1].status, options.code !== undefined || options.codeRpcError ? 'failed' : 'passed');
      assert.doesNotMatch(JSON.stringify(result), /synthetic-untrusted-detail/);
    });
  }
});

test('one 10-second deadline aborts requests, never retries and produces safe timeout status', async t => {
  const deadline = new AbortController();
  t.mock.method(AbortSignal, 'timeout', ms => { assert.equal(ms, 10_000); return deadline.signal; });
  const calls = fixture(t, { hold: true, started: () => setImmediate(() => deadline.abort(new DOMException('Timed out', 'TimeoutError'))) });
  const result = await checkDeployment(new AbortController().signal);
  assert.equal(result.status, 'failed');
  assert.ok(result.contracts.every(c => /timed out/i.test(c.message)));
  assert.equal(calls.length, 3);
});

test('cancellation rejects, including a transport response arriving after cancellation', async t => {
  for (const ignoreAbort of [false, true]) {
    await t.test(String(ignoreAbort), async t => {
      const controller = new AbortController();
      // Hold the chain request so a late reply cannot start Mirror reads.
      const options = { hold: 'rpc', ignoreAbort, started: () => setImmediate(() => {
        controller.abort();
        options.release?.();
      }) };
      const calls = fixture(t, options);
      await assert.rejects(checkDeployment(controller.signal), { name: 'AbortError' });
      assert.equal(calls.length, 1);
    });
  }
});


test('config accepts safe positive versions and rejects zero, unsafe values, bad ABI and reverts', async t => {
  for (const options of [{ version: 1n }, { version: BigInt(Number.MAX_SAFE_INTEGER) }, { version: 0n },
    { version: BigInt(Number.MAX_SAFE_INTEGER) + 1n }, { configRaw: '0x' }, { configRaw: '0x01' }, { configError: true }]) {
    await t.test(String(options.version ?? options.configRaw ?? 'revert'), async t => {
      const calls = fixture(t, options);
      const result = await checkDeployment(new AbortController().signal);
      const status = options.version !== undefined && options.version > 0n && options.version <= BigInt(Number.MAX_SAFE_INTEGER) ? 'passed' : 'failed';
      assert.equal(result.config.status, status);
      assert.equal(result.status, status);
      assert.ok(result.contracts.every(c => c.status === 'passed'));
      assert.equal(calls.filter(c => c.method === 'eth_call').length, 1);
      assert.doesNotMatch(JSON.stringify(result), /synthetic-untrusted-detail|payload/);
      if (status === 'passed') assert.equal(result.config.version, options.version.toString());
    });
  }
});

test('config requires verified Resolver; Factory failure does not suppress an independent config result', async t => {
  for (const failure of ['chain', 'resolver', 'code', 'duplicate', 'factory']) {
    await t.test(failure, async t => {
      const options = failure === 'chain' ? { chain: '0x1' } : failure === 'code' ? { code: '0x' }
        : failure === 'duplicate' ? { records: [record(0), { ...record(1), evm_address: addresses[0] }] }
        : { records: [0, 1].map(i => ({ ...record(i), deleted: i === (failure === 'resolver' ? 0 : 1) })) };
      const calls = fixture(t, options);
      const result = await checkDeployment(new AbortController().signal);
      assert.equal(result.status, 'failed');
      assert.equal(result.config.status, failure === 'factory' ? 'passed' : 'not-checked');
      assert.equal(calls.filter(c => c.method === 'eth_call').length, failure === 'factory' ? 1 : 0);
    });
  }
});

test('config shares the original deadline and cannot publish after cancellation, even with a late reply', async t => {
  for (const mode of ['timeout', 'cancel', 'late']) {
    await t.test(mode, async t => {
      const deadline = new AbortController(), controller = new AbortController();
      let deadlines = 0;
      t.mock.method(AbortSignal, 'timeout', ms => { assert.equal(ms, 10_000); deadlines++; return deadline.signal; });
      const options = { hold: 'eth_call', ignoreAbort: mode === 'late', started: () => setImmediate(() => {
        if (mode === 'timeout') deadline.abort(new DOMException('Timed out', 'TimeoutError'));
        else controller.abort();
        options.release?.();
      }) };
      // Hold only eth_call, not the preceding Mirror requests.
      options.holdMirror = false;
      const calls = fixture(t, options);
      const pending = checkDeployment(controller.signal);
      if (mode === 'timeout') {
        const result = await pending;
        assert.equal(result.config.status, 'failed');
        assert.match(result.config.message, /timed out/i);
        assert.ok(result.contracts.every(c => c.status === 'passed'));
      } else await assert.rejects(pending, { name: 'AbortError' });
      assert.equal(deadlines, 1);
      assert.equal(calls.length, 6);
    });
  }
});

test('config never follows an OffchainLookup response to an external gateway', async t => {
  const calls = fixture(t, { configOffchain: true });
  const result = await checkDeployment(new AbortController().signal);
  assert.equal(result.config.status, 'failed');
  assert.equal(calls.filter(c => c.forbidden).length, 0);
  assert.equal(calls.filter(c => c.method === 'eth_call').length, 1);
});

// Offline diagnostic gate, intentionally outside npm test: unsafe decoders FAIL.
// Fork of the preserved 005 diagnostic, extended for the 007 rebuild trial.
// node this-file --record new.json [--compare baseline.json] [--candidate]
// node --test this-file
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { spawnSync, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);
const protos = ['@hashgraph/proto', '@hiero-ledger/proto'];
const parents = ['@hashgraph/sdk', ...protos, '@hiero-ledger/sdk'];
const timeout = 5000;
const option = name => process.argv[process.argv.indexOf(name) + 1];
const hash = data => createHash('sha256').update(data).digest('hex');

// Independent wire oracle; no protobuf writer and no conversion through Number.
function varint(value) {
  let n = BigInt.asUintN(64, BigInt(value));
  const bytes = [];
  do { bytes.push(Number(n & 127n) | (n > 127n ? 128 : 0)); n >>= 7n; } while (n);
  return Buffer.from(bytes);
}
const integer = (field, value) => Buffer.concat([varint(field * 8), varint(value)]);
const bytes = (field, value) => Buffer.concat([varint(field * 8 + 2), varint(value.length), value]);

function snapshot(pkg) {
  const { proto } = require(pkg); // Public proto entry; never import the SDK or a signer.
  const scoped = createRequire(require.resolve(`${pkg}/package.json`));
  const Long = scoped('long');
  const normalize = value => {
    if (Long.isLong(value)) return value.toString();
    if (value instanceof Uint8Array) return Buffer.from(value).toString('hex');
    if (Array.isArray(value)) return value.map(normalize);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v)]));
    return value;
  };
  const big = '9007199254740993';
  const max = '9223372036854775807';
  const min = '-9223372036854775808';
  const address = Buffer.alloc(20, 0x23); // Synthetic public bytes, never a wallet address lookup.
  const key = Buffer.from(Array.from({ length: 32 }, (_, i) => i));
  const fixtures = [
    ['AccountID', 'numeric', { shardNum: '0', realmNum: big, accountNum: max }, Buffer.concat([integer(1, 0), integer(2, big), integer(3, max)])],
    ['AccountID', 'alias', { alias: address }, bytes(4, address)],
    ['ContractID', 'numeric', { shardNum: '0', realmNum: big, contractNum: max }, Buffer.concat([integer(1, 0), integer(2, big), integer(3, max)])],
    ['ContractID', 'evm', { evmAddress: address }, bytes(4, address)],
    ['Timestamp', 'large', { seconds: big, nanos: 999999999 }, Buffer.concat([integer(1, big), integer(2, 999999999)])],
    ['Timestamp', 'negative', { seconds: min, nanos: 0 }, Buffer.concat([integer(1, min), integer(2, 0)])],
    ['Key', 'ed25519', { ed25519: key }, bytes(2, key)],
    ['Key', 'list', { keyList: { keys: [{ ed25519: key }] } }, bytes(6, bytes(1, bytes(2, key)))],
  ];
  return fixtures.map(([type, name, input, expected]) => {
    const encoded = proto[type].encode(proto[type].create(input)).finish();
    assert.equal(Buffer.from(encoded).toString('hex'), expected.toString('hex'), `${type}/${name} wire bytes`);
    const decoded = normalize(proto[type].decode(encoded));
    assert.deepEqual(decoded, normalize(input), `${type}/${name} precision and fields`);
    assert.equal(Buffer.from(proto[type].encode(proto[type].decode(expected)).finish()).toString('hex'), expected.toString('hex'));
    return { type, name, hex: expected.toString('hex'), decoded };
  });
}

function probe(pkg, name) {
  if (name === 'compatibility') return { outcome: 'compatible', fixtures: snapshot(pkg) };
  const { proto } = require(pkg);
  if (name === 'public-api') {
    const entries = [];
    function visit(value, path) {
      if (typeof value === 'function') {
        entries.push({ path, members: Object.keys(value).sort(), fields: Object.keys(value.prototype).sort(),
          emptyWire: value.encode ? Buffer.from(value.encode(value.create({})).finish()).toString('hex') : null });
      } else if (value && typeof value === 'object') {
        for (const key of Object.keys(value).sort()) visit(value[key], `${path}.${key}`);
      } else entries.push({ path, value });
    }
    for (const root of ['proto', 'com', 'google']) visit(require(pkg)[root], root);
    return { outcome: 'compatible', entries };
  }
  let type = 'Key';
  let input;
  if (name === 'truncated-varint') { type = 'AccountID'; input = Buffer.from([0x18, 0x80]); }
  else if (name === 'truncated-bytes') input = Buffer.from([0x12, 0x02, 0x01]);
  else if (name === 'truncated-message') input = Buffer.from([0x32, 0x02]);
  else if (name === 'nested-length-overrun') input = Buffer.from([0x32, 0x01, 0x0a, 0x02, 0x12, 0x00]);
  else if (name === 'top-length-overrun') input = Buffer.from([0x12, 0x00]);
  else if (name.startsWith('groups-')) {
    const depth = Number(name.split('-')[1]);
    input = Buffer.concat([Buffer.alloc(depth, 0x7b), Buffer.alloc(depth, 0x7c)]); // Unknown field 15.
  } else if (name.startsWith('keys-') || name.startsWith('thresholds-')) {
    const depth = Number(name.split('-')[1]);
    input = bytes(2, Buffer.from([0x2a]));
    // ponytail: repeated concatenation is capped at 8192 synthetic levels; stream larger fixtures if needed.
    for (let i = 0; i < depth; i++) input = name.startsWith('keys-')
      ? bytes(6, bytes(1, input)) : bytes(5, bytes(2, bytes(1, input)));
  } else if (name === 'option-eof') {
    const scoped = createRequire(require.resolve(`${pkg}/package.json`));
    try { scoped('protobufjs').parse('syntax = "proto3"; option unfinished'); return { outcome: 'accepted' }; }
    catch (error) { return { outcome: error instanceof SyntaxError || /illegal|expected|end/i.test(error.message) ? 'rejected' : 'unexpected-error' }; }
  } else throw new Error('Unknown synthetic probe');
  try { proto[type].decode(input, name === 'top-length-overrun' ? 1 : undefined); return { outcome: 'accepted', inputBytes: input.length }; }
  catch (error) {
    // Whitelist classifications only; no arbitrary error, SDK object or stack in evidence.
    const outcome = /call stack/i.test(error.message) ? 'stack-overflow'
      : /maximum nesting depth|recursion limit/i.test(error.message) ? 'depth-rejected'
      : /index out of range|invalid varint|invalid wire type/i.test(error.message) ? 'malformed-rejected'
      : 'unexpected-error';
    return { outcome, inputBytes: input.length };
  }
}

if (process.argv.includes('--probe')) {
  process.stdout.write(JSON.stringify(probe(option('--probe'), process.argv.at(-1))));
} else {
  const lockBytes = readFileSync(new URL('../../package-lock.json', import.meta.url));
  const lock = JSON.parse(lockBytes).packages;
  const resolutions = parents.map(parent => {
    const scoped = createRequire(require.resolve(`${parent}/package.json`));
    const path = scoped.resolve('protobufjs/package.json');
    return { parent, parentVersion: require(`${parent}/package.json`).version,
      path: path.slice(path.indexOf('/node_modules/') + 1).replace('/package.json', ''),
      version: scoped('protobufjs/package.json').version,
      runtimeRecursionLimit: scoped('protobufjs/minimal').Reader.recursionLimit ?? null };
  });
  const result = { schemaVersion: 1, kind: 'offline-protobuf-security-gate',
    baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    node: process.version, lockSha256: hash(lockBytes), timeoutMsPerChild: timeout,
    syntheticOnly: true, resolutions, decoderSources: protos.map(pkg => ({ package: pkg,
      sha256: hash(readFileSync(new URL('proto.js', `file://${require.resolve(pkg)}`))) })),
    cases: [], versionGate: process.argv.includes('--candidate') ? 'pending' : 'not-requested', securityGate: 'pending' };
  const baseline = process.argv.includes('--compare') ? JSON.parse(readFileSync(option('--compare'))) : undefined;
  if (process.argv.includes('--candidate')) test('only approved runtime versions are installed', () => {
    result.versionGate = 'failed';
    assert.deepEqual(resolutions.map(r => r.parentVersion), ['2.64.5', '2.18.5', '2.25.0', '2.79.0']);
    for (const r of resolutions) assert.equal(r.version, '7.6.6');
    for (const [path, entry] of Object.entries(lock)) if (path.endsWith('/protobufjs')) assert.equal(entry.version, '7.6.6');
    result.versionGate = 'passed';
  });
  for (const pkg of protos) {
    for (const [name, expected] of [
      ['compatibility', 'compatible'], ['public-api', 'compatible'], ['truncated-varint', 'malformed-rejected'],
      ['truncated-bytes', 'malformed-rejected'], ['truncated-message', 'malformed-rejected'],
      ['groups-4', 'accepted'], ['groups-128', 'depth-rejected'], ['groups-8192', 'depth-rejected'],
      ['keys-4', 'accepted'], ['keys-128', 'depth-rejected'], ['keys-8192', 'depth-rejected'],
      ['thresholds-4', 'accepted'], ['thresholds-128', 'depth-rejected'], ['thresholds-8192', 'depth-rejected'],
      ['nested-length-overrun', 'malformed-rejected'], ['top-length-overrun', 'malformed-rejected'],
      ['option-eof', 'rejected'],
    ]) test(`${pkg}: ${name}`, () => {
      const child = spawnSync(process.execPath, ['--max-old-space-size=128', file, '--probe', pkg, name], {
        encoding: 'utf8', timeout, killSignal: 'SIGKILL', maxBuffer: 1048576,
      });
      let observed;
      if (child.error?.code === 'ETIMEDOUT') observed = { outcome: 'timeout' };
      else if (child.status !== 0) observed = { outcome: 'child-failed', exitCode: child.status, signal: child.signal };
      else { try { observed = JSON.parse(child.stdout); } catch { observed = { outcome: 'invalid-child-output' }; } }
      const entry = { package: pkg, name, expected, ...observed, passed: observed.outcome === expected };
      if (['compatibility', 'public-api'].includes(name) && baseline) {
        const old = baseline.cases.find(c => c.package === pkg && c.name === name);
        const field = name === 'compatibility' ? 'fixtures' : 'entries';
        entry.baselineMatches = JSON.stringify(old?.[field]) === JSON.stringify(observed[field]);
        entry.passed &&= entry.baselineMatches;
      }
      result.cases.push(entry);
      assert.equal(entry.passed, true, `${pkg}/${name}: expected ${expected}, observed ${observed.outcome}`);
    });
  }
  after(() => {
    result.securityGate = ['passed', 'not-requested'].includes(result.versionGate)
      && result.cases.length === 34 && result.cases.every(c => c.passed) ? 'passed' : 'failed';
    if (process.argv.includes('--record')) writeFileSync(option('--record'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
  });
}

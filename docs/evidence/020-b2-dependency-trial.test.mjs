// Bounded synthetic security/caller checks. No keys, signer or valid signatures.
// B2_PROJECT=/absolute/scratch/project node --test this-file
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { createServer, Agent as HttpAgent } from 'node:http';

assert(process.env.B2_PROJECT, 'Supply the isolated package root');
const project = process.env.B2_PROJECT;
const from = parent => createRequire(join(project, 'node_modules', parent, 'package.json'));
const load = (parent, name) => from(parent)(name);
const tar = () => load('@mapbox/node-pre-gyp', 'tar');
const toml = () => load('neon-cli', 'toml');
const tmp = () => load('external-editor', 'tmp');
const fixture = () => mkdtempSync(join(tmpdir(), 'holdbook-b2-check-'));

// Minimal ustar fixture encoder: fixed public text, no input archive extraction.
function entry(path, body = '', type = '0', link = '') {
  body = Buffer.from(body);
  const h = Buffer.alloc(512);
  h.write(path, 0, 100); h.write('0000644\0', 100); h.write('0000000\0', 108);
  h.write('0000000\0', 116); h.write(body.length.toString(8).padStart(11, '0') + '\0', 124);
  h.write('00000000000\0', 136); h.fill(32, 148, 156); h.write(type, 156);
  h.write(link, 157, 100); h.write('ustar\0', 257); h.write('00', 263);
  h.write([...h].reduce((a, b) => a + b, 0).toString(8).padStart(6, '0') + '\0 ', 148);
  return Buffer.concat([h, body, Buffer.alloc((512 - body.length % 512) % 512)]);
}
const archive = (...entries) => Buffer.concat([...entries, Buffer.alloc(1024)]);
function pax(key, value) {
  const text = ` ${key}=${value}\n`;
  let size = Buffer.byteLength(text) + 1;
  while (String(size).length + Buffer.byteLength(text) !== size) size = String(size).length + Buffer.byteLength(text);
  return `${size}${text}`;
}

const probes = {
  async 'tar-longpath'() {
    const dir = fixture();
    try {
      const file = join(dir, 'long.tar');
      writeFileSync(file, archive(entry('././@LongLink', 'a/'.repeat(12000) + 'file\0', 'L'), entry('file')));
      await tar().t({ file }, ['selected']);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  },
  async 'tar-pax'() {
    for (const [key, value] of [['path', 'bad\0name'], ['path', '12'], ['size', '-1']]) {
      const dir = fixture();
      try {
        const file = join(dir, 'pax.tar');
        writeFileSync(file, archive(entry('PaxHeader', pax(key, value), 'x'), entry('safe', 'ok')));
        // A malformed archive may reject or warn; it must not crash outside the promise.
        try { await tar().t({ file }); } catch (error) { assert(error instanceof Error); }
      } finally { rmSync(dir, { recursive: true, force: true }); }
    }
  },
  async 'tar-ratio'() {
    const dir = fixture();
    try {
      const file = join(dir, 'ratio.tgz');
      writeFileSync(file, gzipSync(archive(entry('zeros', Buffer.alloc(256 * 1024)))));
      await assert.rejects(tar().t({ file, maxDecompressionRatio: 8 }), /decompression ratio/);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  },
  'toml-depth'() {
    for (const input of ['a=' + '['.repeat(4000) + '0' + ']'.repeat(4000),
      'a=' + '{a='.repeat(2000) + '0' + '}'.repeat(2000)]) {
      assert.throws(() => toml().parse(input), error => !(error instanceof RangeError) &&
        Number.isInteger(error.line) && Number.isInteger(error.column) && /nesting depth/i.test(error.message));
    }
  },
  'toml-prototype'() {
    try {
      for (const path of ['[a.b]\ny=1\n[a.b.y.__proto__.__proto__]', 'aa=1\n[[a]]\n[aa.__proto__.__proto__]']) {
        try { toml().parse(path + '\nholdbookB2 = "changed"'); } catch (error) { assert(error instanceof Error); }
        assert.equal({}.holdbookB2, undefined);
      }
      const parsed = toml().parse('[normal]\nvalue = 7');
      assert.equal(parsed.normal.value, 7);
    } finally { delete Object.prototype.holdbookB2; }
  },
};

const probe = process.argv.find(arg => arg.startsWith('--probe='))?.slice(8);
if (probe) {
  assert(probes[probe]); await probes[probe]();
} else {
  for (const name of Object.keys(probes)) test(name, () => {
    const child = spawnSync(process.execPath, ['--max-old-space-size=128', fileURLToPath(import.meta.url), '--probe=' + name],
      { encoding: 'utf8', timeout: 12000, maxBuffer: 200000 });
    assert.equal(child.status, 0, `${name}: ${child.error?.code ?? child.signal ?? child.stderr.slice(-1800)}`);
  });

  test('tar extraction keeps traversal/links inside the fixture and preserves strip/onentry API', async () => {
    const dir = fixture(), output = join(dir, 'output'); mkdirSync(output);
    writeFileSync(join(dir, 'sentinel'), 'unchanged');
    try {
      let entries = 0;
      const data = archive(entry('package/ok.txt', 'ok'), entry('../escape', 'bad'),
        entry('package/link', '', '2', '../../'), entry('package/hard', '', '1', 'package/link/sentinel'));
      await pipeline(Readable.from([data]), tar().extract({ cwd: output, strip: 1, onentry: () => entries++ }));
      assert.equal(readFileSync(join(output, 'ok.txt'), 'utf8'), 'ok');
      assert(entries >= 1); assert.equal(readFileSync(join(dir, 'sentinel'), 'utf8'), 'unchanged');
      assert(!existsSync(join(dir, 'escape'))); assert(!existsSync(join(output, 'hard')));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test('tar honors extraction depth and metadata size limits', async () => {
    const dir = fixture();
    try {
      const data = archive(entry('a/b/c/d/file', 'bad'));
      await pipeline(Readable.from([data]), tar().extract({ cwd: dir, maxDepth: 2 }));
      assert(!existsSync(join(dir, 'a/b/c/d/file')));
      let ignored = 0;
      const parser = new (tar().Parser ?? tar().Parse)({ maxMetaEntrySize: 16 });
      parser.on('ignoredEntry', () => ignored++); parser.on('entry', e => e.resume());
      parser.end(archive(entry('meta', pax('path', 'a'.repeat(200)), 'x')));
      assert.equal(ignored, 1);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test('node-pre-gyp packaging callback and file extraction promise APIs remain usable', async () => {
    const dir = fixture(); mkdirSync(join(dir, 'package')); mkdirSync(join(dir, 'out'));
    try {
      writeFileSync(join(dir, 'package/fixture.txt'), 'text only; no native binary');
      const file = join(dir, 'fixture.tgz');
      await new Promise((done, reject) => tar().create({ file, cwd: dir, gzip: true, portable: false },
        ['package/fixture.txt'], error => error ? reject(error) : done()));
      await tar().extract({ file, cwd: join(dir, 'out'), strip: 1 });
      assert.equal(readFileSync(join(dir, 'out/fixture.txt'), 'utf8'), 'text only; no native binary');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test('neon reads an ordinary Cargo lib name with the selected TOML parser', () => {
    const dir = fixture(); mkdirSync(join(dir, 'native'));
    try {
      writeFileSync(join(dir, 'native/Cargo.toml'), '[package]\nname="example"\nversion="0.1.0"\n[lib]\nname="fixture"\n');
      const Crate = load('neon-cli', './lib/crate.js').default;
      assert.equal(new Crate({ root: dir }).name, 'fixture');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test('tmp rejects escaping prefix and symlink directory; external-editor still cleans up', () => {
    const dir = fixture(); mkdirSync(join(dir, 'inside')); mkdirSync(join(dir, 'outside'));
    const api = tmp();
    try {
      symlinkSync(join(dir, 'outside'), join(dir, 'inside/link'));
      for (const options of [
        { tmpdir: dir, dir: join(dir, 'inside'), prefix: '../outside/escaped' },
        { tmpdir: join(dir, 'inside'), dir: join(dir, 'inside/link') },
      ]) {
        let accepted = false;
        try { const file = api.fileSync(options); accepted = true; file.removeCallback(); } catch {}
        assert.equal(accepted, false, 'Escape must reject, not create a file');
      }
    } finally { rmSync(dir, { recursive: true, force: true }); }
    const { ExternalEditor } = load('external-editor', './main/index.js');
    // Exercise file creation/cleanup only. Never launches an editor or reads its profile.
    const e = Object.create(ExternalEditor.prototype);
    e.text = 'synthetic'; e.fileOptions = {};
    e.createTemporaryFile();
    assert.equal(readFileSync(e.tempFile, 'utf8'), 'synthetic');
    e.cleanup(); assert(!existsSync(e.tempFile));
  });

  test('both Terminal3 UUID callers produce v4 and reject undersized v3/v5/v6 buffers', () => {
    for (const parent of ['@terminal3/vc_core', '@terminal3/bbs_vc']) {
      const uuid = load(parent, 'uuid');
      assert.match(uuid.v4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      for (const fn of [uuid.v3, uuid.v5]) assert.throws(() => fn('fixture', uuid.v5.DNS, new Uint8Array(8), 4), RangeError);
      assert.throws(() => uuid.v6({}, new Uint8Array(8), 4), RangeError);
    }
  });

  test('http-client preserves Agent conversion with controlled local HTTP and abort', async () => {
    const { httpClient } = await import(pathToFileURL(from('@digitalbazaar/http-client').resolve('./lib/index.js')));
    const server = createServer((req, res) => {
      if (req.url === '/wait') return;
      res.setHeader('Content-Type', 'application/json'); res.end('{"fixture":true}');
    });
    await new Promise(done => server.listen(0, '127.0.0.1', done));
    const agent = new HttpAgent({ keepAlive: false });
    try {
      const url = `http://127.0.0.1:${server.address().port}`;
      const response = await httpClient.get(url, { agent, retry: 0 });
      assert.equal(response.data.fixture, true);
      await assert.rejects(httpClient.get(url + '/wait', { agent, retry: 0, signal: AbortSignal.timeout(100) }));
    } finally { agent.destroy(); server.closeAllConnections(); await new Promise(done => server.close(done)); }
  });

  test('Undici rejects control characters in blob content type before a request', async () => {
    const { Request } = load('@digitalbazaar/http-client', 'undici');
    const body = { size: 0, type: 'text/plain\r\nx-fixture: injected',
      stream() { return new ReadableStream({ start(c) { c.close(); } }); },
      arrayBuffer: async () => new ArrayBuffer(0), [Symbol.toStringTag]: 'Blob' };
    assert.throws(() => new Request('http://127.0.0.1/', { method: 'POST', body }));
  });

  test('Undici rejects cookie domain attribute injection', () => {
    const { Headers, setCookie } = load('@digitalbazaar/http-client', 'undici');
    assert.throws(() => setCookie(new Headers(), {
      name: 'fixture', value: 'ok', domain: 'example.test; Secure',
    }));
    const headers = new Headers(); setCookie(headers, { name: 'fixture', value: 'ok', domain: 'example.test' });
    assert.match(headers.get('set-cookie'), /Domain=example.test/);
  });

  test('public Terminal3 payload/verifier: malformed, missing proof and expired rejected without a signer', async () => {
    const { verifyVc } = load('@terminal3/verify_vc', '@terminal3/verify_vc');
    const { prepareCredentialPayload, DID } = load('@terminal3/vc_core', '@terminal3/vc_core');
    const issuer = new DID('ethr', '0x' + '1'.repeat(40));
    const subject = new DID('ethr', '0x' + '2'.repeat(40));
    const payload = await prepareCredentialPayload(['SyntheticKyc'], issuer, subject,
      { passed: true }, new Date('2020-01-01'), new Date('2020-01-02'));
    assert.equal(payload.issuer, issuer.did); assert.equal(payload.credentialSubject.id, subject.did);
    await assert.rejects(verifyVc(payload), /Proof/);
    const missing = await verifyVc({ ...payload, proof: { type: 'EcdsaSecp256k1Signature2019' } });
    assert.equal(missing.isValid, false);
    // Deliberately invalid marker reaches expiry check; no signature was fabricated or validated.
    const expired = await verifyVc({ ...payload, proof: { type: 'EcdsaSecp256k1Signature2019', proofValue: 'invalid-marker' } });
    assert.equal(expired.isValid, false); assert.match(expired.message, /expired/);
    await assert.rejects(verifyVc({ ...payload, proof: { type: 'Unsupported' } }), /Unsupported/);
  });
}

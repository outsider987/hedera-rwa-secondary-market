// Capture rendered membership without changing the browser-tested dist files.
// node docs/evidence/009-t01b-2-bundle.mjs NEW-output.json
import assert from 'node:assert/strict';
import { build } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
assert.ok(process.argv[2], 'Supply a new evidence path');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const lock = JSON.parse(readFileSync('package-lock.json')).packages;
const packages = new Map();
const assets = [], forbiddenModules = [];
let renderedModules = 0;
const built = await build({ build: { write: false } });
for (const output of Array.isArray(built) ? built : [built]) {
  for (const item of output.output) {
    const bytes = Buffer.from(item.type === 'chunk' ? item.code : item.source);
    assert.equal(sha256(bytes), sha256(readFileSync(`dist/${item.fileName}`)), 'Must match browser-tested build');
    assets.push({ file: item.fileName, bytes: bytes.length, sha256: sha256(bytes) });
    if (item.type !== 'chunk') continue;
    for (const [id, info] of Object.entries(item.modules)) {
      if (!info.renderedLength) continue;
      renderedModules++;
      if (/asset-tokenization|protobuf|terminal3/i.test(id)) forbiddenModules.push(id);
      const start = id.indexOf('/node_modules/');
      if (start < 0) continue;
      const path = id.slice(start + 1).match(/^(.*node_modules\/(?:@[^/]+\/)?[^/]+)/)?.[1];
      assert.ok(path && lock[path], 'Rendered package must be in the unchanged lockfile');
      packages.set(path, { path, version: lock[path].version });
    }
  }
}
assert.deepEqual(forbiddenModules, []);
writeFileSync(process.argv[2], `${JSON.stringify({
  method: 'Vite final build output: all chunks, renderedLength > 0; hashes match dist. Zero membership does not waive installation or future integration risks.',
  assets, renderedModules, packages: [...packages.values()].sort((a,b) => a.path.localeCompare(b.path)), forbiddenModules,
}, null, 2)}\n`, { flag: 'wx' });

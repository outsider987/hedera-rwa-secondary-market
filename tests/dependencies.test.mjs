import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { posix } from 'node:path';

const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url)));
test('six scoped repair edges are pinned, including absent optional packages', () => {
  const { packages } = read('package-lock.json');
  const manifest = read('package.json');
  const overrides = read('docs/evidence/019-b2-vc-readiness.json').candidate.overrides;
  for (const [parent, children] of Object.entries(overrides)) {
    assert.deepEqual(manifest.overrides[parent], children);
    const path = 'node_modules/' + parent.slice(0, parent.lastIndexOf('@'));
    assert.equal(packages[path].version, parent.slice(parent.lastIndexOf('@') + 1));
    for (const [name, version] of Object.entries(children)) {
      let target;
      for (let dir = path; ; dir = posix.dirname(dir)) {
        const candidate = (dir === '.' ? '' : dir + '/') + 'node_modules/' + name;
        if (packages[candidate]) { target = candidate; break; }
        assert.notEqual(dir, '.', `Missing ${parent} → ${name}`);
      }
      assert.equal(packages[target].version, version);
      if (existsSync(new URL('../' + target + '/package.json', import.meta.url))) {
        assert.equal(read(target + '/package.json').version, version);
      }
    }
  }
  for (const [name, version] of Object.entries({ '@terminal3/vc_core': '0.0.19', '@terminal3/verify_vc': '0.0.20', ethers: '6.17.0' })) {
    assert.equal(manifest.dependencies[name], version);
    assert.equal(packages[''].dependencies[name], version);
  }
});

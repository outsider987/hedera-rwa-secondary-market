// Verify the retained delta against the complete accepted trial, without editing a lock.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const read = p => JSON.parse(readFileSync(p));
const trial = read('docs/evidence/020-b2-dependency-trial.json');
const before = JSON.parse(execFileSync('git', ['show', '2001f13:package-lock.json']));
const after = read('package-lock.json');
const delta = [...new Set([...Object.keys(before.packages), ...Object.keys(after.packages)])].sort()
  .filter(p => p && JSON.stringify(before.packages[p]) !== JSON.stringify(after.packages[p]))
  .map(path => ({ path, before: before.packages[path] ?? null, after: after.packages[path] ?? null }));
assert.deepEqual(delta, [...trial.lockDelta].sort((a,b) => a.path.localeCompare(b.path, 'en'))
  .sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
const root = structuredClone(after.packages['']);
delete root.dependencies['@terminal3/vc_core']; delete root.dependencies['@terminal3/verify_vc'];
assert.deepEqual(root, before.packages['']);
console.log(JSON.stringify({ verifiedScopedLocations: delta.length, rootDirectPins: 2 }));
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify({ schemaVersion: 1,
  based_on_commit: execFileSync('git', ['rev-parse','HEAD'], { encoding:'utf8' }).trim(),
  date: new Date().toISOString(), scope: 'desktop Chrome + MetaMask ECDSA; native BBS excluded',
  lockSha256: createHash('sha256').update(readFileSync('package-lock.json')).digest('hex'),
  delta, rootDirectPins: { '@terminal3/vc_core': '0.0.19', '@terminal3/verify_vc': '0.0.20' },
}, null, 2) + '\n', { flag: 'wx' });

// Public metadata/source inspection only. Never imports SDK, VC or wallet code.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { posix } from 'node:path';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const lock = read('package-lock.json');
const baseline = read('docs/evidence/018-t01b-4-sdk-integration.json');
const audit = read(process.argv[2]);
const output = process.argv[3];
assert(output && !existsSync(output), 'Use a new output path; preserve prior evidence.');
assert(audit.vulnerabilities && audit.metadata, 'A completed npm audit JSON is required.');

function resolve(packages, from, name) {
  for (let dir = from; ; dir = posix.dirname(dir)) {
    const path = (dir === '.' ? '' : dir + '/') + 'node_modules/' + name;
    if (packages[path]) return path;
    if (dir === '.') return null;
  }
}
// One small runnable check covers nested resolution, scoped parents and missing edges.
const fixture = { 'node_modules/a/node_modules/b': {}, 'node_modules/b': {} };
assert.equal(resolve(fixture, 'node_modules/a', 'b'), 'node_modules/a/node_modules/b');
assert.equal(resolve(fixture, 'node_modules/@scope/a', 'b'), 'node_modules/b');
assert.equal(resolve(fixture, 'node_modules/a', 'missing'), null);

const roots = Object.keys(lock.packages).filter(p => /^node_modules\/@terminal3\/[^/]+$/.test(p));
assert.equal(roots.length, 6);
const seen = new Set();
const edges = [];
const queue = [...roots];
while (queue.length) {
  const path = queue.pop();
  if (seen.has(path)) continue;
  seen.add(path);
  const entry = lock.packages[path];
  for (const kind of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const [name, range] of Object.entries(entry[kind] || {})) {
      const target = resolve(lock.packages, path, name);
      edges.push({ from: path, kind, name, range, target });
      assert(target || kind !== 'dependencies', `Missing required edge: ${path} -> ${name}`);
      if (target) queue.push(target);
    }
  }
}
const packages = [...seen].sort().map(path => {
  const p = lock.packages[path];
  return { path, version: p.version, license: p.license ?? null, optional: !!p.optional,
    installed: existsSync(path + '/package.json'), integrity: p.integrity,
    dependencies: p.dependencies, optionalDependencies: p.optionalDependencies,
    peerDependencies: p.peerDependencies, engines: p.engines,
    hasInstallScript: !!p.hasInstallScript,
    priorBundle: baseline.bundle.packages.find(x => x.path === path) ?? null };
});
const affected = Object.fromEntries(Object.entries(audit.vulnerabilities)
  .filter(([, v]) => v.nodes.some(p => seen.has(p))));
const sources = [
  '@terminal3/verify_vc/src/verifyVC.ts', '@terminal3/verify_vc_core/src/verifyVC.ts',
  '@terminal3/ecdsa_vc/src/verifyEcdsaVc.ts', '@terminal3/ecdsa_vc/src/issueEcdsaVc.ts',
  '@terminal3/ecdsa_vc/src/utils.ts', '@terminal3/vc_core/src/prepareCredentialPayload.ts',
  '@terminal3/revoke_vc/src/revokeVC.ts', '@mattrglobal/bbs-signatures/lib/index.js',
  '@mattrglobal/bbs-signatures/lib/index.web.js',
  '@hashgraph/asset-tokenization-sdk/build/esm/src/domain/context/kyc/Terminal3.js',
  '@hashgraph/asset-tokenization-sdk/build/esm/src/app/usecase/command/security/kyc/grantKyc/GrantKycCommandHandler.js',
].map(p => 'node_modules/' + p);

const candidates = { tar: '7.5.22', uuid: '11.1.1', tmp: '0.2.7', toml: '4.2.0', undici: '6.28.0' };
const names = [...roots.map(p => p.slice('node_modules/'.length)),
  '@mattrglobal/bbs-signatures', '@mattrglobal/node-bbs-signatures', '@mapbox/node-pre-gyp',
  ...Object.keys(candidates), 'jsonld'];
const registry = await Promise.all(names.map(async name => {
  const url = 'https://registry.npmjs.org/' + encodeURIComponent(name);
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000), redirect: 'error' });
  assert(response.ok, `Registry HTTP ${response.status}`);
  const body = await response.json();
  const project = p => ({ version: p.version, license: p.license, dependencies: p.dependencies,
    optionalDependencies: p.optionalDependencies, engines: p.engines, main: p.main,
    exports: p.exports, repository: p.repository, integrity: p.dist?.integrity });
  const version = candidates[name];
  if (version) assert(body.versions[version], `Candidate unpublished: ${name}@${version}`);
  return { name, url, latest: project(body.versions[body['dist-tags'].latest]),
    candidate: version ? project(body.versions[version]) : null };
}));
const advisoryKeys = vulnerabilities => [...new Set(Object.values(vulnerabilities)
  .flatMap(v => v.via.filter(x => typeof x === 'object').map(x => `${x.source}:${x.range}`)))].sort();
const before = advisoryKeys(baseline.audit.vulnerabilities);
const after = advisoryKeys(audit.vulnerabilities);
const result = {
  schemaVersion: 1, date: new Date().toISOString(),
  based_on_commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  kind: 'source-and-dependency-research; no VC runtime or signature',
  hashes: Object.fromEntries(['package.json', 'package-lock.json', 'scripts/rebuild-proto.mjs',
    'scripts/patch-ats-readonly.mjs', ...sources].map(p => [p, sha(p)])),
  roots, packages, edges, affected, registry,
  audit: { metadata: audit.metadata, vulnerabilities: audit.vulnerabilities,
    addedAdvisoryRanges: after.filter(x => !before.includes(x)),
    removedAdvisoryRanges: before.filter(x => !after.includes(x)) },
  summary: { packageLocations: packages.length, installed: packages.filter(p => p.installed).length,
    affectedEntries: Object.keys(affected).length,
    missingLicenseMetadata: packages.filter(p => !p.license).map(p => p.path),
    renderedInPriorBundle: packages.filter(p => p.priorBundle).length },
  limits: ['Registry versions are candidates, not tested compatible repairs.',
    'Bundle membership is historical evidence 018; no changed application bundle.',
    'Native optional installation absence does not waive lockfile or cross-platform risks.',
    'All original VC, MetaMask and NOVA acceptance gates remain open.'],
};
writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(result.summary));

// Offline reproduction using the pinned npm's own Arborist; no package install.
// node --test docs/evidence/013-t01a-npm-resolution.test.mjs
// RESOLUTION_GATE=hoisted node --test ... intentionally fails the desired gate.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const npmRoot = execFileSync('npm', ['root', '--global'], { encoding: 'utf8' }).trim();
const require = createRequire(join(npmRoot, 'npm/package.json'));
const npm = require('./package.json');
const Node = require('@npmcli/arborist/lib/node.js');
const PlaceDep = require('@npmcli/arborist/lib/place-dep.js');
const { KEEP } = require('@npmcli/arborist/lib/can-place-dep.js');
const Arborist = require('@npmcli/arborist');
assert.equal(npm.version, '11.17.0', 'Diagnostic is pinned to npm 11.17.0');

function fixture() {
  const root = new Node({ path: '/synthetic-project', loadOverrides: true, pkg: {
    name: 'synthetic-project', version: '1.0.0',
    dependencies: { '@hashgraph/proto': '2.18.5', protobufjs: '7.6.6' },
    overrides: { '@hashgraph/proto@2.18.5': { 'protobufjs@7.2.5': '7.6.6' } },
  } });
  const parent = new Node({ parent: root, pkg: {
    name: '@hashgraph/proto', version: '2.18.5', dependencies: { protobufjs: '7.2.5' },
  } });
  const old = new Node({ parent, pkg: {
    name: 'protobufjs', version: '7.2.5', dependencies: { long: '^5.2.3' },
  } });
  const current = new Node({ parent: root, pkg: {
    name: 'protobufjs', version: '7.6.6', dependencies: { long: '^5.3.2' },
  } });
  const edge = parent.edgesOut.get('protobufjs');
  const replacement = new Node({ path: '/synthetic-candidate',
    pkg: current.package, overrides: edge.overrides });
  return { root, old, current, edge, replacement };
}

test('hoisting keeps an invalid nested dependency when override sets prevent pruning', () => {
  const { old, current, edge, replacement } = fixture();
  assert.equal(edge.spec, '7.6.6');
  assert.equal(edge.valid, false);
  assert.equal(edge.satisfiedBy(current), true);
  assert.equal(current.overrides.isEqual(old.overrides), false);
  assert.equal(current.canReplace(old), false);
  assert.equal(old.canDedupe(true), false);
  const placement = new PlaceDep({ edge, dep: replacement,
    installStrategy: 'hoisted', updateNames: ['protobufjs'] });
  assert.equal(placement.canPlace.canPlaceSelf, KEEP);
  assert.equal(edge.to.version, '7.2.5');
  assert.equal(edge.valid, false);
});

test('targeted nested placement satisfies the original overridden dependency edge', () => {
  const { edge, replacement } = fixture();
  new PlaceDep({ edge, dep: replacement,
    installStrategy: process.env.RESOLUTION_GATE || 'nested', updateNames: ['protobufjs'] });
  assert.equal(edge.to.version, '7.6.6');
  assert.equal(edge.valid, true);
});

test('candidate project resolves all four parents without downgrading gRPC',
  { skip: !process.env.RESOLUTION_PROJECT }, async () => {
    const tree = await new Arborist({ path: process.env.RESOLUTION_PROJECT }).loadVirtual();
    const names = ['@hashgraph/sdk', '@hashgraph/proto', '@hiero-ledger/sdk', '@hiero-ledger/proto'];
    for (const name of names) {
      const parents = [...tree.inventory.query('name', name)];
      assert.equal(parents.length, 1);
      const edge = parents[0].edgesOut.get('protobufjs');
      assert.equal(edge.to.version, '7.6.6', name);
      assert.equal(edge.valid, true, name);
    }
    const grpc = [...tree.inventory.query('name', '@grpc/proto-loader')];
    assert.ok(grpc.length > 0);
    for (const node of grpc) {
      const edge = node.edgesOut.get('protobufjs');
      assert.equal(edge.to.version, '7.6.6');
      assert.equal(edge.valid, true);
    }
  });

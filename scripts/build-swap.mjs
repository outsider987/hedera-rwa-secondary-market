// Reproducible local compilation only. Never deploy or instantiate a signer.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

assert.match(execFileSync('forge', ['--version'], {encoding:'utf8'}), /^forge Version: 1\.7\.1\n/);
assert.equal(JSON.parse(readFileSync('node_modules/@hashgraph/asset-tokenization-contracts/package.json')).version, '8.0.0');
execFileSync('forge', ['build'], {stdio:'inherit'});
const artifact = JSON.parse(readFileSync('.artifacts/swap/out/NovaHbarSwap.sol/NovaHbarSwap.json'));
const metadata = typeof artifact.metadata === 'string' ? JSON.parse(artifact.metadata) : artifact.metadata;
assert.match(metadata.compiler.version, /^0\.8\.36\+/);
assert.equal(metadata.settings.evmVersion, 'paris');
assert.deepEqual(artifact.bytecode.linkReferences, {});
const refs = Object.values(artifact.deployedBytecode.immutableReferences);
assert.equal(refs.length, 1, 'Only expiry may be immutable.');
assert.ok(refs[0].every(r => r.length === 32));
const result = {
  compiler:metadata.compiler.version, foundry:'1.7.1', evmVersion:'paris',
  sourceSha256:createHash('sha256').update(readFileSync('contracts/NovaHbarSwap.sol')).digest('hex'),
  abi:artifact.abi, bytecode:artifact.bytecode.object, runtime:artifact.deployedBytecode.object,
  expiryReferences:refs[0],
};
const path='src/data/swap-artifact.json', text=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--check')) assert.equal(readFileSync(path,'utf8'),text,'Regenerate the stale swap artifact.');
else writeFileSync(path,text);
console.log(process.argv.includes('--check') ? 'Swap artifact matches pinned source/build.' : 'Swap artifact generated.');

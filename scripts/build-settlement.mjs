// Local compilation only; no broadcast, signer or chain mutation.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
assert.match(execFileSync('forge',['--version'],{encoding:'utf8'}),/^forge Version: 1\.7\.1\n/);
for(const [p,v] of [['@hashgraph/asset-tokenization-contracts','8.0.0'],['@openzeppelin/contracts','5.6.1']])assert.equal(JSON.parse(readFileSync(`node_modules/${p}/package.json`)).version,v);
execFileSync('forge',['build'],{stdio:'inherit'});
const a=JSON.parse(readFileSync('.artifacts/swap/out/NovaSettlement.sol/NovaSettlement.json'));
const m=typeof a.metadata==='string'?JSON.parse(a.metadata):a.metadata;
assert.match(m.compiler.version,/^0\.8\.36\+/);assert.equal(m.settings.evmVersion,'paris');
assert.deepEqual(a.bytecode.linkReferences,{});assert.deepEqual(a.deployedBytecode.immutableReferences ?? {},{});
const {HoldByPartitionFacet__factory,IAsset__factory}=await import('@hashgraph/asset-tokenization-contracts');
const artifact={atsAbi:[...HoldByPartitionFacet__factory.abi,...IAsset__factory.abi.filter(x=>x.type==='function'&&['getConfigInfo','totalSupply','getMaxSupply','balanceOf'].includes(x.name))],compiler:m.compiler.version,foundry:'1.7.1',evmVersion:'paris',sourceSha256:createHash('sha256').update(readFileSync('contracts/NovaSettlement.sol')).digest('hex'),abi:a.abi,bytecode:a.bytecode.object,runtime:a.deployedBytecode.object};
const result=JSON.stringify(artifact,null,2)+'\n',path='src/settlement-artifact.json';
if(process.argv.includes('--check'))assert.equal(readFileSync(path,'utf8'),result,'Regenerate settlement artifact');else writeFileSync(path,result);
const enginePath='engine/settlement-artifact.json';
if(process.argv.includes('--check'))assert.equal(readFileSync(enginePath,'utf8'),result);else writeFileSync(enginePath,result);
console.log('Settlement artifact verified.');

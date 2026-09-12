import test from 'node:test';
import assert from 'node:assert/strict';
import {keccak256,toUtf8Bytes} from 'ethers';
import {allowedSource,maskImmutable,makePayload} from '../scripts/verify-public-contracts.mjs';

test('source publication accepts only declared Solidity source locations',()=>{
  for(const name of ['contracts/NovaSettlement.sol','contracts/NovaHbarSwap.sol','node_modules/@openzeppelin/contracts/utils/StorageSlot.sol']) assert.equal(allowedSource(name),name);
  for(const name of ['.env','/etc/passwd','contracts/../../.env','contracts/test/keys.sol','node_modules/.env','contracts\\NovaSettlement.sol']) assert.throws(()=>allowedSource(name));
});
test('immutable masking preserves code and rejects invalid spans',()=>{
  const a='0x12'+'aa'.repeat(32)+'34',b='0x12'+'bb'.repeat(32)+'34';
  assert.equal(maskImmutable(a,{x:[{start:1,length:32}]}),maskImmutable(b,{x:[{start:1,length:32}]}));
  assert.notEqual(maskImmutable(a),maskImmutable(b));
  assert.throws(()=>maskImmutable(a,{x:[{start:3,length:32}]}));
  assert.throws(()=>maskImmutable(a,{x:[{start:1,length:1}]}));
});
test('publication requires exact source hashes and original compiler settings',()=>{
  const source='// Synthetic source fixture; no signer or credential.';
  const a={metadata:{compiler:{version:'0.8.36+commit.8a079791'},settings:{evmVersion:'paris',optimizer:{enabled:true,runs:200},metadata:{bytecodeHash:'none',appendCBOR:false},compilationTarget:{'contracts/NovaSettlement.sol':'NovaSettlement'}},sources:{'contracts/NovaSettlement.sol':{keccak256:keccak256(toUtf8Bytes(source))}}}};
  assert.equal(makePayload(a,{name:'NovaSettlement'},()=>source).sources['contracts/NovaSettlement.sol'],source);
  assert.throws(()=>makePayload(a,{name:'NovaSettlement'},()=>source+'changed'));
  const altered=structuredClone(a);altered.metadata.settings.evmVersion='cancun';
  assert.throws(()=>makePayload(altered,{name:'NovaSettlement'},()=>source));
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
test('VC public evidence excludes all credential, proof, signature and arbitrary error data',async()=>{
 const {credentialEvidence}=await import('../src/evidence.ts');
 const data=credentialEvidence({digest:'0x'+'1'.repeat(64),issuer:'did:ethr:0x'+'a'.repeat(40),subject:'did:ethr:0x'+'b'.repeat(40),
 validFrom:'2026-09-06T00:00:00.000Z',validUntil:'2026-09-13T00:05:00.000Z',verified:false,verifier:false,
 credential:{secret:'EXCLUDED'},proof:'EXCLUDED',signature:'EXCLUDED',error:{secret:'EXCLUDED'},transactionHash:'EXCLUDED'});
 assert.equal(data.kind,'credential-verification');assert.equal(data.chainId,296);
 assert.doesNotMatch(JSON.stringify(data),/EXCLUDED|transactionHash|proof|signature|credentialSubject/);
 assert.equal(data.verified,false);
 assert.throws(()=>credentialEvidence({...data,digest:'bad'}));
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(s,c,n) { return n(s.startsWith('./') && c.parentURL?.startsWith(new URL('../src/', import.meta.url).href) && !s.endsWith('.ts') ? new URL(s + '.ts', c.parentURL).href : s,c); } });
const A='0x'+'a'.repeat(40), B='0x'+'b'.repeat(40), C='0x'+'c'.repeat(40);

test('genuine Terminal3 payload, UTF-8 digest signing, rejection and invalid credentials', async () => {
  const { prepareSellerCredential, credentialProblem, verifySellerCredential, signSellerCredential } = await import('../src/credentials.ts');
  const { getAddress, solidityPackedKeccak256, toUtf8Bytes, hexlify } = await import('ethers');
  const now=Date.now(); const prepared=await prepareSellerCredential(A,B,now);
  assert.equal(prepared.payload.issuer,'did:ethr:'+getAddress(A));
  assert.equal(prepared.payload.credentialSubject.id,'did:ethr:'+getAddress(B));
  assert.deepEqual(prepared.payload.credentialSubject,{id:'did:ethr:'+getAddress(B),passed:true});
  assert.equal(Date.parse(prepared.payload.validFrom),now-300_000);
  assert.equal(Date.parse(prepared.payload.validUntil),now+7*86400_000);
  assert.equal(prepared.digest,solidityPackedKeccak256(['string'],[JSON.stringify(prepared.payload)]));
  assert.equal(credentialProblem(prepared.payload,prepared,now),undefined);
  for(const changed of [{validFrom:'invalid'},{validUntil:'2020-01-01'}, {issuer:'did:ethr:'+C},
    {credentialSubject:{id:'did:ethr:'+C,passed:true}}, {credentialSubject:{...prepared.payload.credentialSubject,passed:false}},
    {credentialStatus:{type:'unapproved'}}, {id:'urn:uuid:changed'}]) {
    assert.ok(credentialProblem({...prepared.payload,...changed},prepared,now));
  }
  assert.ok(credentialProblem(prepared.payload,prepared,now+8*86400_000));
  const unsigned=await verifySellerCredential(prepared.payload,prepared);
  assert.equal(unsigned.verified,false); assert.equal(unsigned.verifier,false);
  let calls=0,resolve,checks=0;
  const provider={request: async ({method,params})=>{
    assert.equal(method,'personal_sign'); assert.equal(params[0],hexlify(toUtf8Bytes(prepared.digest)));
    assert.equal(params[1],getAddress(A)); calls++;
    return new Promise(r=>{resolve=r;});
  }};
  const signing=signSellerCredential(prepared,provider,async()=>{checks++;});
  while(!resolve) await new Promise(r=>setImmediate(r));
  await assert.rejects(signSellerCredential(prepared,provider,async()=>{}),/pending/);
  assert.equal(calls,1);resolve('invalid-signature');
  const result=await signing;assert.equal(result.verified,false);assert.ok(checks>=2);
  await assert.rejects(signSellerCredential(prepared,{request:async()=>{throw {code:4001,hidden:'private-marker'};}},async()=>{}),/rejected/);
  let stale=false,late;
  const waiting=signSellerCredential(prepared,{request:async()=>new Promise(r=>late=r)},async()=>{if(stale)throw new Error('Session changed');});
  while(!late)await new Promise(r=>setImmediate(r)); stale=true;late('invalid-signature');
  await assert.rejects(waiting,/Session changed/);
});

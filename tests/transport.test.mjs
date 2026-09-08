import assert from 'node:assert/strict';
import {test} from 'node:test';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
test('T04 shared transport preserves late hash, excludes duplicates, blocks all simulation mutations and delegates one recovery',async()=>{
 const h=await import('../src/hold.ts'),l=await import('../src/lifecycle.ts'),e=await import('../src/evidence.ts'),{createAssetProviders}=await import('../src/transport.ts'),{keccak256}=await import('viem');
 const input=h.createHoldInput({block:'40224162',timestamp:'1788790000'}),calldata=await h.holdCalldata('create-hold',input),hash='0x'+'1'.repeat(64);
 const initial={schemaVersion:1,kind:'t04-transaction',chainId:296,operationId:'transport-fixture',startedAt:new Date().toISOString(),action:'create-hold',status:'awaiting-signature',input,signerRole:'Seller',calldataDigest:keccak256(calldata)};
 const controller=new AbortController();let sends=0,finish;const updates=[];
 const options={wallet:{provider:{request:async()=>{sends++;return new Promise(r=>finish=r)}}},signer:l.accounts.Seller.address,securityAddress:l.securityAddress,calldata,reads:await h.holdSdkReads(input),initial,sanitize:e.holdEvidence,update:r=>updates.push(r),checkCurrent:async()=>{},signal:controller.signal,recoverAfterHash:true,verifyReceipt:h.verifyHoldReceipt};
 const p=await createAssetProviders(options),tx={from:l.accounts.Seller.address,to:l.securityAddress,data:calldata,value:'0x0'};
 for(const method of ['personal_sign','eth_signTypedData_v4','eth_sendRawTransaction','wallet_switchEthereumChain'])await assert.rejects(p.browser.send(method,[]));
 await assert.rejects(p.browser.send('eth_sendTransaction',[{...tx,from:l.accounts.Admin.address}]));assert.equal(sends,0);
 const pending=p.browser.send('eth_sendTransaction',[tx]);while(!finish)await new Promise(r=>setImmediate(r));await assert.rejects(p.browser.send('eth_sendTransaction',[tx]));controller.abort();finish(hash);await pending;
 assert.equal(sends,1);assert.equal(p.getRecord().transactionHash,hash);assert.equal(updates.at(-1).status,'pending');p.close();
 const q=await createAssetProviders({...options,signal:new AbortController().signal,readOnly:true});
 await assert.rejects(q.browser.send('eth_sendTransaction',[tx]));assert.equal(q.wasAttempted(),false);assert.equal(sends,1);q.close();
 const r=await createAssetProviders({...options,signal:new AbortController().signal,wallet:{provider:{request:async()=>hash}}});await r.browser.send('eth_sendTransaction',[tx]);
 await assert.rejects(r.browser.getTransaction(hash),error=>error.code==='CANCELLED');assert.equal(r.getRecord().status,'pending');r.close();
});

test('T05 payable transport preserves late hashes, distinguishes rejection from unknown, serializes tabs and keeps ATS zero-value guards',async()=>{
 const t=await import('../src/trade.ts'),l=await import('../src/lifecycle.ts'),e=await import('../src/evidence.ts'),g=await import('../src/guards.ts'),{createAssetProviders}=await import('../src/transport.ts'),{keccak256}=await import('viem');
 const input={...t.createTradeInput({block:'40243275',timestamp:'1788832446'}),escrow:'0x'+'9'.repeat(40),holdId:'17'},calldata=await t.tradeCalldata('settle',input),hash='0x'+'7'.repeat(64);
 const initial={schemaVersion:1,chainId:296,kind:'t05-transaction',operationId:'t05-pay',startedAt:new Date().toISOString(),action:'settle',status:'awaiting-signature',signerRole:'Buyer',input,calldata,calldataDigest:keccak256(calldata),walletValueWeibars:String(t.walletPrice)};
 const tx={from:l.accounts.Buyer.address,to:input.escrow,data:calldata,value:'0xde0b6b3a7640000',chainId:'0x128'};
 let sends=0,finish;const controller=new AbortController(),updates=[];
 const options={wallet:{provider:{request:async({method,params})=>{assert.equal(method,'eth_sendTransaction');assert.equal(params[0].value,tx.value);sends++;return new Promise(resolve=>finish=resolve);}}},signer:l.accounts.Buyer.address,securityAddress:l.securityAddress,calldata,reads:[],initial,sanitize:e.tradeEvidence,update:r=>updates.push(r),checkCurrent:async()=>{},signal:controller.signal,recoverAfterHash:true,verifyReceipt:t.verifyTradeReceipt,assertContractTransaction:tx=>t.assertTradeTransaction(tx,'settle',input,calldata)};
 const p=await createAssetProviders(options);
 for(const change of [{value:'0x5f5e100'},{chainId:'0x1'},{from:l.accounts.Admin.address},{data:calldata+'00'}])await assert.rejects(p.browser.send('eth_sendTransaction',[{...tx,...change}]));
 assert.equal(sends,0);
 const send=p.browser.send('eth_sendTransaction',[tx]);while(!finish)await new Promise(r=>setImmediate(r));
 await assert.rejects(p.browser.send('eth_sendTransaction',[tx]));controller.abort();finish(hash);await send;
 assert.equal(sends,1);assert.equal(p.getRecord().transactionHash,hash);assert.equal(updates.at(-1).status,'pending');p.close();
 for(const code of [4001,-32603]) {
  const q=await createAssetProviders({...options,signal:new AbortController().signal,wallet:{provider:{request:async()=>{throw {code};}}}});
  await assert.rejects(q.browser.send('eth_sendTransaction',[tx]));assert.equal(q.getRecord().status,code===4001?'rejected':'unknown');assert.equal(q.getRecord().transactionHash,undefined);q.close();
 }
 const q=await createAssetProviders({...options,signal:new AbortController().signal,checkCurrent:async()=>{throw Error('Account changed');}});
 await assert.rejects(q.browser.send('eth_sendTransaction',[tx]));assert.equal(q.wasAttempted(),false);q.close();
 // A mid-request storage failure cannot discard the wallet's returned hash.
 const exported=[],storageFailure=await createAssetProviders({...options,signal:new AbortController().signal,wallet:{provider:{request:async()=>hash}},update:r=>{exported.push(r);if(r.transactionHash)throw Error('Storage unavailable');}});
 await assert.rejects(storageFailure.browser.send('eth_sendTransaction',[tx]));
 assert.equal(storageFailure.getRecord().transactionHash,hash);assert.equal(exported.at(-1).transactionHash,hash);assert.equal(storageFailure.getRecord().status,'unknown');storageFailure.close();
 let finishLock;const lock={request:async(name,options,fn)=>{assert.equal(name,'holdbook-nova-create');return fn(finishLock?null:{name});}};
 const first=g.withTransactionLock(lock,()=>new Promise(r=>finishLock=r));while(!finishLock)await new Promise(r=>setImmediate(r));
 await assert.rejects(g.withTransactionLock(lock,async()=>{}));finishLock();await first;
 const h=await import('../src/hold.ts'),holdInput=h.createHoldInput({block:'40243275',timestamp:'1788832446'}),holdData=await h.holdCalldata('create-hold',holdInput);
 const legacy={schemaVersion:1,chainId:296,kind:'t04-transaction',operationId:'legacy',startedAt:initial.startedAt,action:'create-hold',status:'awaiting-signature',signerRole:'Seller',input:holdInput,calldataDigest:keccak256(holdData)};
 const legacyProvider=await createAssetProviders({...options,initial:legacy,sanitize:e.holdEvidence,signer:l.accounts.Seller.address,calldata:holdData,signal:new AbortController().signal,assertContractTransaction:()=>{throw Error('Must not replace ATS guard');}});
 await assert.rejects(legacyProvider.browser.send('eth_sendTransaction',[{from:l.accounts.Seller.address,to:l.securityAddress,data:holdData,value:tx.value}]));assert.equal(legacyProvider.wasAttempted(),false);legacyProvider.close();
});

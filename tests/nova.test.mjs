import assert from 'node:assert/strict';
import { test } from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('./') && c.parentURL?.startsWith(new URL('../src/',import.meta.url).href) && !/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const A='0x'+'a'.repeat(40), B='0x'+'b'.repeat(40), F='0xd1f118a40f3b02883d35909ef2517e7edd78379d';
const hash='0x'+'1'.repeat(64);
test('NOVA request and calldata are fixed; every mutation field and unexpected method is guarded',async()=>{
 const n=await import('../src/nova.ts');const request=n.novaParameters(A,1);
 assert.equal(request.numberOfShares,'1000');assert.equal(request.decimals,0);assert.equal(request.internalKycActivated,true);
 assert.equal(request.dividendRight,2);assert.equal(request.regulationType,1);assert.equal(request.regulationSubType,0);
 for(const v of [0,-1,1.5,NaN,Infinity,'1']) assert.throws(()=>n.novaParameters(A,v));
 const data=await n.novaCalldata(A,1);const expected={admin:A,factory:F,calldata:data};
 const tx={from:A,to:F,data,value:'0x0',gas:'0xf4240'};n.assertNovaTransaction(tx,expected);
 for(const change of [{from:B},{to:B},{data:data+'00'},{value:'0x1'},{chainId:'0x1'},{nonce:'bad'},{authorizationList:[]}])
   assert.throws(()=>n.assertNovaTransaction({...tx,...change},expected));
 assert.throws(()=>n.assertNovaTransaction(null,expected));
});
test('durable intent and immediate hash persist; reload and unknown never enable duplicate creation',async()=>{
 const n=await import('../src/nova.ts');let raw=null;
 const storage={getItem:()=>raw,setItem:(key,value)=>raw=value,removeItem:()=>{raw=null}};
 assert.equal(n.loadNovaRecord(storage),undefined);assert.equal(n.canCreateNova(undefined),true);
 const r={schemaVersion:1,kind:'nova-create',chainId:296,operationId:'public-operation',startedAt:new Date().toISOString(),admin:A,configVersion:1,calldataDigest:hash,status:'awaiting-signature'};
 n.saveNovaRecord(r,storage);assert.equal(n.canCreateNova(n.loadNovaRecord(storage)),false);
 for(const status of ['unknown','pending','confirmed','mirror-pending','mismatch','complete']){
  n.saveNovaRecord({...r,status,transactionHash:hash},storage);assert.equal(n.canCreateNova(n.loadNovaRecord(storage)),false);
 }
 n.saveNovaRecord({...r,status:'rejected'},storage);assert.equal(n.canCreateNova(n.loadNovaRecord(storage)),true);
 n.saveNovaRecord({...r,credential:{proof:'EXCLUDED'},wallet:'EXCLUDED',error:'EXCLUDED'},storage);assert.doesNotMatch(raw,/EXCLUDED|credential|wallet|error/);
 raw='{';assert.throws(()=>n.loadNovaRecord(storage));
 assert.throws(()=>n.saveNovaRecord(r,{setItem(){},getItem:()=>null}));
 assert.equal(n.isCreationOrigin('http://127.0.0.1:5173',true),false);
 assert.equal(n.isCreationOrigin('http://127.0.0.1:4173',false),false);
 assert.equal(n.isCreationOrigin('http://127.0.0.1:4173',true),true);
});
test('same-origin lock is mandatory and never waits to submit a duplicate',async()=>{
 const n=await import('../src/nova.ts');let held=false,calls=0,release;
 const locks={request:async(name,options,fn)=>{assert.equal(options.ifAvailable,true);if(held)return fn(null);held=true;try{return await fn({name})}finally{held=false}}};
 const one=n.withNovaLock(locks,async()=>{calls++;await new Promise(r=>release=r)});
 while(!release)await new Promise(r=>setImmediate(r));
 await assert.rejects(n.withNovaLock(locks,async()=>calls++),/another tab/);release();await one;assert.equal(calls,1);
 await assert.rejects(n.withNovaLock(undefined,async()=>calls++),/locking/);
});

async function fixtureReceipt() {
 const n=await import('../src/nova.ts');const {Interface}=await import('ethers');const {Factory__factory}=await import('@hashgraph/asset-tokenization-contracts');
 const abi=new Interface(Factory__factory.abi),data=await n.novaCalldata(A,1),decoded=abi.decodeFunctionData('deployEquity',data);
 const event=abi.encodeEventLog(abi.getEvent('EquityDeployed'),[A,B,decoded[0],decoded[1]]);
 const tx={hash,from:A,to:F,input:data,value:'0x0',chainId:'0x128',blockHash:'0x'+'2'.repeat(64),blockNumber:'0x10'};
 const receipt={transactionHash:hash,from:A,to:F,status:'0x1',blockHash:tx.blockHash,blockNumber:tx.blockNumber,logs:[{address:F,...event}]};
 return {n,tx,receipt};
}
test('receipt validation requires successful exact Factory event and canonical transaction/block binding',async()=>{
 const {n,tx,receipt}=await fixtureReceipt();assert.equal((await n.verifyNovaReceipt(hash,A,tx,receipt,1)).address,B);
 for(const change of [{status:'0x0'},{from:B},{to:B},{logs:[]},{logs:[...receipt.logs,...receipt.logs]},{blockHash:undefined},{transactionHash:'0x'+'3'.repeat(64)}])
  await assert.rejects(n.verifyNovaReceipt(hash,A,tx,{...receipt,...change},1));
 await assert.rejects(n.verifyNovaReceipt(hash,A,{...tx,blockHash:undefined},{...receipt,blockHash:undefined},1));
 await assert.rejects(n.verifyNovaReceipt(hash,A,tx,receipt,2));
 await assert.rejects(n.verifyNovaReceipt(hash,A,{...tx,input:await n.novaCalldata(B,1)},receipt,1));
});
test('managed provider serializes concurrent requests; late hash is retained and unsafe methods never reach wallet',async()=>{
 const n=await import('../src/nova.ts'),data=await n.novaCalldata(A,1);let calls=0,resolveSend,stale=false;
 const wallet={roles:{Admin:A,Seller:B,Buyer:'0x'+'c'.repeat(40)},provider:{request:async()=>{calls++;return new Promise(r=>resolveSend=r)}}};
 const review={wallet,calldata:data,configVersion:1}, updates=[];
 const record={schemaVersion:1,kind:'nova-create',chainId:296,operationId:'provider-test',startedAt:new Date().toISOString(),admin:A,configVersion:1,calldataDigest:hash,status:'awaiting-signature'};
 const p=await n.createNovaProviders(review,record,r=>updates.push(r),async()=>{await new Promise(r=>setImmediate(r));if(stale)throw new Error('Session changed')},new AbortController().signal);
 try {
  for(const method of ['personal_sign','eth_sign','wallet_switchEthereumChain','eth_requestAccounts']) await assert.rejects(p.browser.send(method,[]));
  const request={from:A,to:F,data,value:'0x0'};
  const first=p.browser.send('eth_sendTransaction',[request]);
  const second=p.browser.send('eth_sendTransaction',[request]);
  // Attach handlers immediately; a concurrent rejected request must not become unhandled.
  const outcomes=Promise.allSettled([first,second]);
  while(!resolveSend)await new Promise(r=>setImmediate(r));
  await new Promise(r=>setTimeout(r,20));assert.equal(calls,1);stale=true;resolveSend(hash);
  const settled=await outcomes;assert.equal(settled.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(updates.at(-1).transactionHash,hash);assert.equal(updates.at(-1).status,'pending');
  await assert.rejects(p.browser.send('eth_sendTransaction',[request]));assert.equal(calls,1);
 } finally {p.close()}
});

test('recovery uses real ABI decoding and explicit RPC/Mirror fixtures; delay, mismatch and reload do not create',async(t)=>{
 const {n,tx,receipt}=await fixtureReceipt();const {Interface}=await import('ethers');const {IAsset__factory}=await import('@hashgraph/asset-tokenization-contracts');
 const asset=new Interface(IAsset__factory.abi),p=n.novaParameters(A,1),zero='0x'+'0'.repeat(40),role='0x'+'0'.repeat(64);
 let state='delay',txReady=true,calls=[];
 const values={getERC20Metadata:[{info:{name:p.name,symbol:p.symbol,isin:p.isin,decimals:0},securityType:1}],getConfigInfo:[n.resolverAddress,p.configId,1],
  totalSupply:[0],getMaxSupply:[1000],isControllable:[true],isInternalKycActivated:[true],isClearingActivated:[false],isMultiPartition:[false],isIssuable:[true],
  arePartitionsProtected:[false],isActivated:[false],getControlListType:[false],getControlListCount:[0],getExternalPausesCount:[0],
  getExternalControlListsCount:[0],getExternalKycListsCount:[0],compliance:[zero],identityRegistry:[zero],paused:[false],getNominalValue:[1],
  getNominalValueDecimals:[0],getNominalValueCurrency:['0x555344'],hasRole:[true],getRoleCountFor:[1],getRolesFor:[[role]]};
 t.mock.method(globalThis,'fetch',async(url,options={})=>{
  url=String(url);calls.push(url);
  if(url==='https://testnet.hashio.io/api'){
   const body=JSON.parse(options.body);let result;
   if(body.method==='eth_chainId')result='0x128';else if(body.method==='eth_getCode')result='0x6000';
   else if(body.method==='eth_getTransactionByHash')result=txReady?tx:null;
   else if(body.method==='eth_getTransactionReceipt')result=txReady?receipt:null;
   else if(body.method==='eth_blockNumber')result='0x20';
   else if(body.method==='eth_call'){
    if(body.params[0].to.toLowerCase()===n.resolverAddress)result='0x'+'1'.padStart(64,'0');
    else {const name=asset.parseTransaction({data:body.params[0].data}).name;
     assert.equal(body.params[1],'0x10','T02 must query the creation block even if latest supply is 100');
     result=asset.encodeFunctionResult(name,state==='cap-mismatch'&&name==='getMaxSupply'?[999]:values[name]);}
   } else throw new Error('Unexpected RPC');
   return Response.json({jsonrpc:'2.0',id:body.id,result});
  }
  if(url.endsWith('contracts/0.0.9212226'))return Response.json({contract_id:'0.0.9212226',evm_address:n.resolverAddress,deleted:false});
  if(url.endsWith('contracts/0.0.9213391'))return Response.json({contract_id:'0.0.9213391',evm_address:F,deleted:false});
  if(state==='delay')return new Response('',{status:404});
  if(url.endsWith('contracts/'+B))return Response.json({contract_id:'0.0.12345',evm_address:B,deleted:false});
  if(url.endsWith('contracts/results/'+hash))return Response.json({hash,from:state==='mirror-mismatch'?B:state.startsWith('sender-')?'0x0000000000000000000000000000000000000065':A,to:F,result:'SUCCESS',timestamp:'1788700000.123456789',amount:0,function_parameters:tx.input});
  if(url.includes('/accounts/')){
   if(state==='sender-delay')return new Response('',{status:404});
   return Response.json({account:'0.0.101',evm_address:state==='sender-wrong'||state==='mirror-mismatch'?B:A,deleted:state==='sender-deleted'});
  }
  if(url.includes('/transactions?'))return Response.json({transactions:[{consensus_timestamp:'1788700000.123456789',result:'SUCCESS',transaction_id:'0.0.101-1788700000-000000001'}]});
  throw new Error('Unexpected external request');
 });
 let saved=await n.recoverNova(hash,A,new AbortController().signal);assert.equal(saved.status,'mirror-pending');assert.equal(saved.securityAddress,B);
 assert.equal(saved.comparisons.some(row=>row.field==='votingRight'&&row.source.includes('not a current getter')),true);
 txReady=false;const pending=await n.recoverNova(hash,A,new AbortController().signal,JSON.parse(JSON.stringify(saved)));assert.equal(pending.status,'pending');assert.equal(n.canCreateNova(pending),false);
 const noHash={...saved,status:'unknown'};delete noHash.transactionHash;delete noHash.hashScanLink;
 assert.equal((await n.recoverNova(hash,A,new AbortController().signal,noHash)).transactionHash,undefined);txReady=true;
 for(const current of ['cap-mismatch','mirror-mismatch','sender-wrong','sender-deleted','sender-delay','sender-alias','complete']){
  state=current;const result=await n.recoverNova(hash,A,new AbortController().signal,saved);
  assert.equal(result.status,current==='complete'||current==='sender-alias'?'complete':current==='sender-delay'?'mirror-pending':'mismatch',current);
  assert.equal(n.canCreateNova(result),false);
  if(current==='complete'){assert.equal(result.readBlock,'16');assert.ok(result.comparisons.some(row=>row.field==='Total supply'&&row.source.includes('Historical creation-block')));assert.equal(result.securityId,'0.0.12345');assert.equal(result.transactionId,'0.0.101-1788700000-000000001');assert.match(result.hashScanLink,/hashscan.io\/testnet\/transaction/)}
 }
 assert.ok(calls.every(url=>url.startsWith('https://testnet.')));
});
test('rejection, stale review, post-send timeout and late responses retain safe public state',async(t)=>{
 const n=await import('../src/nova.ts'),data=await n.novaCalldata(A,1);let mode='reject',calls=0,stale=false;
 const wallet={roles:{Admin:A},provider:{request:async()=>{calls++;if(mode==='reject')throw {code:4001};return hash}}};
 const record={schemaVersion:1,kind:'nova-create',chainId:296,operationId:'provider-state',startedAt:new Date().toISOString(),admin:A,configVersion:1,calldataDigest:hash,status:'awaiting-signature'};
 const make=()=>n.createNovaProviders({wallet,calldata:data,configVersion:1},record,()=>{},async()=>{if(stale)throw new Error('Stale session')},new AbortController().signal);
 const request={from:A,to:F,data};let p=await make();
 await assert.rejects(p.browser.send('eth_sendTransaction',[request]));assert.equal(p.getRecord().status,'rejected');assert.equal(p.getRecord().transactionHash,undefined);p.close();
 stale=true;p=await make();await assert.rejects(p.browser.send('eth_sendTransaction',[request]));assert.equal(calls,1);p.close();
 stale=false;mode='hash';p=await make();await p.browser.send('eth_sendTransaction',[request]);
 const now=Date.now();t.mock.method(Date,'now',()=>now+61_000);
 await assert.rejects(p.browser.send('eth_getTransactionReceipt',[hash]));assert.equal(p.getRecord().transactionHash,hash);assert.equal(n.canCreateNova(p.getRecord()),false);p.close();
});

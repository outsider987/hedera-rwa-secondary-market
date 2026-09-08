import assert from 'node:assert/strict';
import {test} from 'node:test';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('./')&&c.parentURL?.startsWith(new URL('../src/',import.meta.url).href)&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const load=()=>import('../src/lifecycle.ts');
test('T03 orders missing roles and issuer; never reissues changed supply or balances',async()=>{
 const l=await load();const s={roles:[false,false,false],issuer:false,sellerKyc:{status:0,vcId:''},buyerKyc:{status:0,vcId:''},supply:'0',sellerBalance:'0',buyerBalance:'0',sellerHeld:'0',buyerHeld:'0'};
 assert.equal(l.nextAction(s,[]),'issuer-role');
 assert.equal(l.nextAction({...s,roles:[true,false,false]},[]),'ssi-role');
 assert.equal(l.nextAction({...s,roles:[true,true,false]},[]),'kyc-role');
 assert.equal(l.nextAction({...s,roles:[true,true,true]},[]),'register-issuer');
 assert.equal(l.nextAction({...s,roles:[true,true,true],issuer:true},[]),'seller-kyc');
 for(const key of ['supply','sellerBalance','buyerBalance','sellerHeld','buyerHeld']) assert.throws(()=>l.nextAction({...s,[key]:'100'},[]));
 for(const status of ['awaiting-signature','pending','unknown','confirmed','mirror-pending','mismatch']) assert.throws(()=>l.nextAction(s,[{status,action:'issue'}]));
 assert.throws(()=>l.nextAction({...s,sellerKyc:{status:1,vcId:'existing'}},[]),/hash|evidence/i);
});
test('exact fixed calldata, zero value, fixed accounts and asset; no alternative actions',async()=>{
 const l=await load();const data=await l.actionCalldata('issue');
 const tx={from:l.accounts.Admin.address,to:l.securityAddress,data,value:'0x0',chainId:'0x128'};
 l.assertLifecycleTransaction(tx,data);
 for(const changes of [{from:l.accounts.Seller.address},{to:l.accounts.Admin.address},{value:'0x1'},{data:data+'00'},{chainId:'0x1'},{authorizationList:[]}]) assert.throws(()=>l.assertLifecycleTransaction({...tx,...changes},data));
 await assert.rejects(l.actionCalldata('other'));await assert.rejects(l.actionCalldata('seller-kyc'));
});
test('public T03 evidence drops arbitrary objects, signatures and credentials',async()=>{
 const l=await load();const e=await import('../src/evidence.ts');
 const r={schemaVersion:1,kind:'t03',chainId:296,operationId:'test-operation',startedAt:new Date().toISOString(),action:'issue',status:'awaiting-signature',calldataDigest:'0x'+'1'.repeat(64),securityAddress:l.securityAddress,admin:l.accounts.Admin.address,credential:{proof:'SECRET'},wallet:{secret:'SECRET'},error:'SECRET'};
 const clean=e.lifecycleEvidence(r);assert.doesNotMatch(JSON.stringify(clean),/SECRET|credential|wallet|error/);
 let raw=null;const storage={getItem:()=>raw,setItem:(k,v)=>raw=v};
 l.saveLifecycleRecords([r],storage);assert.equal(l.loadLifecycleRecords(storage).length,1);
 assert.throws(()=>l.saveLifecycleRecords([r],{getItem:()=>null,setItem(){}}));
 raw='{}';assert.throws(()=>l.loadLifecycleRecords(storage));
});

const hash='0x'+'1'.repeat(64), blockHash='0x'+'2'.repeat(64);
async function receiptFixture(action,kyc) {
 const l=await load(),{interfaces}=await import('../src/nova.ts'),{keccak256}=await import('viem'),{asset}=await interfaces();
 const calldata=await l.actionCalldata(action,kyc), index=['issuer-role','ssi-role','kyc-role'].indexOf(action);
 const eventName=index>=0?'RoleGranted':action==='register-issuer'?'AddedToIssuerList':action==='issue'?'IssuedByPartition':'KycGranted';
 const args=index>=0?[l.accounts.Admin.address,l.accounts.Admin.address,l.roleIds[index]]:action==='register-issuer'?[l.accounts.Admin.address,l.accounts.Admin.address]:action==='issue'?[l.partition,l.accounts.Admin.address,l.accounts.Seller.address,100,'0x']:[l.accounts.Seller.address,l.accounts.Admin.address];
 const event=asset.encodeEventLog(asset.getEvent(eventName),args);
 const record={schemaVersion:1,kind:'t03',chainId:296,operationId:'fixture',startedAt:new Date().toISOString(),action,status:'pending',admin:l.accounts.Admin.address,securityAddress:l.securityAddress,calldataDigest:keccak256(calldata),transactionHash:hash,...(kyc?{kyc}:{})};
 const tx={hash,from:l.accounts.Admin.address,to:l.securityAddress,input:calldata,chainId:'0x128',value:'0x0',blockNumber:'0x10',blockHash};
 const receipt={transactionHash:hash,from:tx.from,to:tx.to,status:'0x1',blockNumber:'0x10',blockHash,logs:[{address:l.securityAddress,...event}]};
 return {l,asset,record,tx,receipt};
}
test('all six receipt actions require exact event, calldata, block and sender',async()=>{
 const l=await load(); const kyc={vcId:'urn:uuid:public-fixture',issuer:l.accounts.Admin.address,validFrom:'1788760000',validTo:'1789365100'};
 for(const action of ['issuer-role','ssi-role','kyc-role','register-issuer','seller-kyc','issue']) {
  const {record,tx,receipt}=await receiptFixture(action,action==='seller-kyc'?kyc:undefined);
  await l.verifyLifecycleReceipt(record,tx,receipt);
  for(const change of [{status:'0x0'},{blockHash:undefined},{blockNumber:'0x11'},{from:l.accounts.Seller.address},{logs:[]},{logs:[...receipt.logs,...receipt.logs]}]) await assert.rejects(l.verifyLifecycleReceipt(record,tx,{...receipt,...change}));
  await assert.rejects(l.verifyLifecycleReceipt(record,{...tx,input:tx.input+'00'},receipt));
  await assert.rejects(l.verifyLifecycleReceipt(record,{...tx,value:'0x1'},receipt));
  if(action==='seller-kyc') for(const change of [{validFrom:'1788760001'},{validTo:'1789365101'},{vcId:'changed'}]) await assert.rejects(l.verifyLifecycleReceipt({...record,kyc:{...kyc,...change}},tx,receipt));
 }
});
test('T03 provider rejects alternate methods and duplicates, and retains late hashes after cancellation',async()=>{
 const {l,record,tx}=await receiptFixture('issuer-role');let sends=0,release; const controller=new AbortController();
 const wallet={roles:Object.fromEntries(Object.entries(l.accounts).map(([k,v])=>[k,v.address])),provider:{request:async()=>{sends++;return new Promise(r=>release=r)}}};
 const updates=[];const p=await l.createLifecycleProviders({wallet,calldata:tx.input},record,r=>updates.push(r),async()=>{},controller.signal);
 const send={from:tx.from,to:tx.to,data:tx.input,value:'0x0'};
 for(const method of ['personal_sign','eth_sign','eth_signTypedData_v4','wallet_switchEthereumChain','eth_sendRawTransaction']) await assert.rejects(p.browser.send(method,[]));
 await assert.rejects(p.browser.send('eth_sendTransaction',[{...send,to:l.accounts.Seller.address}]));assert.equal(sends,0);
 const pending=p.browser.send('eth_sendTransaction',[send]);while(!release)await new Promise(r=>setImmediate(r));
 await assert.rejects(p.browser.send('eth_sendTransaction',[send]));controller.abort();release(hash);await pending;
 assert.equal(sends,1);assert.equal(p.getRecord().transactionHash,hash);assert.equal(updates.at(-1).status,'pending');
 await assert.rejects(p.browser.send('eth_getTransactionReceipt',[hash]));p.close();
});
test('T03 provider rejection, stale preflight and bounded lookup keep retry decisions explicit',async(t)=>{
 const {l,record,tx}=await receiptFixture('issue');let mode='reject',sends=0,stale=false;
 const wallet={provider:{request:async()=>{sends++;if(mode==='reject')throw {code:4001};return hash}}};
 const make=()=>l.createLifecycleProviders({wallet,calldata:tx.input},{...record,transactionHash:undefined},()=>{},async()=>{if(stale)throw Error('Stale')},new AbortController().signal);
 const request={from:tx.from,to:tx.to,data:tx.input};let p=await make();await assert.rejects(p.browser.send('eth_sendTransaction',[request]));
 assert.equal(p.getRecord().status,'rejected');assert.equal(p.getRecord().transactionHash,undefined);p.close();
 stale=true;p=await make();await assert.rejects(p.browser.send('eth_sendTransaction',[request]));assert.equal(sends,1);p.close();
 stale=false;mode='hash';p=await make();await p.browser.send('eth_sendTransaction',[request]);
 const now=Date.now();t.mock.method(Date,'now',()=>now+61000);await assert.rejects(p.browser.send('eth_getTransactionReceipt',[hash]));
 assert.equal(p.getRecord().transactionHash,hash);p.close();
});
test('original account mapping is mandatory; UTF-8 KYC calldata preserves ID and Unix seconds',async()=>{
 const l=await load();const roles=Object.fromEntries(Object.entries(l.accounts).map(([k,v])=>[k,v.address]));l.assertFixedAccounts(roles);
 for(const role of Object.keys(roles)) assert.throws(()=>l.assertFixedAccounts({...roles,[role]:'0x'+'a'.repeat(40)}));
 const {asset}=await (await import('../src/nova.ts')).interfaces();
 const input={vcId:'urn:uuid:public-fixture',issuer:l.accounts.Admin.address,validFrom:'1788760000',validTo:'1789365100'};
 const decoded=asset.decodeFunctionData('grantKyc',await l.actionCalldata('seller-kyc',input));
 assert.equal(decoded[0].toLowerCase(),l.accounts.Seller.address);assert.equal(decoded[1],input.vcId);assert.equal(decoded[2],BigInt(input.validFrom));assert.equal(decoded[3],BigInt(input.validTo));
 for(const change of [{issuer:l.accounts.Seller.address},{validFrom:'NaN'},{validTo:input.validFrom}]) await assert.rejects(l.actionCalldata('seller-kyc',{...input,...change}));
});
test('role IDs match the pinned SDK, not hashes inferred from enum labels',async()=>{
 const l=await load();const {readFileSync}=await import('node:fs');
 const source=readFileSync('node_modules/@hashgraph/asset-tokenization-sdk/build/esm/src/domain/context/security/SecurityRole.js','utf8');
 for(let i=0;i<l.requiredRoles.length;i++) assert.equal(l.roleIds[i],source.match(new RegExp('SecurityRole\\["'+l.requiredRoles[i]+'"\\] = "(0x[a-f0-9]+)"'))[1]);
});

test('recovery verifies historical transition and Mirror mapping; delay, reload, failed receipt and missing history stay safe',{timeout:20000},async(t)=>{
 const {l,asset,record,tx,receipt}=await receiptFixture('issuer-role');
 const n=await import('../src/nova.ts'),g=await import('../src/guards.ts');
 let raw=JSON.stringify([{...record,status:'unknown'}]),mode='delay',currentReceipt=receipt;
 const storage={getItem:()=>raw,setItem:(key,value)=>raw=value};
 Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:storage}});t.after(()=>delete globalThis.window);
 const navigatorDescriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(name,opts,fn)=>fn({name})}}});
 t.after(()=>Object.defineProperty(globalThis,'navigator',navigatorDescriptor));
 t.mock.method(globalThis,'fetch',async(url,options={})=>{
  url=String(url);
  if(url==='https://testnet.hashio.io/api') {
   const body=JSON.parse(options.body);let result;
   if(body.method==='eth_chainId')result='0x128';else if(body.method==='eth_getTransactionByHash')result=mode==='pending'?null:tx;
   else if(body.method==='eth_getTransactionReceipt')result=currentReceipt;
   else if(body.method==='eth_getBlockByNumber')result={number:body.params[0],timestamp:'0x6aa70000'};
   else if(body.method==='eth_call'){
    const decoded=asset.parseTransaction({data:body.params[0].data}),name=decoded.name,after=body.params[1]==='0x10';
    if(mode==='no-history'&&!after)throw Error('Synthetic unavailable archive');
    const values={getConfigInfo:[n.resolverAddress,'0x'+'0'.repeat(63)+'1',1],getERC20Metadata:[{info:{name:'Nova Private Equity Common Shares',symbol:'NOVA',isin:'USNOVA000016',decimals:0},securityType:1}],getMaxSupply:[1000],paused:[false],isIssuable:[true],isInternalKycActivated:[true],isControllable:[true],isMultiPartition:[false],arePartitionsProtected:[false],isClearingActivated:[false],isActivated:[false],getControlListType:[false],getControlListCount:[0],getExternalPausesCount:[0],getExternalControlListsCount:[0],getExternalKycListsCount:[0],compliance:['0x'+'0'.repeat(40)],identityRegistry:['0x'+'0'.repeat(40)],balanceOf:[0],balanceOfByPartition:[0],getHeldAmountFor:[0],getHeldAmountForByPartition:[0],totalSupply:[mode==='unexpected-supply'&&after?100:0],isIssuer:[false],getKycFor:[[0,0,'','0x'+'0'.repeat(40),0]],hasRole:[name==='hasRole'&&(decoded.args[0]==='0x'+'0'.repeat(64)||decoded.args[0]===l.roleIds[0]&&after&&currentReceipt.status==='0x1')]};
    assert.ok(values[name],name);result=asset.encodeFunctionResult(name,values[name]);
   }else throw Error('Unexpected RPC: '+body.method);
   return Response.json({jsonrpc:'2.0',id:body.id,result});
  }
  if(url.includes('/accounts/')) {
   const address=url.split('/accounts/')[1].split('?')[0];
   const expected=Object.values(l.accounts).find(a=>a.address===address)??l.accounts.Admin;
   return Response.json({evm_address:mode==='wrong-sender'&&address==='0x'+'0'.repeat(36)+'1234'?l.accounts.Seller.address:expected.address,account:expected.accountId,deleted:false});
  }
  if(url.endsWith('/contracts/'+l.securityId))return Response.json({contract_id:l.securityId,evm_address:l.securityAddress,deleted:false});
  if(url.includes('/contracts/results/')){
   if(mode==='delay')return new Response('',{status:404});
   return Response.json({hash,from:'0x'+'0'.repeat(36)+'1234',to:l.securityAddress,amount:0,result:currentReceipt.status==='0x1'?'SUCCESS':'CONTRACT_REVERT_EXECUTED',timestamp:'1788760000.123456789',function_parameters:tx.input});
  }
  if(url.includes('/transactions?'))return Response.json({transactions:[{transaction_id:'0.0.1234-1788760000-123456789',consensus_timestamp:'1788760000.123456789',result:currentReceipt.status==='0x1'?'SUCCESS':'CONTRACT_REVERT_EXECUTED'}]});
  throw Error('Unexpected HTTP');
 });
 let result=await l.recoverLifecycle(hash,'issuer-role',new AbortController().signal,()=>{});assert.equal(result.status,'mirror-pending');
 mode='pending';assert.equal((await l.recoverLifecycle(hash,'issuer-role',new AbortController().signal,()=>{})).status,'pending');
 for(const failure of ['wrong-sender','unexpected-supply','no-history']){mode=failure;await assert.rejects(l.recoverLifecycle(hash,'issuer-role',new AbortController().signal,()=>{}));assert.equal(g.getOperationBusy(),false)}
 mode='complete';result=await l.recoverLifecycle(hash,'issuer-role',new AbortController().signal,()=>{});assert.equal(result.status,'complete');assert.equal(result.before.roles[0],false);assert.equal(result.after.roles[0],true);
 assert.equal(l.loadLifecycleRecords(storage).length,1);assert.equal(result.transactionId,'0.0.1234-1788760000-123456789');
 currentReceipt={...receipt,status:'0x0',logs:[]};raw=JSON.stringify([{...record,status:'unknown'}]);
 result=await l.recoverLifecycle(hash,'issuer-role',new AbortController().signal,()=>{});assert.equal(result.status,'failed');
 assert.equal(l.nextAction(result.after,l.loadLifecycleRecords(storage)),'issuer-role');
 raw='invalid';await assert.rejects(l.recoverLifecycle(hash,'issuer-role',new AbortController().signal,()=>{}));assert.equal(g.getOperationBusy(),false);
});
test('KYC transition compares values independent of JSON field order; final 100 can never issue again',async()=>{
 const l=await load(),e=await import('../src/evidence.ts');
 const empty={status:0,vcId:'',issuer:'0x'+'0'.repeat(40),validFrom:'0',validTo:'0'};
 const before=e.lifecycleStateEvidence({block:'10',timestamp:'1788760000',roles:[true,true,true],issuer:true,supply:'0',sellerBalance:'0',buyerBalance:'0',sellerHeld:'0',buyerHeld:'0',sellerKyc:empty,buyerKyc:empty});
 const kyc={vcId:'urn:uuid:public-fixture',issuer:l.accounts.Admin.address,validFrom:'1788760000',validTo:'1789365100'};
 const after=e.lifecycleStateEvidence({...before,block:'11',sellerKyc:{...kyc,status:1}});
 const {record}=await receiptFixture('seller-kyc',kyc);
 l.assertLifecycleTransition(record,before,after);
 for(const change of [{vcId:'changed'},{validFrom:'1788760001'},{validTo:'1789365101'},{issuer:l.accounts.Seller.address}]) assert.throws(()=>l.assertLifecycleTransition(record,before,{...after,sellerKyc:{...after.sellerKyc,...change}}));
 const grant={...record,status:'complete'};assert.equal(l.nextAction(after,[grant]),'issue');
 const issued={...after,supply:'100',sellerBalance:'100'};
 l.assertLifecycleTransition({action:'issue'},after,issued);
 assert.throws(()=>l.nextAction(issued,[grant]),/existing issuance/);
 assert.equal(l.nextAction(issued,[grant,{action:'issue',status:'complete'}]),undefined);
 assert.throws(()=>l.nextAction({...issued,sellerKyc:{...issued.sellerKyc,vcId:'changed'}},[grant,{action:'issue',status:'complete'}]));
});

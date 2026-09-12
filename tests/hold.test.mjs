import assert from 'node:assert/strict';
import {test} from 'node:test';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.startsWith(new URL('../src/',import.meta.url).href)&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const load=()=>import('../src/lib/hold.ts');
test('Hold IDs and expiry preserve canonical safe SDK seconds',async()=>{
 const h=await load();assert.equal(h.sdkHoldId('7'),7);
 for(const id of ['0','01','-1','1.1','9007199254740992','1\n'])assert.throws(()=>h.sdkHoldId(id));
 const input=h.createHoldInput({block:'40224162',timestamp:'1788790000'});
 assert.equal(input.expirationTimestamp,'1788876400');assert.equal(input.baseBlock,'40224162');
 const {asset}=await (await import('../src/lib/nova.ts')).interfaces();
 const data=await h.holdCalldata('create-hold',input),decoded=asset.decodeFunctionData('createHoldByPartition',data);
 assert.equal(decoded[1].amount,10n);assert.equal(decoded[1].expirationTimestamp,1788876400n);assert.equal(decoded[1].data,'0x');
 const l=await import('../src/lib/lifecycle.ts');
 const tx={from:l.accounts.Seller.address,to:l.securityAddress,data,chainId:'0x128',value:'0x0'};
 h.assertHoldTransaction(tx,'create-hold',data);
 for(const change of [{from:l.accounts.Admin.address},{value:'0x1'},{chainId:'0x1'},{data:data+'00'},{to:l.accounts.Buyer.address}])assert.throws(()=>h.assertHoldTransaction({...tx,...change},'create-hold',data));
 for(const change of [{partition:'0x'+'0'.repeat(64)},{holder:l.accounts.Buyer.address},{escrow:l.accounts.Seller.address},{destination:l.accounts.Buyer.address},{expirationTimestamp:'1788876400000'},{baseTimestamp:'1788790001'},{securityId:'0.0.1'}])await assert.rejects(h.holdCalldata('create-hold',{...input,...change}));
 const execute=asset.decodeFunctionData('executeHoldByPartition',await h.holdCalldata('execute',{...input,holdId:'7'}));
 assert.equal(execute[0].tokenHolder.toLowerCase(),l.accounts.Seller.address);assert.equal(execute[1].toLowerCase(),l.accounts.Buyer.address);assert.equal(execute[2],6n);
 const release=asset.decodeFunctionData('releaseHoldByPartition',await h.holdCalldata('release',{...input,holdId:'7'}));assert.equal(release[1],4n);
});
test('SDK KYC and chain revert classifications cannot pass transport or generic errors',async()=>{
 const h=await load();assert.equal(h.isSdkBuyerKycRejection(new Error('network failure')),false);
 const {asset}=await (await import('../src/lib/nova.ts')).interfaces();
 assert.equal(await h.expectedRevert(asset.encodeErrorResult('KycIsNotGranted',[]),'kyc-negative'),'KycIsNotGranted');
 assert.equal(await h.expectedRevert(asset.encodeErrorResult('IsNotEscrow',[]),'non-escrow'),'IsNotEscrow');
 assert.equal(await h.expectedRevert(asset.encodeErrorResult('InsufficientHoldBalance',[10,11]),'over-amount'),'InsufficientHoldBalance');
 for(const raw of ['0x','network failure',asset.encodeErrorResult('IsNotEscrow',[])])await assert.rejects(h.expectedRevert(raw,'kyc-negative'));
});
test('T03 transaction entry is closed before any network or wallet operation',async()=>{
 const l=await import('../src/lib/lifecycle.ts');await assert.rejects(l.submitLifecycle({},()=>{}),/T03.*complete|closed/i);
});
test('T04 entry is read-only before wallet or network access',async()=>{
 const h=await load();await assert.rejects(h.runHoldAction({},()=>{},new AbortController().signal),/T04 is complete/);
});

async function fixtures(){
 const h=await load(),l=await import('../src/lib/lifecycle.ts'),e=await import('../src/lib/evidence.ts'),{asset}=await (await import('../src/lib/nova.ts')).interfaces(),{keccak256}=await import('viem');
 const input={...h.createHoldInput({block:'40224162',timestamp:'1788790000'}),holdId:'7'};
 const kyc={vcId:'urn:uuid:public-fixture',issuer:l.accounts.Admin.address,validFrom:'1788790000',validTo:'1789395100',digest:'0x'+'a'.repeat(64)};
 const empty={status:0,vcId:'',issuer:h.zero,validFrom:'0',validTo:'0'};
 const start=e.holdStateEvidence({block:'40224163',timestamp:'1788790010',roles:[true,true,true],issuer:true,supply:'100',sellerBalance:'100',buyerBalance:'0',sellerHeld:'0',buyerHeld:'0',sellerKyc:{...kyc,status:1},buyerKyc:empty,sellerHoldIds:[],buyerHoldIds:[]});
 const held={...start,block:'40224164',sellerBalance:'90',sellerHeld:'10',sellerHoldIds:['7'],hold:{id:'7',amount:'10',expirationTimestamp:input.expirationTimestamp,escrow:l.accounts.Admin.address,destination:h.zero,data:'0x',operatorData:'0x',thirdPartyType:0}};
 const granted={...held,block:'40224165',buyerKyc:{...kyc,status:1}};
 const executed={...granted,block:'40224166',sellerHeld:'4',buyerBalance:'6',hold:{...held.hold,amount:'4'}};
 const released={...executed,block:'40224167',sellerBalance:'94',sellerHeld:'0',sellerHoldIds:[]};delete released.hold;
 const records=[];
 for(const [action,before,after] of [['create-hold',start,held],['buyer-kyc',held,granted],['execute',granted,executed],['release',executed,released]]){
  const data=await h.holdCalldata(action,input,action==='buyer-kyc'?kyc:undefined),signer=l.accounts[action==='create-hold'?'Seller':'Admin'].address;
  const r={schemaVersion:1,kind:'t04-transaction',chainId:296,operationId:action,startedAt:new Date().toISOString(),action,status:'complete',input,signerRole:action==='create-hold'?'Seller':'Admin',calldataDigest:keccak256(data),before,after,transactionHash:'0x'+'1'.repeat(64),...(action==='buyer-kyc'?{kyc}:{})};
  const iface=action==='create-hold'?await h.holdInterface():asset;
  const name=action==='create-hold'?'HeldByPartition':action==='buyer-kyc'?'KycGranted':action==='execute'?'HoldByPartitionExecuted':'HoldByPartitionReleased';
  const args=action==='create-hold'?[signer,l.accounts.Seller.address,l.partition,7,[10,input.expirationTimestamp,l.accounts.Admin.address,h.zero,'0x'],'0x']:action==='buyer-kyc'?[l.accounts.Buyer.address,l.accounts.Admin.address]:action==='execute'?[l.accounts.Seller.address,l.partition,7,6,l.accounts.Buyer.address]:[l.accounts.Seller.address,l.partition,7,4];
  const tx={hash:r.transactionHash,from:signer,to:l.securityAddress,input:data,value:'0x0',chainId:'0x128',blockHash:'0x'+'2'.repeat(64),blockNumber:'0x'+BigInt(after.block).toString(16)};
  const receipt={transactionHash:tx.hash,from:signer,to:tx.to,status:'0x1',blockHash:tx.blockHash,blockNumber:tx.blockNumber,logs:[{address:l.securityAddress,...iface.encodeEventLog(iface.getEvent(name),args)}]};
  records.push({r,tx,receipt});
 }
 return {h,l,e,asset,input,kyc,start,held,granted,executed,released,records};
}
test('four exact receipt/events and historical transitions reject changed inputs and complete release without a deleted getter',async()=>{
 const f=await fixtures();
 for(const {r,tx,receipt} of f.records){
  assert.equal((await f.h.verifyHoldReceipt(r,tx,receipt)).holdId,'7');f.h.assertHoldTransition(r,r.before,r.after);
  for(const change of [{input:tx.input+'00'},{from:f.l.accounts.Buyer.address},{value:'0x1'},{chainId:'0x1'},{blockHash:'0x'+'3'.repeat(64)}])await assert.rejects(f.h.verifyHoldReceipt(r,{...tx,...change},receipt));
  for(const change of [{status:'0x0'},{logs:[]},{logs:[...receipt.logs,...receipt.logs]},{blockNumber:'0x1'},{from:f.l.accounts.Buyer.address}])await assert.rejects(f.h.verifyHoldReceipt(r,tx,{...receipt,...change}));
  for(const change of [{supply:'101'},{buyerHeld:'1'},{sellerBalance:'95'},{sellerKyc:{...r.after.sellerKyc,validTo:'1788790001'}}])assert.throws(()=>f.h.assertHoldTransition(r,r.before,{...r.after,...change}));
 }
 const creation=f.records[0];assert.equal((await f.h.verifyHoldReceipt({...creation.r,input:{...f.input,holdId:undefined}},creation.tx,creation.receipt)).holdId,'7');
 await assert.rejects(f.h.verifyHoldReceipt({...creation.r,input:{...f.input,holdId:'8'}},creation.tx,creation.receipt));
 const release=f.records[3];assert.equal(release.r.after.hold,undefined);assert.deepEqual(release.r.after.sellerHoldIds,[]);
 assert.throws(()=>f.h.assertHoldTransition(release.r,release.r.before,{...release.r.after,sellerHoldIds:['7']}));
});
test('only the fixed six-stage lifecycle progresses; unknown work, skipped simulations and expired KYC/Hold stop',async()=>{
 const f=await fixtures(),records=[];assert.equal(f.h.nextHoldAction(f.start,records),'create-hold');
 for(const status of ['awaiting-signature','unknown','pending','confirmed','mirror-pending','mismatch'])assert.throws(()=>f.h.nextHoldAction(f.start,[{...f.records[0].r,status}]));
 assert.throws(()=>f.h.nextHoldAction(f.held,[]));
 records.push(f.records[0].r);assert.equal(f.h.nextHoldAction(f.held,records),'kyc-negative');
 const neg={kind:'t04-simulation',action:'kyc-negative',status:'complete',input:f.input};records.push(neg);assert.equal(f.h.nextHoldAction(f.held,records),'buyer-kyc');
 records.push(f.records[1].r);assert.equal(f.h.nextHoldAction(f.granted,records),'permission-negative');
 records.push({kind:'t04-simulation',action:'permission-negative',status:'complete',input:f.input});assert.equal(f.h.nextHoldAction(f.granted,records),'execute');
 records.push(f.records[2].r);assert.equal(f.h.nextHoldAction(f.executed,records),'release');records.push(f.records[3].r);assert.equal(f.h.nextHoldAction(f.released,records),undefined);
 for(const change of [{sellerKyc:{...f.start.sellerKyc,validTo:'1788876399'}},{buyerKyc:{...f.kyc,status:1}},{roles:[true,false,true]}])assert.throws(()=>f.h.nextHoldAction({...f.start,...change},[]));
 assert.throws(()=>f.h.nextHoldAction({...f.held,timestamp:f.input.expirationTimestamp},[f.records[0].r]));
 assert.throws(()=>f.h.nextHoldAction(f.released,records.filter(r=>r.action!=='kyc-negative')));
 for(const key of ['id','escrow','destination','amount','expirationTimestamp','data','operatorData','thirdPartyType'])assert.throws(()=>f.h.nextHoldAction({...f.held,hold:{...f.held.hold,[key]:'unexpected'}},[f.records[0].r]));
});
test('public T04 transaction/simulation evidence excludes credentials, proofs, wallet/error objects and simulation tx IDs',async()=>{
 const f=await fixtures(),leak={credential:{proof:'PRIVATE-MARKER'},wallet:{key:'PRIVATE-MARKER'},error:'PRIVATE-MARKER'};
 const clean=f.e.holdEvidence({...f.records[0].r,...leak});assert.doesNotMatch(JSON.stringify(clean),/PRIVATE-MARKER|credential|wallet|error/);
 const calldata=await f.h.holdCalldata('execute',f.input),revertData=f.asset.encodeErrorResult('KycIsNotGranted',[]);
 const sim={schemaVersion:1,kind:'t04-simulation',chainId:296,operationId:'negative',startedAt:new Date().toISOString(),action:'kyc-negative',status:'complete',input:f.input,before:f.held,after:f.held,cases:[{check:'kyc-negative',from:f.l.accounts.Admin.address,amount:'6',calldata,revert:'KycIsNotGranted',revertData,block:f.held.block,afterBlock:f.held.block,sdkRejection:'AccountNotKycd'}],transactionHash:'0x'+'1'.repeat(64),transactionId:'0.0.1-1-1',...leak};
 const value=f.e.holdEvidence(sim);assert.doesNotMatch(JSON.stringify(value),/PRIVATE-MARKER|transactionHash|transactionId|proof|wallet|error/);
 let raw=null;const storage={getItem:()=>raw,setItem:(k,v)=>raw=v};f.h.saveHoldRecords([clean,value],storage);assert.equal(f.h.loadHoldRecords(storage).length,2);
 assert.throws(()=>f.h.saveHoldRecords([clean],{getItem:()=>null,setItem(){}}));raw='{}';assert.throws(()=>f.h.loadHoldRecords(storage));
});
test('eth_call uses exact from/calldata/zero value at the recorded block; transport and wrong reverts never pass',async(t)=>{
 const f=await fixtures();let mode='kyc',calls=0;
 t.mock.method(globalThis,'fetch',async(url,o)=>{assert.equal(url,'https://testnet.hashio.io/api');const b=JSON.parse(o.body);assert.equal(b.method,'eth_call');assert.equal(b.params[0].from,f.l.accounts.Admin.address);assert.equal(b.params[0].value,'0x0');assert.equal(b.params[1],'0x'+BigInt(f.held.block).toString(16));calls++;
  if(mode==='network')throw Error('Synthetic transport failure');if(mode==='http')return new Response('',{status:500});if(mode==='success')return Response.json({jsonrpc:'2.0',id:1,result:'0x'});
  return Response.json({jsonrpc:'2.0',id:1,error:{code:3,data:mode==='kyc'?f.asset.encodeErrorResult('KycIsNotGranted',[]):mode==='wrong'?f.asset.encodeErrorResult('IsNotEscrow',[]):'0x'}});
 });
 assert.equal((await f.h.callHoldRevert(f.input,'kyc-negative',f.held.block,new AbortController().signal)).revert,'KycIsNotGranted');
 for(mode of ['network','http','success','wrong','empty'])await assert.rejects(f.h.callHoldRevert(f.input,'kyc-negative',f.held.block,new AbortController().signal));assert.equal(calls,6);
});

test('four T04 recoveries verify full historical state and Mirror identity; delay/unknown/reload never authorizes replay',async(t)=>{
 const f=await fixtures(),n=await import('../src/lib/nova.ts');let active=f.records[0],mode='complete',raw;
 const store={getItem:()=>raw??null,setItem:(k,v)=>raw=v};Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:store}});t.after(()=>delete globalThis.window);
 const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(n,o,fn)=>fn({name:n})}}});t.after(()=>Object.defineProperty(globalThis,'navigator',nav));
 let deletedGetterCalls=0;
 t.mock.method(globalThis,'fetch',async(url,options={})=>{
  url=String(url);
  if(url==='https://testnet.hashio.io/api'){
   const b=JSON.parse(options.body);let result;
   if(b.method==='eth_chainId')result='0x128';else if(b.method==='eth_getTransactionByHash')result=mode==='pending'?null:active.tx;
   else if(b.method==='eth_getTransactionReceipt')result=active.receipt;
   else if(b.method==='eth_getBlockByNumber')result={number:b.params[0],timestamp:'0x'+BigInt(b.params[0]==='0x'+BigInt(f.input.baseBlock).toString(16)?f.input.baseTimestamp:'1788790010').toString(16)};
   else if(b.method==='eth_call'){
    const parsed=f.asset.parseTransaction({data:b.params[0].data}),name=parsed.name,after=b.params[1]===active.receipt.blockNumber;
    if(mode==='no-history'&&!after)throw Error('Synthetic unavailable history');const state=after?active.r.after:active.r.before;const arg=parsed.args.length?String(parsed.args[0]).toLowerCase():undefined;
    const isBuyer=name==='balanceOfByPartition'||name==='getHeldAmountForByPartition'||name==='getHoldCountForByPartition'||name==='getHoldsIdForByPartition'?String(parsed.args[1]).toLowerCase()===f.l.accounts.Buyer.address:arg===f.l.accounts.Buyer.address;
    const k=isBuyer?state.buyerKyc:state.sellerKyc;
    const values={getConfigInfo:[n.resolverAddress,f.l.partition,1],getERC20Metadata:[{info:{name:'Nova Private Equity Common Shares',symbol:'NOVA',isin:'USNOVA000016',decimals:0},securityType:1}],getMaxSupply:[1000],paused:[false],isIssuable:[true],isInternalKycActivated:[true],isControllable:[true],isMultiPartition:[false],arePartitionsProtected:[false],isClearingActivated:[false],isActivated:[false],getControlListType:[false],getControlListCount:[0],getExternalPausesCount:[0],getExternalControlListsCount:[0],getExternalKycListsCount:[0],compliance:[f.h.zero],identityRegistry:[f.h.zero],hasRole:[true],isIssuer:[true],totalSupply:[mode==='bad-state'&&after?101:100],getKycFor:[[k.validFrom,k.validTo,k.vcId,k.issuer,k.status]],balanceOf:[isBuyer?state.buyerBalance:state.sellerBalance],balanceOfByPartition:[isBuyer?state.buyerBalance:state.sellerBalance],getHeldAmountFor:[isBuyer?state.buyerHeld:state.sellerHeld],getHeldAmountForByPartition:[isBuyer?state.buyerHeld:state.sellerHeld],getHoldCountForByPartition:[(isBuyer?state.buyerHoldIds:state.sellerHoldIds).length],getHoldsIdForByPartition:[isBuyer?state.buyerHoldIds:state.sellerHoldIds]};
    if(name==='getHoldForByPartition'){if(!state.hold){deletedGetterCalls++;throw Error('Deleted Hold getter must not be called')}const h=state.hold;values[name]=[h.amount,h.expirationTimestamp,h.escrow,h.destination,h.data,h.operatorData,h.thirdPartyType]}
    assert.ok(values[name],name);result=f.asset.encodeFunctionResult(name,values[name]);
   }else throw Error('Unexpected RPC '+b.method);
   return Response.json({jsonrpc:'2.0',id:b.id,result});
  }
  if(url.includes('/accounts/')){const addr=url.split('/accounts/')[1].split('?')[0],account=Object.values(f.l.accounts).find(a=>a.address===addr)??f.l.accounts[active.r.signerRole];return Response.json({evm_address:mode==='wrong-sender'&&addr==='0x'+'0'.repeat(36)+'1234'?f.l.accounts.Buyer.address:account.address,account:account.accountId,deleted:false})}
  if(url.endsWith('/contracts/'+f.l.securityId))return Response.json({contract_id:f.l.securityId,evm_address:f.l.securityAddress,deleted:false});
  if(url.includes('/contracts/results/')){if(mode==='delay')return new Response('',{status:404});return Response.json({hash:active.tx.hash,from:'0x'+'0'.repeat(36)+'1234',to:f.l.securityAddress,amount:0,result:'SUCCESS',block_number:mode==='wrong-block'?999:Number(BigInt(active.receipt.blockNumber)),timestamp:'1788790012.123456789',function_parameters:active.tx.input})}
  if(url.includes('/transactions?'))return Response.json({transactions:[{transaction_id:'0.0.1234-1788790012-123456789',consensus_timestamp:'1788790012.123456789',result:'SUCCESS'}]});
  throw Error('Unexpected HTTP');
 });
 for(active of f.records){
  raw=JSON.stringify([{...active.r,status:'unknown',after:undefined}]);const result=await f.h.recoverHold(active.tx.hash,active.r.action,new AbortController().signal,()=>{});assert.equal(result.status,'complete');assert.deepEqual(result.after,f.e.holdStateEvidence(active.r.after));
  assert.equal(f.h.loadHoldRecords(store).length,1);
 }
 assert.equal(deletedGetterCalls,0);
 active=f.records[0];for(mode of ['delay','pending']){raw=JSON.stringify([{...active.r,status:'unknown'}]);assert.equal((await f.h.recoverHold(active.tx.hash,active.r.action,new AbortController().signal,()=>{})).status,mode==='delay'?'mirror-pending':'pending')}
 for(mode of ['wrong-sender','wrong-block','bad-state','no-history']){raw=JSON.stringify([{...active.r,status:'unknown'}]);await assert.rejects(f.h.recoverHold(active.tx.hash,active.r.action,new AbortController().signal,()=>{}))}
 mode='complete';raw=undefined;await assert.rejects(f.h.recoverHold(active.tx.hash,active.r.action,new AbortController().signal,()=>{}),/base block/);
 assert.equal((await f.h.recoverHold(active.tx.hash,active.r.action,new AbortController().signal,()=>{},f.input.baseBlock)).status,'complete');
});

test('invalid T04 journal cannot leak the operation lease; imported public intent remains pending until recovery',async(t)=>{
 const f=await fixtures(),g=await import('../src/lib/guards.ts');let raw='invalid';
 Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:{getItem:()=>raw,setItem:(k,v)=>raw=v}}});t.after(()=>delete globalThis.window);
 const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(n,o,fn)=>fn({name:n})}}});t.after(()=>Object.defineProperty(globalThis,'navigator',nav));
 await assert.rejects(f.h.runHoldAction({action:'kyc-negative'},()=>{},new AbortController().signal));assert.equal(g.getOperationBusy(),false);
 raw=null;const restored=await f.h.restoreHoldEvidence(f.records[0].r);assert.equal(restored[0].status,'pending');assert.throws(()=>f.h.nextHoldAction(f.held,restored),/recovery/);
 await assert.rejects(f.h.restoreHoldEvidence({...f.records[0].r,transactionHash:'0x'+'3'.repeat(64)}),/conflicts/);
});

test('Buyer preparation binds exact public KYC seconds/digest and genuine verifier rejects unsigned, expired, tampered and wrong-subject inputs',async()=>{
 const f=await fixtures(),c=await import('../src/lib/credentials.ts'),{getAddress}=await import('viem'),now=Date.now();
 const prepared=await c.prepareCredential(f.l.accounts.Admin.address,f.l.accounts.Buyer.address,now);
 assert.equal(prepared.payload.credentialSubject.id,'did:ethr:'+getAddress(f.l.accounts.Buyer.address));
 const kyc={vcId:prepared.payload.id,issuer:f.l.accounts.Admin.address,validFrom:String(Math.floor((now-300000)/1000)),validTo:String(Math.floor((now+7*86400000)/1000)),digest:prepared.digest};
 const decoded=f.asset.decodeFunctionData('grantKyc',await f.h.holdCalldata('buyer-kyc',f.input,kyc));
 assert.equal(decoded[0].toLowerCase(),f.l.accounts.Buyer.address);assert.equal(decoded[1],kyc.vcId);assert.equal(String(decoded[2]),kyc.validFrom);assert.equal(String(decoded[3]),kyc.validTo);assert.equal(decoded[4].toLowerCase(),kyc.issuer);
 for(const value of [prepared.payload,{...prepared.payload,validUntil:'2020-01-01T00:00:00.000Z'},{...prepared.payload,credentialSubject:{...prepared.payload.credentialSubject,passed:false}},{...prepared.payload,credentialSubject:{...prepared.payload.credentialSubject,id:'did:ethr:'+f.l.accounts.Seller.address}}]){
  const result=await c.verifyCredential(value,prepared);assert.equal(result.verified,false);assert.equal(result.verifier,false);
 }
 const unsigned={prepared,credential:prepared.payload,session:7};
 await assert.rejects(f.l.credentialInput(unsigned,{expectedRole:'Admin',session:7},'Buyer'),/Admin-to-Buyer/);
 await assert.rejects(f.l.credentialInput(unsigned,{expectedRole:'Seller',session:7},'Buyer'),/Admin-to-Buyer/);
 assert.ok(c.credentialProblem(prepared.payload,{...prepared,digest:'0x'+'0'.repeat(64)},now));
});

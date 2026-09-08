import assert from 'node:assert/strict';
import {test,mock} from 'node:test';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const hold=await import('../src/hold.ts');
let stateReader=()=>{throw Error('Unexpected state read');};
mock.module('../src/hold.ts',{namedExports:{...hold,readHoldState:(...args)=>stateReader(...args)}});
const t=await import('../src/trade.ts'),e=await import('../src/evidence.ts'),l=await import('../src/lifecycle.ts'),g=await import('../src/guards.ts');
const {keccak256}=await import('viem'),iface=await t.swapInterface(),{asset}=await (await import('../src/nova.ts')).interfaces(),hi=await hold.holdInterface();
const swap='0x'+'9'.repeat(40),hash='0x'+'1'.repeat(64),blockHash='0x'+'2'.repeat(64);
function state() {
 const k={status:1,vcId:'urn:uuid:test-public-metadata',issuer:l.accounts.Admin.address,validFrom:'1788830000',validTo:'1789435100'};
 return {block:'40243275',timestamp:'1788832446',roles:[true,true,true],issuer:true,supply:'100',sellerBalance:'94',buyerBalance:'6',sellerHeld:'0',buyerHeld:'0',sellerKyc:k,buyerKyc:k,sellerHoldIds:[],buyerHoldIds:[]};
}
async function fixture(action='deploy') {
 const start=state(),input={...t.createTradeInput(start),escrow:swap,...(action === 'deploy' ? {} : {holdId:'17'})};
 const held={...start,sellerBalance:'84',sellerHeld:'10',sellerHoldIds:['17'],hold:{id:'17',amount:'10',expirationTimestamp:input.expirationTimestamp,escrow:swap,destination:l.accounts.Buyer.address,data:'0x',operatorData:'0x',thirdPartyType:0}};
 const after={...(action === 'deploy' ? start : action === 'lock' ? held : start),block:'40243277',timestamp:action === 'reclaim' ? input.expirationTimestamp : '1788832450'};
 if(action === 'settle'){after.sellerBalance='84';after.buyerBalance='16';}
 const calldata=await t.tradeCalldata(action,input),role=t.tradeSigner(action),from=l.accounts[role].address;
 const record={schemaVersion:1,chainId:296,kind:'t05-transaction',operationId:action,startedAt:'2026-09-08T01:00:00Z',action,status:'complete',signerRole:role,input,calldata,calldataDigest:keccak256(calldata),walletValueWeibars:action === 'settle' ? String(t.walletPrice) : '0',transactionHash:hash,before:['deploy','lock'].includes(action) ? start : held,after};
 const tx={hash,from,to:action === 'deploy' ? null : action === 'lock' ? l.securityAddress : swap,input:calldata,value:action === 'settle' ? '0xde0b6b3a7640000' : '0x0',chainId:'0x128',blockHash,blockNumber:'0x'+BigInt(after.block).toString(16)};
 const log=(address,face,name,args)=>({address,transactionHash:hash,...face.encodeEventLog(face.getEvent(name),args)});
 const logs=action === 'deploy' ? [log(swap,iface,'Setup',[l.accounts.Admin.address,input.expirationTimestamp])] : action === 'lock' ? [log(l.securityAddress,hi,'HeldByPartition',[from,from,l.partition,17,[10,input.expirationTimestamp,swap,l.accounts.Buyer.address,'0x'],'0x'])] :
 [log(swap,iface,action === 'settle' ? 'Settled' : action === 'cancel' ? 'Cancelled' : 'Reclaimed',action === 'settle' ? [17,l.accounts.Seller.address,l.accounts.Buyer.address,10,t.tinybarPrice] : [17]),
 log(l.securityAddress,hi,action === 'settle' ? 'HoldByPartitionExecuted' : action === 'cancel' ? 'HoldByPartitionReleased' : 'HoldByPartitionReclaimed',action === 'settle' ? [l.accounts.Seller.address,l.partition,17,10,l.accounts.Buyer.address] : action === 'cancel' ? [l.accounts.Seller.address,l.partition,17,10] : [swap,l.accounts.Seller.address,l.partition,17,10])];
 return {start,held,input,record,tx,receipt:{...tx,transactionHash:hash,contractAddress:action === 'deploy' ? swap : null,status:'0x1',logs}};
}
test('T05 fixed constructor, SDK Hold calldata, bytecode and integer HBAR units',async()=>{
 const f=await fixture('lock');const decoded=asset.decodeFunctionData('createHoldByPartition',f.record.calldata);
 assert.equal(decoded[1].amount,10n);assert.equal(decoded[1].escrow.toLowerCase(),swap);assert.equal(decoded[1].to.toLowerCase(),l.accounts.Buyer.address);assert.equal(decoded[1].data,'0x');
 assert.equal(t.walletPrice/t.tinybarPrice,10n**10n);
 for(const action of ['deploy','lock','settle','cancel','reclaim']) {
  const {input,record:r,tx}=await fixture(action),walletTx={from:tx.from,to:tx.to,data:tx.input,value:tx.value,chainId:tx.chainId};
  t.assertTradeTransaction(walletTx,action,input,r.calldata);
  for(const change of [{from:l.accounts[action === 'deploy' ? 'Buyer' : 'Admin'].address},{to:l.accounts.Buyer.address},{chainId:'0x1'},{data:r.calldata+'00'},{value:'0x1'},{value:1},{accessList:[]},{authorizationList:[]}])assert.throws(()=>t.assertTradeTransaction({...walletTx,...change},action,input,r.calldata));
  if(action==='settle')for(const value of ['0x5f5e100','0xde0b6b3a763ffff','0xde0b6b3a7640001','1 HBAR','1000000000000000000'])assert.throws(()=>t.assertTradeTransaction({...walletTx,value},action,input,r.calldata));
 }
 for(const change of [{expirationTimestamp:'1788918846000'},{baseTimestamp:'1788832447'},{partition:'0x'+'0'.repeat(64)},{holder:l.accounts.Buyer.address},{destination:hold.zero},{escrow:l.accounts.Admin.address},{securityId:'0.0.1'},{holdId:'9007199254740992'}])assert.throws(()=>t.assertTradeInput({...f.input,...change}));
 assert.notEqual(t.expectedRuntime(f.input),t.expectedRuntime({...f.input,baseTimestamp:'1788832447',expirationTimestamp:'1788918847'}));
});
test('all five exact receipts, full events and historical transitions bind the same hash and Hold',async()=>{
 for(const action of ['deploy','lock','settle','cancel','reclaim']) {
  const {record:r,tx,receipt}=await fixture(action);
  const input=await t.verifyTradeReceipt(r,tx,receipt);assert.equal(input.escrow,swap);t.assertTradeTransition(r,r.before,r.after);
  for(const change of [{from:l.accounts[action==='deploy'?'Buyer':'Admin'].address},{input:tx.input+'00'},{chainId:'0x1'},{blockHash:hash},{value:'0x5f5e100'}])await assert.rejects(t.verifyTradeReceipt(r,{...tx,...change},receipt));
  for(const change of [{logs:[]},{logs:[...receipt.logs,...receipt.logs]},{transactionHash:blockHash},{blockNumber:'0x1'},{to:l.accounts.Buyer.address}])await assert.rejects(t.verifyTradeReceipt(r,tx,{...receipt,...change}));
  for(const change of [{supply:'101'},{buyerBalance:'100'},{sellerHeld:'9'},{buyerHeld:'1'},{sellerHoldIds:['18']}])assert.throws(()=>t.assertTradeTransition(r,r.before,{...r.after,...change}));
  if(action==='settle')await assert.rejects(t.verifyTradeReceipt(r,tx,{...receipt,logs:receipt.logs.map((log,i)=>i===1?{...log,transactionHash:blockHash}:log)}));
 }
 const f=await fixture('lock');const recovered=await t.verifyTradeReceipt({...f.record,input:{...f.input,holdId:undefined}},f.tx,f.receipt);assert.equal(recovered.holdId,'17');
 await assert.rejects(t.verifyTradeReceipt({...f.record,input:{...f.input,holdId:'18'}},f.tx,f.receipt));
});
test('stage guards stop unknown work, altered state, insufficient KYC, missing evidence and expired purchases',async()=>{
 const d=await fixture(),h=await fixture('lock'),s=await fixture('settle');
 assert.equal(t.nextTradeStep(d.start,[]),'deploy');assert.equal(t.nextTradeStep(d.start,[d.record],0),'lock');
 assert.equal(t.nextTradeStep(h.held,[d.record,h.record],0),'purchase-negative');
 const negative={kind:'t05-simulation',action:'purchase-negative',status:'complete',input:h.input};
 assert.equal(t.nextTradeStep(h.held,[d.record,h.record,negative],0),'settle');
 assert.equal(t.nextTradeStep(s.record.after,[d.record,h.record,negative,s.record],1),'duplicate-negative');
 assert.equal(t.nextTradeStep({...h.held,timestamp:h.input.expirationTimestamp},[d.record,h.record,negative],0),'reclaim');
 for(const status of ['awaiting-signature','pending','unknown','confirmed','mirror-pending','mismatch'])assert.throws(()=>t.nextTradeStep(d.start,[{...d.record,status}]));
 for(const change of [{sellerBalance:'93'},{buyerBalance:'7'},{sellerHeld:'10'},{buyerHeld:'1'},{sellerKyc:{...d.start.sellerKyc,validTo:'1788832447'}},{buyerKyc:{...d.start.buyerKyc,status:0}}])assert.throws(()=>t.nextTradeStep({...d.start,...change},[]));
 for(const key of ['id','amount','escrow','destination','expirationTimestamp','data','operatorData','thirdPartyType'])assert.throws(()=>t.nextTradeStep({...h.held,hold:{...h.held.hold,[key]:'wrong'}},[d.record,h.record],0));
 assert.throws(()=>t.nextTradeStep(h.held,[h.record],0));assert.throws(()=>t.nextTradeStep(h.held,[d.record,h.record],1));
 assert.throws(()=>t.nextTradeStep({...d.start,timestamp:d.input.expirationTimestamp},[d.record],0));
});
test('public journal strips non-whitelisted objects, detects storage failure and restores as unknown',async(test)=>{
 const f=await fixture('settle');const clean=e.tradeEvidence({...f.record,wallet:{key:'EXCLUDED'},signature:'EXCLUDED',error:{text:'EXCLUDED'}});
 assert.doesNotMatch(JSON.stringify(clean),/EXCLUDED|signature|wallet"|error/);
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 t.saveTradeRecords([clean],storage);assert.deepEqual(t.loadTradeRecords(storage),[clean]);
 assert.throws(()=>t.saveTradeRecords([clean],{getItem:()=>null,setItem(){}}));
 t.saveTradeRecords([clean,clean],storage);assert.throws(()=>t.loadTradeRecords(storage));values.clear();
 Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:storage}});test.after(()=>delete globalThis.window);
 const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(n,o,fn)=>fn({name:n})}}});test.after(()=>Object.defineProperty(globalThis,'navigator',nav));
 const restored=await t.restoreTrade(clean);assert.equal(restored[0].status,'unknown');assert.throws(()=>t.nextTradeStep(f.held,restored,0));
 await assert.rejects(t.restoreTrade({...clean,transactionHash:blockHash}));
 await assert.rejects(t.restoreTrade({...clean,calldata:clean.calldata+'00'}));
 assert.equal(g.getOperationBusy(),false);
});
test('HBAR principal is exact and separate from safe integer fee fields',()=>{
 const row={charged_tx_fee:1234,transfers:[{account:l.accounts.Buyer.accountId,amount:-100001234},{account:l.accounts.Seller.accountId,amount:100000000},{account:'0.0.3',amount:1234}]};
 assert.equal(t.paymentEvidence(row).principalTinybars,'100000000');assert.equal(t.paymentEvidence(row).feeTinybars,'1234');
 for(const bad of [{...row,charged_tx_fee:1.5},{...row,transfers:row.transfers.map(r=>({...r,amount:r.amount*1e10}))},{...row,transfers:row.transfers.slice(0,2)},{...row,transfers:row.transfers.map(r=>r.account===l.accounts.Seller.accountId?{...r,amount:99999999}:r)}])assert.throws(()=>t.paymentEvidence(bad));
});
test('history covers all blocks in relay-sized pages and detects an unrecorded operation',async(test)=>{
 const queries=[];let unrecorded=false;
 Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:{getItem:()=>null}}});test.after(()=>delete globalThis.window);
 test.mock.method(globalThis,'fetch',async(url,options)=>{const b=JSON.parse(options.body);assert.equal(b.method,'eth_getLogs');const q=b.params[0];queries.push(q);
  assert.ok(BigInt(q.toBlock)-BigInt(q.fromBlock)<1000n);return Response.json({jsonrpc:'2.0',id:1,result:unrecorded?[{transactionHash:hash}]:[]});});
 await t.recordedHistory(state(),[],new AbortController().signal);assert.equal(queries.length,6);
 for(const offset of [0,3]){assert.equal(BigInt(queries[offset].fromBlock),40241114n);assert.equal(BigInt(queries[offset+2].toBlock),40243275n);for(let i=1;i<3;i++)assert.equal(BigInt(queries[offset+i].fromBlock),BigInt(queries[offset+i-1].toBlock)+1n);}
 unrecorded=true;await assert.rejects(t.recordedHistory(state(),[],new AbortController().signal),/unrecorded/);
});
test('simulations use recorded block, exact wei units and explicit from; transport errors cannot pass',async(test)=>{
 const f=await fixture('settle');let mode='ok';
 test.mock.method(globalThis,'fetch',async(url,options)=>{
  assert.equal(url,'https://testnet.hashio.io/api');const body=JSON.parse(options.body);assert.equal(body.method,'eth_call');assert.equal(body.params[1],'0x'+BigInt(f.start.block).toString(16));
  const tx=body.params[0];assert.equal(tx.to,swap);assert.equal(tx.data,f.record.calldata);
  if(mode==='timeout')throw new DOMException('Controlled timeout','TimeoutError');
  const error=tx.from===l.accounts.Admin.address?'WrongAccount':tx.value==='0xde0b6b3a7640000'?'Closed':'WrongPayment';
  if(error==='WrongPayment')assert.equal(BigInt(tx.value),t.walletPrice-10000000000n);
  return Response.json(mode==='success'?{jsonrpc:'2.0',id:1,result:'0x'}:{jsonrpc:'2.0',id:1,error:{code:3,data:iface.encodeErrorResult(mode==='wrong'?'Closed':error)}});
 });
 const cases=[];for(const check of ['wrong-buyer','wrong-payment'])cases.push(await t.callTradeRevert(f.input,check,f.start.block,new AbortController().signal));
 const sim=e.tradeEvidence({schemaVersion:1,chainId:296,kind:'t05-simulation',operationId:'sim',startedAt:f.record.startedAt,action:'purchase-negative',status:'complete',input:f.input,cases,transactionHash:hash,transactionId:'0.0.1-1-1'});
 assert.doesNotMatch(JSON.stringify(sim),/transactionHash|transactionId/);
 for(mode of ['timeout','success','wrong'])await assert.rejects(t.callTradeRevert(f.input,'wrong-buyer',f.start.block,new AbortController().signal));
});
test('original-hash recovery retains pending and Mirror delay, verifies runtime, same receipt and payment',async(test)=>{
 const f=await fixture('settle'),values=new Map();let mode='receipt-pending';
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:storage}});test.after(()=>delete globalThis.window);
 const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request:async(n,o,fn)=>fn({name:n})}}});test.after(()=>Object.defineProperty(globalThis,'navigator',nav));
 t.saveTradeRecords([{...f.record,status:'unknown'}]);
 stateReader=(signal,block)=>{signal.throwIfAborted();return block===f.tx.blockNumber ? f.record.after : {...f.record.before,block:String(BigInt(f.tx.blockNumber)-1n)};};
 const calls=[];
 test.mock.method(globalThis,'fetch',async(url,options)=>{
  if(url==='https://testnet.hashio.io/api'){
   const b=JSON.parse(options.body);calls.push(b.method);let result;
   if(b.method==='eth_chainId')result='0x128';
   else if(b.method==='eth_getTransactionByHash'){assert.equal(b.params[0],hash);result=f.tx;}
   else if(b.method==='eth_getTransactionReceipt')result=mode==='receipt-pending'?null:f.receipt;
   else if(b.method==='eth_getBlockByNumber')result={number:b.params[0],timestamp:'0x'+BigInt(f.input.baseTimestamp).toString(16)};
   else if(b.method==='eth_getCode')result=mode==='wrong-code'?'0x00':t.expectedRuntime(f.input);
   else if(b.method==='eth_call')result=iface.encodeFunctionResult('state',[b.params[1]===f.tx.blockNumber?1:0]);
   else throw Error('Unexpected RPC method');
   return Response.json({jsonrpc:'2.0',id:1,result});
  }
  assert.ok(url.startsWith('https://testnet.mirrornode.hedera.com/api/v1/'));
  if(url.includes('contracts/results/'))return mode==='mirror-pending'?new Response('',{status:404}):Response.json({from:l.accounts.Buyer.address,hash,to:swap,block_number:Number(f.record.after.block),function_parameters:f.record.calldata,amount:100000000,timestamp:'1788832452.000000123',result:'SUCCESS'});
  if(url.includes('accounts/'))return Response.json({account:l.accounts.Buyer.accountId,evm_address:l.accounts.Buyer.address,deleted:false});
  if(url.includes('contracts/'))return Response.json({contract_id:'0.0.99999',evm_address:swap,deleted:false});
  return Response.json({links:{next:null},transactions:[{transaction_id:'0.0.123-1788832452-123',consensus_timestamp:'1788832452.000000123',result:'SUCCESS',charged_tx_fee:1234,transfers:[{account:l.accounts.Buyer.accountId,amount:-100001234},{account:l.accounts.Seller.accountId,amount:mode==='wrong-principal'?99999999:100000000},{account:'0.0.3',amount:1234}]}]});
 });
 const recover=()=>t.recoverTrade('settle',hash,new AbortController().signal,()=>{});
 assert.equal((await recover()).status,'pending');mode='mirror-pending';assert.equal((await recover()).status,'mirror-pending');
 mode='wrong-code';await assert.rejects(recover(),/bytecode/);assert.equal(t.loadTradeRecords()[0].transactionHash,hash);
 mode='wrong-principal';await assert.rejects(recover(),/principal|debit/);
 mode='complete';const result=await recover();assert.equal(result.status,'complete');assert.equal(result.payment.principalTinybars,'100000000');assert.equal(result.consensusTimestamp,'1788832452.000000123');
 assert.ok(calls.every(c=>!c.includes('send')&&!c.includes('sign')));assert.equal(g.getOperationBusy(),false);
 const c=new AbortController();c.abort();await assert.rejects(t.recoverTrade('settle',hash,c.signal,()=>{}));assert.equal(t.loadTradeRecords()[0].transactionHash,hash);
});

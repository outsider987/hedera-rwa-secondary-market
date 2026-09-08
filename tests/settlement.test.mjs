import assert from 'node:assert/strict';
import {test} from 'node:test';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const m=await import('../src/lib/settlement.ts'),v=JSON.parse(readFileSync(new URL('./fixtures/settlement-vector.json',import.meta.url)));
test('public settlement vector binds parties, amounts, both orders, Hold, expiry and deployment',()=>{
 assert.equal(m.settlementDigest(v),v.digest);
 for(const [k,value] of [['amount','3'],['priceTinybars','9000000'],['holdId','18'],['sellerOrder','0x'+'44'.repeat(32)],['matchId','0x'+'55'.repeat(32)]])assert.notEqual(m.settlementDigest({...v,terms:{...v.terms,[k]:value}}),v.digest);
 assert.notEqual(m.settlementDigest({...v,contract:'0x'+'66'.repeat(20)}),v.digest);
 for(const [k,value] of [['amount','0'],['amount','1001'],['priceTinybars','9223372036854775807'],['holdId','01'],['expiry','1788834245']])assert.throws(()=>m.settlementDigest({...v,terms:{...v.terms,[k]:value}}));
 assert.equal(m.rpcWeibars(m.settlementPrincipal(v)),'200000000000000000');
});
test('expiry never asserts funds returned and account identity is separate from trading role',()=>{
 const s={...v,status:'Ready'},expiry=BigInt(v.terms.expiry);
 assert.equal(m.settlementAction(s,v.terms.buyer,expiry-1n),'settle');
 assert.equal(m.settlementAction(s,v.terms.buyer,expiry),undefined);
 assert.equal(m.settlementAction(s,v.terms.seller,expiry),'reclaim');
 assert.equal(m.settlementStatus(s,expiry),'Expired · Reclaim required');
 assert.equal(m.settlementAction({...s,status:'Locked'},v.terms.seller,expiry),'orphan');
 assert.equal(m.settlementAction(s,'0xfd8fdb4989a916c6f2420a2116c356e34c889840',expiry),undefined);
 assert.equal(m.settlementStatus({...s,status:'Settled'},expiry),'Settled');
});
test('public operation and evidence storage strip arbitrary fields and preserve unknowns beyond expiry',()=>{
 const o={id:'a'.repeat(64),settlementId:'13-1',action:'settle',sender:v.terms.buyer,to:v.contract,calldata:'0x12345678',value:'200000000000000000',status:'pending',hash:'0x'+'b'.repeat(64),createdAt:'1788832446',wallet:'DO_NOT_EXPORT',evidence:{hash:'0x'+'b'.repeat(64),block:'40250000',timestamp:'1788834247',contract:v.contract,holdId:'17',feeTinybars:'12',principalTinybars:'20000000',transactionId:'public-test-double',logIndices:['1'],reverted:false,error:'DO_NOT_EXPORT'}};
 let raw;const storage={getItem:()=>raw,setItem:(_,s)=>raw=s};m.saveSettlement({operation:o,attempted:true,rejected:false},storage);assert.doesNotMatch(raw,/DO_NOT_EXPORT|wallet|error/);assert.equal(m.loadSettlement(storage).operation.status,'pending');assert.equal(m.loadSettlement(storage).attempted,true);assert.throws(()=>m.saveSettlement({operation:o,attempted:true,rejected:false},{getItem:()=>null,setItem(){}}));
});
test('T08 wallet transaction rejects extra fields and wrong RPC units before a prompt',()=>{
 const o={action:'settle',sender:v.terms.buyer,to:v.contract,calldata:'0x12345678',value:'200000000000000000'},tx={from:o.sender,to:o.to,data:o.calldata,value:'0x2c68af0bb140000',chainId:'0x128'};
 m.assertSettlementTransaction(tx,o);for(const change of [{value:'0x1312d00'},{from:v.terms.seller},{chainId:'0x1'},{authorizationList:[]},{nonce:'1'}])assert.throws(()=>m.assertSettlementTransaction({...tx,...change},o));
});
test('SDK lock may omit zero value and chain only after the separate wallet review guard',()=>{
 const o={action:'lock',sender:v.terms.seller,to:'0x261ce349df182988fa25d00868cf6cf434220c24',calldata:'0x12345678',value:'0'},tx={from:o.sender,to:o.to,data:o.calldata};m.assertSettlementTransaction(tx,o);
 assert.throws(()=>m.assertSettlementTransaction({...tx,value:'0x1'},o));assert.throws(()=>m.assertSettlementTransaction({...tx,chainId:'0x1'},o));assert.throws(()=>m.assertSettlementTransaction(tx,{...o,action:'settle'}));
});

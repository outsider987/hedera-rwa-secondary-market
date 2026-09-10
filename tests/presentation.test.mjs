import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {cues,demoReducer,initialDemo,demoMode,demoURL,demoKey} from '../src/presentation/demoState.ts';
import {depth,updateMatches,emptySnapshot} from '../src/presentation/marketView.ts';
const json=p=>JSON.parse(readFileSync(p));
test('demo cues, replay, timed pause/resume and manual interruption preserve exact position',()=>{
 let s=demoReducer(initialDemo,{type:'play'});s=demoReducer(s,{type:'tick',seconds:49.5});assert.equal(cues[s.index].title,'Credential verified');
 s=demoReducer(s,{type:'pause'});assert.deepEqual(demoReducer(s,{type:'tick',seconds:100}),s);
 s=demoReducer(s,{type:'resume'});s=demoReducer(s,{type:'tick',seconds:5.5});assert.equal(cues[s.index].title,'KYC grant recorded');
 s=demoReducer(s,{type:'next'});assert.equal(s.playing,false);assert.equal(s.elapsed,60);
 s=demoReducer(s,{type:'next'});s=demoReducer(s,{type:'replay'});assert.equal(s.elapsed,60);
 s=demoReducer(s,{type:'previous'});assert.equal(s.elapsed,55);
 s=demoReducer(s,{type:'play'});s=demoReducer(s,{type:'tick',seconds:180});assert.equal(s.index,cues.length-1);assert.equal(s.playing,false);
 assert.deepEqual(demoReducer(s,{type:'restart'}),{...initialDemo,revision:s.revision+1});
});
test('URL mode preserves path, query and hash; keyboard excludes interactive/repeated/modified events',()=>{
 assert.equal(demoMode('?demo=1'),true);assert.equal(demoMode('?demo=0'),false);
 assert.equal(demoURL('https://example.com/path/?x=2#market',true),'/path/?x=2&demo=1#market');
 assert.equal(demoURL('https://example.com/path/?demo=1&x=2#overview',false),'/path/?x=2#overview');
 const e={key:' ',repeat:false,altKey:false,ctrlKey:false,metaKey:false,shiftKey:false};assert.equal(demoKey(e,false),'next');assert.equal(demoKey(e,true),undefined);
 for(const k of ['repeat','altKey','ctrlKey','metaKey','shiftKey'])assert.equal(demoKey({...e,[k]:true},false),undefined);
 assert.equal(demoKey({...e,key:'ArrowLeft'},false),'previous');assert.equal(demoKey({...e,key:'Escape'},false),'exit');
});
test('depth aggregates exact integers, sorts price priority, limits five levels and never mutates orders',()=>{
 const orders=[{side:'Sell',remaining:'9007199254740993',price:'10000001',sequence:'2'},{side:'Sell',remaining:'7',price:'10000001',sequence:'1'},...Array.from({length:7},(_,i)=>({side:'Buy',remaining:'2',price:String(10000000+i),sequence:String(i+3)}))];
 const copy=structuredClone(orders),result=depth(orders);assert.deepEqual(orders,copy);assert.equal(result.length,6);assert.equal(result[0].price,'10000006');assert.equal(result.at(-1).quantity,'9007199254741000');assert.equal(result.at(-1).ratio,1);assert.deepEqual(depth([]),[]);
});
test('server match snapshots suppress initial, duplicate, reconnect and hidden replays; batch new IDs',()=>{
 const a={id:'1-1',quantity:'4'},b={id:'1-2',quantity:'2'},c={id:'2-1',quantity:'3'};
 let s=updateMatches(emptySnapshot,[a],true,true);assert.deepEqual(s.fresh,[]);
 s=updateMatches(s,[a,b,c,c],true,true);assert.deepEqual(s.fresh,[b,c]);
 s=updateMatches(s,[a,b,c],true,true);assert.deepEqual(s.fresh,[]);
 s=updateMatches(s,[a,b,c],false,true);assert.equal(s.online,false);assert.equal(s.ids.size,3);
 s=updateMatches(s,[a,b,c,{id:'3-1'}],true,true);assert.deepEqual(s.fresh,[]);
 s=updateMatches(s,[],true,false);s=updateMatches(s,[a,b,c,{id:'4-1'}],true,true);assert.deepEqual(s.fresh,[]);
});
test('presentation snapshot matches T02/T03/T07/T05 original public evidence, without T08 balances',()=>{
 const creation=json('docs/evidence/024-vc-nova-manual.json').verifiedNova;
 const p=json('src/data/presentation.json'),t=json('docs/evidence/032-t05-manual.json'),m=json('docs/evidence/035-t07-manual.json').checkpoints[2].exports[2],issue=json('docs/evidence/027-t03-manual.json').operations;
 assert.equal(p.tokenization.creationHash,creation.transactionHash);assert.equal(p.tokenization.initialSupply,creation.comparisons.find(c=>c.field==='Total supply').actual);assert.equal(p.tokenization.issuanceHash,issue.find(o=>o.action==='issue').transactionHash);assert.equal(p.tokenization.kycHash,issue.find(o=>o.action==='seller-kyc').transactionHash);
 assert.deepEqual(p.matching.matches,m.matches);assert.deepEqual(p.matching.orders,m.orders.filter(o=>['1','4','5'].includes(o.sequence)));
 assert.deepEqual(p.matching.matches.map(m=>[m.quantity,m.price]),[['4','9000000'],['2','10000000']]);assert.equal(p.matching.orders.find(o=>o.sequence==='4').remaining,'3');
 assert.equal(p.tokenization.issuanceBlock,issue.find(o=>o.action==='issue').after.block);assert.equal(p.tokenization.issued,issue.find(o=>o.action==='issue').after.supply);assert.equal(p.tokenization.kycBlock,issue.find(o=>o.action==='seller-kyc').after.block);
 for(const [name,key] of [['lock','lock'],['settlement','settlement']]){assert.equal(p.swap[name].hash,t[key].transactionHash);assert.equal(p.swap[name].block,t[key].after.block);for(const when of ['before','after'])assert.deepEqual(p.swap[name][when],{sellerAvailable:t[key][when].sellerBalance,sellerHeld:t[key][when].sellerHeld,buyerAvailable:t[key][when].buyerBalance,buyerHeld:t[key][when].buyerHeld});}
 assert.equal(p.swap.verificationBlock,t.finalAcceptance.finalBlock);assert.notEqual(p.swap.verificationBlock,p.swap.settlement.block);assert.equal(p.swap.principalTinybars,t.settlement.payment.principalTinybars);assert.equal(p.swap.feeTinybars,t.settlement.payment.feeTinybars);
});

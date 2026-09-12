import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

test('next actions follow actual match roles, expiry and historical eligibility',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {matchAction,settlementProgress}=await server.ssrLoadModule('/src/presentation/marketTasks.ts');
  const cases=JSON.parse(readFileSync('docs/evidence/038-t08-manual.json')).cases;
  for(const {match,settlement} of cases.slice(0,2)){
   const before=BigInt(settlement.terms.expiry)-1n,expiry=before+1n;
   assert.equal(matchAction(match,undefined,match.seller,true,before),'lock');
   assert.equal(matchAction(match,undefined,match.buyer,true,before),undefined);
   for(const [status,who,action] of [['Locked',match.seller,'register'],['Ready',match.buyer,'settle']]){
    assert.equal(matchAction(match,{...settlement,status},who,true,before),action);
    assert.equal(matchAction(match,{...settlement,status},who,false,before),undefined);
   }
   assert.equal(matchAction(match,{...settlement,status:'Ready'},match.buyer,true,expiry),undefined);
   assert.equal(matchAction(match,{...settlement,status:'Ready'},match.seller,true,expiry),'reclaim');
   assert.equal(matchAction(match,{...settlement,status:'Locked'},match.seller,true,expiry),'orphan');
   for(const status of ['Settled','Cancelled','Reclaimed','Returned'])assert.equal(matchAction(match,{...settlement,status},match.seller,true,before),undefined);
  }
  assert.deepEqual(['Unprepared','Locked','Ready','Settled'].map(settlementProgress),[1,2,3,4]);
  for(const stage of ['Unknown','Expired · Reclaim required','Cancelled','Reclaimed','Returned'])assert.equal(settlementProgress(stage),undefined);
 }finally{await server.close();}
});

test('task guidance hides action claims for stale data and prioritizes original-operation recovery',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {default:Tasks}=await server.ssrLoadModule('/src/components/MarketNextActions.tsx');
  const {match}=JSON.parse(readFileSync('docs/evidence/038-t08-manual.json')).cases[0];
  const props={market:{matches:[match]},settlementData:{settlements:[]},owner:match.seller,online:true,busy:false,freshMatch:()=>true,onSelect(){},onRecover(){},onAll(){}};
  const render=extra=>renderToStaticMarkup(createElement(Tasks,{...props,...extra}));
  assert.match(render({}),/1 match needs this account/);
  assert.match(render({}),new RegExp('Open match '+match.id));
  const stale=render({online:false});assert.match(stale,/Next actions are not confirmed/);assert.doesNotMatch(stale,/Open match/);
  const pending=render({blocker:'Verify original operation',busy:true});assert.match(pending,/Verify original operation/);assert.match(pending,/disabled=""/);assert.doesNotMatch(pending,/Open match/);
  assert.match(render({owner:match.buyer}),/No match needs this account/);
  assert.match(render({owner:''}),/Connect Seller or Buyer/);
  const many=render({market:{matches:Array.from({length:5},(_,i)=>({...match,id:String(i)}))}});
  assert.equal((many.match(/Open match/g)??[]).length,3);assert.match(many,/View all 5 tasks/);
 }finally{await server.close();}
});

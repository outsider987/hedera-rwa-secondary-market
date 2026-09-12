import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

test('settlement copy distinguishes unavailable snapshots, terminal outcomes and historical restrictions',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {default:Panel}=await server.ssrLoadModule('/src/components/SettlementPanel.tsx');
  const {match,settlement}=JSON.parse(readFileSync('docs/evidence/038-t08-manual.json')).cases[0];
  const props={match,owner:match.seller,roles:{},session:0,online:false,locked:false,eligible:false,onNewOrder(){},onUpdated(){}};
  const render=extra=>renderToStaticMarkup(createElement(Panel,{...props,...extra}));
  const unknown=render({settlementKnown:false});
  assert.match(unknown,/Settlement status unavailable/);
  assert.equal((unknown.match(/<dd>Not confirmed<\/dd>/g)??[]).length,3);
  assert.doesNotMatch(unknown,/<dd>Not locked|<dd>Not paid|Historical match/);
  for(const status of ['Settled','Cancelled','Reclaimed','Returned']){
   const html=render({settlementKnown:true,settlement:{...settlement,status}});
   assert.ok(html.includes(`<strong>${status}</strong>`));
   assert.match(html,/None · complete/);
   assert.doesNotMatch(html,/Historical match · No settlement/);
  }
  const historical=render({settlementKnown:true});
  assert.match(historical,/Historical match · No settlement is permitted/);
  assert.match(historical,/<dd>Not locked<\/dd>/);
 }finally{await server.close();}
});

test('match emptiness follows filtered results and distinguishes unavailable and stale data',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {default:List}=await server.ssrLoadModule('/src/components/MatchesList.tsx');
  const {match,settlement}=JSON.parse(readFileSync('docs/evidence/038-t08-manual.json')).cases[0];
  const props={market:{matches:[match]},settlementData:{settlements:[settlement]},owner:match.seller,online:true,settlementOnline:true,freshMatch:()=>true,setMatchFilter(){},onSelect(){}};
  const render=extra=>renderToStaticMarkup(createElement(List,{...props,...extra}));
  for(const matchFilter of ['Active','Needs your action']){
   const html=render({matchFilter});
   assert.match(html,/No (active matches|matches need your action)/);
   assert.match(html,/Show all matches/);
   assert.doesNotMatch(html,/View match /);
  }
  assert.match(render({matchFilter:'Completed',owner:'0x0000000000000000000000000000000000000001'}),/No completed matches/);
  assert.match(render({matchFilter:'All',owner:''}),/Connect a trading account/);
  assert.match(render({matchFilter:'Active',market:undefined}),/Market data unavailable/);
  const unavailable=render({matchFilter:'Completed',settlementData:undefined,settlementOnline:false});
  assert.match(unavailable,/cannot be confirmed/);assert.doesNotMatch(unavailable,/No completed matches/);
  const stale=render({matchFilter:'Completed',settlementOnline:false});
  assert.match(stale,/Showing last received status/);assert.match(stale,/View match /);
 }finally{await server.close();}
});

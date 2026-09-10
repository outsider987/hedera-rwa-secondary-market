import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

test('header portraits follow recognized connected roles and preserve native wallet controls',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {default:Header}=await server.ssrLoadModule('/src/components/Header.tsx');
  for(const activeRole of ['Admin','Seller','Buyer']){
   const html=renderToStaticMarkup(createElement(Header,{activeRole,connected:true,disabled:false,onWallet(){}}));
   assert.match(html,new RegExp(`data-sprite="${activeRole.toLowerCase()}"`));assert.match(html,/aria-hidden="true"/);assert.match(html,/aria-describedby="wallet-status"/);assert.match(html,/>Disconnect<\/button>/);
  }
  for(const [connected,activeRole,expected] of [[false,'Seller','Not connected'],[true,undefined,'Unassigned account']]){
   const html=renderToStaticMarkup(createElement(Header,{activeRole,connected,disabled:true,onWallet(){}}));
   assert.doesNotMatch(html,/data-sprite=/);assert.ok(html.includes(expected));assert.match(html,/<button[^>]*disabled=""/);
  }
 }finally{await server.close();}
});

test('Market pixel totals retain BigInt precision across all accounts and prices, with honest initial offline copy',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {default:MarketVisualization}=await server.ssrLoadModule('/src/presentation/MarketVisualization.tsx');
  const orders=[{side:'Buy',price:'1',remaining:'9007199254740993',sequence:'1'},{side:'Buy',price:'2',remaining:'7',sequence:'2'},{side:'Sell',price:'3',remaining:'4',sequence:'3'},{side:'Sell',price:'4',remaining:'0',sequence:'4'}];
  const html=renderToStaticMarkup(createElement(MarketVisualization,{orders,matches:[],statuses:{},online:false,updated:'',visible:true}));
  assert.match(html,/id="book-heading"/);assert.match(html,/class="market-visual-body"/);assert.doesNotMatch(html,/Collapse|Expand/);assert.ok(html.includes('9007199254741000 NOVA'));assert.ok(html.includes('4 NOVA'));assert.ok(html.includes('All open bids'));assert.ok(html.includes('All open asks'));assert.ok(html.includes('Awaiting first snapshot'));assert.match(html,/Matching does not transfer assets/);
 }finally{await server.close();}
});

test('selected Market exchange uses verified states, exact amounts and reversed account roles',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {default:View}=await server.ssrLoadModule('/src/presentation/MarketVisualization.tsx');
  const match={id:'test',seller:'0xa1f2872ee7a9f74523ae0887a9dc428ff1340706',buyer:'0x740e4ef58151a169621622577a5b6d6ff5010836',quantity:'3',price:'10000000',notional:'30000000'};
  const unknown=renderToStaticMarkup(createElement(View,{orders:[],matches:[match],selectedMatch:match,statuses:{},online:false,updated:'',visible:true,settlementKnown:false}));
  assert.ok(unknown.includes('Asset locations not confirmed'));assert.doesNotMatch(unknown,/NOVA not locked|HBAR not paid|Last known settlement state/);assert.ok(unknown.includes('visibility:hidden'));
  for(const [status,shares,payment,copy] of [['Locked',100,200,'Seller registration required'],['Ready',100,200,'Waiting for buyer payment'],['Expired · Reclaim required',100,200,'Seller must return NOVA'],['Settled',200,0,'NOVA delivered · HBAR paid'],['Cancelled',0,200,'Trade closed'],['Reclaimed',0,200,'Trade closed'],['Returned',0,200,'Trade closed'],['Matched · Not settled',0,200,'NOVA not locked']]){
   const html=renderToStaticMarkup(createElement(View,{orders:[],matches:[match],selectedMatch:match,statuses:{test:status},online:false,updated:'',visible:true}));
   assert.ok(html.includes(copy));assert.ok(html.includes('3 NOVA'));assert.ok(html.includes('0.3 HBAR'));assert.match(html,new RegExp(`shares"[^>]*><div style="transform:translateX\\(${shares}%\\)`));assert.match(html,new RegExp(`payment"[^>]*><div style="transform:translateX\\(${payment}%\\)`));assert.ok(html.includes('Offline · Last known settlement state'));assert.doesNotMatch(html,/Waiting for new matches/);assert.match(html,/data-sprite="buyer"[\s\S]*Selling account/);
  }
 }finally{await server.close();}
});

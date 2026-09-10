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
  assert.match(html,/aria-expanded="false"/);assert.doesNotMatch(html,/class="market-visual-body"/);assert.ok(html.includes('9007199254741000 NOVA'));assert.ok(html.includes('4 NOVA'));assert.ok(html.includes('All open bids'));assert.ok(html.includes('All open asks'));assert.ok(html.includes('Awaiting first snapshot'));assert.match(html,/Matching does not transfer assets/);
 }finally{await server.close();}
});

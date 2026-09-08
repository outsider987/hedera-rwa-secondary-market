// Explicit public fixtures and an isolated read-only wallet. Never approve or send a transaction.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const {settlementDigest}=await import('../../src/settlement.ts');
const {chromium}=await import(process.argv[2]);
const {snapshot}=JSON.parse(readFileSync(new URL('./036-t07-layout-fixtures.json',import.meta.url)));
const vector=JSON.parse(readFileSync(new URL('../../tests/fixtures/settlement-vector.json',import.meta.url)));
const seller=vector.terms.seller,buyer=vector.terms.buyer,admin='0xfd8fdb4989a916c6f2420a2116c356e34c889840',results=[];
async function capture(page,path){await page.evaluate(()=>window.scrollTo(0,0));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path,fullPage:true});}
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
try{for(const port of [5173,4173])for(const width of [1440,390]){
 const now=Math.floor(Date.now()/1000);const market=structuredClone(snapshot);market.domain.salt=vector.salt;market.serverTime=String(now);
 const makeOrder=(side,owner,id,sequence)=>({...market.orders[0],action:'Place',side,owner,orderId:id,requestId:id,quantity:'2',price:'10000000',sequence,acceptedAt:String(now),expiresAt:String(now+86400),remaining:'0',matched:'2',cancelled:'0',expired:'0',reason:''});
 market.orders=[makeOrder('Sell',seller,vector.terms.sellerOrder.slice(2),'13'),makeOrder('Buy',buyer,vector.terms.buyerOrder.slice(2),'14')];market.matches=[{id:vector.id,maker:market.orders[0].orderId,taker:market.orders[1].orderId,seller,buyer,quantity:'2',price:'10000000',notional:'20000000',time:String(now),status:'Matched · Not settled'}];
 const s={...vector,status:'Ready',baseBlock:'40250000',updatedAt:String(now),terms:{...vector.terms,preparedAt:String(now),expiry:String(now+1800)}};s.digest=settlementDigest(s);
 const evidence={hash:'0x'+'a'.repeat(64),block:'40250000',timestamp:String(now),contract:s.contract,holdId:'0',feeTinybars:'1',principalTinybars:'0',transactionId:'explicit-browser-fixture',logIndices:['1'],reverted:false};
 const deployment={address:s.contract,salt:s.salt,cutoff:'12',evidence};let offline=false,reads=0;
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference',serviceWorkers:'block'}),page=await context.newPage(),errors=[],writes=[];
 await context.addInitScript(({seller,buyer,admin})=>{localStorage.setItem('holdbook.testnet.roles.v1',JSON.stringify({Seller:seller,Buyer:buyer,Admin:admin}));window.active=seller;const handlers={};window.changeAccount=()=>{window.active=buyer;for(const f of handlers.accountsChanged||[])f([buyer])};window.ethereum={isMetaMask:true,on(n,f){(handlers[n]??=[]).push(f)},removeListener(n,f){handlers[n]=(handlers[n]||[]).filter(g=>g!==f)},async request({method}){if(method==='eth_accounts'||method==='eth_requestAccounts')return[window.active];if(method==='eth_chainId')return'0x128';throw Error('Wallet mutation forbidden in browser fixture');}}},{seller,buyer,admin});
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('https://**/*',route=>route.abort());
 await context.route('**/api/**',r=>{if(new URL(r.request().url()).origin!==`http://127.0.0.1:${port}`)return r.abort();if(r.request().method()!=='GET'){writes.push(r.request().url());return r.abort()};if(offline)return r.fulfill({status:503,json:{error:'Explicit offline fixture'}});reads++;const path=new URL(r.request().url()).pathname;return r.fulfill({json:path==='/api/market'?market:path==='/api/settlement-deployment'?deployment:path==='/api/settlements'?{settlements:[s],pendingOperation:null}:s});});
 await page.goto(`http://127.0.0.1:${port}`);await page.bringToFront();
 const nav=page.getByRole('navigation',{name:'Main navigation'});
 await page.getByRole('heading',{name:'Meet NOVA.',exact:true}).waitFor();
 const demo=page.locator('#overview .nova-flow');
 for(const [label,position] of [['Minting','0'],['Matched','0'],['Locked','1'],['Confirmed','1'],['Delivered','2'],['Returned','0']]){
  await page.getByRole('button',{name:label,exact:true}).click();
  assert.equal(await demo.getAttribute('data-position'),position);
 }
 await page.getByRole('button',{name:'Locked',exact:true}).click();
 assert.equal(await demo.locator('.nova-flow-carrier').evaluate(e=>getComputedStyle(e).transitionDuration),'0.26s');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await demo.locator('.nova-flow-carrier').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 await page.getByRole('button',{name:'Minting',exact:true}).click();
 assert.equal(await demo.locator('img').evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 if(port===4173)await capture(page,`docs/evidence/043-nova-motion-overview-${width}.png`);
 await nav.getByRole('link',{name:'Market',exact:true}).click();
 await page.getByRole('button',{name:'Connect',exact:true}).click();
 await page.getByRole('button',{name:'View match 13-1',exact:true}).click();
 const live=page.locator('.settlement-ticket .nova-flow');
 await live.waitFor();
 const verified=[];
 for(const [status,position] of [['Unprepared','0'],['Locked','1'],['Ready','1'],['Settled','2'],['Cancelled','0'],['Reclaimed','0'],['Returned','0']]){
  console.log(port,width,status);s.status=status;
  await page.waitForFunction(({status})=>document.querySelector('.settlement-ticket pre')?.textContent.includes('"status": "'+status+'"'),{status});
  assert.equal(await live.getAttribute('data-position'),position);
  await page.waitForTimeout(300);
  const payment=await live.locator('.nova-flow-payment').evaluate(e=>({x:new DOMMatrix(getComputedStyle(e).transform).m41,width:e.getBoundingClientRect().width}));
  assert.ok(Math.abs(payment.x-(status==='Settled'?0:payment.width*2))<1);
  if(status==='Settled'&&port===4173)await capture(page,`docs/evidence/043-nova-motion-delivered-${width}.png`);
  verified.push(status);
 }
 s.status='Ready';s.terms.preparedAt=String(now-1801);s.terms.expiry=String(now-1);s.digest=settlementDigest(s);
 await page.getByText('Expiry stops payment. NOVA remains locked until reclaim is verified.',{exact:true}).waitFor();
 assert.equal(await live.getAttribute('data-position'),'1');
 assert.match(await page.locator('.settlement-ticket').innerText(),/0.1 HBAR \/ NOVA/);
 const operation={id:'b'.repeat(64),settlementId:s.id,action:'settle',sender:buyer,to:s.contract,calldata:'0x1234',value:'0',status:'pending',hash:'0x'+'c'.repeat(64),createdAt:String(now)};
 for(const rejected of [false,true]){
  await page.evaluate(({operation,rejected})=>{localStorage.setItem('holdbook.testnet.t08.v1',JSON.stringify({operation,attempted:true,rejected}));window.dispatchEvent(new StorageEvent('storage',{key:'holdbook.testnet.t08.v1'}));},{operation,rejected});
  if(!rejected)await page.getByText('Transaction submitted or unknown · Verify the original operation',{exact:true}).waitFor();
  else await page.getByText('Expiry stops payment. NOVA remains locked until reclaim is verified.',{exact:true}).waitFor();
  assert.equal(await live.getAttribute('data-position'),'1');
 }
 await page.evaluate(()=>{localStorage.removeItem('holdbook.testnet.t08.v1');window.dispatchEvent(new StorageEvent('storage',{key:'holdbook.testnet.t08.v1'}));});
 if(port===4173)await capture(page,`docs/evidence/043-nova-motion-expired-${width}.png`);
 offline=true;
 await page.getByText('Settlement service unavailable. Last received data is retained; actions requiring fresh data are disabled.',{exact:true}).waitFor();
 assert.equal(await live.getAttribute('data-position'),'1');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 results.push({port,width,manualDemo:true,verifiedPositions:verified,expiryRetainsHold:true,pendingAndRejectedRetainHold:true,offlineRetainsHold:true,reducedMotion:true,unitPrice:true,overflow:false,walletMutations:0});
 await context.close();
}}finally{await browser.close();}
writeFileSync('docs/evidence/043-nova-motion.json',JSON.stringify({recordedAt:new Date().toISOString(),kind:'Isolated read-only wallet and synthetic verified API snapshots; no live transactions',results},null,2)+'\n');

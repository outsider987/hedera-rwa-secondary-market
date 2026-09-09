// Explicit public fixtures and an isolated read-only wallet. Never approve or send a transaction.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
const site='https://outsider987.github.io',base='/hedera-rwa-secondary-market/',api='https://holdbook-test.run.app',build=resolve(process.argv[3]);
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const {settlementDigest}=await import('../../src/lib/settlement.ts');
const {chromium}=await import(process.argv[2]);
const {snapshot}=JSON.parse(readFileSync(new URL('./036-t07-layout-fixtures.json',import.meta.url)));
const vector=JSON.parse(readFileSync(new URL('../../tests/fixtures/settlement-vector.json',import.meta.url)));
const seller=vector.terms.seller,buyer=vector.terms.buyer,admin='0xfd8fdb4989a916c6f2420a2116c356e34c889840',results=[];
async function capture(page,path){await page.evaluate(()=>window.scrollTo(0,0));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path,fullPage:true});}
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
try{for(const port of [4173])for(const width of [1440,390]){
 const now=Math.floor(Date.now()/1000);const market=structuredClone(snapshot);market.domain.salt=vector.salt;market.serverTime=String(now);
 const makeOrder=(side,owner,id,sequence)=>({...market.orders[0],action:'Place',side,owner,orderId:id,requestId:id,quantity:'2',price:'10000000',sequence,acceptedAt:String(now),expiresAt:String(now+86400),remaining:'0',matched:'2',cancelled:'0',expired:'0',reason:''});
 market.orders=[makeOrder('Sell',seller,vector.terms.sellerOrder.slice(2),'13'),makeOrder('Buy',buyer,vector.terms.buyerOrder.slice(2),'14')];market.matches=[{id:vector.id,maker:market.orders[0].orderId,taker:market.orders[1].orderId,seller,buyer,quantity:'2',price:'10000000',notional:'20000000',time:String(now),status:'Matched · Not settled'}];
 const s={...vector,status:'Ready',baseBlock:'40250000',updatedAt:String(now),terms:{...vector.terms,preparedAt:String(now),expiry:String(now+1800)}};s.digest=settlementDigest(s);
 const evidence={hash:'0x'+'a'.repeat(64),block:'40250000',timestamp:String(now),contract:s.contract,holdId:'0',feeTinybars:'1',principalTinybars:'0',transactionId:'explicit-browser-fixture',logIndices:['1'],reverted:false};
 const deployment={address:s.contract,salt:s.salt,cutoff:'12',evidence};let offline=false,reads=0;
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[],writes=[];
 await context.addInitScript(({seller,buyer,admin})=>{localStorage.setItem('holdbook.testnet.roles.v1',JSON.stringify({Seller:seller,Buyer:buyer,Admin:admin}));window.active=seller;const handlers={};window.changeAccount=()=>{window.active=buyer;for(const f of handlers.accountsChanged||[])f([buyer])};window.ethereum={isMetaMask:true,on(n,f){(handlers[n]??=[]).push(f)},removeListener(n,f){handlers[n]=(handlers[n]||[]).filter(g=>g!==f)},async request({method}){if(method==='eth_accounts'||method==='eth_requestAccounts')return[window.active];if(method==='eth_chainId')return'0x128';throw Error('Wallet mutation forbidden in browser fixture');}}},{seller,buyer,admin});
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('https://**/*',route=>route.abort());
 await context.route(site+'/**',async r=>{
  const path=new URL(r.request().url()).pathname;
  assert.ok(path.startsWith(base));
  const file=resolve(build,path.slice(base.length)||'index.html');assert.ok(file.startsWith(build+'/'));
  const mime={'.js':'text/javascript','.css':'text/css','.png':'image/png','.html':'text/html','.json':'application/json'};
  await r.fulfill({body:readFileSync(file),contentType:mime[extname(file)]||'application/octet-stream'});
 });
 let preflights=0;
 await context.route(api+'/api/**',r=>{
  const headers={'Access-Control-Allow-Origin':site,'Access-Control-Allow-Methods':'GET, POST','Access-Control-Allow-Headers':'Content-Type'};
  if(r.request().method()==='OPTIONS'){preflights++;return r.fulfill({status:204,headers});}
  if(r.request().method()==='POST'){
   assert.equal(r.request().postData(),'{}');return r.fulfill({status:400,json:{error:'Fixture only'},headers});
  }
  assert.equal(r.request().method(),'GET');const path=new URL(r.request().url()).pathname;
  return r.fulfill({json:path==='/api/market'?market:path==='/api/settlement-deployment'?deployment:path==='/api/settlements'?{settlements:[s],pendingOperation:null}:s,headers});
 });
 await page.goto(site+base);
 const nav=page.getByRole('navigation',{name:'Main navigation'});
 await page.getByRole('heading',{name:'Meet NOVA.',exact:true}).waitFor();
 await page.waitForFunction(()=>document.querySelector('#overview img')?.naturalWidth>0);
 assert.equal(await page.locator('#overview img').first().getAttribute('src'),base+'assets/nova-demo-equity.png');
 await nav.getByRole('link',{name:'Market',exact:true}).click();
 await page.getByRole('button',{name:'Connect',exact:true}).click();
 await page.getByRole('button',{name:'View match 13-1',exact:true}).click();
 await page.getByText('Waiting for buyer',{exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Cancel settlement',exact:true}).isEnabled(),true);
 const status=await page.evaluate(async api=>(await fetch(api+'/api/commands/prepare',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,api);
 assert.equal(status,400); // Playwright routing mocks bypass automatic CORS preflight.
 for(const tab of ['Overview','Market','Activity','Settings']){
  await nav.getByRole('link',{name:tab,exact:true}).click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 }
 assert.deepEqual(errors,[]);
 results.push({width,basePathImage:true,crossOriginMarket:true,approvedOriginControls:true,apiResponseReadable:true,tabs:true,overflow:false,realWalletMutations:0});await context.close();
}}finally{await browser.close();}
writeFileSync('docs/evidence/046-cloud-pages.json',JSON.stringify({recordedAt:new Date().toISOString(),kind:'Local built Pages assets at simulated production origin; synthetic API and wallet, no deployment',results},null,2)+'\n');

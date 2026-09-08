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
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
try{for(const port of [5173,4173])for(const width of [1440,390]){
 const now=Math.floor(Date.now()/1000);const market=structuredClone(snapshot);market.domain.salt=vector.salt;market.serverTime=String(now);
 const makeOrder=(side,owner,id,sequence)=>({...market.orders[0],action:'Place',side,owner,orderId:id,requestId:id,quantity:'2',price:'10000000',sequence,acceptedAt:String(now),expiresAt:String(now+86400),remaining:'0',matched:'2',cancelled:'0',expired:'0',reason:''});
 market.orders=[makeOrder('Sell',seller,vector.terms.sellerOrder.slice(2),'13'),makeOrder('Buy',buyer,vector.terms.buyerOrder.slice(2),'14')];market.matches=[{id:vector.id,maker:market.orders[0].orderId,taker:market.orders[1].orderId,seller,buyer,quantity:'2',price:'10000000',notional:'20000000',time:String(now),status:'Matched · Not settled'}];
 const s={...vector,status:'Ready',baseBlock:'40250000',updatedAt:String(now),terms:{...vector.terms,preparedAt:String(now),expiry:String(now+1800)}};s.digest=settlementDigest(s);
 const evidence={hash:'0x'+'a'.repeat(64),block:'40250000',timestamp:String(now),contract:s.contract,holdId:'0',feeTinybars:'1',principalTinybars:'0',transactionId:'explicit-browser-fixture',logIndices:['1'],reverted:false};
 const deployment={address:s.contract,salt:s.salt,cutoff:'12',evidence};let offline=false;
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[],writes=[];
 await context.addInitScript(({seller,buyer,admin})=>{localStorage.setItem('holdbook.testnet.roles.v1',JSON.stringify({Seller:seller,Buyer:buyer,Admin:admin}));window.active=seller;const handlers={};window.changeAccount=()=>{window.active=buyer;for(const f of handlers.accountsChanged||[])f([buyer])};window.ethereum={isMetaMask:true,on(n,f){(handlers[n]??=[]).push(f)},removeListener(n,f){handlers[n]=(handlers[n]||[]).filter(g=>g!==f)},async request({method}){if(method==='eth_accounts'||method==='eth_requestAccounts')return[window.active];if(method==='eth_chainId')return'0x128';throw Error('Wallet mutation forbidden in browser fixture');}}},{seller,buyer,admin});
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/api/**',r=>{if(new URL(r.request().url()).origin!==`http://127.0.0.1:${port}`)return r.continue();if(r.request().method()!=='GET'){writes.push(r.request().url());return r.abort()};if(offline)return r.abort();const path=new URL(r.request().url()).pathname;return r.fulfill({json:path==='/api/market'?market:path==='/api/settlement-deployment'?deployment:path==='/api/settlements'?{settlements:[s],pendingOperation:null}:s});});
 await page.goto(`http://127.0.0.1:${port}`);await page.getByRole('button',{name:'Connect',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#wallet-status')?.textContent.includes('Connected to Hedera Testnet.'));
 await page.getByRole('button',{name:'View match 13-1',exact:true}).click();await page.getByRole('heading',{name:'Match 13-1',exact:true}).waitFor();
 assert.equal(await page.locator('#settlement-heading').evaluate(e=>e===document.activeElement),true);
 assert.match(await page.locator('.settlement-ticket').innerText(),/Seller account · Selling this match/);assert.match(await page.locator('.settlement-ticket').innerText(),/Waiting for buyer/);assert.match(await page.locator('.settlement-ticket').innerText(),/Locked · verified/);
 assert.equal(await page.getByRole('button',{name:'Review payment',exact:true}).count(),0);
 const book=await page.locator('.market-book').boundingBox(),ticket=await page.locator('.market-ticket').boundingBox();assert.ok(width>850?book.x<ticket.x:book.y<ticket.y);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const summary=page.getByText('Match terms and public evidence',{exact:true});await summary.focus();await page.keyboard.press('Enter');assert.equal(await summary.evaluate(e=>e.parentElement.open),true);await page.keyboard.press('Enter');
 await page.evaluate(()=>window.changeAccount());await page.waitForFunction(()=>document.querySelector('.settlement-ticket .market-account')?.textContent.includes('Buyer account · Buying this match'));
 assert.equal(await page.getByRole('button',{name:'Review payment',exact:true}).isEnabled(),port===4173);
 await page.screenshot({path:`docs/evidence/037-t08-${port===5173?'dev':'preview'}-${width===1440?'desktop':'mobile'}.png`,fullPage:true});
 offline=true;await page.waitForTimeout(2500);assert.match(await page.locator('.settlement-ticket').innerText(),/Last received data is retained/);assert.equal(await page.getByRole('button',{name:'Review payment',exact:true}).isEnabled(),false);offline=false;
 s.terms.expiry=String(now-1);s.terms.preparedAt=String(now-1801);s.digest=settlementDigest(s);await page.waitForTimeout(2600);assert.match(await page.locator('.settlement-ticket').innerText(),/Expiry stops payment/);assert.equal(await page.getByRole('button',{name:'Review payment',exact:true}).count(),0);
 await page.getByRole('link',{name:'Trade',exact:true}).click();await page.getByRole('button',{name:'Verify historical T05 state',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Verify historical T05 state',exact:true}).count(),1);assert.equal(await page.getByRole('button',{name:'Check readiness',exact:true}).count(),0);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);results.push({port,width,kind:'Explicit public fixtures; no signatures or chain mutations',focus:true,roles:true,offlineRetainsAndDisables:true,expiryNotReturned:true,reducedMotion:true,overflow:false,t05Historical:true,errors});await context.close();
}
for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),requests=[];page.on('request',r=>requests.push(r.url()));
 await context.route('**/*',r=>new URL(r.request().url()).origin==='http://127.0.0.1:4173'?r.continue():r.abort());
 await page.goto('http://127.0.0.1:4173/showcase/index.html');await page.getByRole('heading',{name:'A match is only the beginning.'}).waitFor();await page.getByRole('button',{name:'Buyer sells to Seller',exact:true}).click();assert.match(await page.locator('.showcase-case').innerText(),/1 NOVA @ 0.09 HBAR/);assert.match(await page.locator('.showcase-case').innerText(),/Pending manual acceptance/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.ok(requests.every(url=>!url.includes('/api/')&&!url.includes('hashio')&&!url.includes('mirrornode')));if(width===1440)await page.screenshot({path:'docs/evidence/037-t08-showcase.png',fullPage:true});results.push({surface:'showcase',width,noAPI:true,noWallet:true,t08PendingHonest:true,overflow:false});await context.close();
}
}finally{await browser.close();writeFileSync('docs/evidence/037-t08-browser.json',JSON.stringify(results,null,2)+'\n');}

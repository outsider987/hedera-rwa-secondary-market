// Explicit public fixtures and an isolated read-only wallet. Never approve or send a transaction.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const {settlementDigest}=await import('../../src/lib/settlement.ts');
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
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[],writes=[];
 await context.addInitScript(({seller,buyer,admin})=>{localStorage.setItem('holdbook.testnet.roles.v1',JSON.stringify({Seller:seller,Buyer:buyer,Admin:admin}));window.active=seller;const handlers={};window.changeAccount=()=>{window.active=buyer;for(const f of handlers.accountsChanged||[])f([buyer])};window.ethereum={isMetaMask:true,on(n,f){(handlers[n]??=[]).push(f)},removeListener(n,f){handlers[n]=(handlers[n]||[]).filter(g=>g!==f)},async request({method}){if(method==='eth_accounts'||method==='eth_requestAccounts')return[window.active];if(method==='eth_chainId')return'0x128';throw Error('Wallet mutation forbidden in browser fixture');}}},{seller,buyer,admin});
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('https://**/*',route=>route.abort());
 await context.route('**/api/**',r=>{if(new URL(r.request().url()).origin!==`http://127.0.0.1:${port}`)return r.abort();if(r.request().method()!=='GET'){writes.push(r.request().url());return r.abort()};if(offline)return r.abort();reads++;const path=new URL(r.request().url()).pathname;return r.fulfill({json:path==='/api/market'?market:path==='/api/settlement-deployment'?deployment:path==='/api/settlements'?{settlements:[s],pendingOperation:null}:s});});
 await page.goto(`http://127.0.0.1:${port}`);
 const nav=page.getByRole('navigation',{name:'Main navigation'});
 await page.getByRole('heading',{name:'Meet NOVA.',exact:true}).waitFor();
 assert.deepEqual(await nav.getByRole('link').allTextContents(),['Overview','Market','Activity','Settings']);
 const image=page.locator('#overview img');await image.waitFor();await page.waitForFunction(()=>document.querySelector('#overview img')?.naturalWidth>0);
 assert.equal(await image.getAttribute('alt'),'Illustrative NOVA certificate labeled Demo Equity and Hedera Testnet');
 assert.equal(reads,0);
 if(port===4173)await capture(page,`docs/evidence/042-nova-overview-${width===1440?'desktop':'mobile'}.png`);
 await nav.getByRole('link',{name:'Market',exact:true}).click();
 await page.getByRole('heading',{name:'NOVA / HBAR',exact:true}).waitFor();
 await page.getByRole('button',{name:'Connect',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#wallet-status')?.textContent.includes('Connected to Hedera Testnet.'));
 await page.getByRole('button',{name:'View match 13-1',exact:true}).waitFor();
 if(port===4173){await page.getByLabel('Quantity (NOVA)',{exact:true}).fill('2');await page.getByLabel('Limit price (HBAR)',{exact:true}).fill('0.1');}
 await page.locator('.market-balance').getByText('Balance unavailable. Refresh to try again.',{exact:true}).waitFor();
 if(port===4173)await capture(page,`docs/evidence/042-nova-market-${width===1440?'desktop':'mobile'}.png`);
 await nav.getByRole('link',{name:'Activity',exact:true}).click();
 await page.getByRole('heading',{name:'Activity',exact:true}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'Order book',exact:true}).isVisible(),false);
 await page.getByRole('heading',{name:'Verified asset history',exact:true}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'Completed fixed trade',exact:true}).isVisible(),true);
 assert.equal(await page.getByRole('button',{name:'View match 13-1',exact:true}).count(),1);
 await nav.getByRole('link',{name:'Market',exact:true}).click();
 if(port===4173)assert.equal(await page.getByLabel('Quantity (NOVA)',{exact:true}).inputValue(),'2');
 await page.goBack();await page.getByRole('heading',{name:'Activity',exact:true}).waitFor();
 if(port===4173)await capture(page,`docs/evidence/042-nova-activity-${width===1440?'desktop':'mobile'}.png`);
 await page.getByRole('button',{name:'View match 13-1',exact:true}).click();
 await page.waitForURL('**/#market');await page.getByRole('heading',{name:'Match 13-1',exact:true}).waitFor();
 await page.waitForFunction(()=>document.activeElement?.id==='settlement-heading');
 assert.match(await page.locator('.settlement-ticket').innerText(),/Waiting for buyer/);
 await nav.getByRole('link',{name:'Activity',exact:true}).click();
 await nav.getByRole('link',{name:'Market',exact:true}).click();
 await page.getByRole('heading',{name:'Match 13-1',exact:true}).waitFor();
 await page.getByRole('button',{name:'New order',exact:true}).click();
 if(port===4173){await page.getByLabel('Quantity (NOVA)',{exact:true}).fill('2');await page.getByLabel('Limit price (HBAR)',{exact:true}).fill('0.1');}
 await page.evaluate(()=>window.changeAccount());
 await page.waitForFunction(()=>document.querySelector('header .network')?.textContent.includes('Buyer'));
 if(port===4173)assert.equal(await page.getByLabel('Quantity (NOVA)',{exact:true}).inputValue(),'');
 await nav.getByRole('link',{name:'Settings',exact:true}).click();
 await page.getByRole('heading',{name:'Settings',exact:true}).waitFor();
 await page.locator('.skip-link').focus();await page.keyboard.press('Enter');
 assert.equal(await page.getByRole('heading',{name:'Settings',exact:true}).isVisible(),true);
 assert.equal(await nav.getByRole('link',{name:'Settings',exact:true}).getAttribute('aria-current'),'page');
 if(port===4173)await capture(page,`docs/evidence/042-nova-settings-${width===1440?'desktop':'mobile'}.png`);
 const stopped=reads;await page.waitForTimeout(2400);assert.equal(reads,stopped);
 for(const hash of ['history','trade']){await page.evaluate(hash=>{location.hash=hash},hash);await page.getByRole('heading',{name:'Activity',exact:true}).waitFor();assert.equal(await nav.getByRole('link',{name:'Activity',exact:true}).getAttribute('aria-current'),'page');}
 for(const tab of ['Overview','Market','Activity','Settings']){await nav.getByRole('link',{name:tab,exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true, JSON.stringify({port,width,tab,overflow:await page.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth).slice(0,12).map(e=>({tag:e.tagName,class:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right})))}));}
 await page.evaluate(()=>window.scrollTo(0,400));assert.equal(await page.locator('header').evaluate(e=>e.parentElement.getBoundingClientRect().top),0);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 results.push({port,width,tabs:true,image:true,legacyLinks:true,backNavigation:true,skipLinkPreservesPage:true,sticky:true,draftPreserved:port===4173?true:"Not exercised: dev controls disabled",accountChangeClearsDraft:port===4173?true:"Not exercised: dev controls disabled",activityMatchReturnsToMarket:true,selectedMatchPreserved:true,inactivePollingStopped:true,overflow:false,walletMutations:0});await context.close();
}}finally{await browser.close();}
writeFileSync('docs/evidence/042-nova-overview.json',JSON.stringify({recordedAt:new Date().toISOString(),kind:'Explicit public fixtures and isolated read-only wallet; no live transactions',results},null,2)+'\n');

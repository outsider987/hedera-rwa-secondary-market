import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--disable-gpu']});
const evidence={recordedAt:new Date().toISOString(),browser:browser.version(),device:'Linux headless Chrome; emulated viewports; unsigned public-wallet fixture',results:[]};
const matching=JSON.parse(readFileSync('docs/evidence/035-t07-manual.json')).checkpoints[2].exports;
async function setup(port,width,height,options={}){
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',...options});const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[],writes=[],blockedReads=[];let fixture=matching[1],online=true,settlements=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(!['GET','HEAD'].includes(r.request().method())){const body=r.request().postDataJSON();const batch=Array.isArray(body)?body:[body];const methods=batch.map(x=>x?.method);if(u.hostname==='testnet.hashio.io'&&methods.every(m=>['eth_call','eth_chainId','eth_getBalance','eth_blockNumber','eth_getBlockByNumber','eth_getCode','eth_getTransactionReceipt','eth_getTransactionByHash','eth_getLogs','eth_getTransactionCount'].includes(m))){blockedReads.push(...methods);return r.abort();}writes.push(u.pathname);return r.abort();}if(u.origin!==`http://127.0.0.1:${port}`)return r.abort();if(u.pathname==='/api/market')return r.fulfill({status:online?200:503,json:fixture});if(u.pathname==='/api/settlements')return r.fulfill({json:{settlements,pendingOperation:null}});if(u.pathname==='/api/settlement-deployment')return r.fulfill({json:null});if(u.pathname.startsWith('/api/'))return r.fulfill({status:503,json:{error:'Isolated offline check'}});return r.continue();});
 return {context,page,errors,writes,blockedReads,setFixture:f=>{fixture=f;},setOnline:v=>{online=v;},setSettlements:s=>{settlements=s;}};
}
try{for(const port of [5173,4173])for(const width of [1440,390]){
 const h=await setup(port,width,844),{page,context}=h;
 await context.addInitScript(()=>{window.ethereum={isMetaMask:true,on(){},removeListener(){},async request({method}){if(['eth_accounts','eth_requestAccounts'].includes(method))return['0x740e4ef58151a169621622577a5b6d6ff5010836'];if(method==='eth_chainId')return'0x128';throw Error('Signing forbidden');}}});
 h.setFixture({...matching[2],orders:Array.from({length:50},(_,i)=>({...matching[1].orders[0],orderId:i.toString(16).padStart(64,'0'),sequence:String(i+1)}))});
 await page.goto(`http://127.0.0.1:${port}/#market`);await page.getByRole('button',{name:'Connect',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.depth-level').length>0);
 await page.evaluate(()=>scrollTo(0,1000));await page.waitForTimeout(250);const before=await page.evaluate(()=>scrollY);assert.equal(await page.getByRole('heading',{name:'Top 5 price levels',exact:true}).count(),1);assert.equal(await page.getByRole('heading',{name:'Order book',exact:true}).count(),0);assert.equal(await page.getByRole('button',{name:/Top 5 price levels/}).count(),0);
 const intent={domain:matching[2].domain,record:matching[1].command};
 await page.evaluate(intent=>{localStorage.setItem('holdbook.testnet.market.v1',JSON.stringify(intent));window.dispatchEvent(new StorageEvent('storage',{key:'holdbook.testnet.market.v1'}));},intent);
 await page.waitForFunction(()=>document.querySelector('#order-heading')?.textContent==='Request result');await page.waitForTimeout(250);
 const after=await page.evaluate(()=>scrollY);assert.equal(await page.evaluate(()=>document.activeElement.id),'order-heading');
 assert.ok(after>=before,'Accepted result must not jump upward to its heading');
 await page.getByRole('navigation',{name:'Market sections'}).getByRole('button',{name:'Place order',exact:true}).evaluate(e=>e.click());await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>scrollY)<before);
 const recorded=JSON.parse(readFileSync('docs/evidence/038-t08-manual.json')).cases;
 h.setSettlements(recorded.map(c=>c.settlement));h.setFixture({...matching[3],matches:recorded.map(c=>c.match)});await page.waitForTimeout(2300);await page.getByRole('combobox',{name:'Match filter'}).selectOption('Completed');await page.getByRole('button',{name:'View match 15-1',exact:true}).click();await page.locator('.market-exchange').waitFor();assert.equal(await page.locator('.nova-flow').count(),0);assert.equal(await page.locator('.market-visualization').count(),1);assert.match(await page.locator('.market-exchange').innerText(),/NOVA delivered · HBAR paid/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('.market-exchange').scrollIntoViewIfNeeded();await page.screenshot({path:`docs/evidence/054-market-status-${port}-${width}.png`,fullPage:true});
 const ready={...recorded[0].settlement,status:'Ready'};
 await page.clock.install({time:new Date((Number(ready.terms.expiry)-600)*1000)});
 h.setSettlements([ready,...recorded.slice(1).map(c=>c.settlement)]);await page.waitForFunction(()=>document.querySelector('.market-exchange-heading')?.textContent.includes('Waiting for buyer payment'));
 await page.evaluate(()=>{window.retainedTerms=document.querySelector('.settlement-ticket dl');});
 await page.waitForTimeout(250);await page.locator('.market-exchange').screenshot({path:`docs/evidence/054-market-ready-${port}-${width}.png`});
 h.setSettlements(recorded.map(c=>c.settlement));await page.waitForFunction(()=>document.querySelector('.market-exchange-heading')?.textContent.includes('Atomic settlement verified'));
 assert.equal(await page.evaluate(()=>window.retainedTerms===document.querySelector('.settlement-ticket dl')),true,'Settlement completion preserves the terms DOM for scroll anchoring');
 assert.deepEqual(h.errors,[]);assert.deepEqual(h.writes,[]);evidence.results.push({port,width,before,after,explicitNavigation:true,errors:h.errors,writes:h.writes});console.log({port,width,before,after});await context.close();
}}finally{writeFileSync('docs/evidence/054-market-focus-after.json',JSON.stringify(evidence,null,2)+'\n');await browser.close();}

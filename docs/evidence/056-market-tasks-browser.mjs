import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.argv[2]);
const baseline=JSON.parse(readFileSync('docs/evidence/035-t07-manual.json')).checkpoints[2].exports[2];
const recorded=JSON.parse(readFileSync('docs/evidence/038-t08-manual.json'));
const {match,settlement}=recorded.cases[0];
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
const results=[];
try{for(const port of [5173,4173]){
 const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'}),page=await context.newPage();page.setDefaultTimeout(15000);
 let available=true,status='Ready';const pageErrors=[],writes=[];
 // Isolated UI fixtures: copied public orders receive sequences above the
 // recorded cutoff. Ready uses recorded terms at a pre-expiry browser time.
 const market={...baseline,matches:[match],orders:[match.maker,match.taker].map((orderId,i)=>({...baseline.orders[0],orderId,sequence:String(100+i)}))};
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==`http://127.0.0.1:${port}`)return r.abort();if(!['GET','HEAD'].includes(r.request().method())){writes.push(u.pathname);return r.abort();}if(u.pathname==='/api/market')return r.fulfill({json:market});if(u.pathname==='/api/settlements')return available?r.fulfill({json:{settlements:[{...settlement,status}],pendingOperation:null}}):r.fulfill({status:503,json:{error:'Isolated unavailable fixture'}});if(u.pathname==='/api/settlement-deployment')return r.fulfill({json:recorded.deployment});if(u.pathname.startsWith('/api/'))return r.fulfill({status:503,json:{error:'Isolated fixture'}});return r.continue();});
 page.on('pageerror',()=>pageErrors.push('Page error'));
 await context.addInitScript(address=>{const listeners={};window.fixtureAddress=address;window.switchFixtureAccount=address=>{window.fixtureAddress=address;for(const fn of listeners.accountsChanged??[])fn([address]);};window.ethereum={isMetaMask:true,on(event,fn){(listeners[event]??=[]).push(fn);},removeListener(event,fn){listeners[event]=(listeners[event]??[]).filter(f=>f!==fn);},async request({method}){if(['eth_accounts','eth_requestAccounts'].includes(method))return[window.fixtureAddress];if(method==='eth_chainId')return'0x128';throw Error('Signing forbidden');}};},match.buyer);
 await page.clock.install({time:new Date((Number(settlement.terms.expiry)-600)*1000)});
 await page.goto(`http://127.0.0.1:${port}/#market`);await page.getByRole('button',{name:'Connect',exact:true}).click();
 const tasks=page.locator('.market-next-actions'),ticket=page.locator('.settlement-ticket');
 await tasks.getByText('1 match needs this account.',{exact:false}).waitFor();
 await tasks.getByRole('button',{name:'Open match 15-1'}).focus();await page.keyboard.press('Enter');
 await ticket.getByText('Your next step: review payment',{exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>document.activeElement.id),'settlement-heading');
 await tasks.getByRole('button',{name:'Open match 15-1'}).click();
 assert.equal(await page.evaluate(()=>document.activeElement.id),'settlement-heading');
 assert.match(await page.locator('.settlement-steps [aria-current="step"]').innerText(),/Pay HBAR/);
 await page.evaluate(()=>scrollTo(0,0));
 await page.waitForTimeout(300);await page.screenshot({path:`docs/evidence/056-market-tasks-ready-${port}.png`,fullPage:true});
 await page.evaluate(address=>window.switchFixtureAccount(address),match.seller);
 await tasks.getByText(/No match needs this account/).waitFor();
 await ticket.getByText('Waiting for Buyer account to pay HBAR',{exact:true}).waitFor();
 status='Locked';
 await tasks.getByText('1 match needs this account.',{exact:false}).waitFor();
 await ticket.getByText('Your next step: confirm the match terms',{exact:true}).waitFor();
 assert.match(await page.locator('.settlement-steps [aria-current="step"]').innerText(),/Confirm terms/);
 available=false;await tasks.getByText(/Next actions are not confirmed/).waitFor();assert.equal(await tasks.getByRole('button',{name:/Open match/}).count(),0);
 available=true;status='Ready';
 await page.clock.setSystemTime(new Date((Number(settlement.terms.expiry)+1)*1000));
 await tasks.getByText('Reclaim expired NOVA',{exact:true}).waitFor();
 await ticket.getByText(/Expiry stops payment/).waitFor();assert.equal(await page.locator('.settlement-steps').count(),0);
 status='Reclaimed';await ticket.locator('[role="status"] strong').filter({hasText:/^Reclaimed$/}).waitFor();
 await tasks.getByText(/No match needs this account/).waitFor();assert.equal(await page.locator('.settlement-steps').count(),0);
 // An attempted-but-unknown local operation has no transaction hash. It is
 // a synthetic recovery fixture, never a submitted or signed transaction.
 const saved={operation:{id:'1'.repeat(64),settlementId:match.id,action:'settle',sender:match.buyer,to:settlement.contract,calldata:'0x00',value:'0',status:'prepared',hash:'',createdAt:settlement.terms.preparedAt},attempted:true,rejected:false};
 await page.evaluate(saved=>localStorage.setItem('holdbook.testnet.t08.v1',JSON.stringify(saved)),saved);
 await page.reload();await page.getByRole('button',{name:'Connect',exact:true}).click();
 await tasks.getByText(/A settlement operation needs verification/).waitFor();
 await tasks.getByRole('button',{name:'View original operation'}).click();
 await ticket.getByRole('button',{name:'Query original operation'}).waitFor();
 await page.clock.runFor(1000);
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.settlement-ticket .hb\\:space-y-4')).opacity==='1');
 assert.equal(await tasks.getByRole('button',{name:/Open match/}).count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(300);await page.screenshot({path:`docs/evidence/056-market-tasks-recovery-${port}.png`,fullPage:true});
 assert.deepEqual(pageErrors,[]);assert.deepEqual(writes,[]);
 results.push({port,width:1440,taskKeyboardNavigation:true,actionHeadingFocus:true,accountSwitch:true,stepProgress:true,staleSuppressed:true,expiryReclaim:true,returnedNotSuccess:true,reloadRecovery:true,noOverflow:true,pageErrors,localWrites:writes});
 await context.close();
}}finally{writeFileSync('docs/evidence/056-market-tasks-browser.json',JSON.stringify({recordedAt:new Date().toISOString(),browser:browser.version(),scope:'Isolated desktop public UI fixtures with adjusted sequence/status/time. External requests and local writes blocked. No real wallet/signature/transaction.',results},null,2)+'\n');await browser.close();}

// Isolated browser, public fixtures only. No wallet signatures or live mutation endpoints.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const {chromium}=await import(process.argv[2]);
const {interfaces}=await import('../../src/nova.ts'),{asset}=await interfaces();
const {settlementCalldata}=await import('../../src/settlement.ts');
const manual=JSON.parse(readFileSync('docs/evidence/038-t08-manual.json'));
const {snapshot:market}=JSON.parse(readFileSync('docs/evidence/036-t07-layout-fixtures.json'));
market.domain.salt=manual.deployment.salt;market.orders=manual.orderProgress.acceptedOrders;market.matches=manual.cases.filter(c=>c.match).map(c=>c.match);
const reverse=manual.cases.find(c=>c.id==='reverse'),s=reverse.settlement,e=reverse.evidence.find(e=>e.action==='settle');
const {action,operationId,status,...proof}=e;
const operation={id:operationId,settlementId:s.id,action,sender:s.terms.buyer,to:s.contract,calldata:await settlementCalldata(action,s,s.salt),value:'90000000000000000',status,hash:e.hash,createdAt:s.terms.preparedAt,evidence:proof};
const seller=s.terms.buyer,buyer=s.terms.seller,admin='0xfd8fdb4989a916c6f2420a2116c356e34c889840';
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true}),results=[];
try{for(const port of [5173,4173])for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 let offline=false,held=0n,release;page.on('pageerror',e=>errors.push(e.message));
 await context.addInitScript(({seller,buyer,admin,operation})=>{localStorage.setItem('holdbook.testnet.roles.v1',JSON.stringify({Seller:seller,Buyer:buyer,Admin:admin}));localStorage.setItem('holdbook.testnet.t08.v1',JSON.stringify({operation,attempted:true,rejected:false}));window.active=seller;const listeners={};window.changeAccount=()=>{window.active=buyer;for(const f of listeners.accountsChanged??[])f([buyer]);};window.ethereum={isMetaMask:true,on(n,f){(listeners[n]??=[]).push(f)},removeListener(n,f){listeners[n]=(listeners[n]??[]).filter(x=>x!==f)},async request({method}){if(method==='eth_accounts'||method==='eth_requestAccounts')return[window.active];if(method==='eth_chainId')return'0x128';throw Error('No wallet mutation permitted');}};},{seller,buyer,admin,operation});
 await context.route('https://testnet.hashio.io/api',async route=>{
  if(offline)return route.abort();const {method,params}=route.request().postDataJSON();let result;
  if(method==='eth_chainId')result='0x128';else if(method==='eth_getBlockByNumber')result={number:'0x123',timestamp:'0x6a9ff000'};
  else {assert.equal(method,'eth_call');assert.equal(params[1],'0x123');const c=asset.parseTransaction({data:params[0].data}),isBuyer=c.args[0].toLowerCase()===buyer;result=asset.encodeFunctionResult(c.name,[c.name==='getHeldAmountFor'?(isBuyer?held:0n):(isBuyer?17n-held:83n)]);}
  return route.fulfill({json:{jsonrpc:'2.0',id:1,result}});
 });
 await context.route(`http://127.0.0.1:${port}/api/**`,async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path.startsWith('/api/settlement-operations/')){assert.equal(route.request().postDataJSON().hash,operation.hash);await new Promise(resolve=>{release=resolve;});return route.fulfill({json:{operation,verificationPending:false}});}
  assert.equal(route.request().method(),'GET');return route.fulfill({json:path==='/api/market'?market:path==='/api/settlement-deployment'?manual.deployment:path==='/api/settlements'?{settlements:manual.cases.filter(c=>c.settlement).map(c=>c.settlement),pendingOperation:null}:s});
 });
 await page.goto(`http://127.0.0.1:${port}`);await page.getByRole('button',{name:'Connect',exact:true}).click();
 const balance=page.locator('.market-balance');await balance.getByRole('heading',{name:'Seller account · NOVA balance'}).waitFor();await page.waitForFunction(()=>document.querySelector('.market-balance')?.textContent.includes('83 NOVA'));
 assert.deepEqual(await balance.locator('dd').allTextContents(),['83 NOVA','0 NOVA','83 NOVA']);
 await page.evaluate(()=>window.changeAccount());await balance.getByRole('heading',{name:'Buyer account · NOVA balance'}).waitFor();await page.waitForFunction(()=>document.querySelector('.market-balance')?.textContent.includes('17 NOVA'));assert.deepEqual(await balance.locator('dd').allTextContents(),['17 NOVA','0 NOVA','17 NOVA']);
 held=1n;await balance.getByRole('button',{name:'Refresh balance',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.market-balance')?.textContent.includes('16 NOVA'));assert.deepEqual(await balance.locator('dd').allTextContents(),['16 NOVA','1 NOVA','17 NOVA']);
 offline=true;await balance.getByRole('button',{name:'Refresh balance',exact:true}).click();await balance.getByText(/Balance update unavailable/).waitFor();assert.deepEqual(await balance.locator('dd').allTextContents(),['16 NOVA','1 NOVA','17 NOVA']);offline=false;
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.getByLabel('Match filter',{exact:true}).selectOption('Completed');await page.getByRole('button',{name:'View match 17-1',exact:true}).click();
 await page.getByText('Original operation · verified',{exact:true}).click();
 const query=page.getByRole('button',{name:'Query original operation',exact:true});await query.click();const spinner=page.locator('.operation-spinner');await spinner.waitFor();assert.equal(await spinner.getAttribute('aria-hidden'),'true');assert.equal(await spinner.evaluate(e=>getComputedStyle(e).animationName),'operation-spin');
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await spinner.evaluate(e=>getComputedStyle(e).animationName),'none');
 if(port===4173){await page.screenshot({path:`docs/evidence/039-t08-balances-${width===1440?'desktop':'mobile'}.png`,fullPage:true});}
 release();await spinner.waitFor({state:'detached'});assert.equal(await query.isEnabled(),true);assert.deepEqual(errors,[]);
 results.push({port,width,balanceAccountIsolation:true,availableHeldTotal:true,fixedBlockReads:true,offlineRetains:true,spinnerOnlyWhileRunning:true,reducedMotion:true,overflow:false,walletMutations:0,kind:'Explicit public fixtures; no live transaction or signature'});await context.close();
}}finally{await browser.close();}
writeFileSync('docs/evidence/039-t08-balances.json',JSON.stringify({recordedAt:new Date().toISOString(),results},null,2)+'\n');

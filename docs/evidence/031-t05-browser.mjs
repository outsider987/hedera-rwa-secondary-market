// Isolated Chrome, public Testnet reads and a synthetic account provider only.
// No browser wallet profile, signature, transaction or persistent user storage.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const trade=await import('../../src/trade.ts'),{keccak256}=await import('viem');
const {chromium}=await import(process.argv[2]);
// Optional regression using a user-exported public deployment intent. Reads only.
if(process.argv.includes('--recover-deployment')) {
 const intent=JSON.parse(readFileSync(process.argv[process.argv.indexOf('--recover-deployment')+1]));
 const {tradeEvidence}=await import('../../src/evidence.ts');const saved=tradeEvidence(intent);
 assert.equal(saved.action,'deploy');assert.ok(saved.transactionHash);
 const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true}),checks=[];
 try {for(const port of [5173,4173]) {
  const origin='http://127.0.0.1:'+port,context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'}),page=await context.newPage(),forbidden=[],errors=[];
  await context.addInitScript(({key,saved})=>localStorage.setItem(key,JSON.stringify([saved])),{key:trade.tradeStorageKey,saved});
  await context.route('**/*',route=>{
   const u=new URL(route.request().url());if(u.origin===origin)return route.continue();
   if(u.origin==='https://testnet.mirrornode.hedera.com'&&u.pathname.startsWith('/api/v1/'))return route.continue();
   if(u.href==='https://testnet.hashio.io/api'&&['eth_chainId','eth_blockNumber','eth_getBlockByNumber','eth_call','eth_getCode','eth_getLogs','eth_getTransactionByHash','eth_getTransactionReceipt'].includes(route.request().postDataJSON().method))return route.continue();
   forbidden.push(u.origin+u.pathname);return route.abort();
  });
  page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.locator('.pending-notice').waitFor();
  await page.getByText('Transaction details',{exact:true}).click();await page.getByRole('button',{name:'Check current balances',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.trade-action')?.textContent.includes('Current balances checked.'),{},{timeout:180000});
  await page.getByRole('combobox',{name:/Saved operation/}).selectOption(saved.operationId);
  await page.getByRole('button',{name:'Query original hash',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.trade-action')?.textContent.includes('Operation complete.'),{},{timeout:180000});
  assert.doesNotMatch(await page.locator('.trade-action').innerText(),/Swap already closed/);
  assert.equal(await page.locator('.trade-action [role="alert"]').count(),0);
  assert.match(await page.locator('.trade-summary').innerText(),/Current balances have not been checked/);
  assert.equal(await page.getByRole('button',{name:'Check readiness',exact:true}).isEnabled(),true);
  const recovered=await page.evaluate(key=>JSON.parse(localStorage.getItem(key))[0],trade.tradeStorageKey);
  assert.equal(recovered.status,'complete');assert.equal(recovered.swapState,0);assert.equal(recovered.transactionHash,saved.transactionHash);
  assert.deepEqual(forbidden,[]);assert.deepEqual(errors,[]);
  checks.push({port,readThenRecover:true,oldSnapshotCleared:true,noFalseClosedError:true,freshReadRequired:true,status:recovered.status,swapState:recovered.swapState,forbidden,errors});
  const output=JSON.parse(readFileSync(process.argv[3]));output.recoveryRegression={recordedAt:new Date().toISOString(),kind:'Live public deployment recovery in isolated browser; no wallet or mutation',checks,deployment:tradeEvidence(recovered)};
  writeFileSync(process.argv[3],JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(checks.at(-1)));await context.close();
 }} finally {await browser.close();}
 process.exit(0);
}
const recoveryOnly=process.argv.includes('--recovery-only');
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true}),results=recoveryOnly?JSON.parse(readFileSync(process.argv[3])).results.filter(r=>!r.fixture):[];
const roles={Admin:'0xfd8fdb4989a916c6f2420a2116c356e34c889840',Seller:'0x740e4ef58151a169621622577a5b6d6ff5010836',Buyer:'0xa1f2872ee7a9f74523ae0887a9dc428ff1340706'};
try {
 if(!recoveryOnly)for(const port of [5173,4173])for(const width of [1440,390]) {
  const origin='http://127.0.0.1:'+port,context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'}),page=await context.newPage();
  const forbidden=[],errors=[],requests=[];
  await context.addInitScript(roles=>{
   localStorage.setItem('holdbook.testnet.roles.v1',JSON.stringify(roles));const listeners=new Map();window.walletCalls=[];window.active=roles.Admin;
   window.emit=(name,value)=>{for(const fn of listeners.get(name)||[])fn(value)};
   window.ethereum={isMetaMask:true,on(n,f){if(!listeners.has(n))listeners.set(n,new Set());listeners.get(n).add(f)},removeListener(n,f){listeners.get(n)?.delete(f)},async request({method}){
    window.walletCalls.push(method);if(method==='eth_accounts'||method==='eth_requestAccounts')return [window.active];if(method==='eth_chainId')return '0x128';throw Error('No transaction or signature allowed in browser verification');
   }};
  },roles);
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());if(url.origin===origin)return route.continue();
   if(url.origin==='https://testnet.mirrornode.hedera.com'&&url.pathname.startsWith('/api/v1/')){requests.push('mirror:'+url.pathname);return route.continue();}
   if(url.href==='https://testnet.hashio.io/api') {
    const b=route.request().postDataJSON();if(['eth_chainId','eth_blockNumber','eth_getBlockByNumber','eth_call','eth_getCode','eth_getLogs','eth_getTransactionByHash','eth_getTransactionReceipt'].includes(b.method)){requests.push(b.method);return route.continue();}
    forbidden.push(b.method);return route.abort();
   }
   forbidden.push(url.origin+url.pathname);return route.abort();
  });
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin);await page.getByRole('heading',{name:'10 NOVA',exact:true}).waitFor();
  assert.equal(await page.locator('#trade').isVisible(),true);assert.equal(await page.locator('#history').isVisible(),false);
  await page.keyboard.press('Tab');assert.equal(await page.locator('.skip-link').evaluate(el=>el===document.activeElement),true);
  assert.notEqual(await page.locator('.skip-link').evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  await page.getByRole('button',{name:'Connect',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#wallet-status')?.textContent==='Connected to Hedera Testnet.');
  await page.getByRole('button',{name:'Check readiness',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.trade-action')?.textContent.includes('Current balances checked.'),{},{timeout:180000});
  await page.getByRole('button',{name:'Review deployment',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.trade-review')||document.querySelector('.trade-action [role="alert"]'),{},{timeout:180000});
  assert.equal(await page.locator('.trade-action [role="alert"]').count(),0,await page.locator('.trade-action').innerText());
  assert.equal(await page.getByRole('button',{name:'Approve in MetaMask',exact:true}).isEnabled(),false);
  await page.locator('.review-check input').check();
  assert.equal(await page.getByRole('button',{name:'Approve in MetaMask',exact:true}).isEnabled(),port===4173);
  await page.locator('.review-check input').uncheck();await page.evaluate(()=>window.scrollTo(0,0));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const capture=`docs/evidence/031-t05-${port}-${width}.png`;await page.screenshot({path:capture,fullPage:true});
  const reviewText=await page.locator('.trade-review').innerText();assert.match(reviewText,/Admin|Hedera Testnet 296/);
  // Switching accounts invalidates both the review and checkbox without submitting.
  await page.evaluate(s=>{window.active=s;window.emit('accountsChanged',[s]);},roles.Seller);
  await page.waitForFunction(()=>!document.querySelector('.trade-review'));
  await page.getByRole('navigation').getByRole('link',{name:'History',exact:true}).click();
  await page.locator('#history').waitFor();assert.equal(await page.locator('#trade').isVisible(),false);
  await page.locator('#history summary').filter({hasText:'Three verified rejections'}).click();
  assert.match(await page.locator('#history').innerText(),/40241114/);assert.match(await page.locator('#history').innerText(),/InsufficientHoldBalance/);
  if(port===4173&&width===1440){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'docs/evidence/031-t05-history.png',fullPage:true});}
  await page.getByRole('navigation').getByRole('link',{name:'Settings',exact:true}).click();await page.locator('#settings').waitFor();
  await page.waitForFunction(()=>document.querySelector('.accounts')?.textContent.includes('Hedera ID 0.0.10389111')&&!document.querySelector('.accounts')?.textContent.includes('Checking Testnet Mirror'),{},{timeout:30000});
  await page.getByText('SDK, network and ATS deployment',{exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Check SDK config',exact:true}).isEnabled(),false);
  if(port===4173&&width===1440){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'docs/evidence/031-t05-settings.png',fullPage:true});}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole('navigation').getByRole('link',{name:'Trade',exact:true}).click();
  await page.getByRole('button',{name:'Check readiness',exact:true}).click();await page.getByRole('button',{name:'Cancel check',exact:true}).click();
  assert.match(await page.locator('.trade-action').innerText(),/Read cancelled/);
  await page.reload();await page.getByRole('button',{name:'Connect',exact:true}).waitFor();assert.equal(await page.locator('.trade-review').count(),0);
  const walletCalls=await page.evaluate(()=>window.walletCalls);assert.ok(walletCalls.every(m=>['eth_accounts','eth_chainId','eth_requestAccounts'].includes(m)));
  assert.deepEqual(forbidden,[]);assert.deepEqual(errors,[]);
  results.push({port,width,capture,readiness:true,review:true,previewGate:true,keyboardFocus:true,navigation:true,noOverflow:true,accountInvalidation:true,cancel:true,reloadDisconnected:true,walletCalls,requestCount:requests.length,requestKinds:[...new Set(requests.filter(v=>!v.startsWith('mirror:')))],forbidden,errors});
  console.log(JSON.stringify({port,width,status:'passed',requests:requests.length}));await context.close();
 }
 // Deliberately synthetic journal, isolated from Victor's browser. This checks
 // pending/reload/cross-tab behavior without inventing an accepted transaction.
 const input=JSON.parse(readFileSync('docs/evidence/031-t05-live-read.json')).input,calldata=await trade.tradeCalldata('deploy',input);
 const intent={schemaVersion:1,chainId:296,kind:'t05-transaction',operationId:'synthetic-pending-browser-check',startedAt:new Date().toISOString(),action:'deploy',status:'unknown',signerRole:'Admin',input,calldata,calldataDigest:keccak256(calldata),walletValueWeibars:'0',transactionHash:'0x'+'7'.repeat(64)};
 for(const port of [5173,4173]) {
  const origin='http://127.0.0.1:'+port,context=await browser.newContext({viewport:{width:390,height:1000},serviceWorkers:'block'}),page=await context.newPage(),other=await context.newPage(),external=[],errors=[];
  await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===origin)return route.continue();external.push(u.origin+u.pathname);return route.abort();});
  for(const p of [page,other]){p.on('pageerror',e=>errors.push(e.message));await p.goto(origin);await p.getByRole('heading',{name:'10 NOVA',exact:true}).waitFor();}
  await other.evaluate(({key,intent})=>localStorage.setItem(key,JSON.stringify([intent])),{key:trade.tradeStorageKey,intent});
  await page.locator('.pending-notice').waitFor();assert.equal(await page.locator('.recovery').getAttribute('open'),'');
  assert.equal(await page.getByRole('button',{name:'Check readiness',exact:true}).isEnabled(),false);
  await page.getByRole('combobox',{name:/Saved operation/}).selectOption(intent.operationId);
  assert.equal(await page.getByLabel('Original transaction hash',{exact:true}).inputValue(),intent.transactionHash);
  // Hold the real same-origin Web Lock in another tab; recovery must stop
  // before any network request, then remain available after release.
  await other.evaluate(()=>{window.lockWork=navigator.locks.request('holdbook-nova-create',()=>new Promise(resolve=>{window.releaseLock=resolve;window.lockHeld=true;}));});
  await other.waitForFunction(()=>window.lockHeld===true);
  await page.getByRole('button',{name:'Query original hash',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.trade-action [role="alert"]')?.textContent.includes('tab'));
  await other.evaluate(async()=>{window.releaseLock();await window.lockWork;});
  await page.getByRole('navigation').getByRole('link',{name:'History',exact:true}).click();
  assert.match(await page.locator('#history').innerText(),/unknown/);
  await page.getByRole('navigation').getByRole('link',{name:'Trade',exact:true}).click();
  await page.reload();await page.locator('.pending-notice').waitFor();
  assert.equal(await page.getByRole('button',{name:'Check readiness',exact:true}).isEnabled(),false);
  assert.equal(await page.locator('.trade-review').count(),0);assert.equal(await page.locator('.recovery').getAttribute('open'),'');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
  results.push({port,width:390,fixture:'Synthetic unknown intent; no real transaction',pendingVisible:true,recoveryOpen:true,hashRetained:true,crossTabStorage:true,nativeWebLock:true,navigation:true,reloadBlocksResubmit:true,noAutomaticRequests:true,external,errors});
  console.log(JSON.stringify({port,fixture:'pending/recovery',status:'passed'}));await context.close();
 }
} finally {writeFileSync(process.argv[3],JSON.stringify({recordedAt:new Date().toISOString(),kind:'Live public reads; synthetic account connection; no signature or transaction',browserVersion:browser.version(),results},null,2)+'\n');await browser.close();}

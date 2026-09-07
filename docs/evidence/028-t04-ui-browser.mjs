// Actual app and live Testnet reads; synthetic EIP-1193 account connection only.
// No wallet profiles, signatures, transactions or valid credentials.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const require=createRequire(process.argv[2]),{chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
const roles={Admin:'0xfd8fdb4989a916c6f2420a2116c356e34c889840',Seller:'0x740e4ef58151a169621622577a5b6d6ff5010836',Buyer:'0xa1f2872ee7a9f74523ae0887a9dc428ff1340706'};
const results=[];
const smoke=process.argv[4]==='smoke';
try {
 for(const port of [5173,4173])for(const width of [1440,390]) {
  const origin='http://127.0.0.1:'+port,context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'}),page=await context.newPage();
  const forbidden=[],external=[],errors=[],pending=[];
  await context.addInitScript(roles=>{
   if(!localStorage.getItem('holdbook.testnet.roles.v1'))localStorage.setItem('holdbook.testnet.roles.v1',JSON.stringify(roles));
   const listeners=new Map();window.walletCalls=[];window.emit=(name,value)=>{for(const fn of listeners.get(name)||[])fn(value)};
   window.ethereum={isMetaMask:true,on(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn)},removeListener(name,fn){listeners.get(name)?.delete(fn)},async request({method}){
    window.walletCalls.push(method);if(method==='eth_accounts'||method==='eth_requestAccounts')return [roles.Seller];if(method==='eth_chainId')return '0x128';throw Error('No signing or mutation in this harness');
   }};
  },roles);
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());if(url.origin===origin)return route.continue();
   if(url.origin==='https://testnet.mirrornode.hedera.com'&&url.pathname.startsWith('/api/v1/')){external.push({kind:'mirror',path:url.pathname});return route.continue()}
   if(url.href==='https://testnet.hashio.io/api'){
    if(smoke)return new Promise(resolve=>pending.push(()=>{void route.abort().finally(resolve)}));
    const body=route.request().postDataJSON();if(!['eth_chainId','eth_blockNumber','eth_call','eth_getCode','eth_getBlockByNumber','eth_getTransactionByHash','eth_getTransactionReceipt','eth_getLogs'].includes(body.method)){forbidden.push(body.method);return route.abort()}
    external.push({kind:'rpc',method:body.method});return route.continue();
   }
   forbidden.push(url.origin+url.pathname);return route.abort();
  });
  page.on('pageerror',error=>errors.push(error.name));
  await page.goto(origin,{waitUntil:'networkidle'});
  assert.deepEqual(await page.evaluate(()=>window.walletCalls),[]);
  if(smoke){
   const panel=page.getByRole('region',{name:'T04 · Hold lifecycle'});
   assert.equal(await panel.getByRole('button',{name:'Approve T04 transaction in MetaMask'}).isEnabled(),false);
   await panel.getByRole('button',{name:'Check current T04 state'}).click();
   await panel.getByRole('button',{name:'Cancel T04 read'}).click();pending.splice(0).forEach(release=>release());
   await panel.getByText('Read cancelled. Existing transactions are retained.',{exact:true}).waitFor();
   await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent==='Check current T04 state'&&!b.disabled));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
   assert.deepEqual(await page.evaluate(()=>window.walletCalls),[]);assert.deepEqual(errors,[]);assert.deepEqual(forbidden,[]);
   results.push({port,width,passed:true,noAutomaticWallet:true,cancelledRead:true,operationReleased:true,noOverflow:true,errors,forbidden});
   console.log(JSON.stringify(results.at(-1)));await context.close();continue;
  }
  await page.getByRole('button',{name:'Connect',exact:true}).click();
  await page.getByRole('button',{name:'Disconnect',exact:true}).waitFor();
  const panel=page.getByRole('region',{name:'T04 · Hold lifecycle'});
  await panel.getByRole('button',{name:'Review next T04 action'}).click();
  await panel.getByRole('heading',{name:'Review: Create Hold 10',exact:true}).waitFor({timeout:180000});
  const state=await panel.innerText();assert.match(state,/Supply \/ cap \/ config\s+100 \/ 1000 \/ 1/);assert.match(state,/Seller available \/ held\s+100 \/ 0/);
  await panel.getByRole('checkbox').focus();await page.keyboard.press('Space');
  assert.equal(await panel.getByRole('checkbox').isChecked(),true);
  assert.equal(await panel.getByRole('button',{name:'Approve T04 transaction in MetaMask'}).isEnabled(),port===4173);
  const focus=await panel.getByRole('checkbox').evaluate(el=>({active:document.activeElement===el,outline:getComputedStyle(el).outlineStyle}));assert.equal(focus.active,true);assert.notEqual(focus.outline,'none');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  const screenshot=`docs/evidence/028-t04-${port}-${width}.png`;await page.screenshot({path:screenshot,fullPage:true});
  assert.equal(await page.getByRole('button',{name:'Approve T03 action in MetaMask'}).count(),0);
  // Wallet transition invalidates the reviewed approval and disables mutations.
  await page.evaluate(()=>window.emit('accountsChanged',[]));
  await panel.getByRole('heading',{name:'Review: Create Hold 10',exact:true}).waitFor({state:'hidden'});
  assert.equal(await panel.getByRole('button',{name:'Approve T04 transaction in MetaMask'}).isEnabled(),false);
  await page.reload({waitUntil:'networkidle'});assert.deepEqual(await page.evaluate(()=>window.walletCalls),[]);
  assert.equal(await panel.getByRole('checkbox').count(),0);
  // Explicitly synthetic unknown journal demonstrates reload/cross-tab gating; no real hash is attached.
  const now=String(Math.floor(Date.now()/1000));
  const record={schemaVersion:1,kind:'t04-transaction',chainId:296,operationId:'synthetic-unknown-ui',startedAt:new Date().toISOString(),action:'create-hold',status:'unknown',signerRole:'Seller',calldataDigest:'0x'+'1'.repeat(64),input:{securityId:'0.0.10402368',securityAddress:'0x261ce349df182988fa25d00868cf6cf434220c24',partition:'0x'+'0'.repeat(63)+'1',holder:roles.Seller,escrow:roles.Admin,destination:'0x'+'0'.repeat(40),baseBlock:'40224162',baseTimestamp:now,expirationTimestamp:String(BigInt(now)+86400n)}};
  const second=await context.newPage();await second.goto(origin);await second.evaluate(record=>localStorage.setItem('holdbook.testnet.t04.v1',JSON.stringify([record])),record);
  await panel.getByText('Create Hold 10 · saved unknown',{exact:false}).waitFor({state:'attached'});
  await page.reload({waitUntil:'networkidle'});await panel.getByText('Create Hold 10 · saved unknown',{exact:false}).waitFor({state:'attached'});
  assert.equal(await panel.getByRole('button',{name:'Approve T04 transaction in MetaMask'}).isEnabled(),false);
  // Same-origin Web Lock excludes prompts in another tab without calling a wallet.
  await page.evaluate(()=>{window.lockPromise=navigator.locks.request('holdbook-nova-create',{mode:'exclusive'},()=>new Promise(r=>window.unlock=r))});
  await page.waitForFunction(()=>!!window.unlock);
  assert.equal(await second.evaluate(()=>navigator.locks.request('holdbook-nova-create',{mode:'exclusive',ifAvailable:true},lock=>!!lock)),false);
  await page.evaluate(async()=>{window.unlock();await window.lockPromise});
  const calls=await page.evaluate(()=>window.walletCalls);assert.ok(calls.every(m=>['eth_accounts','eth_requestAccounts','eth_chainId'].includes(m)));assert.deepEqual(forbidden,[]);assert.deepEqual(errors,[]);
  results.push({port,width,state,screenshot,focus,liveRead:true,accountChangeInvalidation:true,reloadInvalidation:true,crossTabJournal:true,unknownBlocks:true,forbidden,errors,external});
  console.log(JSON.stringify({port,width,passed:true,externalRequests:external.length}));await context.close();
 }
}finally{writeFileSync(process.argv[3],JSON.stringify({recordedAt:new Date().toISOString(),kind:smoke?'Final build no-wallet smoke and cancelled read; blocked RPC boundary':'Actual app, live chain reads, synthetic connection only; no signing/transaction',results},null,2)+'\n',);await browser.close()}

// Actual app and live Testnet reads; synthetic EIP-1193 account connection only.
// No wallet profiles, signatures, transactions or valid credentials.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const require=createRequire(process.argv[2]),{chromium}=require('playwright');
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
const roles={Admin:'0xfd8fdb4989a916c6f2420a2116c356e34c889840',Seller:'0x740e4ef58151a169621622577a5b6d6ff5010836',Buyer:'0xa1f2872ee7a9f74523ae0887a9dc428ff1340706'};
const results=[];
try {
 for(const port of [5173,4173])for(const width of [1440,390]) {
  const origin='http://127.0.0.1:'+port,context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'}),page=await context.newPage();
  const forbidden=[],external=[],errors=[];
  await context.addInitScript(roles=>{
   if(!localStorage.getItem('holdbook.testnet.roles.v1'))localStorage.setItem('holdbook.testnet.roles.v1',JSON.stringify(roles));
   const listeners=new Map();window.walletCalls=[];window.emit=(name,value)=>{for(const fn of listeners.get(name)||[])fn(value)};
   window.ethereum={isMetaMask:true,on(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn)},removeListener(name,fn){listeners.get(name)?.delete(fn)},async request({method}){
    window.walletCalls.push(method);if(method==='eth_accounts'||method==='eth_requestAccounts')return [roles.Admin];if(method==='eth_chainId')return '0x128';throw Error('No signing or mutation in this harness');
   }};
  },roles);
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());if(url.origin===origin)return route.continue();
   if(url.origin==='https://testnet.mirrornode.hedera.com'&&url.pathname.startsWith('/api/v1/')){external.push({kind:'mirror',path:url.pathname});return route.continue()}
   if(url.href==='https://testnet.hashio.io/api'){
    const body=route.request().postDataJSON();if(!['eth_chainId','eth_blockNumber','eth_call','eth_getCode','eth_getBlockByNumber','eth_getTransactionByHash','eth_getTransactionReceipt'].includes(body.method)){forbidden.push(body.method);return route.abort()}
    external.push({kind:'rpc',method:body.method});return route.continue();
   }
   forbidden.push(url.origin+url.pathname);return route.abort();
  });
  page.on('pageerror',error=>errors.push(error.name));
  await page.goto(origin,{waitUntil:'networkidle'});
  assert.deepEqual(await page.evaluate(()=>window.walletCalls),[]);
  await page.getByRole('button',{name:'Connect',exact:true}).click();
  await page.getByRole('button',{name:'Disconnect',exact:true}).waitFor();
  const panel=page.getByRole('region',{name:'T03 · Seller KYC and issue 100 NOVA'});
  await panel.getByRole('button',{name:'Check T03 and prepare review'}).click();
  await panel.getByRole('heading',{name:'Review: Grant Admin ISSUER role',exact:true}).waitFor({timeout:180000});
  const state=await panel.locator('dl').first().innerText();assert.match(state,/Supply \/ cap\s+0 \/ 1000/);assert.match(state,/Seller available \/ held\s+0 \/ 0/);
  await panel.getByRole('checkbox').focus();await page.keyboard.press('Space');
  assert.equal(await panel.getByRole('checkbox').isChecked(),true);
  assert.equal(await panel.getByRole('button',{name:'Approve T03 action in MetaMask'}).isEnabled(),port===4173);
  const focus=await panel.getByRole('checkbox').evaluate(el=>({active:document.activeElement===el,outline:getComputedStyle(el).outlineStyle}));assert.equal(focus.active,true);assert.notEqual(focus.outline,'none');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  const screenshot=`docs/evidence/026-t03-${port}-${width}.png`;await panel.screenshot({path:screenshot});
  // Wallet transition invalidates the reviewed approval and disables mutations.
  await page.evaluate(()=>window.emit('accountsChanged',[]));
  await panel.getByRole('heading',{name:'Review: Grant Admin ISSUER role',exact:true}).waitFor({state:'hidden'});
  assert.equal(await panel.getByRole('button',{name:'Approve T03 action in MetaMask'}).isEnabled(),false);
  await page.reload({waitUntil:'networkidle'});assert.deepEqual(await page.evaluate(()=>window.walletCalls),[]);
  assert.equal(await panel.getByRole('checkbox').count(),0);
  // Explicitly synthetic unknown journal demonstrates reload/cross-tab gating; no real hash is attached.
  const record={schemaVersion:1,kind:'t03',chainId:296,operationId:'synthetic-unknown-ui',startedAt:new Date().toISOString(),action:'issue',status:'unknown',admin:roles.Admin,securityAddress:'0x261ce349df182988fa25d00868cf6cf434220c24',calldataDigest:'0x'+'1'.repeat(64)};
  const second=await context.newPage();await second.goto(origin);await second.evaluate(record=>localStorage.setItem('holdbook.testnet.t03.v1',JSON.stringify([record])),record);
  await panel.getByText('Saved status: unknown',{exact:false}).waitFor();
  await page.reload({waitUntil:'networkidle'});await panel.getByText('Saved status: unknown',{exact:false}).waitFor();
  assert.equal(await panel.getByRole('button',{name:'Approve T03 action in MetaMask'}).isEnabled(),false);
  const calls=await page.evaluate(()=>window.walletCalls);assert.ok(calls.every(m=>['eth_accounts','eth_requestAccounts','eth_chainId'].includes(m)));assert.deepEqual(forbidden,[]);assert.deepEqual(errors,[]);
  results.push({port,width,state,screenshot,focus,liveRead:true,accountChangeInvalidation:true,reloadInvalidation:true,crossTabJournal:true,unknownBlocks:true,forbidden,errors,external});
  console.log(JSON.stringify({port,width,passed:true,externalRequests:external.length}));await context.close();
 }
}finally{writeFileSync(process.argv[3],JSON.stringify({recordedAt:new Date().toISOString(),kind:'Actual app, live chain reads, synthetic connection only; no signing/transaction',results},null,2)+'\n',{flag:'wx'});await browser.close()}

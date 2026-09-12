// Genuine SDK create path with a rejecting synthetic wallet; never a successful transaction fixture.
// node this-file /external/playwright/package.json NEW-result.json
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,cpSync,copyFileSync,symlinkSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build,createServer,preview} from 'vite';
const require=createRequire(process.argv[2]),{chromium}=require('playwright');
const scratch=mkdtempSync(join(tmpdir(),'holdbook-nova023-')),root=process.cwd(),results=[];
let dev,prod,browser;
try {
 cpSync(join(root,'src'),join(scratch,'src'),{recursive:true});
 for(const p of ['vite.config.ts','package.json'])copyFileSync(join(root,p),join(scratch,p));
 symlinkSync(join(root,'node_modules'),join(scratch,'node_modules'),'dir');
 writeFileSync(join(scratch,'index.html'),'<html lang="en"><title>Synthetic rejected SDK probe</title><script type="module" src="/probe.js"></script></html>');
 writeFileSync(join(scratch,'probe.js'),`
 import * as n from './src/lib/nova';
 window.holdLock=()=>{window.lockAttempt=n.withNovaLock(navigator.locks,()=>new Promise(resolve=>window.releaseLock=resolve));};
 window.tryLock=()=>n.withNovaLock(navigator.locks,async()=>true).catch(()=>false);
 window.probe=async(mode)=>{
  const originalNow=Date.now;
  const sdk=await import('@hashgraph/asset-tokenization-sdk');
  const admin='0x'+'a'.repeat(40),calldata=await n.novaCalldata(admin,1),calls=[],updates=[];
  const review={wallet:{roles:{Admin:admin},provider:{request:async({method,params})=>{
   calls.push(method);if(method!=='eth_sendTransaction')throw Error('Forbidden synthetic wallet request');
   n.assertNovaTransaction(params[0],{admin,factory:n.factoryAddress,calldata});if(mode==='timeout')return '0x'+'1'.repeat(64);throw {code:4001};
  }}},calldata,configVersion:1};
  const record={schemaVersion:1,kind:'nova-create',chainId:296,operationId:'rejected-sdk-fixture',startedAt:new Date().toISOString(),admin,configVersion:1,calldataDigest:'0x'+'1'.repeat(64),status:'awaiting-signature'};
  const providers=await n.createNovaProviders(review,record,r=>{updates.push({status:r.status,hasHash:!!r.transactionHash});if(mode==='timeout'&&r.transactionHash){const now=originalNow();Date.now=()=>now+61000}},async()=>{},new AbortController().signal);
  const before=window.discovery;let connected=false,validation=false,diagnostic='',timedOutByHarness=false,sdkCompleted=false;const started=originalNow();let guard;
  try {
   try{await sdk.Network.connect(new sdk.ConnectRequest({network:'bad',wallet:sdk.SupportedWallets.METAMASK}),{provider:providers.browser})}catch{validation=true}
   await sdk.Network.connect(new sdk.ConnectRequest({network:'testnet',wallet:sdk.SupportedWallets.METAMASK,
    account:{accountId:'0.0.101',evmAddress:admin},mirrorNode:{baseUrl:'https://testnet.mirrornode.hedera.com/api/v1/'},
    rpcNode:{baseUrl:'https://testnet.hashio.io/api',queryProvider:providers.read}}),{provider:providers.browser});connected=true;
   await sdk.Network.setConfig(new sdk.SetConfigurationRequest({factoryAddress:'0.0.9213391',resolverAddress:'0.0.9212226'}));
   await Promise.race([sdk.Equity.create(new sdk.CreateEquityRequest(n.novaParameters(admin,1))),new Promise((_,reject)=>{guard=setTimeout(()=>{timedOutByHarness=true;reject(Error('Harness deadline'))},20000)})]);
   sdkCompleted=true;throw Error('Unexpected SDK success');
  }catch(error){diagnostic=mode==='mirror-timeout'?'SDK Mirror timeout boundary':mode==='timeout'?'SDK rejected after bounded lookup; hash retained':'SDK rejected after manual-provider rejection'}
  finally {clearTimeout(guard);if(connected)await sdk.Network.disconnect();providers.close();Date.now=originalNow}
  return {calls,updates,validation,connected,sdkCompleted,timedOutByHarness,elapsedMs:originalNow()-started,discoveryDelta:window.discovery-before,released:providers.browser.destroyed&&providers.read.destroyed,diagnostic,record:providers.getRecord().status};
 };
 `);
 await build({root:scratch,cacheDir:join(scratch,'.vite'),logLevel:'silent'});
 dev=await createServer({root:scratch,cacheDir:join(scratch,'.vite'),logLevel:'silent',server:{host:'127.0.0.1',port:5186,strictPort:true}});await dev.listen();
 prod=await preview({root:scratch,logLevel:'silent',preview:{host:'127.0.0.1',port:4186,strictPort:true}});
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
 for(const port of [5186,4186])for(const mode of (process.argv.includes('--mirror-only')?['mirror-timeout']:['reject','timeout','mirror-timeout'])){
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),requests=[],forbidden=[];
  await context.addInitScript(()=>{window.discovery=0;Object.defineProperty(window,'ethereum',{get(){window.discovery++;throw Error('Wallet discovery forbidden')}})});
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());if(url.origin==='http://127.0.0.1:'+port)return route.continue();
   if(url.origin==='https://testnet.mirrornode.hedera.com' && /^\/api\/v1\/contracts\/0\.0\.(9212226|9213391)$/.test(url.pathname)){
    const id=url.pathname.split('/').at(-1);requests.push({kind:'mirror',id});if(mode==='mirror-timeout')return;return route.fulfill({json:{contract_id:id,evm_address:id==='0.0.9212226'?'0xba2d5fc2083a0b8f164c50e65d782087fba18e0a':'0xd1f118a40f3b02883d35909ef2517e7edd78379d'},headers:{'access-control-allow-origin':'*'}});
   }
   if(url.href==='https://testnet.hashio.io/api'){
    const body=route.request().postDataJSON();requests.push({kind:'rpc',method:body.method});
    if(!['eth_chainId','eth_blockNumber'].includes(body.method)){forbidden.push(body.method);return route.abort()}
    return route.fulfill({json:{jsonrpc:'2.0',id:body.id,result:body.method==='eth_chainId'?'0x128':'0x10'},headers:{'access-control-allow-origin':'*'}});
   }
   forbidden.push(url.origin+url.pathname);return route.abort();
  });
  await page.goto('http://127.0.0.1:'+port);await page.waitForFunction(()=>!!window.probe);
  const second=await context.newPage();await second.goto('http://127.0.0.1:'+port);await second.waitForFunction(()=>!!window.tryLock);
  await page.evaluate(()=>window.holdLock());await page.waitForFunction(()=>!!window.releaseLock);
  assert.equal(await second.evaluate(()=>window.tryLock()),false);
  await page.evaluate(async()=>{window.releaseLock();await window.lockAttempt});
  assert.equal(await second.evaluate(()=>window.tryLock()),true);await second.close();
  const result=await page.evaluate(mode=>window.probe(mode),mode);result.crossTabExclusion=true;
  console.log(JSON.stringify({port,mode,...result,requests,forbidden}));
  assert.equal(result.validation,true);assert.equal(result.connected,true);assert.equal(result.discoveryDelta,0);assert.equal(result.released,true);
  assert.equal(result.sdkCompleted,false);assert.equal(result.timedOutByHarness,false);assert.deepEqual(result.calls,mode==='mirror-timeout'?[]:['eth_sendTransaction']);assert.equal(result.record,mode==='mirror-timeout'?'awaiting-signature':mode==='reject'?'rejected':'pending');assert.deepEqual(forbidden,[]);
  assert.equal(result.updates.some(r=>r.hasHash),mode==='timeout');
  results.push({port,mode,...result,requests,forbidden});await context.close();
 }
 writeFileSync(process.argv[3],JSON.stringify({date:new Date().toISOString(),kind:'Actual SDK; synthetic rejected provider and HTTP only; no VC or transaction success',results},null,2)+'\n',{flag:'wx'});
}finally{await browser?.close();await dev?.close();await new Promise(r=>prod?prod.httpServer.close(r):r());rmSync(scratch,{recursive:true,force:true})}

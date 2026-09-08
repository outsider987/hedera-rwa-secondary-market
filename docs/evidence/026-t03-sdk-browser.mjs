// Genuine pinned public SDK; HTTP and rejecting wallet are explicit synthetic boundaries.
// No valid VC, signature, private key or real transaction is generated.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,cpSync,copyFileSync,symlinkSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build,createServer,preview} from 'vite';
import {Interface} from 'ethers';
import {IAsset__factory} from '@hashgraph/asset-tokenization-contracts';
const require=createRequire(process.argv[2]),{chromium}=require('playwright');
const scratch=mkdtempSync(join(tmpdir(),'holdbook-t03-sdk-')),root=process.cwd(),results=[],asset=new Interface(IAsset__factory.abi);
const A='0xfd8fdb4989a916c6f2420a2116c356e34c889840',S='0x261ce349df182988fa25d00868cf6cf434220c24';
let dev,prod,browser;
try {
 cpSync(join(root,'src'),join(scratch,'src'),{recursive:true});
 for(const file of ['vite.config.ts','package.json'])copyFileSync(join(root,file),join(scratch,file));
 symlinkSync(join(root,'node_modules'),join(scratch,'node_modules'),'dir');
 writeFileSync(join(scratch,'index.html'),'<html lang="en"><title>T03 synthetic rejection boundary</title><script type="module" src="/probe.js"></script></html>');
 writeFileSync(join(scratch,'probe.js'),`
 import * as l from './src/lib/lifecycle';
 window.holdLock=()=>{window.lock=l.withLifecycleLock(navigator.locks,()=>new Promise(r=>window.releaseLock=r))};
 window.tryLock=()=>l.withLifecycleLock(navigator.locks,async()=>true).catch(()=>false);
 window.probe=async(action,mode)=>{
  const sdk=await import('@hashgraph/asset-tokenization-sdk'),calls=[],updates=[];
  const now=Date.now;let timedOut=false,connected=false,completed=false,guard,diagnostic='';
  const review={action,calldata:await l.actionCalldata(action),wallet:{roles:Object.fromEntries(Object.entries(l.accounts).map(([k,v])=>[k,v.address])),provider:{request:async({method,params})=>{
   calls.push(method);if(method!=='eth_sendTransaction')throw Error('Forbidden wallet method');l.assertLifecycleTransaction(params[0],review.calldata);
   if(mode==='timeout')return '0x'+'1'.repeat(64);throw {code:4001};
  }}}};
  const initial={schemaVersion:1,kind:'t03',chainId:296,operationId:'synthetic-sdk-boundary',startedAt:new Date().toISOString(),action,status:'awaiting-signature',admin:l.accounts.Admin.address,securityAddress:l.securityAddress,calldataDigest:'0x'+'1'.repeat(64)};
  const p=await l.createLifecycleProviders(review,initial,r=>{updates.push({status:r.status,hasHash:!!r.transactionHash});if(mode==='timeout'&&r.transactionHash){const time=now();Date.now=()=>time+61000}},async()=>{},new AbortController().signal);
  try {
   await sdk.Network.connect(new sdk.ConnectRequest({network:'testnet',wallet:sdk.SupportedWallets.METAMASK,account:{accountId:l.accounts.Admin.accountId,evmAddress:l.accounts.Admin.address},mirrorNode:{baseUrl:'https://testnet.mirrornode.hedera.com/api/v1/'},rpcNode:{baseUrl:'https://testnet.hashio.io/api',queryProvider:p.read}}),{provider:p.browser});connected=true;
   await Promise.race([l.executeLifecycleSdk(review),new Promise((_,reject)=>guard=setTimeout(()=>{timedOut=true;reject(Error('Harness timeout'))},20000))]);completed=true;
  }catch(error){diagnostic=mode==='reject'?'SDK rejection boundary':'SDK bounded confirmation boundary'}finally{clearTimeout(guard);if(connected)await sdk.Network.disconnect();p.close();Date.now=now}
  return {calls,updates,connected,completed,timedOut,diagnostic,status:p.getRecord().status,released:p.browser.destroyed&&p.read.destroyed};
 };
 window.negativeKyc=async()=>{
  const sdk=await import('@hashgraph/asset-tokenization-sdk');
  try{await sdk.Kyc.grantKyc(new sdk.GrantKycRequest({securityId:l.securityId,targetId:l.accounts.Seller.address,vcBase64:btoa(JSON.stringify({id:'unsigned-boundary',issuer:'did:ethr:'+l.accounts.Admin.address,credentialSubject:{id:'did:ethr:'+l.accounts.Seller.address,passed:true},validFrom:'2026-09-07T00:00:00.000Z',validUntil:'2026-09-14T00:00:00.000Z'}))}));return false}catch{return true}
 };
 `);
 await build({root:scratch,cacheDir:join(scratch,'.vite'),logLevel:'silent'});
 dev=await createServer({root:scratch,cacheDir:join(scratch,'.vite'),logLevel:'silent',server:{host:'127.0.0.1',port:5186,strictPort:true}});await dev.listen();
 prod=await preview({root:scratch,logLevel:'silent',preview:{host:'127.0.0.1',port:4186,strictPort:true}});
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
 for(const port of [5186,4186])for(const action of ['issuer-role','ssi-role','kyc-role','register-issuer','issue'])for(const mode of ['reject','timeout']){
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),requests=[],forbidden=[];
  await context.addInitScript(()=>Object.defineProperty(window,'ethereum',{get(){throw Error('Wallet discovery forbidden')}}));
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());if(url.origin==='http://127.0.0.1:'+port)return route.continue();
   const headers={'access-control-allow-origin':'*'};
   if(url.origin==='https://testnet.mirrornode.hedera.com'){
    requests.push({kind:'mirror',path:url.pathname});
    if(/^\/api\/v1\/contracts\/(0\.0\.10402368|0x261ce349df182988fa25d00868cf6cf434220c24)$/.test(url.pathname))return route.fulfill({json:{contract_id:'0.0.10402368',evm_address:S,deleted:false},headers});
    if(/^\/api\/v1\/accounts\//.test(url.pathname))return route.fulfill({json:{account:'0.0.10389090',evm_address:A,deleted:false},headers});
   }
   if(url.href==='https://testnet.hashio.io/api'){
    const body=route.request().postDataJSON();let result;
    if(body.method==='eth_chainId')result='0x128';else if(body.method==='eth_blockNumber')result='0x10';
    else if(body.method==='eth_call'){
     const decoded=asset.parseTransaction({data:body.params[0].data}),name=decoded.name;requests.push({kind:'getter',name});
     const values={getERC20Metadata:[{info:{name:'Nova Private Equity Common Shares',symbol:'NOVA',isin:'USNOVA000016',decimals:0},securityType:1}],totalSupply:[0],getMaxSupply:[1000],getControlListType:[false],isActivated:[false],isControllable:[true],arePartitionsProtected:[false],isClearingActivated:[false],isInternalKycActivated:[true],isMultiPartition:[false],isIssuable:[true],paused:[false],hasRole:[true],isIssuer:[action==='issue'],getKycStatusFor:[1],getControlListCount:[0],getControlListMembers:[[]],isExternallyGranted:[true]};
     if(!values[name]){forbidden.push(name);return route.abort()}result=asset.encodeFunctionResult(name,values[name]);
    }else{forbidden.push(body.method);return route.abort()}
    return route.fulfill({json:{jsonrpc:'2.0',id:body.id,result},headers});
   }
   forbidden.push(url.origin+url.pathname);return route.abort();
  });
  await page.goto('http://127.0.0.1:'+port);await page.waitForFunction(()=>!!window.probe);
  const result=await page.evaluate(([action,mode])=>window.probe(action,mode),[action,mode]);
  console.log(JSON.stringify({port,action,mode,...result,forbidden}));
  results.push({port,action,mode,...result,requests,forbidden});
  assert.equal(result.connected,true);assert.equal(result.completed,false);assert.equal(result.timedOut,false);assert.equal(result.released,true);
  assert.deepEqual(result.calls,['eth_sendTransaction']);assert.deepEqual(forbidden,[]);assert.equal(result.status,mode==='reject'?'rejected':'pending');
  assert.equal(await page.evaluate(()=>window.negativeKyc()),true);
  if(action==='issuer-role'&&mode==='reject'){
   const second=await context.newPage();await second.goto('http://127.0.0.1:'+port);await second.waitForFunction(()=>!!window.tryLock);
   await page.evaluate(()=>window.holdLock());await page.waitForFunction(()=>!!window.releaseLock);assert.equal(await second.evaluate(()=>window.tryLock()),false);
   await page.evaluate(async()=>{window.releaseLock();await window.lock});assert.equal(await second.evaluate(()=>window.tryLock()),true);result.crossTabExclusion=true;await second.close();
  }
  await context.close();
 }
}finally{
 writeFileSync(process.argv[3],JSON.stringify({recordedAt:new Date().toISOString(),kind:'Genuine SDK with synthetic HTTP/rejecting provider; no real transaction or valid VC',results},null,2)+'\n',{flag:'wx'});
 await browser?.close();await dev?.close();await new Promise(r=>prod?prod.httpServer.close(r):r());rmSync(scratch,{recursive:true,force:true});
}

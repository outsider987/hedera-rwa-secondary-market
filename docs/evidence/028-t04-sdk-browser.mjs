// Genuine pinned SDK and owned providers. Synthetic HTTP and rejecting/hash-only wallet.
// Never signs, broadcasts or fabricates a valid VC. Hashes below are boundary fixtures.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,cpSync,copyFileSync,symlinkSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build,createServer,preview} from 'vite';
import {Interface} from 'ethers';
import {IAsset__factory} from '@hashgraph/asset-tokenization-contracts';
const {chromium}=createRequire(process.argv[2])('playwright');
const scratch=mkdtempSync(join(tmpdir(),'holdbook-t04-sdk-')),root=process.cwd(),results=[],asset=new Interface(IAsset__factory.abi);
const A='0xfd8fdb4989a916c6f2420a2116c356e34c889840',S='0x740e4ef58151a169621622577a5b6d6ff5010836',B='0xa1f2872ee7a9f74523ae0887a9dc428ff1340706',N='0x261ce349df182988fa25d00868cf6cf434220c24',Z='0x'+'0'.repeat(40);
let dev,prod,browser;
try{
 cpSync(join(root,'src'),join(scratch,'src'),{recursive:true});for(const f of ['vite.config.ts','package.json'])copyFileSync(join(root,f),join(scratch,f));symlinkSync(join(root,'node_modules'),join(scratch,'node_modules'),'dir');
 writeFileSync(join(scratch,'index.html'),'<html lang="en"><title>T04 synthetic SDK boundary</title><script type="module" src="/probe.js"></script></html>');
 writeFileSync(join(scratch,'probe.js'),`
 import * as h from './src/lib/hold';import * as l from './src/lib/lifecycle';import {createAssetProviders} from './src/lib/transport';import {holdEvidence} from './src/lib/evidence';import {keccak256} from 'viem';
 window.invalidBuyer=async()=>{
  const sdk=await import('@hashgraph/asset-tokenization-sdk');
  try{await sdk.Kyc.grantKyc(new sdk.GrantKycRequest({securityId:l.securityId,targetId:l.accounts.Buyer.address,vcBase64:btoa(JSON.stringify({id:'unsigned-boundary',issuer:'did:ethr:'+l.accounts.Admin.address,credentialSubject:{id:'did:ethr:'+l.accounts.Buyer.address,passed:true},validFrom:new Date(Date.now()-300000).toISOString(),validUntil:new Date(Date.now()+7*86400000).toISOString()}))}));return false}catch{return true}
 };
 window.probe=async(action,mode)=>{
  const sdk=await import('@hashgraph/asset-tokenization-sdk'),calls=[],updates=[];let connected=false,errorCode='',complete=false,timedOut=false,timeout;
  const input={...h.createHoldInput({block:'40224162',timestamp:String(Math.floor(Date.now()/1000))}),...(action==='create-hold'?{}:{holdId:'7'})};
  const calldata=await h.holdCalldata(action,input);const role=action==='create-hold'?'Seller':'Admin';
  const review={action,input,calldata,digest:keccak256(calldata),wallet:{expectedRole:role,roles:Object.fromEntries(Object.entries(l.accounts).map(([k,v])=>[k,v.address])),provider:{request:async({method,params})=>{
   calls.push(method);h.assertHoldTransaction(params[0],action,calldata);if(mode==='reject')throw {code:4001};return '0x'+'1'.repeat(64);
  }}}};
  const record={schemaVersion:1,kind:'t04-transaction',chainId:296,operationId:'synthetic-sdk',startedAt:new Date().toISOString(),action:action==='kyc-negative'?'execute':action,status:'awaiting-signature',input,signerRole:role,calldataDigest:review.digest};
  const p=await createAssetProviders({wallet:review.wallet,signer:l.accounts[role].address,securityAddress:l.securityAddress,calldata,reads:await h.holdSdkReads(input),initial:record,sanitize:holdEvidence,update:r=>updates.push({status:r.status,hasHash:!!r.transactionHash}),checkCurrent:async()=>{},signal:new AbortController().signal,recoverAfterHash:true,readOnly:action==='kyc-negative',readBlock:mode==='historical'?'0x10':undefined,verifyReceipt:h.verifyHoldReceipt});
  try{
   await sdk.Network.connect(new sdk.ConnectRequest({network:'testnet',wallet:sdk.SupportedWallets.METAMASK,account:{accountId:l.accounts[role].accountId,evmAddress:l.accounts[role].address},mirrorNode:{baseUrl:'https://testnet.mirrornode.hedera.com/api/v1/'},rpcNode:{baseUrl:'https://testnet.hashio.io/api',queryProvider:p.read}}),{provider:p.browser});connected=true;
   await Promise.race([h.executeHoldSdk(review),new Promise((_,reject)=>timeout=setTimeout(()=>{timedOut=true;reject(Error('Harness timeout'))},20000))]);complete=true;
  }catch(error){errorCode=String(error.errorCode??error.code??'');if(action==='kyc-negative')window.classified=h.isSdkBuyerKycRejection(error)}
  finally{clearTimeout(timeout);if(connected)await sdk.Network.disconnect();p.close()}
  return {calls,updates,connected,complete,timedOut,errorCode,status:p.getRecord().status,classified:action==='kyc-negative'?window.classified:undefined,released:p.browser.destroyed&&p.read.destroyed};
 };
 `);
 await build({root:scratch,cacheDir:join(scratch,'.vite'),logLevel:'silent'});
 dev=await createServer({root:scratch,cacheDir:join(scratch,'.vite'),logLevel:'silent',server:{host:'127.0.0.1',port:5186,strictPort:true}});await dev.listen();prod=await preview({root:scratch,logLevel:'silent',preview:{host:'127.0.0.1',port:4186,strictPort:true}});
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
 for(const port of [5186,4186])for(const [action,mode] of [['create-hold','reject'],['create-hold','hash'],['execute','reject'],['execute','hash'],['release','reject'],['release','hash'],['kyc-negative','read-only'],['kyc-negative','historical'],['kyc-negative','transport']]){
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),requests=[],forbidden=[];
  await context.addInitScript(()=>Object.defineProperty(window,'ethereum',{get(){throw Error('Wallet discovery forbidden')}}));
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());if(url.origin==='http://127.0.0.1:'+port)return route.continue();const headers={'access-control-allow-origin':'*'};
   if(url.origin==='https://testnet.mirrornode.hedera.com'){
    requests.push({kind:'mirror',path:url.pathname});
    if(url.pathname.startsWith('/api/v1/contracts/'))return route.fulfill({json:{contract_id:'0.0.10402368',evm_address:N,deleted:false},headers});
    if(url.pathname.startsWith('/api/v1/accounts/')){const key=url.pathname.split('/').at(-1).toLowerCase(),i=[A,S,B].findIndex(a=>a===key),n=['0.0.10389090','0.0.10389111','0.0.10389098'].indexOf(key),j=i>=0?i:n>=0?n:0;return route.fulfill({json:{account:['0.0.10389090','0.0.10389111','0.0.10389098'][j],evm_address:[A,S,B][j],deleted:false},headers});}
   }
   if(url.href==='https://testnet.hashio.io/api'){
    const body=route.request().postDataJSON();let result;
    if(body.method==='eth_chainId')result='0x128';else if(body.method==='eth_blockNumber')result='0x10';else if(body.method==='eth_call'){
     const decoded=asset.parseTransaction({data:body.params[0].data}),name=decoded.name;requests.push({kind:'getter',name,block:body.params[1]});
     if(action==='kyc-negative'&&mode==='transport'&&name==='getKycStatusFor')return route.fulfill({status:503,body:'Synthetic transport failure',headers});
     const values={getERC20Metadata:[{info:{name:'Nova Private Equity Common Shares',symbol:'NOVA',isin:'USNOVA000016',decimals:0},securityType:1}],totalSupply:[100],balanceOf:[100],getMaxSupply:[1000],getControlListType:[false],isActivated:[false],isControllable:[true],arePartitionsProtected:[false],isClearingActivated:[false],isInternalKycActivated:[true],isMultiPartition:[false],isIssuable:[true],paused:[false],hasRole:[true],isIssuer:[true],getKycStatusFor:[action==='kyc-negative'&&name==='getKycStatusFor'&&decoded.args[0].toLowerCase()===B&&(mode!=='historical'||body.params[1]==='0x10')?0:1],getControlListCount:[0],getControlListMembers:[[]],isExternallyGranted:[true],getHoldForByPartition:[action==='release'?4:10,Math.floor(Date.now()/1000)+86400,A,Z,'0x','0x',0]};
     if(!values[name]){forbidden.push(name);return route.abort()}result=asset.encodeFunctionResult(name,values[name]);
    }else{forbidden.push(body.method);return route.abort()}
    return route.fulfill({json:{jsonrpc:'2.0',id:body.id,result},headers});
   }
   forbidden.push(url.origin+url.pathname);return route.abort();
  });
  await page.goto('http://127.0.0.1:'+port);await page.waitForFunction(()=>!!window.probe);const result=await page.evaluate(([a,m])=>window.probe(a,m),[action,mode]);results.push({port,action,mode,...result,requests,forbidden});console.log(JSON.stringify({port,action,mode,...result,forbidden}));
  assert.equal(result.connected,true);assert.equal(result.complete,false);assert.equal(result.timedOut,false);assert.equal(result.released,true);assert.deepEqual(forbidden,[]);
  if(action==='kyc-negative'){assert.deepEqual(result.calls,[]);assert.equal(result.classified,mode!=='transport');if(mode==='historical')assert.ok(requests.filter(r=>r.kind==='getter').every(r=>r.block==='0x10'))}else{assert.deepEqual(result.calls,['eth_sendTransaction']);assert.equal(result.status,mode==='reject'?'rejected':'pending')}
  if(action==='kyc-negative'&&mode==='read-only'){assert.equal(await page.evaluate(()=>window.invalidBuyer()),true);results.at(-1).unsignedBuyerSdkRejected=true;}
  await context.close();
 }
}finally{
 writeFileSync(process.argv[3],JSON.stringify({recordedAt:new Date().toISOString(),kind:'Genuine SDK, synthetic network/wallet boundaries; no signatures or chain transactions',results},null,2)+'\n');
 await browser?.close();await dev?.close();await new Promise(r=>prod?prod.httpServer.close(r):r());rmSync(scratch,{recursive:true,force:true});
}

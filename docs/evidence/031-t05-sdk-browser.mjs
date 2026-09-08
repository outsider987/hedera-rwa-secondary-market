// Genuine ATS 8.0.0 with controlled public HTTP and a rejecting/hash-only wallet.
// No wallet discovery, signature, private signer, broadcast or valid VC fixture.
import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,copyFileSync,symlinkSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build,createServer,preview} from 'vite';
import {Interface} from 'ethers';
import {IAsset__factory} from '@hashgraph/asset-tokenization-contracts';
const {chromium}=await import(process.argv[2]),scratch=mkdtempSync(join(tmpdir(),'holdbook-t05-sdk-')),root=process.cwd(),results=[],asset=new Interface(IAsset__factory.abi);
const A='0xfd8fdb4989a916c6f2420a2116c356e34c889840',S='0x740e4ef58151a169621622577a5b6d6ff5010836',B='0xa1f2872ee7a9f74523ae0887a9dc428ff1340706',N='0x261ce349df182988fa25d00868cf6cf434220c24',SW='0x'+'9'.repeat(40);
let dev,prod,browser;
try {
 cpSync(join(root,'src'),join(scratch,'src'),{recursive:true});for(const f of ['vite.config.ts','package.json'])copyFileSync(join(root,f),join(scratch,f));symlinkSync(join(root,'node_modules'),join(scratch,'node_modules'),'dir');
 writeFileSync(join(scratch,'index.html'),'<html lang="en"><title>T05 controlled SDK boundary</title><script type="module" src="/probe.js"></script></html>');
 writeFileSync(join(scratch,'probe.js'),`
 import * as t from './src/trade';import * as h from './src/hold';import * as l from './src/lifecycle';import {createAssetProviders} from './src/transport';import {tradeEvidence} from './src/evidence';import {keccak256} from 'viem';
 window.probe=async mode=>{
  const sdk=await import('@hashgraph/asset-tokenization-sdk'),calls=[],updates=[];let connected=false,timedOut=false,errorCode='',timer;
  const input={...t.createTradeInput({block:'40243275',timestamp:String(Math.floor(Date.now()/1000))}),escrow:'${SW}'};
  const calldata=await t.tradeCalldata('lock',input),record={schemaVersion:1,chainId:296,kind:'t05-transaction',operationId:'sdk-boundary',startedAt:new Date().toISOString(),action:'lock',status:'awaiting-signature',signerRole:'Seller',input,calldata,calldataDigest:keccak256(calldata),walletValueWeibars:'0'};
  const wallet={provider:{request:async({method,params})=>{
   calls.push(method);t.assertTradeTransaction({...params[0],chainId:'0x128',value:params[0].value??'0x0'},'lock',input,calldata);
   if(mode==='reject')throw {code:4001};if(mode==='unknown')throw {code:-32603};return '0x'+'1'.repeat(64);
  }}};
  const p=await createAssetProviders({wallet,signer:l.accounts.Seller.address,securityAddress:l.securityAddress,calldata:mode==='calldata'?calldata+'00':calldata,reads:await h.holdSdkReads(input),initial:record,sanitize:tradeEvidence,update:r=>updates.push({status:r.status,hasHash:!!r.transactionHash}),checkCurrent:async mutation=>{
   if(mode==='stale')throw Error('Controlled stale session');
   if(mode==='kyc'&&mutation){const invalid={status:0,vcId:'',issuer:l.accounts.Admin.address,validFrom:'0',validTo:'0'};
    t.assertTradeState({block:input.baseBlock,timestamp:input.baseTimestamp,roles:[true,true,true],issuer:true,supply:'100',sellerBalance:'94',buyerBalance:'6',sellerHeld:'0',buyerHeld:'0',sellerKyc:invalid,buyerKyc:invalid,sellerHoldIds:[],buyerHoldIds:[]},input,'start');}
  },signal:new AbortController().signal,recoverAfterHash:true,readOnly:mode==='readonly',verifyReceipt:t.verifyTradeReceipt});
  try {
   await sdk.Network.connect(new sdk.ConnectRequest({network:'testnet',wallet:sdk.SupportedWallets.METAMASK,account:{accountId:l.accounts.Seller.accountId,evmAddress:l.accounts.Seller.address},mirrorNode:{baseUrl:'https://testnet.mirrornode.hedera.com/api/v1/'},rpcNode:{baseUrl:'https://testnet.hashio.io/api',queryProvider:p.read}}),{provider:p.browser});connected=true;
   await Promise.race([t.createTradeHoldSdk(input),new Promise((_,reject)=>timer=setTimeout(()=>{timedOut=true;reject(Error('Harness timeout'));},20000))]);
  }catch(error){errorCode=String(error.errorCode??error.code??'');}
  finally{clearTimeout(timer);if(connected)await sdk.Network.disconnect();p.close();}
  return {calls,updates,connected,timedOut,errorCode,status:p.getRecord().status,attempted:p.wasAttempted(),hasHash:!!p.getRecord().transactionHash,released:p.browser.destroyed&&p.read.destroyed};
 };
 `);
 await build({root:scratch,cacheDir:join(scratch,'.vite'),logLevel:'silent'});
 dev=await createServer({root:scratch,cacheDir:join(scratch,'.vite'),logLevel:'silent',server:{host:'127.0.0.1',port:5187,strictPort:true}});await dev.listen();prod=await preview({root:scratch,logLevel:'silent',preview:{host:'127.0.0.1',port:4187,strictPort:true}});
 browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
 for(const port of [5187,4187])for(const mode of ['reject','hash','unknown','readonly','stale','calldata','kyc']) {
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),requests=[],forbidden=[];
  await context.addInitScript(()=>Object.defineProperty(window,'ethereum',{get(){throw Error('Wallet discovery forbidden');}}));
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());if(url.origin==='http://127.0.0.1:'+port)return route.continue();const headers={'access-control-allow-origin':'*'};
   if(url.origin==='https://testnet.mirrornode.hedera.com') {
    const key=url.pathname.split('/').at(-1).toLowerCase(),addresses=[A,S,B,N,SW],ids=['0.0.10389090','0.0.10389111','0.0.10389098','0.0.10402368','0.0.99999'];
    const i=addresses.includes(key)?addresses.indexOf(key):ids.indexOf(key);
    if(i>=0&&url.pathname.startsWith('/api/v1/accounts/'))return route.fulfill({json:{account:ids[i],evm_address:addresses[i],deleted:false},headers});
    if(i>=3&&url.pathname.startsWith('/api/v1/contracts/'))return route.fulfill({json:{contract_id:ids[i],evm_address:addresses[i],deleted:false},headers});
   }
   if(url.href==='https://testnet.hashio.io/api') {
    const body=route.request().postDataJSON();let result;
    if(body.method==='eth_chainId')result='0x128';else if(body.method==='eth_blockNumber')result='0x10';else if(body.method==='eth_call') {
     const parsed=asset.parseTransaction({data:body.params[0].data}),name=parsed.name;requests.push(name);
     const values={getERC20Metadata:[{info:{name:'Nova Private Equity Common Shares',symbol:'NOVA',isin:'USNOVA000016',decimals:0},securityType:1}],totalSupply:[100],balanceOf:[94],getMaxSupply:[1000],getControlListType:[false],isActivated:[false],isControllable:[true],arePartitionsProtected:[false],isClearingActivated:[false],isInternalKycActivated:[true],isMultiPartition:[false],isIssuable:[true],paused:[false],hasRole:[true],isIssuer:[true],getKycStatusFor:[mode==='kyc'?0:1],getControlListCount:[0],getControlListMembers:[[]],isExternallyGranted:[mode!=='kyc']};
     if(!values[name]){forbidden.push(name);return route.abort();}result=asset.encodeFunctionResult(name,values[name]);
    }else{forbidden.push(body.method);return route.abort();}
    return route.fulfill({json:{jsonrpc:'2.0',id:body.id,result},headers});
   }
   forbidden.push(url.origin+url.pathname);return route.abort();
  });
  await page.goto('http://127.0.0.1:'+port);await page.waitForFunction(()=>!!window.probe);
  const result=await page.evaluate(mode=>window.probe(mode),mode);results.push({port,mode,...result,requests,forbidden});console.log(JSON.stringify({port,mode,...result,forbidden}));
  assert.equal(result.timedOut,false);assert.equal(result.released,true);assert.deepEqual(forbidden,[]);
  if(['hash','reject','unknown'].includes(mode)){assert.deepEqual(result.calls,['eth_sendTransaction']);assert.equal(result.status,mode==='hash'?'pending':mode==='reject'?'rejected':'unknown');assert.equal(result.hasHash,mode==='hash');}
  else {assert.deepEqual(result.calls,[]);assert.equal(result.attempted,false);}
  await context.close();
 }
} finally {
 writeFileSync(process.argv[3],JSON.stringify({recordedAt:new Date().toISOString(),kind:'Genuine SDK with controlled HTTP and wallet boundaries; no actual signature or transaction',results},null,2)+'\n');
 await browser?.close();await dev?.close();await new Promise(r=>prod?prod.httpServer.close(r):r());rmSync(scratch,{recursive:true,force:true});
}

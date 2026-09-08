import {encodeAbiParameters,keccak256,stringToHex,type Hex} from 'viem';
import {accounts,securityAddress} from './lifecycle';
export type SettlementTerms={matchId:Hex;sellerOrder:Hex;buyerOrder:Hex;seller:string;buyer:string;amount:string;priceTinybars:string;preparedAt:string;expiry:string;holdId:string};
export type Settlement={id:string;contract:string;salt:Hex;terms:SettlementTerms;digest:string;status:'Unprepared'|'Locked'|'Ready'|'Settled'|'Cancelled'|'Reclaimed'|'Returned';baseBlock:string;updatedAt:string};
export type SettlementBalances={sellerAvailable:string;sellerHeld:string;buyerAvailable:string;buyerHeld:string};
export type SettlementEvidence={before?:SettlementBalances;after?:SettlementBalances;hash:string;block:string;timestamp:string;contract:string;holdId:string;feeTinybars:string;principalTinybars:string;transactionId:string;logIndices:string[];reverted:boolean};
export type SettlementOperation={id:string;settlementId:string;action:'deploy'|'lock'|'register'|'settle'|'cancel'|'reclaim'|'orphan';sender:string;to:string;calldata:string;value:string;status:'prepared'|'pending'|'verified'|'reverted';hash:string;createdAt:string;evidence?:SettlementEvidence};
export type SettlementDeployment={address:string;cutoff:string;salt:Hex;evidence:SettlementEvidence};
export function settlementDigest(s:Pick<Settlement,'contract'|'salt'|'terms'>):Hex {
 const t=s.terms;
 if(!/^0x[0-9a-f]{40}$/.test(s.contract)||![s.salt,t.matchId,t.sellerOrder,t.buyerOrder].every(v=>/^0x[0-9a-f]{64}$/.test(v))||t.sellerOrder===t.buyerOrder||t.seller===t.buyer||![t.seller,t.buyer].every(a=>[accounts.Seller.address,accounts.Buyer.address].includes(a)))throw new Error('Invalid settlement identity.');
 for(const n of [t.amount,t.priceTinybars,t.preparedAt,t.expiry,t.holdId])if(!/^[1-9][0-9]{0,18}$/.test(n)||BigInt(n)>9223372036854775807n)throw new Error('Invalid settlement integer.');
 if(BigInt(t.amount)>1000n||BigInt(t.priceTinybars)>9223372036854775807n/BigInt(t.amount)||BigInt(t.expiry)!==BigInt(t.preparedAt)+1800n)throw new Error('Invalid settlement amount or expiry.');
 const types=['bytes32','uint256','address','address','bytes32','bytes32','bytes32','bytes32','address','address','uint256','uint256','uint256','uint256','uint256'].map(type=>({type}));
 return keccak256(encodeAbiParameters(types,[keccak256(stringToHex('HoldBook Settlement v1')),296n,s.contract,securityAddress,s.salt,t.matchId,t.sellerOrder,t.buyerOrder,t.seller,t.buyer,BigInt(t.amount),BigInt(t.priceTinybars),BigInt(t.preparedAt),BigInt(t.expiry),BigInt(t.holdId)]));
}
export const settlementPrincipal=(s:Settlement)=>(BigInt(s.terms.amount)*BigInt(s.terms.priceTinybars)).toString();
export const rpcWeibars=(tinybars:string)=>(BigInt(tinybars)*10000000000n).toString();
export function settlementStatus(s:Settlement,now:bigint){return ['Locked','Ready'].includes(s.status)&&now>=BigInt(s.terms.expiry)?'Expired · Reclaim required':s.status;}
export function settlementAction(s:Settlement,owner:string,now:bigint):SettlementOperation['action']|undefined {
 if(owner!==s.terms.seller&&owner!==s.terms.buyer)return;
 if(now>=BigInt(s.terms.expiry)){if(owner===s.terms.seller)return s.status==='Locked'?'orphan':s.status==='Ready'?'reclaim':undefined;return;}
 if(owner===s.terms.seller)return s.status==='Unprepared'?'lock':s.status==='Locked'?'register':undefined;
 if(s.status==='Ready')return 'settle';
}

import artifact from './settlement-artifact.json' with {type:'json'};
import {api,readMarket,loadIntent,pending as marketPending,type Match,type Market} from './market';
import {acquireOperation,assertOperation,releaseOperation,withTransactionLock,type Roles} from './guards';
import {reviewWallet,checkWalletReview,type WalletReview} from './wallet';
import {assertFixedAccounts,readLifecycleState,partition,securityId} from './lifecycle';
import {interfaces,rpc,isCreationOrigin,assertNovaTransaction} from './nova';
import {prepareAts,checkSdkConfig} from './ats';
import {holdSdkReads,sdkHoldId} from './hold';
import {createAssetProviders} from './transport';
import {mirrorUrl,rpcUrl} from './deployment';
export const settlementStorageKey='holdbook.testnet.t08.v1';
export type SettlementTransportRecord={kind:'t08-transaction';action:SettlementOperation['action'];status:'awaiting-signature'|'pending'|'confirmed'|'rejected'|'unknown';transactionHash?:string};
export type SavedSettlement={operation:SettlementOperation;attempted:boolean;rejected:boolean};
export type SettlementReview={wallet:WalletReview;operation:SettlementOperation;settlement?:Settlement;salt:Hex;market:Market};
export const settlementLabels={deploy:'Deploy settlement contract',lock:'Prepare settlement · Lock NOVA (1/2)',register:'Confirm match terms (2/2)',settle:'Pay HBAR and receive NOVA',cancel:'Cancel settlement and return NOVA',reclaim:'Reclaim expired NOVA',orphan:'Return unregistered Hold'};
const dec=(v:unknown,max=9223372036854775807n)=>{if(typeof v!=='string'||!/^(0|[1-9][0-9]*)$/.test(v)||v.length>30||BigInt(v)>max)throw new Error('Invalid public integer.');return v;};
const hash=(v:string)=>/^0x[0-9a-f]{64}$/.test(v),addr=(v:string)=>/^0x[0-9a-f]{40}$/.test(v);
export function publicSettlement(s:Settlement):Settlement{
 if(!s||!/^\d+-\d+$/.test(s.id)||!addr(s.contract)||!hash(s.salt)||!['Unprepared','Locked','Ready','Settled','Cancelled','Reclaimed','Returned'].includes(s.status))throw new Error('Invalid settlement record.');
 const t=s.terms;const terms={matchId:t.matchId,sellerOrder:t.sellerOrder,buyerOrder:t.buyerOrder,seller:t.seller,buyer:t.buyer,amount:dec(t.amount),priceTinybars:dec(t.priceTinybars),preparedAt:dec(t.preparedAt),expiry:dec(t.expiry),holdId:dec(t.holdId)};
 const clean={id:s.id,contract:s.contract,salt:s.salt,terms,digest:s.digest,status:s.status,baseBlock:dec(s.baseBlock),updatedAt:dec(s.updatedAt)};
 // A lock intent has no event-derived Hold yet. Validate all other digest fields with a placeholder only for validation.
 const computed=settlementDigest({...clean,terms:{...terms,holdId:terms.holdId==='0'?'1':terms.holdId}});
 if(terms.holdId==='0'?s.digest!==''||s.status!=='Unprepared':computed!==s.digest)throw new Error('Settlement digest differs.');
 return clean;
}
export function publicSettlementEvidence(e:SettlementEvidence):SettlementEvidence{
 if(!e||!hash(e.hash)||e.contract!==''&&!addr(e.contract)||typeof e.reverted!=='boolean'||typeof e.transactionId!=='string'||e.transactionId.length>100||!Array.isArray(e.logIndices))throw new Error('Invalid public evidence.');
 const balances=(v:SettlementBalances)=>({sellerAvailable:dec(v.sellerAvailable),sellerHeld:dec(v.sellerHeld),buyerAvailable:dec(v.buyerAvailable),buyerHeld:dec(v.buyerHeld)});
 return {...(e.before?{before:balances(e.before)}:{}),...(e.after?{after:balances(e.after)}:{}),hash:e.hash,block:dec(e.block),timestamp:dec(e.timestamp),contract:e.contract,holdId:dec(e.holdId),feeTinybars:dec(e.feeTinybars),principalTinybars:dec(e.principalTinybars),transactionId:e.transactionId,logIndices:e.logIndices.map(n=>dec(n)),reverted:e.reverted};
}
export function publicSettlementOperation(o:SettlementOperation):SettlementOperation{
 if(!o||!/^[0-9a-f]{64}$/.test(o.id)||o.settlementId!==''&&!/^\d+-\d+$/.test(o.settlementId)||!Object.hasOwn(settlementLabels,o.action)||!Object.values(accounts).some(a=>a.address===o.sender)||o.to!==''&&!addr(o.to)||!/^0x(?:[0-9a-f]{2})+$/.test(o.calldata)||o.calldata.length>50000||!['prepared','pending','verified','reverted'].includes(o.status)||o.hash!==''&&!hash(o.hash))throw new Error('Invalid operation.');
 return {id:o.id,settlementId:o.settlementId,action:o.action,sender:o.sender,to:o.to,calldata:o.calldata,value:dec(o.value,9223372036854775807n*10000000000n),status:o.status,hash:o.hash,createdAt:dec(o.createdAt),...(o.evidence?{evidence:publicSettlementEvidence(o.evidence)}:{})};
}
export function loadSettlement(storage:Pick<Storage,'getItem'>=window.localStorage):SavedSettlement|undefined{
 const raw=storage.getItem(settlementStorageKey);if(!raw)return;const s=JSON.parse(raw);if(typeof s.attempted!=='boolean'||typeof s.rejected!=='boolean')throw new Error('Invalid saved settlement.');return {operation:publicSettlementOperation(s.operation),attempted:s.attempted,rejected:s.rejected};
}
export function saveSettlement(s:SavedSettlement,storage:Pick<Storage,'getItem'|'setItem'>=window.localStorage){
 const raw=JSON.stringify({operation:publicSettlementOperation(s.operation),attempted:s.attempted,rejected:s.rejected});storage.setItem(settlementStorageKey,raw);if(storage.getItem(settlementStorageKey)!==raw)throw new Error('Settlement intent could not be saved.');
}
export async function readSettlements(signal:AbortSignal){
 const [v,d]=await Promise.all([api<{settlements:Settlement[];pendingOperation:SettlementOperation|null}>('settlements',signal),api<SettlementDeployment|null>('settlement-deployment',signal)]);
 if(d&&(!addr(d.address)||!hash(d.salt)))throw new Error('Invalid deployment.');
 return {settlements:v.settlements.map(publicSettlement),pendingOperation:v.pendingOperation?publicSettlementOperation(v.pendingOperation):undefined,deployment:d?{address:d.address,salt:d.salt,cutoff:dec(d.cutoff),evidence:publicSettlementEvidence(d.evidence)}:undefined};
}
export async function settlementCalldata(action:SettlementOperation['action'],s:Settlement|undefined,salt:Hex){
 const {Interface}=await import('ethers'),iface=new Interface(artifact.abi);
 if(action==='deploy')return artifact.bytecode+iface.encodeDeploy([salt]).slice(2);
 if(!s)throw new Error('Missing saved match.');const t=s.terms;
 if(action==='lock')return (await interfaces()).asset.encodeFunctionData('createHoldByPartition',[partition,[t.amount,t.expiry,s.contract,t.buyer,'0x']]);
 if(action==='register')return iface.encodeFunctionData('register',[[t.matchId,t.sellerOrder,t.buyerOrder,t.seller,t.buyer,t.amount,t.priceTinybars,t.preparedAt,t.expiry,t.holdId]]);
 if(action==='orphan')return iface.encodeFunctionData('recoverOrphan',[t.holdId]);
 return iface.encodeFunctionData(action,[s.digest]);
}
export async function checkSettlementIntent(o:SettlementOperation,s:Settlement|undefined,salt:Hex,m:Market){
 if(s){const match=m.matches.find(x=>x.id===s.id);if(!match)throw new Error('Saved match missing.');const sell=m.orders.find(x=>x.orderId===''+s.terms.sellerOrder.slice(2)),buy=m.orders.find(x=>x.orderId===s.terms.buyerOrder.slice(2));
  if(!sell||!buy||sell.side!=='Sell'||buy.side!=='Buy'||sell.owner!==s.terms.seller||buy.owner!==s.terms.buyer||![match.maker,match.taker].includes(sell.orderId)||![match.maker,match.taker].includes(buy.orderId)||match.quantity!==s.terms.amount||match.price!==s.terms.priceTinybars||match.seller!==s.terms.seller||match.buyer!==s.terms.buyer||keccak256(stringToHex(s.id))!==s.terms.matchId||m.domain.salt!==s.salt)throw new Error('Settlement differs from matched orders.');
 }
 const sender=o.action==='deploy'?accounts.Admin.address:o.action==='settle'?s!.terms.buyer:s!.terms.seller;
 if(o.sender!==sender||o.to!==(o.action==='deploy'?'':o.action==='lock'?securityAddress:s!.contract)||o.value!==(o.action==='settle'?rpcWeibars(settlementPrincipal(s!)):'0')||o.calldata!==await settlementCalldata(o.action,s,salt))throw new Error('Operation differs from independent calldata.');
}
async function settlementPreflight(r:SettlementReview,signal:AbortSignal,lease:symbol){
 if(marketPending(loadIntent()))throw new Error('Resolve the original order signature before settlement.');
 const original=loadSettlement();if(!original||original.operation.id!==r.operation.id||original.attempted&&!original.rejected)throw new Error('Original transaction is pending. Query only.');
 const remote=await api<{operation:SettlementOperation}>('settlement-operations/'+r.operation.id,signal);
 if(remote.operation.status!=='prepared'||remote.operation.hash||remote.operation.calldata!==r.operation.calldata)throw new Error('Original operation changed; query its result.');
 assertOperation(lease);assertFixedAccounts(r.wallet.roles);await checkWalletReview(r.wallet);signal.throwIfAborted();
 const state=await readLifecycleState(signal),s=r.settlement,o=r.operation;
 if(state.supply!=='100'||!state.roles.every(Boolean)||!state.issuer)throw new Error('Pinned supply or roles changed.');
 const until=s?BigInt(s.terms.expiry):BigInt(state.timestamp)+1800n;
 for(const k of [state.sellerKyc,state.buyerKyc])if(k.status!==1||k.issuer!==accounts.Admin.address||!k.vcId||BigInt(k.validFrom)>BigInt(state.timestamp)||BigInt(k.validTo)<=BigInt(state.timestamp)||BigInt(k.validTo)<until)throw new Error('Both accounts need valid KYC. Stop for manual diagnostics.');
 if(await prepareAts()!=='loaded')throw new Error('Pinned SDK unavailable.');const config=await checkSdkConfig(signal,lease);if(config.status!=='passed'||config.payload!==1)throw new Error('Pinned SDK/config incompatible. Stop for mentor diagnostics.');
 const m=await readMarket(signal);await checkSettlementIntent(o,s,r.salt,m);
 if(s){const now=BigInt(state.timestamp),expired=now>=BigInt(s.terms.expiry);
  if(o.action==='reclaim'?!expired:!['orphan'].includes(o.action)&&expired)throw new Error('Settlement expiry reached; recover the original operation.');
  const block='0x'+BigInt(state.block).toString(16),{Interface}=await import('ethers'),iface=new Interface(artifact.abi);
  if(await rpc('eth_getCode',[s.contract,block],signal)!==artifact.runtime)throw new Error('Settlement runtime differs.');
  const salt=iface.decodeFunctionResult('marketSalt',await rpc('eth_call',[{to:s.contract,data:iface.encodeFunctionData('marketSalt')},block],signal) as string)[0];if(salt!==s.salt)throw new Error('Contract market domain differs.');
  if(o.action==='lock'){const balance=s.terms.seller===accounts.Seller.address?state.sellerBalance:state.buyerBalance;if(BigInt(balance)<BigInt(s.terms.amount))throw new Error('Insufficient available NOVA.');}
  else {
   sdkHoldId(s.terms.holdId);const {asset}=await interfaces();const h=asset.decodeFunctionResult('getHoldForByPartition',await rpc('eth_call',[{to:securityAddress,data:asset.encodeFunctionData('getHoldForByPartition',[[partition,s.terms.seller,s.terms.holdId]])},block],signal) as string);
   if(String(h[0])!==s.terms.amount||String(h[1])!==s.terms.expiry||h[2].toLowerCase()!==s.contract||h[3].toLowerCase()!==s.terms.buyer||h[4]!=='0x'||h[5]!=='0x'||Number(h[6])!==0)throw new Error('Full Hold differs from the match.');
   if(!['register','orphan'].includes(o.action)){const st=iface.decodeFunctionResult('state',await rpc('eth_call',[{to:s.contract,data:iface.encodeFunctionData('state',[s.digest])},block],signal) as string)[0];if(st!==1n)throw new Error('Settlement closed; query original evidence.');}
  }
 }
 const balance=await rpc('eth_getBalance',[o.sender,'latest'],signal) as string;if(BigInt(balance)<=BigInt(o.value))throw new Error('Insufficient HBAR for payment and network fees.');
 await checkWalletReview(r.wallet);signal.throwIfAborted();
}
export async function prepareSettlement(roles:Roles,action:SettlementOperation['action'],match:Match|undefined,signal:AbortSignal):Promise<SettlementReview>{
 return withTransactionLock(navigator.locks,async()=>{
 const lease=acquireOperation();try{
  const original=loadSettlement();if(original?.attempted&&!original.rejected&&!['verified','reverted'].includes(original.operation.status))throw new Error('Query the original pending operation.');
  const signer=action==='deploy'?accounts.Admin.address:action==='settle'?match?.buyer:match?.seller;
  const role=Object.keys(accounts).find(k=>accounts[k as keyof typeof accounts].address===signer) as keyof typeof accounts|undefined;if(!role)throw new Error('Missing trading account.');
  const wallet=await reviewWallet(roles,signal,role),market=await readMarket(signal);
  const operation=publicSettlementOperation(await api<SettlementOperation>(action==='deploy'?'settlement-deployment':'settlements/prepare',signal,action==='deploy'?{action:'prepare'}:{action,matchId:match!.id}));
  const settlement=match?publicSettlement(await api<Settlement>('settlements/'+match.id,signal)):undefined;
  const result={wallet,operation,settlement,salt:market.domain.salt,market};await checkSettlementIntent(operation,settlement,result.salt,market);
  saveSettlement({operation,attempted:false,rejected:false});await settlementPreflight(result,signal,lease);return result;
 }finally{releaseOperation(lease);}
 });
}
export async function recoverSettlement(signal:AbortSignal,onSave:(s:SavedSettlement)=>void,hashInput?:string){
 const s=loadSettlement();if(!s)throw new Error('Restore the original operation first.');
 const hash=hashInput||s.operation.hash;if(hash&&!/^0x[0-9a-f]{64}$/.test(hash))throw new Error('Enter the original transaction hash.');
 if(s.operation.hash&&hash!==s.operation.hash)throw new Error('Conflicting hash.');
 if(hash){s.operation.hash=hash;s.attempted=true;saveSettlement(s);onSave(s);}
 const result=await api<{operation:SettlementOperation;verificationPending:boolean}>('settlement-operations/'+s.operation.id+(hash?'/transaction':''),signal,hash?{hash}:undefined,180000);
 const operation=publicSettlementOperation(result.operation);
 for(const k of ['id','action','sender','to','calldata','value'] as const)if(operation[k]!==s.operation[k])throw new Error('Recovered operation differs.');
 if(s.operation.hash&&operation.hash!==s.operation.hash)throw new Error('Original hash not yet saved by server.');
 const next={...s,operation};saveSettlement(next);onSave(next);return next;
}
export async function submitSettlement(r:SettlementReview,signal:AbortSignal,onSave:(s:SavedSettlement)=>void){
 if(!isCreationOrigin(window.location.origin,import.meta.env.PROD))throw new Error('Use production preview for manual transactions.');
 return withTransactionLock(navigator.locks,async()=>{
  const lease=acquireOperation();let providers:Awaited<ReturnType<typeof createAssetProviders<SettlementTransportRecord>>>|undefined,connected=false;
  let saved=loadSettlement();if(!saved||saved.operation.id!==r.operation.id||saved.attempted&&!saved.rejected){releaseOperation(lease);throw new Error('Query the original intent; do not resend.');}
  const persist=(value:SavedSettlement)=>{saved=value;try{saveSettlement(value);}finally{onSave(value);}};
  try{
   await settlementPreflight(r,signal,lease);
   const signer=Object.values(accounts).find(a=>a.address===r.operation.sender)!;
   const check=async(mutation=false)=>{assertOperation(lease);signal.throwIfAborted();await checkWalletReview(r.wallet);if(mutation)await settlementPreflight(r,signal,lease);};
   const s=r.settlement,input={securityId,securityAddress,partition,holder:s?.terms.seller??signer.address,escrow:s?.contract??'',destination:s?.terms.buyer??'',baseBlock:s?.baseBlock??'1',baseTimestamp:s?.terms.preparedAt??'1',expirationTimestamp:s?.terms.expiry??'1'};
   providers=await createAssetProviders<SettlementTransportRecord>({wallet:r.wallet,signer:signer.address,securityAddress,calldata:r.operation.calldata,initial:{kind:'t08-transaction',action:r.operation.action,status:'awaiting-signature'},sanitize:x=>({kind:'t08-transaction',action:x.action,status:x.status,...(x.transactionHash?{transactionHash:x.transactionHash}:{})}),
    update:x=>persist({operation:{...r.operation,...(x.transactionHash?{hash:x.transactionHash,status:'pending'}:{})},attempted:true,rejected:x.status==='rejected'}),checkCurrent:check,signal,recoverAfterHash:true,reads:r.operation.action==='lock'?await holdSdkReads(input):[],verifyReceipt:async()=>{throw new Error('Use server receipt verification.');},
    assertContractTransaction:tx=>assertSettlementTransaction(tx,r.operation)});
   if(r.operation.action==='lock'){
    const sdk=await import('@hashgraph/asset-tokenization-sdk');await sdk.Network.connect(new sdk.ConnectRequest({network:'testnet',wallet:sdk.SupportedWallets.METAMASK,account:{accountId:signer.accountId,evmAddress:signer.address},mirrorNode:{baseUrl:mirrorUrl},rpcNode:{baseUrl:rpcUrl,queryProvider:providers.read}}),{provider:providers.browser});connected=true;
    await createSettlementHoldSdk(s!);
   }else await providers.browser.send('eth_sendTransaction',[{from:signer.address,...(r.operation.to?{to:r.operation.to}:{}),data:r.operation.calldata,chainId:'0x128',value:'0x'+BigInt(r.operation.value).toString(16)}]);
  }catch(e){if(!saved?.operation.hash)throw e;}
  finally{if(connected){try{await(await import('@hashgraph/asset-tokenization-sdk')).Network.disconnect();}catch{/* Owned providers close below. */}}providers?.close();releaseOperation(lease);}
  // Preserve and verify late hashes independently of invalidated wallet sessions. Never send again.
  if(saved?.operation.hash)return recoverSettlement(AbortSignal.timeout(180000),onSave);
 });
}

export async function createSettlementHoldSdk(value:Settlement){
 const s=publicSettlement(value);if(s.status!=='Unprepared'||s.terms.holdId!=='0')throw new Error('Only a fresh exact Hold intent may enter the SDK.');
 const sdk=await import('@hashgraph/asset-tokenization-sdk');return sdk.Security.createHoldByPartition(new sdk.CreateHoldByPartitionRequest({securityId,partitionId:partition,amount:s.terms.amount,escrowId:s.contract,targetId:s.terms.buyer,expirationDate:s.terms.expiry}));
}

export function assertSettlementTransaction(tx:unknown,o:SettlementOperation){
 const original=tx as {from?:string;to?:string;data?:string;chainId?:string;value?:string};
 // The SDK omits zero value / chain fields; the reviewed wallet is checked immediately before send.
 const t=o.action==='lock'&&original?{...original,value:original.value??'0x0',chainId:original.chainId??'0x128'}:original;
 if(!t||t.from?.toLowerCase()!==o.sender||(t.to?.toLowerCase()??'')!==o.to||t.data!==o.calldata||t.chainId!=='0x128'||typeof t.value!=='string'||!/^0x[0-9a-f]+$/i.test(t.value)||BigInt(t.value)!==BigInt(o.value))throw new Error('Wallet transaction differs from review.');
 assertNovaTransaction({...t,to:o.to||'0x'+'0'.repeat(40),value:'0x0'},{admin:o.sender,factory:o.to||'0x'+'0'.repeat(40),calldata:o.calldata});
}

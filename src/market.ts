import {hashTypedData, recoverTypedDataAddress, type Hex} from 'viem';
import {acquireOperation,releaseOperation,withTransactionLock,type Roles} from './guards';
import {reviewWallet,checkWalletReview,type WalletReview} from './wallet';
import {accounts,assertFixedAccounts} from './lifecycle';

export const marketName='NOVA/HBAR';
export const purpose='Unfunded intent only. No assets reserved or transferred.';
export const marketStorageKey='holdbook.testnet.market.v1';
const maxInt=9223372036854775807n;
export type Side='Buy'|'Sell';
export type Command={requestId:string;orderId:string;owner:string;market:string;action:'Place'|'Cancel';side:Side|'';quantity:string;price:string;expiresAt:string;deadline:string;preparedAt:string};
export type Order=Omit<Command,'deadline'|'preparedAt'> & {sequence:string;acceptedAt:string;remaining:string;matched:string;cancelled:string;expired:string;reason:string};
export type Match={id:string;maker:string;taker:string;buyer:string;seller:string;quantity:string;price:string;notional:string;time:string;status:string};
export type Domain={name:'HoldBook Unfunded Orders';version:'1';chainId:'296';salt:Hex};
export type Market={market:string;domain:Domain;serverTime:string;version:string;orders:Order[];matches:Match[];notice:string};
export type Record={prepared:Command;status:'pending'|'accepted'|'rejected'|'expired';digest:string;verified:boolean;result:{sequence:string;time:string;order:Order;matches:Match[]}|null;reason:string};
export type Intent={domain:Domain;record:Record};
export type Review=Intent & {wallet:WalletReview};
export const types={OrderCommand:[{name:'purpose',type:'string'},{name:'action',type:'string'},{name:'owner',type:'address'},{name:'requestId',type:'string'},{name:'orderId',type:'string'},{name:'market',type:'string'},{name:'side',type:'string'},{name:'quantity',type:'uint256'},{name:'price',type:'uint256'},{name:'expiresAt',type:'uint256'},{name:'deadline',type:'uint256'}]} as const;
export function typedData(c:Command,d:Domain){return {domain:{...d,chainId:296},types,primaryType:'OrderCommand' as const,message:{purpose,action:c.action,owner:c.owner as Hex,requestId:c.requestId,orderId:c.orderId,market:c.market,side:c.side,quantity:BigInt(c.quantity),price:BigInt(c.price),expiresAt:BigInt(c.expiresAt),deadline:BigInt(c.deadline)}};}
export function wireTypedData(c:Command,d:Domain){const t=typedData(c,d);return {...t,domain:d,types:{EIP712Domain:[{name:'name',type:'string'},{name:'version',type:'string'},{name:'chainId',type:'uint256'},{name:'salt',type:'bytes32'}],...types},message:{...t.message,quantity:c.quantity,price:c.price,expiresAt:c.expiresAt,deadline:c.deadline}};}
export function amount(quantity:string,hbar:string){
 if(!/^[1-9][0-9]{0,3}$/.test(quantity)||BigInt(quantity)>1000n)throw new Error('Enter 1–1000 whole NOVA shares.');
 if(!/^(0|[1-9][0-9]*)(\.[0-9]{1,8})?$/.test(hbar)||hbar.length>30)throw new Error('Enter HBAR with at most eight decimal places; no exponent notation.');
 const [whole,fraction='']=hbar.split('.'),price=BigInt(whole)*100000000n+BigInt(fraction.padEnd(8,'0'));
 if(price<1n||price>maxInt/BigInt(quantity))throw new Error('Price must be positive and total must fit int64 tinybars.');
 return {quantity,price:price.toString(),notional:(price*BigInt(quantity)).toString()};
}
export function hbar(value:string){const n=BigInt(value),whole=n/100000000n,part=(n%100000000n).toString().padStart(8,'0').replace(/0+$/,'');return whole.toString()+(part?'.'+part:'');}
export function status(o:Order){if(BigInt(o.remaining)>0n)return BigInt(o.matched)>0n?'Partially matched':'Open';if(BigInt(o.expired)>0n)return 'Expired';if(BigInt(o.cancelled)>0n)return 'Cancelled';return 'Matched';}
function integer(v:unknown){if(typeof v!=='string'||!/^(0|[1-9][0-9]*)$/.test(v)||v.length>19||BigInt(v)>maxInt)throw new Error('Invalid market integer.');return v;}
function publicDomain(d:Domain):Domain{domainCheck(d);return {name:d.name,version:d.version,chainId:d.chainId,salt:d.salt};}
function domainCheck(d:Domain){if(d?.name!=='HoldBook Unfunded Orders'||d.version!=='1'||d.chainId!=='296'||!/^0x[0-9a-f]{64}$/.test(d.salt))throw new Error('Unexpected signing domain.');}
export function commandCheck(c:Command){
 if(!c||!/^([0-9a-f]{64})$/.test(c.requestId)||!/^([0-9a-f]{64})$/.test(c.orderId)||![accounts.Seller.address,accounts.Buyer.address].includes(c.owner)||c.market!==marketName)throw new Error('Unexpected order identity.');
 for(const k of ['quantity','price','expiresAt','deadline','preparedAt'] as const)integer(c[k]);
 if(BigInt(c.deadline)!==BigInt(c.preparedAt)+300n)throw new Error('Unexpected submission deadline.');
 if(c.action==='Place'){if(!['Buy','Sell'].includes(c.side)||BigInt(c.expiresAt)!==BigInt(c.preparedAt)+86400n)throw new Error('Unexpected order expiry.');amount(c.quantity,hbar(c.price));}
 else if(c.action!=='Cancel'||c.side!==''||c.quantity!=='0'||c.price!=='0'||c.expiresAt!=='0')throw new Error('Unexpected cancellation fields.');
}
export function publicRecord(r:Record):Record {
 commandCheck(r.prepared);if(!['pending','accepted','rejected','expired'].includes(r.status)||typeof r.verified!=='boolean'||typeof r.reason!=='string'||(r.digest!==''&&!/^0x[0-9a-f]{64}$/.test(r.digest)))throw new Error('Invalid request record.');
 const c=r.prepared;const prepared:Command={requestId:c.requestId,orderId:c.orderId,owner:c.owner,market:c.market,action:c.action,side:c.side,quantity:c.quantity,price:c.price,expiresAt:c.expiresAt,deadline:c.deadline,preparedAt:c.preparedAt};
 const result=r.result?{sequence:integer(r.result.sequence),time:integer(r.result.time),order:publicOrder(r.result.order),matches:r.result.matches.map(publicMatch)}:null;
 if((r.status==='accepted')!==!!result||(r.status==='accepted')!==r.verified)throw new Error('Inconsistent command result.');
 return {prepared,status:r.status,digest:r.digest,verified:r.verified,result,reason:r.reason.slice(0,200)};
}
function publicOrder(o:Order):Order {for(const k of ['quantity','price','expiresAt','sequence','acceptedAt','remaining','matched','cancelled','expired'] as const)integer(o[k]);if(!['Buy','Sell'].includes(o.side)||!/^([0-9a-f]{64})$/.test(o.orderId)||![accounts.Seller.address,accounts.Buyer.address].includes(o.owner)||o.market!==marketName||o.action!=='Place'||BigInt(o.quantity)!==BigInt(o.remaining)+BigInt(o.matched)+BigInt(o.cancelled)+BigInt(o.expired))throw new Error('Invalid order data.');return {requestId:o.requestId,orderId:o.orderId,owner:o.owner,market:o.market,action:o.action,side:o.side,quantity:o.quantity,price:o.price,expiresAt:o.expiresAt,sequence:o.sequence,acceptedAt:o.acceptedAt,remaining:o.remaining,matched:o.matched,cancelled:o.cancelled,expired:o.expired,reason:typeof o.reason==='string'?o.reason.slice(0,100):''};}
function publicMatch(m:Match):Match {for(const k of ['quantity','price','notional','time'] as const)integer(m[k]);if(!/^[1-9][0-9]*-[1-9][0-9]*$/.test(m.id)||!/[0-9a-f]{64}/.test(m.maker)||!/[0-9a-f]{64}/.test(m.taker)||m.status!=='Matched · Not settled'||BigInt(m.quantity)*BigInt(m.price)!==BigInt(m.notional)||m.buyer===m.seller||![accounts.Seller.address,accounts.Buyer.address].includes(m.buyer)||![accounts.Seller.address,accounts.Buyer.address].includes(m.seller))throw new Error('Invalid match.');return {id:m.id,maker:m.maker,taker:m.taker,buyer:m.buyer,seller:m.seller,quantity:m.quantity,price:m.price,notional:m.notional,time:m.time,status:m.status};}
export async function api<T>(path:string,signal:AbortSignal,body?:unknown,timeout=10000):Promise<T>{
 const r=await fetch('/api/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,signal:AbortSignal.any([signal,AbortSignal.timeout(timeout)]),cache:'no-store',credentials:'omit',redirect:'error'});
 if(!r.ok)throw new Error('Market request incomplete. Query the original request; do not resubmit.');return r.json();
}
export async function readMarket(signal:AbortSignal):Promise<Market>{const m=await api<Market>('market',signal);domainCheck(m.domain);if(m.market!==marketName||m.notice!=='Funds are not reserved')throw new Error('Unexpected market.');integer(m.serverTime);integer(m.version);return {...m,orders:m.orders.map(publicOrder),matches:m.matches.map(publicMatch)};}
export function loadIntent(storage:Pick<Storage,'getItem'>=window.localStorage):Intent|undefined{const raw=storage.getItem(marketStorageKey);if(!raw)return;const v=JSON.parse(raw) as Intent;domainCheck(v.domain);return {domain:publicDomain(v.domain),record:publicRecord(v.record)};}
export function saveIntent(v:Intent,storage:Pick<Storage,'getItem'|'setItem'>=window.localStorage){domainCheck(v.domain);const raw=JSON.stringify({domain:publicDomain(v.domain),record:publicRecord(v.record)});storage.setItem(marketStorageKey,raw);if(storage.getItem(marketStorageKey)!==raw)throw new Error('Public intent could not be saved. Signing stopped.');}
export function pending(v?:Intent){return v?.record.status==='pending';}
export async function recoverIntent(signal:AbortSignal){const v=loadIntent();if(!v)return;const r=publicRecord(await api<Record>('commands/'+v.record.prepared.requestId,signal));if(JSON.stringify(r.prepared)!==JSON.stringify(v.record.prepared))throw new Error('Stored request differs from server; keep the original intent.');const result={domain:v.domain,record:r};saveIntent(result);return result;}
export async function prepareOrder(roles:Roles,owner:string,side:Side,quantity:string,price:string,signal:AbortSignal,cancel?:Order):Promise<Review>{
 assertFixedAccounts(roles);if(pending(loadIntent()))throw new Error('Recover the original pending request first.');
 const role=owner===accounts.Seller.address?'Seller':owner===accounts.Buyer.address?'Buyer':undefined;if(!role)throw new Error('Admin is view-only. Connect Seller or Buyer.');
 const lease=acquireOperation();try {
  const wallet=await reviewWallet(roles,signal,role),m=await readMarket(signal);
  const fields=cancel?{action:'Cancel',side:'',quantity:'0',price:'0',orderId:cancel.orderId}:{action:'Place',side,...amount(quantity,price),orderId:''};
  const input={market:marketName,salt:m.domain.salt,owner,action:fields.action,side:fields.side,quantity:fields.quantity,price:fields.price,orderId:fields.orderId};
  const response=await api<{record:Record;typedData:unknown}>('commands/prepare',signal,input);
  const record=publicRecord(response.record),c=record.prepared;for(const k of ['owner','market','action','side','quantity','price'] as const)if(c[k]!==input[k])throw new Error('Prepared order differs from reviewed inputs.');if(cancel&&c.orderId!==cancel.orderId)throw new Error('Cancellation target differs.');
  // Independently reconstruct every signed field. Never sign arbitrary server data.
  if(hashTypedData(response.typedData as Parameters<typeof hashTypedData>[0])!==hashTypedData(typedData(c,m.domain)))throw new Error('Typed command differs.');
  signal.throwIfAborted();await checkWalletReview(wallet);return {wallet,domain:m.domain,record};
 }finally{releaseOperation(lease);}
}
export async function signOrder(review:Review,signal:AbortSignal,onIntent:(v:Intent)=>void){
 if(window.location.origin!=='http://127.0.0.1:4173'||!import.meta.env.PROD)throw new Error('Use production preview for signing.');
 const lease=acquireOperation();try{return await withTransactionLock(navigator.locks,async()=>{
  if(pending(loadIntent()))throw new Error('Another request needs recovery.');
  commandCheck(review.record.prepared);domainCheck(review.domain);await checkWalletReview(review.wallet);signal.throwIfAborted();
  const m=await readMarket(signal),c=review.record.prepared;if(m.domain.salt!==review.domain.salt||BigInt(m.serverTime)>=BigInt(c.deadline))throw new Error('Review expired or server changed. Prepare again.');
  await checkWalletReview(review.wallet);signal.throwIfAborted();saveIntent(review);onIntent({domain:review.domain,record:review.record});
  const signature=await review.wallet.provider.request({method:'eth_signTypedData_v4',params:[c.owner,JSON.stringify(wireTypedData(c,review.domain))]});
  signal.throwIfAborted();await checkWalletReview(review.wallet);
  if(typeof signature!=='string'||!/^0x[0-9a-f]{130}$/i.test(signature)|| (await recoverTypedDataAddress({...typedData(c,review.domain),signature:signature as Hex})).toLowerCase()!==c.owner)throw new Error('Signature does not match the reviewed owner.');
  const fresh=await readMarket(signal);if(fresh.domain.salt!==review.domain.salt||BigInt(fresh.serverTime)>=BigInt(c.deadline))throw new Error('Late signature discarded. Query the original request.');
  await checkWalletReview(review.wallet);signal.throwIfAborted();
  const record=publicRecord(await api<Record>('commands',signal,{requestId:c.requestId,signature}));if(JSON.stringify(record.prepared)!==JSON.stringify(c))throw new Error('Submission response differs; query the original request.');const next={domain:review.domain,record};saveIntent(next);onIntent(next);return next;
 });}finally{releaseOperation(lease);}
}
export function marketEvidence(m:Market,intent?:Intent){return {kind:'t07-unfunded-market',market:marketName,chainId:'296',domain:publicDomain(m.domain),serverTime:integer(m.serverTime),version:integer(m.version),notice:'Funds are not reserved',settlement:'Matched · Not settled',orders:m.orders.map(publicOrder),matches:m.matches.map(publicMatch),command:intent?publicRecord(intent.record):null};}

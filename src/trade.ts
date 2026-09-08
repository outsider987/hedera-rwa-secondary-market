import { keccak256, type Hex } from 'viem';
import artifact from './swap-artifact.json' with { type: 'json' };
import { acquireOperation, assertOperation, releaseOperation, withTransactionLock, validateMirrorAccount, type Roles } from './guards';
import { reviewWallet, checkWalletReview, type WalletReview } from './wallet';
import { prepareAts, checkSdkConfig } from './ats';
import { rpcUrl, mirrorUrl } from './deployment';
import { interfaces, rpc, mirror, assertNovaTransaction, isCreationOrigin, loadNovaRecord } from './nova';
import { accounts, securityId, securityAddress, partition, assertFixedAccounts, loadLifecycleRecords } from './lifecycle';
import { zero, sdkHoldId, readHoldState, holdStateDigest, holdInterface, holdSdkReads, loadHoldRecords, validKyc } from './hold';
import { createAssetProviders } from './transport';
import { tradeEvidence, holdInputEvidence, type TradeAction, type TradeRecord, type TradeTransaction, type TradeSimulation, type HoldInput, type HoldState } from './evidence';
export type { TradeRecord, TradeTransaction, TradeSimulation } from './evidence';

export const tradeStorageKey = 'holdbook.testnet.t05.v1';
export const walletPrice = 10n ** 18n, tinybarPrice = 10n ** 8n;
export type TradeStep = TradeAction | 'purchase-negative' | 'duplicate-negative' | 'complete';
export const tradeLabels: Record<TradeStep,string> = {deploy:'Deploy swap',lock:'Lock 10 NOVA',settle:'Pay 1 HBAR and receive 10 NOVA',
  cancel:'Cancel trade and return 10 NOVA',reclaim:'Reclaim expired 10 NOVA','purchase-negative':'Check purchase restrictions',
  'duplicate-negative':'Check duplicate purchase rejection',complete:'View completed trade'};
const hex = (n: bigint | string) => '0x'+BigInt(n).toString(16);
export const tradeSigner = (action: TradeStep) => action === 'deploy' ? 'Admin' as const : ['lock','cancel','reclaim'].includes(action) ? 'Seller' as const : 'Buyer' as const;
export const unresolvedTrade = (r: TradeRecord) => r.kind === 't05-transaction' && r.status !== 'complete' && r.status !== 'failed' && !(r.status === 'rejected' && !r.transactionHash);
export const swapInterface = async () => new (await import('ethers')).Interface(artifact.abi);
export function createTradeInput(s: Pick<HoldState,'block'|'timestamp'>): HoldInput {
  return {securityId,securityAddress,partition,holder:accounts.Seller.address,destination:accounts.Buyer.address,escrow:zero,
    baseBlock:s.block,baseTimestamp:s.timestamp,expirationTimestamp:String(BigInt(s.timestamp)+86400n)};
}
export function assertTradeInput(input: HoldInput) {
  const i=holdInputEvidence(input);
  if (i.securityId !== securityId || i.securityAddress !== securityAddress || i.partition !== partition || i.holder !== accounts.Seller.address
    || i.destination !== accounts.Buyer.address || !/^[1-9]\d*$/.test(i.baseBlock) || !/^[1-9]\d{9}$/.test(i.baseTimestamp)
    || BigInt(i.expirationTimestamp) !== BigInt(i.baseTimestamp)+86400n || [securityAddress,...Object.values(accounts).map(a=>a.address)].includes(i.escrow)) throw new Error('Fixed T05 inputs changed. Stop.');
  if (i.holdId !== undefined) sdkHoldId(i.holdId);
}
export function expectedRuntime(input: HoldInput) {
  assertTradeInput(input);
  let runtime=artifact.runtime.slice(2);
  for (const r of artifact.expiryReferences) runtime=runtime.slice(0,r.start*2)+BigInt(input.expirationTimestamp).toString(16).padStart(r.length*2,'0')+runtime.slice((r.start+r.length)*2);
  return '0x'+runtime;
}
export async function tradeCalldata(action: TradeAction, input: HoldInput) {
  assertTradeInput(input); const iface=await swapInterface();
  if (action === 'deploy') return artifact.bytecode+iface.encodeDeploy([input.expirationTimestamp]).slice(2);
  if (input.escrow === zero) throw new Error('Verify the deployed swap first.');
  if (action === 'lock') return (await interfaces()).asset.encodeFunctionData('createHoldByPartition',[partition,[10,input.expirationTimestamp,input.escrow,accounts.Buyer.address,'0x']]);
  if (!input.holdId) throw new Error('Recover the event-derived Hold ID first.');
  return iface.encodeFunctionData(action,[sdkHoldId(input.holdId)]);
}
export function assertTradeTransaction(value: unknown, action: TradeAction, input: HoldInput, calldata: string) {
  assertTradeInput(input);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Unexpected swap transaction.');
  const tx=value as Record<string,unknown>, amount=action === 'settle' ? walletPrice : 0n;
  if (tx.chainId !== '0x128' || typeof tx.value !== 'string' || !/^0x[\da-f]+$/i.test(tx.value) || BigInt(tx.value) !== amount
    || action === 'deploy' && tx.to !== undefined && tx.to !== null) throw new Error('Wrong swap chain, destination or HBAR units.');
  assertNovaTransaction({...tx,to:action === 'deploy' ? zero : tx.to,value:'0x0'},
    {admin:accounts[tradeSigner(action)].address,factory:action === 'deploy' ? zero : action === 'lock' ? securityAddress : input.escrow,calldata});
}
export function loadTradeRecords(storage: Pick<Storage,'getItem'> = window.localStorage): TradeRecord[] {
  const raw=storage.getItem(tradeStorageKey), records=raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(records) || records.length > 30) throw new Error('Invalid T05 journal. Recover original public evidence.');
  const clean=records.map((r:TradeRecord)=>{const value=tradeEvidence(r);assertTradeInput(value.input);return value;});
  if (new Set(clean.map(r=>r.operationId)).size !== clean.length) throw new Error('Duplicate T05 operation IDs.');
  return clean;
}
export function saveTradeRecords(records: TradeRecord[], storage: Pick<Storage,'getItem'|'setItem'> = window.localStorage) {
  const raw=JSON.stringify(records.map(tradeEvidence)); storage.setItem(tradeStorageKey,raw);
  if (storage.getItem(tradeStorageKey) !== raw) throw new Error('T05 intent could not be saved. Transactions are disabled.');
}
const done = (records: TradeRecord[], action: TradeStep) => records.find(r=>r.action === action && r.status === 'complete');
export function assertTradeState(s: HoldState, input: HoldInput, stage: 'start'|'locked'|'settled'|'returned', checkKyc = true) {
  assertTradeInput(input);
  if (s.supply !== '100' || !s.roles.every(Boolean) || !s.issuer || s.buyerHeld !== '0' || s.buyerHoldIds.length) throw new Error('Supply, roles, issuer or Buyer held state changed. Stop.');
  if (checkKyc) {validKyc(s,'sellerKyc',input.expirationTimestamp);validKyc(s,'buyerKyc',input.expirationTimestamp);}
  const balances=stage === 'locked' ? ['84','6','10'] : stage === 'settled' ? ['84','16','0'] : ['94','6','0'];
  if ([s.sellerBalance,s.buyerBalance,s.sellerHeld].some((v,i)=>v !== balances[i])) throw new Error('Balances differ from the fixed T05 stage. Recover; do not repeat a transaction.');
  if (stage !== 'locked') {if (s.hold || s.sellerHoldIds.length) throw new Error('Unexpected active Hold. Recover its original hash.');return;}
  const h=s.hold;
  if (!h || !input.holdId || s.sellerHoldIds.length !== 1 || s.sellerHoldIds[0] !== input.holdId || h.id !== input.holdId || h.amount !== '10'
    || h.expirationTimestamp !== input.expirationTimestamp || h.escrow !== input.escrow || h.destination !== accounts.Buyer.address
    || h.data !== '0x' || h.operatorData !== '0x' || h.thirdPartyType !== 0) throw new Error('Full swap Hold differs from its event. Stop.');
}
export function nextTradeStep(s: HoldState, records: TradeRecord[], swapState?: number): TradeStep {
  if (records.some(unresolvedTrade)) throw new Error('An existing T05 operation needs recovery. Check MetaMask and query its original hash.');
  const completed=records.filter(r=>r.status === 'complete');
  if (new Set(completed.map(r=>r.action)).size !== completed.length) throw new Error('Duplicate completed trade evidence.');
  const deploy=done(records,'deploy'),lock=done(records,'lock'),settle=done(records,'settle'),returned=done(records,'cancel') ?? done(records,'reclaim');
  if (completed.length && !deploy || settle && returned || !lock && completed.some(r=>r.action !== 'deploy')) throw new Error('Trade evidence has a gap. Recover original operations.');
  const input=lock?.input ?? deploy?.input ?? createTradeInput(s);
  if (settle || returned) {
    assertTradeState(s,input,settle ? 'settled' : 'returned',false);
    if (swapState !== (settle ? 1 : returned?.action === 'cancel' ? 2 : 3)) throw new Error('Terminal swap state differs.');
    return settle && !done(records,'duplicate-negative') ? 'duplicate-negative' : 'complete';
  }
  assertTradeState(s,input,lock ? 'locked' : 'start');
  if (deploy && swapState !== 0) throw new Error('Swap already closed without recovered evidence.');
  if (BigInt(s.timestamp) >= BigInt(input.expirationTimestamp)) {
    if (lock) return 'reclaim';
    throw new Error('Swap expired before a Hold was created. Stop; do not redeploy automatically.');
  }
  return !deploy ? 'deploy' : !lock ? 'lock' : !done(records,'purchase-negative') ? 'purchase-negative' : 'settle';
}
export async function readSwap(input: HoldInput, block: string, signal: AbortSignal) {
  if (input.escrow === zero) throw new Error('No recovered deployment.');
  const code=await rpc('eth_getCode',[input.escrow,hex(block)],signal);
  if (code !== expectedRuntime(input)) throw new Error('Swap runtime bytecode differs from the pinned build and constructor. Stop.');
  const iface=await swapInterface(), data=await rpc('eth_call',[{to:input.escrow,data:iface.encodeFunctionData('state')},hex(block)],signal);
  const state=Number(iface.decodeFunctionResult('state',data as string)[0]);
  if (![0,1,2,3].includes(state)) throw new Error('Invalid contract state.');
  return state;
}
async function expiryBasis(input: HoldInput, signal: AbortSignal) {
  assertTradeInput(input);
  const block=await rpc('eth_getBlockByNumber',[hex(input.baseBlock),false],signal) as {number?:string;timestamp?:string};
  if (!block || block.number !== hex(input.baseBlock) || !block.timestamp || String(BigInt(block.timestamp)) !== input.baseTimestamp) throw new Error('Reviewed expiry block differs.');
}
function oldOperationsResolved() {
  const records=[loadNovaRecord(),...loadLifecycleRecords(),...loadHoldRecords()].filter(r=>r !== undefined);
  if (records.some(r=>r.status !== 'complete' && r.status !== 'failed' && !(r.status === 'rejected' && !r.transactionHash))) throw new Error('A prior operation needs recovery before T05. Use its original evidence; do not clear storage.');
}
export async function recordedHistory(state: HoldState, records: TradeRecord[], signal: AbortSignal) {
  oldOperationsResolved(); const iface=await swapInterface(),hold=await holdInterface();
  const pad=(a:string)=>'0x'+a.slice(2).padStart(64,'0');
  const groups=[
    {topics:[iface.getEvent('Setup')!.topicHash,pad(accounts.Admin.address)],action:'deploy'},
    {address:securityAddress,topics:[['HeldByPartition','HeldFromByPartition','OperatorHeldByPartition','ControllerHeldByPartition','ProtectedHeldByPartition'].map(n=>hold.getEvent(n)!.topicHash),null,[pad(accounts.Seller.address),pad(accounts.Buyer.address)]],action:'lock'},
  ];
  for (const {action,...filter} of groups) {
    const logs: {removed?:boolean;transactionHash?:string}[]=[];
    // The pinned relay limits broad log queries to 1,000 blocks. Cover every block once.
    for (let from=40241114n;from<=BigInt(state.block);from+=1000n) {
      const end=from+999n<BigInt(state.block) ? from+999n : BigInt(state.block);
      const page=await rpc('eth_getLogs',[{...filter,fromBlock:hex(from),toBlock:hex(end)}],signal);
      if (!Array.isArray(page)) throw new Error('Trade history page unavailable. Stop.');
      logs.push(...page);
    }
    const expected=records.filter((r):r is TradeTransaction=>r.kind === 't05-transaction' && r.action === action && r.status === 'complete');
    if (!Array.isArray(logs) || logs.length !== expected.length || logs.some(l=>l.removed || !expected.some(r=>r.transactionHash === l.transactionHash))) throw new Error('An unrecorded swap or Hold needs original-hash recovery. Stop.');
  }
}
async function exactEvent(receipt: Record<string,unknown>, address: string, iface: Awaited<ReturnType<typeof swapInterface>>, name: string, args: unknown[]) {
  const expected=iface.encodeEventLog(iface.getEvent(name)!,args);
  const logs=(Array.isArray(receipt.logs) ? receipt.logs : []).filter(l=>l.address?.toLowerCase() === address && l.topics?.[0] === expected.topics[0]);
  if (logs.length !== 1 || logs[0].removed === true || logs[0].data?.toLowerCase() !== expected.data.toLowerCase()
    || JSON.stringify(logs[0].topics.map((t:string)=>t.toLowerCase())) !== JSON.stringify(expected.topics.map(t=>t.toLowerCase()))
    || logs[0].transactionHash && logs[0].transactionHash !== receipt.transactionHash) throw new Error('Required same-transaction event differs.');
}
export async function verifyTradeReceipt(record: TradeTransaction, tx: Record<string,unknown>, receipt: Record<string,unknown>) {
  const hash=record.transactionHash,signer=accounts[record.signerRole].address;
  if (!hash || tx.hash !== hash || receipt.transactionHash !== hash || tx.chainId !== '0x128' || !['0x0','0x1'].includes(receipt.status as string)
    || receipt.from?.toString().toLowerCase() !== signer || receipt.blockHash !== tx.blockHash || !/^0x[\da-f]{64}$/.test(receipt.blockHash as string)
    || receipt.blockNumber !== tx.blockNumber || !/^0x[\da-f]+$/.test(receipt.blockNumber as string)) throw new Error('Swap receipt or transaction identity differs.');
  const calldata=await tradeCalldata(record.action,record.input);
  if (calldata !== record.calldata || keccak256(calldata as Hex) !== record.calldataDigest) throw new Error('Saved calldata differs from fixed inputs.');
  assertTradeTransaction({from:tx.from,to:tx.to,data:tx.input,value:tx.value,chainId:tx.chainId},record.action,record.input,calldata);
  const to=record.action === 'deploy' ? null : record.action === 'lock' ? securityAddress : record.input.escrow;
  if ((receipt.to?.toString().toLowerCase() ?? null) !== to) throw new Error('Receipt destination differs.');
  let input={...record.input};
  if (receipt.status === '0x0') return input;
  const iface=await swapInterface(),h=await holdInterface();
  if (record.action === 'deploy') {
    const address=receipt.contractAddress?.toString().toLowerCase();
    if (!address || !/^0x[\da-f]{40}$/.test(address) || input.escrow !== zero && input.escrow !== address) throw new Error('Deployment address differs.');
    input={...input,escrow:address};assertTradeInput(input);
    await exactEvent(receipt,address,iface,'Setup',[accounts.Admin.address,input.expirationTimestamp]);
  } else if (record.action === 'lock') {
    const logs=(receipt.logs as Record<string,unknown>[]).filter(l=>l.address?.toString().toLowerCase() === securityAddress && (l.topics as string[])?.[0] === h.getEvent('HeldByPartition')!.topicHash);
    if (logs.length !== 1) throw new Error('Expected one Hold creation event.');
    const parsed=h.parseLog(logs[0] as {data:string;topics:string[]})!;const id=String(parsed.args.holdId);sdkHoldId(id);
    if (input.holdId && input.holdId !== id) throw new Error('Hold ID differs from the saved event.');
    input={...input,holdId:id};
    await exactEvent(receipt,securityAddress,h,'HeldByPartition',[accounts.Seller.address,accounts.Seller.address,partition,id,[10,input.expirationTimestamp,input.escrow,accounts.Buyer.address,'0x'],'0x']);
  } else {
    const id=input.holdId!;
    await exactEvent(receipt,input.escrow,iface,record.action === 'settle' ? 'Settled' : record.action === 'cancel' ? 'Cancelled' : 'Reclaimed',
      record.action === 'settle' ? [id,accounts.Seller.address,accounts.Buyer.address,10,tinybarPrice] : [id]);
    await exactEvent(receipt,securityAddress,h,record.action === 'settle' ? 'HoldByPartitionExecuted' : record.action === 'cancel' ? 'HoldByPartitionReleased' : 'HoldByPartitionReclaimed',
      record.action === 'settle' ? [accounts.Seller.address,partition,id,10,accounts.Buyer.address] : record.action === 'cancel' ? [accounts.Seller.address,partition,id,10] : [input.escrow,accounts.Seller.address,partition,id,10]);
  }
  return input;
}
export function assertTradeTransition(r: TradeTransaction, before: HoldState, after: HoldState) {
  const start=r.action === 'deploy' || r.action === 'lock';
  assertTradeState(before,r.input,start ? 'start' : 'locked');
  const expected=structuredClone(before);
  if (r.action !== 'reclaim' && BigInt(after.timestamp) >= BigInt(r.input.expirationTimestamp)) throw new Error('Transaction reached expiry.');
  if (r.action === 'reclaim' && BigInt(after.timestamp) < BigInt(r.input.expirationTimestamp)) throw new Error('Reclaim before expiry.');
  if (r.action === 'lock') {
    expected.sellerBalance='84';expected.sellerHeld='10';expected.sellerHoldIds=[r.input.holdId!];
    expected.hold={id:r.input.holdId!,amount:'10',expirationTimestamp:r.input.expirationTimestamp,escrow:r.input.escrow,destination:accounts.Buyer.address,data:'0x',operatorData:'0x',thirdPartyType:0};
  } else if (!start) {
    expected.sellerHeld='0';expected.sellerHoldIds=[];delete expected.hold;
    if (r.action === 'settle') expected.buyerBalance='16'; else expected.sellerBalance='94';
  }
  if (holdStateDigest(expected) !== holdStateDigest(after)) throw new Error('Historical state differs from the exact atomic transition.');
}
export function paymentEvidence(tx: {transfers?:{account:string;amount:number;is_approval?:boolean}[];charged_tx_fee?:number}) {
  if (!Array.isArray(tx.transfers) || !Number.isSafeInteger(tx.charged_tx_fee) || tx.charged_tx_fee! < 0
    || tx.transfers.some(t=>!/^0\.0\.[1-9]\d*$/.test(t.account) || !Number.isSafeInteger(t.amount))) throw new Error('Mirror payment fields unavailable or unsafe.');
  const sum=(id:string)=>tx.transfers!.filter(t=>t.account === id).reduce((s,t)=>s+BigInt(t.amount),0n);
  if (sum(accounts.Seller.accountId) !== tinybarPrice || sum(accounts.Buyer.accountId) > -tinybarPrice
    || tx.transfers.reduce((s,t)=>s+BigInt(t.amount),0n) !== 0n) throw new Error('Seller principal or Buyer debit differs from 1 HBAR. Fees are verified separately.');
  return {sellerAccountId:accounts.Seller.accountId,buyerAccountId:accounts.Buyer.accountId,sellerCreditTinybars:String(tinybarPrice),principalTinybars:String(tinybarPrice),feeTinybars:String(tx.charged_tx_fee)};
}
export async function recoverTrade(operationId: string, hash: string, signal: AbortSignal, update: (r:TradeRecord[])=>void, owner?: symbol): Promise<TradeTransaction> {
  const recover=async()=>{
    let records=loadTradeRecords();const saved=records.find((r):r is TradeTransaction=>r.operationId === operationId && r.kind === 't05-transaction');
    if (!saved || !/^0x[\da-f]{64}$/i.test(hash) || saved.transactionHash && saved.transactionHash !== hash.toLowerCase()) throw new Error('Recover the original intent and hash. Restore its public export if needed.');
    hash=hash.toLowerCase();let r:TradeTransaction={...saved,transactionHash:hash};
    const persist=(value:TradeTransaction)=>{r=tradeEvidence(value) as TradeTransaction;records=records.map(v=>v.operationId === operationId ? r : v);try{saveTradeRecords(records);}finally{update(records);}return r;};
    persist({...r,status:'pending'});
    if (await rpc('eth_chainId',[],signal) !== '0x128') throw new Error('Wrong RPC chain.');
    const tx=await rpc('eth_getTransactionByHash',[hash],signal) as Record<string,unknown> | null;
    const receipt=await rpc('eth_getTransactionReceipt',[hash],signal) as Record<string,unknown> | null;
    if (!tx || !receipt) return r;
    const input=await verifyTradeReceipt(r,tx,receipt);await expiryBasis(input,signal);
    if (BigInt(input.baseBlock) > BigInt(receipt.blockNumber as string)) throw new Error('Review block is after transaction.');
    const before=await readHoldState(signal,hex(BigInt(receipt.blockNumber as string)-1n)),after=await readHoldState(signal,receipt.blockNumber as string);
    const failed=receipt.status === '0x0';r={...r,input};
    if (failed) {if (holdStateDigest(before) !== holdStateDigest(after)) throw new Error('Failed transaction changed token state.');}
    else assertTradeTransition(r,before,after);
    if (saved.before && holdStateDigest(saved.before) !== holdStateDigest(before)) throw new Error('Reviewed pre-state differs from transaction pre-state.');
    let swapState: number | undefined;
    if (!(r.action === 'deploy' && failed)) {
      swapState=await readSwap(input,after.block,signal);
      const expected=failed || r.action === 'deploy' || r.action === 'lock' ? 0 : r.action === 'settle' ? 1 : r.action === 'cancel' ? 2 : 3;
      if (swapState !== expected || r.action !== 'deploy' && await readSwap(input,before.block,signal) !== 0) throw new Error('Swap state transition differs.');
    }
    persist({...r,before,after,readBlock:after.block,swapState,status:'confirmed',...(swapState !== undefined ? {runtimeDigest:keccak256(expectedRuntime(input) as Hex)} : {})});
    const result=await mirror('contracts/results/'+hash,signal);
    if (!result) return persist({...r,status:'mirror-pending'});
    const expected=accounts[r.signerRole];
    if (!/^0x[\da-f]{40}$/i.test(result.from ?? '')) throw new Error('Invalid Mirror sender.');
    const sender=await mirror('accounts/'+result.from+'?limit=1',signal);
    if (!sender) return persist({...r,status:'mirror-pending'});
    if (validateMirrorAccount(expected.address,sender).accountId !== expected.accountId || result.hash !== hash || !Number.isSafeInteger(result.block_number)
      || String(result.block_number) !== after.block || result.function_parameters?.toLowerCase() !== r.calldata.toLowerCase()
      || result.amount !== (r.action === 'settle' ? Number(tinybarPrice) : 0) || !/^\d+\.\d{9}$/.test(result.timestamp)
      || result.result !== (failed ? 'CONTRACT_REVERT_EXECUTED' : 'SUCCESS')) throw new Error('Mirror hash, signer, block, calldata, units or result differs.');
    if (r.action !== 'deploy' && result.to?.toLowerCase() !== (r.action === 'lock' ? securityAddress : input.escrow)) throw new Error('Mirror target differs.');
    if (!failed) {
      const contract=await mirror('contracts/'+input.escrow,signal);
      if (!contract) return persist({...r,status:'mirror-pending'});
      if (contract.deleted !== false || contract.evm_address?.toLowerCase() !== input.escrow || !/^0\.0\.[1-9]\d*$/.test(contract.contract_id)) throw new Error('Mirror swap identity differs.');
      if (r.action === 'deploy' && result.contract_id !== contract.contract_id) throw new Error('Mirror deployment contract ID differs.');
    }
    const txs=await mirror('transactions?timestamp=eq:'+result.timestamp+'&limit=100',signal);
    if (!txs || txs.links?.next) return persist({...r,status:'mirror-pending'});
    const matches=txs.transactions?.filter((t:{consensus_timestamp?:string;result?:string})=>t.consensus_timestamp === result.timestamp && t.result === result.result);
    if (matches?.length !== 1) return persist({...r,status:'mirror-pending'});
    const payment=!failed && r.action === 'settle' ? paymentEvidence(matches[0]) : undefined;
    return persist({...r,status:failed ? 'failed' : 'complete',transactionId:matches[0].transaction_id,consensusTimestamp:result.timestamp,...(payment ? {payment} : {})});
  };
  if (owner) {assertOperation(owner);return recover();}
  return withTransactionLock(navigator.locks,async()=>{const lease=acquireOperation();try{return await recover();}finally{releaseOperation(lease);}});
}
export async function callTradeRevert(input: HoldInput, check: TradeSimulation['cases'][number]['check'], block: string, signal: AbortSignal) {
  const iface=await swapInterface(),calldata=await tradeCalldata('settle',input),from=accounts[check === 'wrong-buyer' ? 'Admin' : 'Buyer'].address;
  const value=check === 'wrong-payment' ? walletPrice-10n**10n : walletPrice;
  const response=await fetch(rpcUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_call',params:[{from,to:input.escrow,data:calldata,value:hex(value)},hex(block)]}),
    signal:AbortSignal.any([signal,AbortSignal.timeout(10000)]),credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer'});
  if (!response.ok) throw new Error('Simulation transport failed. No rejection passed.');
  const body=await response.json();signal.throwIfAborted();
  const expected=iface.encodeErrorResult(check === 'wrong-buyer' ? 'WrongAccount' : check === 'wrong-payment' ? 'WrongPayment' : 'Closed');
  if (body.jsonrpc !== '2.0' || body.id !== 1 || 'result' in body || !Number.isInteger(body.error?.code) || body.error?.data !== expected) throw new Error('Simulation did not return the exact expected contract revert.');
  return {check,from,walletValueWeibars:String(value),calldata,block,afterBlock:block,revertData:expected};
}
async function verifySimulation(r: TradeSimulation, signal: AbortSignal) {
  if (!r.before || !r.after) throw new Error('Simulation snapshots missing.');
  const state=r.action === 'purchase-negative' ? 0 : 1;
  for (const c of r.cases) {
    const before=await readHoldState(signal,hex(c.block)),after=await readHoldState(signal,hex(c.afterBlock));
    assertTradeState(before,r.input,state === 0 ? 'locked' : 'settled',state === 0);
    if (await readSwap(r.input,c.block,signal) !== state || await readSwap(r.input,c.afterBlock,signal) !== state || BigInt(c.afterBlock)<BigInt(c.block)
      || holdStateDigest(before) !== holdStateDigest(after) || holdStateDigest(before) !== holdStateDigest(r.before) || holdStateDigest(after) !== holdStateDigest(r.after)) throw new Error('Simulation state differs.');
    const actual=await callTradeRevert(r.input,c.check,c.block,signal);
    if (JSON.stringify({...actual,afterBlock:c.afterBlock}) !== JSON.stringify(c)) throw new Error('Saved simulation differs from its historical replay.');
  }
}
async function verifyJournal(signal: AbortSignal, lease: symbol, progress: (m:string)=>void) {
  for (const r of loadTradeRecords()) {
    if (r.status !== 'complete' && r.status !== 'failed') continue;
    progress('Verifying saved T05 evidence: '+r.action+'…');
    if (r.kind === 't05-simulation') await verifySimulation(r,signal);
    else {
      if (!r.transactionHash) throw new Error('Completion has no original hash.');
      const recovered=await recoverTrade(r.operationId,r.transactionHash,signal,()=>{},lease);
      if (recovered.status !== r.status) throw new Error('Saved operation still needs recovery.');
    }
  }
}
export type TradeReview = {wallet:WalletReview;state:HoldState;input:HoldInput;action:Exclude<TradeStep,'complete'>;calldata?:string;digest?:string;journal:string};
export async function reviewTrade(roles: Roles, signal: AbortSignal, progress: (m:string)=>void = ()=>{}, cancel=false): Promise<TradeReview> {
  return withTransactionLock(navigator.locks,async()=>{
    const lease=acquireOperation();
    try {
      assertFixedAccounts(roles);await verifyJournal(signal,lease,progress);
      const state=await readHoldState(signal,undefined,progress),records=loadTradeRecords();
      const input=done(records,'lock')?.input ?? done(records,'deploy')?.input ?? createTradeInput(state);
      const swapState=input.escrow === zero ? undefined : await readSwap(input,state.block,signal);
      let action=nextTradeStep(state,records,swapState);
      if (cancel) {if (!['purchase-negative','settle'].includes(action)) throw new Error('Cancellation requires an open, unexpired Hold.');action='cancel';}
      if (action === 'complete') throw new Error('This single trade is complete. No further transaction is allowed.');
      await recordedHistory(state,records,signal);await expiryBasis(input,signal);
      const wallet=await reviewWallet(roles,signal,tradeSigner(action));
      if (await prepareAts() !== 'loaded') throw new Error('Pinned SDK unavailable. Stop for mentor diagnostics.');
      const config=await checkSdkConfig(signal,lease);
      if (config.status !== 'passed' || config.payload !== 1) throw new Error('Pinned SDK/config incompatible. Stop for mentor diagnostics.');
      const simulation=action.endsWith('negative'),calldata=simulation ? undefined : await tradeCalldata(action as TradeAction,input);
      await checkWalletReview(wallet);signal.throwIfAborted();
      return {wallet,state,input,action,calldata,digest:calldata ? keccak256(calldata as Hex) : undefined,journal:JSON.stringify(records)};
    } finally {releaseOperation(lease);}
  });
}
export async function createTradeHoldSdk(input: HoldInput) {
  assertTradeInput(input);if (input.escrow === zero) throw new Error('Recover the deployed swap before Hold creation.');
  const sdk=await import('@hashgraph/asset-tokenization-sdk');
  return sdk.Security.createHoldByPartition(new sdk.CreateHoldByPartitionRequest({securityId,partitionId:partition,amount:'10',escrowId:input.escrow,targetId:accounts.Buyer.address,expirationDate:input.expirationTimestamp}));
}
export const tradeClosed=true;
export async function runTrade(review: TradeReview, update:(r:TradeRecord[])=>void, signal:AbortSignal, progress:(m:string)=>void = ()=>{}) {
  if(tradeClosed)throw new Error('T05 is complete. Use historical verification; all T05 mutations and repeated simulations are closed.');
  const simulation=review.action.endsWith('negative');
  if (!simulation && !isCreationOrigin(window.location.origin,import.meta.env.PROD)) throw new Error('Use production preview http://127.0.0.1:4173 for manual transactions.');
  return withTransactionLock(navigator.locks,async()=>{
    let journalRecords=loadTradeRecords();
    const lease=acquireOperation();let record:TradeTransaction|undefined,providers:Awaited<ReturnType<typeof createAssetProviders<TradeTransaction>>>|undefined,connected=false,recoverySignal:AbortSignal|undefined;
    const persist=(r:TradeTransaction)=>{
      record=tradeEvidence(r) as TradeTransaction;
      if (record.transactionHash && !recoverySignal) recoverySignal=AbortSignal.timeout(180000);
      // Keep a returned hash exportable even if storage becomes unavailable mid-request.
      journalRecords=[...journalRecords.filter(v=>v.operationId !== record!.operationId),record];
      try {saveTradeRecords(journalRecords);}finally{update(journalRecords);}
    };
    const current=async(mutation=false)=>{
      signal.throwIfAborted();assertOperation(lease);assertFixedAccounts(review.wallet.roles);await checkWalletReview(review.wallet);
      if (review.wallet.expectedRole !== tradeSigner(review.action)) throw new Error('Wrong signer role.');
      if (!mutation) return;
      const records=loadTradeRecords().filter(r=>r.operationId !== record?.operationId);
      if (JSON.stringify(records) !== review.journal) throw new Error('Journal changed. Review again.');
      const state=await readHoldState(signal,undefined,progress),swapState=review.input.escrow === zero ? undefined : await readSwap(review.input,state.block,signal);
      const next=nextTradeStep(state,records,swapState);
      if (review.action !== 'reclaim' && review.action !== 'duplicate-negative' && BigInt(state.timestamp) >= BigInt(review.input.expirationTimestamp)) throw new Error('Reviewed expiry reached. Stop and check the original operation.');
      if (holdStateDigest(state) !== holdStateDigest(review.state) || (review.action === 'cancel' ? !['settle','purchase-negative'].includes(next) : next !== review.action)) throw new Error('Trade state changed. Review again.');
      if (!simulation && (await tradeCalldata(review.action as TradeAction,review.input) !== review.calldata || keccak256(review.calldata as Hex) !== review.digest)) throw new Error('Reviewed calldata changed.');
      await expiryBasis(review.input,signal);await recordedHistory(state,records,signal);await checkWalletReview(review.wallet);signal.throwIfAborted();
    };
    try {
      if (await prepareAts() !== 'loaded') throw new Error('Pinned SDK unavailable. Stop for mentor diagnostics.');
      const config=await checkSdkConfig(signal,lease);
      if (config.status !== 'passed' || config.payload !== 1) throw new Error('Pinned SDK/config incompatible. Stop for mentor diagnostics.');
      await current(true);
      if (simulation) {
        const before=await readHoldState(signal),cases:TradeSimulation['cases']=[];
        if (holdStateDigest(before) !== holdStateDigest(review.state)) throw new Error('Simulation pre-state changed.');
        for (const check of review.action === 'purchase-negative' ? ['wrong-buyer','wrong-payment'] as const : ['duplicate'] as const) cases.push(await callTradeRevert(review.input,check,before.block,signal));
        const after=await readHoldState(signal);await current(true);
        if (holdStateDigest(before) !== holdStateDigest(after)) throw new Error('State changed during simulation.');
        cases.forEach(c=>c.afterBlock=after.block);
        const result=tradeEvidence({schemaVersion:1,chainId:296,kind:'t05-simulation',operationId:crypto.randomUUID(),startedAt:new Date().toISOString(),status:'complete',
          action:review.action as TradeSimulation['action'],input:review.input,before,after,cases});
        const next=[...loadTradeRecords(),result];saveTradeRecords(next);update(next);return result;
      }
      record={schemaVersion:1,chainId:296,kind:'t05-transaction',operationId:crypto.randomUUID(),startedAt:new Date().toISOString(),status:'awaiting-signature',
        action:review.action as TradeAction,input:review.input,before:review.state,signerRole:tradeSigner(review.action),calldata:review.calldata!,calldataDigest:review.digest!,walletValueWeibars:review.action === 'settle' ? String(walletPrice) : '0'};
      const signer=accounts[record.signerRole];
      persist(record);
      providers=await createAssetProviders({wallet:review.wallet,signer:signer.address,securityAddress,calldata:review.calldata,
        initial:record,sanitize:r=>tradeEvidence(r) as TradeTransaction,update:persist,reads:review.action === 'lock' ? await holdSdkReads(review.input) : [],
        checkCurrent:current,signal,recoverAfterHash:true,verifyReceipt:verifyTradeReceipt,assertContractTransaction:tx=>assertTradeTransaction(tx,record!.action,review.input,review.calldata!)});
      progress(`Awaiting ${record.signerRole}'s manual approval in MetaMask…`);
      if (review.action === 'lock') {
        const sdk=await import('@hashgraph/asset-tokenization-sdk');
        await sdk.Network.connect(new sdk.ConnectRequest({network:'testnet',wallet:sdk.SupportedWallets.METAMASK,account:{accountId:signer.accountId,evmAddress:signer.address},mirrorNode:{baseUrl:mirrorUrl},rpcNode:{baseUrl:rpcUrl,queryProvider:providers.read}}),{provider:providers.browser});connected=true;
        try {await createTradeHoldSdk(review.input);}catch {if (!providers.getRecord().transactionHash) throw new Error('SDK Hold request stopped. Check the journal and MetaMask.');}
      } else await providers.browser.send('eth_sendTransaction',[{from:signer.address,...(review.action === 'deploy' ? {} : {to:review.input.escrow}),data:review.calldata,chainId:'0x128',value:hex(record.walletValueWeibars)}]);
    } catch(error) {
      if (record && !record.transactionHash && !providers?.wasAttempted()) persist({...record,status:'rejected'});
      if (!record?.transactionHash) throw error;
    } finally {
      if (connected) {try{await (await import('@hashgraph/asset-tokenization-sdk')).Network.disconnect();}catch{/* The owned providers close below. */}}
      providers?.close();
      if (!record?.transactionHash) releaseOperation(lease);
    }
    try {
      if (!record?.transactionHash) throw new Error('No hash recorded. Check MetaMask; do not resubmit.');
      progress('Hash saved. Verifying the receipt, atomic state change and Mirror evidence…');
      return await recoverTrade(record.operationId,record.transactionHash,recoverySignal!,update,lease);
    } finally {releaseOperation(lease);}
  });
}
export async function restoreTrade(value: TradeRecord) {
  return withTransactionLock(navigator.locks,async()=>{
    const r=tradeEvidence(value);assertTradeInput(r.input);
    if (r.kind !== 't05-transaction' || await tradeCalldata(r.action,r.input) !== r.calldata || keccak256(r.calldata as Hex) !== r.calldataDigest) throw new Error('Restore an original public transaction intent. Simulations must be replayed.');
    const records=loadTradeRecords(),same=records.find(v=>v.operationId === r.operationId);
    if (same && (same.kind !== r.kind || same.transactionHash && same.transactionHash !== r.transactionHash)) throw new Error('Imported evidence conflicts with the saved operation.');
    const result=[...records.filter(v=>v.operationId !== r.operationId),{...r,status:'unknown' as const}];saveTradeRecords(result);return result;
  });
}

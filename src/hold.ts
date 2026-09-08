import { keccak256, type Hex } from 'viem';
import { acquireOperation, assertOperation, releaseOperation, withTransactionLock, validateMirrorAccount, type Roles } from './guards';
import { reviewWallet, checkWalletReview, type WalletReview } from './wallet';
import { prepareAts, checkSdkConfig } from './ats';
import { rpcUrl, mirrorUrl } from './deployment';
import { interfaces, rpc, mirror, assertNovaTransaction, isCreationOrigin } from './nova';
import { accounts, securityId, securityAddress, partition, assertFixedAccounts, readLifecycleState, credentialInput,
  roleIds, recoverLifecycle, type LifecycleState } from './lifecycle';
import { createAssetProviders } from './transport';
import type { VerifiedCredential } from './credentials';
import { holdActions, holdEvidence, holdInputEvidence, holdStateEvidence, type HoldAction, type HoldInput, type HoldState,
  type HoldRecord, type HoldTransaction, type HoldSimulation, type SimulationCase, type KycInput } from './evidence';
export type { HoldRecord, HoldState, HoldTransaction } from './evidence';
export const zero = '0x' + '0'.repeat(40);
export const holdStorageKey = 'holdbook.testnet.t04.v1';
export const t04Closed = true;
export const holdLabels: Record<HoldAction,string> = { 'create-hold': 'Create Hold 10', 'kyc-negative': 'Verify Buyer without KYC is rejected',
  'buyer-kyc': 'Grant Buyer KYC', 'permission-negative': 'Verify escrow and amount restrictions', execute: 'Execute 6 to Buyer', release: 'Release 4 to Seller' };
export const t03Hashes = [
  '0xc13d62627f338103a8ea1ec3fa20b2db3dc888a725ccf35cfcc8bac890d046f2',
  '0x21beb3ae191c8516b3d98e5427819bfd775a8a8b3026dfde83e60811cdf5fb03',
  '0xc3322efc279672a14c54049bfcf95039c040e2bc0357126f08436ea515873140',
  '0x295fd4e85ef148c7c3f09d5e39f2d63b266380d4526670a1d0ca2c275a49f6f5',
  '0xb74802329031a287415455c470d02b0ea777d0f8ec4fc751a406345a1db67b10',
  '0x6b9b42184a7d9490a34692c44b1b9e8f03a26d90e87bb451f64f06db26c05a5a',
];
const t03Actions = ['issuer-role','ssi-role','kyc-role','register-issuer','seller-kyc','issue'] as const;
export async function verifyT03History(signal: AbortSignal, progress: (message: string) => void = () => {}) {
  let last;
  for (const [i,action] of t03Actions.entries()) {
    progress(`Verifying T03 history ${i + 1}/6: ${action}…`);
    last = await recoverLifecycle(t03Hashes[i], action, signal, () => {});
    if (last.status !== 'complete') throw new Error('T03 historical verification is incomplete. Query again.');
  }
  return last!.after!;
}
export function sdkHoldId(value: string): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('Hold ID cannot safely enter the pinned SDK. Stop for mentor diagnostics.');
  return Number(value);
}
export function createHoldInput(state: Pick<LifecycleState,'block'|'timestamp'>): HoldInput {
  return { securityId, securityAddress, partition, holder: accounts.Seller.address, escrow: accounts.Admin.address, destination: zero,
    baseBlock: state.block, baseTimestamp: state.timestamp, expirationTimestamp: String(BigInt(state.timestamp) + 86400n) };
}
export function assertHoldInput(input: HoldInput) {
  const i = holdInputEvidence(input);
  if (i.securityId !== securityId || i.securityAddress !== securityAddress || i.partition !== partition || i.holder !== accounts.Seller.address
    || i.escrow !== accounts.Admin.address || i.destination !== zero || !/^[1-9]\d{9}$/.test(i.expirationTimestamp)
    || !/^[1-9]\d{9}$/.test(i.baseTimestamp) || !/^[1-9]\d*$/.test(i.baseBlock)
    || BigInt(i.expirationTimestamp) !== BigInt(i.baseTimestamp) + 86400n) throw new Error('Fixed T04 identity or expiration changed. Stop.');
  if (i.holdId !== undefined) sdkHoldId(i.holdId);
}
export async function holdCalldata(action: HoldAction | 'over-amount', input: HoldInput, kyc?: KycInput) {
  assertHoldInput(input); const { asset } = await interfaces();
  if (action === 'create-hold') return asset.encodeFunctionData('createHoldByPartition', [partition, [10,input.expirationTimestamp,accounts.Admin.address,zero,'0x']]);
  if (!input.holdId) throw new Error('Recover the original Hold ID before continuing.');
  const key = [partition, accounts.Seller.address, sdkHoldId(input.holdId)];
  if (action === 'release') return asset.encodeFunctionData('releaseHoldByPartition', [key,4]);
  if (action === 'execute' || action === 'kyc-negative' || action === 'permission-negative' || action === 'over-amount')
    return asset.encodeFunctionData('executeHoldByPartition', [key, accounts.Buyer.address, action === 'over-amount' ? 11 : 6]);
  if (action === 'buyer-kyc' && kyc?.issuer === accounts.Admin.address && /^urn:uuid:[\w-]+$/.test(kyc.vcId)
    && /^[1-9]\d{9}$/.test(kyc.validFrom) && /^[1-9]\d{9}$/.test(kyc.validTo)
    && BigInt(kyc.validTo) - BigInt(kyc.validFrom) === 605100n)
    return asset.encodeFunctionData('grantKyc', [accounts.Buyer.address,kyc.vcId,kyc.validFrom,kyc.validTo,kyc.issuer]);
  throw new Error('Unapproved T04 action or Buyer KYC inputs.');
}
export function assertHoldTransaction(tx: unknown, action: HoldAction, calldata: string) {
  assertNovaTransaction(tx, { admin: accounts[action === 'create-hold' ? 'Seller' : 'Admin'].address, factory: securityAddress, calldata });
}
export function loadHoldRecords(storage: Pick<Storage,'getItem'> = window.localStorage): HoldRecord[] {
  const raw = storage.getItem(holdStorageKey), values = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(values) || values.length > 50) throw new Error('Invalid T04 journal. Recover original hashes; do not clear it.');
  return values.map(value => { const r = holdEvidence(value); assertHoldInput(r.input); return r; });
}
export function saveHoldRecords(records: HoldRecord[], storage: Pick<Storage,'getItem'|'setItem'> = window.localStorage) {
  const raw = JSON.stringify(records.map(holdEvidence)); storage.setItem(holdStorageKey,raw);
  if (storage.getItem(holdStorageKey) !== raw) throw new Error('T04 intent could not be saved. Transactions are disabled.');
}
export const holdStateDigest = (s: HoldState) => JSON.stringify({ ...holdStateEvidence(s),block: undefined,timestamp: undefined });
const completed = (records: HoldRecord[], action: HoldAction) => records.find(r => r.action === action && r.status === 'complete');
const unresolved = (r: HoldRecord) => r.status !== 'complete' && r.status !== 'failed' && !(r.status === 'rejected' && r.kind === 't04-transaction' && !r.transactionHash);
export function validKyc(s: HoldState, subject: 'sellerKyc'|'buyerKyc', expiry: string) {
  const k = s[subject];
  if (k.status !== 1 || !k.vcId || k.issuer !== accounts.Admin.address || BigInt(k.validFrom) > BigInt(s.timestamp)
    || BigInt(k.validTo) <= BigInt(s.timestamp) || BigInt(k.validTo) < BigInt(expiry)) throw new Error(`${subject === 'sellerKyc' ? 'Seller' : 'Buyer'} KYC must remain valid through the reviewed Hold expiry. Stop; do not renew automatically.`);
}
export function nextHoldAction(state: HoldState, records: HoldRecord[]): HoldAction | undefined {
  if (records.some(unresolved)) throw new Error('An existing T04 operation needs recovery. Check MetaMask and query its original hash.');
  const done = holdActions.filter(action => completed(records,action));
  if (done.some((action,i) => action !== holdActions[i]) || done.some(action => records.filter(r => r.action === action && r.status === 'complete').length !== 1)) throw new Error('T04 evidence has a gap or duplicate. Recover original operations.');
  const create = completed(records,'create-hold');
  const input = create?.input ?? createHoldInput(state); assertHoldInput(input);
  if (state.supply !== '100' || state.buyerHeld !== '0' || state.buyerHoldIds.length || !state.roles.every(Boolean) || !state.issuer) throw new Error('Supply, roles, issuer or Buyer held state changed. Stop.');
  validKyc(state,'sellerKyc',input.expirationTimestamp);
  if (BigInt(state.timestamp) >= BigInt(input.expirationTimestamp)) throw new Error('Hold expired. Stop; release cannot be replaced by reclaim.');
  const buyerGrant = completed(records,'buyer-kyc');
  if (buyerGrant?.kind === 't04-transaction' && buyerGrant.kyc) {
    if (!buyerGrant.kyc.digest) throw new Error('Restore the original public Buyer VC digest before continuing. It cannot be recovered from calldata.');
    validKyc(state,'buyerKyc',input.expirationTimestamp);
    for (const key of ['vcId','issuer','validFrom','validTo'] as const) if (state.buyerKyc[key] !== buyerGrant.kyc[key]) throw new Error('Buyer KYC differs from the original grant. Recover its hash.');
  } else if (state.buyerKyc.status !== 0 || state.buyerKyc.vcId) throw new Error('Buyer KYC already exists without verified evidence. Query its original hash.');
  const released = !!completed(records,'release'), executed = !!completed(records,'execute');
  const balances = released ? ['94','6','0'] : executed ? ['90','6','4'] : create ? ['90','0','10'] : ['100','0','0'];
  if ([state.sellerBalance,state.buyerBalance,state.sellerHeld].some((v,i) => v !== balances[i])) throw new Error('Balances do not match the verified T04 stage. Recover the original transaction; do not repeat it.');
  if (!create || released) {
    if (state.sellerHoldIds.length || state.hold) throw new Error('An existing Hold requires its original creation hash.');
  } else {
    const h = state.hold;
    if (!input.holdId || state.sellerHoldIds.length !== 1 || state.sellerHoldIds[0] !== input.holdId || !h || h.id !== input.holdId
      || h.amount !== balances[2] || h.expirationTimestamp !== input.expirationTimestamp || h.escrow !== accounts.Admin.address
      || h.destination !== zero || h.data !== '0x' || h.operatorData !== '0x' || h.thirdPartyType !== 0) throw new Error('Full Hold details differ from the original event. Stop.');
  }
  return holdActions[done.length];
}
export async function readHoldState(signal: AbortSignal, blockTag?: string, progress: (message: string) => void = () => {}): Promise<HoldState> {
  progress('Checking original accounts, asset, roles, KYC and balances…');
  const state = await readLifecycleState(signal,blockTag,progress), block = '0x' + BigInt(state.block).toString(16), { asset } = await interfaces();
  progress('Reading active Hold IDs and complete Hold details…');
  const call = async (name: string,args: unknown[]) => asset.decodeFunctionResult(name,await rpc('eth_call',[{to:securityAddress,data:asset.encodeFunctionData(name,args)},block],signal) as string);
  const ids = async (address: string) => {
    const count = (await call('getHoldCountForByPartition',[partition,address]))[0];
    if (count > 1n) throw new Error('Multiple existing Holds. Stop and recover original evidence.');
    const values = [...(await call('getHoldsIdForByPartition',[partition,address,0,Number(count)]))[0]].map(String);
    if (BigInt(values.length) !== count) throw new Error('Hold count and IDs disagree.');
    values.forEach(sdkHoldId); return values;
  };
  const sellerHoldIds = await ids(accounts.Seller.address), buyerHoldIds = await ids(accounts.Buyer.address);
  let hold: HoldState['hold'];
  if (sellerHoldIds.length) {
    const h = await call('getHoldForByPartition',[[partition,accounts.Seller.address,sdkHoldId(sellerHoldIds[0])]]);
    hold = { id: sellerHoldIds[0],amount:String(h[0]),expirationTimestamp:String(h[1]),escrow:h[2].toLowerCase(),destination:h[3].toLowerCase(),data:h[4],operatorData:h[5],thirdPartyType:Number(h[6]) };
  }
  return holdStateEvidence({...state,sellerHoldIds,buyerHoldIds,...(hold ? {hold} : {})});
}
export async function holdInterface() {
  const [{HoldByPartitionFacet__factory},{Interface}] = await Promise.all([import('@hashgraph/asset-tokenization-contracts'),import('ethers')]);
  return new Interface(HoldByPartitionFacet__factory.abi);
}
export type HoldReview = { wallet: WalletReview; state: HoldState; action?: HoldAction; input: HoldInput; calldata?: string; digest?: string;
  kyc?: KycInput; buyer?: VerifiedCredential; overAmountCalldata?: string; journal: string; problem?: string };

export async function verifyHoldReceipt(record: HoldTransaction, tx: Record<string,unknown>, receipt: Record<string,unknown>, allowFailed = false) {
  const signer = accounts[record.signerRole].address, hash = record.transactionHash;
  if (!hash || tx?.hash !== hash || receipt?.transactionHash !== hash || tx.chainId !== '0x128'
    || !(receipt.status === '0x1' || allowFailed && receipt.status === '0x0') || receipt.from?.toString().toLowerCase() !== signer
    || receipt.to?.toString().toLowerCase() !== securityAddress || !/^0x[\da-f]{64}$/i.test(String(receipt.blockHash))
    || receipt.blockHash !== tx.blockHash || !/^0x[\da-f]+$/i.test(String(receipt.blockNumber)) || receipt.blockNumber !== tx.blockNumber) throw new Error('T04 receipt binding failed.');
  const calldata = await holdCalldata(record.action,record.input,record.kyc);
  if (keccak256(calldata as Hex) !== record.calldataDigest) throw new Error('Saved T04 intent differs from calldata.');
  assertHoldTransaction({from:tx.from,to:tx.to,data:tx.input ?? tx.data,chainId:tx.chainId,value:tx.value},record.action,calldata);
  if (receipt.status === '0x0') return record.input;
  const {asset} = await interfaces(), held = await holdInterface();
  const iface = record.action === 'create-hold' ? held : asset;
  const name = record.action === 'create-hold' ? 'HeldByPartition' : record.action === 'buyer-kyc' ? 'KycGranted' : record.action === 'execute' ? 'HoldByPartitionExecuted' : 'HoldByPartitionReleased';
  const fragment = iface.getEvent(name)!;
  if (!Array.isArray(receipt.logs)) throw new Error('Missing Hold receipt events.');
  const events = receipt.logs.filter(log => log?.address?.toLowerCase() === securityAddress && log.removed !== true && (log.transactionHash === undefined || log.transactionHash === hash) && (log.blockHash === undefined || log.blockHash === receipt.blockHash) && log.topics?.[0] === fragment.topicHash);
  if (events.length !== 1) throw new Error('Expected exactly one matching T04 event.');
  const input = {...record.input};
  if (record.action === 'create-hold') {
    const parsed = held.parseLog(events[0]); const id = String(parsed!.args.holdId); sdkHoldId(id);
    if (input.holdId && input.holdId !== id) throw new Error('Hold ID differs from the original receipt.'); input.holdId = id;
  }
  const args = record.action === 'create-hold' ? [signer,accounts.Seller.address,partition,input.holdId,[10,input.expirationTimestamp,accounts.Admin.address,zero,'0x'],'0x']
    : record.action === 'buyer-kyc' ? [accounts.Buyer.address,accounts.Admin.address]
    : record.action === 'execute' ? [accounts.Seller.address,partition,input.holdId,6,accounts.Buyer.address]
    : [accounts.Seller.address,partition,input.holdId,4];
  const exact = iface.encodeEventLog(fragment,args);
  if (events[0].data.toLowerCase() !== exact.data.toLowerCase() || JSON.stringify(events[0].topics.map((s:string)=>s.toLowerCase())) !== JSON.stringify(exact.topics.map(s=>s.toLowerCase()))) throw new Error('T04 event inputs do not match.');
  return input;
}
export function assertHoldTransition(record: HoldTransaction, before: HoldState, after: HoldState) {
  assertHoldInput(record.input); const expected = structuredClone(before);
  validKyc(before,'sellerKyc',record.input.expirationTimestamp);
  if (BigInt(before.timestamp) >= BigInt(record.input.expirationTimestamp) || BigInt(after.timestamp) >= BigInt(record.input.expirationTimestamp)
    || before.supply !== '100' || before.buyerHeld !== '0' || before.buyerHoldIds.length || !before.roles.every(Boolean) || !before.issuer) throw new Error('T04 historical preconditions failed or Hold expired.');
  if (record.action === 'create-hold') {
    if (!record.input.holdId || before.sellerHoldIds.length || before.hold || before.sellerBalance !== '100' || before.buyerBalance !== '0'
      || before.sellerHeld !== '0' || before.buyerKyc.status !== 0 || before.buyerKyc.vcId) throw new Error('Hold creation pre-state differs.');
    expected.sellerBalance = '90'; expected.sellerHeld = '10'; expected.sellerHoldIds = [record.input.holdId];
    expected.hold = { id:record.input.holdId, amount:'10',expirationTimestamp:record.input.expirationTimestamp,escrow:accounts.Admin.address,destination:zero,data:'0x',operatorData:'0x',thirdPartyType:0 };
  } else {
    const h = before.hold;
    if (!h || before.sellerHoldIds.length !== 1 || before.sellerHoldIds[0] !== record.input.holdId || h.id !== record.input.holdId || h.escrow !== accounts.Admin.address || h.destination !== zero
      || h.expirationTimestamp !== record.input.expirationTimestamp || h.data !== '0x' || h.operatorData !== '0x' || h.thirdPartyType !== 0 || before.sellerBalance !== '90') throw new Error('Full historical Hold differs.');
    if (record.action === 'buyer-kyc') {
      if (!record.kyc || before.buyerKyc.status !== 0 || before.buyerKyc.vcId || h.amount !== '10' || before.sellerHeld !== '10' || before.buyerBalance !== '0') throw new Error('Buyer KYC already exists or pre-state differs.');
      const {digest: _digest,...kyc} = record.kyc; expected.buyerKyc = {...kyc,status:1}; validKyc(expected,'buyerKyc',record.input.expirationTimestamp);
    } else {
      validKyc(before,'buyerKyc',record.input.expirationTimestamp);
      if (record.action === 'execute') {
        if (h.amount !== '10' || before.sellerHeld !== '10' || before.buyerBalance !== '0') throw new Error('Execute pre-state differs.');
        expected.buyerBalance = '6'; expected.sellerHeld = '4'; expected.hold!.amount = '4';
      } else {
        if (h.amount !== '4' || before.sellerHeld !== '4' || before.buyerBalance !== '6') throw new Error('Release pre-state differs.');
        expected.sellerBalance = '94'; expected.sellerHeld = '0'; expected.sellerHoldIds = []; delete expected.hold;
      }
    }
  }
  if (holdStateDigest(expected) !== holdStateDigest(after)) throw new Error('T04 before/after state does not match the fixed lifecycle.');
}
async function expiryBasis(input: HoldInput, signal: AbortSignal) {
  assertHoldInput(input);
  const block = await rpc('eth_getBlockByNumber',['0x'+BigInt(input.baseBlock).toString(16),false],signal) as {timestamp?:string;number?:string};
  if (!block || block.number !== '0x'+BigInt(input.baseBlock).toString(16) || !/^0x[\da-f]+$/i.test(block.timestamp ?? '') || String(BigInt(block.timestamp!)) !== input.baseTimestamp) throw new Error('Reviewed expiry basis block does not match.');
}
export async function recoverHold(hash: string, action: HoldTransaction['action'], signal: AbortSignal, update: (records: HoldRecord[]) => void,
  baseBlock?: string, owner?: symbol): Promise<HoldTransaction> {
  const recover = async () => {
    if (!/^0x[\da-f]{64}$/i.test(hash) || !['create-hold','buyer-kyc','execute','release'].includes(action)) throw new Error('Enter the original T04 transaction hash and action.');
    hash = hash.toLowerCase(); let records = loadHoldRecords();
    const saved = records.find((r): r is HoldTransaction => r.kind === 't04-transaction' && (r.transactionHash === hash || r.action === action && unresolved(r)));
    if (saved && (saved.action !== action || saved.transactionHash && saved.transactionHash !== hash)) throw new Error('Recover the saved T04 hash and action first.');
    const persist = (value: HoldTransaction) => {
      const r = holdEvidence(value) as HoldTransaction; records = [...records.filter(v=>v.operationId !== r.operationId),r];
      try { saveHoldRecords(records); } finally { update(records); } return r;
    };
    if (await rpc('eth_chainId',[],signal) !== '0x128') throw new Error('Wrong RPC chain.');
    const tx = await rpc('eth_getTransactionByHash',[hash],signal) as Record<string,unknown> | null;
    const receipt = await rpc('eth_getTransactionReceipt',[hash],signal) as Record<string,unknown> | null;
    if (!tx || !receipt) {
      if (saved) return persist({...saved,transactionHash:hash,status:'pending'});
      throw new Error('Transaction not confirmed or indexed. Query the original hash again; do not resubmit.');
    }
    const {asset} = await interfaces();
    let input = saved?.input ?? completed(records,'create-hold')?.input;
    if (!input && action === 'create-hold') {
      if (!baseBlock || !/^[1-9]\d*$/.test(baseBlock)) throw new Error('Enter the original reviewed base block from the public intent to recover creation by hash.');
      const decoded = asset.decodeFunctionData('createHoldByPartition',tx.input as string);
      input = createHoldInput({block:baseBlock,timestamp:String(decoded[1].expirationTimestamp - 86400n)});
    }
    if (!input) throw new Error('Recover the original create-hold transaction first.');
    let kyc = saved?.kyc;
    if (action === 'buyer-kyc' && !kyc) {
      const d = asset.decodeFunctionData('grantKyc',tx.input as string);
      kyc = {vcId:d[1],validFrom:String(d[2]),validTo:String(d[3]),issuer:d[4].toLowerCase()};
    }
    const calldata = await holdCalldata(action,input,kyc);
    let r: HoldTransaction = saved ?? {schemaVersion:1,kind:'t04-transaction',chainId:296,action,operationId:crypto.randomUUID(),startedAt:new Date().toISOString(),status:'confirmed',
      input,signerRole:action === 'create-hold' ? 'Seller' : 'Admin',calldataDigest:keccak256(calldata as Hex),...(kyc ? {kyc} : {})};
    r = {...r,transactionHash:hash}; input = await verifyHoldReceipt(r,tx,receipt,true);
    await expiryBasis(input,signal);
    if (BigInt(input.baseBlock) > BigInt(receipt.blockNumber as string)) throw new Error('Hold basis is after the transaction.');
    r = {...r,input};
    const before = await readHoldState(signal,'0x'+(BigInt(receipt.blockNumber as string)-1n).toString(16));
    const after = await readHoldState(signal,receipt.blockNumber as string), failed = receipt.status === '0x0';
    if (failed) { if (holdStateDigest(before) !== holdStateDigest(after)) throw new Error('Failed transaction changed state.'); }
    else assertHoldTransition(r,before,after);
    if (saved?.before && holdStateDigest(saved.before) !== holdStateDigest(before)) throw new Error('Saved preflight differs from actual historical state.');
    r = persist({...r,before,after,status:'confirmed'});
    const result = await mirror('contracts/results/'+hash,signal);
    if (!result) return persist({...r,status:'mirror-pending'});
    if (!/^0x[\da-f]{40}$/i.test(result.from ?? '')) throw new Error('Mirror sender is invalid.');
    const sender = await mirror('accounts/'+result.from+'?limit=1',signal), expected = accounts[r.signerRole];
    if (!sender) return persist({...r,status:'mirror-pending'});
    if (validateMirrorAccount(expected.address,sender).accountId !== expected.accountId || result.hash !== hash || result.to?.toLowerCase() !== securityAddress
      || result.amount !== 0 || result.function_parameters?.toLowerCase() !== calldata.toLowerCase() || !/^\d+\.\d{9}$/.test(result.timestamp)
      // A transaction's consensus time can be later than its block's start time.
      || !Number.isSafeInteger(result.block_number) || String(result.block_number) !== after.block
      || result.result !== (failed ? 'CONTRACT_REVERT_EXECUTED' : 'SUCCESS')) throw new Error('Mirror T04 identity, calldata or result differs.');
    const txs = await mirror('transactions?timestamp=eq:'+result.timestamp+'&limit=10',signal);
    const matches = txs?.transactions?.filter((t:{consensus_timestamp?:string;result?:string}) => t.consensus_timestamp === result.timestamp && t.result === result.result);
    if (!matches || matches.length !== 1) return persist({...r,status:'mirror-pending'});
    return persist({...r,status:failed ? 'failed' : 'complete',transactionId:matches[0].transaction_id,consensusTimestamp:result.timestamp});
  };
  if (owner) { assertOperation(owner); return recover(); }
  return withTransactionLock(navigator.locks,async()=> { const lease = acquireOperation(); try { return await recover(); } finally { releaseOperation(lease); } });
}

export function isSdkBuyerKycRejection(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as {errorCode?:unknown;message?:unknown};
  return e.errorCode === '20026' && e.message === `An error occurred while executing hold: Account ${accounts.Buyer.address} does not have Kyc status: Granted in the internal/external system`;
}
export async function expectedRevert(data: string, check: SimulationCase['check']): Promise<SimulationCase['revert']> {
  const {asset} = await interfaces();
  if (check === 'kyc-negative') {
    // Published KYC selectors; the identity wrapper can append the rejected account.
    for (const name of ['KycIsNotGranted','InvalidKycStatus'] as const) {
      const selector = asset.encodeErrorResult(name,[]);
      if (data === selector || name === 'InvalidKycStatus' && data === selector + accounts.Buyer.address.slice(2).padStart(64,'0')) return name;
    }
  } else {
    const name = check === 'non-escrow' ? 'IsNotEscrow' : 'InsufficientHoldBalance';
    if (data === asset.encodeErrorResult(name,check === 'non-escrow' ? [] : [10,11])) return name;
  }
  throw new Error('Read-only call did not return the exact expected contract rejection. Transport errors never pass.');
}
export async function callHoldRevert(input: HoldInput, check: SimulationCase['check'], block: string, signal: AbortSignal) {
  const calldata = await holdCalldata(check === 'over-amount' ? 'over-amount' : 'execute',input);
  const from = accounts[check === 'non-escrow' ? 'Seller' : 'Admin'].address;
  if (!/^[1-9]\d*$/.test(block)) throw new Error('Invalid simulation block.');
  const response = await fetch(rpcUrl,{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_call',params:[{from,to:securityAddress,data:calldata,value:'0x0'},'0x'+BigInt(block).toString(16)]}),
    signal:AbortSignal.any([signal,AbortSignal.timeout(10_000)]),credentials:'omit',cache:'no-store',redirect:'error',referrerPolicy:'no-referrer'});
  if (!response.ok) throw new Error('Simulation transport failed; no negative check passed.');
  const body = await response.json(); signal.throwIfAborted();
  if (body.jsonrpc !== '2.0' || body.id !== 1 || 'result' in body || !Number.isInteger(body.error?.code) || typeof body.error?.data !== 'string') throw new Error('Simulation returned no verifiable contract revert.');
  const revert = await expectedRevert(body.error.data,check);
  return {check,from,amount:check === 'over-amount' ? '11' as const : '6' as const,calldata,revert,revertData:body.error.data as string,block};
}
export async function holdSdkReads(input: HoldInput) {
  const {asset} = await interfaces();
  return [
    ...['getERC20Metadata','totalSupply','getMaxSupply','getControlListType','isActivated','isControllable','arePartitionsProtected',
      'isClearingActivated','isInternalKycActivated','isMultiPartition','isIssuable','paused','getControlListCount'].map(name=>asset.encodeFunctionData(name)),
    ...[...roleIds,'0x9830aa071a741c08855dd42130bdb0ff50f7bdf5a4b72f12181eefded0c6542b'].map(role=>asset.encodeFunctionData('hasRole',[role,accounts.Admin.address])),
    asset.encodeFunctionData('isIssuer',[accounts.Admin.address]),asset.encodeFunctionData('getControlListMembers',[0,0]),
    asset.encodeFunctionData('balanceOf',[accounts.Seller.address]),
    ...[accounts.Seller.address,accounts.Buyer.address].flatMap(address=>[
      ...['getKycFor','getKycStatusFor','isInControlList'].map(name=>asset.encodeFunctionData(name,[address])),
      ...[0,1].map(status=>asset.encodeFunctionData('isExternallyGranted',[address,status])),
    ]),
    ...(input.holdId ? [asset.encodeFunctionData('getHoldForByPartition',[[partition,accounts.Seller.address,sdkHoldId(input.holdId)]])] : []),
  ];
}
export async function executeHoldSdk(review: HoldReview) {
  const sdk = await import('@hashgraph/asset-tokenization-sdk'); assertHoldInput(review.input);
  if (review.action === 'create-hold') return sdk.Security.createHoldByPartition(new sdk.CreateHoldByPartitionRequest({securityId,partitionId:partition,amount:'10',escrowId:accounts.Admin.address,targetId:zero,expirationDate:review.input.expirationTimestamp}));
  if (review.action === 'execute' || review.action === 'kyc-negative') return sdk.Security.executeHoldByPartition(new sdk.ExecuteHoldByPartitionRequest({securityId,partitionId:partition,sourceId:accounts.Seller.address,targetId:accounts.Buyer.address,amount:'6',holdId:sdkHoldId(review.input.holdId!)}));
  if (review.action === 'release') return sdk.Security.releaseHoldByPartition(new sdk.ReleaseHoldByPartitionRequest({securityId,partitionId:partition,targetId:accounts.Seller.address,amount:'4',holdId:sdkHoldId(review.input.holdId!)}));
  if (review.action !== 'buyer-kyc' || !review.buyer) throw new Error('Prepare and verify the Buyer credential.');
  const kyc = await credentialInput(review.buyer,review.wallet,'Buyer');
  if (JSON.stringify(kyc) !== JSON.stringify(review.kyc)) throw new Error('Buyer credential changed.');
  const vcBase64 = btoa(Array.from(new TextEncoder().encode(JSON.stringify(structuredClone(review.buyer.credential))),byte=>String.fromCharCode(byte)).join(''));
  return sdk.Kyc.grantKyc(new sdk.GrantKycRequest({securityId,targetId:accounts.Buyer.address,vcBase64}));
}
async function connectHoldSdk(review: HoldReview, providers: Awaited<ReturnType<typeof createAssetProviders>>) {
  const sdk = await import('@hashgraph/asset-tokenization-sdk'), signer = accounts[review.wallet.expectedRole];
  await sdk.Network.connect(new sdk.ConnectRequest({network:'testnet',wallet:sdk.SupportedWallets.METAMASK,
    account:{accountId:signer.accountId,evmAddress:signer.address},mirrorNode:{baseUrl:mirrorUrl},rpcNode:{baseUrl:rpcUrl,queryProvider:providers.read}}),{provider:providers.browser});
}
async function disconnectHoldSdk() { try { const sdk = await import('@hashgraph/asset-tokenization-sdk'); await sdk.Network.disconnect(); } catch { /* Owned providers are always destroyed by the caller. */ } }
function transactionIntent(review: HoldReview): HoldTransaction {
  return {schemaVersion:1,kind:'t04-transaction',chainId:296,operationId:crypto.randomUUID(),startedAt:new Date().toISOString(),
    action:review.action as HoldTransaction['action'],status:'awaiting-signature',input:review.input,before:review.state,
    signerRole:review.action === 'create-hold' ? 'Seller' : 'Admin',calldataDigest:review.digest!,...(review.kyc ? {kyc:review.kyc} : {})};
}
async function sdkBuyerNegative(review: HoldReview, signal: AbortSignal, readBlock?: string) {
  let connected = false;
  const intent = transactionIntent({...review,action:'execute'});
  const p = await createAssetProviders({wallet:{provider:{request:async()=>{throw new Error('Read-only provider forbids wallet mutations.');}}},
    signer:accounts.Admin.address,securityAddress,calldata:review.calldata,initial:intent,sanitize:r=>holdEvidence(r) as HoldTransaction,
    reads:await holdSdkReads(review.input),update:()=>{},checkCurrent:readBlock ? async()=>{} : ()=>checkWalletReview(review.wallet),signal,readOnly:true,readBlock,verifyReceipt:verifyHoldReceipt});
  try {
    await connectHoldSdk(review,p); connected = true;
    try { await executeHoldSdk({...review,action:'kyc-negative'}); }
    catch (error) { if (isSdkBuyerKycRejection(error) && !p.wasAttempted()) return; throw new Error('SDK did not reject the un-KYC Buyer for the expected reason. No negative check passed.'); }
    throw new Error('SDK unexpectedly accepted the un-KYC Buyer. Stop for mentor diagnostics.');
  } finally { if (connected) await disconnectHoldSdk(); p.close(); }
}
function assertSimulationState(state: HoldState, input: HoldInput, buyerKyc: boolean) {
  assertHoldInput(input); validKyc(state,'sellerKyc',input.expirationTimestamp);
  if (buyerKyc) validKyc(state,'buyerKyc',input.expirationTimestamp);
  else if (state.buyerKyc.status !== 0 || state.buyerKyc.vcId) throw new Error('Negative KYC precondition differs.');
  const h = state.hold;
  if (!h || !input.holdId || h.id !== input.holdId || h.amount !== '10' || h.expirationTimestamp !== input.expirationTimestamp
    || h.escrow !== accounts.Admin.address || h.destination !== zero || h.data !== '0x' || h.operatorData !== '0x' || h.thirdPartyType !== 0
    || state.sellerHoldIds.length !== 1 || state.sellerHoldIds[0] !== input.holdId || state.buyerHoldIds.length || state.supply !== '100'
    || state.sellerBalance !== '90' || state.buyerBalance !== '0' || state.sellerHeld !== '10' || state.buyerHeld !== '0'
    || !state.roles.every(Boolean) || !state.issuer || BigInt(state.timestamp) >= BigInt(input.expirationTimestamp)) throw new Error('Simulation does not refer to the exact active, unexpired Hold 10.');
}
export async function verifySavedSimulation(record: HoldSimulation, signal: AbortSignal) {
  record = holdEvidence(record) as HoldSimulation;
  if (!record.before || !record.after) throw new Error('Simulation snapshots are missing.');
  for (const c of record.cases) {
    if (BigInt(c.afterBlock) < BigInt(c.block)) throw new Error('Simulation block order differs.');
    const before = await readHoldState(signal,'0x'+BigInt(c.block).toString(16));
    assertSimulationState(before,record.input,record.action === 'permission-negative');
    if (c.check === 'kyc-negative') {
      const calldata = await holdCalldata('kyc-negative',record.input);
      const wallet: WalletReview = { session: -1, expectedRole:'Admin', roles:Object.fromEntries(Object.entries(accounts).map(([role,a])=>[role,a.address])) as WalletReview['roles'],
        accounts:Object.values(accounts),provider:{request:async()=>{throw new Error('Historical simulation forbids wallet access.');}} };
      await sdkBuyerNegative({wallet,state:before,input:record.input,action:'kyc-negative',calldata,digest:keccak256(calldata as Hex),journal:''},signal,'0x'+BigInt(c.block).toString(16));
    }
    const actual = await callHoldRevert(record.input,c.check,c.block,signal);
    const after = await readHoldState(signal,'0x'+BigInt(c.afterBlock).toString(16));
    assertSimulationState(after,record.input,record.action === 'permission-negative');
    if (holdStateDigest(before) !== holdStateDigest(after) || holdStateDigest(before) !== holdStateDigest(record.before)
      || holdStateDigest(after) !== holdStateDigest(record.after) || actual.calldata !== c.calldata || actual.from !== c.from || actual.revertData !== c.revertData
      || actual.revert !== c.revert || actual.amount !== c.amount) throw new Error('Saved simulation does not match historical state or exact revert.');
  }
}
export async function assertNoUnrecordedHolds(state: HoldState, records: HoldRecord[], signal: AbortSignal) {
  const iface = await holdInterface();
  const topics = ['HeldByPartition','HeldFromByPartition','OperatorHeldByPartition','ControllerHeldByPartition','ProtectedHeldByPartition'].map(name=>iface.getEvent(name)!.topicHash);
  // Read every creation since T03 issuance, including Holds later removed from active IDs.
  const logs = await rpc('eth_getLogs',[{address:securityAddress,fromBlock:'0x'+(40223460).toString(16),toBlock:'0x'+BigInt(state.block).toString(16),
    topics:[topics,null,'0x'+accounts.Seller.address.slice(2).padStart(64,'0')]}],signal);
  if (!Array.isArray(logs)) throw new Error('Hold creation history is unavailable.');
  const created = records.filter((r): r is HoldTransaction => r.kind === 't04-transaction' && r.action === 'create-hold' && r.status === 'complete');
  if (logs.length !== created.length || logs.some(log=>!created.some(r=>r.transactionHash === log.transactionHash) || log.removed === true)) throw new Error('Existing Hold history lacks evidence. Recover the original create-hold hash.');
}
export async function reviewHold(roles: Roles, buyer: VerifiedCredential | undefined, signal: AbortSignal, progress: (message:string)=>void = ()=>{}): Promise<HoldReview> {
  assertFixedAccounts(roles);
  // Recovery revalidates local completion flags before they can authorize another action.
  for (const r of loadHoldRecords()) {
    if (r.kind === 't04-transaction' && (r.status === 'complete' || r.status === 'failed')) {
      if (!r.transactionHash) throw new Error('T04 completion has no hash. Recover original evidence.');
      progress('Rechecking saved transaction: '+holdLabels[r.action]+'…');
      const verified = await recoverHold(r.transactionHash,r.action,signal,()=>{});
      if (verified.status !== r.status) throw new Error('Saved transaction is awaiting full recovery.');
    } else if (r.kind === 't04-simulation') {
      progress('Rechecking historical SDK and contract simulation evidence…');
      const lease = acquireOperation(); try { await verifySavedSimulation(r,signal); } finally { releaseOperation(lease); }
    }
  }
  const lease = acquireOperation();
  try {
    const state = await readHoldState(signal,undefined,progress), records = loadHoldRecords();
    const create = completed(records,'create-hold'); const input = create?.input ?? createHoldInput(state);
    let action: HoldAction | undefined, problem: string | undefined;
    try { action = nextHoldAction(state,records); await assertNoUnrecordedHolds(state,records,signal); } catch (error) { problem = error instanceof Error ? error.message : 'T04 needs recovery.'; }
    const role = action === 'create-hold' ? 'Seller' : 'Admin'; progress(`Checking ${role} in MetaMask and pinned SDK config…`);
    const wallet = await reviewWallet(roles,signal,role);
    if (await prepareAts() !== 'loaded') throw new Error('Pinned SDK unavailable. Stop for mentor diagnostics.');
    const config = await checkSdkConfig(signal,lease);
    if (config.status !== 'passed' || config.payload !== 1) throw new Error('Pinned SDK/config incompatible. Stop for mentor diagnostics.');
    const kyc = !problem && action === 'buyer-kyc' && buyer ? await credentialInput(buyer,wallet,'Buyer') : undefined;
    const calldata = !problem && action && (action !== 'buyer-kyc' || kyc) ? await holdCalldata(action,input,kyc) : undefined;
    await checkWalletReview(wallet); signal.throwIfAborted();
    return {wallet,state,action,input,calldata,overAmountCalldata:action === 'permission-negative' ? await holdCalldata('over-amount',input) : undefined,digest:calldata ? keccak256(calldata as Hex) : undefined,kyc,buyer,journal:JSON.stringify(records),problem};
  } finally { releaseOperation(lease); }
}

export async function runHoldAction(review: HoldReview, update: (records: HoldRecord[])=>void, signal: AbortSignal,
  progress: (message:string)=>void = ()=>{}): Promise<HoldRecord> {
  if (t04Closed) throw new Error('T04 is complete. All T04 transaction and signature entry points are closed. Use historical queries.');
  const simulation = review.action === 'kyc-negative' || review.action === 'permission-negative';
  if (!simulation && !isCreationOrigin(window.location.origin,import.meta.env.PROD)) throw new Error('Use production preview http://127.0.0.1:4173 for transactions.');
  return withTransactionLock(navigator.locks,async()=> {
    let records = loadHoldRecords(), record: HoldTransaction | undefined;
    const lease = acquireOperation();
    let providers: Awaited<ReturnType<typeof createAssetProviders<HoldTransaction>>> | undefined, connected = false;
    let recoverySignal: AbortSignal | undefined;
    const persist = (value: HoldTransaction) => {
      record = holdEvidence(value) as HoldTransaction; records = [...records.filter(r=>r.operationId !== record!.operationId),record];
      // A wallet transition must never discard a returned hash.
      if (record.transactionHash && !recoverySignal) recoverySignal = AbortSignal.timeout(180_000);
      try { saveHoldRecords(records); } finally { update(records); }
    };
    const checkCurrent = async (mutation = false) => {
      signal.throwIfAborted(); assertFixedAccounts(review.wallet.roles); await checkWalletReview(review.wallet);
      if (review.wallet.expectedRole !== (review.action === 'create-hold' ? 'Seller' : 'Admin')) throw new Error('Expected signer role changed.');
      if (!mutation) return;
      const journal = loadHoldRecords().filter(r=>r.operationId !== record?.operationId);
      if (JSON.stringify(journal) !== review.journal || !review.action || !review.calldata || !review.digest) throw new Error('Journal changed or review incomplete. Check again.');
      const calldata = await holdCalldata(review.action,review.input,review.kyc);
      if (calldata !== review.calldata || keccak256(calldata as Hex) !== review.digest) throw new Error('Reviewed calldata changed.');
      if (review.action === 'buyer-kyc' && (!review.buyer || JSON.stringify(await credentialInput(review.buyer,review.wallet,'Buyer')) !== JSON.stringify(review.kyc))) throw new Error('Buyer VC changed or expired.');
      progress('Rechecking exact Hold, balances, KYC and asset before the action…');
      const current = await readHoldState(signal,undefined,progress);
      if (holdStateDigest(current) !== holdStateDigest(review.state) || nextHoldAction(current,journal) !== review.action) throw new Error('State changed. Check and review again.');
      // Creation keeps its original reviewed expiry even when a later block is read.
      validKyc(current,'sellerKyc',review.input.expirationTimestamp);
      if (BigInt(current.timestamp) >= BigInt(review.input.expirationTimestamp)) throw new Error('Reviewed Hold expiry reached. Stop.');
      await expiryBasis(review.input,signal); await assertNoUnrecordedHolds(current,journal,signal); await checkWalletReview(review.wallet); signal.throwIfAborted();
    };
    try {
      await checkCurrent(true);
      if (await prepareAts() !== 'loaded') throw new Error('Pinned SDK unavailable.');
      const config = await checkSdkConfig(signal,lease);
      if (config.status !== 'passed' || config.payload !== 1) throw new Error('Pinned SDK/config incompatible. Stop for mentor diagnostics.');
      if (simulation) {
        if (review.action === 'kyc-negative') { progress('Running genuine SDK execute 6 with a read-only Admin provider…'); await sdkBuyerNegative(review,signal); }
        const before = await readHoldState(signal,undefined,progress), cases: SimulationCase[] = [];
        if (holdStateDigest(before) !== holdStateDigest(review.state)) throw new Error('State changed during the SDK check.');
        for (const check of review.action === 'kyc-negative' ? ['kyc-negative'] as const : ['non-escrow','over-amount'] as const) {
          progress(check === 'kyc-negative' ? 'Checking exact KYC revert with eth_call from Admin…' : check === 'non-escrow' ? 'Checking execute 6 with eth_call from Seller…' : 'Checking execute 11 with eth_call from Admin…');
          const result = await callHoldRevert(review.input,check,before.block,signal);
          cases.push({...result,afterBlock:before.block,...(check === 'kyc-negative' ? {sdkRejection:'AccountNotKycd' as const} : {})});
        }
        const after = await readHoldState(signal,undefined,progress); await checkWalletReview(review.wallet); signal.throwIfAborted();
        if (holdStateDigest(before) !== holdStateDigest(after) || JSON.stringify(loadHoldRecords()) !== review.journal) throw new Error('State or journal changed during simulation.');
        cases.forEach(c=>c.afterBlock = after.block);
        const result = holdEvidence({schemaVersion:1,kind:'t04-simulation',chainId:296,operationId:crypto.randomUUID(),startedAt:new Date().toISOString(),
          action:review.action as HoldSimulation['action'],status:'complete',input:review.input,before,after,cases});
        records.push(result); try {saveHoldRecords(records);} finally {update(records);} return result;
      }
      saveHoldRecords(records); record = transactionIntent(review);
      providers = await createAssetProviders({wallet:review.wallet,signer:accounts[record.signerRole].address,securityAddress,calldata:review.calldata,
        initial:record,sanitize:r=>holdEvidence(r) as HoldTransaction,reads:await holdSdkReads(review.input),update:persist,checkCurrent,signal,
        recoverAfterHash:true,verifyReceipt:verifyHoldReceipt});
      await connectHoldSdk(review,providers); connected = true;
      progress(`Awaiting ${record.signerRole}'s manual approval in MetaMask…`);
      try { await executeHoldSdk(review); }
      catch {
        if (!providers.wasAttempted()) throw new Error('Pinned SDK stopped before submission. Check inputs; if repeated, stop for mentor diagnostics.');
      }
      record = providers.getRecord();
      await disconnectHoldSdk(); connected = false; providers.close();
      if (record.transactionHash) {
        progress('Hash saved. Querying receipt, event, historical state and Mirror once (180-second deadline)…');
        try { return await recoverHold(record.transactionHash,record.action,recoverySignal!,update,undefined,lease); }
        catch { progress('Hash saved; full verification is pending. Query this hash again. No resubmission.'); return record; }
      }
      return record;
    } finally { if (connected) await disconnectHoldSdk(); providers?.close(); releaseOperation(lease); }
  });
}

export async function restoreHoldEvidence(value: unknown) {
  const restored = holdEvidence(value as HoldRecord); assertHoldInput(restored.input);
  const records = loadHoldRecords();
  const matching = records.find(r=>r.operationId === restored.operationId || r.action === restored.action && unresolved(r));
  if (matching) {
    if (matching.action !== restored.action || (matching.input.holdId && matching.input.holdId !== restored.input.holdId) || JSON.stringify({...matching.input,holdId:restored.input.holdId}) !== JSON.stringify(restored.input)
      || matching.kind !== restored.kind || matching.kind === 't04-transaction' && restored.kind === 't04-transaction'
      && (matching.calldataDigest !== restored.calldataDigest || matching.transactionHash && matching.transactionHash !== restored.transactionHash)) throw new Error('Imported evidence conflicts with the saved operation. Recover that operation first.');
  }
  if (restored.kind === 't04-transaction') {
    if (!restored.transactionHash || keccak256(await holdCalldata(restored.action,restored.input,restored.kyc) as Hex) !== restored.calldataDigest) throw new Error('Public transaction intent requires its original hash and matching calldata.');
    restored.status = 'pending';
  }
  const next = [...records.filter(r=>r.operationId !== (matching?.operationId ?? restored.operationId)),restored];
  saveHoldRecords(next); return next;
}

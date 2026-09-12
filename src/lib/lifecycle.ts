import { createAssetProviders } from './transport';
import { getAddress, keccak256, type Hex } from 'viem';
import type { SignedCredential } from '@terminal3/vc_core';
import { acquireOperation, releaseOperation, validateMirrorAccount, type Roles } from './guards';
import { checkWalletReview, reviewWallet, lookupAccount, type WalletReview } from './wallet';
import { prepareAts, checkSdkConfig } from './ats';
import { equityConfigId, mirrorUrl, rpcUrl } from './deployment';
import { interfaces, rpc, mirror, recoverNova, resolverAddress, assertNovaTransaction, isCreationOrigin, withNovaLock } from './nova';
import { verifySellerCredential, type VerifiedSeller } from './credentials';
import { lifecycleActions, lifecycleEvidence, lifecycleStateEvidence, type LifecycleAction, type LifecycleRecord, type LifecycleState, type KycInput } from './evidence';
export type { LifecycleRecord, LifecycleState } from './evidence';
export const securityId = '0.0.10402368';
export const securityAddress = '0x261ce349df182988fa25d00868cf6cf434220c24';
export const creationHash = '0xe1af1387ee185773e012a0e77b5c90ccffc5906ff46a1ac1dbb575b58c1ca05e';
export const accounts = {
  Admin: { address: '0xfd8fdb4989a916c6f2420a2116c356e34c889840', accountId: '0.0.10389090' },
  Seller: { address: '0x740e4ef58151a169621622577a5b6d6ff5010836', accountId: '0.0.10389111' },
  Buyer: { address: '0xa1f2872ee7a9f74523ae0887a9dc428ff1340706', accountId: '0.0.10389098' },
};
export const fallbackBalances: Record<'Admin' | 'Seller' | 'Buyer', string> = {
  Admin: '0',
  Seller: '79',
  Buyer: '21',
};
export const requiredRoles = ['_ISSUER_ROLE', '_SSI_MANAGER_ROLE', '_KYC_ROLE'];
// Exact ATS 8.0.0 SecurityRole values; enum labels are not hash preimages.
export const roleIds = ['0x5eeaf5602c75bf26e73b5206d0bd6ee82f621166255e5fd73cc06bc7bd84a95f',
  '0x3120494a82251fe85b0403877539486dbfcf0f94c20741a3229cfad31f625ee1',
  '0x754f499f9fdfbb089d12bdec817a6863d593d8a3ea7f546c00a5cafd20957bfc'];
export const partition = '0x' + '0'.repeat(63) + '1';
const zero = '0x' + '0'.repeat(40);
export const lifecycleStorageKey = 'holdbook.testnet.t03.v1';
export const actionLabels: Record<LifecycleAction, string> = { 'issuer-role': 'Grant Admin ISSUER role', 'ssi-role': 'Grant Admin SSI_MANAGER role',
  'kyc-role': 'Grant Admin KYC role', 'register-issuer': 'Register Admin as VC issuer', 'seller-kyc': 'Grant Seller KYC', issue: 'Issue 100 NOVA to Seller' };
export function assertFixedAccounts(roles: Roles) {
  for (const [name, account] of Object.entries(accounts)) if (roles[name as keyof Roles]?.toLowerCase() !== account.address) throw new Error('Bind the original T02 Admin, Seller and Buyer accounts.');
}
export function loadLifecycleRecords(storage: Pick<Storage, 'getItem'> = window.localStorage): LifecycleRecord[] {
  const raw = storage.getItem(lifecycleStorageKey), values = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(values) || values.length > 100) throw new Error('Invalid T03 journal. Recover existing hashes.');
  return values.map(value => {
    const record = lifecycleEvidence(value);
    if (record.admin !== accounts.Admin.address || record.securityAddress !== securityAddress) throw new Error('Saved T03 account or asset differs.');
    return record;
  });
}
export function saveLifecycleRecords(records: LifecycleRecord[], storage: Pick<Storage, 'getItem' | 'setItem'> = window.localStorage) {
  const raw = JSON.stringify(records.map(lifecycleEvidence)); storage.setItem(lifecycleStorageKey, raw);
  if (storage.getItem(lifecycleStorageKey) !== raw) throw new Error('T03 intent could not be saved. No transaction is allowed.');
}
function unresolved(r: LifecycleRecord) { return r.status !== 'complete' && r.status !== 'failed' && !(r.status === 'rejected' && !r.transactionHash); }
export function nextAction(state: LifecycleState, records: LifecycleRecord[]): LifecycleAction | undefined {
  if (records.some(unresolved)) throw new Error('An operation needs recovery. Check MetaMask and query its hash; do not resubmit.');
  if (state.buyerKyc.status !== 0 || state.buyerKyc.vcId) throw new Error('Buyer KYC changed. Stop at T03.');
  const issued = records.some(r => r.action === 'issue' && r.status === 'complete');
  if (issued) {
    const grant = records.find(r => r.action === 'seller-kyc' && r.status === 'complete');
    if (!grant?.kyc || !kycMatches(state, grant.kyc)) throw new Error('Recover Seller KYC evidence before final acceptance.');
    if (state.supply !== '100' || state.sellerBalance !== '100' || state.buyerBalance !== '0' || state.sellerHeld !== '0' || state.buyerHeld !== '0'
      || !state.roles.every(Boolean) || !state.issuer || state.sellerKyc.status !== 1) throw new Error('Previously issued asset state changed. Do not issue again.');
    return undefined;
  }
  if ([state.supply, state.sellerBalance, state.buyerBalance, state.sellerHeld, state.buyerHeld].some(v => v !== '0')) throw new Error('Supply or balances changed. Recover an existing issuance hash; never issue another 100.');
  const grant = records.find(r => r.action === 'seller-kyc' && r.status === 'complete');
  if ((state.sellerKyc.status !== 0 || state.sellerKyc.vcId) && !grant) throw new Error('Existing Seller KYC requires its transaction hash and evidence. Do not overwrite it.');
  if (grant && (!grant.kyc || !kycMatches(state, grant.kyc))) throw new Error('Seller KYC changed or expired. Stop; do not overwrite it.');
  const missing = state.roles.findIndex(value => !value);
  if (missing >= 0) return lifecycleActions[missing];
  if (!state.issuer) return 'register-issuer';
  return grant ? 'issue' : 'seller-kyc';
}
function kycMatches(s: LifecycleState, k: KycInput) {
  return s.sellerKyc.status === 1 && (['vcId', 'issuer', 'validFrom', 'validTo'] as const).every(key => s.sellerKyc[key] === k[key]);
}
export async function actionCalldata(action: LifecycleAction, kyc?: KycInput) {
  const { asset } = await interfaces(); const index = lifecycleActions.indexOf(action);
  if (index >= 0 && index < 3) return asset.encodeFunctionData('grantRole', [roleIds[index], accounts.Admin.address]);
  if (action === 'register-issuer') return asset.encodeFunctionData('addIssuer', [accounts.Admin.address]);
  if (action === 'issue') return asset.encodeFunctionData('issueByPartition', [{ partition, tokenHolder: accounts.Seller.address, value: 100, data: '0x' }]);
  if (action === 'seller-kyc' && kyc && kyc.issuer === accounts.Admin.address && kyc.vcId
    && /^\d+$/.test(kyc.validFrom) && /^\d+$/.test(kyc.validTo) && BigInt(kyc.validTo) > BigInt(kyc.validFrom))
    return asset.encodeFunctionData('grantKyc', [accounts.Seller.address, kyc.vcId, kyc.validFrom, kyc.validTo, kyc.issuer]);
  throw new Error('Unapproved T03 action or KYC inputs.');
}
export function assertLifecycleTransaction(tx: unknown, calldata: string) {
  assertNovaTransaction(tx, { admin: accounts.Admin.address, factory: securityAddress, calldata });
}
export async function readLifecycleState(signal: AbortSignal, blockTag?: string, progress: (message: string) => void = () => {}): Promise<LifecycleState> {
  if (await rpc('eth_chainId', [], signal) !== '0x128') throw new Error('Wrong RPC chain.');
  progress('Resolving original Admin, Seller and Buyer through Mirror…');
  await Promise.all(Object.values(accounts).map(async expected => {
    const account = await lookupAccount(expected.address, signal);
    if (account.accountId !== expected.accountId) throw new Error('Original Mirror account mapping changed.');
  }));
  const contract = await mirror('contracts/' + securityId, signal);
  if (!contract || contract.deleted !== false || contract.contract_id !== securityId || contract.evm_address?.toLowerCase() !== securityAddress) throw new Error('Original NOVA mapping unavailable or changed.');
  const { asset } = await interfaces();
  const block = blockTag ?? await rpc('eth_blockNumber', [], signal);
  if (typeof block !== 'string' || !/^0x[\da-f]+$/i.test(block)) throw new Error('Invalid state block.');
  const header = await rpc('eth_getBlockByNumber', [block, false], signal) as { timestamp?: string; number?: string };
  if (!header || header.number !== block || !/^0x[\da-f]+$/i.test(header.timestamp ?? '')) throw new Error('Missing state timestamp.');
  const call = async (name: string, args: unknown[] = []) => asset.decodeFunctionResult(name, await rpc('eth_call', [{ to: securityAddress, data: asset.encodeFunctionData(name, args) }, block], signal) as string);
  progress('Reading pinned NOVA configuration and metadata…');
  const config = await call('getConfigInfo');
  if (config[0].toLowerCase() !== resolverAddress || config[1] !== equityConfigId || config[2] !== 1n) throw new Error('Pinned NOVA config changed. Stop for mentor diagnostics.');
  const metadata = (await call('getERC20Metadata'))[0];
  if (metadata.info.name !== 'Nova Private Equity Common Shares' || metadata.info.symbol !== 'NOVA' || metadata.info.decimals !== 0n || metadata.info.isin !== 'USNOVA000016' || metadata.securityType !== 1n) throw new Error('Wrong asset metadata.');
  const flags: [string, unknown][] = [['getMaxSupply', 1000n], ['paused', false], ['isIssuable', true], ['isInternalKycActivated', true],
    ['isControllable', true], ['isMultiPartition', false], ['arePartitionsProtected', false], ['isClearingActivated', false], ['isActivated', false],
    ['getControlListType', false], ['getControlListCount', 0n], ['getExternalPausesCount', 0n], ['getExternalControlListsCount', 0n], ['getExternalKycListsCount', 0n], ['compliance', zero], ['identityRegistry', zero]];
  progress('Verifying NOVA restrictions, cap and required roles…');
  // At most four fixed-block public reads in flight; no retries or changing snapshot.
  for (let i = 0; i < flags.length; i += 4) {
    await Promise.all(flags.slice(i, i + 4).map(async ([name, expected]) => {
      if ((await call(name))[0] !== expected) throw new Error('NOVA restriction or parameter changed: ' + name);
    }));
  }
  if (!(await call('hasRole', ['0x' + '0'.repeat(64), accounts.Admin.address]))[0]) throw new Error('Admin management role missing.');
  const roles: boolean[] = await Promise.all(roleIds.map(async role => (await call('hasRole', [role, accounts.Admin.address]))[0]));
  const kyc = async (address: string) => {
    const k = (await call('getKycFor', [address]))[0];
    return { status: Number(k.status), vcId: k.vcId, issuer: k.issuer.toLowerCase(), validFrom: String(k.validFrom), validTo: String(k.validTo) };
  };
  const balance = async (address: string) => {
    const [[total], [available], [held], [partitionHeld]] = await Promise.all([call('balanceOf', [address]), call('balanceOfByPartition', [partition, address]), call('getHeldAmountFor', [address]), call('getHeldAmountForByPartition', [partition, address])]);
    if (total !== available || held !== partitionHeld) throw new Error('Unexpected non-default partition balances.');
    return { available: String(available), held: String(held) };
  };
  progress('Reading Seller and Buyer KYC, available and held balances…');
  const seller = await balance(accounts.Seller.address), buyer = await balance(accounts.Buyer.address);
  return lifecycleStateEvidence({ block: BigInt(block).toString(), timestamp: BigInt(header.timestamp!).toString(), roles,
    issuer: (await call('isIssuer', [accounts.Admin.address]))[0], supply: String((await call('totalSupply'))[0]),
    sellerBalance: seller.available, buyerBalance: buyer.available, sellerHeld: seller.held, buyerHeld: buyer.held,
    sellerKyc: await kyc(accounts.Seller.address), buyerKyc: await kyc(accounts.Buyer.address) });
}
export const stateDigest = (s: LifecycleState) => JSON.stringify({ ...lifecycleStateEvidence(s), block: undefined, timestamp: undefined });
export type LifecycleReview = { wallet: WalletReview; state: LifecycleState; action?: LifecycleAction; calldata?: string; digest?: string; kyc?: KycInput; seller?: VerifiedSeller; journal: string; problem?: string };
export async function credentialInput(seller: VerifiedSeller, wallet: WalletReview, subject: 'Seller' | 'Buyer' = 'Seller'): Promise<KycInput> {
  if (wallet.expectedRole !== 'Admin' || seller.session !== wallet.session || !(await verifySellerCredential(seller.credential, seller.prepared)).verified
    || seller.prepared.payload.issuer !== 'did:ethr:' + getAddress(accounts.Admin.address)
    || seller.prepared.payload.credentialSubject.id !== 'did:ethr:' + getAddress(accounts[subject].address)) throw new Error(`Prepare, review, sign and verify a current Admin-to-${subject} VC.`);
  const p = seller.prepared.payload;
  return { vcId: p.id, issuer: accounts.Admin.address, validFrom: String(Math.floor(Date.parse(p.validFrom!) / 1000)),
    validTo: String(Math.floor(Date.parse(p.validUntil!) / 1000)), digest: seller.prepared.digest };
}
export async function reviewLifecycle(roles: Roles, seller: VerifiedSeller | undefined, signal: AbortSignal): Promise<LifecycleReview> {
  assertFixedAccounts(roles);
  // Local completion flags are never chain evidence, including after reload.
  for (const record of loadLifecycleRecords().filter(r => r.status === 'complete' || r.status === 'failed')) {
    if (!record.transactionHash) throw new Error('Saved completion has no transaction hash. Recover existing evidence.');
    await recoverLifecycle(record.transactionHash, record.action, signal, () => {});
  }
  const lease = acquireOperation();
  try {
    assertFixedAccounts(roles); const wallet = await reviewWallet(roles, signal);
    if (await prepareAts() !== 'loaded') throw new Error('Pinned SDK could not load.');
    const config = await checkSdkConfig(signal, lease);
    if (config.status !== 'passed' || config.payload !== 1) throw new Error('Pinned SDK/config incompatible. Stop for mentor diagnostics.');
    const history = await recoverNova(creationHash, accounts.Admin.address, signal, undefined, lease);
    if (history.status !== 'complete' || history.securityId !== securityId || history.securityAddress !== securityAddress) throw new Error('T02 creation-block verification incomplete. Do not use latest state as history.');
    const state = await readLifecycleState(signal), records = loadLifecycleRecords();
    let action: LifecycleAction | undefined, problem: string | undefined;
    try { action = nextAction(state, records); } catch (error) { problem = error instanceof Error ? error.message : 'T03 state requires recovery.'; }
    const kyc = action === 'seller-kyc' && seller ? await credentialInput(seller, wallet) : undefined;
    const calldata = action && (action !== 'seller-kyc' || kyc) ? await actionCalldata(action, kyc) : undefined;
    await checkWalletReview(wallet); signal.throwIfAborted();
    return { wallet, state, action, problem, calldata, digest: calldata ? keccak256(calldata as Hex) : undefined, kyc, seller: action === 'seller-kyc' ? seller : undefined, journal: JSON.stringify(records) };
  } finally { releaseOperation(lease); }
}

// Same native lock as creation: no two local lifecycle transactions may overlap.
export const withLifecycleLock = withNovaLock;
export async function createLifecycleProviders(review: LifecycleReview, initial: LifecycleRecord,
  update: (record: LifecycleRecord) => void, checkCurrent: (mutation?: boolean) => Promise<void>, signal: AbortSignal) {
  const { asset } = await interfaces();
  const reads = [
    ...['getERC20Metadata', 'totalSupply', 'getMaxSupply', 'getControlListType', 'isActivated', 'isControllable', 'arePartitionsProtected',
      'isClearingActivated', 'isInternalKycActivated', 'isMultiPartition', 'isIssuable', 'paused', 'getControlListCount'].map(name => asset.encodeFunctionData(name)),
    ...[...roleIds, '0x9830aa071a741c08855dd42130bdb0ff50f7bdf5a4b72f12181eefded0c6542b'].map(role => asset.encodeFunctionData('hasRole', [role, accounts.Admin.address])),
    asset.encodeFunctionData('isIssuer', [accounts.Admin.address]),
    asset.encodeFunctionData('getControlListMembers', [0, 0]),
    ...[0, 1].map(status => asset.encodeFunctionData('isExternallyGranted', [accounts.Seller.address, status])),
    ...['getKycFor', 'getKycStatusFor', 'isInControlList'].map(name => asset.encodeFunctionData(name, [accounts.Seller.address])),
  ];
  return createAssetProviders({ wallet: review.wallet, signer: accounts.Admin.address, securityAddress, calldata: review.calldata,
    reads, initial, sanitize: lifecycleEvidence, update, checkCurrent, signal, verifyReceipt: verifyLifecycleReceipt });
}

export async function executeLifecycleSdk(review: LifecycleReview) {
  const sdk = await import('@hashgraph/asset-tokenization-sdk');
  const index = lifecycleActions.indexOf(review.action!);
  if (index >= 0 && index < 3) return sdk.Role.grantRole(new sdk.RoleRequest({ securityId, targetId: accounts.Admin.address, role: roleIds[index] }));
  if (review.action === 'register-issuer') return sdk.SsiManagement.addIssuer(new sdk.AddIssuerRequest({ securityId, issuerId: accounts.Admin.address }));
  if (review.action === 'issue') return sdk.Security.issue(new sdk.IssueRequest({ securityId, targetId: accounts.Seller.address, amount: '100' }));
  if (review.action !== 'seller-kyc' || !review.seller) throw new Error('Missing verified Seller credential.');
  await credentialInput(review.seller, review.wallet);
  const copy: SignedCredential = structuredClone(review.seller.credential);
  const vcBase64 = btoa(Array.from(new TextEncoder().encode(JSON.stringify(copy)), byte => String.fromCharCode(byte)).join(''));
  return sdk.Kyc.grantKyc(new sdk.GrantKycRequest({ securityId, targetId: accounts.Seller.address, vcBase64 }));
}
export const lifecycleClosed = true;
export async function submitLifecycle(review: LifecycleReview, update: (records: LifecycleRecord[]) => void) {
  if (lifecycleClosed) throw new Error('T03 is complete. Issuance and all T03 mutations are closed.');
  if (!isCreationOrigin(window.location.origin, import.meta.env.PROD)) throw new Error('Use production preview http://127.0.0.1:4173.');
  return withLifecycleLock(navigator.locks, async () => {
    const controller = new AbortController();
    let providers: Awaited<ReturnType<typeof createLifecycleProviders>> | undefined, connected = false;
    let records = loadLifecycleRecords(), record: LifecycleRecord | undefined;
    const lease = acquireOperation();
    const persist = (next: LifecycleRecord) => {
      record = lifecycleEvidence(next);
      records = [...records.filter(r => r.operationId !== next.operationId), record];
      try { saveLifecycleRecords(records); } finally { update(records); }
    };
    try {
      if (!review.action || !review.calldata || !review.digest || JSON.stringify(records) !== review.journal) throw new Error('Journal changed. Review again.');
      const checkCurrent = async (mutation = false) => {
        await checkWalletReview(review.wallet); assertFixedAccounts(review.wallet.roles);
        if (!mutation) return;
        const exact = await actionCalldata(review.action!, review.kyc);
        if (exact !== review.calldata || keccak256(exact as Hex) !== review.digest) throw new Error('Review inputs changed.');
        const current = await readLifecycleState(controller.signal);
        if (stateDigest(current) !== stateDigest(review.state) || nextAction(current, records.filter(r => r.operationId !== record?.operationId)) !== review.action) throw new Error('Asset state changed. Review again.');
        if (review.action === 'seller-kyc' && (!review.seller || JSON.stringify(await credentialInput(review.seller, review.wallet)) !== JSON.stringify(review.kyc))) throw new Error('Credential changed. Review again.');
        await checkWalletReview(review.wallet);
      };
      await checkCurrent(true);
      if (await prepareAts() !== 'loaded') throw new Error('SDK unavailable.');
      const config = await checkSdkConfig(controller.signal, lease);
      if (config.status !== 'passed' || config.payload !== 1) throw new Error('Pinned SDK/config changed. Stop for mentor diagnostics.');
      record = { schemaVersion: 1, kind: 't03', chainId: 296, operationId: crypto.randomUUID(), startedAt: new Date().toISOString(),
        action: review.action, status: 'awaiting-signature', admin: accounts.Admin.address, securityAddress,
        calldataDigest: review.digest, before: review.state, ...(review.kyc ? { kyc: review.kyc } : {}) };
      // Probe durable storage before SDK work; actual intent is saved at the send boundary.
      saveLifecycleRecords(records);
      providers = await createLifecycleProviders(review, record, persist, checkCurrent, controller.signal);
      const sdk = await import('@hashgraph/asset-tokenization-sdk');
      await sdk.Network.connect(new sdk.ConnectRequest({ network: 'testnet', wallet: sdk.SupportedWallets.METAMASK,
        account: { accountId: accounts.Admin.accountId, evmAddress: accounts.Admin.address }, mirrorNode: { baseUrl: mirrorUrl },
        rpcNode: { baseUrl: rpcUrl, queryProvider: providers.read } }), { provider: providers.browser }); connected = true;
      await executeLifecycleSdk(review);
      return providers.getRecord();
    } catch {
      if (!providers?.wasAttempted()) throw new Error('T03 preflight or SDK call stopped before submission. Recheck and review again; inspect compatibility if repeated.');
      const latest = providers.getRecord();
      const next = { ...latest, status: latest.status === 'rejected' || latest.status === 'confirmed' ? latest.status : 'unknown' as const };
      try { persist(next); } catch { update(records); } return next;
    } finally {
      if (connected) { try { const sdk = await import('@hashgraph/asset-tokenization-sdk'); await sdk.Network.disconnect(); } catch { /* Always release owned providers. */ } }
      providers?.close(); controller.abort(); releaseOperation(lease);
    }
  });
}
export async function verifyLifecycleReceipt(record: LifecycleRecord, tx: Record<string, unknown>, receipt: Record<string, unknown>, allowFailed = false) {
  const hash = record.transactionHash;
  if (!hash || !tx || !receipt || tx.hash !== hash || receipt.transactionHash !== hash || !(receipt.status === '0x1' || (allowFailed && receipt.status === '0x0'))
    || tx.chainId !== '0x128' || typeof receipt.blockHash !== 'string' || !/^0x[\da-f]{64}$/i.test(receipt.blockHash)
    || receipt.blockHash !== tx.blockHash || typeof receipt.blockNumber !== 'string' || !/^0x[\da-f]+$/i.test(receipt.blockNumber)
    || receipt.blockNumber !== tx.blockNumber || receipt.to?.toString().toLowerCase() !== securityAddress
    || receipt.from?.toString().toLowerCase() !== accounts.Admin.address) throw new Error('Receipt binding failed.');
  const calldata = await actionCalldata(record.action, record.kyc);
  if (keccak256(calldata as Hex) !== record.calldataDigest) throw new Error('Saved intent differs from calldata.');
  assertLifecycleTransaction({ from: tx.from, to: tx.to, data: tx.input ?? tx.data, value: tx.value, chainId: tx.chainId }, calldata);
  if (receipt.status === '0x0') return calldata;
  const { asset } = await interfaces();
  const index = lifecycleActions.indexOf(record.action);
  const name = index < 3 ? 'RoleGranted' : record.action === 'register-issuer' ? 'AddedToIssuerList' : record.action === 'seller-kyc' ? 'KycGranted' : 'IssuedByPartition';
  const args = index < 3 ? [accounts.Admin.address, accounts.Admin.address, roleIds[index]] : record.action === 'register-issuer'
    ? [accounts.Admin.address, accounts.Admin.address] : record.action === 'seller-kyc' ? [accounts.Seller.address, accounts.Admin.address]
    : [partition, accounts.Admin.address, accounts.Seller.address, 100, '0x'];
  const event = asset.encodeEventLog(asset.getEvent(name)!, args);
  if (!Array.isArray(receipt.logs)) throw new Error('Missing event.');
  const events = receipt.logs.filter(log => log?.address?.toLowerCase() === securityAddress && log.removed !== true && log.topics?.[0] === event.topics[0]);
  if (events.length !== 1 || events[0].data.toLowerCase() !== event.data.toLowerCase() || JSON.stringify(events[0].topics.map((s: string) => s.toLowerCase())) !== JSON.stringify(event.topics.map(s => s.toLowerCase()))) throw new Error('Exact asset event missing.');
  return calldata;
}
export function assertLifecycleTransition(record: LifecycleRecord, before: LifecycleState, after: LifecycleState) {
  const expected = structuredClone(before), index = lifecycleActions.indexOf(record.action);
  if ([before.supply, before.sellerBalance, before.buyerBalance, before.sellerHeld, before.buyerHeld].some(v => v !== '0') || before.buyerKyc.status !== 0 || before.buyerKyc.vcId) throw new Error('Unexpected pre-transaction supply, balances or Buyer KYC.');
  if (index < 3) { if (before.roles[index]) throw new Error('Role already existed.'); expected.roles[index] = true; }
  else if (record.action === 'register-issuer') { if (before.issuer || !before.roles.every(Boolean)) throw new Error('Issuer preconditions failed.'); expected.issuer = true; }
  else {
    if (!before.roles.every(Boolean) || !before.issuer) throw new Error('Roles or issuer missing.');
    if (record.action === 'seller-kyc') {
      if (!record.kyc || before.sellerKyc.vcId || before.sellerKyc.status !== 0) throw new Error('KYC already exists or inputs missing.');
      const { digest: _digest, ...kyc } = record.kyc; expected.sellerKyc = { ...kyc, status: 1 };
    } else { if (before.sellerKyc.status !== 1) throw new Error('Seller KYC missing.'); expected.supply = '100'; expected.sellerBalance = '100'; }
  }
  if (stateDigest(expected) !== stateDigest(after)) throw new Error('Transaction before/after state differs from the approved action.');
}
export async function recoverLifecycle(hash: string, action: LifecycleAction, signal: AbortSignal, update: (records: LifecycleRecord[]) => void) {
  if (!/^0x[\da-f]{64}$/i.test(hash) || !lifecycleActions.includes(action)) throw new Error('Enter the existing public transaction hash and its action.');
  hash = hash.toLowerCase();
  return withLifecycleLock(navigator.locks, async () => {
    let records = loadLifecycleRecords();
    const saved = records.find(r => r.transactionHash === hash) ?? records.find(r => r.action === action && unresolved(r));
    if (saved && (saved.action !== action || (saved.transactionHash && saved.transactionHash !== hash))) throw new Error('Recover the recorded action and hash first.');
    const lease = acquireOperation();
    const persist = (record: LifecycleRecord) => {
      records = [...records.filter(r => r.operationId !== record.operationId), lifecycleEvidence(record)];
      try { saveLifecycleRecords(records); } finally { update(records); }
      return lifecycleEvidence(record);
    };
    try {
      if (await rpc('eth_chainId', [], signal) !== '0x128') throw new Error('Wrong RPC chain.');
      const tx = await rpc('eth_getTransactionByHash', [hash], signal) as Record<string, unknown> | null;
      const receipt = await rpc('eth_getTransactionReceipt', [hash], signal) as Record<string, unknown> | null;
      if (!tx || !receipt) {
        if (saved) return persist({ ...saved, status: saved.transactionHash ? 'pending' : 'unknown' });
        throw new Error('Not confirmed or indexed. Check MetaMask; query again without resubmitting.');
      }
      const { asset } = await interfaces();
      let kyc = saved?.kyc;
      if (action === 'seller-kyc' && !kyc) {
        const decoded = asset.decodeFunctionData('grantKyc', tx.input as string);
        kyc = { vcId: decoded[1], validFrom: String(decoded[2]), validTo: String(decoded[3]), issuer: decoded[4].toLowerCase() };
      }
      const calldata = await actionCalldata(action, kyc);
      let record: LifecycleRecord = saved ?? { schemaVersion: 1, kind: 't03', chainId: 296, action, operationId: crypto.randomUUID(),
        startedAt: new Date().toISOString(), admin: accounts.Admin.address, securityAddress, calldataDigest: keccak256(calldata as Hex), status: 'confirmed', ...(kyc ? { kyc } : {}) };
      record = { ...record, transactionHash: hash };
      await verifyLifecycleReceipt(record, tx, receipt, true);
      const failed = receipt.status === '0x0';
      const before = await readLifecycleState(signal, '0x' + (BigInt(receipt.blockNumber as string) - 1n).toString(16));
      const after = await readLifecycleState(signal, receipt.blockNumber as string);
      if (failed) { if (stateDigest(before) !== stateDigest(after)) throw new Error('Failed transaction state changed.'); }
      else assertLifecycleTransition(record, before, after);
      if (saved?.before && stateDigest(saved.before) !== stateDigest(before)) throw new Error('Recorded preflight differs from transaction pre-state.');
      record = { ...record, before, after, status: 'confirmed' }; persist(record);
      const result = await mirror('contracts/results/' + hash, signal);
      if (!result) return persist({ ...record, status: 'mirror-pending' });
      const sender = await mirror('accounts/' + result.from + '?limit=1', signal);
      if (!sender) return persist({ ...record, status: 'mirror-pending' });
      if (validateMirrorAccount(accounts.Admin.address, sender).accountId !== accounts.Admin.accountId || result.hash !== hash
        || result.to?.toLowerCase() !== securityAddress || (failed ? !/^[A-Z_]+$/.test(result.result) || result.result === 'SUCCESS' : result.result !== 'SUCCESS') || result.amount !== 0
        || result.function_parameters?.toLowerCase() !== calldata.toLowerCase() || !/^\d+\.\d{9}$/.test(result.timestamp)) throw new Error('Mirror transaction does not match.');
      const transactions = await mirror('transactions?timestamp=eq:' + result.timestamp + '&limit=10', signal);
      const matches = transactions?.transactions?.filter((t: { consensus_timestamp?: string; result?: string }) => t.consensus_timestamp === result.timestamp && t.result === result.result);
      if (!matches || matches.length !== 1) return persist({ ...record, status: 'mirror-pending' });
      return persist({ ...record, status: failed ? 'failed' : 'complete', consensusTimestamp: result.timestamp, transactionId: matches[0].transaction_id });
    } finally { releaseOperation(lease); }
  });
}

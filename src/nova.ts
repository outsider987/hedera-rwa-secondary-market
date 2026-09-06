import { getAddress, keccak256, type Hex } from 'viem';
import { acquireOperation, assertOperation, isAddress, releaseOperation, type Roles } from './guards';
import { checkDeployment, deployments, equityConfigId, mirrorUrl, rpcUrl } from './deployment';
import { checkSdkConfig, prepareAts } from './ats';
import { checkWalletReview, getWalletSession, reviewWallet, type WalletReview } from './wallet';
import { novaEvidence, type Comparison, type NovaRecord } from './evidence';
import { verifySellerCredential, type PreparedCredential } from './credentials';
import type { SignedCredential } from '@terminal3/vc_core';
export type { NovaRecord } from './evidence';

export const factoryAddress = '0xd1f118a40f3b02883d35909ef2517e7edd78379d';
export const resolverAddress = '0xba2d5fc2083a0b8f164c50e65d782087fba18e0a';
const zeroAddress = '0x' + '0'.repeat(40), adminRole = '0x' + '0'.repeat(64);
export const novaStorageKey = 'holdbook.testnet.nova.v1';
export const novaInfo = 'Fictional Testnet asset. Synthetic KYC only; no real securities or legal compliance claims.';
export const novaSettings = { name: 'Nova Private Equity Common Shares', symbol: 'NOVA', isin: 'USNOVA000016', decimals: 0,
    numberOfShares: '1000', nominalValue: '1', nominalValueDecimals: 0, currency: '0x555344',
    internalKycActivated: true, isControllable: true,
    clearingActive: false, isMultiPartition: false, arePartitionsProtected: false, erc20VotesActivated: false, isWhiteList: false,
    votingRight: true, informationRight: true, liquidationRight: true, subscriptionRight: false,
    conversionRight: false, redemptionRight: false, putRight: false, dividendRight: 2,
    regulationType: 1, regulationSubType: 0, isCountryControlListWhiteList: false, countries: '', info: novaInfo,
    externalPausesIds: [] as string[], externalControlListsIds: [] as string[], externalKycListsIds: [] as string[] };
export function novaParameters(admin: string, version: number) {
  if (!Number.isSafeInteger(version) || version < 1 || !isAddress(admin)) throw new Error('Invalid Admin or SDK config version.');
  return { ...novaSettings, diamondOwnerAccount: getAddress(admin), configId: equityConfigId, configVersion: version };
}

async function interfaces() {
  const [{ Factory__factory, IAsset__factory }, { Interface }] = await Promise.all([import('@hashgraph/asset-tokenization-contracts'), import('ethers')]);
  return { factory: new Interface(Factory__factory.abi), asset: new Interface(IAsset__factory.abi) };
}
export async function novaCalldata(admin: string, version: number) {
  const p = novaParameters(admin, version), { factory } = await interfaces();
  return factory.encodeFunctionData('deployEquity', [{ security: {
    resolver: resolverAddress, maxSupply: p.numberOfShares, resolverProxyConfiguration: { key: equityConfigId, version },
    erc20MetadataInfo: { name: p.name, symbol: p.symbol, isin: p.isin, decimals: p.decimals }, rbacs: [{ role: adminRole, members: [admin] }],
    externalPauses: [], externalControlLists: [], externalKycLists: [], compliance: zeroAddress, identityRegistry: zeroAddress,
    arePartitionsProtected: false, isMultiPartition: false, isControllable: true, isWhiteList: false,
    clearingActive: false, internalKycActivated: true, erc20VotesActivated: false,
  }, equityDetails: { votingRight: true, informationRight: true, liquidationRight: true, subscriptionRight: false,
    conversionRight: false, redemptionRight: false, putRight: false, dividendRight: 2, currency: p.currency,
    nominalValue: p.nominalValue, nominalValueDecimals: 0 } }, { regulationType: 1, regulationSubType: 0,
    additionalSecurityData: { countriesControlListType: false, listOfCountries: '', info: novaInfo } }]);
}
export function assertNovaTransaction(value: unknown, expected: { admin: string; factory: string; calldata: string }) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Unexpected transaction.');
  const tx = value as Record<string, unknown>;
  if (typeof tx.from !== 'string' || tx.from.toLowerCase() !== expected.admin.toLowerCase()
    || typeof tx.to !== 'string' || tx.to.toLowerCase() !== expected.factory.toLowerCase()
    || typeof tx.data !== 'string' || tx.data.toLowerCase() !== expected.calldata.toLowerCase()
    || (tx.value !== undefined && tx.value !== '0x0' && tx.value !== '0x00')
    || (tx.chainId !== undefined && tx.chainId !== '0x128')) throw new Error('Transaction does not match the reviewed NOVA deployment.');
  for (const key of Object.keys(tx)) {
    if (!['from', 'to', 'data', 'value', 'chainId', 'gas', 'gasPrice', 'maxFeePerGas', 'maxPriorityFeePerGas', 'nonce', 'type'].includes(key)) throw new Error('Unexpected transaction field.');
    if (['gas', 'gasPrice', 'maxFeePerGas', 'maxPriorityFeePerGas', 'nonce', 'type'].includes(key)
      && (typeof tx[key] !== 'string' || !/^0x[\da-f]+$/i.test(tx[key] as string))) throw new Error('Invalid transaction quantity.');
  }
}
export function loadNovaRecord(storage: Pick<Storage, 'getItem'> = window.localStorage): NovaRecord | undefined {
  const raw = storage.getItem(novaStorageKey); return raw === null ? undefined : novaEvidence(JSON.parse(raw));
}
export function saveNovaRecord(value: NovaRecord, storage: Pick<Storage, 'setItem' | 'getItem'> = window.localStorage) {
  const text = JSON.stringify(novaEvidence(value)); storage.setItem(novaStorageKey, text);
  if (storage.getItem(novaStorageKey) !== text) throw new Error('NOVA operation could not be saved. Creation is disabled.');
}
export const canCreateNova = (record?: NovaRecord) => !record || (record.status === 'rejected' && !record.transactionHash);
export const isCreationOrigin = (origin: string, production: boolean) => production && origin === 'http://127.0.0.1:4173';
export async function withNovaLock<T>(locks: Pick<LockManager, 'request'> | undefined, action: () => Promise<T>) {
  if (!locks) throw new Error('Browser locking is unavailable. Creation is disabled.');
  return locks.request('holdbook-nova-create', { mode: 'exclusive', ifAvailable: true }, async lock => {
    if (!lock) throw new Error('NOVA creation is active in another tab. Query the existing operation.');
    return action();
  });
}
export function creationStorageAvailable() {
  try {
    const storage = window.localStorage, key = novaStorageKey + '.probe';
    storage.setItem(key, '1'); const ok = storage.getItem(key) === '1'; storage.removeItem(key);
    loadNovaRecord(storage); return ok && !!navigator.locks;
  } catch { return false; }
}

export type NovaReview = { wallet: WalletReview; configVersion: number; calldata: string; digest: string; reviewedAt: string };
export async function reviewNova(roles: Roles, signal: AbortSignal, owner?: symbol): Promise<NovaReview> {
  if (owner) assertOperation(owner);
  const lease = owner ?? acquireOperation();
  try {
    const wallet = await reviewWallet(roles, signal);
    if (await prepareAts() !== 'loaded') throw new Error('Pinned ATS SDK could not load. Stop and record diagnostics for a mentor.');
    const config = await checkSdkConfig(signal, lease);
    if (config.status !== 'passed' || !config.payload || config.deployment?.config.version !== String(config.payload)
      || config.deployment.contracts[0].address?.toLowerCase() !== resolverAddress
      || config.deployment.contracts[1].address?.toLowerCase() !== factoryAddress) throw new Error('Pinned deployment or SDK config is incompatible. Stop and record diagnostics for a mentor.');
    const sdk = await import('@hashgraph/asset-tokenization-sdk');
    const request = new sdk.CreateEquityRequest(novaParameters(wallet.roles.Admin, config.payload));
    if (request.validate().length) throw new Error('Pinned NOVA parameters failed SDK validation. Stop and record diagnostics for a mentor.');
    const calldata = await novaCalldata(wallet.roles.Admin, config.payload);
    await checkWalletReview(wallet); signal.throwIfAborted();
    return { wallet, configVersion: config.payload, calldata, digest: keccak256(calldata as Hex), reviewedAt: new Date().toISOString() };
  } finally { if (!owner) releaseOperation(lease); }
}

async function rpc(method: string, params: unknown[], signal: AbortSignal): Promise<unknown> {
  const response = await fetch(rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
    credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Testnet RPC is unavailable. Query again when ready.');
  const body = await response.json(); signal.throwIfAborted();
  if (body.error || body.jsonrpc !== '2.0' || body.id !== 1 || !('result' in body)) throw new Error('Testnet RPC did not return a valid result.');
  return body.result;
}
async function mirror(path: string, signal: AbortSignal) {
  const response = await fetch(mirrorUrl + path, { signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]), credentials: 'omit',
    cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer' });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error('Mirror query did not complete.');
  const result = await response.json(); signal.throwIfAborted(); return result;
}

export async function verifyNovaReceipt(transactionHash: string, admin: string, tx: Record<string, unknown>, receipt: Record<string, unknown>, expectedVersion?: number) {
  if (receipt.status !== '0x1' || receipt.transactionHash !== transactionHash || tx.hash !== transactionHash
    || typeof receipt.blockHash !== 'string' || !/^0x[\da-f]{64}$/i.test(receipt.blockHash)
    || receipt.blockHash !== tx.blockHash || receipt.blockNumber !== tx.blockNumber
    || typeof receipt.blockNumber !== 'string' || !/^0x[\da-f]+$/i.test(receipt.blockNumber)
    || tx.chainId !== '0x128' || receipt.to?.toString().toLowerCase() !== factoryAddress
    || receipt.from?.toString().toLowerCase() !== admin.toLowerCase()) throw new Error('Receipt or transaction source does not match NOVA.');
  const { factory } = await interfaces();
  const data = tx.input ?? tx.data;
  if (typeof data !== 'string') throw new Error('Missing deployment calldata.');
  const decoded = factory.decodeFunctionData('deployEquity', data);
  const version = Number(decoded[0].security.resolverProxyConfiguration.version);
  const calldata = await novaCalldata(admin, version);
  if (expectedVersion !== undefined && version !== expectedVersion) throw new Error('Deployment config differs from the saved review.');
  assertNovaTransaction({ from: tx.from, to: tx.to, data, value: tx.value, chainId: tx.chainId }, { admin, factory: factoryAddress, calldata });
  if (!Array.isArray(receipt.logs)) throw new Error('Missing deployment event.');
  const events = receipt.logs.filter(log => log?.address?.toLowerCase() === factoryAddress && log.removed !== true)
    .map(log => { try { return factory.parseLog({ topics: log.topics, data: log.data }); } catch { return null; } }).filter(event => event?.name === 'EquityDeployed');
  if (events.length !== 1) throw new Error('Expected exactly one Factory EquityDeployed event.');
  const event = events[0]!;
  if (event.args.deployer.toLowerCase() !== admin.toLowerCase()
    || factory.encodeFunctionData('deployEquity', [event.args.equityData, event.args.regulationData]).toLowerCase() !== calldata.toLowerCase()
    || !isAddress(event.args.equityAddress) || event.args.equityAddress.toLowerCase() === zeroAddress) throw new Error('Deployment event or asset parameters do not match.');
  return { address: event.args.equityAddress.toLowerCase() as string, version, calldata };
}

// Manual recovery never signs and never treats browser storage as chain evidence.
export async function recoverNova(transactionHash: string, admin: string, signal: AbortSignal, existing?: NovaRecord): Promise<NovaRecord> {
  if (!/^0x[\da-f]{64}$/i.test(transactionHash) || !isAddress(admin)) throw new Error('Enter a public transaction hash and bind Admin.');
  transactionHash = transactionHash.toLowerCase();
  if (existing?.transactionHash && existing.transactionHash.toLowerCase() !== transactionHash) throw new Error('A different NOVA hash is already recorded. Recover that operation first.');
  if (existing && existing.admin.toLowerCase() !== admin.toLowerCase()) throw new Error('Select the recorded Admin for recovery.');
  const lease = acquireOperation();
  try {
    const deployment = await checkDeployment(signal);
    if (deployment.status !== 'passed' || deployment.contracts[0].address?.toLowerCase() !== resolverAddress
      || deployment.contracts[1].address?.toLowerCase() !== factoryAddress) throw new Error('Pinned Testnet deployment could not be verified.');
    const tx = await rpc('eth_getTransactionByHash', [transactionHash], signal) as Record<string, unknown> | null;
    const receipt = await rpc('eth_getTransactionReceipt', [transactionHash], signal) as Record<string, unknown> | null;
    if (!tx || !receipt) {
      if (!existing) throw new Error('Transaction is not confirmed or not indexed. Check MetaMask and query again; do not create another.');
      return novaEvidence({ ...existing, status: existing.transactionHash ? 'pending' : 'unknown' });
    }
    let deployed: Awaited<ReturnType<typeof verifyNovaReceipt>>;
    try { deployed = await verifyNovaReceipt(transactionHash, admin, tx, receipt, existing?.configVersion); }
    catch {
      if (!existing?.transactionHash) throw new Error('This hash is not a verified NOVA deployment.');
      return novaEvidence({ ...existing, status: 'mismatch', comparisons: [{ field: 'Receipt, Factory event and approved parameters',
        expected: 'Successful exact NOVA deployment', actual: 'Verification failed', source: 'Testnet RPC', matches: false }] });
    }
    const record: NovaRecord = { schemaVersion: 1, kind: 'nova-create', chainId: 296, operationId: existing?.operationId ?? crypto.randomUUID(),
      startedAt: existing?.startedAt ?? new Date().toISOString(), admin, configVersion: deployed.version,
      calldataDigest: keccak256(deployed.calldata as Hex), status: 'confirmed', transactionHash, securityAddress: deployed.address,
      ...(existing?.credentialDigest ? { credentialDigest: existing.credentialDigest } : {}) };
    if (existing && existing.calldataDigest.toLowerCase() !== record.calldataDigest.toLowerCase()) throw new Error('Transaction does not match the saved operation digest.');
    const comparisons: Comparison[] = [];
    const compare = (field: string, expected: unknown, actual: unknown, source: string) => {
      const show = (value: unknown) => typeof value === 'string' && /^0x[\da-f]+$/i.test(value) ? value.toLowerCase() : String(value);
      comparisons.push({ field, expected: show(expected), actual: show(actual), source, matches: show(expected) === show(actual) });
    };
    compare('Successful Factory deployment', true, true, 'Receipt and EquityDeployed event');
    const fixed = novaParameters(admin, deployed.version);
    for (const field of ['votingRight', 'informationRight', 'liquidationRight', 'subscriptionRight', 'conversionRight', 'redemptionRight', 'putRight', 'dividendRight', 'regulationType', 'regulationSubType', 'isCountryControlListWhiteList', 'countries', 'info'] as const) {
      compare(field, fixed[field], fixed[field], 'EquityDeployed event (exact calldata comparison; not a current getter)');
    }
    record.comparisons = comparisons;
    try {
      const { asset } = await interfaces();
      const block = await rpc('eth_blockNumber', [], signal);
      if (typeof block !== 'string' || !/^0x[\da-f]+$/i.test(block)) throw new Error('Invalid block.');
      record.readBlock = BigInt(block).toString();
      const source = 'Current getter at block ' + record.readBlock;
      const code = await rpc('eth_getCode', [deployed.address, block], signal);
      compare('Deployed runtime bytecode', true, typeof code === 'string' && /^0x[\da-f]+$/i.test(code) && code.length > 2, source);
      const call = async (name: string, args: unknown[] = []) => asset.decodeFunctionResult(name,
        await rpc('eth_call', [{ to: deployed.address, data: asset.encodeFunctionData(name, args) }, block], signal) as string);
      const metadata = (await call('getERC20Metadata'))[0];
      for (const field of ['name', 'symbol', 'isin', 'decimals'] as const) compare(field, fixed[field], metadata.info[field], source);
      compare('Security type (Equity)', 1, metadata.securityType, source);
      const config = await call('getConfigInfo');
      compare('Resolver', resolverAddress, config[0], source); compare('Config ID', equityConfigId, config[1], source); compare('Config version', deployed.version, config[2], source);
      const getters: [string, string, unknown][] = [
        ['Total supply', 'totalSupply', 0], ['Cap', 'getMaxSupply', 1000], ['Controllable', 'isControllable', true],
        ['Internal KYC', 'isInternalKycActivated', true], ['Clearing', 'isClearingActivated', false], ['Multiple partitions', 'isMultiPartition', false],
        ['Protected partitions', 'arePartitionsProtected', false], ['ERC20 votes', 'isActivated', false], ['Whitelist mode', 'getControlListType', false],
        ['Blacklist count', 'getControlListCount', 0], ['External pause lists', 'getExternalPausesCount', 0],
        ['External control lists', 'getExternalControlListsCount', 0], ['External KYC lists', 'getExternalKycListsCount', 0],
        ['Compliance', 'compliance', zeroAddress], ['Identity registry', 'identityRegistry', zeroAddress], ['Paused', 'paused', false],
        ['Nominal value', 'getNominalValue', 1], ['Nominal decimals', 'getNominalValueDecimals', 0], ['Currency', 'getNominalValueCurrency', '0x555344'],
      ];
      // Keep this bounded and sequential to avoid a burst against public Testnet RPC.
      for (const [label, getter, expected] of getters) compare(label, expected, (await call(getter))[0], source);
      const issuable = (await call('isIssuable'))[0];
      if (typeof issuable !== 'boolean') throw new Error('Invalid issuance flag.');
      comparisons.push({ field: 'Issuance enabled', expected: 'Reported current flag (not a creation input)', actual: String(issuable), source, matches: true });
      compare('Admin default management role', true, (await call('hasRole', [adminRole, admin]))[0], source);
      const roleCount = Number((await call('getRoleCountFor', [admin]))[0]);
      if (!Number.isSafeInteger(roleCount) || roleCount < 1 || roleCount > 100) throw new Error('Unexpected Admin role count.');
      const roles = (await call('getRolesFor', [admin, 0, roleCount]))[0];
      compare('Admin roles include default management', true, roles.includes(adminRole), source);
      for (const [index, role] of [...roles].entries()) comparisons.push({ field: 'Admin role ID ' + (index + 1), expected: 'Reported current role ID', actual: role, source, matches: true });
    } catch {
      signal.throwIfAborted();
      return novaEvidence({ ...record, status: comparisons.some(row => !row.matches) ? 'mismatch' : 'confirmed' });
    }
    try {
      const [contract, result] = await Promise.all([mirror('contracts/' + deployed.address, signal), mirror('contracts/results/' + transactionHash, signal)]);
      if (!contract || !result) return novaEvidence({ ...record, status: comparisons.some(row => !row.matches) ? 'mismatch' : 'mirror-pending' });
      compare('Mirror security EVM address', deployed.address, contract.evm_address, 'Mirror contract record');
      compare('Mirror security active', false, contract.deleted, 'Mirror contract record');
      compare('Mirror security ID format', true, /^0\.0\.[1-9]\d*$/.test(contract.contract_id), 'Mirror contract record');
      compare('Mirror transaction hash', transactionHash, result.hash, 'Mirror contract result');
      compare('Mirror transaction sender', admin, result.from, 'Mirror contract result');
      compare('Mirror transaction target', factoryAddress, result.to, 'Mirror contract result');
      compare('Mirror transaction success', 'SUCCESS', result.result, 'Mirror contract result');
      compare('Mirror calldata', true, result.function_parameters?.toLowerCase() === deployed.calldata.toLowerCase(), 'Mirror contract result');
      compare('Mirror transferred value', 0, result.amount, 'Mirror contract result');
      compare('Mirror consensus timestamp format', true, /^\d+\.\d{9}$/.test(result.timestamp), 'Mirror contract result');
      if (comparisons.some(row => !row.matches)) return novaEvidence({ ...record, status: 'mismatch' });
      record.securityId = contract.contract_id; record.consensusTimestamp = result.timestamp;
      const transactions = await mirror('transactions?timestamp=eq:' + result.timestamp + '&limit=10', signal);
      const matching = transactions?.transactions?.filter((tx: { consensus_timestamp?: string; result?: string }) => tx.consensus_timestamp === result.timestamp && tx.result === 'SUCCESS');
      if (!matching || matching.length !== 1 || !/^0\.0\.[1-9]\d*-\d+-\d+$/.test(matching[0].transaction_id)) return novaEvidence({ ...record, status: 'mirror-pending' });
      record.transactionId = matching[0].transaction_id;
    } catch {
      signal.throwIfAborted(); return novaEvidence({ ...record, status: comparisons.some(row => !row.matches) ? 'mismatch' : 'mirror-pending' });
    }
    return novaEvidence({ ...record, status: comparisons.every(row => row.matches) ? 'complete' : 'mismatch' });
  } finally { releaseOperation(lease); }
}

// One owned provider pair for the unchanged SDK create path; reads stay on fixed Testnet RPC.
export async function createNovaProviders(review: NovaReview, record: NovaRecord, update: (record: NovaRecord) => void,
  checkCurrent: () => Promise<void>, signal: AbortSignal) {
  const ethers = await import('ethers'), { asset } = await interfaces();
  const controller = new AbortController(), combined = AbortSignal.any([signal, controller.signal]);
  let attempted = false, closed = false, hash: string | undefined, readAsset: string | undefined, deadline = Infinity;
  const publish = (next: NovaRecord) => { record = novaEvidence(next); update(record); };
  const query = async (method: string, params: unknown[]) => {
    combined.throwIfAborted();
    if (closed) throw new Error('NOVA provider is closed.');
    if (method === 'eth_chainId') { if (params.length) throw new Error('Unexpected chain parameters.'); return rpc(method, [], combined); }
    if (method === 'eth_blockNumber') { if (params.length) throw new Error('Unexpected block parameters.'); return rpc(method, [], combined); }
    if (method === 'eth_getTransactionByHash' || method === 'eth_getTransactionReceipt') {
      if (!hash || params.length !== 1 || params[0] !== hash) throw new Error('Unapproved transaction lookup.');
      // Bounded confirmation polling returns the real receipt or rejects before SDK wait listeners begin.
      while (Date.now() < deadline) {
        const result = await rpc(method, params, combined);
        if (result !== null) {
          if (method === 'eth_getTransactionReceipt') {
            const tx = await rpc('eth_getTransactionByHash', [hash], combined) as Record<string, unknown>;
            const verified = await verifyNovaReceipt(hash, review.wallet.roles.Admin, tx, result as Record<string, unknown>, review.configVersion);
            readAsset = verified.address; publish({ ...record, status: 'confirmed', securityAddress: readAsset });
          }
          return result;
        }
        await new Promise<void>((resolve, reject) => {
          const abort = () => { clearTimeout(timer); reject(new Error('Confirmation interrupted.')); };
          const timer = setTimeout(() => { combined.removeEventListener('abort', abort); resolve(); }, 2000);
          combined.addEventListener('abort', abort, { once: true });
        });
        combined.throwIfAborted();
      }
      throw new Error('Confirmation timed out. Query the recorded hash; never resubmit.');
    }
    if (method === 'eth_call') {
      const tx = params[0] as { to?: string; data?: string };
      if (!readAsset || params.length !== 2 || params[1] !== 'latest' || !tx || Object.keys(tx).sort().join(',') !== 'data,to'
        || tx.to?.toLowerCase() !== readAsset || typeof tx.data !== 'string') throw new Error('Unapproved SDK read.');
      const approved = ['getERC20Metadata', 'totalSupply', 'getMaxSupply', 'getControlListType', 'isActivated', 'isControllable',
        'arePartitionsProtected', 'isClearingActivated', 'isInternalKycActivated', 'isMultiPartition', 'isIssuable', 'paused'];
      if (!approved.some(name => asset.encodeFunctionData(name, []) === tx.data)) throw new Error('Unapproved SDK getter.');
      return rpc(method, params, combined);
    }
    throw new Error('Unapproved NOVA provider method.');
  };
  const browser = new ethers.BrowserProvider({ request: async ({ method, params: parameters }) => {
    if (parameters !== undefined && !Array.isArray(parameters)) throw new Error('Unexpected provider parameters.');
    const params: unknown[] = parameters ?? [];
    if (method === 'eth_accounts') { await checkCurrent(); return [getAddress(review.wallet.roles.Admin)]; }
    if (method !== 'eth_sendTransaction') return query(method, params);
    combined.throwIfAborted();
    if (closed || attempted || params.length !== 1) throw new Error('A NOVA transaction was already requested.');
    await checkCurrent();
    combined.throwIfAborted();
    if (closed || attempted) throw new Error('A NOVA transaction was already requested.');
    assertNovaTransaction(params[0], { admin: review.wallet.roles.Admin, factory: factoryAddress, calldata: review.calldata });
    // Persist the public intent before forwarding exactly one approved deployEquity request.
    publish({ ...record, status: 'awaiting-signature' });
    attempted = true;
    try {
      const result = await review.wallet.provider.request({ method, params });
      if (typeof result !== 'string' || !/^0x[\da-f]{64}$/i.test(result)) throw new Error('Missing transaction hash.');
      hash = result.toLowerCase(); deadline = Date.now() + 60_000;
      publish({ ...record, status: 'pending', transactionHash: hash });
      return hash;
    } catch (error) {
      const rejected = error && typeof error === 'object' && 'code' in error && error.code === 4001 && !hash;
      publish({ ...record, status: rejected ? 'rejected' : 'unknown' });
      throw new Error(rejected ? 'Transaction rejected. No transaction hash exists.' : 'Transaction result unknown. Check MetaMask and recover; do not resubmit.');
    }
  } }, 296, { staticNetwork: true, cacheTimeout: -1 });
  browser.disableCcipRead = true;
  // ethers' signer retries ordinary lookup errors indefinitely after sending. Stop that
  // loop on this owned provider when our bounded lookup fails; retain the saved hash.
  const getTransaction = browser.getTransaction.bind(browser);
  browser.getTransaction = async hash => {
    try { return await getTransaction(hash); }
    catch { throw ethers.makeError('Transaction lookup stopped. Recover the saved hash.', 'CANCELLED'); }
  };
  const request = new ethers.FetchRequest(rpcUrl);
  request.timeout = 10_000; request.retryFunc = async () => false; request.setThrottleParams({ maxAttempts: 1 });
  request.getUrlFunc = async req => {
    if (req.url !== rpcUrl || req.method !== 'POST' || req.credentials) throw new Error('Unapproved SDK transport.');
    const payload = JSON.parse(new TextDecoder().decode(req.body!));
    const result = await query(payload.method, payload.params);
    return { statusCode: 200, statusMessage: 'OK', headers: {}, body: new TextEncoder().encode(JSON.stringify({ jsonrpc: '2.0', id: payload.id, result })) };
  };
  const read = new ethers.JsonRpcProvider(request, 296, { staticNetwork: true, batchMaxCount: 1, cacheTimeout: -1 }); read.disableCcipRead = true;
  return { browser, read, getRecord: () => record, wasAttempted: () => attempted,
    close() { closed = true; controller.abort(); browser.destroy(); read.destroy(); } };
}

export async function createNova(review: NovaReview, prepared: PreparedCredential, credential: SignedCredential,
  t01Accepted: boolean, update: (record: NovaRecord) => void): Promise<{ review?: NovaReview; record?: NovaRecord }> {
  if (!isCreationOrigin(window.location.origin, import.meta.env.PROD)) throw new Error('Create NOVA only in production preview at http://127.0.0.1:4173.');
  if (!t01Accepted) throw new Error('Complete every retained T01 human check before creation.');
  const outcome = await withNovaLock(navigator.locks, async () => {
    const lease = acquireOperation(), controller = new AbortController();
    let providers: Awaited<ReturnType<typeof createNovaProviders>> | undefined, connected = false, record: NovaRecord | undefined;
    const persist = (next: NovaRecord) => { record = novaEvidence(next); try { saveNovaRecord(record); } finally { update(record); } };
    try {
      if (!canCreateNova(loadNovaRecord())) throw new Error('A NOVA operation already exists. Recover it; do not create another.');
      await checkWalletReview(review.wallet);
      if (!(await verifySellerCredential(credential, prepared)).verified
        || prepared.payload.issuer !== 'did:ethr:' + getAddress(review.wallet.roles.Admin)
        || prepared.payload.credentialSubject.id !== 'did:ethr:' + getAddress(review.wallet.roles.Seller)) throw new Error('Verify a current Admin-signed Seller credential before creation.');
      const fresh = await reviewNova(review.wallet.roles, controller.signal, lease);
      if (fresh.digest !== review.digest || JSON.stringify(fresh.wallet.accounts) !== JSON.stringify(review.wallet.accounts)) return { review: fresh };
      persist({ schemaVersion: 1, kind: 'nova-create', chainId: 296, operationId: crypto.randomUUID(), startedAt: new Date().toISOString(),
        admin: fresh.wallet.roles.Admin, configVersion: fresh.configVersion, calldataDigest: fresh.digest, credentialDigest: prepared.digest, status: 'awaiting-signature' });
      const checkCurrent = async () => {
        await checkWalletReview(fresh.wallet);
        if (!(await verifySellerCredential(credential, prepared)).verified) throw new Error('Seller credential expired or changed.');
        if (getWalletSession() !== fresh.wallet.session) throw new Error('Session changed. Review again.');
      };
      providers = await createNovaProviders(fresh, record!, persist, checkCurrent, controller.signal);
      const sdk = await import('@hashgraph/asset-tokenization-sdk');
      await sdk.Network.connect(new sdk.ConnectRequest({ network: 'testnet', wallet: sdk.SupportedWallets.METAMASK,
        account: { accountId: fresh.wallet.accounts[0].accountId, evmAddress: fresh.wallet.roles.Admin },
        mirrorNode: { baseUrl: mirrorUrl }, rpcNode: { baseUrl: rpcUrl, queryProvider: providers.read },
      }), { provider: providers.browser }); connected = true;
      await sdk.Network.setConfig(new sdk.SetConfigurationRequest({ factoryAddress: deployments[1].id, resolverAddress: deployments[0].id }));
      await checkCurrent();
      await sdk.Equity.create(new sdk.CreateEquityRequest(novaParameters(fresh.wallet.roles.Admin, fresh.configVersion)));
      // SDK completion alone is not accepted as chain evidence. Recovery performs independent readback.
      return { record };
    } catch {
      if (!record) throw new Error('NOVA preflight did not complete. Recheck Admin, VC, deployment and config; review again.');
      const latest = providers?.getRecord() ?? record;
      const next = { ...latest, status: latest.status === 'rejected' ? 'rejected' as const
        : latest.securityAddress ? 'confirmed' as const : providers?.wasAttempted() ? 'unknown' as const : 'mismatch' as const };
      try { persist(next); } catch { update(next); }
      return { record: next };
    } finally {
      if (connected) { try { const sdk = await import('@hashgraph/asset-tokenization-sdk'); await sdk.Network.disconnect(); } catch { /* Owned providers are still released below. */ } }
      providers?.close(); controller.abort(); releaseOperation(lease);
    }
  });
  if (outcome.record?.transactionHash) {
    try {
      const recovered = await recoverNova(outcome.record.transactionHash, outcome.record.admin, new AbortController().signal, outcome.record);
      try { saveNovaRecord(recovered); } finally { update(recovered); }
      return { record: recovered };
    } catch { return outcome; }
  }
  return outcome;
}

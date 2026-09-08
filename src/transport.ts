import { getAddress } from 'viem';
import { rpc, assertNovaTransaction } from './nova';
import { rpcUrl } from './deployment';
import type { WalletProvider } from './credentials';
import type { SettlementTransportRecord } from './settlement';
import type { LifecycleRecord, HoldTransaction, TradeTransaction } from './evidence';

// Owned provider pair for the fixed T03–T05 paths; wallet mutations are guarded below.
export async function createAssetProviders<T extends LifecycleRecord | HoldTransaction | TradeTransaction | SettlementTransportRecord>(options: {
  wallet: { provider: WalletProvider }; signer: string; securityAddress: string; calldata?: string; reads: string[];
  initial: T; sanitize: (record: T) => T; update: (record: T) => void;
  checkCurrent: (mutation?: boolean) => Promise<void>; signal: AbortSignal; recoverAfterHash?: boolean; readOnly?: boolean; readBlock?: string;
  verifyReceipt: (record: T, tx: Record<string, unknown>, receipt: Record<string, unknown>) => Promise<unknown>;
  assertContractTransaction?: (tx: unknown) => void;
}) {
  const ethers = await import('ethers');
  const controller = new AbortController(), combined = AbortSignal.any([options.signal, controller.signal]);
  let record = options.initial, attempted = false, sending = false, closed = false, hash: string | undefined, deadline = Infinity;
  const publish = (next: T) => { record = options.sanitize(next); options.update(record); };
  const query = async (method: string, params: unknown[]): Promise<unknown> => {
    combined.throwIfAborted(); if (closed) throw new Error('Asset provider closed.');
    if (method === 'eth_chainId' || method === 'eth_blockNumber') { if (params.length) throw new Error('Unexpected parameters.'); return rpc(method, [], combined); }
    if (method === 'eth_call') {
      const tx = params[0] as { to?: string; data?: string };
      if (params.length !== 2 || params[1] !== 'latest' || !tx || Object.keys(tx).sort().join(',') !== 'data,to'
        || tx.to?.toLowerCase() !== options.securityAddress || !options.reads.includes(tx.data ?? '')) throw new Error('Unapproved asset SDK read.');
      return rpc(method, options.readBlock ? [params[0], options.readBlock] : params, combined);
    }
    if (method === 'eth_getTransactionByHash' || method === 'eth_getTransactionReceipt') {
      if (options.recoverAfterHash) throw new Error('Hash saved. Continue with the single full recovery.');
      if (!hash || params.length !== 1 || params[0] !== hash) throw new Error('Unapproved transaction lookup.');
      while (Date.now() < deadline) {
        const result = await rpc(method, params, combined);
        if (result !== null) {
          if (method === 'eth_getTransactionReceipt') {
            const tx = await rpc('eth_getTransactionByHash', [hash], combined) as Record<string, unknown>;
            await options.verifyReceipt(record, tx, result as Record<string, unknown>);
            publish({ ...record, status: 'confirmed' });
          }
          return result;
        }
        await new Promise<void>(resolve => setTimeout(resolve, 1000)); combined.throwIfAborted();
      }
      throw new Error('Confirmation timed out. Recover the saved hash.');
    }
    throw new Error('Unapproved Asset provider method.');
  };
  const browser = new ethers.BrowserProvider({ request: async ({ method, params: parameters }) => {
    if (parameters !== undefined && !Array.isArray(parameters)) throw new Error('Unexpected parameters.');
    const params = parameters ?? [];
    if (method === 'eth_accounts') { combined.throwIfAborted(); await options.checkCurrent(); return [getAddress(options.signer)]; }
    if (method !== 'eth_sendTransaction') return query(method, params);
    combined.throwIfAborted();
    if (options.readOnly) throw new Error('Read-only simulation forbids transactions and signatures.');
    if (closed || sending || attempted || params.length !== 1 || !options.calldata) throw new Error('Asset operation already requested.');
    sending = true;
    try {
      await options.checkCurrent(true); combined.throwIfAborted();
      if (record.kind === 't08-transaction' || record.kind === 't05-transaction' && record.action !== 'lock') {
        if (!options.assertContractTransaction) throw new Error('Missing exact contract transaction guard.');
        options.assertContractTransaction(params[0]);
      } else assertNovaTransaction(params[0], { admin: options.signer, factory: options.securityAddress, calldata: options.calldata });
      publish({ ...record, status: 'awaiting-signature' }); attempted = true;
      try {
        const result = await options.wallet.provider.request({ method, params });
        if (typeof result !== 'string' || !/^0x[\da-f]{64}$/i.test(result)) throw new Error('Missing hash.');
        hash = result.toLowerCase(); deadline = Date.now() + 60_000;
        // Retain a late hash even if the wallet session changed while MetaMask was open.
        publish({ ...record, transactionHash: hash, status: 'pending' }); return hash;
      } catch (error) {
        const rejected = !hash && error && typeof error === 'object' && 'code' in error && error.code === 4001;
        publish({ ...record, status: rejected ? 'rejected' : 'unknown' });
        throw new Error(rejected ? 'Rejected; no transaction hash exists.' : 'Unknown result. Check MetaMask and recover; do not retry.');
      }
    } finally { sending = false; }
  } }, 296, { staticNetwork: true, cacheTimeout: -1 });
  browser.disableCcipRead = true;
  const getTransaction = browser.getTransaction.bind(browser);
  browser.getTransaction = async hash => { try { return await getTransaction(hash); } catch { throw ethers.makeError('Recover saved transaction.', 'CANCELLED'); } };
  const request = new ethers.FetchRequest(rpcUrl);
  request.timeout = 10_000; request.retryFunc = async () => false; request.setThrottleParams({ maxAttempts: 1 });
  request.getUrlFunc = async req => {
    if (req.url !== rpcUrl || req.method !== 'POST' || req.credentials) throw new Error('Unapproved transport.');
    const payload = JSON.parse(new TextDecoder().decode(req.body!));
    const result = await query(payload.method, payload.params);
    return { statusCode: 200, statusMessage: 'OK', headers: {}, body: new TextEncoder().encode(JSON.stringify({ jsonrpc: '2.0', id: payload.id, result })) };
  };
  const read = new ethers.JsonRpcProvider(request, 296, { staticNetwork: true, batchMaxCount: 1, cacheTimeout: -1 }); read.disableCcipRead = true;
  return { browser, read, getRecord: () => record, wasAttempted: () => attempted,
    close() { closed = true; controller.abort(); browser.destroy(); read.destroy(); } };
}

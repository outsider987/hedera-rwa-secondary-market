import { QueryClient } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { hederaTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { assertSession, isAddress, roleNames, validateMirrorAccount, type Roles, type Role } from './guards';
import type { WalletProvider } from './credentials';

export const testnetChainId = 296;
export const walletConfig = createConfig({
  chains: [hederaTestnet],
  connectors: [injected({ shimDisconnect: false })],
  multiInjectedProviderDiscovery: false,
  storage: null,
  transports: { [testnetChainId]: http('https://testnet.hashio.io/api') },
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, gcTime: 0, staleTime: Infinity,
      refetchInterval: false, refetchOnWindowFocus: false, refetchOnReconnect: false,
      networkMode: 'always',
    },
    mutations: { retry: false },
  },
});

// Advance on every wallet transition, including A → B → A before React renders.
let session = 0;
const sessionListeners = new Set<() => void>();
export function invalidateWalletSession() {
  session++;
  queryClient.removeQueries({ queryKey: ['mirror'] });
  sessionListeners.forEach(notify => notify());
}
walletConfig.subscribe(state => {
  const connection = state.current ? state.connections.get(state.current) : undefined;
  return `${state.status}/${state.current}/${connection?.accounts[0]}/${connection?.chainId}`;
}, invalidateWalletSession);
export const getWalletSession = () => session;
export const subscribeWalletSession = (notify: () => void) => {
  sessionListeners.add(notify); return () => { sessionListeners.delete(notify); };
};

export type WalletReview = { session: number; expectedRole: Role; roles: Record<typeof roleNames[number], string>;
  accounts: { address: string; accountId: string }[]; provider: WalletProvider };
export async function reviewWallet(roles: Roles, signal: AbortSignal, expectedRole: Role = 'Admin'): Promise<WalletReview> {
  const current = session;
  const addresses = roleNames.map(role => roles[role]?.toLowerCase());
  if (!addresses.every(isAddress) || new Set(addresses).size !== 3) throw new Error('Bind three distinct accounts first.');
  const connection = walletConfig.state.current ? walletConfig.state.connections.get(walletConfig.state.current) : undefined;
  if (!connection || walletConfig.state.status !== 'connected') throw new Error(`Connect ${expectedRole} in MetaMask first.`);
  const provider = await connection.connector.getProvider() as WalletProvider & { isMetaMask?: boolean };
  if (!provider?.isMetaMask) throw new Error('Use desktop Chrome with MetaMask.');
  const accounts = await Promise.all((addresses as string[]).map(address => lookupAccount(address, signal)));
  signal.throwIfAborted();
  if (new Set(accounts.map(account => account.accountId)).size !== 3) throw new Error('Roles must have three distinct Hedera IDs.');
  const review = { session: current, expectedRole, roles: Object.fromEntries(roleNames.map((role, i) => [role, addresses[i]])) as WalletReview['roles'], accounts, provider };
  await checkWalletReview(review);
  return review;
}
export async function checkWalletReview(review: WalletReview) {
  assertSession(review.session, session);
  if (!roleNames.includes(review.expectedRole)) throw new Error('Invalid expected signer role.');
  const signer = review.roles[review.expectedRole];
  const state = walletConfig.state;
  const connection = state.current ? state.connections.get(state.current) : undefined;
  if (state.status !== 'connected' || connection?.chainId !== 296
    || connection.accounts[0]?.toLowerCase() !== signer) throw new Error(`Select ${review.expectedRole} on Hedera Testnet (296) in MetaMask.`);
  const accounts = await review.provider.request({ method: 'eth_accounts' });
  const chain = await review.provider.request({ method: 'eth_chainId' });
  assertSession(review.session, session);
  if (chain !== '0x128' || !Array.isArray(accounts) || typeof accounts[0] !== 'string'
    || accounts[0].toLowerCase() !== signer) throw new Error('Wallet account or network changed. Prepare and review again.');
}

export async function lookupAccount(address: string, signal: AbortSignal) {
  if (!isAddress(address)) throw new Error('Invalid EVM address. Reconnect the wallet.');
  const timeout = AbortSignal.timeout(10_000);
  let value: unknown;
  try {
    const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${address.toLowerCase()}?limit=1`, {
      signal: AbortSignal.any([signal, timeout]), credentials: 'omit',
      cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer',
    });
    if (!response.ok) {
      throw new Error();
    }
    value = await response.json();
  } catch {
    if (timeout.aborted) throw new Error('Mirror lookup timed out after 10 seconds. Retry when ready.');
    throw new Error('Mirror lookup could not complete. The account may not be indexed yet. Retry when ready.');
  }
  signal.throwIfAborted();
  return validateMirrorAccount(address, value);
}

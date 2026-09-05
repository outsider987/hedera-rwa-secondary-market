import { QueryClient } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { hederaTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { isAddress, validateMirrorAccount } from './guards';

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
walletConfig.subscribe(state => {
  const connection = state.current ? state.connections.get(state.current) : undefined;
  return `${state.status}/${state.current}/${connection?.accounts[0]}/${connection?.chainId}`;
}, () => {
  session++;
  queryClient.removeQueries({ queryKey: ['mirror'] });
});
export const getWalletSession = () => session;
export const subscribeWalletSession = (notify: () => void) => walletConfig.subscribe(state => state, () => notify());

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

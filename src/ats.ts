import { checkDeployment, equityConfigCalldata, equityConfigId, mirrorUrl, rpcUrl, type DeploymentCheck } from './deployment';

export type AtsLoadState = 'idle' | 'loading' | 'loaded' | 'failed';

let attempt: Promise<'loaded' | 'failed'> | undefined;

export function loadAts(): Promise<'loaded' | 'failed'> {
  attempt ??= import('@hashgraph/asset-tokenization-sdk')
    .then((sdk): 'loaded' | 'failed' =>
      typeof sdk.Management?.resolveLatestConfigVersion === 'function' ? 'loaded' : 'failed',
    )
    .catch(() => 'failed' as const);
  return attempt;
}


export type SdkConfigCheck = {
  status: 'passed' | 'failed'; message: string; payload?: number;
  deployment?: DeploymentCheck;
};
let prepared: { sdk: typeof import('@hashgraph/asset-tokenization-sdk'); ethers: typeof import('ethers') } | undefined;
let preparation: Promise<'loaded' | 'failed'> | undefined;
// ponytail: the SDK owns global network state; serialize reads until upstream supports isolated clients.
let reading = false;

export function prepareAts(): Promise<'loaded' | 'failed'> {
  preparation ??= Promise.all([import('@hashgraph/asset-tokenization-sdk'), import('ethers')])
    .then(([sdk, ethers]): 'loaded' => {
      const request = new sdk.SetNetworkRequest({ environment: 'testnet', mirrorNode: { baseUrl: mirrorUrl }, rpcNode: { baseUrl: rpcUrl } });
      if (request.validate().length || typeof sdk.Network.setNetwork !== 'function'
        || typeof sdk.Management.resolveLatestConfigVersion !== 'function') throw new Error();
      prepared = { sdk, ethers };
      return 'loaded';
    }).catch(() => { preparation = undefined; return 'failed' as const; });
  return preparation;
}

export async function checkSdkConfig(signal: AbortSignal): Promise<SdkConfigCheck> {
  signal.throwIfAborted();
  if (reading) throw new Error('An SDK config check is already pending.');
  if (!prepared) throw new Error('Prepare ATS SDK before checking config.');
  const deadline = AbortSignal.timeout(10_000), controller = new AbortController();
  const combined = AbortSignal.any([signal, controller.signal, deadline]);
  const { sdk, ethers } = prepared;
  let provider: import('ethers').JsonRpcProvider | undefined, deployment: DeploymentCheck | undefined;
  reading = true;
  try {
    deployment = await checkDeployment(signal, deadline);
    combined.throwIfAborted();
    const resolver = deployment.contracts[0].address;
    if (deployment.status !== 'passed' || deployment.chainId !== 296 || !resolver) {
      return { status: 'failed', message: 'SDK check not run. Verify the deployment and on-chain config first.', deployment };
    }
    const request = new ethers.FetchRequest(rpcUrl);
    request.timeout = 10_000;
    request.retryFunc = async () => false;
    request.setThrottleParams({ maxAttempts: 1 });
    request.getUrlFunc = async req => {
      combined.throwIfAborted();
      if (req.url !== rpcUrl || req.method !== 'POST' || req.credentials) throw new Error('Unapproved transport.');
      const rpc = JSON.parse(new TextDecoder().decode(req.body!));
      const tx = rpc.params?.[0];
      if (rpc.method !== 'eth_call' || rpc.params.length !== 2 || rpc.params[1] !== 'latest'
        || tx.to?.toLowerCase() !== resolver.toLowerCase() || tx.data !== equityConfigCalldata
        || Object.keys(tx).sort().join(',') !== 'data,to') throw new Error('Unapproved RPC.');
      const response = await fetch(rpcUrl, { method: 'POST', body: req.body as Uint8Array<ArrayBuffer>,
        headers: { 'content-type': 'application/json' }, signal: combined,
        credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer' });
      const body = new Uint8Array(await response.arrayBuffer());
      combined.throwIfAborted();
      return { statusCode: response.status, statusMessage: response.statusText, headers: Object.fromEntries(response.headers), body };
    };
    // Chain 296 was freshly verified above; prevent automatic network discovery.
    provider = new ethers.JsonRpcProvider(request, 296, { staticNetwork: true, batchMaxCount: 1, cacheTimeout: -1 });
    provider.disableCcipRead = true;
    await sdk.Network.setNetwork(new sdk.SetNetworkRequest({ environment: 'testnet',
      mirrorNode: { baseUrl: mirrorUrl }, rpcNode: { baseUrl: rpcUrl, queryProvider: provider },
    }));
    combined.throwIfAborted();
    const result = await sdk.Management.resolveLatestConfigVersion(new sdk.ResolveLatestConfigVersionRequest({
      resolverAddress: resolver, configurationId: equityConfigId,
    }));
    combined.throwIfAborted();
    if (!Number.isSafeInteger(result.payload) || result.payload < 1) {
      return { status: 'failed', message: 'SDK returned an invalid config version. Expected a safe integer of at least 1.', deployment };
    }
    return { status: 'passed', message: 'SDK config verified.', payload: result.payload, deployment };
  } catch {
    signal.throwIfAborted();
    return { status: 'failed', message: deadline.aborted ? 'SDK config check timed out after 10 seconds. Retry when ready.'
      : 'SDK config check could not complete. The deployment may be incompatible or the RPC unavailable. Retry when ready.', deployment };
  } finally {
    controller.abort();
    provider?.destroy();
    reading = false;
  }
}

import { createClient, http, type Address } from 'viem';
import { getChainId, getCode, readContract } from 'viem/actions';

export const equityConfigId = '0x0000000000000000000000000000000000000000000000000000000000000001';
// ATS contracts 8.0.0 DiamondCutManager ABI (Apache-2.0); no SDK module import.
const configAbi = [{ type: 'function', name: 'getLatestVersionByConfiguration', stateMutability: 'view',
  inputs: [{ name: '_configurationId', type: 'bytes32' }], outputs: [{ name: 'latestVersion_', type: 'uint256' }],
}] as const;

export const deployments = [
  { name: 'Resolver', id: '0.0.9212226' },
  { name: 'Factory', id: '0.0.9213391' },
] as const;

type ContractCheck = {
  name: string; id: string; address?: Address; byteLength?: number;
  status: 'not-checked' | 'passed' | 'failed'; message: string;
};
export type DeploymentCheck = {
  chainId?: number; checkedAt: string; status: 'passed' | 'failed';
  message: string; contracts: ContractCheck[];
  config: { id: string; version?: string; status: 'not-checked' | 'passed' | 'failed'; message: string };
};

export function validateContract(id: string, value: unknown): Address {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid Mirror contract record.');
  const record = value as Record<string, unknown>;
  if (record.contract_id !== id || record.deleted !== false || typeof record.evm_address !== 'string'
    || !/^(?:0x)?[\da-fA-F]{40}$/.test(record.evm_address) || record.evm_address !== record.evm_address.trim()) {
    throw new Error('Invalid Mirror contract record.');
  }
  const address = `0x${record.evm_address.replace(/^0x/, '').toLowerCase()}` as Address;
  if (address === `0x${'0'.repeat(40)}`) throw new Error('Invalid Mirror contract address.');
  return address;
}

export async function checkDeployment(signal: AbortSignal): Promise<DeploymentCheck> {
  signal.throwIfAborted();
  const deadline = AbortSignal.timeout(10_000);
  const combined = AbortSignal.any([signal, deadline]);
  const fetchOptions: RequestInit = {
    signal: combined, credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer',
  };
  const client = createClient({ ccipRead: false, transport: http('https://testnet.hashio.io/api', {
    retryCount: 0, timeout: 10_000, fetchOptions,
    methods: { include: ['eth_chainId', 'eth_getCode', 'eth_call'] },
  }) });
  const contracts: ContractCheck[] = deployments.map(item => ({ ...item, status: 'not-checked', message: 'Not checked.' }));
  const result: DeploymentCheck = { checkedAt: '', status: 'failed', message: '', contracts,
    config: { id: equityConfigId, status: 'not-checked', message: 'Config not checked. Verify the Resolver first.' },
  };
  function failed(message: string) {
    signal.throwIfAborted();
    return deadline.aborted ? 'Deployment check timed out after 10 seconds. Retry when ready.' : message;
  }
  function finish() {
    signal.throwIfAborted();
    result.checkedAt = new Date().toISOString();
    return result;
  }
  try {
    const chainId = await getChainId(client);
    combined.throwIfAborted();
    if (!Number.isSafeInteger(chainId) || chainId < 0) throw new Error();
    result.chainId = chainId;
  } catch {
    result.message = failed('RPC network check could not complete. Retry when ready.');
    return finish();
  }
  if (result.chainId !== 296) {
    result.message = 'Wrong RPC network. Expected Hedera Testnet (296 / 0x128).';
    return finish();
  }

  await Promise.all(contracts.map(async contract => {
    let value: unknown;
    try {
      combined.throwIfAborted();
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/contracts/${contract.id}`, { ...fetchOptions, method: 'GET' });
      if (!response.ok) throw new Error();
      value = await response.json();
      combined.throwIfAborted();
    } catch {
      contract.status = 'failed';
      contract.message = failed('Mirror lookup could not complete. The contract may not be indexed yet. Retry when ready.');
      return;
    }
    try {
      contract.address = validateContract(contract.id, value);
    } catch {
      contract.status = 'failed';
      contract.message = 'Invalid Mirror contract record: expected a matching ID, live contract and nonzero EVM address.';
    }
  }));
  if (contracts[0].address && contracts[0].address === contracts[1].address) {
    for (const contract of contracts) {
      contract.status = 'failed';
      contract.message = 'Resolver and Factory returned the same EVM address. Deployment check stopped.';
    }
  }
  await Promise.all(contracts.map(async contract => {
    if (!contract.address || contract.status === 'failed') return;
    try {
      combined.throwIfAborted();
      const code = await getCode(client, { address: contract.address, blockTag: 'latest' });
      combined.throwIfAborted();
      if (code === undefined || code === '0x') {
        contract.status = 'failed';
        contract.message = 'No runtime bytecode at this address.';
      } else if (typeof code !== 'string' || !/^0x(?:[\da-fA-F]{2})+$/.test(code) || code !== code.trim()) {
        contract.status = 'failed';
        contract.message = 'RPC returned invalid runtime bytecode.';
      } else {
        contract.byteLength = (code.length - 2) / 2;
        contract.status = 'passed';
        contract.message = 'Runtime bytecode found.';
      }
    } catch {
      contract.status = 'failed';
      contract.message = failed('RPC bytecode lookup could not complete. Retry when ready.');
    }
  }));
  const resolver = contracts[0];
  if (resolver.status === 'passed' && resolver.address) {
    result.config.status = 'failed';
    try {
      combined.throwIfAborted();
      const version = await readContract(client, { address: resolver.address, abi: configAbi,
        functionName: 'getLatestVersionByConfiguration', args: [equityConfigId], blockTag: 'latest',
      });
      combined.throwIfAborted();
      result.config.version = version.toString();
      if (version === 0n) result.config.message = 'No registered Equity config version.';
      else if (version > BigInt(Number.MAX_SAFE_INTEGER)) result.config.message = 'Config version exceeds the safe SDK integer range.';
      else {
        result.config.status = 'passed';
        result.config.message = 'On-chain Equity config verified.';
      }
    } catch {
      result.config.message = failed('Config lookup could not complete. The deployment may be incompatible or the RPC unavailable. Retry when ready.');
    }
  }
  result.status = contracts.every(contract => contract.status === 'passed') && result.config.status === 'passed' ? 'passed' : 'failed';
  result.message = result.status === 'passed' ? 'Deployment and config verified.' : 'Deployment and config check failed.';
  return finish();
}

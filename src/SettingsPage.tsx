import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { acquireOperation, getOperationBusy, releaseOperation, subscribeOperation, bindingProblem, roleNames, type MirrorAccount, type Roles } from './guards';
import { getWalletSession, lookupAccount, queryClient, subscribeWalletSession } from './wallet';
import { checkDeployment, deployments, equityConfigId } from './deployment';
import { checkSdkConfig, prepareAts, type AtsLoadState, type SdkConfigCheck } from './ats';
import { securityAddress } from './lifecycle';

function Deployment() {
  const operation = useRef(false);
  const controller = useRef<AbortController | undefined>(undefined);
  const epoch = useRef(0), mounted = useRef(true), sdkAttempted = useRef(false);
  const [sdkLoad, setSdkLoad] = useState<AtsLoadState>('idle');
  const [sdkReading, setSdkReading] = useState(false);
  const [sdkResult, setSdkResult] = useState<SdkConfigCheck>();
  const [sdkMessage, setSdkMessage] = useState('SDK not prepared.');
  const query = useQuery({ queryKey: ['deployment'], queryFn: ({ signal }) => checkDeployment(signal), enabled: false });
  const result = query.isSuccess && !query.isFetching && !sdkReading ? query.data : undefined;
  const checking = query.isFetching || sdkReading;
  const locked = useSyncExternalStore(subscribeOperation, getOperationBusy, () => false);
  const busy = checking || sdkLoad === 'loading' || locked;

  function invalidateSdk(message: string) {
    epoch.current++;
    controller.current?.abort();
    setSdkResult(undefined);
    setSdkMessage(message);
    void queryClient.resetQueries({ queryKey: ['deployment'], exact: true });
  }

  useEffect(() => {
    mounted.current = true;
    let session = getWalletSession();
    const unsubscribe = subscribeWalletSession(() => {
      const current = getWalletSession();
      if (session === current) return;
      session = current;
      if (sdkAttempted.current) invalidateSdk('Wallet changed. Run a new SDK check when ready.');
    });
    const abort = () => { epoch.current++; controller.current?.abort(); };
    window.addEventListener('pagehide', abort);
    return () => { mounted.current = false; abort(); unsubscribe(); window.removeEventListener('pagehide', abort); };
  }, []);

  async function prepare() {
    if (operation.current || getOperationBusy()) return;
    const lease = acquireOperation();
    operation.current = true;
    setSdkLoad('loading'); setSdkMessage('Preparing ATS SDK…');
    try {
      const state = await prepareAts();
      if (mounted.current) {
        setSdkLoad(state);
        setSdkMessage(state === 'loaded' ? 'SDK prepared. Config has not been checked.' : 'SDK preparation failed. Retry preparation or reload when ready.');
      }
    } finally { operation.current = false; releaseOperation(lease); }
  }

  async function checkSdk() {
    if (operation.current || getOperationBusy() || sdkLoad !== 'loaded') return;
    operation.current = true;
    const current = controller.current = new AbortController(), attempt = ++epoch.current;
    sdkAttempted.current = true;
    setSdkReading(true); setSdkResult(undefined); setSdkMessage('Checking deployment and SDK config…');
    void queryClient.resetQueries({ queryKey: ['deployment'], exact: true });
    try {
      const checked = await checkSdkConfig(current.signal);
      if (mounted.current && attempt === epoch.current && !current.signal.aborted) {
        setSdkResult(checked); setSdkMessage(checked.message);
        if (checked.deployment) queryClient.setQueryData(['deployment'], checked.deployment);
      }
    } catch {
      if (mounted.current && attempt === epoch.current && !current.signal.aborted) setSdkMessage('SDK check could not complete. Retry when ready.');
    } finally {
      current.abort();
      controller.current = undefined;
      operation.current = false;
      if (mounted.current) setSdkReading(false);
    }
  }

  async function check() {
    if (operation.current || getOperationBusy()) return;
    const lease = acquireOperation();
    operation.current = true;
    sdkAttempted.current = false;
    setSdkResult(undefined);
    setSdkMessage(sdkLoad === 'loaded' ? 'SDK prepared. Config has not been checked.' : 'SDK not prepared.');
    try { await query.refetch({ cancelRefetch: false }); }
    finally { operation.current = false; releaseOperation(lease); }
  }

  return <section className="deployment" aria-labelledby="deployment-heading">
    <h2 id="deployment-heading">Testnet deployment</h2>
    <p>Check the fixed Resolver, Factory and Equity config without connecting a wallet.</p>
    <p>These public reads do not establish full ATS SDK compatibility.</p>
    <p id="deployment-status" role="status" aria-live="polite">
      {checking ? 'Checking deployment and config…' : query.isError ? 'Deployment and config check could not complete. Retry when ready.' : result?.message ?? 'Not checked.'}
    </p>
    <dl className="wallet-details">
      <div><dt>RPC chain ID</dt><dd>{result?.chainId === undefined ? 'Not checked' : `${result.chainId} / 0x${result.chainId.toString(16)}`}</dd></div>
      <div><dt>Checked at (UTC)</dt><dd>{result ? <time dateTime={result.checkedAt}>{result.checkedAt}</time> : 'Not checked'}</dd></div>
    </dl>
    <div className="deployment-list">
      {deployments.map((deployment, index) => {
        const contract = result?.contracts[index];
        return <section key={deployment.id} aria-labelledby={`deployment-${deployment.name}`}>
          <h3 id={`deployment-${deployment.name}`}>{deployment.name} · {deployment.id}</h3>
          <p className="address">{contract?.address ? <code>{contract.address}</code> : 'EVM address not verified.'}</p>
          <p>{checking ? 'Checking…' : contract?.message ?? 'Not checked.'}</p>
          {contract?.byteLength !== undefined && <p>{contract.byteLength} bytes</p>}
        </section>;
      })}
    </div>
    <section aria-labelledby="config-heading">
      <h3 id="config-heading">Equity config</h3>
      <dl className="wallet-details">
        <div><dt>Config ID</dt><dd><code>{equityConfigId}</code></dd></div>
        <div><dt>Latest version</dt><dd data-testid="config-version">{result?.config.version ?? 'Not checked'}</dd></div>
      </dl>
      <p>{checking ? 'Checking…' : result?.config.message ?? 'Config not checked.'}</p>
      <p>This is the on-chain result. Check the SDK result below before continuing.</p>
    </section>
    <div className="actions"><button type="button" disabled={busy} aria-describedby="deployment-status" onClick={check}>
      {checking ? 'Checking deployment and config…' : result?.status === 'failed' || query.isError ? 'Retry deployment and config check' : 'Check deployment and config'}
    </button></div>
    <p className="deployment-note">Public reads at latest block state; results are not a shared block snapshot. Reloading clears this check.</p>
    <section aria-labelledby="sdk-heading">
      <h3 id="sdk-heading">ATS SDK config</h3>
      <p>Prepare the SDK, then check config. Each check rechecks the Testnet deployment without connecting a wallet.</p>
      <p id="sdk-status" role="status" aria-live="polite">{sdkMessage}</p>
      <dl className="wallet-details"><div><dt>SDK payload</dt><dd data-testid="sdk-payload">{sdkResult?.payload ?? 'Not checked'}</dd></div></dl>
      <div className="actions">
        <button type="button" disabled={busy || sdkLoad === 'loaded'} aria-describedby="sdk-status" onClick={prepare}>
          {sdkLoad === 'loading' ? 'Preparing SDK…' : sdkLoad === 'loaded' ? 'SDK prepared' : sdkLoad === 'failed' ? 'Retry SDK preparation' : 'Prepare ATS SDK'}
        </button>
        <button type="button" disabled={busy || sdkLoad !== 'loaded'} aria-describedby="sdk-status" onClick={checkSdk}>
          {sdkReading ? 'Checking SDK config…' : sdkResult?.status === 'failed' ? 'Retry SDK config check' : 'Check SDK config'}
        </button>
        {sdkReading && <button type="button" className="secondary" disabled={controller.current?.signal.aborted} onClick={() => invalidateSdk('SDK check cancelled. Run a new check when ready.')}>Cancel SDK check</button>}
      </div>
      <p className="deployment-note">This verifies the SDK config read only. Each settlement review checks the pinned SDK again. T02–T04 mutations are closed.</p>
    </section>
  </section>;
}

function Accounts({ session, address, ready, roles, changeRoles }: {
  session: number; address: string | undefined; ready: boolean; roles: Roles; changeRoles: (update: (roles: Roles) => Roles) => void;
}) {
  const addresses = [...new Set([address, ...Object.values(roles)].filter((value): value is string => !!value).map(value => value.toLowerCase()))];
  const queries = useQueries({ queries: addresses.map(evm => ({
    queryKey: ['mirror', session, evm],
    queryFn: ({ signal }: { signal: AbortSignal }) => lookupAccount(evm, signal),
    enabled: ready,
  })) });
  const verified = new Map<string, MirrorAccount>();
  queries.forEach((query, index) => {
    if (ready && query.isSuccess && !query.isFetching) verified.set(addresses[index], query.data);
  });
  const current = address ? verified.get(address.toLowerCase()) : undefined;

  function accountStatus(evm: string) {
    const query = queries[addresses.indexOf(evm.toLowerCase())];
    if (!ready) return 'Saved, awaiting verification. Connect on Hedera Testnet.';
    if (query?.isError) return query.error.message;
    if (!query?.data || query.isFetching) return 'Checking Testnet Mirror…';
    return `Mirror verified · Hedera ID ${query.data.accountId}`;
  }

  function retry(evm: string) {
    if (!ready || session !== getWalletSession()) return;
    if (queryClient.getQueryState(['mirror', session, evm.toLowerCase()])?.fetchStatus === 'fetching') return;
    const query = queries[addresses.indexOf(evm.toLowerCase())];
    if (query.isError && !query.isFetching) void query.refetch();
  }

  return (
    <section className="accounts" aria-labelledby="accounts-heading">
      <h2 id="accounts-heading">Set up three accounts</h2>
      <p>Switch the active account in MetaMask, then assign it below. Admin is the original test VC issuer. Each settlement contract serves as escrow for its matches.</p>
      <p>Assignments are local labels; they do not grant or prove on-chain permissions. Clear a role before replacing it.</p>
      {ready && address && <div className="current-lookup">
        <p role="status" aria-live="polite">Current account: {accountStatus(address)}</p>
        {queries[addresses.indexOf(address.toLowerCase())]?.isError && <button type="button" onClick={() => retry(address)}>Retry current account</button>}
      </div>}
      <div className="role-list">
        {roleNames.map(role => {
          const evm = roles[role];
          const account = evm ? verified.get(evm) : undefined;
          const conflict = account && roleNames.some(other => other !== role && roles[other]
            && verified.get(roles[other]!)?.accountId === account.accountId);
          const problem = bindingProblem(role, current, roles, verified);
          const failed = evm && ready && queries[addresses.indexOf(evm)]?.isError;
          return <section className="role-row" key={role} aria-labelledby={`${role}-heading`}>
            <h3 id={`${role}-heading`}>{role}</h3>
            <div className="role-details">
              <p className="address">{evm ? <code>{evm}</code> : 'Not assigned'}</p>
              <p id={`${role}-status`} role="status" aria-live="polite">
                {conflict ? 'Duplicate Hedera ID. Clear one of the conflicting roles.' : evm ? accountStatus(evm) : problem ?? 'Current account is ready to assign.'}
              </p>
            </div>
            <div className="actions">
              <button type="button" aria-describedby={`${role}-status`} disabled={!!problem} onClick={() => {
                changeRoles(latest => session !== getWalletSession() || bindingProblem(role, current, latest, verified)
                  ? latest : { ...latest, [role]: current!.address });
              }}>Use current account</button>
              <button type="button" className="secondary" disabled={!evm} onClick={() => {
                changeRoles(latest => {
                  const next = { ...latest };
                  delete next[role];
                  return next;
                });
              }}>Clear</button>
              {failed && <button type="button" className="secondary" onClick={() => retry(evm)}>Retry {role}</button>}
            </div>
          </section>;
        })}
      </div>
    </section>
  );
}

export default function SettingsPage({ visible, address, chainId, swapAddress, session, ready, roles, changeRoles }: {
  visible: boolean; address?: string; chainId?: number; swapAddress?: string; session: number;
  ready: boolean; roles: Roles; changeRoles: (update: (roles: Roles) => Roles) => void;
}) {
  return <section id="settings" hidden={!visible} aria-labelledby="settings-heading" className="page-section">
        <h2 id="settings-heading">Settings</h2><p>Use desktop Chrome and MetaMask. Transactions require manual approval on production preview 4173.</p>
        <dl className="wallet-details"><div><dt>Active account</dt><dd data-testid="active-account"><code>{address ?? 'Wallet not connected.'}</code></dd></div>
          <div><dt>Wallet chain ID</dt><dd data-testid="chain-id">{chainId ?? 'Not available'}</dd></div><div><dt>Swap address</dt><dd><code>{swapAddress ?? 'Not deployed in this journal'}</code></dd></div>
          <div><dt>NOVA / ISIN</dt><dd>0.0.10402368 / USNOVA000016</dd></div><div><dt>NOVA address</dt><dd><code>{securityAddress}</code></dd></div></dl>
        <Accounts key={session} session={session} address={address} ready={ready} roles={roles} changeRoles={changeRoles}/>
        <details className="settings-details"><summary>SDK, network and ATS deployment</summary><Deployment/></details>
      </section>;
}

import { useRef, useState, useSyncExternalStore } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useConnect, useConnection, useDisconnect } from 'wagmi';
import { bindingProblem, loadRoles, roleNames, saveRoles, storageWarning, type MirrorAccount, type Roles } from './guards';
import { getWalletSession, lookupAccount, queryClient, subscribeWalletSession, testnetChainId, walletConfig } from './wallet';
import { checkDeployment, deployments } from './deployment';

function Deployment() {
  const operation = useRef(false);
  const query = useQuery({ queryKey: ['deployment'], queryFn: ({ signal }) => checkDeployment(signal), enabled: false });
  const result = query.isSuccess && !query.isFetching ? query.data : undefined;

  async function check() {
    if (operation.current) return;
    operation.current = true;
    try { await query.refetch({ cancelRefetch: false }); }
    finally { operation.current = false; }
  }

  return <section className="deployment" aria-labelledby="deployment-heading">
    <h2 id="deployment-heading">Testnet deployment</h2>
    <p>Check the fixed Resolver and Factory without connecting a wallet.</p>
    <p>Presence of runtime bytecode does not prove ATS compatibility or a valid config version.</p>
    <p id="deployment-status" role="status" aria-live="polite">
      {query.isFetching ? 'Checking deployment…' : query.isError ? 'Deployment check could not complete. Retry when ready.' : result?.message ?? 'Not checked.'}
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
          <p>{query.isFetching ? 'Checking…' : contract?.message ?? 'Not checked.'}</p>
          {contract?.byteLength !== undefined && <p>{contract.byteLength} bytes</p>}
        </section>;
      })}
    </div>
    <div className="actions"><button type="button" disabled={query.isFetching} aria-describedby="deployment-status" onClick={check}>
      {query.isFetching ? 'Checking deployment…' : result?.status === 'failed' || query.isError ? 'Retry deployment check' : 'Check deployment'}
    </button></div>
    <p className="deployment-note">Public reads at latest block state; results are not a shared block snapshot. Reloading clears this check.</p>
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
      <p>Switch the active account in MetaMask, then assign it below. Admin also serves as Escrow and the test VC issuer.</p>
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

export default function App() {
  const connection = useConnection();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const session = useSyncExternalStore(subscribeWalletSession, getWalletSession, () => 0);
  const [saved, setSaved] = useState(() => typeof window === 'undefined' ? { roles: {}, warning: '' } : loadRoles());
  const savedRef = useRef(saved);
  const [walletMessage, setWalletMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const operation = useRef(false);
  const ready = connection.isConnected && connection.chainId === testnetChainId && !busy;

  async function handleWallet() {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setWalletMessage('');
    try {
      if (connection.isConnected) await disconnect.mutateAsync({});
      else {
        const connector = walletConfig.connectors[0];
        if (!await connector.getProvider()) {
          setWalletMessage('MetaMask was not found. Install and enable MetaMask in desktop Chrome, then reload.');
          return;
        }
        await connect.mutateAsync({ connector });
      }
    } catch {
      setWalletMessage('The wallet request was not completed. Check MetaMask, then try again when ready.');
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }

  function changeRoles(update: (roles: Roles) => Roles) {
    const latest = savedRef.current;
    const roles = update(latest.roles);
    if (roles === latest.roles) return;
    savedRef.current = { roles, warning: latest.warning || (saveRoles(roles) ? '' : storageWarning) };
    setSaved(savedRef.current);
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header>
        <div>
          <h1>HoldBook</h1>
          <p>Equity lifecycle verification</p>
        </div>
        <p className="network">Hedera Testnet · Chain 296 / 0x128<br />Local account setup</p>
      </header>

      <main id="main">
        <section className="notice" aria-labelledby="status-heading">
          <h2 id="status-heading">Connect MetaMask</h2>
          <p>Use desktop Chrome with only MetaMask installed. Connect when ready; reloading always requires a new connection.</p>
          <dl className="wallet-details">
            <div><dt>Active account</dt><dd data-testid="active-account">{connection.address ? <code>{connection.address}</code> : 'Wallet not connected.'}</dd></div>
            <div><dt>Wallet chain ID</dt><dd data-testid="chain-id">{connection.chainId === undefined ? 'Not available' : `${connection.chainId} / 0x${connection.chainId.toString(16)}`}</dd></div>
          </dl>
          <p id="wallet-status" role="status" aria-live="polite">
            {busy ? 'Wallet request pending. Complete or reject it in MetaMask.' : connection.isConnected
              ? ready ? 'Connected to Hedera Testnet.' : 'Wrong network. Switch to Hedera Testnet (296 / 0x128) in MetaMask.'
              : 'Wallet not connected. Press Connect to begin.'}
          </p>
          <div className="actions"><button type="button" disabled={busy} aria-describedby="wallet-status" onClick={handleWallet}>{connection.isConnected ? 'Disconnect' : 'Connect'}</button></div>
          {walletMessage && <p role="alert">{walletMessage}</p>}
        </section>

        {saved.warning && <p className="storage-warning" role="alert">{saved.warning}</p>}
        <Accounts key={session} session={session} address={connection.address} ready={ready} roles={saved.roles} changeRoles={changeRoles} />

        <Deployment />

        <div className="columns">
          <section aria-labelledby="asset-heading">
            <h2 id="asset-heading">Planned asset</h2>
            <p className="asset-name">Nova Private Equity Common Shares</p>
            <p>Fictional Testnet asset. Synthetic KYC only.</p>
            <dl>
              <div><dt>Symbol</dt><dd>NOVA</dd></div>
              <div><dt>ISIN</dt><dd><code>USNOVA000016</code></dd></div>
              <div><dt>Decimals</dt><dd>0</dd></div>
              <div><dt>Authorized shares</dt><dd>1,000</dd></div>
              <div><dt>Security ID</dt><dd>Not created</dd></div>
            </dl>
            <p>These are planned settings, not balances or verified on-chain data.</p>
          </section>

          <section aria-labelledby="sequence-heading">
            <h2 id="sequence-heading">Verification sequence</h2>
            <ol>
              <li><strong>ATS readiness</strong><span>Connect three accounts, resolve config, verify a test VC.</span></li>
              <li><strong>Create NOVA</strong><span>Review the settings and approve Equity creation.</span></li>
              <li><strong>Seller KYC &amp; issuance</strong><span>Grant synthetic KYC and issue 100 NOVA.</span></li>
              <li><strong>Prove the Hold lifecycle</strong><span>Hold 10, verify KYC rejection, grant Buyer KYC, execute 6, release 4.</span></li>
            </ol>
            <p>All steps are pending. Victor approves each signature in MetaMask.</p>
          </section>
        </div>

        <section className="evidence" aria-labelledby="evidence-heading">
          <h2 id="evidence-heading">Transaction evidence</h2>
          <p>No transactions yet.</p>
          <p>This page reads public Mirror records and checks Testnet deployment bytecode. No signatures or transactions are requested.</p>
        </section>
      </main>

      <footer>
        <p>Testnet demonstration only. No real securities, identity checks, or legal compliance claims.</p>
        <a href="https://github.com/outsider987/hedera-rwa-secondary-market/blob/main/docs/HANDOFF.md">Read the project handoff</a>
      </footer>
    </>
  );
}

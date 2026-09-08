import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useConnect, useConnection, useDisconnect } from 'wagmi';
import { acquireOperation, getOperationBusy, releaseOperation, subscribeOperation, bindingProblem, loadRoles, rolesStorageKey, roleNames, saveRoles, storageWarning, type MirrorAccount, type Roles } from './guards';
import { invalidateWalletSession, getWalletSession, lookupAccount, queryClient, subscribeWalletSession, testnetChainId, walletConfig } from './wallet';
import { checkDeployment, deployments, equityConfigId } from './deployment';
import { checkSdkConfig, prepareAts, type AtsLoadState, type SdkConfigCheck } from './ats';

import { downloadEvidence, type TradeRecord } from './evidence';
import TradePanel from './TradePanel';
import MarketPanel from './MarketPanel';
import Header from './Header';
import { loadTradeRecords, tradeLabels } from './trade';
import { accounts, securityId, securityAddress, creationHash, actionLabels, loadLifecycleRecords, type LifecycleRecord, type LifecycleState } from './lifecycle';
import { verifyT03History } from './hold';

import { loadNovaRecord, novaStorageKey, recoverNova, saveNovaRecord, type NovaRecord } from './nova';

const novaMessages: Record<NovaRecord['status'], string> = {
  'awaiting-signature': 'Awaiting signature. Check MetaMask before doing anything else.',
  rejected: 'Transaction rejected. No transaction hash exists. Review again only when ready.',
  pending: 'Transaction submitted. Confirmation is pending; do not submit another.',
  unknown: 'Transaction result unknown. Check MetaMask and recover by hash; do not submit another.',
  confirmed: 'Deployment confirmed; readback is incomplete. Query again to verify the settings.',
  'mirror-pending': 'Deployment confirmed; Mirror indexing is pending. Query again; do not create another.',
  mismatch: 'Verification failed. Inspect the recorded operation; do not create another.',
  complete: 'NOVA deployment and all required settings verified.',
};
function Lifecycle({ session }: { session: number }) {
  const locked = useSyncExternalStore(subscribeOperation, getOperationBusy, () => false);
  const [records,setRecords] = useState<LifecycleRecord[]>(() => { try {return loadLifecycleRecords();} catch {return [];} });
  const [state,setState] = useState<LifecycleState>(), [message,setMessage] = useState('T03 completed at block 40224162. Query the original transactions to verify historical issuance and Seller KYC. All T03 mutations are closed.');
  const [reading,setReading] = useState(false), controller = useRef<AbortController | undefined>(undefined);
  useEffect(() => {controller.current?.abort();setReading(false);setState(undefined);},[session]);
  useEffect(() => () => controller.current?.abort(),[]);
  async function verify() {
    if (getOperationBusy()) return;
    const current = controller.current = new AbortController();setReading(true);setState(undefined);
    try {const next = await verifyT03History(current.signal,setMessage);current.signal.throwIfAborted();setState(next);setRecords(loadLifecycleRecords());setMessage('All six T03 transactions verified against their historical blocks. Issuance is closed.');}
    catch(error){if(!current.signal.aborted)setMessage(error instanceof Error ? error.message : 'Historical verification incomplete.');}
    finally{if(controller.current === current)setReading(false);}
  }
  return <section className="deployment" aria-labelledby="lifecycle-heading">
    <h2 id="lifecycle-heading">T03 · Seller KYC and issuance history</h2>
    <p>T03 is complete. Buyer KYC and T04 balances do not change the recorded T03 result.</p>
    <p role="status" aria-live="polite">{message}</p>
    <div className="actions"><button disabled={locked || reading} onClick={verify}>Verify T03 history</button>
      {reading && <button className="secondary" onClick={()=>{controller.current?.abort();setReading(false);setMessage('Historical query cancelled.');}}>Cancel T03 read</button>}</div>
    {state && <p>Verified issuance block {state.block}: Seller {state.sellerBalance}, Buyer {state.buyerBalance}, held {state.sellerHeld}, supply {state.supply}/1000.</p>}
    <details><summary>Six original T03 operations</summary><ol>{records.map(record=><li key={record.operationId}>{actionLabels[record.action]} · saved {record.status}
      <p className="address"><code>{record.transactionHash ?? 'No saved hash'}</code></p><button className="secondary" onClick={()=>downloadEvidence(record)}>Export public operation</button>
    </li>)}</ol></details>
  </section>;
}

function Nova({ session }: { session: number }) {
  const locked = useSyncExternalStore(subscribeOperation, getOperationBusy, () => false);
  const [record, setRecord] = useState<NovaRecord | undefined>(() => { try { return loadNovaRecord(); } catch { return undefined; } });
  const [message, setMessage] = useState('T02 is complete. Query the original deployment to verify its creation-block settings and initial supply 0.');
  const [reading, setReading] = useState(false), [checkedHere, setCheckedHere] = useState(false);
  const controller = useRef<AbortController | undefined>(undefined);
  useEffect(() => { controller.current?.abort(); setReading(false); setCheckedHere(false); }, [session]);
  useEffect(() => {
    const refresh = (event: StorageEvent) => { if (event.key !== novaStorageKey && event.key !== null) return;
      setCheckedHere(false); try { setRecord(loadNovaRecord()); } catch { setMessage('Saved NOVA record is invalid. Query the original hash.'); } };
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('storage', refresh); controller.current?.abort(); };
  }, []);
  async function recover() {
    if (getOperationBusy()) return;
    const current = controller.current = new AbortController(); setReading(true); setCheckedHere(false);
    setMessage('Querying the original receipt, creation-block state and Mirror…');
    try {
      const next = await recoverNova(creationHash, accounts.Admin.address, current.signal);
      current.signal.throwIfAborted(); setRecord(next); setCheckedHere(true); setMessage(novaMessages[next.status]);
      try { saveNovaRecord(next); } catch { setMessage(novaMessages[next.status] + ' Storage unavailable; export this result.'); }
    } catch (error) { if (!current.signal.aborted) setMessage(error instanceof Error ? error.message : 'Historical query incomplete.'); }
    finally { if (controller.current === current) setReading(false); }
  }
  return <section className="deployment" aria-labelledby="nova-heading">
    <h2 id="nova-heading">T02 · NOVA creation history</h2>
    <p>Creation is closed. Existing NOVA {securityId}: <code>{securityAddress}</code>.</p>
    <p className="address">Original transaction: <code>{creationHash}</code></p>
    <p role="status" aria-live="polite">{message}</p>
    <div className="actions"><button disabled={locked} onClick={recover}>Query NOVA transaction</button>
      {reading && <button className="secondary" onClick={() => { controller.current?.abort(); setReading(false); setMessage('Historical query cancelled.'); }}>Cancel NOVA read</button>}
      <button className="secondary" disabled={!record} onClick={() => { if (record) downloadEvidence(record); }}>Export NOVA result</button></div>
    {record?.comparisons && <details><summary>{checkedHere ? 'T02 historical verification results' : 'Saved T02 results — query to verify history'}</summary>
      <div className="comparison-table"><table><caption>Creation-block settings; current balances are shown in Trade</caption><thead><tr><th>Setting</th><th>Expected</th><th>Observed</th><th>Result / source</th></tr></thead>
        <tbody>{record.comparisons.map(row => <tr key={row.field}><th scope="row">{row.field}</th><td>{row.expected || 'Empty'}</td><td>{row.actual || 'Empty'}</td><td>{row.matches ? 'Match' : 'Mismatch'} · {row.source}</td></tr>)}</tbody></table></div>
    </details>}
  </section>;
}

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
      <p className="deployment-note">This verifies the SDK config read only. Each T05 review checks the pinned SDK again. T02–T04 mutations are closed.</p>
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
      <p>Switch the active account in MetaMask, then assign it below. Admin is the original test VC issuer. The T05 swap contract serves as escrow.</p>
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
  const [page,setPage] = useState('market');
  const [tradeRecords,setTradeRecords] = useState<TradeRecord[]>(()=>{try{return loadTradeRecords();}catch{return [];}});
  useEffect(()=>{const change=()=>{const value=window.location.hash.slice(1);setPage(['market','trade','history','settings'].includes(value) ? value : 'market');};change();window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.key !== rolesStorageKey && event.key !== null) return;
      const next = loadRoles(); savedRef.current = next; setSaved(next); invalidateWalletSession();
    };
    window.addEventListener('storage', changed); return () => window.removeEventListener('storage', changed);
  }, []);
  const [walletMessage, setWalletMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useSyncExternalStore(subscribeOperation, getOperationBusy, () => false);
  const operation = useRef(false);
  const ready = connection.isConnected && connection.chainId === testnetChainId && !busy;

  async function handleWallet() {
    if (operation.current || getOperationBusy()) return;
    const lease = acquireOperation();
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
      releaseOperation(lease);
    }
  }

  function changeRoles(update: (roles: Roles) => Roles) {
    const latest = savedRef.current;
    const roles = update(latest.roles);
    if (roles === latest.roles) return;
    savedRef.current = { roles, warning: latest.warning || (saveRoles(roles) ? '' : storageWarning) };
    invalidateWalletSession();
    setSaved(savedRef.current);
  }

  const activeRole=Object.entries(accounts).find(([,a])=>a.address === connection.address?.toLowerCase())?.[0];
  const deployment=tradeRecords.find(r=>r.action === 'deploy' && r.status === 'complete');
  return <>
    <a className="skip-link hb:z-20" href="#main">Skip to content</a>
    <Header activeRole={activeRole} connected={connection.isConnected} disabled={busy || locked} onWallet={handleWallet}/>
    <main id="main">
      <nav className="page-nav" aria-label="Main navigation">{['market','trade','history','settings'].map(item=><a key={item} href={'#'+item} aria-current={page === item ? 'page' : undefined}>{item[0].toUpperCase()+item.slice(1)}</a>)}</nav>
      <p id="wallet-status" role="status" aria-live="polite" className="wallet-status">{busy ? 'Wallet request pending. Complete or reject it in MetaMask.' : connection.isConnected ? ready ? 'Connected to Hedera Testnet.' : 'Wrong network. Switch to Hedera Testnet (296 / 0x128) in MetaMask.' : 'Wallet not connected. Connect when ready.'}</p>
      {walletMessage && <p role="alert">{walletMessage}</p>}{saved.warning && <p className="storage-warning" role="alert">{saved.warning}</p>}
      <div id="market" hidden={page !== 'market'}><MarketPanel visible={page === 'market'} roles={saved.roles} session={session} activeAccount={connection.address}/></div>
      <div id="trade" hidden={page !== 'trade'}><TradePanel roles={saved.roles} session={session} activeAccount={connection.address} records={tradeRecords} onRecords={setTradeRecords}/></div>
      <section id="history" hidden={page !== 'history'} aria-labelledby="history-heading" className="page-section">
        <h2 id="history-heading">Trade and asset history</h2><p>Historical verification blocks describe recorded results. Check Trade for current balances.</p>
        <section className="history-section"><h3>T05 · Atomic trade</h3><p>Manual acceptance Pending. Saved journal statuses are reverified before each new action.</p>
          {tradeRecords.length ? <ol className="history-list">{tradeRecords.map(r=><li key={r.operationId}><strong>{tradeLabels[r.action]}</strong> · saved {r.status}
            <p>{r.kind === 't05-simulation' ? 'Read-only simulation · no signature or transaction ID' : r.transactionHash ?? 'No hash recorded. Check MetaMask.'}</p>
            {r.after && <p>Verification block {r.after.block} · Seller {r.after.sellerBalance}, Buyer {r.after.buyerBalance}, Seller held {r.after.sellerHeld}.</p>}
            {r.kind === 't05-transaction' && r.payment && <p>Seller principal: 1 HBAR. Network fee: {r.payment.feeTinybars} tinybars.</p>}
            <button className="secondary" onClick={()=>downloadEvidence(r)}>Export T05 public evidence</button></li>)}</ol> : <p>No T05 operation recorded in this browser.</p>}
        </section>
        <section className="history-section" aria-labelledby="t04-history-heading"><h3 id="t04-history-heading">T04 · Hold lifecycle complete</h3>
          <p>Verified at block 40241114 on September 8, 2026. Hold 10 → execute 6 → release 4.</p>
          <dl><div><dt>Seller available / held</dt><dd>94 / 0 NOVA</dd></div><div><dt>Buyer available / held</dt><dd>6 / 0 NOVA</dd></div><div><dt>Supply / cap / config</dt><dd>100 / 1,000 / 1</dd></div></dl>
          <details><summary>Three verified rejections</summary><ul><li>Buyer without KYC: SDK AccountNotKycd and contract InvalidKycStatus at block 40228392.</li>
            <li>Seller executing as escrow: IsNotEscrow at block 40239552.</li><li>Admin executing 11 from Hold 10: InsufficientHoldBalance at block 40239552.</li></ul><p>Public simulations only. No signature or transaction ID exists for these rejections.</p></details>
          <p><a href="https://github.com/outsider987/hedera-rwa-secondary-market/blob/main/docs/evidence/029-t04-manual.md">Open T04 verified report and screenshots</a></p>
        </section>
        <details className="history-section"><summary>T03 · Seller KYC and issuance complete</summary><p>100 NOVA issued to Seller; final verification block 40224162.</p><Lifecycle session={session}/></details>
        <details className="history-section"><summary>T02 · NOVA creation complete</summary><p>Creation block 40209377 · initial supply 0.</p><Nova session={session}/></details>
      </section>
      <section id="settings" hidden={page !== 'settings'} aria-labelledby="settings-heading" className="page-section">
        <h2 id="settings-heading">Settings</h2><p>Use desktop Chrome and MetaMask. Transactions require manual approval on production preview 4173.</p>
        <dl className="wallet-details"><div><dt>Active account</dt><dd data-testid="active-account"><code>{connection.address ?? 'Wallet not connected.'}</code></dd></div>
          <div><dt>Wallet chain ID</dt><dd data-testid="chain-id">{connection.chainId ?? 'Not available'}</dd></div><div><dt>Swap address</dt><dd><code>{deployment?.input.escrow ?? 'Not deployed in this journal'}</code></dd></div>
          <div><dt>NOVA / ISIN</dt><dd>0.0.10402368 / USNOVA000016</dd></div><div><dt>NOVA address</dt><dd><code>{securityAddress}</code></dd></div></dl>
        <Accounts key={session} session={session} address={connection.address} ready={ready} roles={saved.roles} changeRoles={changeRoles}/>
        <details className="settings-details"><summary>SDK, network and ATS deployment</summary><Deployment/></details>
      </section>
    </main>
    <footer><p>Testnet demonstration only. Synthetic KYC; no real securities or identity checks.</p><a href="https://github.com/outsider987/hedera-rwa-secondary-market/blob/main/docs/HANDOFF.md">Project handoff</a></footer>
  </>;
}

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useConnect, useConnection, useDisconnect } from 'wagmi';
import { acquireOperation, getOperationBusy, releaseOperation, subscribeOperation, bindingProblem, loadRoles, rolesStorageKey, roleNames, saveRoles, storageWarning, type MirrorAccount, type Roles } from './guards';
import { checkWalletReview, invalidateWalletSession, type WalletReview, getWalletSession, lookupAccount, queryClient, subscribeWalletSession, testnetChainId, walletConfig } from './wallet';
import { checkDeployment, deployments, equityConfigId } from './deployment';
import { checkSdkConfig, prepareAts, type AtsLoadState, type SdkConfigCheck } from './ats';

import { prepareCredential as prepareSubjectCredential, signCredential, type PreparedCredential, type CredentialResult, type VerifiedCredential } from './credentials';
import { credentialEvidence, downloadEvidence } from './evidence';
import { accounts, securityId, securityAddress, creationHash, actionLabels, loadLifecycleRecords, type LifecycleRecord, type LifecycleState } from './lifecycle';
import { holdStorageKey, holdLabels, loadHoldRecords, readHoldState, reviewHold, runHoldAction, recoverHold, restoreHoldEvidence, nextHoldAction, verifyT03History, type HoldReview, type HoldRecord, type HoldState } from './hold';
import { type HoldTransaction } from './evidence';

function Credentials({ roles, onVerified }: { roles: Roles; onVerified: (seller: VerifiedCredential | undefined) => void }) {
  const locked = useSyncExternalStore(subscribeOperation, getOperationBusy, () => false);
  const [review, setReview] = useState<{ wallet: WalletReview; vc: PreparedCredential }>();
  const [accepted, setAccepted] = useState(false);
  const [result, setResult] = useState<CredentialResult>();
  const [message, setMessage] = useState('Prepare a synthetic Buyer credential with Admin selected.');
  const [working, setWorking] = useState(false);
  const mounted = useRef(true), controller = useRef<AbortController | undefined>(undefined);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; controller.current?.abort(); };
  }, []);
  async function prepareCredential() {
    if (getOperationBusy() || controller.current) return;
    const current = controller.current = new AbortController();
    onVerified(undefined);
    setWorking(true); setReview(undefined); setResult(undefined); setAccepted(false); setMessage('Checking three accounts and preparing Buyer VC…');
    try {
      const stage = await reviewHold(roles, undefined, current.signal, setMessage);
      if (stage.problem || stage.action !== 'buyer-kyc') throw new Error('Complete Hold creation and the un-KYC Buyer checks before preparing Buyer VC.');
      const wallet = stage.wallet;
      const vc = await prepareSubjectCredential(wallet.roles.Admin, wallet.roles.Buyer);
      await checkWalletReview(wallet);
      if (mounted.current) { setReview({ wallet, vc }); setMessage('Review the credential below before signing.'); }
    } catch (error) {
      if (mounted.current) setMessage(error instanceof Error ? error.message : 'Preparation did not complete. Select Admin on Hedera Testnet.');
    } finally { current.abort(); controller.current = undefined; if (mounted.current) setWorking(false); }
  }
  async function sign() {
    if (!review || !accepted || getOperationBusy()) return;
    setWorking(true); setResult(undefined); setMessage('Awaiting your signature in MetaMask. Complete or reject the request there.');
    try {
      const verified = await signCredential(review.vc, review.wallet.provider, () => checkWalletReview(review.wallet));
      if (mounted.current) {
        onVerified(verified.verified && verified.credential ? { prepared: review.vc, credential: verified.credential, session: review.wallet.session } : undefined);
        setResult(verified); setMessage(verified.verified
        ? 'Buyer VC verified. Expired, tampered and wrong-subject checks passed. No on-chain KYC was granted.'
        : 'Credential verification failed. Prepare again; do not use this credential.'); setAccepted(false); }
    } catch (error) {
      if (mounted.current) { setMessage(error instanceof Error ? error.message : 'Signature did not complete. Check MetaMask.'); setAccepted(false); }
    } finally { if (mounted.current) setWorking(false); }
  }
  return <section className="deployment" aria-labelledby="credential-heading">
    <h2 id="credential-heading">Buyer credential</h2>
    <p>Admin signs a fictional KYC passed claim for Buyer. No personal data or revocation registry is used.</p>
    <p>Full credentials and signatures stay in memory. Account, network or role changes and reload invalidate them.</p>
    <p id="credential-status" role="status" aria-live="polite">{locked && !working ? 'Another operation is pending. Complete it before continuing.' : message}</p>
    {review && <>
      <dl className="wallet-details">
        <div><dt>Issuer (Admin)</dt><dd><code>{review.vc.payload.issuer}</code></dd></div>
        <div><dt>Subject (Buyer)</dt><dd><code>{review.vc.payload.credentialSubject.id}</code></dd></div>
        <div><dt>Claims</dt><dd>SyntheticKyc · passed: true</dd></div>
        <div><dt>Valid from (UTC)</dt><dd>{review.vc.payload.validFrom}</dd></div>
        <div><dt>Valid until (UTC)</dt><dd>{review.vc.payload.validUntil}</dd></div>
        <div><dt>Credential digest</dt><dd><code data-testid="credential-digest">{review.vc.digest}</code></dd></div>
      </dl>
      <label className="review-check"><input type="checkbox" checked={accepted} disabled={locked || !!result?.verified} onChange={event => setAccepted(event.target.checked)} />I reviewed the issuer, Buyer, fixed claims, dates and digest.</label>
    </>}
    <div className="actions">
      <button type="button" disabled={locked || working || !roleNames.every(role => roles[role])} onClick={prepareCredential}>Prepare Buyer VC</button>
      <button type="button" disabled={locked || !review || !accepted || !!result?.verified} onClick={sign}>Sign in MetaMask and verify</button>
      <button type="button" className="secondary" disabled={locked || !review || !result} onClick={() => {
        if (review && result) downloadEvidence(credentialEvidence({ digest: review.vc.digest, issuer: review.vc.payload.issuer,
          subject: review.vc.payload.credentialSubject.id, validFrom: review.vc.payload.validFrom!, validUntil: review.vc.payload.validUntil!, ...result }));
      }}>Export VC result</button>
    </div>
    <p className="deployment-note">Desktop Chrome + MetaMask ECDSA only. A signature is not a transaction. Native BBS is not supported.</p>
  </section>;
}

import { isCreationOrigin, loadNovaRecord, novaStorageKey, recoverNova, saveNovaRecord, type NovaRecord } from './nova';

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

function Hold({roles,session,buyer,activeAccount}: {roles:Roles;session:number;buyer?:VerifiedCredential;activeAccount?:string}) {
  const locked = useSyncExternalStore(subscribeOperation,getOperationBusy,()=>false);
  const [records,setRecords] = useState<HoldRecord[]>(()=>{try{return loadHoldRecords();}catch{return [];}});
  const [state,setState] = useState<HoldState>(),[review,setReview] = useState<HoldReview>(),[approved,setApproved] = useState(false);
  const [message,setMessage] = useState('Check current T04 state. First action: select Seller and review Hold 10. Manual acceptance is pending.');
  const [reading,setReading] = useState(false),controller = useRef<AbortController | undefined>(undefined);
  const [hash,setHash] = useState(''),[action,setAction] = useState<HoldTransaction['action']>('create-hold'),[baseBlock,setBaseBlock] = useState('');
  const preview = typeof window !== 'undefined' && isCreationOrigin(window.location.origin,import.meta.env.PROD);
  useEffect(()=>{controller.current?.abort();setReview(undefined);setApproved(false);setState(undefined);setReading(false);setMessage('Wallet or credential changed. Check current state and review again.');},[session,buyer]);
  useEffect(()=>{
    const refresh = (event:StorageEvent)=>{if(event.key !== holdStorageKey && event.key !== null)return;controller.current?.abort();setReview(undefined);setApproved(false);setState(undefined);try{setRecords(loadHoldRecords());setMessage('T04 journal changed in another tab. Query before continuing.');}catch{setMessage('T04 storage is invalid. Recover original public evidence.');}};
    window.addEventListener('storage',refresh);return()=>{window.removeEventListener('storage',refresh);controller.current?.abort();};
  },[]);
  let next: string = 'Not checked',required = 'Seller',problem: string | undefined;
  if(state){try{const action = nextHoldAction(state,records);next = action ? holdLabels[action] : 'Final readback complete; human report pending';required = action === 'create-hold' ? 'Seller' : 'Admin';}catch(error){problem = error instanceof Error ? error.message : 'Recover existing evidence.';next = 'Recovery required';required = 'Query only';}}
  async function read(mode:'state'|'review'|'recover') {
    if(getOperationBusy())return;
    const current = controller.current = new AbortController();setReading(true);setReview(undefined);setApproved(false);setState(undefined);
    try{
      if(mode === 'review'){
        const result = await reviewHold(roles,buyer,current.signal,setMessage);current.signal.throwIfAborted();setReview(result);setState(result.state);setRecords(loadHoldRecords());
        setMessage(result.problem ?? (result.action === 'buyer-kyc' && !result.calldata ? 'Select Admin, prepare/review/sign/verify Buyer VC below, then review this action again.' : result.action ? 'Review the exact action and required account below.' : 'Final state matches. Export evidence for the separate human acceptance report.'));
      }else if(mode === 'recover'){
        setMessage('Querying original receipt, full historical transition and Mirror identity…');
        const result = await recoverHold(hash.trim(),action,current.signal,setRecords,baseBlock.trim() || undefined);current.signal.throwIfAborted();
        setMessage(`Transaction ${result.status}. Check current state before starting another review.`);
      }else{
        const lease = acquireOperation();try{const result = await readHoldState(current.signal,undefined,setMessage);current.signal.throwIfAborted();setState(result);setRecords(loadHoldRecords());setMessage('Current chain state read. Saved journal statuses must be reverified by Review next T04 action.');}finally{releaseOperation(lease);}
      }
    }catch(error){if(!current.signal.aborted)setMessage(error instanceof Error ? error.message : 'Query incomplete. Check the saved hash; never resubmit automatically.');}
    finally{if(controller.current === current)setReading(false);}
  }
  async function run() {
    if(getOperationBusy() || !review || !approved)return;
    const current = controller.current = new AbortController();setApproved(false);setState(undefined);
    const simulation = review.action === 'kyc-negative' || review.action === 'permission-negative';setReading(simulation);
    try{
      const result = await runHoldAction(review,setRecords,current.signal,setMessage);
      if(result.status === 'complete' && result.after)setState(result.after);
      if(result.kind === 't04-transaction' && result.transactionHash){setHash(result.transactionHash);setAction(result.action);setBaseBlock(result.input.baseBlock);}
      setMessage(result.kind === 't04-simulation' ? 'Read-only checks passed and state stayed unchanged. No transaction or signature exists for these simulations.'
        : result.status === 'complete' ? 'Transaction and full readback verified. Start the next review manually.' : `Operation ${result.status}. Check MetaMask and query the saved hash; do not repeat the transaction.`);
    }catch(error){if(!current.signal.aborted)setMessage(error instanceof Error ? error.message : 'Action stopped. Check MetaMask before continuing.');}
    finally{setReview(undefined);setReading(false);}
  }
  const simulation = review?.action === 'kyc-negative' || review?.action === 'permission-negative';
  return <section className="deployment" aria-labelledby="hold-heading">
    <h2 id="hold-heading">T04 · Hold lifecycle</h2>
    <p>NOVA {securityId} · Hold 10 → Buyer KYC → execute 6 → release 4. Four manual transactions and one Buyer VC signature; negative checks are read-only.</p>
    <dl className="wallet-details"><div><dt>Current stage</dt><dd>{next}</dd></div><div><dt>Required account</dt><dd>{review?.wallet.expectedRole ?? required}</dd></div><div><dt>Active account</dt><dd><code>{activeAccount ?? "Not connected"}</code></dd></div>
      <div><dt>Transaction origin</dt><dd>{preview ? 'Production preview — manual MetaMask approval' : 'Dev — credentials and read-only queries; use preview 4173 for transactions'}</dd></div></dl>
    <p role="status" aria-live="polite">{message}</p>{problem && <p role="alert">{problem}</p>}
    <div className="actions"><button disabled={locked || reading} onClick={()=>read('state')}>Check current T04 state</button>
      <button disabled={locked || reading || !roleNames.every(role=>roles[role])} onClick={()=>read('review')}>Review next T04 action</button>
      {reading && <button className="secondary" onClick={()=>{controller.current?.abort();setReading(false);setMessage('Read cancelled. Existing transactions are retained.');}}>Cancel T04 read</button>}</div>
    {state && <dl className="wallet-details"><div><dt>Current block / seconds</dt><dd>{state.block} / {state.timestamp}</dd></div>
      <div><dt>Seller available / held</dt><dd>{state.sellerBalance} / {state.sellerHeld}</dd></div><div><dt>Buyer available / held</dt><dd>{state.buyerBalance} / {state.buyerHeld}</dd></div>
      <div><dt>Supply / cap / config</dt><dd>{state.supply} / 1000 / 1</dd></div>
      <div><dt>Seller KYC</dt><dd>{state.sellerKyc.status === 1 ? 'Valid' : 'Invalid'} · {state.sellerKyc.validFrom}–{state.sellerKyc.validTo} seconds</dd></div>
      <div><dt>Buyer KYC</dt><dd>{state.buyerKyc.status === 1 ? 'Valid' : 'Not granted / invalid'} · {state.buyerKyc.vcId || 'No VC ID'}</dd></div>
      <div><dt>Active Seller Hold IDs</dt><dd>{state.sellerHoldIds.join(', ') || 'None'}</dd></div><div><dt>Hold remaining</dt><dd>{state.hold?.amount ?? 'No active Hold'}</dd></div>
    </dl>}
    {review?.action && <><h3>Review: {holdLabels[review.action]}</h3><dl className="wallet-details">
      <div><dt>Signer / chain / value</dt><dd>{review.wallet.expectedRole} · <code>{accounts[review.wallet.expectedRole].address}</code> · 296 / 0 HBAR</dd></div>
      <div><dt>Asset / partition</dt><dd><code>{review.input.securityAddress}</code> / <code>{review.input.partition}</code></dd></div>
      <div><dt>Holder / Escrow</dt><dd>Seller / Admin</dd></div><div><dt>Hold ID / target</dt><dd>{review.input.holdId ?? 'Read from successful HeldByPartition event'} / {review.action === 'release' ? 'Seller (original holder)' : review.action === 'create-hold' ? 'Zero address' : 'Buyer'}</dd></div>
      <div><dt>Reviewed expiry basis</dt><dd>Block {review.input.baseBlock} · {review.input.baseTimestamp} + 86400 = {review.input.expirationTimestamp} Unix seconds</dd></div>
      <div><dt>Data</dt><dd>Empty (0x)</dd></div>{review.kyc && <div><dt>Buyer KYC inputs</dt><dd>{review.kyc.vcId} · {review.kyc.issuer} · {review.kyc.validFrom}–{review.kyc.validTo} · digest {review.kyc.digest}</dd></div>}
      <div><dt>Calldata digest</dt><dd><code>{review.digest ?? 'Verify Buyer VC first'}</code></dd></div></dl>
      {simulation && <p>{review.action === 'kyc-negative' ? 'Read-only execute 6: Admin (Escrow) to Buyer; SDK rejection and matching eth_call.' : 'Read-only execute 6 from Seller must reject non-Escrow; execute 11 from Admin must reject the amount.'}</p>}
      <details><summary>Exact reviewed calldata</summary><p className="address"><code>{review.calldata ?? 'Not prepared'}</code></p>{review.overAmountCalldata && <><p>Admin execute 11:</p><p className="address"><code>{review.overAmountCalldata}</code></p></>}</details>
      <label className="review-check"><input type="checkbox" checked={approved} disabled={locked || !review.calldata} onChange={e=>setApproved(e.target.checked)}/>I reviewed this action, required account, fixed asset, Hold, amounts and exact expiry.</label></>}
    <div className="actions"><button disabled={locked || !approved || !review?.calldata || (!simulation && !preview)} onClick={run}>{simulation ? 'Run read-only T04 checks' : 'Approve T04 transaction in MetaMask'}</button></div>
    <p className="deployment-note">Hold or KYC expiry stops the flow. No automatic renewal, reclaim, new asset, issuance or resubmission.</p>
    <details><summary>Recover and export T04 evidence</summary><p>Query submitted or unknown operations. Preserve each public export. Simulations have no transaction ID.</p>
      <label className="text-field">Restore an exported public T04 operation (JSON)
        <input type="file" accept="application/json,.json" disabled={locked || reading} onChange={async e=>{
          const file = e.target.files?.[0]; e.target.value = ''; if(!file || getOperationBusy())return;
          const lease = acquireOperation(); setReview(undefined);setApproved(false);setState(undefined);
          try{if(file.size > 100000)throw new Error('Public evidence file is too large. Select one T04 operation export.');setRecords(await restoreHoldEvidence(JSON.parse(await file.text())));setMessage('Public evidence restored. Query its hash; imported completion is not accepted as chain proof.');}
          catch(error){setMessage(error instanceof Error ? error.message : 'Invalid public operation export.');}finally{releaseOperation(lease);}
        }}/>
      </label>
      <label className="text-field">T04 recorded action<select value={action} disabled={locked} onChange={e=>setAction(e.target.value as HoldTransaction['action'])}>{(['create-hold','buyer-kyc','execute','release'] as const).map(a=><option value={a} key={a}>{holdLabels[a]}</option>)}</select></label>
      <label className="text-field">T04 public transaction hash<input value={hash} maxLength={66} disabled={locked} onChange={e=>setHash(e.target.value)} autoComplete="off" spellCheck={false}/></label>
      <label className="text-field">Original reviewed base block (creation recovery without a saved intent)<input value={baseBlock} inputMode="numeric" disabled={locked} onChange={e=>setBaseBlock(e.target.value)} autoComplete="off"/></label>
      <button disabled={locked || !/^0x[\da-f]{64}$/i.test(hash.trim())} onClick={()=>read('recover')}>Query T04 transaction</button>
      <ol>{records.map(r=><li key={r.operationId}>{holdLabels[r.action]} · saved {r.status} · {r.kind === 't04-simulation' ? 'Read-only simulation; no transaction ID' : 'Transaction'}
        <p className="address"><code>{r.kind === 't04-transaction' ? r.transactionHash ?? 'No hash recorded. Check MetaMask.' : r.cases.map(c=>c.revert).join(', ')}</code></p>
        {r.kind === 't04-transaction' && <button className="secondary" disabled={locked} onClick={()=>{setHash(r.transactionHash ?? '');setAction(r.action);setBaseBlock(r.input.baseBlock);}}>Select T04 query</button>}{' '}
        <button className="secondary" onClick={()=>downloadEvidence(r)}>Export T04 public evidence</button>
      </li>)}</ol>
    </details>
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
      <div className="comparison-table"><table><caption>Creation-block settings; current supply is shown in T04</caption><thead><tr><th>Setting</th><th>Expected</th><th>Observed</th><th>Result / source</th></tr></thead>
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
      <p className="deployment-note">This verifies the SDK config read only. Recheck before each T04 transaction. T02 creation is closed.</p>
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
  const [verifiedBuyer, setVerifiedBuyer] = useState<VerifiedCredential>();
  useEffect(() => { setVerifiedBuyer(undefined); }, [session]);
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
          <div className="actions"><button type="button" disabled={busy || locked} aria-describedby="wallet-status" onClick={handleWallet}>{connection.isConnected ? 'Disconnect' : 'Connect'}</button></div>
          {walletMessage && <p role="alert">{walletMessage}</p>}
        </section>

        {saved.warning && <p className="storage-warning" role="alert">{saved.warning}</p>}
        <Accounts key={session} session={session} address={connection.address} ready={ready} roles={saved.roles} changeRoles={changeRoles} />

        <Deployment />
        <Hold activeAccount={connection.address} roles={saved.roles} session={session} buyer={verifiedBuyer?.session === session ? verifiedBuyer : undefined} />
        <Credentials key={`credential-${session}`} roles={saved.roles} onVerified={setVerifiedBuyer} />
        <Nova session={session} />
        <Lifecycle session={session} />

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
              <div><dt>Security ID</dt><dd>See NOVA operation result</dd></div>
            </dl>
            <p>Use the NOVA operation result above for verified on-chain data.</p>
          </section>

          <section aria-labelledby="sequence-heading">
            <h2 id="sequence-heading">Verification sequence</h2>
            <ol>
              <li><strong>ATS readiness</strong><span>Connect three accounts, resolve config, verify a test VC.</span></li>
              <li><strong>Create NOVA</strong><span>Completed. Query the original creation history above.</span></li>
              <li><strong>Seller KYC &amp; issuance</strong><span>Completed. Verify the six historical transactions above.</span></li>
              <li><strong>Prove the Hold lifecycle</strong><span>Create Hold 10, prove negative checks, grant Buyer KYC, execute 6 and release 4.</span></li>
            </ol>
            <p>Lifecycle steps require separate verification. Victor approves each signature in MetaMask.</p>
          </section>
        </div>

        <section className="evidence" aria-labelledby="evidence-heading">
          <h2 id="evidence-heading">Transaction evidence</h2>
          <p>Use the T02, T03 and T04 panels to query existing transactions and export public results. Local records alone do not establish chain success.</p>
        </section>
      </main>

      <footer>
        <p>Testnet demonstration only. No real securities, identity checks, or legal compliance claims.</p>
        <a href="https://github.com/outsider987/hedera-rwa-secondary-market/blob/main/docs/HANDOFF.md">Read the project handoff</a>
      </footer>
    </>
  );
}

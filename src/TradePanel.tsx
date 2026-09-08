import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {getOperationBusy,subscribeOperation,acquireOperation,releaseOperation,type Roles} from './guards';
import {accounts,type LifecycleState} from './lifecycle';
import {readHoldState,type HoldState} from './hold';
import {isCreationOrigin} from './nova';
import {downloadEvidence,type TradeRecord,type TradeTransaction} from './evidence';
import {tradeStorageKey,loadTradeRecords,nextTradeStep,readSwap,reviewTrade,runTrade,recoverTrade,restoreTrade,tradeLabels,tradeSigner,unresolvedTrade,type TradeReview,type TradeStep} from './trade';

export function Balances({state}:{state:LifecycleState}) {
  return <dl className="balance-list"><div><dt>Seller available / held</dt><dd>{state.sellerBalance} / {state.sellerHeld} NOVA</dd></div>
    <div><dt>Buyer available / held</dt><dd>{state.buyerBalance} / {state.buyerHeld} NOVA</dd></div>
    <div><dt>Supply / cap</dt><dd>{state.supply} / 1,000 NOVA</dd></div></dl>;
}
export default function TradePanel({roles,session,activeAccount,records,onRecords}:{roles:Roles;session:number;activeAccount?:string;records:TradeRecord[];onRecords:(r:TradeRecord[])=>void}) {
  const locked=useSyncExternalStore(subscribeOperation,getOperationBusy,()=>false);
  const [state,setState]=useState<HoldState>(),[swapState,setSwapState]=useState<number>(),[review,setReview]=useState<TradeReview>();
  const [approved,setApproved]=useState(false),[working,setWorking]=useState<'read'|'send'>(),[message,setMessage]=useState('Check readiness before reviewing the first transaction.');
  const [problem,setProblem]=useState(''),[operationId,setOperationId]=useState(''),[hash,setHash]=useState('');
  const controller=useRef<AbortController|undefined>(undefined),mounted=useRef(true);
  const preview=typeof window !== 'undefined' && isCreationOrigin(window.location.origin,import.meta.env.PROD);
  function invalidate() {controller.current?.abort();setState(undefined);setSwapState(undefined);setReview(undefined);setApproved(false);setWorking(undefined);}
  useEffect(()=>{invalidate();setMessage('Check readiness with the current account.');},[session]);
  useEffect(()=>{
    mounted.current=true;
    const refresh=(event?:StorageEvent)=>{if(event && event.key !== null && event.key !== tradeStorageKey)return;invalidate();try{onRecords(loadTradeRecords());setProblem('');}catch{setProblem('T05 storage is invalid. Restore the original public intent; do not clear it.');}};
    refresh();window.addEventListener('storage',refresh);
    return()=>{mounted.current=false;controller.current?.abort();window.removeEventListener('storage',refresh);};
  },[]);
  const deployment=records.find((r):r is TradeTransaction=>r.kind === 't05-transaction' && r.action === 'deploy' && r.status === 'complete');
  const lock=records.find(r=>r.action === 'lock' && r.status === 'complete');
  const pending=records.find(unresolvedTrade);
  const bound=Object.entries(accounts).every(([role,a])=>roles[role as keyof Roles] === a.address);
  let step:TradeStep|undefined,stageProblem='';
  if(state) {try{step=nextTradeStep(state,records,swapState);}catch(e){stageProblem=e instanceof Error ? e.message : 'Recover the original operation.';}}
  const required=review?.wallet.expectedRole ?? (step ? tradeSigner(step) : !deployment ? 'Admin' : !lock ? 'Seller' : 'Buyer');
  const cancelled=records.some(r=>['cancel','reclaim'].includes(r.action) && r.status === 'complete');
  const progressIndex=step === 'complete' ? 3 : !deployment ? 0 : !lock ? 1 : 2;
  const transactionRecords=records.filter((r):r is TradeTransaction=>r.kind === 't05-transaction');
  const selected=transactionRecords.find(r=>r.operationId === operationId);
  const canCancel=step === 'purchase-negative' || step === 'settle';
  function begin() {
    if(getOperationBusy() || working)return;
    const current=new AbortController();controller.current=current;setWorking('read');setReview(undefined);setApproved(false);setProblem('');
    return {current,signal:AbortSignal.any([current.signal,AbortSignal.timeout(180000)])};
  }
  async function check(mode:'state'|'review'|'cancel'|'recover') {
    const started=begin();if(!started)return;const {current,signal}=started;
    try {
      if(mode === 'recover') {
        // Recovery changes the journal; an older balance/runtime pair cannot describe it.
        setState(undefined);setSwapState(undefined);
        setMessage('Querying the original receipt and Mirror evidence…');
        const result=await recoverTrade(operationId,hash.trim(),signal,onRecords);signal.throwIfAborted();
        setMessage(`Operation ${result.status}. Check readiness before another review.`);
      } else if(mode === 'review' || mode === 'cancel') {
        const result=await reviewTrade(roles,signal,setMessage,mode === 'cancel');signal.throwIfAborted();setReview(result);setState(result.state);
        onRecords(loadTradeRecords());setMessage('Review the action, account, amount and expiry below.');
      } else {
        const lease=acquireOperation();try {
          const currentState=await readHoldState(signal,undefined,setMessage),currentRecords=loadTradeRecords();
          const deployed=currentRecords.find(r=>r.action === 'deploy' && r.status === 'complete');
          const codeState=deployed ? await readSwap(deployed.input,currentState.block,signal) : undefined;
          signal.throwIfAborted();setState(currentState);setSwapState(codeState);onRecords(currentRecords);
          setMessage('Current balances checked. Each review verifies saved history and the active account again.');
        } finally {releaseOperation(lease);}
      }
    } catch(e) {if(!current.signal.aborted)setProblem(e instanceof Error ? e.message : 'Check incomplete. Recover the original hash.');}
    finally {if(controller.current === current && mounted.current)setWorking(undefined);}
  }
  async function submit() {
    if(!review || !approved || getOperationBusy() || working)return;
    const current=new AbortController();controller.current=current;setWorking('send');setApproved(false);setProblem('');setState(undefined);
    try {
      const result=await runTrade(review,onRecords,current.signal,setMessage);
      if(mounted.current && !current.signal.aborted) {
        if(result.after)setState(result.after);
        if(result.kind === 't05-transaction') {setSwapState(result.swapState);setOperationId(result.operationId);setHash(result.transactionHash ?? '');}
        setMessage(result.status === 'complete' ? 'Evidence verified. Check readiness for the next manual review.' : `Operation ${result.status}. Query the original hash; do not repeat the transaction.`);
      }
    } catch(e) {if(mounted.current)setProblem(e instanceof Error ? e.message : 'Operation stopped. Check MetaMask and recover the original hash.');}
    finally {if(mounted.current){setReview(undefined);setWorking(undefined);}}
  }
  const simulation=review?.action.endsWith('negative');
  return <section aria-labelledby="trade-heading" className="trade-layout">
    <div className="trade-main">
      <div className="quote"><div><h2 id="trade-heading">10 NOVA</h2><p>0.1 HBAR per NOVA</p></div><div><p>Total</p><p className="quote-total">1 HBAR</p></div></div>
      <ol className="trade-progress" aria-label="Trade progress">{['Setup','Lock','Buy',cancelled ? 'Returned' : 'Complete'].map((name,i)=><li key={name} aria-current={i === progressIndex ? 'step' : undefined}><span>{i < progressIndex ? 'Done · ' : ''}{name}</span></li>)}</ol>
      <p className="muted">{records.length ? 'Saved progress. Review rechecks receipts and chain state.' : 'One trade on Hedera Testnet. Network fees are additional.'}</p>
      <section className="trade-action" aria-labelledby="action-heading">
        <h3 id="action-heading">{review ? tradeLabels[review.action] : step ? cancelled && step === 'complete' ? '10 NOVA returned to Seller' : tradeLabels[step] : 'Prepare this trade'}</h3>
        <p>Required account: <strong>{required}</strong>{activeAccount?.toLowerCase() === accounts[required].address ? ' · selected' : ' · select in MetaMask'}.</p>
        <p role="status" aria-live="polite">{message}</p>
        {(problem || stageProblem) && <p role="alert">{problem || stageProblem}</p>}
        {pending && <p className="pending-notice" role="status">{pending.status === 'awaiting-signature' ? 'Check the open MetaMask request.' : 'This operation needs receipt recovery.'} Complete or reject it there; an unknown result cannot be resubmitted.</p>}
        {!bound && <p>Bind the original Admin, Seller and Buyer accounts in <a href="#settings">Settings</a>.</p>}
        {review && <div className="trade-review">
          <h4>Review {simulation ? 'read-only checks' : 'transaction'}</h4>
          <dl className="wallet-details"><div><dt>Account / chain</dt><dd>{review.wallet.expectedRole} / Hedera Testnet 296</dd></div>
            <div><dt>Wallet value</dt><dd>{review.action === 'settle' ? '1 HBAR' : '0 HBAR'}{simulation ? ' · no transaction' : ' + network fee'}</dd></div>
            <div><dt>Asset / amount</dt><dd>NOVA 0.0.10402368 / 10 shares</dd></div>
            <div><dt>Recipient</dt><dd>{['cancel','reclaim'].includes(review.action) ? 'Seller — return held shares' : review.action === 'deploy' ? 'New fixed swap contract' : 'Buyer — 10 NOVA; Seller — 1 HBAR on purchase'}</dd></div>
            <div><dt>Expiry (UTC)</dt><dd>{new Date(Number(review.input.expirationTimestamp)*1000).toISOString()}</dd></div></dl>
          {simulation && <p>Public eth_call only. Expected contract rejections have no signature or transaction ID.</p>}
          <label className="review-check"><input type="checkbox" checked={approved} disabled={locked || !!working} onChange={e=>setApproved(e.target.checked)}/>I reviewed the account, chain, fixed trade, expiry and transaction details. No unknown operation is outstanding in MetaMask.</label>
        </div>}
        <div className="actions">
          {review ? <button disabled={locked || !!working || !approved || !simulation && !preview} onClick={submit}>{simulation ? 'Run read-only checks' : 'Approve in MetaMask'}</button>
            : step === 'complete' ? <a className="button-link" href="#history">View trade evidence</a>
            : state && !bound ? <a className="button-link" href="#settings">Set up accounts</a>
            : <button disabled={locked || !!working || !!pending} onClick={()=>check(state && bound && !problem && !stageProblem ? 'review' : 'state')}>{problem || stageProblem ? 'Check readiness again' : !state ? 'Check readiness' : step === 'settle' ? 'Review purchase' : 'Review '+(step === 'deploy' ? 'deployment' : step === 'lock' ? 'Hold' : step === 'reclaim' ? 'reclaim' : 'checks')}</button>}
          {working === 'read' && <button className="secondary" onClick={()=>{controller.current?.abort();setWorking(undefined);setMessage('Read cancelled. Existing transactions are retained.');}}>Cancel check</button>}
          {canCancel && !review && <button className="secondary" disabled={locked || !!working} onClick={()=>check('cancel')}>Review cancellation</button>}
        </div>
        {!preview && review && !simulation && <p>Open <a href="http://127.0.0.1:4173">production preview</a> for manual transactions.</p>}
      </section>
      <details className="transaction-details"><summary>Transaction details</summary>
        <dl className="wallet-details">{Object.entries(accounts).map(([name,a])=><div key={name}><dt>{name}</dt><dd><code>{a.address}</code> · {a.accountId}</dd></div>)}
          <div><dt>Swap escrow</dt><dd><code>{review?.input.escrow ?? deployment?.input.escrow ?? 'Not deployed'}</code></dd></div>
          {review && <><div><dt>Expiry basis</dt><dd>Block {review.input.baseBlock}: {review.input.baseTimestamp} + 86400 = {review.input.expirationTimestamp} seconds</dd></div>
            <div><dt>Partition</dt><dd><code>{review.input.partition}</code></dd></div><div><dt>Hold ID</dt><dd>{review.input.holdId ?? 'Read from the creation event'}</dd></div>
            <div><dt>Wallet / EVM units</dt><dd>{review.action === 'settle' ? '1000000000000000000 weibars / 100000000 tinybars' : '0 weibars / 0 tinybars'}</dd></div>
            <div><dt>Calldata</dt><dd><code>{review.calldata ?? 'Exact rejection calldata is exported after the read-only checks.'}</code></dd></div></>}</dl>
        <button className="secondary" disabled={locked || !!working} onClick={()=>check('state')}>Check current balances</button>
      </details>
      <details className="recovery" open={!!pending}><summary>Recover an existing operation</summary><p>Keep the original hash and public intent. Query only; this does not submit a transaction.</p>
        <label className="text-field">Saved operation<select value={operationId} disabled={locked || !!working} onChange={e=>{setOperationId(e.target.value);setHash(transactionRecords.find(r=>r.operationId === e.target.value)?.transactionHash ?? '');}}><option value="">Select an operation</option>{transactionRecords.map(r=><option key={r.operationId} value={r.operationId}>{r.action} · {r.status}</option>)}</select></label>
        <label className="text-field">Original transaction hash<input value={hash} maxLength={66} disabled={locked || !!working} onChange={e=>setHash(e.target.value)} autoComplete="off" spellCheck={false}/></label>
        <button className="secondary" disabled={locked || !!working || !selected || !/^0x[\da-f]{64}$/i.test(hash)} onClick={()=>check('recover')}>Query original hash</button>
        {selected && <button className="secondary" onClick={()=>downloadEvidence(selected)}>Export public intent</button>}
        <label className="text-field">Restore original public transaction JSON<input type="file" accept="application/json,.json" disabled={locked || !!working} onChange={async e=>{
          const file=e.target.files?.[0];e.target.value='';if(!file || getOperationBusy())return;invalidate();
          try {if(file.size>100000)throw new Error('Select one public operation under 100 KB.');const records=await restoreTrade(JSON.parse(await file.text()));onRecords(records);setProblem('');setMessage('Intent restored. Query its original hash; imported completion is not chain proof.');}
          catch(error){setProblem(error instanceof Error ? error.message : 'Invalid public intent.');}
        }}/></label>
      </details>
    </div>
    <aside className="trade-summary" aria-labelledby="summary-heading"><h3 id="summary-heading">Trade summary</h3>
      <dl><div><dt>Seller delivers</dt><dd>10 NOVA</dd></div><div><dt>Buyer pays</dt><dd>1 HBAR</dd></div><div><dt>Settlement</dt><dd>One atomic transaction</dd></div><div><dt>Acceptance</dt><dd>Pending Victor verification</dd></div></dl>
      <p>Delivery and payment both succeed or both revert. Seller can cancel before purchase or reclaim after expiry.</p>
      {state ? <><h4>Current balance snapshot</h4><p>Block {state.block}</p><Balances state={state}/></> : <p className="muted">Current balances have not been checked in this session.</p>}
      <p className="muted">Setup details and missing account bindings are in <a href="#settings">Settings</a>. Historical results are in <a href="#history">History</a>.</p>
    </aside>
  </section>;
}

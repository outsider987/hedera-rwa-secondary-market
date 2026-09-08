import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getOperationBusy, subscribeOperation } from './guards';
import { downloadEvidence, type TradeRecord } from './evidence';
import TradePanel from './TradePanel';
import { tradeLabels } from './trade';
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
      <div className="comparison-table"><table><caption>Creation-block settings; current balances are shown in Market</caption><thead><tr><th>Setting</th><th>Expected</th><th>Observed</th><th>Result / source</th></tr></thead>
        <tbody>{record.comparisons.map(row => <tr key={row.field}><th scope="row">{row.field}</th><td>{row.expected || 'Empty'}</td><td>{row.actual || 'Empty'}</td><td>{row.matches ? 'Match' : 'Mismatch'} · {row.source}</td></tr>)}</tbody></table></div>
    </details>}
  </section>;
}

export default function ActivityPage({ visible, session, tradeRecords }: { visible: boolean; session: number; tradeRecords: TradeRecord[] }) {
  return <section id="asset-history" hidden={!visible} aria-labelledby="history-heading" className="page-section">
        <h2 id="history-heading">Verified asset history</h2><p>These are dated Testnet results. Current balances and new trades are in <a href="#market">Market</a>.</p>
        <TradePanel/>
        <section className="history-section"><h3>T05 · Atomic trade</h3><p>T05 acceptance is complete. Saved journal entries below are historical records; use the verification above to check the original block.</p>
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
      </section>;
}

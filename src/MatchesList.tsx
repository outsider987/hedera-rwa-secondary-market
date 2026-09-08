import { accounts } from './lifecycle';
import { hbar, type Market } from './market';
import { settlementAction, settlementStatus, type readSettlements } from './settlement';

export default function MatchesList({ market, settlementData, owner, matchFilter, setMatchFilter, freshMatch, onSelect }: {
  market?: Market; settlementData?: Awaited<ReturnType<typeof readSettlements>>; owner: string;
  matchFilter: 'Active' | 'Needs your action' | 'Completed' | 'All';
  setMatchFilter: (filter: 'Active' | 'Needs your action' | 'Completed' | 'All') => void;
  freshMatch: (id: string) => boolean; onSelect: (id: string) => void;
}) {
  return <section className="market-history" aria-labelledby="matches-heading"><div className="market-history-heading"><h3 id="matches-heading">Matches</h3><label>Show<select aria-label="Match filter" value={matchFilter} onChange={e=>setMatchFilter(e.target.value as typeof matchFilter)}>{['Active','Needs your action','Completed','All'].map(v=><option key={v}>{v}</option>)}</select></label></div>
   <p className="muted">Matched does not mean settled. Select a match for its next step.</p>
   <ul className="market-orders">{(market?.matches??[]).filter(m=>owner===accounts.Admin.address||m.seller===owner||m.buyer===owner).filter(m=>{const s=settlementData?.settlements.find(s=>s.id===m.id),finished=s&&['Settled','Cancelled','Reclaimed','Returned'].includes(s.status);return matchFilter==='All'||matchFilter==='Completed'?matchFilter==='All'||finished:matchFilter==='Needs your action'?freshMatch(m.id)&&(s?!!settlementAction(s,owner,BigInt(Math.floor(Date.now()/1000))):owner===m.seller):freshMatch(m.id)&&!finished;}).slice().reverse().map(m=>{const s=settlementData?.settlements.find(s=>s.id===m.id);return <li key={m.id}><div><strong>{m.quantity} NOVA @ {hbar(m.price)} HBAR</strong><p>{s?settlementStatus(s,BigInt(Math.floor(Date.now()/1000))):freshMatch(m.id)?'Waiting for seller':'Historical · Matched · Not settled'}</p><p className="muted">Match {m.id} · {new Date(Number(m.time)*1000).toLocaleString()}</p><button className="secondary" onClick={()=>onSelect(m.id)}>View match {m.id}</button><details><summary>Match {m.id} details</summary><p>Buyer: {m.buyer===accounts.Buyer.address?'Buyer account':'Seller account'} · Seller: {m.seller===accounts.Seller.address?'Seller account':'Buyer account'}</p><p className="address">Maker {m.maker}<br/>Taker {m.taker}</p></details></div></li>;})}</ul>
   {!market?.matches.length&&<p>No matches yet. Matching does not prove payment or delivery.</p>}
   {matchFilter==='Active'&&!settlementData?.settlements.length&&<p>No active settlements. Select All to inspect historical matches.</p>}
  </section>;
}

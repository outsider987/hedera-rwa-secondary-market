import {matchAction} from '../presentation/marketTasks';
import { accounts } from '../lib/lifecycle';
import { hbar, type Market } from '../lib/market';
import { settlementStatus, type readSettlements } from '../lib/settlement';

export default function MatchesList({ online, settlementOnline, market, settlementData, owner, matchFilter, setMatchFilter, freshMatch, onSelect }: {
  online: boolean; settlementOnline: boolean; market?: Market; settlementData?: Awaited<ReturnType<typeof readSettlements>>; owner: string;
  matchFilter: 'Active' | 'Needs your action' | 'Completed' | 'All';
  setMatchFilter: (filter: 'Active' | 'Needs your action' | 'Completed' | 'All') => void;
  freshMatch: (id: string) => boolean; onSelect: (id: string) => void;
}) {
  const shownMatches = (market?.matches??[]).filter(m=>owner===accounts.Admin.address||m.seller===owner||m.buyer===owner).filter(m=>{const s=settlementData?.settlements.find(s=>s.id===m.id),finished=s&&['Settled','Cancelled','Reclaimed','Returned'].includes(s.status);return matchFilter==='All'||matchFilter==='Completed'?matchFilter==='All'||finished:matchFilter==='Needs your action'?!!matchAction(m,s,owner,!!settlementData&&freshMatch(m.id),BigInt(Math.floor(Date.now()/1000))):freshMatch(m.id)&&!finished;}).slice().reverse();
  return <section className="market-history" aria-labelledby="matches-heading"><div className="market-history-heading"><h3 id="matches-heading" tabIndex={-1}>Matches</h3><label>Show<select aria-label="Match filter" value={matchFilter} onChange={e=>setMatchFilter(e.target.value as typeof matchFilter)}>{['Active','Needs your action','Completed','All'].map(v=><option key={v}>{v}</option>)}</select></label></div>
   <p className="muted">Matched does not mean settled. Select a match for its next step.</p>
   <ul className="market-orders">{shownMatches.map(m=>{const s=settlementData?.settlements.find(s=>s.id===m.id);return <li key={m.id}><div><strong>{m.quantity} NOVA @ {hbar(m.price)} HBAR</strong><p>{!settlementData?'Settlement status unavailable':s?settlementStatus(s,BigInt(Math.floor(Date.now()/1000))):freshMatch(m.id)?'Waiting for seller':'Historical · Matched · Not settled'}</p><p className="muted">Match {m.id} · {new Date(Number(m.time)*1000).toLocaleString()}</p><button className="secondary" onClick={()=>onSelect(m.id)}>View match {m.id}</button><details><summary>Match {m.id} details</summary><p>Buyer: {m.buyer===accounts.Buyer.address?'Buyer account':'Seller account'} · Seller: {m.seller===accounts.Seller.address?'Seller account':'Buyer account'}</p><p className="address">Maker {m.maker}<br/>Taker {m.taker}</p></details></div></li>;})}</ul>
   {market&&(!online||!settlementOnline)&&<p role="status">{!online?'Market unavailable. Showing last received matches.':settlementData?'Settlement updates unavailable. Showing last received status.':'Settlement status unavailable. Waiting for an update.'}</p>}
   {!shownMatches.length&&<p role="status">{!owner?'Connect a trading account to view its matches.':!market?'Market data unavailable. Waiting for an update.':!settlementData&&matchFilter!=='All'?'Matches for this filter cannot be confirmed until settlement status is available.':matchFilter==='Active'?'No active matches in the received data.':matchFilter==='Needs your action'?'No matches need your action in the received data.':matchFilter==='Completed'?'No completed matches in the received data.':'No matches for this account in the received data.'} {market&&owner&&matchFilter!=='All'&&<button className="secondary" onClick={()=>setMatchFilter('All')}>Show all matches</button>}</p>}
  </section>;
}

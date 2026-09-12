import {accounts} from '../lib/lifecycle';
import {hbar,type Market} from '../lib/market';
import {settlementLabels,type readSettlements} from '../lib/settlement';
import {matchAction} from '../presentation/marketTasks';

export default function MarketNextActions({market,settlementData,owner,online,busy,blocker,onRecover,freshMatch,onSelect,onAll}:{
 market?:Market;settlementData?:Awaited<ReturnType<typeof readSettlements>>;owner:string;online:boolean;busy:boolean;
 blocker?:string;onRecover:()=>void;freshMatch:(id:string)=>boolean;onSelect:(id:string)=>void;onAll:(filter:'Needs your action'|'Active')=>void;
}){
 const now=BigInt(Math.floor(Date.now()/1000));
 const tasks=(market?.matches??[]).map(match=>({match,action:matchAction(match,settlementData?.settlements.find(s=>s.id===match.id),owner,!!settlementData&&freshMatch(match.id),now)})).filter(task=>task.action);
 const trader=owner===accounts.Seller.address||owner===accounts.Buyer.address;
 return <section className="market-next-actions" aria-labelledby="next-actions-heading">
  <div className="market-task-heading"><h3 id="next-actions-heading" tabIndex={-1}>Your next step</h3><span>{owner===accounts.Admin.address?'Admin account':owner===accounts.Seller.address?'Seller account':owner===accounts.Buyer.address?'Buyer account':'No trading account'}</span></div>
  {blocker?<><p role="status">{blocker}</p><button className="secondary" disabled={busy} onClick={onRecover}>View original operation</button></>:!trader?<p>{owner===accounts.Admin.address?'Admin monitors the market. Seller and Buyer accounts handle their own matches.':'Connect Seller or Buyer to see the matches that need your action.'}</p>:!online||!market||!settlementData?<p role="status">Waiting for current market and settlement data. Next actions are not confirmed.</p>:tasks.length?<>
   <p role="status">{tasks.length===1?'1 match needs this account.':`${tasks.length} matches need this account.`} Open a match to review its next step.</p>
   <ul>{tasks.slice(0,3).map(({match,action})=><li key={match.id}><div><strong>{action==='settle'?'Review payment':settlementLabels[action!]}</strong><span>Match {match.id} · {match.quantity} NOVA for {hbar(match.notional)} HBAR</span></div><button disabled={busy} onClick={()=>onSelect(match.id)}>Open match {match.id}</button></li>)}</ul>
   {tasks.length>3&&<button className="secondary" onClick={()=>onAll('Needs your action')}>View all {tasks.length} tasks</button>}
  </>:<><p>No match needs this account right now. You can place an order or check matches waiting on another account.</p><button className="secondary" onClick={()=>onAll('Active')}>View active matches</button></>}
 </section>;
}

import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {getOperationBusy,subscribeOperation,type Roles} from './guards';
import {accounts} from './lifecycle';
import {amount,hbar,loadIntent,marketEvidence,marketStorageKey,pending,prepareOrder,readMarket,recoverIntent,signOrder,status,type Intent,type Market,type Order,type Review,type Side} from './market';

export default function MarketPanel({visible,roles,session,activeAccount}:{visible:boolean;roles:Roles;session:number;activeAccount?:string}){
 const locked=useSyncExternalStore(subscribeOperation,getOperationBusy,()=>false);
 const [market,setMarket]=useState<Market>(),[online,setOnline]=useState(false),[last,setLast]=useState('');
 const [intent,setIntent]=useState<Intent>(),[storageProblem,setStorageProblem]=useState(''),[problem,setProblem]=useState('');
 const [side,setSide]=useState<Side>('Sell'),[quantity,setQuantity]=useState('4'),[price,setPrice]=useState('0.09');
 const [review,setReview]=useState<Review>(),[approved,setApproved]=useState(false),[working,setWorking]=useState(false);
 const controller=useRef<AbortController|undefined>(undefined),epoch=useRef(0);
 const owner=activeAccount?.toLowerCase()??'',trader=owner===accounts.Seller.address||owner===accounts.Buyer.address;
 const preview=typeof window!=='undefined'&&window.location.origin==='http://127.0.0.1:4173'&&import.meta.env.PROD;
 useEffect(()=>{epoch.current++;controller.current?.abort();setReview(undefined);setApproved(false);},[session,visible]);
 useEffect(()=>{const load=()=>{try{setIntent(loadIntent());setStorageProblem('');}catch{setStorageProblem('Saved intent is invalid. Keep the original request and restore its public record before signing.');}};load();const changed=(e:StorageEvent)=>{if(e.key===marketStorageKey||e.key===null)load();};window.addEventListener('storage',changed);return()=>{window.removeEventListener('storage',changed);controller.current?.abort();};},[]);
 useEffect(()=>{
  if(!visible)return;const abort=new AbortController();let timer:ReturnType<typeof setTimeout>;
  async function refresh(){if(document.hidden){timer=setTimeout(refresh,2000);return;}try{const m=await readMarket(abort.signal);abort.signal.throwIfAborted();setMarket(m);setOnline(true);setLast(new Date().toLocaleTimeString());if(pending(loadIntent())){const v=await recoverIntent(abort.signal);abort.signal.throwIfAborted();setIntent(v);}}catch{if(!abort.signal.aborted)setOnline(false);}finally{if(!abort.signal.aborted)timer=setTimeout(refresh,2000);}}
  void refresh();return()=>{abort.abort();clearTimeout(timer);};
 },[visible]);
 const disabled=locked||working||!online||!preview||!trader||!!storageProblem||pending(intent);
 let total='',inputProblem='';try{total=hbar(amount(quantity,price).notional);}catch(e){inputProblem=e instanceof Error?e.message:'Invalid amount.';}
 async function prepare(cancel?:Order){if(disabled)return;const current=new AbortController();controller.current=current;const revision=epoch.current;setWorking(true);setProblem('');setReview(undefined);setApproved(false);try{const v=await prepareOrder(roles,owner,side,quantity,price,current.signal,cancel);if(revision===epoch.current&&!current.signal.aborted)setReview(v);}catch(e){if(!current.signal.aborted)setProblem(e instanceof Error?e.message:'Review incomplete.');}finally{setWorking(false);}}
 async function sign(){if(!review||!approved||disabled)return;const current=new AbortController();controller.current=current;setWorking(true);setApproved(false);setProblem('');try{await signOrder(review,current.signal,setIntent);}catch{setProblem('Signature or submission incomplete. If an intent was saved, query that request; it will not be resent.');}finally{setWorking(false);setReview(undefined);}}
 async function recover(){if(working)return;const current=new AbortController();controller.current=current;setWorking(true);setProblem('');try{setIntent(await recoverIntent(current.signal));}catch{setProblem('Recovery unavailable. Keep the original request; no new submission is allowed.');}finally{setWorking(false);}}
 function exportPublic(){if(!market)return;const url=URL.createObjectURL(new Blob([JSON.stringify(marketEvidence(market,intent),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='holdbook-unfunded-market.json';a.click();URL.revokeObjectURL(url);}
 const open=market?.orders.filter(o=>BigInt(o.remaining)>0n)??[];
 const myOrders=market?.orders.filter(o=>o.owner===owner)??[];
 return <section className="page-section market" aria-labelledby="market-heading">
  <div className="market-heading"><div><h2 id="market-heading">NOVA / HBAR</h2><p>Limit orders · Hedera Testnet</p></div><p><span role="status">{online?'Live':'Offline'}</span>{last?' · Last updated '+last:' · Waiting for market'}</p></div>
  <p className="notice"><strong>Funds are not reserved.</strong> Matches are unfunded intents. No NOVA or HBAR is transferred.</p>
  <div className="market-layout">
   <section aria-labelledby="order-heading"><h3 id="order-heading">{review?'Review '+review.record.prepared.action.toLowerCase():'Place a limit order'}</h3>
    {!trader&&<p>{owner===accounts.Admin.address?'Admin is view-only.':'Connect Seller or Buyer to trade.'} Both trading accounts can buy and sell.</p>}
    {!preview&&<p>Use <a href="http://127.0.0.1:4173">production preview</a> to prepare and sign orders.</p>}
    {!online&&<p>Market unavailable. Last received data is retained; new submissions are disabled.</p>}
    {review?<div className="market-review">
     <dl><div><dt>Account</dt><dd>{review.wallet.expectedRole}</dd></div><div><dt>Action</dt><dd>{review.record.prepared.action==='Cancel'?'Cancel remaining quantity':review.record.prepared.side+' '+review.record.prepared.quantity+' NOVA'}</dd></div>
      {review.record.prepared.action==='Place'?<><div><dt>Limit price</dt><dd>{hbar(review.record.prepared.price)} HBAR</dd></div><div><dt>Maximum intent amount</dt><dd>{hbar((BigInt(review.record.prepared.price)*BigInt(review.record.prepared.quantity)).toString())} HBAR</dd></div><div><dt>Order expires (UTC)</dt><dd>{new Date(Number(review.record.prepared.expiresAt)*1000).toISOString()}</dd></div></>:<div><dt>Order</dt><dd>{review.record.prepared.orderId}</dd></div>}
      <div><dt>Sign before (UTC)</dt><dd>{new Date(Number(review.record.prepared.deadline)*1000).toISOString()}</dd></div></dl>
     <p>Unfunded intent only. No assets reserved or transferred.</p>
     <label className="review-check"><input type="checkbox" checked={approved} disabled={disabled} onChange={e=>setApproved(e.target.checked)}/>I reviewed the account, Testnet 296, amounts and deadlines. I understand this does not reserve funds or settle a trade.</label>
     <div className="actions"><button disabled={disabled||!approved} onClick={sign}>Sign in MetaMask</button><button className="secondary" disabled={working} onClick={()=>{setReview(undefined);setApproved(false);}}>Back to order</button></div>
    </div>:<form onSubmit={e=>{e.preventDefault();void prepare();}}>
     <label className="text-field">Side<select value={side} disabled={disabled} onChange={e=>setSide(e.target.value as Side)}><option>Sell</option><option>Buy</option></select></label>
     <label className="text-field">Quantity (NOVA)<input inputMode="numeric" value={quantity} maxLength={4} disabled={disabled} onChange={e=>setQuantity(e.target.value)} aria-describedby="amount-help"/></label>
     <label className="text-field">Limit price (HBAR)<input inputMode="decimal" value={price} maxLength={30} disabled={disabled} onChange={e=>setPrice(e.target.value)} aria-describedby="amount-help"/></label>
     <p id="amount-help">{inputProblem||'Maximum intent amount: '+total+' HBAR'}</p><p className="muted">Orders expire 24 hours after preparation.</p>
     <div className="actions"><button disabled={disabled||!!inputProblem}>Review order</button></div>
    </form>}
    {working&&<p role="status">{pending(intent)?'Complete or reject the request in MetaMask.':'Preparing or querying the original request…'}</p>}
    {(problem||storageProblem)&&<p role="alert">{problem||storageProblem}</p>}
    {intent&&<div className={pending(intent)?'pending-notice':'market-request'}><p><strong>Request {intent.record.status}</strong></p><p className="address">{intent.record.prepared.requestId}</p>{pending(intent)&&<p>Query only. Rejected or late wallet prompts remain pending until the server confirms expiry. No automatic resubmission.</p>}<button className="secondary" disabled={working} onClick={recover}>Query original request</button></div>}
   </section>
   <section className="market-book" aria-labelledby="book-heading"><h3 id="book-heading">Order book</h3><p>Funds are not reserved</p>
    {(['Sell','Buy'] as const).map(s=>{const rows=open.filter(o=>o.side===s).sort((a,b)=>{const ap=BigInt(a.price),bp=BigInt(b.price);return ap===bp?Number(BigInt(a.sequence)-BigInt(b.sequence)):ap<bp?(s==='Sell'?-1:1):(s==='Sell'?1:-1);});return <table key={s}><caption>{s==='Sell'?'Asks · Lowest first':'Bids · Highest first'}</caption><thead><tr><th scope="col">Price (HBAR)</th><th scope="col">NOVA remaining</th></tr></thead><tbody>{rows.length?rows.map(o=><tr key={o.orderId}><td>{hbar(o.price)}</td><td>{o.remaining}</td></tr>):<tr><td colSpan={2}>No open {s.toLowerCase()} orders.</td></tr>}</tbody></table>;})}
   </section>
  </div>
  <section className="market-history" aria-labelledby="my-orders-heading"><h3 id="my-orders-heading">My orders</h3>{myOrders.length?<ul className="market-orders">{myOrders.slice().reverse().map(o=><li key={o.orderId}><div><strong>{o.side} {o.quantity} NOVA @ {hbar(o.price)} HBAR</strong><p>{status(o)} · Remaining {o.remaining} · Matched {o.matched} · Cancelled {o.cancelled} · Expired {o.expired}</p><details><summary>Order details</summary><p className="address">{o.orderId}</p><p>Expires {new Date(Number(o.expiresAt)*1000).toISOString()}</p>{o.reason&&<p>{o.reason}</p>}</details></div>{BigInt(o.remaining)>0n&&<button className="secondary" disabled={disabled} onClick={()=>prepare(o)}>Review cancel</button>}</li>)}</ul>:<p>{trader?'No orders for this account.':'Connect a trading account to view its orders.'}</p>}</section>
  <section className="market-history" aria-labelledby="matches-heading"><h3 id="matches-heading">Matches</h3><p>Matched · Not settled</p>{market?.matches.length?<ul className="market-orders">{market.matches.slice().reverse().map(m=><li key={m.id}><div><strong>{m.quantity} NOVA @ {hbar(m.price)} HBAR</strong><p>{hbar(m.notional)} HBAR intent · {m.status}</p><details><summary>Match {m.id} details</summary><p>Buyer: {m.buyer===accounts.Buyer.address?'Buyer account':'Seller account'} · Seller: {m.seller===accounts.Seller.address?'Seller account':'Buyer account'}</p><p className="address">Maker {m.maker}<br/>Taker {m.taker}</p></details></div></li>)}</ul>:<p>No matches yet. Matching does not prove payment or delivery.</p>}</section>
  <div className="actions"><button className="secondary" disabled={!market} onClick={exportPublic}>Export public market evidence</button></div>
 </section>;
}

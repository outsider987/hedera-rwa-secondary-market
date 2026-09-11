import {isTradingOrigin,productionURL} from '../lib/runtime';
import {useQuery} from '@tanstack/react-query';
import SettlementPanel from './SettlementPanel';
import AccountBalance from './AccountBalance';
import OrdersTable from './OrdersTable';
import MatchesList from './MatchesList';
import MarketVisualization from '../presentation/MarketVisualization';
import {readSettlements,settlementStatus} from '../lib/settlement';
import {queryClient} from '../lib/wallet';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {getOperationBusy,subscribeOperation,type Roles} from '../lib/guards';
import {accounts} from '../lib/lifecycle';
import {amount,hbar,loadIntent,marketEvidence,marketStorageKey,pending,prepareOrder,readMarketBalance,readMarket,recoverIntent,signOrder,type Intent,type Market,type Order,type Review,type Side} from '../lib/market';

export default function MarketPanel({visible,activity=false,roles,session,activeAccount,onNotice}:{visible:boolean;activity?:boolean;roles:Roles;session:number;activeAccount?:string;onNotice?:(notice:string)=>void}){
 const [selectedMatch,setSelectedMatch]=useState<string>(),[matchFilter,setMatchFilter]=useState<'Active'|'Needs your action'|'Completed'|'All'>('Active');
 const settlementsQuery=useQuery({queryKey:['t08-settlements'],queryFn:({signal})=>readSettlements(signal),enabled:visible,retry:false,refetchInterval:visible?2000:false,refetchIntervalInBackground:false},queryClient);
 const settlementData=settlementsQuery.data;
 const locked=useSyncExternalStore(subscribeOperation,getOperationBusy,()=>false);
 const [market,setMarket]=useState<Market>(),[online,setOnline]=useState(false),[last,setLast]=useState('');
 const [intent,setIntent]=useState<Intent>(),[storageProblem,setStorageProblem]=useState(''),[problem,setProblem]=useState('');
 const [side,setSide]=useState<Side>('Sell'),[quantity,setQuantity]=useState(''),[price,setPrice]=useState('');
 const [review,setReview]=useState<Review>(),[approved,setApproved]=useState(false),[working,setWorking]=useState(false);
 const [filter,setFilter]=useState<'Open'|'All'>('Open'),[dismissed,setDismissed]=useState<string>();
 const ticketHeading=useRef<HTMLHeadingElement>(null),quantityInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(dismissed)quantityInput.current?.focus();},[dismissed]);
 const controller=useRef<AbortController|undefined>(undefined),epoch=useRef(0);
 const owner=activeAccount?.toLowerCase()??'',trader=owner===accounts.Seller.address||owner===accounts.Buyer.address;
 const role=owner===accounts.Seller.address?'Seller':owner===accounts.Buyer.address?'Buyer':owner===accounts.Admin.address?'Admin':'Not connected';
 const balanceQuery=useQuery({queryKey:['nova-balance',owner,session],queryFn:({signal})=>readMarketBalance(owner,signal),enabled:visible&&role!=='Not connected'&&!locked,retry:false,refetchInterval:visible&&!locked?15000:false,refetchIntervalInBackground:false},queryClient);
 const balance=balanceQuery.data;

 useEffect(()=>{setQuantity('');setPrice('');setDismissed(undefined);},[owner]);
 useEffect(()=>{if(review)ticketHeading.current?.focus({preventScroll:true});},[review]);
 const preview=typeof window!=='undefined'&&isTradingOrigin(window.location.origin,import.meta.env.PROD);
 useEffect(()=>{epoch.current++;controller.current?.abort();setReview(undefined);setApproved(false);},[session,visible]);
 useEffect(()=>{const load=()=>{try{setIntent(loadIntent());setStorageProblem('');}catch{setStorageProblem('Saved intent is invalid. Keep the original request and restore its public record before signing.');}};load();const changed=(e:StorageEvent)=>{if(e.key===marketStorageKey||e.key===null)load();};window.addEventListener('storage',changed);return()=>{window.removeEventListener('storage',changed);controller.current?.abort();};},[]);
 useEffect(()=>{
  if(!visible)return;const abort=new AbortController();let timer:ReturnType<typeof setTimeout>;
  async function refresh(){if(document.hidden){timer=setTimeout(refresh,2000);return;}try{const m=await readMarket(abort.signal);abort.signal.throwIfAborted();setMarket(m);setOnline(true);setLast(new Date().toLocaleTimeString());if(pending(loadIntent())){const v=await recoverIntent(abort.signal);abort.signal.throwIfAborted();setIntent(v);}}catch{if(!abort.signal.aborted)setOnline(false);}finally{if(!abort.signal.aborted)timer=setTimeout(refresh,2000);}}
  void refresh();return()=>{abort.abort();clearTimeout(timer);};
 },[visible]);
 useEffect(()=>{onNotice?.(pending(intent)?'Order signature or submission is unresolved. Open Market to query the original request.':settlementData?.pendingOperation?'Settlement operation is pending. Open Market to recover the original operation.':problem||storageProblem);},[intent,settlementData?.pendingOperation,problem,storageProblem,onNotice]);
 const disabled=!!settlementData?.pendingOperation||locked||working||!online||!preview||!trader||!!storageProblem||pending(intent);
 let total='',inputProblem='';try{total=hbar(amount(quantity,price).notional);}catch(e){inputProblem=e instanceof Error?e.message:'Invalid amount.';}
 async function prepare(cancel?:Order){if(disabled)return;const current=new AbortController();controller.current=current;const revision=epoch.current;setWorking(true);setProblem('');setReview(undefined);setApproved(false);try{const v=await prepareOrder(roles,owner,side,quantity,price,current.signal,cancel);if(revision===epoch.current&&!current.signal.aborted)setReview(v);}catch(e){if(!current.signal.aborted)setProblem(e instanceof Error?e.message:'Review incomplete.');}finally{setWorking(false);}}
 async function sign(){if(!review||!approved||disabled)return;const current=new AbortController();controller.current=current;setWorking(true);setApproved(false);setProblem('');try{await signOrder(review,current.signal,setIntent);}catch{setProblem('Signature or submission incomplete. If an intent was saved, query that request; it will not be resent.');}finally{setWorking(false);setReview(undefined);}}
 async function recover(){if(working)return;const current=new AbortController();controller.current=current;setWorking(true);setProblem('');try{setIntent(await recoverIntent(current.signal));}catch{setProblem('Recovery unavailable. Keep the original request; no new submission is allowed.');}finally{setWorking(false);}}
 function exportPublic(){if(!market)return;const url=URL.createObjectURL(new Blob([JSON.stringify(marketEvidence(market,intent),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='holdbook-unfunded-market.json';a.click();URL.revokeObjectURL(url);}
 const myOrders=market?.orders.filter(o=>o.owner===owner)??[];
 const completed=intent?.record.status==='accepted'&&intent.record.prepared.owner===owner&&intent.record.prepared.requestId!==dismissed?intent.record:undefined;
 useEffect(()=>{if(completed)ticketHeading.current?.focus({preventScroll:true});},[completed?.prepared.requestId]);
 const result=completed?.result;
 const cancelOrder=review?.record.prepared.action==='Cancel'?market?.orders.find(o=>o.orderId===review.record.prepared.orderId):undefined;
 function freshMatch(id:string){const match=market?.matches.find(m=>m.id===id),d=settlementData?.deployment;return !!match&&!!d&&[match.maker,match.taker].every(id=>BigInt(market?.orders.find(o=>o.orderId===id)?.sequence??'0')>BigInt(d.cutoff));}
 useEffect(()=>{if(visible&&!activity&&selectedMatch!==undefined){const frame=requestAnimationFrame(()=>{(document.getElementById('market-exchange-heading')??document.getElementById('settlement-heading'))?.focus();});return()=>cancelAnimationFrame(frame);}},[visible,activity,selectedMatch]);
 function focusSection(id:string){const target=document.getElementById(id);target?.focus({preventScroll:true});target?.scrollIntoView({block:'start'});}
 function selectMatch(id:string){setSelectedMatch(id);setReview(undefined);setApproved(false);window.location.hash='market';}
 function newOrder(){setDismissed(intent?.record.prepared.requestId);setQuantity('');setPrice('');setProblem('');}

 const visualization=<MarketVisualization settlementKnown={!!settlementData} selectedMatch={market?.matches.find(m=>m.id===selectedMatch)} orders={market?.orders??[]} matches={market?.matches??[]} statuses={Object.fromEntries((settlementData?.settlements??[]).map(s=>[s.id,settlementStatus(s,BigInt(Math.floor(Date.now()/1000)))]))} online={online&&(selectedMatch===undefined||settlementsQuery.isSuccess&&!settlementsQuery.isRefetchError)} updated={last} visible={visible&&!activity}/>;
 return <section id={activity?'activity':'market'} className="page-section market" aria-labelledby="market-heading">
  <div className="market-heading"><div><h2 id="market-heading">{activity?'Activity':'NOVA / HBAR'}</h2><p>{activity?'Your orders, matches and verified outcomes':'Buy and sell demo equity · Hedera Testnet'}</p></div><p><span role="status">{online?'Live':'Offline'}</span>{last?' · Last updated '+last:' · Waiting for market'}</p></div>
  <div hidden={activity}>
  <nav className="market-shortcuts" aria-label="Market sections"><button className="secondary" onClick={()=>focusSection(selectedMatch!==undefined?'settlement-heading':'order-heading')}>{selectedMatch!==undefined?'Settlement':'Place order'}</button><button className="secondary" onClick={()=>focusSection('book-heading')}>Order book</button><button className="secondary" onClick={()=>focusSection('matches-heading')}>Matches</button></nav>
  <p className="market-funds"><strong>Funds are not reserved.</strong> Matching transfers no assets.</p>
  {(owner===accounts.Admin.address&&!settlementData?.deployment||settlementData?.pendingOperation)&&<div className="actions"><button className="secondary" onClick={()=>setSelectedMatch(settlementData?.pendingOperation?.settlementId||'setup')}>{settlementData?.pendingOperation?'Recover settlement operation':'Settlement setup'}</button></div>}
  <div className="market-layout">
   <div className="market-entry">
   {selectedMatch!==undefined?<SettlementPanel key={selectedMatch} settlementKnown={!!settlementData} match={market?.matches.find(m=>m.id===selectedMatch)} settlement={settlementData?.settlements.find(s=>s.id===selectedMatch)} deployment={settlementData?.deployment} pendingOperation={settlementData?.pendingOperation} roles={roles} owner={owner} session={session} online={online&&settlementsQuery.isSuccess&&!settlementsQuery.isRefetchError} locked={locked} eligible={selectedMatch==='setup'||freshMatch(selectedMatch)} onUpdated={()=>{void settlementsQuery.refetch();}} onNewOrder={()=>{setSelectedMatch(undefined);newOrder();}}/>:<section className="market-ticket" aria-labelledby="order-heading">
    <div className="market-account"><strong>{role}</strong><span>{owner?owner.slice(0,6)+'…'+owner.slice(-4):'Connect a trading account'} · Testnet 296</span></div>
    <h3 id="order-heading" ref={ticketHeading} tabIndex={-1}>{review?(review.record.prepared.action==='Cancel'?'Review cancellation':'Review '+review.record.prepared.side.toLowerCase()+' order'):completed?'Request result':pending(intent)?'Request pending':'Place a limit order'}</h3>
    {!trader&&<p>{role==='Admin'?'Admin is view-only.':'Connect Seller or Buyer to trade.'} Both trading accounts can buy and sell.</p>}
    {!preview&&<p>Use <a href={productionURL}>approved production site</a> to prepare and sign orders.</p>}
    {!online&&<p>Market unavailable. Last received data is retained; new submissions are disabled.</p>}
    {review?<div className="market-review">
     <dl><div><dt>Account</dt><dd>{review.wallet.expectedRole}</dd></div><div><dt>Action</dt><dd>{review.record.prepared.action==='Cancel'?'Cancel remaining quantity':review.record.prepared.side+' '+review.record.prepared.quantity+' NOVA'}</dd></div>
      {review.record.prepared.action==='Place'?<><div><dt>Limit price</dt><dd>{hbar(review.record.prepared.price)} HBAR</dd></div><div><dt>Maximum intent amount</dt><dd>{hbar((BigInt(review.record.prepared.price)*BigInt(review.record.prepared.quantity)).toString())} HBAR</dd></div><div><dt>Order expires (UTC)</dt><dd>{new Date(Number(review.record.prepared.expiresAt)*1000).toISOString()}</dd></div></>:<><div><dt>Order</dt><dd>{review.record.prepared.orderId}</dd></div>{cancelOrder&&<><div><dt>Remaining now</dt><dd>{cancelOrder.remaining} NOVA</dd></div><div><dt>Already matched</dt><dd>{cancelOrder.matched} NOVA · preserved</dd></div></>}</>}
      <div><dt>Sign before (UTC)</dt><dd>{new Date(Number(review.record.prepared.deadline)*1000).toISOString()}</dd></div></dl>
     <p>{cancelOrder?'Cancels the quantity still remaining when processed. Existing matches are preserved.':'Unfunded intent only. No assets reserved or transferred.'}</p>
     <label className="review-check"><input type="checkbox" checked={approved} disabled={disabled} onChange={e=>setApproved(e.target.checked)}/>I reviewed the account, Testnet 296, amounts and deadlines. I understand this does not reserve funds or settle a trade.</label>
     <div className="actions"><button disabled={disabled||!approved} onClick={sign}>Sign in MetaMask</button><button className="secondary" disabled={working} onClick={()=>{setReview(undefined);setApproved(false);}}>Back to order</button></div>
    </div>:completed&&result?<div className="market-result">
     <p role="status"><strong>{completed.prepared.action==='Cancel'?'Cancellation accepted':completed.prepared.side+' order accepted'}</strong></p>
     <p>{result.order.side} {result.order.quantity} NOVA @ {hbar(result.order.price)} HBAR</p>
     <dl><div><dt>Matched</dt><dd>{result.order.matched} NOVA</dd></div><div><dt>Remaining</dt><dd>{result.order.remaining} NOVA</dd></div><div><dt>Cancelled</dt><dd>{result.order.cancelled} NOVA</dd></div></dl>
     {result.matches.length>0&&<><ul>{result.matches.map(m=><li key={m.id}>{m.quantity} NOVA @ {hbar(m.price)} HBAR <button className="secondary" onClick={()=>selectMatch(m.id)}>View match {m.id}</button></li>)}</ul><p>Matched intent: {hbar(result.matches.reduce((total,m)=>total+BigInt(m.notional),0n).toString())} HBAR</p></>}
     <p className="muted">Result when processed. Live quantities appear in My orders. Matches are not settled.</p>
     <div className="actions"><button disabled={disabled} onClick={newOrder}>New order</button><a href="#activity" onClick={()=>setFilter('All')}>View my orders</a></div>
    </div>:!pending(intent)&&<form onSubmit={e=>{e.preventDefault();void prepare();}}>
     <div className="market-switch" role="group" aria-label="Order side">{(['Buy','Sell'] as const).map(value=><button type="button" key={value} className={'secondary '+value.toLowerCase()} aria-pressed={side===value} disabled={disabled} onClick={()=>setSide(value)}>{value}</button>)}</div>
     <div className="market-order-fields"><label className="text-field">Quantity (NOVA)<input ref={quantityInput} inputMode="numeric" value={quantity} maxLength={4} placeholder="1–1000" disabled={disabled} onChange={e=>setQuantity(e.target.value)} aria-describedby="amount-help"/></label>
     <label className="text-field">Limit price (HBAR)<input inputMode="decimal" value={price} maxLength={30} placeholder="0.00" disabled={disabled} onChange={e=>setPrice(e.target.value)} aria-describedby="amount-help"/></label></div>
     <p id="amount-help">{!quantity||!price?'Enter quantity and limit price.':inputProblem||'Maximum intent amount: '+total+' HBAR'}</p><p className="muted">Orders expire 24 hours after preparation.</p>
     <div className="actions"><button disabled={disabled||!!inputProblem}>Review {side.toLowerCase()} order</button></div>
    </form>}
    {working&&<p role="status">{pending(intent)?'Complete or reject the request in MetaMask.':'Preparing or querying the original request…'}</p>}
    {(problem||storageProblem)&&<p role="alert">{problem||storageProblem}</p>}
    {intent&&<details className={pending(intent)?'pending-notice':'market-request'} open={pending(intent)||intent.record.status==='rejected'||intent.record.status==='expired'}><summary>Request {intent.record.status} · {intent.record.prepared.owner===accounts.Seller.address?'Seller':'Buyer'}</summary><p>{intent.record.prepared.action==='Cancel'?'Cancel order '+intent.record.prepared.orderId:intent.record.prepared.side+' '+intent.record.prepared.quantity+' NOVA @ '+hbar(intent.record.prepared.price)+' HBAR'}</p><p className="address">{intent.record.prepared.requestId}</p>{pending(intent)&&<p>Query only until the server confirms the result or expiry. No automatic resubmission. Submission deadline: {new Date(Number(intent.record.prepared.deadline)*1000).toLocaleTimeString()}.</p>}<button className="secondary" disabled={working} onClick={recover}>Query original request</button></details>}
   </section>}
   <details className="market-balance-details"><summary>{role==='Not connected'?'Your NOVA balance':balance?`Available ${balance.available} · Held ${balance.held} NOVA${balanceQuery.isError?' · Update unavailable':balanceQuery.isFetching?' · Refreshing…':''}`:'NOVA balance · '+(balanceQuery.isFetching?'Loading…':balanceQuery.isError?'Unavailable':'Not read')}</summary>
  <AccountBalance role={role} balance={balance} loading={balanceQuery.isFetching} error={balanceQuery.isError} locked={locked} onRefresh={()=>void balanceQuery.refetch()}/>
   </details>
   </div><div className="market-book-column">
  {visualization}
   </div>
  </div>
  </div>
  {activity&&<p className="notice hb:mb-6!">Select a match to continue in Market. An accepted order is intent; only verified settlement proves payment and delivery.</p>}
  <div className="market-history-layout">
  <MatchesList online={online} settlementOnline={settlementsQuery.isSuccess&&!settlementsQuery.isRefetchError} market={market} settlementData={settlementData} owner={owner} matchFilter={matchFilter} setMatchFilter={setMatchFilter} freshMatch={freshMatch} onSelect={selectMatch}/>
  <OrdersTable myOrders={myOrders} filter={filter} setFilter={setFilter} trader={trader} disabled={disabled} onCancel={order=>{setSelectedMatch(undefined);window.location.hash='market';void prepare(order);}}/>
  </div>
  <div className="actions"><button className="secondary" disabled={!market} onClick={exportPublic}>Export public market evidence</button></div>
 </section>;
}

import { hbar, status, type Order } from './market';

export default function OrdersTable({ myOrders, filter, setFilter, trader, disabled, onCancel }: {
  myOrders: Order[]; filter: 'Open' | 'All'; setFilter: (filter: 'Open' | 'All') => void;
  trader: boolean; disabled: boolean; onCancel: (order: Order) => void;
}) {
  const shownOrders = myOrders.filter(o => filter === 'All' || BigInt(o.remaining) > 0n);
  return <section className="market-history" aria-labelledby="my-orders-heading">
   <div className="market-history-heading"><h3 id="my-orders-heading">My orders</h3><div className="market-switch" role="group" aria-label="Order filter">{(['Open','All'] as const).map(value=><button className="secondary" key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{value}{value==='Open'?' ('+myOrders.filter(o=>BigInt(o.remaining)>0n).length+')':''}</button>)}</div></div>
   {shownOrders.length?<div className="market-table-scroll" role="region" aria-label="My orders table" tabIndex={0}><table className="market-order-table"><caption>Quantities in NOVA · Prices in HBAR</caption><thead><tr><th scope="col">Order / status</th><th scope="col">Matched</th><th scope="col">Remaining</th><th scope="col">Cancelled</th><th scope="col">Action</th></tr></thead><tbody>{shownOrders.slice().reverse().map(o=><tr key={o.orderId}>
    <td><strong className={o.side.toLowerCase()+'-text'}>{o.side} {o.quantity} @ {hbar(o.price)}</strong><p>{status(o)}</p><p className="muted">{o.orderId.slice(0,8)} · <time dateTime={new Date(Number(o.acceptedAt)*1000).toISOString()}>{new Date(Number(o.acceptedAt)*1000).toLocaleTimeString()}</time></p><details><summary>Details</summary><p>Quantity in NOVA · Price in HBAR</p><p>Remaining {o.remaining} · Matched {o.matched} · Cancelled {o.cancelled} · Expired {o.expired}</p><p className="address">{o.orderId}</p><p>Expires {new Date(Number(o.expiresAt)*1000).toISOString()}</p>{o.reason&&<p>{o.reason}</p>}</details></td>
    <td>{o.matched}</td><td>{o.remaining}</td><td>{o.cancelled}</td><td>{BigInt(o.remaining)>0n?<button className="secondary" disabled={disabled} aria-label={'Cancel remaining '+o.remaining+' NOVA from '+o.side+' order '+o.orderId} onClick={()=>onCancel(o)}>Cancel remaining {o.remaining}</button>:<span>—</span>}</td>
   </tr>)}</tbody></table></div>:<p>{!trader?'Connect a trading account to view its orders.':filter==='Open'?'No open orders. Select All to view completed and cancelled orders.':'No orders for this account.'}</p>}
  </section>;
}

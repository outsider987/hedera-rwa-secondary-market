import { hbar, type Order } from '../lib/market';

export default function OrderBook({ open }: { open: Order[] }) {
  return <section className="market-book" aria-labelledby="book-heading"><h3 id="book-heading">Order book</h3><p className="muted">Funds are not reserved</p>
    {(['Sell','Buy'] as const).map(s=>{const rows=open.filter(o=>o.side===s).sort((a,b)=>{const ap=BigInt(a.price),bp=BigInt(b.price);return ap===bp?Number(BigInt(a.sequence)-BigInt(b.sequence)):ap<bp?(s==='Sell'?-1:1):(s==='Sell'?1:-1);});return <table className={s==='Sell'?'sell-book':'buy-book'} key={s}><caption>{s==='Sell'?'Asks · Lowest first':'Bids · Highest first'}</caption><thead><tr><th scope="col">Price (HBAR)</th><th scope="col">NOVA remaining</th></tr></thead><tbody>{rows.length?rows.map(o=><tr key={o.orderId}><td>{hbar(o.price)}</td><td>{o.remaining}</td></tr>):<tr><td colSpan={2}>No open {s.toLowerCase()} orders.</td></tr>}</tbody></table>;})}
   </section>;
}

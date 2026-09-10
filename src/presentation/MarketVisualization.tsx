import PixelSprite from '../components/PixelSprite';
import {useEffect,useRef,useState} from 'react';
import type {Order,Match} from '../lib/market';
import {hbar} from '../lib/market';
import {depth,emptySnapshot,updateMatches} from './marketView';
import {usePresentationEnvironment} from './components/SceneView';
import './presentation.css';
export default function MarketVisualization({orders,matches,statuses,online,updated,visible}:{orders:readonly Order[];matches:readonly Match[];statuses:Readonly<Record<string,string>>;online:boolean;updated:string;visible:boolean}){
 const [open,setOpen]=useState(false),[fresh,setFresh]=useState<readonly Match[]>([]);
 const snapshot=useRef(emptySnapshot),{foreground}=usePresentationEnvironment();
 const active=visible&&foreground;
 useEffect(()=>{if(active&&!snapshot.current.visible){snapshot.current={...snapshot.current,visible:true,online:false,fresh:[]};setFresh([]);return;}const next=updateMatches(snapshot.current,matches,online,active);snapshot.current=next;setFresh(next.fresh);},[matches,online,active]);
 const totals={Buy:0n,Sell:0n};for(const order of orders)if((order.side==='Buy'||order.side==='Sell')&&BigInt(order.remaining)>0n)totals[order.side]+=BigInt(order.remaining);
 const levels=depth(orders),quantity=fresh.reduce((n,m)=>n+BigInt(m.quantity),0n).toString();
 return <section className="market-visualization" aria-label="Market depth visualization">
  <div className="market-pixel-floor" aria-label="Market participants">
   <div className="market-pixel-side"><PixelSprite kind="buyer"/><div><strong>Buy side</strong><span>All open bids</span><b>{totals.Buy.toString()} NOVA</b></div></div>
   <div className={"market-pixel-message"+(fresh.length?' has-match':'')}><strong>NOVA / HBAR</strong><p role="status">{fresh.length?`${fresh.length} new matches · ${quantity} NOVA`:!online?(updated?'Offline · Last known orders':'Offline · Awaiting first snapshot'):orders.length?'Waiting for new matches':'No orders yet'}</p><span>Matching does not transfer assets.</span></div>
   <div className="market-pixel-side seller"><PixelSprite kind="seller"/><div><strong>Sell side</strong><span>All open asks</span><b>{totals.Sell.toString()} NOVA</b></div></div>
  </div><button className="secondary" aria-expanded={open} onClick={()=>setOpen(!open)}>Top 5 price levels · {open?'Collapse':'Expand'}</button>
  {open&&<><div className="market-visual-body"><div className="market-depth-copy"><p>{online?'Live snapshot':'Offline · Stale snapshot'}{updated?' · '+updated:''}</p>{levels.length?<div className="market-depth-levels">{(['Buy','Sell'] as const).map(side=><div key={side}><strong>{side==='Buy'?'Bids':'Asks'} · HBAR / NOVA</strong>{levels.filter(l=>l.side===side).map(l=><p className={"depth-level depth-"+side.toLowerCase()} key={l.price}><i aria-hidden="true" style={{transform:`scaleX(${l.ratio})`}}/><span>{hbar(l.price)}</span><strong>{l.quantity} NOVA</strong></p>)}</div>)}</div>:<p>No open orders. Waiting for market depth.</p>}</div></div>
  {matches.length>0&&<details><summary>Match outcomes · {matches.length}</summary><ul>{matches.map(m=><li key={m.id}>Match {m.id} · {m.quantity} NOVA @ {hbar(m.price)} HBAR · {statuses[m.id]??'Matched · Not settled'}</li>)}</ul></details>}</>}
 </section>;
}

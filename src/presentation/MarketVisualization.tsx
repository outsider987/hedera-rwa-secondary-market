import {useEffect,useRef,useState} from 'react';
import type {Order,Match} from '../lib/market';
import {hbar} from '../lib/market';
import {depth,emptySnapshot,updateMatches} from './marketView';
import {usePresentationEnvironment} from './components/SceneView';
import './presentation.css';
export default function MarketVisualization({orders,matches,statuses,online,updated,visible}:{orders:readonly Order[];matches:readonly Match[];statuses:Readonly<Record<string,string>>;online:boolean;updated:string;visible:boolean}){
 const [open,setOpen]=useState(true),[fresh,setFresh]=useState<readonly Match[]>([]);
 const snapshot=useRef(emptySnapshot),{foreground}=usePresentationEnvironment();
 const active=visible&&foreground;
 useEffect(()=>{if(active&&!snapshot.current.visible){snapshot.current={...snapshot.current,visible:true,online:false,fresh:[]};setFresh([]);return;}const next=updateMatches(snapshot.current,matches,online,active);snapshot.current=next;setFresh(next.fresh);},[matches,online,active]);
 const levels=depth(orders),quantity=fresh.reduce((n,m)=>n+BigInt(m.quantity),0n).toString();
 return <section className="market-visualization" aria-label="Market depth visualization"><button className="secondary" aria-expanded={open} onClick={()=>setOpen(!open)}>Top 5 price levels · {open?'Collapse':'Expand'}</button>
  {open&&<><div className="market-visual-body"><div className="market-depth-copy"><p>{online?'Live snapshot':'Offline · Stale snapshot'}{updated?' · '+updated:''}</p>{levels.length?<div className="market-depth-levels">{(['Buy','Sell'] as const).map(side=><div key={side}><strong>{side==='Buy'?'Bids':'Asks'} · HBAR / NOVA</strong>{levels.filter(l=>l.side===side).map(l=><p className={"depth-level depth-"+side.toLowerCase()} key={l.price}><i aria-hidden="true" style={{transform:`scaleX(${l.ratio})`}}/><span>{hbar(l.price)}</span><strong>{l.quantity} NOVA</strong></p>)}</div>)}</div>:<p>No open orders. Waiting for market depth.</p>}</div></div>
  <p role="status">{fresh.length?`${fresh.length} new matches · ${quantity} NOVA. `:''}Matching does not transfer assets.</p>
  {matches.length>0&&<details><summary>Match outcomes · {matches.length}</summary><ul>{matches.map(m=><li key={m.id}>Match {m.id} · {m.quantity} NOVA @ {hbar(m.price)} HBAR · {statuses[m.id]??'Matched · Not settled'}</li>)}</ul></details>}</>}
 </section>;
}

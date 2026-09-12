import {accounts} from '../lib/lifecycle';
import PixelSprite from '../components/PixelSprite';
import {useEffect,useRef,useState} from 'react';
import type {Order,Match} from '../lib/market';
import {hbar} from '../lib/market';
import {depth,emptySnapshot,updateMatches} from './marketView';
import {usePresentationEnvironment} from './components/SceneView';
import './presentation.css';
export default function MarketVisualization({orders,matches,statuses,online,updated,visible,selectedMatch,settlementKnown=true}:{orders:readonly Order[];matches:readonly Match[];statuses:Readonly<Record<string,string>>;online:boolean;updated:string;visible:boolean;selectedMatch?:Match;settlementKnown?:boolean}){
 const [fresh,setFresh]=useState<readonly Match[]>([]);
 const snapshot=useRef(emptySnapshot),{foreground}=usePresentationEnvironment();
 const active=visible&&foreground;
 useEffect(()=>{if(active&&!snapshot.current.visible){snapshot.current={...snapshot.current,visible:true,online:false,fresh:[]};setFresh([]);return;}const next=updateMatches(snapshot.current,matches,online,active);snapshot.current=next;setFresh(next.fresh);},[matches,online,active]);
 const totals={Buy:0n,Sell:0n};for(const order of orders)if((order.side==='Buy'||order.side==='Sell')&&BigInt(order.remaining)>0n)totals[order.side]+=BigInt(order.remaining);
 const levels=depth(orders),quantity=fresh.reduce((n,m)=>n+BigInt(m.quantity),0n).toString();
 const status=!settlementKnown?'Status unavailable':selectedMatch?statuses[selectedMatch.id]??'Matched · Not settled':'';
 const held=['Locked','Ready','Expired · Reclaim required'].includes(status),settled=status==='Settled',returned=['Cancelled','Reclaimed','Returned'].includes(status);
 const next=!settlementKnown?'Waiting for settlement status':status==='Ready'?'Waiting for buyer payment':status==='Locked'?'Seller registration required':status==='Expired · Reclaim required'?'Expired · Seller must return NOVA':settled?'Atomic settlement verified':returned?'NOVA return verified':'Waiting for seller to lock NOVA';
 return <section className="market-visualization" aria-label="Market depth visualization">
  {selectedMatch?<div className="market-exchange" key={selectedMatch.id}>
   <div id="market-exchange-heading" tabIndex={-1} className="market-exchange-heading" role="status"><strong>Match {selectedMatch.id} · {status}</strong><p>{next}</p></div>
   <div className="market-exchange-stage">
    <div className="market-exchange-actors"><div><PixelSprite kind={selectedMatch.seller===accounts.Seller.address?'seller':'buyer'}/><strong>Selling account</strong><small>{selectedMatch.seller===accounts.Seller.address?'Seller':'Buyer'}</small></div><div><PixelSprite kind="vault"/><strong>ATS Hold</strong><small>Swap contract escrow</small></div><div><PixelSprite kind={selectedMatch.buyer===accounts.Buyer.address?'buyer':'seller'}/><strong>Buying account</strong><small>{selectedMatch.buyer===accounts.Buyer.address?'Buyer':'Seller'}</small></div></div>
    <div className="market-exchange-lane shares" style={{visibility:settlementKnown?'visible':'hidden'}}><div style={{transform:`translateX(${settled?200:held?100:0}%)`}}><PixelSprite kind="nova"/><strong>{selectedMatch.quantity} NOVA</strong></div></div>
    <div className="market-exchange-lane payment" style={{visibility:settlementKnown?'visible':'hidden'}}><div style={{transform:`translateX(${settled?0:200}%)`}}><PixelSprite kind="hbar"/><strong>{hbar(selectedMatch.notional)} HBAR</strong></div></div>
   </div>
   <div className="market-exchange-caption"><p>{!settlementKnown?'Asset locations not confirmed':held?'NOVA locked in ATS Hold':settled?'NOVA delivered · HBAR paid':returned?'NOVA returned · Trade closed':'NOVA not locked'}{settlementKnown&&!settled&&!returned?' · HBAR not paid':''}</p><span>{!settlementKnown?'Settlement snapshot unavailable':!online?'Offline · Last known settlement state':settled?'Delivery and payment verified together':'Matching does not transfer assets.'}</span></div>
   <p className="market-exchange-book">Whole order book · Bids {totals.Buy.toString()} NOVA · Asks {totals.Sell.toString()} NOVA</p>
  </div>:<div className="market-pixel-floor" aria-label="Market participants">
   <div className="market-pixel-side"><PixelSprite kind="buyer"/><div><strong>Buy side</strong><span>All open bids</span><b>{totals.Buy.toString()} NOVA</b></div></div>
   <div className={"market-pixel-message"+(fresh.length?' has-match':'')}><strong>NOVA / HBAR</strong><p role="status">{fresh.length?`${fresh.length} new matches · ${quantity} NOVA`:!online?(updated?'Offline · Last known orders':'Offline · Awaiting first snapshot'):orders.length?'Waiting for new matches':'No orders yet'}</p><span>Matching does not transfer assets.</span></div>
   <div className="market-pixel-side seller"><PixelSprite kind="seller"/><div><strong>Sell side</strong><span>All open asks</span><b>{totals.Sell.toString()} NOVA</b></div></div>
  </div>}<h3 id="book-heading" tabIndex={-1}>Top 5 price levels</h3>
  <><div className="market-visual-body"><div className="market-depth-copy"><p>{online?'Live snapshot':'Offline · Stale snapshot'}{updated?' · '+updated:''}</p>{levels.length?<div className="market-depth-levels">{(['Buy','Sell'] as const).map(side=><div key={side}><strong>{side==='Buy'?'Bids':'Asks'} · HBAR / NOVA</strong>{levels.filter(l=>l.side===side).map(l=><p className={"depth-level depth-"+side.toLowerCase()} key={l.price}><i aria-hidden="true" style={{transform:`scaleX(${l.ratio})`}}/><span>{hbar(l.price)}</span><strong>{l.quantity} NOVA</strong></p>)}</div>)}</div>:<p>No open orders. Waiting for market depth.</p>}</div></div>
  {matches.length>0&&<details><summary>Match outcomes · {matches.length}</summary><ul>{matches.map(m=><li key={m.id}>Match {m.id} · {m.quantity} NOVA @ {hbar(m.price)} HBAR · {statuses[m.id]??'Matched · Not settled'}</li>)}</ul></details>}</>
 </section>;
}

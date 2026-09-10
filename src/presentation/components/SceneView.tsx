import {memo,useEffect,useState,type CSSProperties} from 'react';
import type {Stage} from '../demoState';
import snapshot from '../../data/presentation.json';
export function usePresentationEnvironment(){
 const [reduced,setReduced]=useState(()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [foreground,setForeground]=useState(()=>typeof document!=='undefined'&&!document.hidden);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(media.matches),visibility=()=>setForeground(!document.hidden);media.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);return()=>{media.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);};},[]);
 return {reduced,foreground};
}
const spriteRegions:Record<string,string>={seller:'90 130 215 425',buyer:'465 130 230 425',admin:'850 140 230 415',vault:'1160 180 285 345',certificate:'70 630 265 280',nova:'440 630 270 285',hbar:'820 630 265 285',gate:'1160 640 330 280'};
function Sprite({kind}:{kind:string}){return <svg className={'pixel-sprite sprite-'+kind} viewBox={spriteRegions[kind]} aria-hidden="true"><image href={import.meta.env.BASE_URL+'assets/holdbook-pixel-sprites.png'} width="1536" height="1024"/></svg>;}
function Person({role,position,balance,held}:{role:string;position:'left'|'right';balance?:string;held?:string}){return <div className={'pixel-person '+position}><Sprite kind={role.toLowerCase()}/><strong>{role}</strong>{balance!==undefined&&<small>{balance} NOVA · held {held}</small>}</div>;}
function Item({kind,label,position,lane}:{kind:string;label:string;position:number;lane:'shares'|'payment'}){return <div className={'pixel-item '+lane} style={{transform:`translateX(${position*100}%)`} as CSSProperties}><div><Sprite kind={kind}/><strong>{label}</strong></div></div>;}
function SceneView({stage,step,reduced}:{stage:Stage;step:number;reduced:boolean}){
 const settled=stage==='prove'||stage==='settle'&&step>=3,locked=stage==='settle'&&step>=1;
 const balances=settled?snapshot.swap.settlement.after:locked?snapshot.swap.lock.after:snapshot.swap.lock.before;
 const title={overview:'The trading guild',tokenize:'Asset workshop',verify:'Eligibility checkpoint',match:'Order board',settle:'Atomic exchange',prove:'Recorded exchange'}[stage];
 return <div className={'pixel-stage pixel-'+stage+(reduced?' reduce-motion':'')} data-step={step}>
  <div className="pixel-scenery" aria-hidden="true"/>
  <div className="pixel-scene-title"><span>{title}</span><span>Recorded demo</span></div>
  {stage==='tokenize'?<>
   <div className={'pixel-certificate'+(step>=1?' transformed':'')}><Sprite kind="certificate"/><span>Illustrative certificate</span></div>
   <div className={'pixel-asset'+(step>=1?' revealed':'')}><Sprite kind="nova"/><strong>NOVA</strong><span>Hedera ATS · Whole shares</span><span>Maximum supply {snapshot.tokenization.maximumSupply}</span></div>
   <Person role="Seller" position="right"/>
   <div className="pixel-inventory"><span>{step===3?'Seller inventory · 100 NOVA issued':'Asset creation · Supply 0'}</span><div className={'pixel-share-grid'+(step===3?' issued':'')} aria-hidden="true">{Array.from({length:100},(_,i)=><i key={i}/>)}</div></div>
  </>:stage==='verify'?<>
   <Person role="Seller" position="left"/>
   <div className={'pixel-credential'+(step>=1?' revealed':'')}><Sprite kind="admin"/><div><strong>Synthetic credential</strong><span>Issuer: Admin</span><span>Subject: Seller</span><b>{step>=2?'Credential verified':'Awaiting verification'}</b></div></div>
   <div className={'pixel-checkpoint'+(step===3?' granted':'')}><Sprite kind="gate"/><strong>{step===3?'KYC grant recorded':'Gate closed'}</strong><span>{step===3?'Historical eligibility':'Eligibility not established'}</span></div>
   <div className="pixel-items"><Item kind="nova" label={step===3?'Eligible NOVA':'NOVA waiting'} position={step===3?2:0} lane="shares"/></div>
   <div className="pixel-bottom-message">{step===2?'Credential verified. On-chain grant still required.':step===3?'Seller eligible at the recorded grant. No asset transfer.':'Synthetic KYC · No real identity information'}</div>
  </>:stage==='match'?<>
   <div className="pixel-order-board"><div><h3>Seller asks</h3><p className={step>=2?'filled':''}><strong>{step>=2?'0':'4'} NOVA</strong><span>@ 0.09 HBAR</span></p><p><strong>{step>=3?'3':'5'} NOVA</strong><span>@ 0.10 HBAR</span></p></div><div><h3>Buyer bid</h3><p className={step>=3?'filled':''}><strong>{step>=1?step>=3?'0':step>=2?'2':'6':'—'} NOVA</strong><span>{step>=1?'@ 0.10 HBAR':'Waiting for bid'}</span></p><small>Remaining quantities</small></div></div>
   <div className="pixel-match-receipts"><span className={step>=2?'revealed':''}>4 NOVA @ 0.09</span><span className={step>=3?'revealed':''}>2 NOVA @ 0.10</span></div>
   <div className="pixel-bottom-message">{step===4?<><strong>MATCHED · NOT SETTLED</strong><span>No NOVA or HBAR transferred.</span></>:<>Price priority · Resting order price<br/>Equal prices use acceptance sequence.</>}</div>
  </>:<>
   <Person role="Seller" position="left" balance={stage==='overview'?undefined:balances.sellerAvailable} held={balances.sellerHeld}/><Person role="Buyer" position="right" balance={stage==='overview'?undefined:balances.buyerAvailable} held={balances.buyerHeld}/>
   <div className={'pixel-vault'+(settled?' released':'')}><Sprite kind="vault"/><strong>ATS Hold</strong><span>Swap contract is escrow</span></div>
   <div className="pixel-route shares-route" aria-hidden="true"/><div className="pixel-route payment-route" aria-hidden="true"/>
   <div className="pixel-items"><Item kind="nova" label={stage==='overview'?'NOVA shares':'10 NOVA'} position={settled?2:locked?1:0} lane="shares"/><Item kind="hbar" label={stage==='overview'?'HBAR payment':'1 HBAR'} position={settled?0:stage==='settle'&&step===2?1:2} lane="payment"/></div>
   {settled&&(stage==='prove'||step===4)&&<div className="pixel-network"><div aria-hidden="true">{Array.from({length:7},(_,i)=><i key={i}/>)}</div><span>Recorded on Hedera</span></div>}
   <div className="pixel-bottom-message">{stage==='overview'?<><strong>Agreement → Settlement → Proof</strong><span>Explore the recorded steps below.</span></>:<><strong>{settled?'Delivery + payment · One transaction':locked?'10 NOVA held for exchange':'10 NOVA for 1 HBAR'}</strong><span>{settled?'Recorded settlement · Block 40247134':step===2?'Payment enters the atomic call; not separately completed.':'T05 · A separate recorded fixed swap'}</span></>}</div>
  </>}
 </div>;
}
export default memo(SceneView);

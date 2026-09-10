import {useEffect,useReducer} from 'react';
import {cues,demoKey,demoReducer,initialDemo,type Stage} from './demoState';
import SceneView,{usePresentationEnvironment} from './components/SceneView';
import DemoProof from './DemoProof';
import snapshot from '../data/presentation.json';
import './presentation.css';
const stages:[Stage,string][]=[['tokenize','Tokenize'],['verify','Verify'],['match','Match'],['settle','Settle'],['prove','Prove']];
export default function DemoExperience({visible,demo,onMode,onCases}:{visible:boolean;demo:boolean;onMode:(enabled:boolean)=>void;onCases:()=>void}){
 const [state,dispatch]=useReducer(demoReducer,initialDemo);
 const {reduced,foreground}=usePresentationEnvironment(),cue=cues[state.index];
 useEffect(()=>{if(!visible||!foreground||!demo)dispatch({type:'pause'});},[visible,foreground,demo]);
 useEffect(()=>{if(!state.playing||!visible||!foreground||!demo)return;let last=performance.now();const timer=setInterval(()=>{const now=performance.now();dispatch({type:'tick',seconds:(now-last)/1000});last=now;},100);return()=>clearInterval(timer);},[state.playing,visible,foreground,demo]);
 useEffect(()=>{if(!demo||!visible)return;const listener=(e:KeyboardEvent)=>{const target=e.target instanceof Element?e.target:null;const action=demoKey(e,!!target?.closest('input,textarea,select,button,a,[contenteditable="true"],[role="button"],[role="slider"]'));if(!action)return;e.preventDefault();if(action==='exit')onMode(false);else dispatch({type:action});};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener);},[demo,visible,onMode]);
 const swap=cue.stage==='settle'||cue.stage==='prove';
 const label=cue.stage==='overview'?'NOVA · Nova Private Equity Common Shares':swap?'T05 · Recorded fixed swap · '+snapshot.swap.date:cue.stage==='match'?'Recorded T07 matching example · '+snapshot.matching.date:'T02 / T03 · Recorded asset setup · '+snapshot.tokenization.date;
 const report=swap?'032-t05-manual':cue.stage==='match'?'035-t07-manual':cue.stage==='tokenize'&&cue.step<3?'024-vc-nova-manual':'027-t03-manual';
 return <section className={'demo-experience'+(demo?' demo-mode':'')} aria-label="HoldBook recorded demo" data-stage={cue.stage} data-cue={state.index}>
  <div className="demo-topline"><span>Fictional equity · Synthetic KYC · Hedera Testnet</span>{demo&&<button onClick={()=>onMode(false)}>Exit Demo</button>}</div>
  <div className={'demo-stage'+(cue.stage==='prove'?' is-proof':'')}>
   <div className="demo-narration" aria-live="polite" aria-atomic="true"><h2>{cue.title}</h2><p className="demo-copy">{cue.copy}</p><p className="demo-case-label">{label}</p>
    {cue.stage==='overview'?<div className="demo-links"><button onClick={()=>{onMode(true);dispatch({type:'restart'});}}>Start Demo</button><a href="#market">Open Market</a></div>:<a href={snapshot.sourceBase+report+'.md'}>View original acceptance</a>}
    {cue.stage==='tokenize'&&<p className="demo-fact">{cue.step===3?'100 NOVA issued · Seller':'Illustrative certificate · NOVA'}<br/>Whole shares · Maximum supply: 1,000{cue.step===2?' · Supply: 0':''}</p>}
    {cue.stage==='verify'&&<p className="demo-fact">Seller → VC verification → ATS KYC gate<br/>{cue.step>=1?'Issuer: Admin · Subject: Seller':'Eligibility not established'}<br/>{cue.step===2?'Credential verified · Gate closed':cue.step===3?'KYC grant recorded · Historical eligibility · No asset transfer':''}</p>}
    {cue.stage==='match'&&<div className="demo-order-facts"><p>Ask: {cue.step>=2?'0':'4'} NOVA @ 0.09 HBAR<br/>Ask: {cue.step>=3?'3':'5'} NOVA @ 0.10 HBAR</p>{cue.step>=1&&<p>Bid remaining: {cue.step>=3?'0':cue.step>=2?'2':'6'} NOVA @ 0.10 HBAR</p>}{cue.step>=2&&<p>Match 5-1: 4 NOVA @ 0.09{cue.step>=3&&<><br/>Match 5-2: 2 NOVA @ 0.10</>}</p>}<strong>Matching does not transfer assets.</strong></div>}
    {swap&&cue.stage!=='prove'&&<div className="demo-fact"><p>Seller · ATS Hold / Swap contract · Buyer</p><p>10 NOVA · 1 HBAR principal</p><p>{cue.step===0?'Seller 94 / held 0 · Buyer 6 / held 0':cue.step<3?'Seller 84 / held 10 · Buyer 6 / held 0':'Seller 84 / held 0 · Buyer 16 / held 0'}</p>{cue.step>=2&&<p>One settlement transaction · <a href={'https://hashscan.io/testnet/transaction/'+snapshot.swap.settlement.hash}>40247134</a></p>}</div>}
   </div>
   <div className="demo-visual">{visible&&foreground&&<SceneView key={state.revision} stage={cue.stage} step={cue.step} reduced={reduced}/>}
    <div className="demo-stations" aria-hidden="true"><span>{cue.stage==='tokenize'?'Illustrative certificate':'Seller'}</span><span>{cue.stage==='tokenize'?'ATS asset':cue.stage==='verify'?'Eligibility gate':cue.stage==='match'?'Order intent':'ATS Hold'}</span><span>{cue.stage==='tokenize'?'Seller · Issuance':cue.stage==='verify'?'Seller eligible':'Buyer'}</span></div>
   </div>
   {cue.stage==='prove'&&<DemoProof/>}
  </div>
  <nav className="demo-stages" aria-label="Demo stages">{stages.map(([stage,title],i)=><button key={stage} aria-pressed={cue.stage===stage} onClick={()=>dispatch({type:'jump',index:cues.findIndex(c=>c.stage===stage)})}><span>0{i+1}</span>{title}</button>)}</nav>
  <div className="demo-controls"><button disabled={state.index===0} onClick={()=>dispatch({type:'previous'})}>Previous</button><button disabled={state.index===cues.length-1} onClick={()=>dispatch({type:'next'})}>Next</button><button onClick={()=>dispatch({type:'replay'})}>Replay scene</button>{demo&&<><button onClick={()=>dispatch({type:'restart'})}>Restart demo</button><button onClick={()=>dispatch({type:state.playing?'pause':state.elapsed>0&&state.elapsed<180?'resume':'play'})}>{state.playing?'Pause':state.elapsed>0&&state.elapsed<180?'Resume':'Play 3-minute sequence'}</button>{!state.playing&&state.elapsed>0&&state.elapsed<180&&<button onClick={()=>dispatch({type:'play'})}>Play 3-minute sequence</button>}<span className="demo-time">{Math.floor(state.elapsed/60)}:{String(Math.floor(state.elapsed%60)).padStart(2,'0')} / 3:00 · {state.playing?'Playing':'Manual / paused'}</span></>}</div>
  {demo&&<p className="demo-key-help">Space / → Next cue · ← Previous cue · Esc Exit · Controls retain their normal keyboard behavior</p>}
  {cue.stage==='prove'&&<div className="demo-ending"><strong>HoldBook · Agreement → Settlement → Proof</strong><div className="demo-links"><a href="#market">Explore Market</a><button onClick={onCases}>View T08 recorded cases</button><button onClick={()=>dispatch({type:'restart'})}>Replay Demo</button></div></div>}
 </section>;
}

import {Component,lazy,Suspense,memo,useEffect,useState,type ReactNode} from 'react';
import type {Stage} from '../demoState';
import type {Level} from '../marketView';
const Canvas=lazy(()=>import('../DemoCanvas'));
class CanvasBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?this.props.fallback:this.props.children;}
}
export function usePresentationEnvironment(){
 const [reduced,setReduced]=useState(()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
 const [foreground,setForeground]=useState(()=>typeof document!=='undefined'&&!document.hidden);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(media.matches),visibility=()=>setForeground(!document.hidden);media.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);return()=>{media.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);};},[]);
 return {reduced,foreground};
}
function SceneView({stage,step,reduced,market}:{stage:Stage;step:number;reduced:boolean;market?:{levels:readonly Level[];fresh:boolean}}){
 // R3F 9.7 configures its renderer asynchronously, outside the React error boundary.
 const [failed,setFailed]=useState(()=>{try{const gl=document.createElement('canvas').getContext('webgl2');if(!gl)return true;gl.getExtension('WEBGL_lose_context')?.loseContext();return false;}catch{return true;}});
 const fallback=<div className="demo-fallback"><svg viewBox="0 0 600 250" aria-hidden="true"><path d="M100 150 H500" stroke="#9c86cf" strokeWidth="2"/><rect x="245" y="70" width="110" height="140" rx="4" fill="#292541" stroke="#b7a1e2"/><circle cx={stage==='prove'?500:stage==='settle'?step>=3?500:step>=1?300:100:stage==='verify'&&step===3?500:100} cy="140" r="30" fill="#ddbd80"/><circle cx={stage==='prove'||stage==='settle'&&step>=3?100:500} cy="100" r="20" fill="#fff"/></svg><p>Static scene · All steps and evidence remain available below.</p></div>;
 return <div className="demo-canvas">{failed?fallback:<CanvasBoundary fallback={fallback}><Suspense fallback={fallback}><Canvas stage={stage} step={step} reduced={reduced} market={market} onFailure={()=>setFailed(true)}/></Suspense></CanvasBoundary>}</div>;
}

export default memo(SceneView);

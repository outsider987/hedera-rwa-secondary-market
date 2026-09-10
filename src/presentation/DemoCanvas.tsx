import {lazy,Suspense,useEffect,useState,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import type {Stage} from './demoState';
import type {Level} from './marketView';
const loaders={overview:()=>import('./scenes/OverviewScene'),tokenize:()=>import('./scenes/TokenizationScene'),verify:()=>import('./scenes/ComplianceScene'),match:()=>import('./scenes/OrderMatchScene'),settle:()=>import('./scenes/AtomicSwapScene')};
const scenes={overview:lazy(loaders.overview),tokenize:lazy(loaders.tokenize),verify:lazy(loaders.verify),match:lazy(loaders.match),settle:lazy(loaders.settle)};
function CameraCue({stage,reduced}:{stage:Stage;reduced:boolean}){
 const {camera,invalidate}=useThree(),active=useRef(true),first=useRef(true);
 const target=stage==='tokenize'?-.25:stage==='verify'?.25:0;
 useEffect(()=>{active.current=true;first.current=true;invalidate();},[stage,reduced,invalidate]);
 useFrame((_,dt)=>{if(!active.current)return;if(first.current){first.current=false;dt=0;}camera.position.x=reduced?target:camera.position.x+(target-camera.position.x)*Math.min(1,dt*3);camera.lookAt(0,.1,0);active.current=Math.abs(camera.position.x-target)>.001;if(active.current)invalidate();});return null;
}
export default function DemoCanvas({stage,step,reduced,market,onFailure}:{stage:Stage;step:number;reduced:boolean;market?:{levels:readonly Level[];fresh:boolean};onFailure:()=>void}){
 const [canvas,setCanvas]=useState<HTMLCanvasElement>();
 useEffect(()=>{if(!canvas)return;const lost=(e:Event)=>{e.preventDefault();onFailure();};canvas.addEventListener('webglcontextlost',lost);return()=>canvas.removeEventListener('webglcontextlost',lost);},[canvas,onFailure]);
 useEffect(()=>{if(market)return;const stages=['overview','tokenize','verify','match','settle'] as const;const next=stages[stages.indexOf(stage==='prove'?'settle':stage)+1];if(next)void loaders[next]().catch(()=>{/* The boundary handles failure when selected. */});},[stage,market]);
 const name=stage==='prove'?'settle':stage,Scene=scenes[name];
 // ponytail: fixed 0.75 DPR bounds software-rendering cost; raise after recording-device frame checks.
 return <Canvas aria-hidden="true" frameloop="demand" dpr={0.75} gl={{antialias:true,alpha:true,powerPreference:'low-power'}} camera={{position:[0,2.1,8.5],fov:40}} onCreated={({gl,camera})=>{camera.lookAt(0,.1,0);setCanvas(gl.domElement);}} fallback={<span>3D unavailable. The scene description remains available.</span>}>
  <CameraCue stage={stage} reduced={reduced}/>
  <ambientLight intensity={1.5}/><directionalLight position={[2,5,5]} intensity={3}/><pointLight position={[-4,1,2]} intensity={15} color="#b69aef"/><pointLight position={[4,2,2]} intensity={12} color="#b6eef5"/>
  <Suspense fallback={null}>{name==='match'?<scenes.match step={step} reduced={reduced} {...(market?{source:'market',...market}:{source:'recorded'})}/>:<Scene step={stage==='prove'?4:step} reduced={reduced} source="recorded"/>}</Suspense>
 </Canvas>;
}

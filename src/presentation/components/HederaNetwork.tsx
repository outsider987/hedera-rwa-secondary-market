import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import type {Group} from 'three';
export default function HederaNetwork({pulse=false,reduced=false,duration=1.2}:{pulse?:boolean;reduced?:boolean;duration?:number}){
 const ref=useRef<Group>(null),started=useRef<number|undefined>(undefined),active=useRef(false),invalidate=useThree(s=>s.invalidate);
 useEffect(()=>{active.current=pulse&&!reduced;started.current=undefined;if(ref.current)ref.current.scale.setScalar(1);invalidate();},[pulse,reduced,duration,invalidate]);
 useFrame(({clock})=>{if(!active.current)return;started.current??=clock.elapsedTime;const t=Math.min(1,(clock.elapsedTime-started.current)/duration);ref.current!.scale.setScalar(1+Math.sin(t*Math.PI)*.15);active.current=t<1;if(active.current)invalidate();});
 return <group position={[0,1.5,-1]} ref={ref}>{Array.from({length:7},(_,i)=>{const a=i*Math.PI*2/7;return <mesh key={i} position={[Math.cos(a)*2,Math.sin(a)*.65,0]}><icosahedronGeometry args={[.08,0]}/><meshStandardMaterial color="#89dfec" emissive="#357283" emissiveIntensity={pulse?.9:.2}/></mesh>;})}<mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.5,.012,6,64]}/><meshBasicMaterial color="#8871b9"/></mesh></group>;
}

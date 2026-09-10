import {useLayoutEffect,useRef,type ReactNode} from 'react';
import {useFrame,useThree,useLoader} from '@react-three/fiber';
import {Group,InstancedMesh,Object3D,TextureLoader,SRGBColorSpace} from 'three';
export type SceneProps={step:number;reduced:boolean};
export function Move({x=0,y=0,z=0,scale=1,reduced=false,duration=1.6,from,children}:{x?:number;y?:number;z?:number;scale?:number;reduced?:boolean;duration?:number;from?:[number,number,number];children:ReactNode}){
 const initial=useRef<[number,number,number]>(from??[x,y,z]);
 const ref=useRef<Group>(null),start=useRef([0,0,0,1]),started=useRef<number|undefined>(undefined),active=useRef(false);
 const invalidate=useThree(s=>s.invalidate);
 useLayoutEffect(()=>{const g=ref.current!;start.current=[g.position.x,g.position.y,g.position.z,g.scale.x];started.current=undefined;active.current=true;invalidate();},[x,y,z,scale,reduced,invalidate]);
 useFrame(({clock})=>{if(!active.current)return;started.current??=clock.elapsedTime;const t=reduced?1:Math.min((clock.elapsedTime-started.current)/duration,1),e=t*t*(3-2*t);const g=ref.current!,s=start.current;g.position.set(s[0]+(x-s[0])*e,s[1]+(y-s[1])*e,s[2]+(z-s[2])*e);g.scale.setScalar(s[3]+(scale-s[3])*e);active.current=t<1;if(active.current)invalidate();});
 return <group ref={ref} position={initial.current}>{children}</group>;
}
export function AssetTokens({count=1,color='#ddbd80',small=false}:{count?:number;color?:string;small?:boolean}){
 const ref=useRef<InstancedMesh>(null);
 useLayoutEffect(()=>{const m=new Object3D();for(let i=0;i<count;i++){const columns=count===100?10:Math.min(5,count);m.position.set((i%columns-(columns-1)/2)*(small?.19:.38),Math.floor(i/columns)*(small?.16:.25),0);m.rotation.set(Math.PI/2,0,0);m.scale.setScalar(small?.09:.18);m.updateMatrix();ref.current!.setMatrixAt(i,m.matrix);}ref.current!.instanceMatrix.needsUpdate=true;},[count,small]);
 return <instancedMesh ref={ref} args={[undefined,undefined,count]}><cylinderGeometry args={[1,1,.28,32]}/><meshStandardMaterial color={color} metalness={.72} roughness={.28}/></instancedMesh>;
}
export function Certificate(){
 const texture=useLoader(TextureLoader,import.meta.env.BASE_URL+'assets/nova-demo-equity.png');texture.colorSpace=SRGBColorSpace;
 return <group rotation={[0,-.16,-.05]}><mesh><boxGeometry args={[3,2,.09]}/><meshStandardMaterial color="#ddbd80" metalness={.25} roughness={.5}/></mesh><mesh position={[0,0,.051]}><planeGeometry args={[3,2]}/><meshBasicMaterial map={texture}/></mesh></group>;
}
export function Station({x,color='#9078cd'}:{x:number;color?:string}){return <mesh position={[x,-.9,0]}><cylinderGeometry args={[.95,1.05,.12,48]}/><meshStandardMaterial color={color} metalness={.5} roughness={.45}/></mesh>;}

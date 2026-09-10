import {Move,type SceneProps} from '../components/AssetTokens';
import HederaNetwork from '../components/HederaNetwork';
import type {Level} from '../marketView';
export type MatchSceneProps=SceneProps&({source:'recorded'}|{source:'market';levels:readonly Level[];fresh:boolean});
export default function OrderMatchScene(props:MatchSceneProps){
 const {step,reduced}=props;
 const levels=props.source==='market'?props.levels:[{side:'Sell' as const,price:'9000000',quantity:step>=2?'0':'4',ratio:step>=2?0:.67},{side:'Sell' as const,price:'10000000',quantity:step>=3?'3':'5',ratio:step>=3?.5:.83},...(step>=1?[{side:'Buy' as const,price:'10000000',quantity:step>=3?'0':step>=2?'2':'6',ratio:step>=3?0:step>=2?.33:1}]:[])];
 return <>{props.source==='market'&&props.fresh&&<group scale={.5}><HederaNetwork pulse reduced={reduced} duration={.2}/></group>}{levels.map((l,i)=><Move key={l.side+l.price} x={(l.side==='Sell'?-1:1)*(1.2+(i%5)*.48)} y={-.7+l.ratio*.7} scale={Math.max(.015,l.ratio)} reduced={reduced} duration={props.source==='market'?.2:1.4}><mesh><boxGeometry args={[.5,1.5,.6]}/><meshStandardMaterial color={l.side==='Sell'?'#ddbd80':'#79d3e6'} metalness={.4} roughness={.35}/></mesh></Move>)}{props.source==='recorded'&&step>=2&&<Move y={.65} reduced={reduced}><mesh rotation={[0,0,Math.PI/4]}><boxGeometry args={[.5,.5,.25]}/><meshStandardMaterial color="#c2adef" metalness={.55} roughness={.3}/></mesh></Move>}</>;
}

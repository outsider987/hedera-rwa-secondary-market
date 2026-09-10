import type {Order,Match} from '../lib/market';
export type Level={price:string;quantity:string;ratio:number;side:'Buy'|'Sell'};
export function depth(orders:readonly Pick<Order,'side'|'remaining'|'price'|'sequence'>[]):Level[]{
 const levels:Level[]=[];
 for(const side of ['Buy','Sell'] as const){
  const sums=new Map<string,bigint>();
  for(const o of orders)if(o.side===side&&BigInt(o.remaining)>0n){const price=BigInt(o.price).toString();sums.set(price,(sums.get(price)??0n)+BigInt(o.remaining));}
  const sorted=[...sums].sort(([a],[b])=>BigInt(a)===BigInt(b)?0:(BigInt(a)<BigInt(b)?-1:1)*(side==='Buy'?-1:1)).slice(0,5);
  levels.push(...sorted.map(([price,q])=>({price,quantity:q.toString(),ratio:0,side})));
 }
 const max=levels.reduce((m,l)=>BigInt(l.quantity)>m?BigInt(l.quantity):m,1n);
 return levels.map(l=>({...l,ratio:Number(BigInt(l.quantity)*10000n/max)/10000}));
}
export type MatchSnapshot={ids:ReadonlySet<string>;online:boolean;visible:boolean;fresh:readonly Match[]};
export const emptySnapshot:MatchSnapshot={ids:new Set(),online:false,visible:false,fresh:[]};
export function updateMatches(previous:MatchSnapshot,matches:readonly Match[],online:boolean,visible:boolean):MatchSnapshot{
 if(!online||!visible)return {...previous,online,visible,fresh:[]};
 const ids=new Set(matches.map(m=>m.id));
 const fresh=previous.online&&previous.visible?matches.filter((m,i)=>!previous.ids.has(m.id)&&matches.findIndex(x=>x.id===m.id)===i):[];
 return {ids:new Set([...previous.ids,...ids]),online,visible,fresh};
}

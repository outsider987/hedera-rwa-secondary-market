import type {Match} from '../lib/market';
import {settlementAction, type Settlement} from '../lib/settlement';

// Presentation only: reviews still run all original wallet and chain guards.
export function matchAction(match:Match, settlement:Settlement|undefined, owner:string, eligible:boolean, now:bigint){
 if(!eligible)return;
 return settlement?settlementAction(settlement,owner,now):owner===match.seller?'lock':undefined;
}

export function settlementProgress(stage:string):number|undefined {
 return ({Unprepared:1,Locked:2,Ready:3,Settled:4} as Record<string,number>)[stage];
}

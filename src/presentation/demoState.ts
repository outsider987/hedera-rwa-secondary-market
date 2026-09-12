export type Stage = 'overview' | 'tokenize' | 'verify' | 'match' | 'settle' | 'prove';
export const cues: {stage:Stage; step:number; at:number; title:string; copy:string}[] = [
 {stage:'overview',step:0,at:0,title:'Tokenized equity. Verifiable settlement.',copy:'Follow NOVA from ATS issuance to secondary-market settlement on Hedera Testnet.'},
 {stage:'tokenize',step:0,at:15,title:'First, we define the asset.',copy:'Illustrative certificate. The artwork is not an on-chain right or proof of ownership.'},
 {stage:'tokenize',step:1,at:22,title:'NOVA is created with Hedera ATS.',copy:'Whole shares · Maximum supply: 1,000 · Initial supply: 0. Creation and issuance are separate transactions.'},
 {stage:'verify',step:0,at:30,title:'No eligibility, no transfer.',copy:'NOVA cannot pass the ATS KYC gate until eligibility is established.'},
 {stage:'verify',step:1,at:37,title:'A synthetic credential',copy:'Issuer: Admin · Subject: Seller. Synthetic KYC only; no real identity information is collected.'},
 {stage:'verify',step:2,at:44,title:"Verified doesn't mean eligible yet.",copy:'Credential verified. On-chain KYC grant still required.'},
 {stage:'verify',step:3,at:50,title:'Seller eligible for NOVA',copy:'Recorded historical KYC grant.'},
 {stage:'verify',step:4,at:55,title:'100 NOVA issued',copy:'Admin issued 100 whole shares to Seller after the recorded KYC grant. Creation and issuance are separate transactions.'},
 {stage:'match',step:0,at:60,title:'Seller places two asks.',copy:'4 NOVA @ 0.09 HBAR · 5 NOVA @ 0.10 HBAR. Price-time priority.'},
 {stage:'match',step:1,at:68,title:'Buyer bids for six.',copy:'Bid: 6 NOVA @ 0.10 HBAR. Orders express unfunded intent.'},
 {stage:'match',step:2,at:76,title:'Best price matches first.',copy:'4 NOVA @ 0.09 HBAR. Each match uses the resting order price.'},
 {stage:'match',step:3,at:84,title:'The remaining two match next.',copy:'2 NOVA @ 0.10 HBAR. Equal prices use server acceptance sequence.'},
 {stage:'match',step:4,at:92,title:'MATCHED · NOT SETTLED',copy:'Buyer remaining: 0 · Seller 0.10 ask remaining: 3 NOVA. No NOVA or HBAR transferred.'},
 {stage:'settle',step:0,at:100,title:'Settlement starts for this match.',copy:'Now we move from off-chain matching to on-chain settlement.'},
 {stage:'settle',step:1,at:106,title:'Seller locks the matched NOVA.',copy:'ATS Hold · Settlement contract is escrow. Seller available 82 / held 2. HBAR stays with Buyer.'},
 {stage:'settle',step:2,at:112,title:'Settlement terms are registered.',copy:'The settlement contract binds Buyer, Seller, quantity, payment, and Hold to this match.'},
 {stage:'settle',step:3,at:118,title:'Buyer submits the exact payment.',copy:'The HBAR payment enters the settlement transaction. It is not finalized separately from delivery.'},
 {stage:'settle',step:4,at:124,title:'Atomic delivery and payment.',copy:'2 NOVA to Buyer and 0.20 HBAR principal to Seller, in the same transaction. Network fees are separate.'},
 {stage:'settle',step:5,at:130,title:'SETTLED',copy:'Either both sides happen, or neither side happens. Recorded settlement complete · Block 40258355.'},
 {stage:'prove',step:0,at:136,title:'Settlement independently verified.',copy:'HoldBook independently verifies the transaction, events, NOVA balances, and HBAR payment using RPC and Mirror Node.'},
 {stage:'prove',step:1,at:155,title:'The record is inspectable.',copy:'Settlement block 40258355. Seller 82 / held 0, Buyer 18 / held 0. Seller received 0.20 HBAR principal.'},
 {stage:'prove',step:2,at:172,title:'HoldBook',copy:'ATS manages the asset. HoldBook manages the market.'},
];
export type DemoState = {index:number;elapsed:number;playing:boolean;revision:number};
export const initialDemo:DemoState = {index:0,elapsed:0,playing:false,revision:0};
export type DemoAction = {type:'tick';seconds:number}|{type:'jump';index:number}|{type:'next'|'previous'|'replay'|'restart'|'play'|'pause'|'resume'};
export function demoReducer(s:DemoState,a:DemoAction):DemoState {
 if(a.type==='pause')return {...s,playing:false};
 if(a.type==='resume')return {...s,playing:s.elapsed<180};
 if(a.type==='play')return {...initialDemo,playing:true,revision:s.revision+1};
 if(a.type==='tick'){
  if(!s.playing)return s;
  const elapsed=Math.min(180,s.elapsed+Math.max(0,a.seconds));
  return {...s,elapsed,index:cues.reduce((index,c,i)=>c.at<=elapsed?i:index,0),playing:elapsed<180};
 }
 const index=a.type==='jump'?Math.max(0,Math.min(cues.length-1,Math.trunc(a.index))):a.type==='restart'?0:a.type==='replay'?cues.findIndex(c=>c.stage===cues[s.index].stage):Math.max(0,Math.min(cues.length-1,s.index+(a.type==='next'?1:-1)));
 return {index,elapsed:cues[index].at,playing:false,revision:s.revision+(['replay','restart'].includes(a.type)?1:0)};
}
export function demoMode(search:string){return new URLSearchParams(search).get('demo')==='1';}
export function demoURL(href:string,enabled:boolean){const url=new URL(href);if(enabled)url.searchParams.set('demo','1');else url.searchParams.delete('demo');return url.pathname+url.search+url.hash;}
export function demoKey(event:{key:string;repeat:boolean;altKey:boolean;ctrlKey:boolean;metaKey:boolean;shiftKey:boolean},interactive:boolean){
 if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||interactive)return;
 return event.key==='Escape'?'exit':event.key==='ArrowLeft'?'previous':['ArrowRight',' '].includes(event.key)?'next':undefined;
}

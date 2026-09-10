export type Stage = 'overview' | 'tokenize' | 'verify' | 'match' | 'settle' | 'prove';
export const cues: {stage:Stage; step:number; at:number; title:string; copy:string}[] = [
 {stage:'overview',step:0,at:0,title:'Tokenized equity. Verifiable settlement.',copy:'Follow fictional NOVA shares from issuance to atomic exchange on Hedera Testnet.'},
 {stage:'tokenize',step:0,at:15,title:'A share begins with a definition.',copy:'Illustrative certificate. The artwork is not an on-chain right or proof of ownership.'},
 {stage:'tokenize',step:1,at:20,title:'From certificate to digital share.',copy:'A visual transformation of the illustration into the NOVA marker.'},
 {stage:'tokenize',step:2,at:25,title:'Created with Hedera ATS',copy:'Whole shares · Maximum supply: 1,000 · Initial supply: 0. Creation and issuance are separate transactions.'},
 {stage:'tokenize',step:3,at:30,title:'100 NOVA issued',copy:'Admin issued 100 whole shares to Seller after the recorded KYC grant. This is the September 7 issuance, not the starting balance of the later swap.'},
 {stage:'verify',step:0,at:35,title:'Eligibility not established',copy:'NOVA stops outside the ATS KYC gate. This scene explains the earlier eligibility steps.'},
 {stage:'verify',step:1,at:42,title:'A synthetic credential',copy:'Issuer: Admin · Subject: Seller. Synthetic KYC only; no real identity information is collected.'},
 {stage:'verify',step:2,at:49,title:'Credential verified',copy:'Signature verification is separate from an on-chain KYC grant. The gate remains closed.'},
 {stage:'verify',step:3,at:55,title:'KYC grant recorded',copy:'The historical grant established Seller eligibility at that time. It does not establish current KYC validity.'},
 {stage:'match',step:0,at:60,title:'Seller sets the asks.',copy:'4 NOVA @ 0.09 HBAR · 5 NOVA @ 0.10 HBAR. Recorded T07 matching example.'},
 {stage:'match',step:1,at:68,title:'Buyer bids for six.',copy:'Bid: 6 NOVA @ 0.10 HBAR. Orders express unfunded intent.'},
 {stage:'match',step:2,at:76,title:'The best price matches first.',copy:'4 NOVA @ 0.09 HBAR. Each match uses the resting order price.'},
 {stage:'match',step:3,at:84,title:'Two more shares match.',copy:'2 NOVA @ 0.10 HBAR. Equal prices use server acceptance sequence.'},
 {stage:'match',step:4,at:92,title:'MATCHED · NOT SETTLED',copy:'Buyer remaining: 0 · Seller 0.10 ask remaining: 3 NOVA. No NOVA or HBAR transferred.'},
 {stage:'settle',step:0,at:100,title:'A separate recorded swap.',copy:'T05 · Recorded fixed swap · 10 NOVA for 1 HBAR. This is not settlement of the preceding T07 matches.'},
 {stage:'settle',step:1,at:107,title:'Seller locks ten NOVA.',copy:'ATS Hold · Swap contract is escrow. Seller available 84 / held 10. Buyer available 6. HBAR stays with Buyer.'},
 {stage:'settle',step:2,at:114,title:'Buyer pays one HBAR.',copy:'The payment enters the settlement call. This is an explanation inside one atomic transaction, not a separately completed payment.'},
 {stage:'settle',step:3,at:121,title:'Atomic delivery and payment.',copy:'10 NOVA to Buyer and 1 HBAR principal to Seller, in the same transaction. Network fees are separate.'},
 {stage:'settle',step:4,at:128,title:'Recorded settlement complete',copy:'The Hedera network illustration acknowledges the recorded transaction once. Inspect its proof next.'},
 {stage:'prove',step:0,at:135,title:'Recorded settlement verified',copy:'September 8, 2026 · Hedera Testnet. These are historical balances, not current balances.'},
 {stage:'prove',step:1,at:155,title:'The record is inspectable.',copy:'Settlement block 40247134. Final verification block 40247352. Seller 84, Buyer 16, both held 0. Seller received 1 HBAR principal.'},
 {stage:'prove',step:2,at:175,title:'HoldBook',copy:'Agreement → Settlement → Proof'},
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

// Fixed public RPC/Mirror only; no wallet, signer or chain mutation.
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){return n(s.startsWith('./')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const {readHoldState}=await import('../../src/hold.ts'),{createTradeInput,assertTradeState}=await import('../../src/trade.ts');
const requests=[],original=globalThis.fetch;
globalThis.fetch=(url,options={})=>{const u=new URL(url);assert.ok(['https://testnet.hashio.io','https://testnet.mirrornode.hedera.com'].includes(u.origin));if(options.body){const r=JSON.parse(options.body);assert.ok(['eth_chainId','eth_blockNumber','eth_getBlockByNumber','eth_call','eth_getCode'].includes(r.method));requests.push(r.method);}return original(url,options);};
const state=await readHoldState(AbortSignal.timeout(180000),undefined,console.log),input=createTradeInput(state);assertTradeState(state,input,'start');
writeFileSync(process.argv[2],JSON.stringify({recordedAt:new Date().toISOString(),kind:'Read-only T05 prerequisites; no wallet/journal or pending-MetaMask observation',state,input,requests},null,2)+'\n');
console.log(JSON.stringify({block:state.block,seller:state.sellerBalance,buyer:state.buyerBalance,held:[state.sellerHeld,state.buyerHeld],kycCoversExpiry:true}));

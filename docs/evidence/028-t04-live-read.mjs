// Public fixed Testnet RPC/Mirror only. In-memory journal for historical recovery.
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){return n(s.startsWith('./')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const storage=new Map();globalThis.window={localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)}};
const h=await import('../../src/hold.ts'),n=await import('../../src/nova.ts'),l=await import('../../src/lifecycle.ts');
const signal=AbortSignal.timeout(600000),recordedAt=new Date().toISOString(),requests=[];const original=globalThis.fetch;
globalThis.fetch=(url,options={})=>{const u=new URL(url);assert.ok(['https://testnet.hashio.io','https://testnet.mirrornode.hedera.com'].includes(u.origin));if(options.body){const rpc=JSON.parse(options.body);assert.ok(['eth_chainId','eth_blockNumber','eth_getBlockByNumber','eth_call','eth_getCode','eth_getTransactionByHash','eth_getTransactionReceipt','eth_getLogs'].includes(rpc.method));requests.push(rpc.method)}return original(url,options)};
console.log("Checking T02 historical creation");
const creation=await n.recoverNova(l.creationHash,l.accounts.Admin.address,signal);
const t03=await h.verifyT03History(signal,console.log);
const current=await h.readHoldState(signal,undefined,console.log);const next=h.nextHoldAction(current,[]);
assert.equal(creation.status,'complete');assert.equal(t03.supply,'100');assert.equal(next,'create-hold');
const output={recordedAt,kind:'Live public read-only verification; no wallet, signature or submission',creation,t03,current,next,requests};
writeFileSync(process.argv[2],JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({creation:creation.status,creationBlock:creation.readBlock,t03:t03.block,current:current.block,next,seller:current.sellerBalance,buyer:current.buyerBalance,held:current.sellerHeld}));

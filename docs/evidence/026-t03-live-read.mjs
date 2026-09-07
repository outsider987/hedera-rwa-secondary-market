// Fixed public Testnet reads only; no wallet or signer.
import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){return n(s.startsWith('./')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const l=await import('../../src/lifecycle.ts'),n=await import('../../src/nova.ts');
const signal=AbortSignal.timeout(180000),recordedAt=new Date().toISOString();
const history=await n.recoverNova(l.creationHash,l.accounts.Admin.address,signal);
const current=await l.readLifecycleState(signal);
writeFileSync(process.argv[2],JSON.stringify({recordedAt,kind:'Live read-only Testnet RPC and Mirror; no signatures or transactions',history,current,nextAction:l.nextAction(current,[])},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({history:history.status,historyBlock:history.readBlock,currentBlock:current.block,supply:current.supply,roles:current.roles}));

import assert from 'node:assert/strict';
import {test} from 'node:test';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/')&&!/\.[a-z]+$/.test(s)?new URL(s+'.ts',c.parentURL).href:s,c)}});
const m=await import('../src/market.ts'),{hashTypedData}=await import('viem');
const domain={name:'HoldBook Unfunded Orders',version:'1',chainId:'296',salt:'0x'+'0123456789abcdef'.repeat(4)};
const command={requestId:'request',orderId:'request',owner:'0x740e4ef58151a169621622577a5b6d6ff5010836',market:'NOVA/HBAR',action:'Place',side:'Sell',quantity:'4',price:'9000000',expiresAt:'86401',deadline:'301',preparedAt:'1'};
function intent(){return {domain,record:{prepared:{...command,requestId:'1'.repeat(64),orderId:'2'.repeat(64)},status:'pending',digest:'',verified:false,result:null,reason:''}};}
test('exact HBAR parsing rejects exponent, excess precision, invalid quantity and int64 overflow',()=>{
 assert.deepEqual(m.amount('6','0.10'),{quantity:'6',price:'10000000',notional:'60000000'});assert.equal(m.hbar('56000000'),'0.56');assert.equal(m.hbar('1'),'0.00000001');
 for(const [q,p] of [['0','1'],['1001','1'],['01','1'],['1','1e2'],['1','0.000000001'],['1','0'],['2','92233720368.54775807'],['1','+1'],['1','1.']])assert.throws(()=>m.amount(q,p));
 assert.equal(m.amount('1','92233720368.54775807').price,'9223372036854775807');
});
test('independent viem and Go EIP-712 project digests agree',()=>{
 assert.equal(hashTypedData(m.typedData(command,domain)),'0xfa005ba248ae6e5452ef97894a69b89e0813a06d2f00bef6d503119e6384e28b');
 assert.equal(hashTypedData(m.wireTypedData(command,domain)),hashTypedData(m.typedData(command,domain)));
 for(const field of ['owner','requestId','orderId','market','action','side','quantity','price','expiresAt','deadline']){const value={...command,[field]:field==='owner'?'0x'+'1'.repeat(40):['quantity','price','expiresAt','deadline'].includes(field)?'2':'changed'};assert.notEqual(hashTypedData(m.typedData(value,domain)),hashTypedData(m.typedData(command,domain)));}
});
test('public intent storage retains pending requests and strips signatures and wallet objects',()=>{
 let raw=null;const storage={getItem:()=>raw,setItem:(_,v)=>raw=v};const value=intent();value.signature='DO_NOT_EXPORT';value.wallet={secret:'DO_NOT_EXPORT'};value.record.signature='DO_NOT_EXPORT';value.record.prepared.signature='DO_NOT_EXPORT';m.saveIntent(value,storage);assert.doesNotMatch(raw,/DO_NOT_EXPORT|signature|secret|wallet/);assert.equal(m.pending(m.loadIntent(storage)),true);
 assert.throws(()=>m.saveIntent(value,{getItem:()=>null,setItem(){}}));
 for(const changes of [{market:'wrong'},{deadline:'300'},{expiresAt:'86400'},{owner:'0x'+'0'.repeat(40)}])assert.throws(()=>m.commandCheck({...intent().record.prepared,...changes}));
});
test('partial cancellation remains explicit and public exports whitelist every level',()=>{
 const c=intent().record.prepared,o={...c,sequence:'1',acceptedAt:'1',remaining:'0',matched:'2',cancelled:'2',expired:'0',reason:'Cancelled',signature:'DO_NOT_EXPORT'};
 assert.equal(m.status(o),'Cancelled');assert.equal(m.status({...o,remaining:'2',cancelled:'0'}),'Partially matched');
 const market={market:'NOVA/HBAR',domain,serverTime:'1',version:'1',orders:[o],matches:[],signature:'DO_NOT_EXPORT'};
 assert.doesNotMatch(JSON.stringify(m.marketEvidence(market,intent())),/DO_NOT_EXPORT|signature/);
 assert.throws(()=>m.marketEvidence({...market,orders:[{...o,matched:'3'}]}));
});
test('reload and unavailable recovery query the original ID without resubmission',async()=>{
 const saved=intent();let raw=JSON.stringify(saved),requests=[];const oldWindow=globalThis.window,oldFetch=globalThis.fetch;
 globalThis.window={localStorage:{getItem:()=>raw,setItem:(_,v)=>raw=v}};
 try{
  globalThis.fetch=async(path,options)=>{requests.push([path,options.method]);throw Error('controlled offline')};await assert.rejects(m.recoverIntent(new AbortController().signal));assert.equal(m.pending(m.loadIntent()),true);
  globalThis.fetch=async(path,options)=>{requests.push([path,options.method]);return new Response(JSON.stringify({...saved.record,status:'expired',reason:'Submission deadline expired'}),{status:200})};
  const recovered=await m.recoverIntent(new AbortController().signal);assert.equal(recovered.record.status,'expired');assert.equal(m.pending(recovered),false);
  assert.ok(requests.every(([path,method])=>path==='/api/commands/'+saved.record.prepared.requestId&&method==='GET'));
 }finally{globalThis.window=oldWindow;globalThis.fetch=oldFetch;}
});
test('populated Market renders partial cancellation and reverse matches honestly',async()=>{
 const {createServer}=await import('vite'),{createElement}=await import('react'),{renderToStaticMarkup}=await import('react-dom/server');
 const c=intent().record.prepared,o={...c,sequence:'1',acceptedAt:'1',remaining:'0',matched:'2',cancelled:'2',expired:'0',reason:'Cancelled'};
 const seller=c.owner,buyer='0xa1f2872ee7a9f74523ae0887a9dc428ff1340706';
 globalThis.__marketFixture={market:'NOVA/HBAR',domain,serverTime:'1',version:'1',orders:[o],matches:[{id:'3-1',maker:o.orderId,taker:'3'.repeat(64),buyer:seller,seller:buyer,quantity:'1',price:'10000000',notional:'10000000',time:'1',status:'Matched · Not settled'}]};
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',plugins:[{name:'populated-market-fixture',enforce:'pre',transform(source,id){if(id.endsWith('/src/MarketPanel.tsx'))return source.replace('useState<Market>()','useState<Market>(globalThis.__marketFixture)').replace("useState<'Open'|'All'>('Open')","useState<'Open'|'All'>('All')")}}]});
 try{const {default:Panel}=await server.ssrLoadModule('/src/MarketPanel.tsx');const html=renderToStaticMarkup(createElement(Panel,{visible:true,roles:{},session:0,activeAccount:seller}));assert.match(html,/Remaining 0 · Matched 2 · Cancelled 2 · Expired 0/);assert.match(html,/Matched · Not settled/);assert.match(html,/Buyer: Seller account · Seller: Buyer account/);assert.doesNotMatch(html,/Cancel remaining [0-9]/);}finally{delete globalThis.__marketFixture;await server.close();}
});

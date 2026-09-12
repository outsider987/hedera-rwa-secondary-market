// Isolated read-only local presentation checks. No browser profile, wallet or external writes.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {cues} from '../../src/presentation/demoState.ts';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const evidence=(process.argv.includes('--boundaries')||process.argv.includes('--failures')||process.argv.includes('--controls'))?JSON.parse(readFileSync('docs/evidence/050-demo-experience.json')):{recordedAt:new Date().toISOString(),browser:browser.version(),device:'Linux headless Chrome / SwiftShader; viewport emulation, not physical mobile hardware',results:[],limitations:[]};
const matching=JSON.parse(readFileSync('docs/evidence/035-t07-manual.json')).checkpoints[2].exports;
async function setup(port,width,height,options={}){
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',...options});await context.addInitScript(()=>{window.demoDraws=0;for(const cls of [window.WebGLRenderingContext,window.WebGL2RenderingContext])if(cls)for(const name of ['drawArrays','drawElements','drawElementsInstanced','drawArraysInstanced']){const original=cls.prototype[name];if(original)cls.prototype[name]=function(...args){window.demoDraws++;return original.apply(this,args);};}});const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[],writes=[],blockedReads=[];let fixture=matching[1],online=true,settlements=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(!['GET','HEAD'].includes(r.request().method())){const body=r.request().postDataJSON();const batch=Array.isArray(body)?body:[body];const methods=batch.map(x=>x?.method);if(u.hostname==='testnet.hashio.io'&&methods.every(m=>['eth_call','eth_chainId','eth_getBalance','eth_blockNumber','eth_getBlockByNumber','eth_getCode','eth_getTransactionReceipt','eth_getTransactionByHash','eth_getLogs','eth_getTransactionCount'].includes(m))){blockedReads.push(...methods);return r.abort();}writes.push(u.pathname);return r.abort();}if(u.origin!==`http://127.0.0.1:${port}`)return r.abort();if(u.pathname==='/api/market')return r.fulfill({status:online?200:503,json:fixture});if(u.pathname==='/api/settlements')return r.fulfill({json:{settlements,pendingOperation:null}});if(u.pathname==='/api/settlement-deployment')return r.fulfill({json:null});if(u.pathname.startsWith('/api/'))return r.fulfill({status:503,json:{error:'Isolated offline check'}});return r.continue();});
 return {context,page,errors,writes,blockedReads,setFixture:f=>{fixture=f;},setOnline:v=>{online=v;},setSettlements:s=>{settlements=s;}};
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
 if(!process.argv.includes('--boundaries')&&!process.argv.includes('--failures')&&!process.argv.includes('--controls'))for(const port of [5173,4173])for(const [width,height] of [[1920,1080],[1440,900],[390,844]]){
  console.log("matrix",port,width);const {context,page,errors,writes}=await setup(port,width,height);await page.goto(`http://127.0.0.1:${port}/?demo=1#overview`);const demo=page.locator('.demo-experience');await demo.waitFor();await page.locator('.demo-canvas canvas').waitFor({timeout:60000});await page.waitForLoadState('networkidle');await page.waitForTimeout(2000);let draws=await page.evaluate(()=>window.demoDraws),stable=0;for(let n=0;n<24&&stable<3;n++){await page.waitForTimeout(500);const next=await page.evaluate(()=>window.demoDraws);stable=next===draws?stable+1:0;draws=next;}assert.equal(stable,3);
  const captures=[];
  for(let i=0;i<cues.length;i++){
   if(i)await demo.getByRole('button',{name:'Next',exact:true}).click();
   assert.equal(await demo.getAttribute('data-cue'),String(i));if(i===8){assert.match(await demo.innerText(),/Seller eligible/);assert.match(await demo.innerText(),/No asset transfer/);}
   if([0,1,2,4,5,6,8,9,11,13,14,17,18,19,21].includes(i)){
    await page.evaluate(()=>scrollTo(0,0));
    const path=`docs/evidence/050-demo-${port}-${width}-cue${i}.png`;await page.waitForTimeout([2,6,11,17].includes(i)?500:2000);await page.screenshot({path,fullPage:true});captures.push(path);
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  assert.match(await demo.innerText(),/40247134/);assert.match(await demo.innerText(),/40247352/);
  console.log("cues complete",port,width);const canvas=await page.locator('canvas').count();assert.equal(canvas,1);
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Market',exact:true}).click();assert.equal(await demo.locator('canvas').count(),0);assert.ok(await page.locator('canvas').count()<=1);
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Overview',exact:true}).click();assert.equal(await demo.getAttribute('data-cue'),'21');
  await demo.getByRole('button',{name:'Restart demo',exact:true}).click();
  await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('ArrowRight');assert.equal(await demo.getAttribute('data-cue'),'1');await page.keyboard.press('ArrowLeft');assert.equal(await demo.getAttribute('data-cue'),'0');
  const next=demo.getByRole('button',{name:'Next',exact:true});await next.focus();await page.keyboard.press('ArrowRight');assert.equal(await demo.getAttribute('data-cue'),'0');assert.notEqual(await next.evaluate(e=>getComputedStyle(e).outlineStyle),'none');await page.keyboard.press('Space');assert.equal(await demo.getAttribute('data-cue'),'1');
  for(let i=0;i<12;i++)await next.click();assert.equal(await demo.getAttribute('data-cue'),'13');
  await page.emulateMedia({reducedMotion:'reduce'});await next.click();await next.click();assert.match(await demo.innerText(),/Seller 84 \/ held 10/);
  const ax=await demo.ariaSnapshot();assert.match(ax,/Seller locks ten NOVA/);
  await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Escape');assert.equal(new URL(page.url()).searchParams.has('demo'),false);assert.equal(await page.locator('#recorded-details').isVisible(),true);
  await page.reload();assert.equal(await demo.getAttribute('data-cue'),'0');
  assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  evidence.results.push({port,width,height,allCues:true,idleRenderingStopped:true,captures,keyboard:true,reducedMotion:true,accessibleText:true,routeRetention:true,reloadResets:true,pageErrors:errors,writes});await context.close();
 }
 // Browser integration uses saved public market data and an unsigned wallet double.
 if(!process.argv.includes('--failures')&&!process.argv.includes('--controls'))for(const width of [1440,390]){
  const h=await setup(4173,width,width===390?844:900),{page,context}=h;
  const seller=matching[1].orders[0].owner;
  await context.addInitScript(seller=>{window.ethereum={isMetaMask:true,on(){},removeListener(){},async request({method}){if(method==='eth_accounts'||method==='eth_requestAccounts')return[seller];if(method==='eth_chainId')return'0x128';throw Error('Signing forbidden in presentation test');}};},seller);
  await page.goto('http://127.0.0.1:4173/#market');await page.getByRole('button',{name:'Connect',exact:true}).click();
  const visual=page.locator('.market-visualization');await page.waitForFunction(()=>document.querySelector('.market-visualization')?.textContent.includes('Live snapshot'));
  const qty=page.getByLabel('Quantity (NOVA)',{exact:true}),price=page.getByLabel('Limit price (HBAR)',{exact:true});await qty.fill('7');await price.fill('0.1');
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Overview',exact:true}).click();await page.getByRole('button',{name:'Start Demo',exact:true}).click();await page.getByRole('button',{name:'Exit Demo',exact:true}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Market',exact:true}).click();assert.equal(await qty.inputValue(),'7');assert.equal(await price.inputValue(),'0.1');
  await page.waitForTimeout(2300);h.setFixture(matching[2]);await page.waitForFunction(()=>document.querySelector('.market-visualization')?.textContent.includes('2 new matches · 6 NOVA'));
  await page.screenshot({path:`docs/evidence/050-demo-market-${width}.png`,fullPage:true});
  await page.waitForTimeout(2300);assert.doesNotMatch(await visual.innerText(),/new matches/);
  h.setOnline(false);await page.waitForFunction(()=>document.querySelector('.market-visualization')?.textContent.includes('Stale snapshot'));assert.match(await visual.innerText(),/3 NOVA/);
  h.setFixture(matching[3]);h.setOnline(true);await page.waitForFunction(()=>document.querySelector('.market-visualization')?.textContent.includes('Live snapshot'));assert.doesNotMatch(await visual.innerText(),/new matches/);
  const recorded=JSON.parse(readFileSync('docs/evidence/038-t08-manual.json')).cases;
  h.setSettlements(recorded.map(c=>c.settlement));h.setFixture({...matching[3],matches:[...matching[3].matches,...recorded.map(c=>c.match)]});await page.waitForTimeout(2500);
  await visual.locator('summary').click();assert.match(await visual.innerText(),/Settled/);assert.match(await visual.innerText(),/Cancelled/);assert.match(await visual.innerText(),/Reclaimed/);
  await page.getByRole('combobox',{name:'Match filter'}).selectOption('Completed');await page.getByRole('button',{name:'View match 15-1',exact:true}).click();await page.locator('#settlement-heading').waitFor();
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Overview',exact:true}).click();await page.getByRole('button',{name:'Start Demo',exact:true}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Market',exact:true}).click();assert.match(await page.locator('#settlement-heading').innerText(),/15-1/);assert.doesNotMatch(await visual.innerText(),/new matches/);
  const intent={domain:matching[2].domain,record:{...matching[2].command,status:'pending',verified:false,result:null}};
  await page.evaluate(intent=>{localStorage.setItem('holdbook.testnet.market.v1',JSON.stringify(intent));window.dispatchEvent(new StorageEvent('storage',{key:'holdbook.testnet.market.v1'}));},intent);
  const stored=await page.evaluate(()=>localStorage.getItem('holdbook.testnet.market.v1'));
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Overview',exact:true}).click();await page.getByRole('button',{name:'Exit Demo',exact:true}).click();assert.equal(await page.evaluate(()=>localStorage.getItem('holdbook.testnet.market.v1')),stored);assert.match(await page.locator('#main').innerText(),/Order signature or submission is unresolved/);
  const savedOperation={attempted:true,rejected:false,operation:{id:'a'.repeat(64),settlementId:'15-1',action:'lock',sender:seller,to:'0x261ce349df182988fa25d00868cf6cf434220c24',value:'0',calldata:'0x00',status:'pending',hash:'0x'+'b'.repeat(64),createdAt:'1'}};
  await page.evaluate(record=>localStorage.setItem('holdbook.testnet.t08.v1',JSON.stringify(record)),savedOperation);await page.getByRole('button',{name:'Start Demo',exact:true}).click();await page.reload();await page.waitForFunction(()=>document.querySelector('#main')?.textContent.includes('Saved settlement is unresolved'));assert.equal(await page.evaluate(()=>localStorage.getItem('holdbook.testnet.t08.v1')),JSON.stringify(savedOperation));
  assert.deepEqual(h.errors,[]);assert.deepEqual(h.writes,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  evidence.results.push({width,marketSnapshots:true,batchMatches:true,stale:true,reconnectSuppressesReplay:true,settlementLabels:true,draftPreserved:true,selectedMatchPreserved:true,unknownRecordPreserved:true,coldDemoRecoveryNotice:true,blockedReadonlyRPC:h.blockedReads});await context.close();
 }
 // WebGL and chunk failures retain the DOM controls and evidence.
 if(!process.argv.includes('--controls'))for(const failure of ['webgl','chunk']){
  const h=await setup(4173,390,844);let blockedChunks=0;
  if(failure==='webgl')await h.context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};});
  else await h.context.route('**/assets/DemoCanvas-*.js',r=>{blockedChunks++;return r.abort();});
  await h.page.goto('http://127.0.0.1:4173/?demo=1#overview');await h.page.locator('.demo-fallback').waitFor();await h.page.waitForTimeout(2000);if(failure==='chunk')assert.ok(blockedChunks>0);assert.equal(await h.page.locator('canvas').count(),0);await h.page.getByRole('navigation',{name:'Demo stages'}).getByRole('button',{name:/Prove/}).click();assert.match(await h.page.locator('.demo-experience').innerText(),/40247352/);for(let cue=19;cue<=21;cue++){assert.equal(await h.page.locator('.demo-fallback circle').first().getAttribute('cx'),'500');if(cue<21)await h.page.locator('.demo-experience').getByRole('button',{name:'Next',exact:true}).click();}assert.deepEqual(h.errors,[]);evidence.results.push({failure,controlsAndProof:true,blockedChunks});await h.context.close();
 }
 // Full real-wall-clock sequence, with measured animation frame intervals.
 const {context,page,errors,writes}=await setup(4173,1440,900);await page.goto('http://127.0.0.1:4173/?demo=1#overview');const demo=page.locator('.demo-experience');await page.locator('canvas').waitFor();await page.waitForTimeout(2000);
 if(!process.argv.includes('--controls')){await demo.getByRole('button',{name:'Play 3-minute sequence',exact:true}).click();const start=Date.now();
 const timing=await page.evaluate(()=>new Promise(resolve=>{const times=[];let last=performance.now();function frame(now){times.push(now-last);last=now;if(times.length<180)requestAnimationFrame(frame);else{times.sort((a,b)=>a-b);resolve({samples:times.length,medianMs:times[90],p95Ms:times[171]});}}requestAnimationFrame(frame);}));
 await sleep(Math.max(0,181000-(Date.now()-start)));assert.equal(await demo.getAttribute('data-cue'),'21');assert.match(await demo.innerText(),/3:00/);
 evidence.results.push({fullSequenceSeconds:(Date.now()-start)/1000,finalCue:21,timing,pageErrors:errors,writes});}else{await page.clock.install();await demo.getByRole('button',{name:'Play 3-minute sequence',exact:true}).click();await page.clock.fastForward(181000);assert.equal(await demo.getAttribute('data-cue'),'21');assert.equal(await demo.getByRole('button',{name:'Play 3-minute sequence',exact:true}).count(),1);}
 // Pause/resume and background event do not catch up.
 await demo.getByRole('button',{name:'Play 3-minute sequence',exact:true}).click();await page.waitForTimeout(1100);await demo.getByRole('button',{name:'Pause',exact:true}).click();const paused=await demo.locator('.demo-time').innerText();await page.waitForTimeout(1200);assert.equal(await demo.locator('.demo-time').innerText(),paused);await demo.getByRole('button',{name:'Resume',exact:true}).click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.locator('canvas').count(),0);await page.waitForTimeout(1200);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});assert.match(await demo.locator('.demo-time').innerText(),/paused/);
 await page.locator('canvas').waitFor();await page.waitForTimeout(1000);await page.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await demo.locator('.demo-fallback').waitFor();await demo.getByRole('button',{name:'Prove',exact:false}).click();assert.match(await demo.innerText(),/40247352/);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);evidence.results.push({pauseResume:true,backgroundPause:true,visibilityMethod:'Controlled document.hidden / visibilitychange event',contextLossFallback:true,contextLossMethod:'Controlled webglcontextlost event',terminalPlayButtonUnique:true});await context.close();
}finally{writeFileSync('docs/evidence/050-demo-experience.json',JSON.stringify(evidence,null,2)+'\n');await browser.close();}

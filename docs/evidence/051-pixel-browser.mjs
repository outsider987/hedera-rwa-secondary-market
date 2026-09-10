// Isolated read-only local presentation checks. No browser profile, wallet or external writes.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {cues} from '../../src/presentation/demoState.ts';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--disable-gpu']});
const evidence=process.argv.includes('--boundaries')?JSON.parse(readFileSync('docs/evidence/051-pixel-browser.json')):{recordedAt:new Date().toISOString(),browser:browser.version(),device:'Linux headless Chrome, viewport emulation',results:[]};
const matching=JSON.parse(readFileSync('docs/evidence/035-t07-manual.json')).checkpoints[2].exports;
async function setup(port,width,height,options={}){
 const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block',...options});const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[],writes=[],blockedReads=[];let fixture=matching[1],online=true,settlements=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',r=>{const u=new URL(r.request().url());if(!['GET','HEAD'].includes(r.request().method())){const body=r.request().postDataJSON();const batch=Array.isArray(body)?body:[body];const methods=batch.map(x=>x?.method);if(u.hostname==='testnet.hashio.io'&&methods.every(m=>['eth_call','eth_chainId','eth_getBalance','eth_blockNumber','eth_getBlockByNumber','eth_getCode','eth_getTransactionReceipt','eth_getTransactionByHash','eth_getLogs','eth_getTransactionCount'].includes(m))){blockedReads.push(...methods);return r.abort();}writes.push(u.pathname);return r.abort();}if(u.origin!==`http://127.0.0.1:${port}`)return r.abort();if(u.pathname==='/api/market')return r.fulfill({status:online?200:503,json:fixture});if(u.pathname==='/api/settlements')return r.fulfill({json:{settlements,pendingOperation:null}});if(u.pathname==='/api/settlement-deployment')return r.fulfill({json:null});if(u.pathname.startsWith('/api/'))return r.fulfill({status:503,json:{error:'Isolated offline check'}});return r.continue();});
 return {context,page,errors,writes,blockedReads,setFixture:f=>{fixture=f;},setOnline:v=>{online=v;},setSettlements:s=>{settlements=s;}};
}
try{
 if(!process.argv.includes('--boundaries'))for(const port of [5173,4173])for(const [width,height] of [[1920,1080],[1440,900],[390,844]]){
  console.log('matrix',port,width);const h=await setup(port,width,height),{page,context}=h;
  await page.goto(`http://127.0.0.1:${port}/?demo=1#overview`);const demo=page.locator('.demo-experience');await demo.waitFor();await page.waitForLoadState('networkidle');
  const art=await page.locator('.pixel-scenery').evaluate(e=>getComputedStyle(e).backgroundImage);assert.match(art,/holdbook-pixel-hall/);
  for(const name of ['hall','sprites']){const r=await page.request.get(`http://127.0.0.1:${port}/assets/holdbook-pixel-${name}.png`);assert.equal(r.status(),200);}
  const captures=[];
  for(let i=0;i<cues.length;i++){
   if(i)await demo.getByRole('button',{name:'Next',exact:true}).click();assert.equal(await demo.getAttribute('data-cue'),String(i));
   if([0,4,8,13,15,17,18,19].includes(i)){await page.waitForTimeout(1050);await page.evaluate(()=>scrollTo(0,0));const path=`docs/evidence/051-pixel-${port}-${width}-cue${i}.png`;await page.screenshot({path,fullPage:true});captures.push(path);}
   if(i===18){assert.match(await page.locator('.pixel-network').innerText(),/Recorded on Hedera/);assert.equal(await page.locator('.pixel-network').evaluate(e=>e.getAnimations().filter(a=>a.playState==='running').length),0);}
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  assert.equal(await page.locator('canvas').count(),0);assert.match(await demo.innerText(),/40247352/);
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Market',exact:true}).click();assert.equal(await demo.locator('.pixel-stage').count(),0);
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Overview',exact:true}).click();assert.equal(await demo.getAttribute('data-cue'),'21');
  await demo.getByRole('button',{name:'Restart demo',exact:true}).click();await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('ArrowRight');assert.equal(await demo.getAttribute('data-cue'),'1');await page.keyboard.press('ArrowLeft');assert.equal(await demo.getAttribute('data-cue'),'0');
  const next=demo.getByRole('button',{name:'Next',exact:true});await next.focus();await page.keyboard.press('ArrowRight');assert.equal(await demo.getAttribute('data-cue'),'0');assert.notEqual(await next.evaluate(e=>getComputedStyle(e).outlineStyle),'none');await page.keyboard.press('Space');assert.equal(await demo.getAttribute('data-cue'),'1');
  await page.getByRole('navigation',{name:'Demo stages'}).getByRole('button',{name:/Settle/}).click();await page.waitForTimeout(1100);
  const item=page.locator('.pixel-item.shares');const start=await item.evaluate(e=>getComputedStyle(e).transform);await next.click();await page.waitForTimeout(180);const middle=await item.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(950);const end=await item.evaluate(e=>getComputedStyle(e).transform);assert.notEqual(start,middle);assert.notEqual(middle,end);
  await next.click();await page.waitForTimeout(1050);await next.click();const durations=await page.locator('.pixel-item').evaluateAll(items=>items.map(e=>getComputedStyle(e).transitionDuration));assert.deepEqual(durations,['0.9s','0.9s']);await page.waitForTimeout(1050);assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
  await page.emulateMedia({reducedMotion:'reduce'});await demo.getByRole('button',{name:'Previous',exact:true}).click();assert.equal(await item.evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  while(await demo.getAttribute('data-cue')!=='21')await next.click();assert.equal(await demo.getAttribute('data-cue'),'21');assert.match(await demo.ariaSnapshot(),/Historical T05 settlement proof/);
  await page.evaluate(()=>document.activeElement?.blur());await page.keyboard.press('Escape');assert.equal(new URL(page.url()).searchParams.has('demo'),false);assert.equal(await page.locator('#recorded-details').isVisible(),true);await page.reload();assert.equal(await demo.getAttribute('data-cue'),'0');
  assert.deepEqual(h.errors,[]);assert.deepEqual(h.writes,[]);evidence.results.push({port,width,height,captures,allCues:true,noCanvas:true,finiteMotion:true,afterIdleMotion:true,atomicDurations:true,reducedMotion:true,keyboard:true,routeRetention:true,errors:h.errors,writes:h.writes});await context.close();
 }
 // Browser integration uses saved public market data and an unsigned wallet double.
 if(!process.argv.includes('--failures')&&!process.argv.includes('--controls'))for(const width of (process.argv.includes('--boundaries')?[390]:[1440,390])){
  const h=await setup(4173,width,width===390?844:900),{page,context}=h;
  const seller=matching[1].orders[0].owner;
  await context.addInitScript(seller=>{window.ethereum={isMetaMask:true,on(){},removeListener(){},async request({method}){if(method==='eth_accounts'||method==='eth_requestAccounts')return[seller];if(method==='eth_chainId')return'0x128';throw Error('Signing forbidden in presentation test');}};},seller);
  await page.goto('http://127.0.0.1:4173/#market');await page.getByRole('button',{name:'Connect',exact:true}).click();
  const visual=page.locator('.market-visualization');await page.waitForFunction(()=>document.querySelector('.market-visualization')?.textContent.includes('Live snapshot'));
  const qty=page.getByLabel('Quantity (NOVA)',{exact:true}),price=page.getByLabel('Limit price (HBAR)',{exact:true});await qty.fill('7');await price.fill('0.1');
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Overview',exact:true}).click();await page.getByRole('button',{name:'Start Demo',exact:true}).click();await page.getByRole('button',{name:'Exit Demo',exact:true}).click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Market',exact:true}).click();assert.equal(await qty.inputValue(),'7');assert.equal(await price.inputValue(),'0.1');
  await page.waitForTimeout(2300);h.setFixture(matching[2]);await page.waitForFunction(()=>document.querySelector('.market-visualization')?.textContent.includes('2 new matches · 6 NOVA'));
  await page.screenshot({path:`docs/evidence/051-pixel-market-${width}.png`,fullPage:true});
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
 const h=await setup(4173,390,844),{page,context}=h;await context.route('**/holdbook-pixel-*.png',r=>r.abort());await page.goto('http://127.0.0.1:4173/?demo=1#overview');const demo=page.locator('.demo-experience');await demo.waitFor();await page.getByRole('navigation',{name:'Demo stages'}).getByRole('button',{name:/Prove/}).click();assert.match(await demo.innerText(),/40247352/);assert.equal(await page.locator('canvas').count(),0);
 await page.clock.install();await demo.getByRole('button',{name:'Play 3-minute sequence',exact:true}).click();await page.clock.fastForward(181000);assert.equal(await demo.getAttribute('data-cue'),'21');assert.equal(await demo.getByRole('button',{name:'Play 3-minute sequence',exact:true}).count(),1);
 await demo.getByRole('button',{name:'Play 3-minute sequence',exact:true}).click();await page.clock.fastForward(2200);await demo.getByRole('button',{name:'Pause',exact:true}).click();const paused=await demo.locator('.demo-time').innerText();await page.clock.fastForward(5000);assert.equal(await demo.locator('.demo-time').innerText(),paused);await demo.getByRole('button',{name:'Resume',exact:true}).click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await page.clock.fastForward(10000);assert.equal(await demo.locator('.pixel-stage').count(),0);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});assert.match(await demo.locator('.demo-time').innerText(),/paused/);assert.deepEqual(h.errors,[]);assert.deepEqual(h.writes,[]);
 evidence.results.push({imageFailureReadable:true,clockControlled180s:true,pauseResume:true,backgroundPause:true});await context.close();
}finally{writeFileSync('docs/evidence/051-pixel-browser.json',JSON.stringify(evidence,null,2)+'\n');await browser.close();}

// Read-only local browser acceptance. Network writes and external services are blocked.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.argv[2]);
const snapshot=JSON.parse(readFileSync('src/data/showcase.json'));
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
const results=[];
try {
 for(const port of [5173,4173])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference',serviceWorkers:'block'});
  const page=await context.newPage();const errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',r=>{
   const url=new URL(r.request().url());
   if(!['GET','HEAD'].includes(r.request().method())){writes.push(url.pathname);return r.abort();}
   if(url.origin!==`http://127.0.0.1:${port}`)return r.abort();
   if(url.pathname.startsWith('/api/'))return r.fulfill({status:503,json:{error:'Offline browser check'}});
   return r.continue();
  });
  await page.goto(`http://127.0.0.1:${port}`);
  const story=page.locator('.nova-story'),scene=story.locator('.story-scene');
  await story.waitFor();
  await story.locator('img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  for(let i=0;i<4;i++){
   await story.locator('.story-steps button').nth(i).click();
   assert.equal(await scene.getAttribute('data-position'),i===3?'2':'1');
   assert.equal(await story.locator('.story-payment').count(),0);
   if(i===1){assert.equal(await story.locator('.story-proof').count(),0);assert.match(await story.innerText(),/No transaction ID/);}
   if(i===3)assert.match(await story.innerText(),/Seller 100 NOVA/);
  }
  if(port===4173){await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(750);await page.screenshot({fullPage:true,path:`docs/evidence/048-nova-story-issuance-${width}.png`});}
  await story.getByRole('button',{name:'Continue to trading'}).click();
  for(const item of snapshot.cases){
   await story.getByRole('combobox').selectOption(item.id);
   assert.equal(await scene.getAttribute('data-position'),'0');
   assert.equal(await story.locator('.story-proof').count(),0);
   const actions=['matched','lock','register',...(item.id==='reclaim'?['expired']:[]),item.timeline[2].action];
   for(let i=1;i<actions.length;i++){
    await story.getByRole('button',{name:'Next step',exact:true}).click();
    const action=actions[i],event=item.timeline.find(t=>t.action===action);
    const position=action==='settle'?'2':['cancel','reclaim'].includes(action)?'0':'1';
    assert.equal(await scene.getAttribute('data-position'),position);
    const transform=await story.locator('.story-payment').getAttribute('style');
    assert.match(transform,action==='settle'?/translateX\(0%\)/:/translateX\(200%\)/);
    if(event){assert.equal(await story.locator('.story-proof').getAttribute('href'),'https://hashscan.io/testnet/transaction/'+event.hash);assert.match(await story.innerText(),new RegExp(`${event.after.sellerAvailable} / ${event.after.sellerHeld} NOVA`));}
    else {assert.equal(await story.locator('.story-proof').count(),0);assert.match(await story.innerText(),/Expiry is not a transaction/);}
    if(port===4173&&((item.id==='normal'&&action==='settle')||(item.id==='reclaim'&&action==='expired'))){await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(750);await page.screenshot({fullPage:true,path:`docs/evidence/048-nova-story-${action}-${width}.png`});}
   }
   assert.equal(await story.getByRole('button',{name:'Next step',exact:true}).isDisabled(),true);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await story.locator('.story-certificate').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  await page.emulateMedia({reducedMotion:'no-preference'});
  const previous=story.getByRole('button',{name:'Previous step'});
  await previous.focus();await page.keyboard.press('Enter');
  assert.equal(await scene.getAttribute('data-position'),'1');
  assert.equal(await story.locator('.story-certificate').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  assert.notEqual(await previous.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
  await story.locator('.story-steps button').nth(0).click();
  assert.equal(await story.locator('.story-certificate').evaluate(e=>getComputedStyle(e).transitionDuration),'0.7s');
  await story.locator('.story-steps button').nth(1).click();await story.locator('.story-steps button').nth(0).click();
  await page.waitForTimeout(750);
  assert.equal(await story.locator('.story-certificate').evaluate(e=>getComputedStyle(e).transform),'matrix(1, 0, 0, 1, 0, 0)');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  results.push({port,width,issuanceSteps:4,cases:4,evidenceAligned:true,expiryRetainsHold:true,reducedMotion:true,keyboard:true,rapidRetarget:true,overflow:false,pageErrors:errors,mutationRequests:writes});
  await context.close();
 }
} finally {await browser.close();}
writeFileSync('docs/evidence/048-nova-story.json',JSON.stringify({recordedAt:new Date().toISOString(),kind:'Local UI checks against committed historical snapshot; no new chain or MetaMask verification',results},null,2)+'\n');

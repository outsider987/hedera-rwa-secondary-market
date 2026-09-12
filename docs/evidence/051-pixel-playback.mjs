// Local playback and rAF observations; not physical-device or chain acceptance.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--disable-gpu']});const results=[];
try{
 for(const [width,height] of [[1440,900],[390,844]]){
  const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',r=>{const u=new URL(r.request().url());return u.origin==='http://127.0.0.1:4173'&&!u.pathname.startsWith('/api/')?r.continue():r.abort();});
  await page.goto('http://127.0.0.1:4173/?demo=1#overview');await page.waitForLoadState('networkidle');const demo=page.locator('.demo-experience');await page.getByRole('navigation',{name:'Demo stages'}).getByRole('button',{name:/Settle/}).click();await page.waitForTimeout(1200);await demo.getByRole('button',{name:'Next',exact:true}).click();
  const frames=await page.evaluate(()=>new Promise(resolve=>{const times=[];let last=performance.now();function frame(now){times.push(now-last);last=now;if(times.length<120)requestAnimationFrame(frame);else{times.sort((a,b)=>a-b);resolve({samples:120,medianMs:times[60],p95Ms:times[114],maxMs:times[119]});}}requestAnimationFrame(frame);}));
  if(width===1440){await demo.getByRole('button',{name:'Play 3-minute sequence',exact:true}).click();const start=Date.now();await new Promise(r=>setTimeout(r,181000));assert.equal(await demo.getAttribute('data-cue'),'21');assert.match(await demo.innerText(),/3:00/);results.push({realPlaybackSeconds:(Date.now()-start)/1000,finalCue:21});}
  assert.deepEqual(errors,[]);results.push({width,height,browser:browser.version(),device:'Linux headless Chrome, --disable-gpu; emulated viewport',frames,errors});await context.close();
 }
}finally{writeFileSync('docs/evidence/051-pixel-playback.json',JSON.stringify(results,null,2)+'\n');await browser.close();}

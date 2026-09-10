// Local software-rendered frame observations, not physical-device benchmarks.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try{
 for(const [width,height] of [[1920,1080],[1440,900],[390,844]]){
  const context=await browser.newContext({viewport:{width,height},serviceWorkers:'block'}),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(()=>{window.presentationDraws=0;const original=WebGL2RenderingContext.prototype.drawElements;WebGL2RenderingContext.prototype.drawElements=function(...args){window.presentationDraws++;return original.apply(this,args);};});
  await context.route('**/*',r=>{const u=new URL(r.request().url());return u.origin==='http://127.0.0.1:4173'&&!u.pathname.startsWith('/api/')?r.continue():r.abort();});
  await page.goto('http://127.0.0.1:4173/?demo=1#overview');await page.locator('canvas').waitFor();await page.waitForLoadState('networkidle');await page.waitForTimeout(1800);await page.screenshot({path:`docs/evidence/050-demo-final-overview-${width}.png`,fullPage:true});await page.getByRole('navigation',{name:'Demo stages'}).getByRole('button',{name:/Settle/}).click();await page.locator('canvas').waitFor();await page.waitForTimeout(2500);
  await page.locator('.demo-experience').getByRole('button',{name:'Next',exact:true}).click();
  const timing=await page.evaluate(()=>new Promise(resolve=>{const samples=[];let last=performance.now(),drawsAt15=0,drawsAt30=0;function frame(now){samples.push(now-last);last=now;if(samples.length===15)drawsAt15=window.presentationDraws;if(samples.length===30)drawsAt30=window.presentationDraws;if(samples.length<120)requestAnimationFrame(frame);else{samples.sort((a,b)=>a-b);resolve({drawsAt15,drawsAt30,samples:120,medianMs:samples[60],p95Ms:samples[114],maxMs:samples[119]});}}requestAnimationFrame(frame);}));
  assert.ok(timing.drawsAt30>timing.drawsAt15,'Manual motion must continue after an idle pause');
  const gpu=await page.locator('canvas').evaluate(c=>{const gl=c.getContext('webgl2'),ext=gl?.getExtension('WEBGL_debug_renderer_info');return {renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable',dpr:c.width/c.getBoundingClientRect().width};});
  assert.ok(gpu.dpr<=1.51);
  await page.getByRole('navigation',{name:'Demo stages'}).getByRole('button',{name:/Prove/}).click();await page.waitForTimeout(1800);assert.match(await page.locator('.demo-proof').innerText(),/0.33893288 HBAR/);assert.match(await page.locator('.demo-proof').innerText(),/1 HBAR principal/);const noticeURL=await page.getByRole('link',{name:'Presentation third-party notices'}).getAttribute('href');const notice=await page.request.get(new URL(noticeURL,page.url()).href);assert.equal(notice.status(),200);assert.match(await notice.text(),/Copyright.*Poimandres/);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);await page.screenshot({path:`docs/evidence/050-demo-final-proof-${width}.png`,fullPage:true});
  await page.locator('canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.locator('.demo-fallback').waitFor();assert.equal(await page.locator('.demo-fallback circle').first().getAttribute('cx'),'500');assert.deepEqual(errors,[]);
  results.push({nativeContextLoss:true,pageErrors:errors,width,height,deviceScaleFactor:1,scene:'T05 lock animation',browser:browser.version(),...gpu,...timing,medianFPS:1000/timing.medianMs,targetFPS:width===390?30:60});await context.close();
 }
 const file='docs/evidence/050-demo-experience.json',evidence=JSON.parse(readFileSync(file));evidence.performance=results;writeFileSync(file,JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}

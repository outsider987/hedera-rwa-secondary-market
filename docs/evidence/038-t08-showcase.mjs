import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const cases=[];
try {
 for(const [base,path] of [['http://127.0.0.1:5173','/showcase.html'],['http://127.0.0.1:4173','/showcase/index.html']]) for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true});const page=await context.newPage();const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
 await page.goto(base+path);await page.getByRole('heading',{name:'Per-match settlement cases'}).waitFor();
 for(const title of ['Seller sells to Buyer','Buyer sells to Seller','Seller cancels settlement','Seller reclaims expired Hold']){
 await page.getByRole('button',{name:title,exact:true}).click();const panel=page.locator('.showcase-case');await panel.getByRole('heading',{name:title,exact:true}).waitFor();assert.equal(await panel.locator('li').count(),3);assert.match(await panel.innerText(),/verified/);assert.equal(await panel.getByRole('link').count(),3);
 }
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.equal(await page.evaluate(()=>typeof window.ethereum),'undefined');assert.deepEqual(errors,[]);assert.equal(requests.some(u=>u.includes('/api/')),false);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download public snapshot JSON'}).click();assert.equal((await download).suggestedFilename(),'holdbook-testnet-snapshot.json');
 await page.getByRole('button',{name:'Seller sells to Buyer',exact:true}).focus();assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'Seller sells to Buyer');
 if(width===1440&&base.endsWith('4173'))await page.screenshot({path:'docs/evidence/038-t08-showcase.png',fullPage:true});
 cases.push({base,width,status:'Passed',cases:'4',wallet:'Absent',apiRequests:'0',download:'Passed',keyboardFocus:'Passed',overflow:false});await context.close();
 }
 await writeFile('docs/evidence/038-t08-showcase.json',JSON.stringify({recordedAt:new Date().toISOString(),cases},null,2)+'\n');
} finally {await browser.close();}

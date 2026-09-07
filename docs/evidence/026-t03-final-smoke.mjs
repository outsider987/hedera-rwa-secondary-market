// Final served-build smoke in clean headless contexts. No wallet provider or chain requests.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const {chromium}=createRequire(process.argv[2])('playwright');
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true}),results=[];
try {
 for(const port of [5173,4173])for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.name));
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'+port))external.push(new URL(r.url()).origin)});
  await page.goto('http://127.0.0.1:'+port,{waitUntil:'networkidle'});
  assert.equal(await page.getByRole('button',{name:'Approve T03 action in MetaMask'}).isDisabled(),true);
  assert.equal(await page.getByRole('button',{name:'Create NOVA in MetaMask'}).count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  results.push({port,width,errors,external,creationClosed:true,unreviewedT03Disabled:true});await context.close();
 }
} finally {await browser.close()}
writeFileSync(process.argv[3],JSON.stringify({recordedAt:new Date().toISOString(),results},null,2)+'\n',{flag:'wx'});
console.log('4 final-build smoke cases passed');

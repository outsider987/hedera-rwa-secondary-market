// Live public reads only: isolated browser, no wallet or transaction submission.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const {chromium}=await import(process.argv[2]);
const api=process.argv[3],site='https://outsider987.github.io/hedera-rwa-secondary-market/';
assert.equal(new URL(api).origin,api);
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
const results=[];
try {
  for (const width of [1440,390]) {
    const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(site,{waitUntil:'networkidle'});
    await page.getByRole('heading',{name:'Meet NOVA.',exact:true}).waitFor();
    await page.waitForFunction(()=>document.querySelector('#overview img')?.naturalWidth>0);
    await page.locator('.nova-story').waitFor();
    await page.locator('.nova-story').getByRole('button',{name:'2. Trade NOVA',exact:true}).click();
    assert.equal(await page.locator('.nova-story').getByRole('combobox').count(),1);
    const readback=await page.evaluate(async api=>{
      const health=await fetch(api+'/api/health').then(r=>r.json());
      const market=await fetch(api+'/api/market').then(r=>r.json());
      const deployment=await fetch(api+'/api/settlement-deployment').then(r=>r.json());
      return {health:health.status,orders:market.orders.length,matches:market.matches.length,contract:deployment.address};
    },api);
    assert.equal(readback.health,'ready');
    // Live order counts can grow after the original deployment.
    assert.ok(readback.orders>=24);assert.ok(readback.matches>=10);
    assert.equal(readback.contract,'0xa90da61f67c37473f38000e70623a77ad277304c');
    for(const tab of ['Market','Activity','Settings','Overview']){
      await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:tab,exact:true}).click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
    assert.deepEqual(errors,[]);
    results.push({width,...readback,novaStory:true,image:true,tabs:true,overflow:false,pageErrors:errors});
    await context.close();
  }
} finally {await browser.close();}
writeFileSync('docs/evidence/049-story-deployment.json',JSON.stringify({recordedAt:new Date().toISOString(),site,api,kind:'Live public Pages and Cloud Run reads; no wallet connected or signing',results},null,2)+'\n');

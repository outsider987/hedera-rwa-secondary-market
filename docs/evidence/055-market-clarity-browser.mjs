import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const {chromium}=await import(process.argv[2]);
const matching=JSON.parse(readFileSync('docs/evidence/035-t07-manual.json')).checkpoints[2].exports;
const recorded=JSON.parse(readFileSync('docs/evidence/038-t08-manual.json'));
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
const results=[];
try{
 for(const port of [5173,4173]){
  const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(15000);
  let known=false,market={...matching[3],matches:recorded.cases.map(c=>c.match)},settlements=recorded.cases.map(c=>c.settlement);
  const errors=[],writes=[];
  page.on('pageerror',()=>errors.push('Page error'));
  await context.route('**/*',r=>{
   const u=new URL(r.request().url());
   if(u.origin!==`http://127.0.0.1:${port}`)return r.abort();
   if(!['GET','HEAD'].includes(r.request().method())){writes.push(u.pathname);return r.abort();}
   if(u.pathname==='/api/market')return r.fulfill({json:market});
   if(u.pathname==='/api/settlements')return known?r.fulfill({json:{settlements,pendingOperation:null}}):r.fulfill({status:503,json:{error:'Isolated unavailable fixture'}});
   if(u.pathname==='/api/settlement-deployment')return r.fulfill({json:null});
   if(u.pathname.startsWith('/api/'))return r.fulfill({status:503,json:{error:'Isolated public fixture'}});
   return r.continue();
  });
  await context.addInitScript(()=>{window.ethereum={isMetaMask:true,on(){},removeListener(){},async request({method}){if(['eth_accounts','eth_requestAccounts'].includes(method))return['0xa1f2872ee7a9f74523ae0887a9dc428ff1340706'];if(method==='eth_chainId')return'0x128';throw Error('Signing forbidden');}}});
  await page.goto(`http://127.0.0.1:${port}/#market`);
  await page.getByRole('button',{name:'Connect',exact:true}).click();
  const list=page.locator('section[aria-labelledby="matches-heading"]');
  await list.getByText(/cannot be confirmed/).waitFor();
  const showAll=list.getByRole('button',{name:'Show all matches'});
  await showAll.focus();await page.keyboard.press('Enter');
  await list.getByRole('button',{name:'View match 15-1',exact:true}).click();
  const ticket=page.locator('.settlement-ticket');
  await ticket.getByText('Settlement status unavailable · Waiting for an update',{exact:true}).waitFor();
  assert.equal(await ticket.locator('dd').filter({hasText:/^Not confirmed$/}).count(),3);
  assert.equal(await ticket.locator('dd').filter({hasText:/^Not locked$|^Not paid$/}).count(),0);
  await page.locator('.market-exchange').getByText('Asset locations not confirmed',{exact:true}).waitFor();
  known=true;
  await ticket.locator('[role="status"] strong').filter({hasText:/^Settled$/}).waitFor();
  assert.equal(await ticket.getByText(/Historical match · No settlement/).count(),0);
  await list.getByRole('combobox').selectOption('Active');
  await list.getByText('No active matches in the received data.',{exact:false}).waitFor();
  known=false;
  await list.getByText(/Settlement updates unavailable/).waitFor();
  await ticket.getByText(/Settlement service unavailable/).waitFor();
  assert.equal(await ticket.getByText('Delivered · verified',{exact:true}).count(),1);
  known=true;
  await ticket.getByRole('button',{name:'New order',exact:true}).click();
  market=matching[2];settlements=[];
  await page.waitForTimeout(2500);
  const intent={domain:matching[2].domain,record:matching[2].command};
  await page.evaluate(intent=>{localStorage.setItem('holdbook.testnet.market.v1',JSON.stringify(intent));window.dispatchEvent(new StorageEvent('storage',{key:'holdbook.testnet.market.v1'}));},intent);
  const direct=page.locator('.market-result').getByRole('button',{name:'View match 5-1',exact:true});
  await direct.waitFor();
  await direct.focus();await page.keyboard.press('Enter');
  await page.getByRole('heading',{name:'Match 5-1',exact:true}).waitFor();
  await ticket.getByText(/Historical match · No settlement is permitted/).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:`docs/evidence/055-market-clarity-${port}.png`,fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  results.push({port,width:1440,unknownConsistent:true,terminalBeforeHistorical:true,filteredEmpty:true,staleSnapshotRetained:true,directMatchKeyboard:true,noOverflow:true,pageErrors:errors,localWrites:writes});
  await context.close();
 }
}finally{
 writeFileSync('docs/evidence/055-market-clarity-browser.json',JSON.stringify({recordedAt:new Date().toISOString(),browser:browser.version(),scope:'Desktop emulation, isolated unsigned public fixtures; external traffic and local writes blocked. No wallet/chain acceptance.',results},null,2)+'\n');
 await browser.close();
}

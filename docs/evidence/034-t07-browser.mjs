// Isolated Chrome + controlled wallet rejections; no private key or successful signature.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true});
const roles={Admin:'0xfd8fdb4989a916c6f2420a2116c356e34c889840',Seller:'0x740e4ef58151a169621622577a5b6d6ff5010836',Buyer:'0xa1f2872ee7a9f74523ae0887a9dc428ff1340706'};
const results=[];
try {for(const port of [5173,4173])for(const width of [1440,390]){
 const origin='http://127.0.0.1:'+port,context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'}),page=await context.newPage();
 const forbidden=[],errors=[],posts=[];let reads=0,offline=false;
 await context.addInitScript(roles=>{
  localStorage.setItem('holdbook.testnet.roles.v1',JSON.stringify(roles));const listeners=new Map();window.active=roles.Seller;window.chain='0x128';window.walletCalls=[];
  window.emit=(n,v)=>{for(const f of listeners.get(n)||[])f(v)};
  window.ethereum={isMetaMask:true,on(n,f){if(!listeners.has(n))listeners.set(n,new Set());listeners.get(n).add(f)},removeListener(n,f){listeners.get(n)?.delete(f)},async request({method}){
   window.walletCalls.push(method);if(method==='eth_accounts'||method==='eth_requestAccounts')return [window.active];if(method==='eth_chainId')return window.chain;
   if(method==='eth_signTypedData_v4'){if(window.delaySignature)return new Promise((resolve,reject)=>window.rejectSignature=()=>window.lateFixture?resolve('0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307f996231605b915621c'):reject(Object.assign(Error('Controlled user rejection'),{code:4001})));throw Object.assign(Error('Controlled user rejection'),{code:4001});}
   throw Error('Forbidden wallet method');
  }};
 },roles);
 await context.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());if(url.origin===origin){if(url.pathname==='/api/market'){reads++;if(offline)return route.abort();}if(req.method()==='POST')posts.push(url.pathname);return route.continue();}if(url.origin==='https://testnet.mirrornode.hedera.com'&&url.pathname.startsWith('/api/v1/accounts/'))return route.continue();forbidden.push(url.origin+url.pathname);return route.abort();});
 page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);await page.getByRole('heading',{name:'NOVA / HBAR',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.market-heading')?.textContent.includes('Live'));
 assert.equal(await page.locator('#market').isVisible(),true);await page.keyboard.press('Tab');assert.equal(await page.locator('.skip-link').evaluate(el=>el===document.activeElement),true);
 await page.getByRole('button',{name:'Connect',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#wallet-status')?.textContent.includes('Connected to Hedera Testnet.'));
 if(port===4173){await page.locator('#market select').focus();await page.keyboard.press('Tab');assert.equal(await page.getByLabel('Quantity (NOVA)',{exact:true}).evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Tab');assert.equal(await page.getByLabel('Limit price (HBAR)',{exact:true}).evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Tab');await page.keyboard.press('Enter');await page.locator('.market-review').waitFor();assert.equal(await page.getByRole('button',{name:'Sign in MetaMask',exact:true}).isEnabled(),false);await page.locator('.market-review input[type=checkbox]').focus();await page.keyboard.press('Space');await page.keyboard.press('Tab');assert.equal(await page.getByRole('button',{name:'Sign in MetaMask',exact:true}).isEnabled(),true);}
 else assert.equal(await page.getByRole('button',{name:'Review order',exact:true}).isEnabled(),false);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const liveText=await page.locator('.market-heading [role=status]').innerText();await page.waitForTimeout(2200);assert.equal(await page.locator('.market-heading [role=status]').innerText(),liveText);assert.equal(liveText,'Live');
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`docs/evidence/034-t07-${port}-${width}.png`,fullPage:true});
 if(port===4173){
  // Another tab owns the same existing wallet Web Lock: no signing or POST.
  const other=await context.newPage();await other.goto(origin+'/#history');await other.evaluate(()=>{window.lockReady=false;navigator.locks.request('holdbook-nova-create',async()=>{window.lockReady=true;await new Promise(resolve=>window.releaseLock=resolve)});});await other.waitForFunction(()=>window.lockReady);
  await page.getByRole('button',{name:'Sign in MetaMask',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#market [role=alert]'));
  assert.equal((await page.evaluate(()=>window.walletCalls)).includes('eth_signTypedData_v4'),false);await other.evaluate(()=>window.releaseLock());await other.close();
  await page.getByRole('button',{name:'Review order',exact:true}).click();await page.locator('.market-review').waitFor();await page.locator('.market-review input').check();await page.evaluate(()=>window.delaySignature=true);await page.getByRole('button',{name:'Sign in MetaMask',exact:true}).click();await page.waitForFunction(()=>typeof window.rejectSignature==='function');
  const saved=await page.evaluate(()=>localStorage.getItem('holdbook.testnet.market.v1'));assert.ok(saved);assert.doesNotMatch(saved,/signature|wallet|provider/);
  await page.evaluate(({buyer,late})=>{if(late){window.chain='0x1';window.emit('chainChanged','0x1');window.lateFixture=true;}else{window.active=buyer;window.emit('accountsChanged',[buyer]);}window.rejectSignature();},{buyer:roles.Buyer,late:width===390});
  await page.waitForFunction(()=>!document.querySelector('.market-review'));assert.equal(posts.filter(p=>p==='/api/commands').length,0);
  await page.reload();await page.locator('.pending-notice').filter({hasText:'Request pending'}).waitFor();assert.equal(await page.getByRole('button',{name:'Review order',exact:true}).isEnabled(),false);
  assert.equal(posts.filter(p=>p==='/api/commands').length,0);
 }
 await page.getByRole('link',{name:'History',exact:true}).click();await page.waitForTimeout(500);const before=reads;await page.waitForTimeout(2400);assert.equal(reads,before);
 await page.getByRole('link',{name:'Market',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.market-heading')?.textContent.includes('Live'));offline=true;await page.waitForFunction(()=>document.querySelector('.market-heading')?.textContent.includes('Offline'));assert.match(await page.locator('.market-heading').innerText(),/Last updated/);assert.equal(await page.getByRole('button',{name:'Review order',exact:true}).isEnabled(),false);
 assert.deepEqual(forbidden,[]);assert.deepEqual(errors,[]);results.push({port,width,liveAPI:true,mirror:'public reads',wallet:'controlled provider; no signature produced',review:port===4173?'passed':'preview gate passed',overflow:false,keyboard:port===4173?'skip link + native form and review tab flow passed':'skip link passed',liveRegion:'connection-only; repeated poll text stable',pollingStop:'passed',offlineRetention:'passed',crossTabAndLateRejection:port===4173?'passed':'not applicable',signedSubmissions:posts.filter(p=>p==='/api/commands').length,forbidden,errors});await context.close();
}
}finally{await browser.close();writeFileSync('docs/evidence/034-t07-browser.json',JSON.stringify({date:'2026-09-08',results,manualAcceptance:'Pending'},null,2)+'\n');}

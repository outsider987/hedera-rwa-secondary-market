import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';

test('the shell renders planned data without claiming a wallet or chain result', async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  });
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.tsx');
    const { walletConfig, queryClient } = await server.ssrLoadModule('/src/wallet.ts');
    const html = renderToStaticMarkup(createElement(WagmiProvider, { config: walletConfig, reconnectOnMount: false },
      createElement(QueryClientProvider, { client: queryClient }, createElement(App))));
    for (const text of [
      'HoldBook',
      'Trade summary',
      'Wallet not connected.',
      'NOVA',
      'USNOVA000016',
      'One trade on Hedera Testnet.',
      'Set up three accounts',
      'Not assigned',
      'Assignments are local labels',
      'Testnet deployment',
      'Not checked',
      'Check deployment and config',
      'Equity config',
      'Prepare ATS SDK',
      'Check SDK config',
      'SDK not prepared.',
      'SDK payload',
    ]) {
      assert.ok(html.includes(text), `Missing honest shell state: ${text}`);
    }
    assert.match(html, /href="#main"/);
    assert.match(html, /<main id="main">/);
    assert.match(html, /aria-describedby="wallet-status">Connect<\/button>/);
    assert.match(html, /id="wallet-status" role="status" aria-live="polite"/);
    assert.match(html, /disabled=""[^>]*>Check SDK config<\/button>/);
    assert.doesNotMatch(html, /SDK config verified|SDK prepared\./);
    assert.doesNotMatch(html, /Deployment and config verified|On-chain Equity config verified/);
    assert.doesNotMatch(html, /<iframe/);
    assert.ok(html.includes('T02 · NOVA creation history'));
    assert.ok(html.includes('T03 · Seller KYC and issuance history'));
    assert.doesNotMatch(html, /Create NOVA in MetaMask|Approve T03 action in MetaMask/);
    assert.ok(html.includes('T04 · Hold lifecycle complete'));
    assert.match(html, /href="#market" aria-current="page"/);
    assert.match(html, /id="history" hidden=""/);
    assert.match(html, /id="settings" hidden=""/);
    assert.ok(html.includes('Check readiness'));
    assert.ok(html.includes('10 NOVA'));
    assert.ok(html.includes('1 HBAR'));
    assert.ok(html.includes('Query NOVA transaction'));
    assert.doesNotMatch(html, /Prepare Buyer VC|Sign in MetaMask and verify|Approve T04 transaction/);
  } finally {
    await server.close();
  }
});

test('a Seller cancellation review uses the reviewed role for both label and selection',async()=>{
  // Inject a review into the real component's initial state for server rendering;
  // no wallet, contract, RPC or successful transaction is simulated here.
  const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',plugins:[{name:'cancellation-review-fixture',enforce:'pre',transform(source,id){
    if(id.endsWith('/src/TradePanel.tsx'))return source.replace('useState<TradeReview>()','useState<TradeReview>(globalThis.__cancellationReview)');
  }}]});
  try {
    const t=await server.ssrLoadModule('/src/trade.ts'),{accounts}=await server.ssrLoadModule('/src/lifecycle.ts');
    const input={...t.createTradeInput({block:'40243275',timestamp:'1788832446'}),escrow:'0x'+'9'.repeat(40),holdId:'17'};
    globalThis.__cancellationReview={action:'cancel',input,wallet:{expectedRole:'Seller'},calldata:await t.tradeCalldata('cancel',input)};
    const {default:TradePanel}=await server.ssrLoadModule('/src/TradePanel.tsx');
    const roles=Object.fromEntries(Object.entries(accounts).map(([name,a])=>[name,a.address]));
    const records=['deploy','lock'].map(action=>({kind:'t05-transaction',action,status:'complete',operationId:action,input}));
    for(const active of ['Seller','Buyer']) {
      const html=renderToStaticMarkup(createElement(TradePanel,{roles,session:0,activeAccount:accounts[active].address,records,onRecords(){}}));
      assert.match(html,/Cancel trade and return 10 NOVA/);
      assert.ok(html.includes('Required account: <strong>Seller</strong> · '+(active==='Seller'?'selected':'select in MetaMask')));
    }
  } finally {delete globalThis.__cancellationReview;await server.close();}
});

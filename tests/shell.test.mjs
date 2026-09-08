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
      'Local account setup',
      'Wallet not connected.',
      'NOVA',
      'USNOVA000016',
      'Lifecycle steps require separate verification.',
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
    assert.ok(html.includes("T04 · Hold lifecycle"));
    assert.match(html, /disabled=""[^>]*>Approve T04 transaction in MetaMask<\/button>/);
    assert.ok(html.includes('Query NOVA transaction'));
    assert.ok(html.includes('Prepare Buyer VC'));
    assert.ok(html.includes('Sign in MetaMask and verify'));
  } finally {
    await server.close();
  }
});

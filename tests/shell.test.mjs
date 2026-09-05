import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('the shell renders planned data without claiming a wallet or chain result', async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  });
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.tsx');
    const html = renderToStaticMarkup(createElement(App));
    for (const text of [
      'HoldBook',
      'Configured, not verified',
      'Wallet not connected.',
      'NOVA',
      'USNOVA000016',
      'Not created',
      'No transactions yet.',
      'All steps are pending.',
    ]) {
      assert.ok(html.includes(text), `Missing honest shell state: ${text}`);
    }
    assert.match(html, /href="#main"/);
    assert.match(html, /<main id="main">/);
    assert.doesNotMatch(html, /<form|<button|<input|<iframe/);
  } finally {
    await server.close();
  }
});

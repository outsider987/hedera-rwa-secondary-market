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
      'ATS SDK not loaded.',
      'Dependency risks remain unresolved',
    ]) {
      assert.ok(html.includes(text), `Missing honest shell state: ${text}`);
    }
    assert.match(html, /href="#main"/);
    assert.match(html, /<main id="main">/);
    assert.match(html, /<button type="button" aria-describedby="sdk-load-status">Load ATS SDK<\/button>/);
    assert.match(html, /id="sdk-load-status" role="status" aria-live="polite"/);
    assert.doesNotMatch(html, /<form|<input|<iframe/);
  } finally {
    await server.close();
  }
});

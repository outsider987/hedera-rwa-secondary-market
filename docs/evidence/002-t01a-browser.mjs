// Diagnostic tool only; Playwright is supplied outside the project dependency graph.
// Run after a successful production build, with dev and preview already running:
// node docs/evidence/002-t01a-browser.mjs /absolute/path/to/playwright/package.json output.json
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

assert.ok(process.argv[2], 'Supply the external Playwright package.json path');
assert.ok(process.argv[3], 'Supply a new evidence path; historical evidence must not be overwritten');
const output = process.argv[3];
const baseCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const lockSha256 = createHash('sha256').update(await readFile('package-lock.json')).digest('hex');
const require = createRequire(process.argv[2]);
const { chromium } = require('playwright');
const entry = (await readFile('dist/index.html', 'utf8')).match(/src="([^"]+\.js)"/)[1];
const imports = [...(await readFile(`dist${entry}`, 'utf8')).matchAll(/import\((["'`])\.\/(.+?)\1\)/g)];
assert.equal(imports.length, 1, 'the app has one direct SDK dynamic import');
const sdkAsset = `/assets/${imports[0][2]}`;
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
await mkdir('.impeccable/review', { recursive: true });
const results = [];

try {
  for (const [server, port] of [['dev', 5173], ['preview', 4173]]) {
    for (const [device, viewport] of [
      ['desktop', { width: 1440, height: 1000 }],
      ['mobile', { width: 390, height: 844 }],
    ]) {
      const origin = `http://127.0.0.1:${port}`;
      const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
      const externalOrigins = [];
      let sdkRequests = 0;
      let holdSdk = true;
      let releaseSdk;
      const gate = new Promise(resolve => { releaseSdk = resolve; });
      await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== origin) {
          externalOrigins.push(url.origin);
          return route.abort();
        }
        if (url.pathname.includes('asset-tokenization-sdk') || url.pathname === sdkAsset) {
          sdkRequests++;
          if (holdSdk) await gate;
        }
        return route.continue();
      });
      await context.routeWebSocket('**/*', ws => {
        const url = new URL(ws.url());
        if (url.origin === `ws://127.0.0.1:${port}`) ws.connectToServer();
        else { externalOrigins.push(url.origin); ws.close(); }
      });
      // A trap records forbidden wallet access; it supplies no provider or SDK double.
      await context.addInitScript(() => {
        window.__walletAccessCount = 0;
        Object.defineProperty(window, 'ethereum', { get() {
          window.__walletAccessCount++;
          throw new Error('Wallet access is outside this diagnostic');
        } });
      });
      const page = await context.newPage();
      let pageErrors = 0;
      let consoleErrors = 0;
      page.on('pageerror', () => pageErrors++);
      page.on('console', message => { if (message.type() === 'error') consoleErrors++; });
      await page.goto(origin, { waitUntil: 'networkidle' });
      const button = page.getByRole('button', { name: 'Load ATS SDK', exact: true });
      const status = page.getByRole('status');
      assert.match(await status.textContent(), /^ATS SDK not loaded\./);
      assert.equal(sdkRequests, 0, 'idle never requests the SDK');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Skip to content');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      assert.equal(await button.evaluate(el => el === document.activeElement), true);
      assert.notEqual(await button.evaluate(el => getComputedStyle(el).outlineStyle), 'none');
      await page.evaluate(() => scrollTo(0, 0));
      if (server === 'dev' && device === 'desktop') {
        await page.screenshot({ path: '.impeccable/review/t01a-idle.png', fullPage: true });
      }
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('#sdk-load-status')?.textContent.startsWith('Loading ATS SDK'));
      assert.equal(await button.isDisabled(), true);
      await button.evaluate(el => { el.click(); el.click(); });
      if (server === 'dev' && device === 'desktop') {
        await page.screenshot({ path: '.impeccable/review/t01a-loading.png', fullPage: true });
      }
      holdSdk = false;
      releaseSdk();
      await page.waitForFunction(() => document.querySelector('#sdk-load-status')?.textContent.startsWith('ATS SDK loaded;'));
      await page.waitForLoadState('networkidle');
      assert.equal(sdkRequests, 1, 'duplicate activation starts no second request');
      assert.equal(await button.isDisabled(), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const screenshot = `.impeccable/review/t01a-${server}-${device}.png`;
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: screenshot, fullPage: true });
      const walletAccesses = await page.evaluate(() => window.__walletAccessCount);
      assert.equal(walletAccesses, 0);
      await page.reload({ waitUntil: 'networkidle' });
      assert.match(await status.textContent(), /^ATS SDK not loaded\./);
      assert.equal(await button.isEnabled(), true);
      assert.equal(sdkRequests, 1, 'reload resets to idle without another SDK request');
      assert.equal(await page.evaluate(() => window.__walletAccessCount), 0);
      assert.deepEqual(externalOrigins, []);
      assert.equal(pageErrors, 0);
      assert.equal(consoleErrors, 0);
      const result = {
        server, device, viewport, realSdkLoad: 'loaded',
        productionAcceptance: server === 'preview' ? 'passed' : 'not applicable',
        idleLoadingSuccessReload: 'passed', duplicateGuard: 'passed',
        keyboardAndFocus: 'passed', overflow: false, sdkRequests,
        pageErrors, consoleErrors, walletAccesses, externalOrigins, screenshot,
      };
      results.push(result);
      console.log(JSON.stringify(result));
      await context.close();
    }
  }
  await writeFile(output, JSON.stringify({
    schemaVersion: 1,
    kind: 'isolated-sdk-load-diagnostic',
    baseCommit,
    lockSha256,
    browser: browser.version(),
    playwright: require('playwright/package.json').version,
    sdk: '8.0.0',
    note: 'Real SDK import and Management export presence only; no API invocation, wallet/chain or VC validation. Screenshots are ignored local artifacts. Historical failures remain in 002-t01a-browser.json.',
    results,
  }, null, 2) + '\n', { flag: 'wx' });
} finally {
  await browser.close();
}

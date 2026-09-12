// Isolated provider double; only account and chain reads are permitted.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const { chromium } = await import(process.argv[2]);
const accounts = {
  Admin: '0xfd8fdb4989a916c6f2420a2116c356e34c889840',
  Seller: '0x740e4ef58151a169621622577a5b6d6ff5010836',
  Buyer: '0xa1f2872ee7a9f74523ae0887a9dc428ff1340706',
};
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const results = [];
try {
  for (const port of [5173, 4173]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, serviceWorkers: 'block' });
    await context.addInitScript(({ accounts }) => {
      let active = accounts.Admin;
      const listeners = {};
      window.changeAccount = address => { active = address; for (const fn of listeners.accountsChanged ?? []) fn([active]); };
      window.ethereum = {
        isMetaMask: true,
        on(name, fn) { (listeners[name] ??= []).push(fn); },
        removeListener(name, fn) { listeners[name] = (listeners[name] ?? []).filter(f => f !== fn); },
        async request({ method }) {
          if (method === 'eth_accounts' || method === 'eth_requestAccounts') return [active];
          if (method === 'eth_chainId') return '0x128';
          throw Error('Wallet mutation prohibited');
        },
      };
    }, { accounts });
    const page = await context.newPage();
    await context.route('**/api/**', route => route.abort());
    await context.route('https://testnet.hashio.io/**', route => route.abort());
    await page.goto(`http://127.0.0.1:${port}/#settings`);
    const header = page.locator('header'), label = header.locator('.network span');
    await label.getByText('Not connected', { exact: true }).waitFor();
    const neutral = await header.evaluate(e => getComputedStyle(e.parentElement).backgroundColor);
    await header.getByRole('button', { name: 'Connect', exact: true }).click();
    const colors = [];
    for (const [role, address] of Object.entries(accounts)) {
      await page.evaluate(address => window.changeAccount(address), address);
      await label.getByText(role, { exact: true }).waitFor();
      const measurement = await label.evaluate(e => {
        const ctx = document.createElement('canvas').getContext('2d');
        function luminance(color) {
          ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
          const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
          return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
        }
        const style = getComputedStyle(e), background = getComputedStyle(e.closest('header').parentElement).backgroundColor;
        const a = luminance(style.color), b = luminance(background);
        return { background, contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
      });
      assert.ok(measurement.contrast >= 4.5);
      assert.notEqual(measurement.background, neutral);
      colors.push(measurement);
      await page.evaluate(() => window.scrollTo(0, 400));
      assert.equal(await header.evaluate(e => e.parentElement.getBoundingClientRect().top), 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (port === 4173 && role === (width === 1440 ? 'Admin' : 'Seller')) {
        await page.screenshot({ path: `docs/evidence/041-t08-role-colors-${width === 1440 ? 'desktop' : 'mobile'}.png` });
      }
    }
    assert.equal(new Set(colors.map(c => c.background)).size, 3);
    await page.evaluate(() => window.changeAccount('0x1111111111111111111111111111111111111111'));
    await label.getByText('Unassigned account', { exact: true }).waitFor();
    assert.equal(await header.evaluate(e => getComputedStyle(e.parentElement).backgroundColor), neutral);
    await page.evaluate(address => window.changeAccount(address), accounts.Buyer);
    await label.getByText('Buyer', { exact: true }).waitFor();
    await header.getByRole('button', { name: 'Disconnect', exact: true }).click();
    await label.getByText('Not connected', { exact: true }).waitFor();
    assert.equal(await header.evaluate(e => getComputedStyle(e.parentElement).backgroundColor), neutral);
    results.push({ port, width, colors, accountSwitch: true, neutralUnknownAndDisconnected: true, sticky: true, overflow: false, walletMutations: 0 });
    await context.close();
  }
} finally { await browser.close(); }
writeFileSync('docs/evidence/041-t08-role-colors.json', JSON.stringify({ recordedAt: new Date().toISOString(), kind: 'Isolated provider double; no real wallet or chain mutation', results }, null, 2) + '\n');

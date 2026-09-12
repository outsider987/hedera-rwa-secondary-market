import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
const { chromium } = await import(process.argv[2]);
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const results = [];
try {
  for (const port of [5173, 4173]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    await context.route('**/api/**', route => route.abort());
    await page.goto(`http://127.0.0.1:${port}/#settings`);
    const header = page.locator('header');
    await header.waitFor();
    await page.evaluate(() => window.scrollTo(0, 600));
    assert.ok(await page.evaluate(() => scrollY > 0));
    assert.equal(await header.evaluate(e => e.parentElement.getBoundingClientRect().top), 0);
    assert.equal(await header.evaluate(e => getComputedStyle(e.parentElement).backgroundColor), 'rgb(247, 249, 251)');
    assert.ok(await page.getByRole('button', { name: 'Connect', exact: true }).isVisible());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('.skip-link').focus();
    assert.ok(await page.locator('.skip-link').evaluate(e => {
      const r = e.getBoundingClientRect();
      return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === e;
    }));
    await page.keyboard.press('Enter');
    await page.waitForURL('**/#main');
    assert.ok((await page.locator('main').boundingBox()).y >= (await header.boundingBox()).y + (await header.boundingBox()).height);
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor();
    await page.evaluate(() => window.scrollTo(0, 400));
    if (port === 4173) await page.screenshot({ path: `docs/evidence/040-t08-header-${width === 1440 ? 'desktop' : 'mobile'}.png` });
    results.push({ port, width, stickyAfterScroll: true, opaque: true, skipLinkVisible: true, anchorClearance: true, navigation: true, overflow: false, walletRequests: 0 });
    await context.close();
  }
} finally { await browser.close(); }
writeFileSync('docs/evidence/040-t08-header.json', JSON.stringify({ recordedAt: new Date().toISOString(), kind: 'Isolated browser; API blocked; no wallet', results }, null, 2) + '\n');

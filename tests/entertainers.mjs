import { build } from 'esbuild';
import assert from 'node:assert/strict';
export async function checkEntertainers(context, id) {
  const page = await context.newPage();
  try {
    await page.goto(`chrome-extension://${id}/options/index.html`);
    const controls = page.locator('#entertainer-controls');
    await page.waitForFunction(() => !document.querySelector('#entertainer-controls').disabled);
    assert.equal(await page.getByLabel('Enable entertainer highlights').isChecked(), true);
    assert.equal(await controls.locator('#entertainer-categories input:checked').count(), 6);
    await page.getByLabel('Performers', { exact: true }).uncheck();
    await page.waitForFunction(async () => !(await chrome.runtime.sendMessage({ type: 'state.get' })).data.entertainers.categories.includes('performers'));
    await page.reload();
    await page.waitForFunction(() => !document.querySelector('#entertainer-controls').disabled);
    assert.equal(await page.getByLabel('Performers', { exact: true }).isChecked(), false);
    await page.getByLabel('Enable entertainer highlights').uncheck();
    await page.waitForFunction(async () => (await chrome.runtime.sendMessage({ type: 'scan.get' })).data.entertainers.enabled === false);
    await page.reload();
    await page.waitForFunction(() => !document.querySelector('#entertainer-controls').disabled);
    assert.equal(await page.getByLabel('Enable entertainer highlights').isChecked(), false);
    await page.getByLabel('Enable entertainer highlights').check();
    await page.waitForFunction(async () => (await chrome.runtime.sendMessage({ type: 'scan.get' })).data.entertainers.enabled === true);
    await page.getByLabel('Performers', { exact: true }).check();
    await page.waitForFunction(async () => (await chrome.runtime.sendMessage({ type: 'scan.get' })).data.entertainers.categories.length === 6);
    const errors = await page.evaluate(async () => {
      const response = await chrome.runtime.sendMessage({ type: 'entertainers.settings', settings: { enabled: true, categories: ['invalid-category'] } });
      return response.ok;
    });
    assert.equal(errors, false);
    // Exercise the real scanner with a synthetic directory on a locally fulfilled page.
    // This fixture stays in memory and never changes the shipped listing file.
    const bundle = await build({ stdin: { contents: `
      import directory from './src/entertainers/listings.json' with { type: 'json' };
      import { Scanner } from './src/content/scanner.js';
      directory.supportedSites = ['directory-fixture.test'];
      directory.listings = [{ id: 'fixture', name: 'Fixture Creator', aliases: ['FixtureAlias'], categories: ['performers', 'creators'], status: 'approved', activeUntil: new Date(Date.now() + 60000).toISOString() }];
      globalThis.directoryFixture = directory;
      globalThis.fixtureScanner = new Scanner(document);
      globalThis.fixtureState = { enabled: true, tracking: false, profiles: [], entertainers: { enabled: true, categories: ['performers'] } };
      fixtureScanner.update(fixtureState);
    `, resolveDir: process.cwd() }, bundle: true, write: false, format: 'iife', target: 'chrome120' });
    await page.route('https://directory-fixture.test/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><p>Fixture Creator FixtureAlias FixtureAliases</p>' }));
    await page.goto('https://directory-fixture.test/');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const names = () => page.evaluate(() => [...(CSS.highlights.get('cumrocket-matches') ?? [])].map(range => range.toString()));
    assert.deepEqual(await names(), ['Fixture Creator', 'FixtureAlias']);
    await page.evaluate(() => { fixtureState.entertainers.categories = []; fixtureScanner.update(fixtureState); });
    assert.deepEqual(await names(), []);
    await page.evaluate(() => { fixtureState.entertainers.categories = ['creators']; fixtureScanner.update(fixtureState); });
    assert.deepEqual(await names(), ['Fixture Creator', 'FixtureAlias']);
    await page.evaluate(() => { fixtureState.enabled = false; fixtureScanner.update(fixtureState); });
    assert.deepEqual(await names(), []);
    await page.evaluate(() => { fixtureState.enabled = true; fixtureState.entertainers.enabled = false; fixtureScanner.update(fixtureState); });
    assert.deepEqual(await names(), []);
    await page.evaluate(() => {
      fixtureState.entertainers.enabled = true;
      directoryFixture.listings[0].activeUntil = new Date(Date.now() + 500).toISOString();
      fixtureScanner.update(fixtureState);
    });
    assert.deepEqual(await names(), ['Fixture Creator', 'FixtureAlias']);
    await page.waitForFunction(() => CSS.highlights.size === 0);
    await page.evaluate(() => fixtureScanner.stop());
  } finally { await page.close(); }
}

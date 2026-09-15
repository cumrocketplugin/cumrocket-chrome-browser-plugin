import assert from 'node:assert/strict';
export async function checkCaptions(context, panel, origin) {
  const site = await context.newPage();
  await site.route(`${origin}/captions`, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><figcaption>Bright red balloon rises</figcaption><figcaption>Bright red balloon falls</figcaption><figcaption hidden>Hidden caption</figcaption>' }));
  await site.goto(`${origin}/captions`);
  await site.bringToFront();
  await panel.waitForFunction(() => !document.querySelector('#captions-enabled').disabled);
  const id = await panel.evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id);
  const configure = enabled => panel.evaluate(({ id, enabled }) => chrome.runtime.sendMessage({ type: 'captions.configure', tabId: id, enabled }), { id, enabled });
  const snapshot = () => panel.evaluate(id => chrome.tabs.sendMessage(id, { type: 'captions.snapshot' }), id);
  assert.equal((await configure(true)).ok, true);
  let result = await snapshot();
  assert.equal(result.report.total, 2);
  assert.equal(result.report.repeatedFragments[0].text, 'bright red balloon');
  assert.equal((await snapshot()).report.total, 2);
  await site.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<figcaption>Bright red balloon floats</figcaption>'));
  result = await snapshot();
  assert.equal(result.report.total, 3);
  assert.equal(result.report.repeatedFragments[0].count, 3);
  await panel.waitForFunction(() => document.querySelector('#captions-enabled').checked);
  const hasKey = await panel.evaluate(async () => (await chrome.runtime.sendMessage({ type: 'state.get' })).data.hasApiKey);
  assert.equal(await panel.locator('#captions-advanced').isDisabled(), !hasKey);
  await site.reload();
  await panel.waitForFunction(async id => { try { return (await chrome.tabs.sendMessage(id, { type: 'captions.snapshot' }))?.enabled; } catch { return false; } }, id);
  assert.equal((await snapshot()).report.total, 2);
  assert.equal((await configure(false)).ok, true);
  assert.equal((await snapshot()).report.total, 0);
  await site.close();
}

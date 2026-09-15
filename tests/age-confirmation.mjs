import assert from 'node:assert/strict';
import { createServer } from 'node:http';
export async function checkAgeConfirmation(context, panel, origin) {
  const site = await context.newPage();
  let confirmed = false;
  const server = createServer((req, res) => {
    const path = new URL(req.url, origin).pathname;
    if (path === '/age-test-next' && !confirmed) { res.writeHead(302, { location: '/age-test-gate' }); return res.end(); }
    if (path === '/age-test-confirm') { confirmed = true; res.writeHead(302, { location: '/age-test-next' }); return res.end(); }
    const body = path === '/age-test-gate' ? '<h1>Are you over 18?</h1><a href="/age-test-confirm">Yes, over 18</a>' : `<main><h1>Listing</h1><div style="height:1200px">Content</div>${confirmed ? '' : '<a rel="next" href="/age-test-next">Next</a>'}</main>`;
    res.setHeader('Content-Type', 'text/html'); res.end(`<!doctype html>${body}`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  try {
    await site.goto(`${origin}/age-test`);
    const tabId = await panel.evaluate(async url => (await chrome.tabs.query({})).find(t => t.url === url).id, site.url());
    const set = fields => panel.evaluate(async ({ tabId, fields }) => {
      const result = await chrome.runtime.sendMessage({ type: 'scroll.set', tabId, ...fields });
      if (!result.ok) throw Error(result.error);
    }, { tabId, fields });
    await site.waitForTimeout(500);
    await set({ enabled: true, speed: 600 });
    try { await site.waitForURL(`${origin}/age-test-next`); }
    catch (error) {
      const state = await panel.evaluate(tabId => chrome.runtime.sendMessage({ type: 'scroll.get', tabId }), tabId);
      throw Error(`Age gate did not continue: ${JSON.stringify(state)}`, { cause: error });
    }
    await site.waitForFunction(() => scrollY > 50);
    assert.equal(confirmed, true);
    await set({ paused: true });
    await site.evaluate(() => {
      const gate = document.createElement('div'); gate.id = 'gate';
      gate.style = 'position:fixed;inset:0;background:white;z-index:2147483647';
      gate.innerHTML = '<button>No, under 18</button><button>Yes</button><button disabled>Yes, over 18</button><button id="accept">Yes, I am over 18</button>';
      document.body.append(gate); window.ageClicks = 0;
      gate.addEventListener('click', event => { if (event.target.id === 'accept') { window.ageClicks++; gate.remove(); } else window.ageClicks += 100; });
    });
    await site.waitForTimeout(800);
    assert.equal(await site.evaluate(() => window.ageClicks), 0);
    await set({ paused: false });
    await site.waitForFunction(() => window.ageClicks === 1);
    await site.waitForTimeout(800);
    assert.equal(await site.evaluate(() => window.ageClicks), 1);
  } finally { await site.close(); server.close(); }
}

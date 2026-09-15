import assert from 'node:assert/strict';
export async function checkAdSkip(context, panel, origin) {
  const settings = await context.newPage();
  await settings.goto(new URL('/options/index.html', panel.url()).href);
  await settings.waitForFunction(() => !document.querySelector('#auto-skip-ads').disabled);
  assert.equal(await settings.locator('#auto-skip-ads').isChecked(), false);
  const site = await context.newPage();
  await site.route(`${origin}/skip-ads`, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><div style="position:relative;width:800px;height:450px"><video muted playsinline style="width:800px;height:450px"></video><button id="skip" style="position:absolute;right:20px;bottom:20px">Skip ads</button></div><script>const canvas=document.createElement("canvas");canvas.width=800;canvas.height=450;setInterval(()=>canvas.getContext("2d").fillRect(0,0,800,450),30);const video=document.querySelector("video");video.srcObject=canvas.captureStream(30);video.play();window.clicks=0;document.addEventListener("click",e=>{if(e.target.matches("button"))window.clicks++})</script>' }));
  await site.goto(`${origin}/skip-ads`);
  await site.waitForTimeout(600);
  assert.equal(await site.evaluate(() => clicks), 0);
  await settings.locator('#auto-skip-ads').check();
  await settings.getByText('Automatic ad skipping saved.', { exact: true }).waitFor();
  await site.bringToFront();
  await site.waitForFunction(() => clicks === 1);
  await site.waitForTimeout(600);
  assert.equal(await site.evaluate(() => clicks), 1);
  // MGP uses a custom ready-state control whose desktop action is mouseup.
  await site.evaluate(() => {
    const old = document.querySelector('#skip'); old.hidden = true;
    old.parentElement.classList.add('mgp_adRollRunning');
    old.insertAdjacentHTML('afterend', '<div class="mgp_adRollContainer" style="position:absolute;inset:0"><div class="mgp_adRollSkipButton" style="position:absolute;right:20px;bottom:20px;background:white;padding:10px"><div class="mgp_adRollSkipButtonContent">Skip Ad</div></div></div>');
    window.mgpSkips = 0;
    const control = document.querySelector('.mgp_adRollSkipButton');
    control.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); });
    control.addEventListener('mouseup', () => { if (control.classList.contains('mgp_skippable')) mgpSkips++; });
  });
  await site.waitForTimeout(600);
  assert.equal(await site.evaluate(() => mgpSkips), 0);
  await site.evaluate(() => document.querySelector('.mgp_adRollSkipButton').classList.add('mgp_skippable'));
  await site.waitForFunction(() => mgpSkips === 1);
  await site.waitForTimeout(600);
  assert.equal(await site.evaluate(() => mgpSkips), 1);
  await settings.reload();
  await settings.waitForFunction(() => !document.querySelector('#auto-skip-ads').disabled);
  assert.equal(await settings.locator('#auto-skip-ads').isChecked(), true);
  await settings.locator('#auto-skip-ads').uncheck();
  await settings.getByText('Automatic ad skipping saved.', { exact: true }).waitFor();
  await site.bringToFront();
  await site.evaluate(() => document.querySelector('#skip').insertAdjacentHTML('afterend', '<button style="position:absolute;bottom:20px;left:20px">Skip advertisement</button>'));
  await site.waitForTimeout(700);
  assert.equal(await site.evaluate(() => clicks), 1);
  await site.close(); await settings.close();
}

export async function checkOverlayAdSkip(context, panel, origin) {
  const site = await context.newPage();
  await site.route(`${origin}/overlay-ad-skip`, route => route.fulfill({ contentType: 'text/html', body: `<!doctype html>
    <div id="hlsplayer" style="position:relative;width:800px;height:450px">
      <div class="video-bg-pic"><video id="main" style="width:800px;height:450px"></video></div>
      <div class="video-overlay" style="position:absolute;inset:0">
        <video class="video-overlay" muted playsinline style="width:800px;height:450px"></video>
        <div class="video-overlay-skip" style="position:absolute;bottom:20px;right:20px;background:white;padding:10px"><div class="video-overlay-skip-txt noselect">Skip This Video</div></div>
      </div></div><script>
      window.skips=0;const canvas=document.createElement('canvas');canvas.width=800;canvas.height=450;
      setInterval(()=>canvas.getContext('2d').fillRect(0,0,800,450),30);
      const video=document.querySelector('video.video-overlay');video.srcObject=canvas.captureStream(30);video.play();
      document.querySelector('.video-overlay-skip').addEventListener('click',event=>{event.stopPropagation();window.skips++;document.querySelector('div.video-overlay').remove()});
      </script>` }));
  await site.goto(`${origin}/overlay-ad-skip`);
  await site.bringToFront();
  await site.waitForFunction(() => document.querySelector('video.video-overlay').currentTime > 0);
  const response = await panel.evaluate(() => chrome.runtime.sendMessage({ type: 'ads.settings', enabled: true }));
  assert.equal(response.ok, true);
  await site.waitForTimeout(650);
  assert.equal(await site.evaluate(() => skips), 0);
  await site.evaluate(() => document.querySelector('.video-overlay-skip').classList.add('skippable'));
  await site.waitForFunction(() => skips === 1);
  assert.equal(await site.locator('div.video-overlay').count(), 0);
  assert.equal(await site.evaluate(() => document.querySelector('#main').paused), true);
  await panel.evaluate(() => chrome.runtime.sendMessage({ type: 'ads.settings', enabled: false }));
  await site.close();
}

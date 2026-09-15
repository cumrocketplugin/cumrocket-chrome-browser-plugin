import { request, element } from './client.js';
export function wireCaptions() {
  const $ = id => document.getElementById(`captions-${id}`);
  let tab, snapshot, aiReport, revision = 0, busy = false, hasKey = false;
  const status = text => { $('status').textContent = text; };
  function controls() {
    $('enabled').disabled = busy || !tab;
    for (const id of ['refresh', 'clear']) $(id).disabled = busy || !snapshot?.enabled;
    $('download').disabled = busy || !snapshot?.report.total;
    $('advanced').disabled = busy || !hasKey || !snapshot?.enabled;
    $('ai').hidden = !$('advanced').checked;
    $('ai').disabled = busy || !hasKey || !snapshot?.captions.length;
  }
  function render() {
    const root = $('report'); root.replaceChildren();
    if (!snapshot?.enabled) return;
    const r = snapshot.report;
    root.append(element('p', `${r.total} captions · ${r.distinct} distinct captions${snapshot.limited ? ' · Collection limit reached (1,000 captions / 500 characters each).' : ''}`));
    for (const [title, entries] of [['Keywords', r.keywords], ['Repeated fragments (2–6 words)', r.repeatedFragments], ['Repeated captions', r.repeatedCaptions], ['Keywords used once', r.uniqueKeywords], ['Phrases used once', r.uniquePhrases]]) {
      const section = element('details'); section.append(element('summary', `${title} (${entries.length})`));
      section.append(element('p', 'Up to 50 results. Counts include repeats within a caption. Common English filler words are omitted.'));
      for (const entry of entries) section.append(element('p', `${entry.text} — ${entry.count} occurrence(s) · caption ${entry.examples.join(', ')}`));
      if (!entries.length) section.append(element('p', 'No results yet.'));
      root.append(section);
    }
    const examples = element('details'); examples.append(element('summary', 'Collected captions'));
    snapshot.captions.forEach((c, i) => examples.append(element('p', `${i + 1}. ${c.text} (${c.source})`)));
    root.append(examples);
  }
  async function refresh() {
    const current = ++revision;
    try {
      const [tabs, state] = await Promise.all([chrome.tabs.query({ active: true, currentWindow: true }), request('state.get')]);
      const next = tabs[0];
      let latest = null;
      if (next?.id) try { latest = await chrome.tabs.sendMessage(next.id, { type: 'captions.snapshot' }); } catch { /* Restricted page. */ }
      if (current !== revision) return;
      if (tab?.id !== next?.id || snapshot?.url !== latest?.url || !latest?.enabled) { aiReport = null; $('ai-report').textContent = ''; $('advanced').checked = false; }
      tab = latest ? next : null; snapshot = latest; hasKey = state.hasApiKey;
      if (!hasKey) $('advanced').checked = false;
      $('site').textContent = latest ? new URL(latest.url).hostname : 'Open an HTTP/HTTPS website. Reload it if the extension was just updated.';
      $('enabled').checked = latest?.enabled === true;
      $('ai-note').textContent = hasKey ? `AI analysis sends up to the first 100 collected captions to ${state.preferences.provider}. API charges may apply. Click Send captions and analyze to run.` : 'Requires an API key for the selected provider in Settings.';
      render(); controls();
    } catch (error) { if (current === revision) status(error.message); }
  }
  async function run(work) {
    busy = true; controls(); status('Working…');
    try { await work(); status('Done.'); } catch (error) { status(error.message); }
    finally { busy = false; await refresh(); controls(); }
  }
  $('enabled').addEventListener('change', () => run(() => request('captions.configure', { tabId: tab.id, enabled: $('enabled').checked })));
  $('refresh').addEventListener('click', () => run(async () => { await refresh(); aiReport = null; $('ai-report').textContent = ''; }));
  $('clear').addEventListener('click', () => run(async () => { await chrome.tabs.sendMessage(tab.id, { type: 'captions.clear' }); aiReport = null; $('ai-report').textContent = ''; }));
  $('advanced').addEventListener('change', controls);
  $('ai').addEventListener('click', () => run(async () => {
    const id = tab.id, url = snapshot.url;
    const result = await request('captions.analyze', { tabId: id });
    await refresh();
    if (id !== tab?.id || url !== snapshot?.url || result.url !== url || !snapshot.enabled) return;
    aiReport = result;
    $('ai-report').textContent = `AI interpretation · first ${result.sampleSize} captions\n\n${result.text}`;
  }));
  $('download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ ...snapshot, aiReport }, null, 2)], { type: 'application/json' }));
    const link = element('a', undefined, { href: url, download: 'caption-report.json' });
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const changed = message => { if (message.type === 'ui.changed') refresh(); };
  chrome.runtime.onMessage.addListener(changed);
  chrome.tabs.onActivated.addListener(refresh); chrome.tabs.onUpdated.addListener(refresh);
  window.addEventListener('pagehide', () => { revision++; chrome.runtime.onMessage.removeListener(changed); chrome.tabs.onActivated.removeListener(refresh); chrome.tabs.onUpdated.removeListener(refresh); });
  refresh();
}

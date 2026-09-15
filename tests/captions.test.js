import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCaptions } from '../src/captions/analyze.js';
import { CaptionCollector } from '../src/captions/collector.js';
import { analyzeCaptionThemes } from '../src/services/caption-analysis.js';
import { DEFAULT_PREFERENCES } from '../src/profiles/model.js';

test('finds shared fragments across different captions and repeats within one caption', () => {
  const report = analyzeCaptions(['Watch the bright red balloon fly', 'A bright red balloon falls', 'echo echo violet'].map(text => ({ text })));
  assert.equal(report.total, 3);
  assert.equal(report.distinct, 3);
  assert.equal(report.repeatedFragments.find(p => p.text === 'bright red balloon').count, 2);
  assert.ok(!report.repeatedFragments.some(p => p.text === 'bright red'));
  assert.equal(report.keywords.find(p => p.text === 'echo').count, 2);
  assert.ok(report.uniqueKeywords.some(p => p.text === 'violet'));
});
test('normalizes case and punctuation and handles Unicode and empty input', () => {
  const report = analyzeCaptions([{ text: 'Café SUN!' }, { text: 'café sun' }]);
  assert.equal(report.distinct, 1);
  assert.equal(report.repeatedCaptions[0].count, 2);
  assert.deepEqual(analyzeCaptions([]).keywords, []);
});
test('collector deduplicates rescans, captures changing captions and clears on navigation and disabling', () => {
  let callback;
  const node = { textContent: 'first caption', closest: () => false, checkVisibility: () => true, querySelector: () => null };
  const win = { location: { href: 'https://example.com/a', hostname: 'example.com' }, MutationObserver: class { observe() {} disconnect() {} }, setInterval(fn) { callback = fn; }, clearInterval() {}, clearTimeout() {} };
  const doc = { defaultView: win, documentElement: {}, querySelectorAll: selector => selector === 'video,audio' ? [] : [node] };
  const collector = new CaptionCollector(doc);
  collector.configure({ captionSites: ['other.com'] });
  assert.equal(collector.snapshot().report.total, 0);
  collector.configure({ captionSites: ['example.com'] });
  callback(); callback();
  assert.equal(collector.snapshot().report.total, 1);
  node.textContent = 'second caption'; callback();
  assert.equal(collector.snapshot().report.total, 2);
  win.location.href = 'https://example.com/b'; callback();
  assert.equal(collector.snapshot().report.total, 1);
  collector.configure({ captionSites: [] });
  assert.equal(collector.snapshot().report.total, 0);
});
test('advanced analysis requires a key, limits the sample and rejects incomplete output', async () => {
  const options = { provider: 'openai', model: DEFAULT_PREFERENCES.model, apiKey: 'test', captions: Array.from({ length: 101 }, () => ({ text: 'caption' })) };
  let calls = 0;
  const fetcher = async (url, init) => {
    calls++;
    const body = JSON.parse(init.body);
    assert.equal(JSON.parse(body.input).length, 100);
    assert.equal(body.store, false);
    return { ok: true, json: async () => ({ status: 'completed', output: [{ content: [{ type: 'output_text', text: 'Theme: caption [1].' }] }] }) };
  };
  await assert.rejects(analyzeCaptionThemes({ ...options, apiKey: '' }, fetcher), /API key/);
  assert.equal(calls, 0);
  assert.equal((await analyzeCaptionThemes(options, fetcher)).sampleSize, 100);
  await assert.rejects(analyzeCaptionThemes(options, async () => ({ ok: true, json: async () => ({ status: 'incomplete' }) })), /incomplete/);
});
test('Anthropic analysis uses the selected provider and handles API failures', async () => {
  const options = { provider: 'anthropic', model: 'claude-haiku-4-5-20251001', apiKey: 'test-key', captions: [{ text: 'test caption' }] };
  const result = await analyzeCaptionThemes(options, async (url, init) => {
    assert.equal(url, 'https://api.anthropic.com/v1/messages');
    assert.equal(init.headers['x-api-key'], 'test-key');
    assert.deepEqual(JSON.parse(JSON.parse(init.body).messages[0].content), [{ id: 1, text: 'test caption' }]);
    return { ok: true, json: async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'Distinct caption [1].' }] }) };
  });
  assert.equal(result.sampleSize, 1);
  await assert.rejects(analyzeCaptionThemes(options, async () => ({ ok: false, status: 401 })), /401/);
});
test('subtitle cues are counted once per timed occurrence and collection is bounded', () => {
  const track = { kind: 'subtitles', cues: [{ startTime: 0, endTime: 1, text: 'hello there' }, { startTime: 2, endTime: 3, text: 'hello there' }] };
  const media = { currentSrc: 'clip.mp4', textTracks: [track] };
  const win = { location: { href: 'https://example.com', hostname: 'example.com' }, MutationObserver: class { observe() {} disconnect() {} }, setInterval() {}, clearInterval() {}, clearTimeout() {} };
  const doc = { defaultView: win, documentElement: {}, querySelectorAll: selector => selector === 'video,audio' ? [media] : [] };
  const collector = new CaptionCollector(doc);
  collector.configure({ captionSites: ['example.com'] });
  assert.equal(collector.snapshot().report.repeatedCaptions[0].count, 2);
  for (let i = 0; i < 1100; i++) collector.add('caption '.repeat(100), 'test');
  const result = collector.snapshot();
  assert.equal(result.captions.length, 1000);
  assert.equal(result.limited, true);
  assert.equal(result.captions[2].text.length, 500);
});

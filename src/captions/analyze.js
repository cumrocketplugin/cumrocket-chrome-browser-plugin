export const MAX_CAPTIONS = 1000;
export const MAX_LENGTH = 500;
const stop = new Set('a an the and or but to of in on at for from with by is are was were be been being it its this that these those i you he she we they my your our their as not so if then than have has had do does did'.split(' '));
export const words = text => text.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu) ?? [];
export const normalize = text => words(text).join(' ');
export function analyzeCaptions(captions) {
  const keywords = new Map(), phrases = new Map(), exact = new Map();
  for (const [index, caption] of captions.entries()) {
    const tokens = words(caption.text);
    const key = tokens.join(' ');
    if (!key) continue;
    const same = exact.get(key) ?? { text: caption.text, count: 0, examples: [] };
    same.count++; if (same.examples.length < 3) same.examples.push(index + 1); exact.set(key, same);
    for (let i = 0; i < tokens.length; i++) {
      if (!stop.has(tokens[i]) && tokens[i].length > 1) add(keywords, tokens[i], index);
      for (let length = 2; length <= 6 && i + length <= tokens.length; length++) {
        const slice = tokens.slice(i, i + length);
        if (stop.has(slice[0]) || stop.has(slice.at(-1))) continue;
        add(phrases, slice.join(' '), index);
      }
    }
  }
  function add(map, text, index) {
    const value = map.get(text) ?? { text, count: 0, captions: new Set() };
    value.count++; value.captions.add(index + 1); map.set(text, value);
  }
  const rank = map => [...map.values()].map(v => ({ text: v.text, count: v.count, captionCount: v.captions.size, examples: [...v.captions].slice(0, 3) })).sort((a, b) => b.count - a.count || b.text.length - a.text.length || a.text.localeCompare(b.text));
  const rankedPhrases = rank(phrases);
  // Suppress shorter fragments only when a longer fragment explains every occurrence.
  const repeated = rankedPhrases.filter(p => p.count > 1);
  const suppressed = new Set();
  for (const phrase of repeated) {
    const tokens = phrase.text.split(' ');
    for (let size = 2; size < tokens.length; size++) for (let start = 0; start + size <= tokens.length; start++) {
      suppressed.add(`${phrase.count}:${phrase.captionCount}:${tokens.slice(start, start + size).join(' ')}`);
    }
  }
  const fragments = repeated.filter(p => !suppressed.has(`${p.count}:${p.captionCount}:${p.text}`));
  return { total: captions.length, distinct: exact.size, keywords: rank(keywords).slice(0, 50),
    uniqueKeywords: rank(keywords).filter(p => p.count === 1).slice(0, 50),
    repeatedCaptions: [...exact.values()].filter(p => p.count > 1).sort((a, b) => b.count - a.count).slice(0, 50),
    repeatedFragments: fragments.slice(0, 50), uniquePhrases: rankedPhrases.filter(p => p.count === 1).slice(0, 50) };
}

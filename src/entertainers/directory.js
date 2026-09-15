import directory from './listings.json' with { type: 'json' };
export const CATEGORIES = directory.categories;
export function entertainerPreferences(value = {}) {
  return { enabled: value.enabled !== false, categories: CATEGORIES.map(c => c.id).filter(id => !Array.isArray(value.categories) || value.categories.includes(id)) };
}
export function validateEntertainerPreferences(value) {
  if (!value || typeof value.enabled !== 'boolean' || !Array.isArray(value.categories) || value.categories.some(id => !CATEGORIES.some(c => c.id === id))) throw Error('Choose valid entertainer categories.');
  return entertainerPreferences(value);
}
export function entertainerProfiles(preferences, url, now = Date.now(), data = directory) {
  const settings = entertainerPreferences(preferences);
  let host;
  try { const page = new URL(url); if (!['http:', 'https:'].includes(page.protocol)) return []; host = page.hostname; } catch { return []; }
  if (!settings.enabled || !data.supportedSites.some(site => host === site || host.endsWith(`.${site}`))) return [];
  return data.listings.filter(item => item.status === 'approved' && Date.parse(item.activeUntil) > now && item.categories.some(id => settings.categories.includes(id))).map(item => ({
    id: `entertainer:${item.id}`, enabled: true, positiveKeywords: [item.name, ...item.aliases], negativeKeywords: [], rules: { wholeWords: true }
  }));
}
export function nextEntertainerExpiry(now = Date.now(), data = directory) {
  return Math.min(Infinity, ...data.listings.filter(item => item.status === 'approved').map(item => Date.parse(item.activeUntil)).filter(time => time > now));
}

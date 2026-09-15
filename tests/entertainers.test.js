import test from 'node:test';
import assert from 'node:assert/strict';
import directory from '../src/entertainers/listings.json' with { type: 'json' };
import { entertainerProfiles, entertainerPreferences, nextEntertainerExpiry } from '../src/entertainers/directory.js';
import { validateDirectory } from '../src/entertainers/validate.js';
import { createStore, scanningState } from '../src/storage/store.js';
import { findMatches } from '../src/matching/matcher.js';
const now = Date.parse('2026-09-15T00:00:00.000Z');
const listing = { id: 'fixture-name', name: 'Fixture Name', aliases: ['FixtureAlias'], profiles: [{ site: 'Fixture', url: 'https://example.com/fixture' }], categories: ['performers', 'creators'], status: 'approved', activeUntil: '2026-10-15T00:00:00.000Z', payment: { transactionHash: 'test-transaction', holdingWallet: 'test-wallet' } };
const data = () => ({ ...structuredClone(directory), paymentPolicy: { status: 'configured', walletAddress: 'test-wallet', blockchain: 'test-chain', minimumCummiesHolding: '100', monthlyFee: '10', feeAsset: 'test-asset' }, listings: [structuredClone(listing)] });
test('bundled directory passes submission validation', () => { validateDirectory(directory); });
test('default/category toggles, approved expiry and hostname boundaries govern matching', () => {
  const get = (settings, url = 'https://www.pornhub.com/example', fixture = data(), time = now) => entertainerProfiles(settings, url, time, fixture);
  assert.equal(get().length, 1);
  assert.equal(get({ enabled: false }).length, 0);
  assert.equal(get({ categories: [] }).length, 0);
  assert.equal(get({ categories: ['creators'] }).length, 1);
  assert.equal(get({ categories: ['cam-models'] }).length, 0);
  for (const url of ['https://notpornhub.com', 'https://pornhub.com.evil.test', 'https://example.com', 'file:///pornhub.com', 'invalid']) assert.deepEqual(get(undefined, url), []);
  for (const status of ['pending', 'suspended']) { const fixture = data(); fixture.listings[0].status = status; assert.deepEqual(get(undefined, undefined, fixture), []); }
  assert.deepEqual(get(undefined, undefined, data(), Date.parse(listing.activeUntil)), []);
  assert.equal(nextEntertainerExpiry(now, data()), Date.parse(listing.activeUntil));
  assert.equal(nextEntertainerExpiry(Date.parse(listing.activeUntil), data()), Infinity);
  const text = 'fixture name FixtureAlias FixtureAliases';
  assert.deepEqual(findMatches(text, get()).map(hit => text.slice(hit.start, hit.end)), ['fixture name', 'FixtureAlias']);
});
test('validation rejects invalid submission and approval fields', () => {
  validateDirectory(data());
  for (const change of [d => d.listings.push(d.listings[0]), d => d.listings[0].categories = ['invented'], d => d.listings[0].profiles[0].url = 'javascript:alert(1)', d => d.listings[0].activeUntil = null, d => d.listings[0].activeUntil = '2026-02-30T00:00:00.000Z', d => d.paymentPolicy.status = 'not-configured', d => d.listings[0].payment.transactionHash = '']) {
    const fixture = data(); change(fixture); assert.throws(() => validateDirectory(fixture), /Entertainer directory/);
  }
});
test('existing installations default on; settings persist independently of personal profiles', async () => {
  let saved = { schemaVersion: 1, enabled: true, profiles: [], preferences: {} };
  const area = { async get() { return { 'cumrocket.state': structuredClone(saved) }; }, async set(value) { saved = structuredClone(value['cumrocket.state']); } };
  const store = createStore(area);
  assert.deepEqual((await store.read()).entertainers, entertainerPreferences());
  await store.saveEntertainers({ enabled: false, categories: ['creators'] });
  const restored = await createStore(area).read();
  assert.deepEqual(scanningState(restored).entertainers, { enabled: false, categories: ['creators'] });
  assert.deepEqual(restored.profiles, []);
  assert.throws(() => store.saveEntertainers({ enabled: true, categories: ['unknown'] }));
  await store.saveEntertainers({ enabled: true, categories: [] });
  assert.deepEqual((await store.read()).entertainers.categories, []);
});

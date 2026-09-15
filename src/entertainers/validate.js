export function validateDirectory(data) {
  const fail = message => { throw Error(`Entertainer directory: ${message}`); };
  const text = value => typeof value === 'string' && value.trim() === value && value.length > 0 && value.length <= 120;
  const unique = values => new Set(values).size === values.length;
  if (data.schemaVersion !== 1 || !Array.isArray(data.categories) || !data.categories.length || data.categories.some(c => !/^[a-z][a-z0-9-]*$/.test(c.id) || !text(c.label)) || !unique(data.categories.map(c => c.id))) fail('invalid categories.');
  if (!Array.isArray(data.supportedSites) || !data.supportedSites.length || data.supportedSites.some(site => typeof site !== 'string' || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(site))) fail('use plain lowercase supported hostnames.');
  const policy = data.paymentPolicy;
  if (!policy || !['not-configured', 'configured'].includes(policy.status)) fail('invalid payment policy.');
  if (policy.status === 'configured' && ['walletAddress', 'blockchain', 'minimumCummiesHolding', 'monthlyFee', 'feeAsset'].some(key => !text(policy[key]))) fail('complete the official payment policy before configuring payments.');
  if (!Array.isArray(data.listings)) fail('listings must be an array.');
  const ids = new Set();
  for (const item of data.listings) {
    if (!/^[a-z][a-z0-9-]{0,79}$/.test(item.id) || ids.has(item.id)) fail('each listing needs a unique lowercase id.');
    ids.add(item.id);
    if (!text(item.name) || !Array.isArray(item.aliases) || item.aliases.length > 20 || item.aliases.some(alias => !text(alias)) || !unique([item.name, ...item.aliases].map(name => name.toLowerCase()))) fail(`${item.id}: invalid name or aliases.`);
    if (!Array.isArray(item.categories) || !item.categories.length || !unique(item.categories) || item.categories.some(id => !data.categories.some(c => c.id === id))) fail(`${item.id}: choose predefined categories.`);
    if (!Array.isArray(item.profiles) || !item.profiles.length || item.profiles.some(profile => {
      try { const url = new URL(profile.url); return !text(profile.site) || url.protocol !== 'https:' || url.username || url.password; } catch { return true; }
    })) fail(`${item.id}: include labeled HTTPS profile URLs.`);
    if (!['pending', 'approved', 'suspended'].includes(item.status)) fail(`${item.id}: invalid status.`);
    if (item.activeUntil !== null && (typeof item.activeUntil !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/.test(item.activeUntil) || !Number.isFinite(Date.parse(item.activeUntil)) || new Date(item.activeUntil).toISOString() !== item.activeUntil)) fail(`${item.id}: activeUntil must be a UTC timestamp or null.`);
    if (!item.payment || typeof item.payment.transactionHash !== 'string' || item.payment.transactionHash.length > 256 || typeof item.payment.holdingWallet !== 'string' || item.payment.holdingWallet.length > 256) fail(`${item.id}: include payment reference fields.`);
    if (item.status === 'approved' && (policy.status !== 'configured' || !item.activeUntil || !item.payment.transactionHash.trim() || !item.payment.holdingWallet.trim())) fail(`${item.id}: approved listings need configured payments, verification references, and an expiry.`);
  }
  return data;
}

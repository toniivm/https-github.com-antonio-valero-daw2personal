// cache.js - Simple in-memory cache with TTL for SpotMap
// Usage: Cache.get(key), Cache.set(key, value, ttlMs)

const store = new Map();

export const Cache = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (entry.expires && entry.expires < Date.now()) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  },
  set(key, value, ttlMs = 60000) {
    store.set(key, { value, expires: ttlMs ? Date.now() + ttlMs : null });
  },
  remove(key) { store.delete(key); },
  clear() { store.clear(); }
};

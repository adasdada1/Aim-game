class TimedCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl) {
    if (this.cache.has(key)) {
      clearTimeout(this.cache.get(key).timeoutId);
    }
    const timeoutId = setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
    this.cache.set(key, { value, timeoutId });
  }

  get(key) {
    const cacheItem = this.cache.get(key);
    return cacheItem ? cacheItem.value : undefined;
  }

  delete(key) {
    if (this.cache.has(key)) {
      clearTimeout(this.cache.get(key).timeoutId);
      this.cache.delete(key);
    }
  }
}

export {TimedCache}
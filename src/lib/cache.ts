import NodeCache from 'node-cache';

// Create cache instance
// stdTTL: default time to live in seconds (5 minutes)
// checkperiod: period in seconds to check for expired keys (1 minute)
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false
});

// Cache statistics
let stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0
};

// Get value from cache
export const get = (key: string) => {
  try {
    const value = cache.get(key);
    if (value !== undefined) {
      stats.hits++;
      console.debug(`Cache HIT: ${key}`);
      return value;
    }
    stats.misses++;
    console.debug(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`Cache GET error for key ${key}:`, error);
    return null;
  }
};

// Set value in cache
export const set = (key: string, value: any, ttl?: number) => {
  try {
    const success = ttl ? cache.set(key, value, ttl) : cache.set(key, value);
    if (success) {
      stats.sets++;
      console.debug(`Cache SET: ${key} (TTL: ${ttl || 'default'})`);
    }
    return success;
  } catch (error) {
    console.error(`Cache SET error for key ${key}:`, error);
    return false;
  }
};

// Delete value from cache
export const del = (key: string) => {
  try {
    const count = cache.del(key);
    if (count > 0) {
      stats.deletes++;
      console.debug(`Cache DELETE: ${key}`);
    }
    return count;
  } catch (error) {
    console.error(`Cache DELETE error for key ${key}:`, error);
    return 0;
  }
};

// Clear all cache
export const flush = () => {
  try {
    cache.flushAll();
    console.info('Cache flushed');
    return true;
  } catch (error) {
    console.error('Cache FLUSH error:', error);
    return false;
  }
};

// Get cache statistics
export const getStats = () => {
  const cacheStats = cache.getStats();
  return {
    ...stats,
    keys: cacheStats.keys,
    hits_ratio: stats.hits / (stats.hits + stats.misses) || 0,
    memory: process.memoryUsage()
  };
};

// Clear cache by pattern
export const clearByPattern = (pattern: string) => {
  try {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    matchingKeys.forEach(key => del(key));
    console.info(`Cleared ${matchingKeys.length} cache entries matching pattern: ${pattern}`);
    return matchingKeys.length;
  } catch (error) {
    console.error('Cache CLEAR PATTERN error:', error);
    return 0;
  }
};

// Event listeners
cache.on('expired', (key, value) => {
  console.debug(`Cache key expired: ${key}`);
});

cache.on('flush', () => {
  console.info('Cache was flushed');
});
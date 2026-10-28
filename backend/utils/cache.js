// Simple in-memory cache with TTL
const cacheStore = new Map();

/**
 * Cache middleware creator.
 * @param {number} ttlSeconds - Time to live for cached response in seconds.
 * @returns {function} Express middleware.
 */
function cache(ttlSeconds) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = req.originalUrl;
    const now = Date.now();
    const cached = cacheStore.get(key);
    if (cached && cached.expiry > now) {
      return res.json(cached.data);
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cacheStore.set(key, { data: body, expiry: now + ttlSeconds * 1000 });
      return originalJson(body);
    };
    next();
  };
}

module.exports = cache;

/**
 * rateLimiter.js
 * Simple in-memory rate limiter (no Redis needed for dev/college project).
 * Limits per IP using a sliding window.
 *
 * Usage:
 *   const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');
 *   router.post('/login', authLimiter, handler);
 *   app.use('/api', apiLimiter);
 */

const requests = new Map(); // ip -> [timestamps]

/**
 * createLimiter(maxRequests, windowMs, message)
 * Returns middleware that allows maxRequests per windowMs milliseconds per IP.
 */
const createLimiter = (maxRequests, windowMs, message) => (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const key = `${ip}:${req.path}`;

  if (!requests.has(key)) requests.set(key, []);
  const timestamps = requests.get(key).filter((t) => now - t < windowMs);
  timestamps.push(now);
  requests.set(key, timestamps);

  if (timestamps.length > maxRequests) {
    return res.status(429).json({ error: message || 'Too many requests. Please slow down.' });
  }
  next();
};

/** Strict limiter for auth endpoints — 10 attempts per 15 minutes */
const authLimiter = createLimiter(10, 15 * 60 * 1000, 'Too many login attempts. Try again in 15 minutes.');

/** General API limiter — 200 requests per minute */
const apiLimiter = createLimiter(200, 60 * 1000, 'Too many requests. Please slow down.');

// Cleanup old entries every 10 minutes to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requests.entries()) {
    const fresh = timestamps.filter((t) => now - t < 15 * 60 * 1000);
    if (fresh.length === 0) requests.delete(key);
    else requests.set(key, fresh);
  }
}, 10 * 60 * 1000);

module.exports = { authLimiter, apiLimiter, createLimiter };

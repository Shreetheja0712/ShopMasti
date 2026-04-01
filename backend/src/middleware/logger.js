/**
 * logger.js
 * Simple request logger middleware.
 * Logs: method, URL, status code, response time.
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color =
      status >= 500 ? '\x1b[31m' :   // red
      status >= 400 ? '\x1b[33m' :   // yellow
      status >= 300 ? '\x1b[36m' :   // cyan
      '\x1b[32m';                     // green
    const reset = '\x1b[0m';
    console.log(`${color}[${new Date().toISOString()}] ${method} ${originalUrl} ${status} — ${ms}ms${reset}`);
  });

  next();
};

module.exports = logger;

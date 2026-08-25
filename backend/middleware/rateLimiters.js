const rateLimit = require("express-rate-limit");

const windowMs = (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000;
const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

// General API limiter
exports.apiLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

// Stricter limiter for login/register to slow down brute-force / credential
// stuffing attempts.
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts. Please try again in 15 minutes." },
});

const rateLimit = require('express-rate-limit');

// Rate limiter for detection uploads (e.g. 30 uploads per 10 minutes per IP/User)
const detectLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 45, // limit each IP to 45 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many issue report requests from this connection. Please wait a few minutes before trying again.'
  }
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down.'
  }
});

module.exports = {
  detectLimiter,
  apiLimiter
};

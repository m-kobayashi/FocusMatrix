// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // IP毎に5回まで
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 100, // IP毎に100回まで
});

module.exports = { authLimiter, apiLimiter };

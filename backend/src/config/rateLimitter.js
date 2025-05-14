const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS,
  max: process.env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    });
  },
});

module.exports = limiter;

const redis = require("./redis");

function rateLimiter(maxAttempts = 5, windowSeconds = 60) {
  return async (req, res, next) => {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "UserId required" });
    }

    const key = `rate:login:${userId}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > maxAttempts) {
      return res.status(429).json({
        message: "Too many attempts. Try again later."
      });
    }

    next();
  };
}

module.exports = { rateLimiter };
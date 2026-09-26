// Small in-memory rate limiter (per IP). Enough for a single server instance;
// use a shared store such as Redis if the backend ever runs on several servers.
const rateLimit = ({ windowMs, max, message }) => {
  const hits = new Map(); // ip -> { count, resetAt }

  // drop expired entries so the map can't grow forever
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(ip);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const entry = hits.get(ip);

    if (!entry || entry.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ message });
    }
    next();
  };
};

module.exports = rateLimit;

const ipKey = (req) => req.ip || req.socket.remoteAddress || "unknown";

// Small in-memory rate limiter (per IP by default, or per `key(req)`). Enough for
// a single server instance; use a shared store such as Redis if the backend ever
// runs on several servers.
const rateLimit = ({ windowMs, max, message, key = ipKey }) => {
  const hits = new Map(); // key -> { count, resetAt }

  // drop expired entries so the map can't grow forever
  setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(id);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const id = key(req);
    const entry = hits.get(id);

    if (!entry || entry.resetAt <= now) {
      hits.set(id, { count: 1, resetAt: now + windowMs });
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

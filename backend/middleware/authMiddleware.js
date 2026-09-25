const User = require("../models/User");
const jwt = require("jsonwebtoken");

const getUserFromHeader = async (header) => {
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.id).select("-password");
};

// middleware to protect routes
const protect = async (req, res, next) => {
  try {
    if (!req.headers.authorization?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not Authorized, No Token" });
    }

    const user = await getUserFromHeader(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token Failed", error: error.message });
  }
};

// attach req.user when a valid token is sent, but never block the request
const optionalAuth = async (req, res, next) => {
  try {
    req.user = await getUserFromHeader(req.headers.authorization);
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { protect, optionalAuth };

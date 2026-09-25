const User = require("../models/User");
const jwt = require("jsonwebtoken");

// compare emails without caring about upper/lower case
const CASE_INSENSITIVE = { locale: "en", strength: 2 };

// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc register new user
const register = async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    if (String(password).length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }
    if (!["jobseeker", "employer"].includes(role)) {
      return res.status(400).json({ message: "Please select a valid role" });
    }

    const userExists = await User.findOne({ email }).collation(CASE_INSENSITIVE);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token: generateToken(user._id),
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
      companyLogo: user.companyLogo || "",
      resume: user.resume || "",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc login user
const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim();
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email }).collation(CASE_INSENSITIVE);
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      avatar: user.avatar || "",
      companyName: user.companyName || "",
      companyDescription: user.companyDescription || "",
      companyLogo: user.companyLogo || "",
      resume: user.resume || "",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc register new user
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };

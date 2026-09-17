const User = require("../models/User");
const jwt = require("jsonwebtoken");

// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc register new user
const register = async (req, res) => {
  try {
    const { name, email, password, avatar, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role, avatar });
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
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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

// @desc get logged in user
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };

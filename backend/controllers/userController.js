const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// @desc update user profile (name , avatar, company details)
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      avatar,
      companyName,
      companyDescription,
      companyLogo,
      resume,
    } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.resume = resume || user.resume;

    // If employer allow to update company info
    if (user.role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
      user.companyLogo = companyLogo || user.companyLogo;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume || "",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc delete user resume (jobseeker only)
const deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    // extract file name from URL
    const filename = resumeUrl?.split("/")?.pop();

    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseeker can delete resume" });
    }

    // construct the full file path
    const filePath = path.join(__dirname, "../uploads", filename);

    // check if the file exist and delete then
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // set the user resume into empty string
    user.resume = "";
    await user.save();

    res.json({ message: "Resume deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc get user profile
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProfile, deleteResume, getPublicProfile };

const User = require("../models/User");
const Application = require("../models/Application");
const { UPLOAD_TYPES, UNSAVED_UPLOAD_TTL_MS } = require("../config/upload");
const {
  normalizeStoredPath,
  isOwnedBy,
  uploadedAt,
  deleteStoredFile,
} = require("../utils/fileStorage");

// profile fields that hold an uploaded file, and the upload type behind each
const FILE_FIELDS = Object.entries(UPLOAD_TYPES).map(([type, config]) => ({
  type,
  field: config.userField,
  role: config.role,
  label: config.label,
}));

// a resume that was sent with an application stays on disk for the employer
const isStillNeeded = async (type, storedPath) =>
  type === "resume" && Boolean(await Application.exists({ resume: storedPath }));

// delete a replaced/removed file, but only if this user uploaded it
const removeOldFile = async (type, storedPath, userId) => {
  if (!storedPath || !isOwnedBy(storedPath, type, userId)) return;
  if (await isStillNeeded(type, storedPath)) return;
  await deleteStoredFile(storedPath);
};

const toProfileResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  role: user.role,
  companyName: user.companyName || "",
  companyDescription: user.companyDescription || "",
  companyLogo: user.companyLogo || "",
  resume: user.resume || "",
});

// @desc update user profile (name , avatar, company details)
const updateProfile = async (req, res) => {
  try {
    const { name, companyName, companyDescription } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name?.trim() || user.name;

    // If employer allow to update company info
    if (user.role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
    }

    // file fields only accept files this user uploaded through /api/files/upload
    const replacedFiles = [];
    for (const { type, field, role, label } of FILE_FIELDS) {
      if (role && user.role !== role) continue;

      const incoming = normalizeStoredPath(req.body[field]);
      const current = normalizeStoredPath(user[field]);
      if (!incoming || incoming === current) continue;

      if (!isOwnedBy(incoming, type, user._id)) {
        return res.status(400).json({ message: `Invalid ${label} file` });
      }
      // unsaved uploads this old are deleted by the cleanup job
      if (Date.now() - (uploadedAt(incoming) || 0) > UNSAVED_UPLOAD_TTL_MS) {
        return res.status(400).json({
          message: `This ${label} upload has expired, please upload it again`,
        });
      }

      replacedFiles.push({ type, path: current });
      user[field] = incoming;
    }

    await user.save();

    // clean up the files that were just replaced
    await Promise.all(
      replacedFiles.map(({ type, path }) => removeOldFile(type, path, user._id))
    );

    res.json(toProfileResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc delete user resume (jobseeker only)
const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseeker can delete resume" });
    }

    const oldResume = normalizeStoredPath(user.resume);
    user.resume = "";
    await user.save();

    await removeOldFile("resume", oldResume, user._id);

    res.json({ message: "Resume deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc get user profile
const getPublicProfile = async (req, res) => {
  try {
    // public view: never expose email, resume or other private fields
    const user = await User.findById(req.params.id).select(
      "name avatar role companyName companyDescription companyLogo"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProfile, deleteResume, getPublicProfile };

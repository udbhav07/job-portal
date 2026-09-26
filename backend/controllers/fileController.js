const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { UPLOAD_TYPES } = require("../config/upload");
const {
  toStoredPath,
  resolveStoredPath,
  isOwnedBy,
} = require("../utils/fileStorage");
const fs = require("fs");

// @desc upload an avatar, company logo or resume
// @route POST /api/files/upload?type=avatar|logo|resume
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // only the path is returned and stored; the frontend adds the API host
  res.status(201).json({
    path: toStoredPath(req.uploadType, req.file.filename),
    type: req.uploadType,
  });
};

// the owner, or an employer the resume was sent to through an application
const canAccessResume = async (user, storedPath) => {
  if (isOwnedBy(storedPath, "resume", user._id)) return true;
  if (user.resume === storedPath) return true;

  if (user.role !== "employer") return false;

  const owner = await User.findOne({ resume: storedPath }).select("_id");
  const jobIds = await Job.find({ company: user._id }).distinct("_id");
  if (!jobIds.length) return false;

  const application = await Application.exists({
    job: { $in: jobIds },
    $or: [
      { resume: storedPath },
      ...(owner ? [{ applicant: owner._id }] : []),
    ],
  });
  return Boolean(application);
};

// @desc view a resume (protected)
// @route GET /uploads/resumes/:filename
const getResume = async (req, res) => {
  try {
    const storedPath = `/uploads/${UPLOAD_TYPES.resume.folder}/${req.params.filename}`;
    const filePath = resolveStoredPath(storedPath);
    if (!filePath) return res.status(400).json({ message: "Invalid file name" });

    if (!(await canAccessResume(req.user, storedPath))) {
      return res
        .status(403)
        .json({ message: "You are not allowed to view this resume" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // sendFile sets the Content-Type from the extension (.pdf, or an old image)
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "private, no-store");
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadFile, getResume, canAccessResume };

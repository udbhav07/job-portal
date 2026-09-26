const { pipeline } = require("stream/promises");
const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { UPLOAD_TYPES, EXTENSIONS } = require("../config/upload");
const {
  toStoredPath,
  parseStoredPath,
  isOwnedBy,
  saveFile,
  getSignedFileUrl,
  getFileStream,
} = require("../utils/fileStorage");

// how long a link to a public image (avatar/logo) stays valid, in seconds
const PUBLIC_LINK_SECONDS = 60 * 60;

// @desc upload an avatar, company logo or resume to B2
// @route POST /api/files/upload?type=avatar|logo|resume
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // <type>-<userId>-<timestamp>.<ext>, e.g. avatar-66ab...-1790399612619.png
    const filename = `${req.uploadType}-${req.user._id}-${Date.now()}${
      EXTENSIONS[req.file.mimetype]
    }`;
    const storedPath = toStoredPath(req.uploadType, filename);

    await saveFile(storedPath, req.file.buffer, req.file.mimetype);

    // only the path is returned and stored; the frontend adds the API host
    res.status(201).json({ path: storedPath, type: req.uploadType });
  } catch (error) {
    next(error);
  }
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

// @desc show a public image (avatar/logo) by redirecting to a temporary B2 link
// @route GET /uploads/:folder/:filename
const getPublicFile = async (req, res, next) => {
  try {
    const storedPath = `/uploads/${req.params.folder}/${req.params.filename}`;
    const parsed = parseStoredPath(storedPath);
    if (!parsed || !UPLOAD_TYPES[parsed.type].isPublic) {
      return res.status(404).json({ message: "File not found" });
    }

    const url = await getSignedFileUrl(storedPath, PUBLIC_LINK_SECONDS);

    // the browser may reuse this redirect, but only while the link is still valid
    res.set("Cache-Control", `public, max-age=${PUBLIC_LINK_SECONDS - 300}`);
    res.redirect(302, url);
  } catch (error) {
    next(error);
  }
};

// @desc view a resume (protected), streamed from B2 through the backend
// @route GET /uploads/resumes/:filename
const getResume = async (req, res, next) => {
  try {
    const storedPath = `/uploads/${UPLOAD_TYPES.resume.folder}/${req.params.filename}`;
    if (!parseStoredPath(storedPath)) {
      return res.status(400).json({ message: "Invalid file name" });
    }

    if (!(await canAccessResume(req.user, storedPath))) {
      return res
        .status(403)
        .json({ message: "You are not allowed to view this resume" });
    }

    const file = await getFileStream(storedPath);
    if (!file) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.setHeader("Content-Type", file.contentType || "application/pdf");
    if (file.contentLength) res.setHeader("Content-Length", file.contentLength);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "private, no-store");

    // pipeline closes both sides and reports errors instead of crashing the process
    try {
      await pipeline(file.body, res);
    } catch (error) {
      // the viewer closed the tab before the download finished
      if (error.code === "ERR_STREAM_PREMATURE_CLOSE") return;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadFile, getPublicFile, getResume, canAccessResume };

const fs = require("fs");
const multer = require("multer");
const path = require("path");
const {
  UPLOAD_DIR,
  UPLOAD_TYPES,
  EXTENSIONS,
  MAX_FILE_SIZE,
} = require("../config/upload");
const { matchesSignature } = require("../utils/fileSignature");
const { ensureUploadFolders } = require("../utils/fileStorage");

ensureUploadFolders();

const allowedFormats = (config) =>
  config.mimeTypes.includes("application/pdf") ? "PDF" : "PNG or JPEG";

// reads ?type=avatar|logo|resume before multer runs, so storage knows where to put it
const checkUploadType = (req, res, next) => {
  const config = UPLOAD_TYPES[req.query.type];
  if (!config) {
    return res
      .status(400)
      .json({ message: "Upload type must be avatar, logo or resume" });
  }
  if (config.role && req.user.role !== config.role) {
    return res
      .status(403)
      .json({ message: `Only ${config.role}s can upload a ${config.label}` });
  }
  req.uploadType = req.query.type;
  next();
};

// uploads/<folder>/<type>-<userId>-<timestamp>.<ext>
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOAD_DIR, UPLOAD_TYPES[req.uploadType].folder));
  },
  filename: (req, file, cb) => {
    const ext = EXTENSIONS[file.mimetype];
    cb(null, `${req.uploadType}-${req.user._id}-${Date.now()}${ext}`);
  },
});

// first check: the type the browser reports
const fileFilter = (req, file, cb) => {
  const config = UPLOAD_TYPES[req.uploadType];
  if (config.mimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Only ${allowedFormats(config)} files are allowed for a ${config.label}`),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// second check: the file's real content must match the claimed type
const verifyFileSignature = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const valid = await matchesSignature(req.file.path, req.file.mimetype);
    if (valid) return next();

    await fs.promises.unlink(req.file.path).catch(() => {});
    const config = UPLOAD_TYPES[req.uploadType];
    return res.status(400).json({
      message: `This file is not a valid ${allowedFormats(config)} ${config.label}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  checkUploadType,
  verifyFileSignature,
};

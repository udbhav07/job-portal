const multer = require("multer");
const { UPLOAD_TYPES, MAX_FILE_SIZE } = require("../config/upload");
const { bufferMatchesSignature } = require("../utils/fileSignature");

const allowedFormats = (config) =>
  config.mimeTypes.includes("application/pdf") ? "PDF" : "PNG or JPEG";

// reads ?type=avatar|logo|resume before multer runs
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

// keep the upload in memory: it is checked first, then sent to B2
const storage = multer.memoryStorage();

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
const verifyFileSignature = (req, res, next) => {
  if (!req.file) return next();

  if (bufferMatchesSignature(req.file.buffer, req.file.mimetype)) return next();

  const config = UPLOAD_TYPES[req.uploadType];
  return res.status(400).json({
    message: `This file is not a valid ${allowedFormats(config)} ${config.label}`,
  });
};

module.exports = {
  upload,
  checkUploadType,
  verifyFileSignature,
};

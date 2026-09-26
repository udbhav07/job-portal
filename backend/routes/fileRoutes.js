const express = require("express");
const { uploadFile } = require("../controllers/fileController");
const { protect } = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");
const {
  upload,
  checkUploadType,
  verifyFileSignature,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// per account, so one user can't flood the bucket with files
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: "Too many uploads, please try again in a few minutes",
  key: (req) => String(req.user._id),
});

// POST /api/files/upload?type=avatar|logo|resume  (form field: "file")
router.post(
  "/upload",
  protect,
  uploadLimiter,
  checkUploadType,
  upload.single("file"),
  verifyFileSignature,
  uploadFile
);

module.exports = router;

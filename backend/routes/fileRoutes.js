const express = require("express");
const { uploadFile } = require("../controllers/fileController");
const { protect } = require("../middleware/authMiddleware");
const {
  upload,
  checkUploadType,
  verifyFileSignature,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// POST /api/files/upload?type=avatar|logo|resume  (form field: "file")
router.post(
  "/upload",
  protect,
  checkUploadType,
  upload.single("file"),
  verifyFileSignature,
  uploadFile
);

module.exports = router;

const express = require("express");
const path = require("path");
const { getResume } = require("../controllers/fileController");
const { protect } = require("../middleware/authMiddleware");
const { UPLOAD_DIR, UPLOAD_TYPES } = require("../config/upload");

// serves everything under /uploads
const router = express.Router();

// resumes are private: login + permission check on every request
router.get(`/${UPLOAD_TYPES.resume.folder}/:filename`, protect, getResume);

// avatars and logos are public images
for (const config of Object.values(UPLOAD_TYPES)) {
  if (!config.isPublic) continue;
  router.use(
    `/${config.folder}`,
    express.static(path.join(UPLOAD_DIR, config.folder), {
      maxAge: "7d",
      fallthrough: false,
    })
  );
}

module.exports = router;

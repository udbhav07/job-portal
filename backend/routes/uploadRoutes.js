const express = require("express");
const { getResume, getPublicFile } = require("../controllers/fileController");
const { protect } = require("../middleware/authMiddleware");
const { UPLOAD_TYPES } = require("../config/upload");

// serves everything under /uploads (the files themselves live in B2)
const router = express.Router();

// resumes are private: login + permission check on every request
router.get(`/${UPLOAD_TYPES.resume.folder}/:filename`, protect, getResume);

// avatars and logos: redirect to a temporary link
router.get("/:folder/:filename", getPublicFile);

module.exports = router;

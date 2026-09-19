const express = require("express");

const {
  updateProfile,
  deleteResume,
  getPublicProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.post("/resume", protect, deleteResume);

router.get("/:id", getPublicProfile);

module.exports = router;

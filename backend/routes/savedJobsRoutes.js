const express = require("express");
const {
  saveJob,
  unSaveJob,
  getMySaveJob,
} = require("../controllers/savedJobsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:jobId", protect, saveJob);
router.delete("/:jobId", protect, unSaveJob);
router.get("/my", protect, getMySaveJob);

module.exports = router;

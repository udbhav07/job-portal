const express = require("express");
const validateId = require("../middleware/validateId");
const {
  saveJob,
  unSaveJob,
  getMySaveJob,
} = require("../controllers/savedJobsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.param("jobId", validateId);

router.post("/:jobId", protect, saveJob);
router.delete("/:jobId", protect, unSaveJob);
router.get("/my", protect, getMySaveJob);

module.exports = router;

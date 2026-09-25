const express = require("express");
const validateId = require("../middleware/validateId");
const {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  getApplicationById,
  updateStatus,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.param("id", validateId);
router.param("jobId", validateId);

router.post("/:jobId", protect, applyToJob);
router.get("/my", protect, getMyApplications);
router.get("/job/:jobId", protect, getApplicantsForJob);
router.get("/:id", protect, getApplicationById);
router.put("/:id/status", protect, updateStatus);

module.exports = router;

const express = require("express");
const validateId = require("../middleware/validateId");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleCLoseJob,
  getJobsEmployer,
} = require("../controllers/jobController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();
router.param("id", validateId);

router.route("/").post(protect, createJob).get(optionalAuth, getJobs);
router.route("/get-jobs-employer").get(protect, getJobsEmployer);
router
  .route("/:id")
  .get(optionalAuth, getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);
router.put("/:id/toggle-close", protect, toggleCLoseJob);

module.exports = router;

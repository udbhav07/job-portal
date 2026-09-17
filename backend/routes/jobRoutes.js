const express = require("express");
const {
  createJob,
  getJobs,
  getJobById,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createJob).get(getJobs);
router.route("/:id").get(getJobById);

module.exports = router;

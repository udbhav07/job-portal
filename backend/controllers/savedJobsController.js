const SavedJob = require("../models/SavedJob");

// @desc save a job
const saveJob = async (req, res) => {
  try {
    const exists = await SavedJob.findOne({
      job: req.params.jobId,
      jobseeker: req.user._id,
    });
    if (exists) return res.status(400).json({ message: "Job already saved" });

    const saved = await SavedJob.create({
      job: req.params.jobId,
      jobseeker: req.user._id,
    });

    res.status(201).json(saved);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save job", error: error.message });
  }
};

// @desc unsave a job
const unSaveJob = async (req, res) => {
  try {
    await SavedJob.findOneAndDelete({
      job: req.params.jobId,
      jobseeker: req.user._id,
    });
    res.json({ message: "Job removed form saved list" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove saved job", error: error.message });
  }
};

// @desc get saved jobs for current user
const getMySaveJob = async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ jobseeker: req.user._id }).populate(
      {
        path: "job",
        populate: {
          path: "company",
          select: "name companyName companyLogo",
        },
      }
    );
    res.json(savedJobs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch saved jobs", error: error.message });
  }
};

module.exports = {
  saveJob,
  unSaveJob,
  getMySaveJob,
};

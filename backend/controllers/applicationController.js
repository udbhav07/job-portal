const Application = require("../models/Application");
const Job = require("../models/Job");

const STATUSES = ["Applied", "In Review", "Rejected", "Accepted"];

// @desc apply to a job
const applyToJob = async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only jobseekers can apply" });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.isClosed) {
      return res
        .status(400)
        .json({ message: "This job is no longer accepting applications" });
    }

    const existing = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      resume: req.user.resume, // assuming resume is stored in user's profile
    });

    res.status(201).json(application);
  } catch (error) {
    // unique index: a second, simultaneous apply for the same job
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already applied to this job" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc get logged-in user application
const getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate("job", "title company location type")
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc get all applicants for a job (employer)
const getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job || job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not Authorized to view applicants" });
    }

    const applications = await Application.find({
      job: req.params.jobId,
    })
      .populate("job", "title location category type")
      .populate("applicant", "name email avatar resume");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc get application by ID (jobseeker or employer)
const getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("job", "title company")
      .populate("applicant", "name email avatar resume");

    if (!app)
      return res
        .status(404)
        .json({ message: "Application not found", id: req.params.id });

    const userId = req.user._id.toString();
    const isOwner =
      app.applicant?._id.toString() === userId ||
      app.job?.company?.toString() === userId;

    if (!isOwner)
      return res
        .status(403)
        .json({ message: "Not Authorized to view this application" });

    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc update application status (Employer)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }
    const app = await Application.findById(req.params.id).populate("job");
    if (!app || app.job?.company?.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ message: "Not Authorized to update this application" });

    app.status = status;
    await app.save();

    res.json({ message: "Application status updated", status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  getApplicationById,
  updateStatus,
};

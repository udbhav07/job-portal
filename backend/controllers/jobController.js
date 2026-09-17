const Job = require("../models/Job");

// @desc create a new job (employer only)
const createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employer can post jobs" });
    }

    const job = await Job.create({ ...req.body, company: req.user._id });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc get all jobs
const getJobs = async (req, res) => {
  const { keyword, location, category, type, minSalary, maxSalary } =
    req.query;

  const query = {
    isClosed: false,
    ...(keyword && { title: { $regex: keyword, $options: "i" } }),
    ...(location && { location: { $regex: location, $options: "i" } }),
    ...(category && { category }),
    ...(type && { type }),
  };

  if (minSalary || maxSalary) {
    query.$and = [];
  }

  if (minSalary) {
    query.$and.push({ salaryMax: { $gte: Number(minSalary) } });
  }
  if (maxSalary) {
    query.$and.push({ salaryMin: { $lte: Number(maxSalary) } });
  }

  try {
    const jobs = await Job.find(query).populate(
      "company",
      "name companyName companyLogo"
    );
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc get single job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "company",
      "name companyName companyLogo"
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
};

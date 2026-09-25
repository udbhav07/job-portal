const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");

// escape user input so it is matched literally inside a RegExp
const escapeRegex = (text) =>
  String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// only these fields can be set by an employer; company/isClosed are server-controlled
const JOB_FIELDS = [
  "title",
  "description",
  "requirements",
  "location",
  "category",
  "type",
  "salaryMin",
  "salaryMax",
];

const pickJobFields = (body = {}) => {
  const data = {};
  for (const field of JOB_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  for (const field of ["salaryMin", "salaryMax"]) {
    if (data[field] === "" || data[field] === null) data[field] = undefined;
    else if (data[field] !== undefined) data[field] = Number(data[field]);
  }
  return data;
};

const validateSalary = ({ salaryMin, salaryMax }) => {
  if (
    (salaryMin !== undefined && (Number.isNaN(salaryMin) || salaryMin < 0)) ||
    (salaryMax !== undefined && (Number.isNaN(salaryMax) || salaryMax < 0))
  ) {
    return "Salary must be a positive number";
  }
  if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
    return "Maximum salary must be greater than minimum salary";
  }
  return null;
};

const sendError = (res, error) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }
  res.status(500).json({ message: error.message });
};

// @desc create a new job (employer only)
const createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employer can post jobs" });
    }

    const data = pickJobFields(req.body);
    const salaryError = validateSalary(data);
    if (salaryError) return res.status(400).json({ message: salaryError });

    const job = await Job.create({ ...data, company: req.user._id });
    res.status(201).json(job);
  } catch (error) {
    sendError(res, error);
  }
};

// @desc get all jobs
const getJobs = async (req, res) => {
  try {
    const { keyword, location, category, type, minSalary, maxSalary } =
      req.query;
    const userId = req.user?._id;

    const query = {
      isClosed: false,
      ...(location && {
        location: { $regex: escapeRegex(location), $options: "i" },
      }),
      ...(category && { category: String(category) }),
      ...(type && { type: String(type) }),
    };

    // keyword matches the title, description, category or company name
    if (keyword) {
      const pattern = { $regex: escapeRegex(keyword), $options: "i" };
      const companies = await User.find({
        role: "employer",
        $or: [{ companyName: pattern }, { name: pattern }],
      }).select("_id");

      query.$or = [
        { title: pattern },
        { description: pattern },
        { category: pattern },
        { company: { $in: companies.map((c) => c._id) } },
      ];
    }

    const min = Number(minSalary);
    const max = Number(maxSalary);
    const salaryFilters = [];
    if (minSalary && !Number.isNaN(min)) {
      salaryFilters.push({ salaryMax: { $gte: min } });
    }
    if (maxSalary && !Number.isNaN(max)) {
      salaryFilters.push({ salaryMin: { $lte: max } });
    }
    if (salaryFilters.length) query.$and = salaryFilters;

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate("company", "name companyName companyLogo");

    let savedJobIds = [];
    let appliedJobStatusMap = {};

    if (userId) {
      // saved jobs
      const savedJobs = await SavedJob.find({ jobseeker: userId }).select(
        "job"
      );
      savedJobIds = savedJobs.map((s) => String(s.job));

      // Applications
      const applications = await Application.find({ applicant: userId }).select(
        "job status"
      );
      applications.forEach((app) => {
        appliedJobStatusMap[String(app.job)] = app.status;
      });
    }

    // add isSaved and applicationStatus to each job
    const jobWithExtras = jobs.map((job) => {
      const jobIdStr = String(job._id);
      return {
        ...job.toObject(),
        isSaved: savedJobIds.includes(jobIdStr),
        applicationStatus: appliedJobStatusMap[jobIdStr] || null,
      };
    });
    res.json(jobWithExtras);
  } catch (error) {
    sendError(res, error);
  }
};
// @desc get jobs for logged In user (employer can see posted jobs)
const getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;

    if (role !== "employer") {
      return res.status(403).json({ message: "Access Denied" });
    }

    // get all posted jobs by employer
    const jobs = await Job.find({ company: userId })
      .populate("company", "name companyName companyLogo")
      .lean(); // lean() makes jobs plain js objects so we can add new fields

    // count applications for all jobs in one query
    const counts = await Application.aggregate([
      { $match: { job: { $in: jobs.map((job) => job._id) } } },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);
    const countByJob = Object.fromEntries(
      counts.map((c) => [String(c._id), c.count])
    );

    const jobWithApplicationCounts = jobs.map((job) => ({
      ...job,
      applicationCount: countByJob[String(job._id)] || 0,
    }));

    res.json(jobWithApplicationCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc get single job by ID
const getJobById = async (req, res) => {
  try {
    const userId = req.user?._id;

    const job = await Job.findById(req.params.id).populate(
      "company",
      "name companyName companyLogo"
    );

    if (!job) return res.status(404).json({ message: "Job not found" });

    let applicationStatus = null;

    if (userId) {
      const application = await Application.findOne({
        job: job._id,
        applicant: userId,
      }).select("status");

      if (application) {
        applicationStatus = application.status;
      }
    }

    res.json({
      ...job.toObject(),
      applicationStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc update job (employer only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    const data = pickJobFields(req.body);
    Object.assign(job, data);
    const salaryError = validateSalary({
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
    });
    if (salaryError) return res.status(400).json({ message: salaryError });

    const updated = await job.save();
    res.json(updated);
  } catch (error) {
    sendError(res, error);
  }
};
// @desc delete a job (employer only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    await Promise.all([
      Application.deleteMany({ job: job._id }),
      SavedJob.deleteMany({ job: job._id }),
      job.deleteOne(),
    ]);
    res.json({ message: "Job deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc toggle close status for a job (employer only)
const toggleCLoseJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to close this job" });
    }

    job.isClosed = !job.isClosed;
    await job.save();

    res.json({
      message: job.isClosed ? "Job marked as closed" : "Job reopened",
      isClosed: job.isClosed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleCLoseJob,
  getJobsEmployer,
};

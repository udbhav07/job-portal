require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const multer = require("multer");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobsRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobsRoutes = require("./routes/savedJobsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const fileRoutes = require("./routes/fileRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// middleware to handle cors
app.use(
  cors({
    // comma-separated list of allowed frontends, e.g. "https://myapp.com";
    // any origin is allowed when CLIENT_URL is not set (local development)
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
      : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// connect database
connectDB();

//Middleware
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/save-jobs", savedJobsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/files", fileRoutes);

// uploaded files: public avatars/logos, protected resumes
app.use("/uploads", uploadRoutes);

// return upload and other unhandled errors as JSON
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.startsWith("Only ")) {
    return res.status(400).json({ message: err.message });
  }
  const status = err.status || err.statusCode;
  if (status && status < 500) {
    return res.status(status).json({ message: err.message || "Request failed" });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));

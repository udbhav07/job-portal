const path = require("path");

// root folder for every uploaded file, resolved from the backend folder
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// URL prefix the files are served under, and stored with in the database
const UPLOAD_URL_PREFIX = "/uploads";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const IMAGE_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const PDF_MIME_TYPES = ["application/pdf"];

// each kind of upload has its own folder, file types, allowed role and visibility
const UPLOAD_TYPES = {
  avatar: {
    folder: "avatars",
    mimeTypes: IMAGE_MIME_TYPES,
    label: "profile picture",
    userField: "avatar",
    isPublic: true,
  },
  logo: {
    folder: "logos",
    mimeTypes: IMAGE_MIME_TYPES,
    label: "company logo",
    userField: "companyLogo",
    role: "employer",
    isPublic: true,
  },
  resume: {
    folder: "resumes",
    mimeTypes: PDF_MIME_TYPES,
    label: "resume",
    userField: "resume",
    role: "jobseeker",
    isPublic: false,
  },
};

const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
};

module.exports = {
  UPLOAD_DIR,
  UPLOAD_URL_PREFIX,
  MAX_FILE_SIZE,
  UPLOAD_TYPES,
  EXTENSIONS,
};

const User = require("../models/User");
const Application = require("../models/Application");
const { UPLOAD_TYPES, UNSAVED_UPLOAD_TTL_MS } = require("../config/upload");
const {
  normalizeStoredPath,
  listStoredFiles,
  deleteStoredFile,
} = require("./fileStorage");

// extra wait on top of the TTL, so a file can never be deleted while
// updateProfile is still allowed to attach it
const SAFETY_MARGIN_MS = 60 * 60 * 1000; // 1 hour
const RUN_EVERY_MS = 6 * 60 * 60 * 1000; // 6 hours
const FIRST_RUN_AFTER_MS = 60 * 1000; // 1 minute after start

const USER_FILE_FIELDS = Object.values(UPLOAD_TYPES).map((c) => c.userField);

// every file a profile or an application still links to
const getReferencedPaths = async () => {
  const referenced = new Set();

  const users = await User.find({
    $or: USER_FILE_FIELDS.map((field) => ({ [field]: { $nin: [null, ""] } })),
  })
    .select(USER_FILE_FIELDS.join(" "))
    .lean();
  for (const user of users) {
    for (const field of USER_FILE_FIELDS) {
      if (user[field]) referenced.add(normalizeStoredPath(user[field]));
    }
  }

  const resumes = await Application.distinct("resume", {
    resume: { $nin: [null, ""] },
  });
  for (const resume of resumes) referenced.add(normalizeStoredPath(resume));

  return referenced;
};

// delete uploads that were never saved to a profile (picked, then cancelled),
// and old files nothing links to any more
const cleanupUploads = async () => {
  // list the bucket BEFORE reading the links: a file saved in between is too
  // new to be deleted anyway, because only files older than the TTL go
  const files = await listStoredFiles();
  const referenced = await getReferencedPaths();
  const cutoff = Date.now() - UNSAVED_UPLOAD_TTL_MS - SAFETY_MARGIN_MS;

  const unused = files.filter(
    ({ storedPath, lastModified }) =>
      !referenced.has(storedPath) &&
      lastModified &&
      lastModified.getTime() < cutoff
  );

  let deleted = 0;
  for (const { storedPath } of unused) {
    try {
      await deleteStoredFile(storedPath);
      deleted += 1;
    } catch (error) {
      console.error(`Upload cleanup: could not delete ${storedPath}`, error);
    }
  }
  if (deleted) console.log(`Upload cleanup: deleted ${deleted} unused file(s)`);
  return deleted;
};

const runSafely = () =>
  cleanupUploads().catch((error) =>
    console.error("Upload cleanup failed", error)
  );

// run shortly after start, then every few hours; never keeps the process alive
const scheduleUploadCleanup = () => {
  setTimeout(runSafely, FIRST_RUN_AFTER_MS).unref();
  setInterval(runSafely, RUN_EVERY_MS).unref();
};

module.exports = { cleanupUploads, scheduleUploadCleanup };

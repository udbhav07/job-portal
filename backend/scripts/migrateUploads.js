/*
 * One-time migration for uploaded files.
 *
 *  1. Converts stored links from "http://host/uploads/..." to "/uploads/...".
 *  2. Moves old files from the top of uploads/ into avatars/, logos/ or resumes/
 *     and renames them to "<type>-<userId>-<timestamp>.<ext>", based on which
 *     user profile links to them.
 *  3. Updates Application.resume to the new paths.
 *  4. Lists files that nothing links to (optionally deletes them).
 *
 * Usage (from the backend folder):
 *   npm run migrate:uploads                     # dry run, changes nothing
 *   npm run migrate:uploads -- --apply          # apply the changes
 *   npm run migrate:uploads -- --apply --delete-orphans
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/User");
const Application = require("../models/Application");
const { UPLOAD_DIR, UPLOAD_TYPES, EXTENSIONS } = require("../config/upload");
const {
  toStoredPath,
  normalizeStoredPath,
  parseStoredPath,
  ensureUploadFolders,
} = require("../utils/fileStorage");
const { detectMimeType } = require("../utils/fileSignature");

const APPLY = process.argv.includes("--apply");
const DELETE_ORPHANS = process.argv.includes("--delete-orphans");

const FILE_FIELDS = Object.entries(UPLOAD_TYPES).map(([type, config]) => ({
  type,
  field: config.userField,
}));

const log = (...args) => console.log(...args);
const summary = { linksUpdated: 0, filesMoved: 0, missing: 0, orphans: 0, deleted: 0 };

// "1760988609293-name.jpg" -> 1760988609293, otherwise the file's modified time
const timestampFor = (filename, filePath) => {
  const match = filename.match(/^(\d{13})-/);
  return match ? Number(match[1]) : Math.floor(fs.statSync(filePath).mtimeMs);
};

// the root-level file a legacy link points to, if it exists
const legacyFilePath = (storedPath) => {
  const match = storedPath.match(/^\/uploads\/([^/\\]+)$/);
  if (!match) return null;
  const filePath = path.join(UPLOAD_DIR, path.basename(match[1]));
  return fs.existsSync(filePath) ? filePath : null;
};

const moved = new Map(); // old stored path -> new stored path

const migrateLegacyFile = async (storedPath, type, userId) => {
  if (moved.has(storedPath)) return moved.get(storedPath);

  const source = legacyFilePath(storedPath);
  if (!source) return null;

  const filename = path.basename(source);
  const mimeType = await detectMimeType(source);
  if (!mimeType) {
    log(`  ! ${filename}: content is not a PNG, JPEG or PDF, left in place`);
    return null;
  }

  const newName = `${type}-${userId}-${timestampFor(filename, source)}${EXTENSIONS[mimeType]}`;
  const newPath = toStoredPath(type, newName);
  const target = path.join(UPLOAD_DIR, UPLOAD_TYPES[type].folder, newName);

  log(`  move ${filename} -> ${UPLOAD_TYPES[type].folder}/${newName}`);
  if (APPLY) fs.renameSync(source, target);

  summary.filesMoved += 1;
  moved.set(storedPath, newPath);
  return newPath;
};

const migrateUsers = async () => {
  const users = await User.find({
    $or: FILE_FIELDS.map(({ field }) => ({ [field]: { $nin: [null, ""] } })),
  });
  log(`\nUsers with files: ${users.length}`);

  for (const user of users) {
    let changed = false;

    for (const { type, field } of FILE_FIELDS) {
      const original = user[field];
      if (!original) continue;

      let next = normalizeStoredPath(original);

      if (!parseStoredPath(next)) {
        // an old file at the top of uploads/: move it into its folder
        const migrated = await migrateLegacyFile(next, type, user._id);
        if (migrated) {
          next = migrated;
        } else if (!legacyFilePath(next)) {
          log(`  ! ${user.email} ${field}: file not found (${original}), link cleared`);
          summary.missing += 1;
          next = "";
        }
      }

      if (next !== original) {
        log(`  ${user.email} ${field}: ${original || "(empty)"} -> ${next || "(empty)"}`);
        user[field] = next;
        summary.linksUpdated += 1;
        changed = true;
      }
    }

    if (changed && APPLY) await user.save();
  }
};

const migrateApplications = async () => {
  const applications = await Application.find({ resume: { $nin: [null, ""] } });
  log(`\nApplications with a resume: ${applications.length}`);

  for (const application of applications) {
    const original = application.resume;
    const normalized = normalizeStoredPath(original);
    const next = moved.get(normalized) || normalized;

    if (next !== original) {
      log(`  application ${application._id}: ${original} -> ${next}`);
      application.resume = next;
      summary.linksUpdated += 1;
      if (APPLY) await application.save();
    }
  }
};

const findOrphans = async () => {
  const referenced = new Set();
  const users = await User.find().select(FILE_FIELDS.map((f) => f.field).join(" "));
  for (const user of users) {
    for (const { field } of FILE_FIELDS) {
      if (user[field]) referenced.add(normalizeStoredPath(user[field]));
    }
  }
  const applications = await Application.find({ resume: { $nin: [null, ""] } });
  for (const application of applications) {
    referenced.add(normalizeStoredPath(application.resume));
  }
  // in a dry run the moves haven't happened yet, so count their targets too
  for (const [from, to] of moved) {
    referenced.add(to);
    referenced.add(from);
  }

  const candidates = [];
  for (const entry of fs.readdirSync(UPLOAD_DIR, { withFileTypes: true })) {
    if (entry.isFile() && !entry.name.startsWith(".")) {
      candidates.push({ stored: `/uploads/${entry.name}`, file: path.join(UPLOAD_DIR, entry.name) });
    }
  }
  for (const { folder } of Object.values(UPLOAD_TYPES)) {
    for (const name of fs.readdirSync(path.join(UPLOAD_DIR, folder))) {
      if (name.startsWith(".")) continue;
      candidates.push({ stored: `/uploads/${folder}/${name}`, file: path.join(UPLOAD_DIR, folder, name) });
    }
  }

  const orphans = candidates.filter(({ stored }) => !referenced.has(stored));
  log(`\nFiles nothing links to: ${orphans.length}`);
  for (const { stored, file } of orphans) {
    log(`  ${stored}`);
    summary.orphans += 1;
    if (APPLY && DELETE_ORPHANS) {
      fs.unlinkSync(file);
      summary.deleted += 1;
    }
  }
};

const main = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  ensureUploadFolders();
  await mongoose.connect(process.env.MONGO_URI);

  log(APPLY ? "Applying changes..." : "Dry run: nothing will be changed (add --apply)");

  await migrateUsers();
  await migrateApplications();
  await findOrphans();

  log("\nSummary:", summary);
  if (!APPLY) log("Run again with --apply to make these changes.");
  else if (summary.orphans && !DELETE_ORPHANS) {
    log("Add --delete-orphans to also delete the unlinked files.");
  }
};

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

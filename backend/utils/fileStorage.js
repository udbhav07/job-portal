const fs = require("fs");
const path = require("path");
const {
  UPLOAD_DIR,
  UPLOAD_URL_PREFIX,
  UPLOAD_TYPES,
} = require("../config/upload");

// stored value for a file: "/uploads/<folder>/<filename>" (no host, so it
// keeps working if the backend moves to another domain)
const toStoredPath = (type, filename) =>
  `${UPLOAD_URL_PREFIX}/${UPLOAD_TYPES[type].folder}/${filename}`;

// turn an old absolute URL ("http://host/uploads/...") into a stored path
const normalizeStoredPath = (value) => {
  if (!value || typeof value !== "string") return "";
  const withoutQuery = value.split("?")[0].split("#")[0];
  const index = withoutQuery.indexOf(`${UPLOAD_URL_PREFIX}/`);
  return index === -1 ? withoutQuery : withoutQuery.slice(index);
};

// "/uploads/avatars/avatar-123-456.png" -> { type: "avatar", filename }
const parseStoredPath = (storedPath) => {
  const normalized = normalizeStoredPath(storedPath);
  const match = normalized.match(/^\/uploads\/([a-z]+)\/([^/\\]+)$/);
  if (!match) return null;

  const [, folder, filename] = match;
  const type = Object.keys(UPLOAD_TYPES).find(
    (key) => UPLOAD_TYPES[key].folder === folder
  );
  if (!type || filename !== path.basename(filename) || filename.startsWith(".")) {
    return null;
  }
  return { type, folder, filename };
};

// absolute path on disk, guaranteed to be inside the uploads folder
const resolveStoredPath = (storedPath) => {
  const parsed = parseStoredPath(storedPath);
  if (!parsed) return null;

  const filePath = path.join(UPLOAD_DIR, parsed.folder, parsed.filename);
  return filePath.startsWith(UPLOAD_DIR + path.sep) ? filePath : null;
};

// files are named "<type>-<userId>-<timestamp>.<ext>"
const isOwnedBy = (storedPath, type, userId) => {
  const parsed = parseStoredPath(storedPath);
  return Boolean(
    parsed &&
      parsed.type === type &&
      parsed.filename.startsWith(`${type}-${userId}-`)
  );
};

const deleteStoredFile = async (storedPath) => {
  const filePath = resolveStoredPath(storedPath);
  if (!filePath) return false;
  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
};

const ensureUploadFolders = () => {
  for (const { folder } of Object.values(UPLOAD_TYPES)) {
    fs.mkdirSync(path.join(UPLOAD_DIR, folder), { recursive: true });
  }
};

module.exports = {
  toStoredPath,
  normalizeStoredPath,
  parseStoredPath,
  resolveStoredPath,
  isOwnedBy,
  deleteStoredFile,
  ensureUploadFolders,
};

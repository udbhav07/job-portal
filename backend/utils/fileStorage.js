const fs = require("fs");
const path = require("path");
const {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3, BUCKET } = require("../config/storage");
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

// "/uploads/avatars/avatar-1-2.png" -> "avatars/avatar-1-2.png" (key in the bucket)
const toObjectKey = (storedPath) => {
  const parsed = parseStoredPath(storedPath);
  return parsed ? `${parsed.folder}/${parsed.filename}` : null;
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

// when the file was uploaded, from the timestamp in its name (null if unknown)
const uploadedAt = (storedPath) => {
  const parsed = parseStoredPath(storedPath);
  const match = parsed?.filename.match(/-(\d{13})\.[a-z]+$/);
  return match ? Number(match[1]) : null;
};

// upload a file's bytes to the bucket
const saveFile = async (storedPath, buffer, contentType) => {
  const Key = toObjectKey(storedPath);
  if (!Key) throw new Error(`Invalid file path: ${storedPath}`);

  await s3.send(
    new PutObjectCommand({ Bucket: BUCKET, Key, Body: buffer, ContentType: contentType })
  );
};

// temporary link to a private file; expiresIn is in seconds
const getSignedFileUrl = async (storedPath, expiresIn) => {
  const Key = toObjectKey(storedPath);
  if (!Key) return null;

  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key }), {
    expiresIn,
  });
};

// read a file from the bucket; null when it doesn't exist
const getFileStream = async (storedPath) => {
  const Key = toObjectKey(storedPath);
  if (!Key) return null;

  try {
    const object = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key }));
    return {
      body: object.Body,
      contentType: object.ContentType,
      contentLength: object.ContentLength,
    };
  } catch (error) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw error;
  }
};

const deleteStoredFile = async (storedPath) => {
  const Key = toObjectKey(storedPath);
  if (!Key) return false;

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key }));
  return true;
};

// every upload in the bucket as { storedPath, lastModified }; other keys are skipped
const listStoredFiles = async () => {
  const files = [];
  for (const { folder } of Object.values(UPLOAD_TYPES)) {
    let ContinuationToken;
    do {
      const page = await s3.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: `${folder}/`,
          ContinuationToken,
        })
      );
      for (const object of page.Contents || []) {
        const storedPath = `${UPLOAD_URL_PREFIX}/${object.Key}`;
        if (parseStoredPath(storedPath)) {
          files.push({ storedPath, lastModified: object.LastModified });
        }
      }
      ContinuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (ContinuationToken);
  }
  return files;
};

// ---- local uploads folder: only used by the migration scripts ----

// absolute path on disk, guaranteed to be inside the uploads folder
const toLocalPath = (storedPath) => {
  const parsed = parseStoredPath(storedPath);
  if (!parsed) return null;

  const filePath = path.join(UPLOAD_DIR, parsed.folder, parsed.filename);
  return filePath.startsWith(UPLOAD_DIR + path.sep) ? filePath : null;
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
  toObjectKey,
  isOwnedBy,
  uploadedAt,
  saveFile,
  getSignedFileUrl,
  getFileStream,
  deleteStoredFile,
  listStoredFiles,
  toLocalPath,
  ensureUploadFolders,
};

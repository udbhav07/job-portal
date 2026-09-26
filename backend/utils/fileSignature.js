const fs = require("fs");

// the first bytes ("magic numbers") every real file of each type starts with
const SIGNATURES = {
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/jpg": [[0xff, 0xd8, 0xff]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46, 0x2d]], // "%PDF-"
};

const HEADER_LENGTH = 8;

const readHeader = async (filePath) => {
  const handle = await fs.promises.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(HEADER_LENGTH);
    const { bytesRead } = await handle.read(buffer, 0, HEADER_LENGTH, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
};

// true when the file's actual content matches the type the browser claimed
const matchesSignature = async (filePath, mimeType) => {
  const signatures = SIGNATURES[mimeType];
  if (!signatures) return false;

  const header = await readHeader(filePath);
  return signatures.some(
    (signature) =>
      header.length >= signature.length &&
      signature.every((byte, index) => header[index] === byte)
  );
};

// detect the real type from content alone (used by the migration script)
const detectMimeType = async (filePath) => {
  for (const mimeType of ["image/png", "image/jpeg", "application/pdf"]) {
    if (await matchesSignature(filePath, mimeType)) return mimeType;
  }
  return null;
};

module.exports = { matchesSignature, detectMimeType };

const fs = require("fs");

// the first bytes ("magic numbers") every real file of each type starts with
const SIGNATURES = {
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/jpg": [[0xff, 0xd8, 0xff]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46, 0x2d]], // "%PDF-"
};

const HEADER_LENGTH = 8;

// true when the bytes start with the signature of the claimed type
const bufferMatchesSignature = (buffer, mimeType) => {
  const signatures = SIGNATURES[mimeType];
  if (!signatures || !buffer) return false;

  return signatures.some(
    (signature) =>
      buffer.length >= signature.length &&
      signature.every((byte, index) => buffer[index] === byte)
  );
};


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

// same check for a file on disk (used by the scripts)
const matchesSignature = async (filePath, mimeType) =>
  bufferMatchesSignature(await readHeader(filePath), mimeType);

// detect the real type of a file on disk from its content alone
const detectMimeType = async (filePath) => {
  const header = await readHeader(filePath);
  return (
    ["image/png", "image/jpeg", "application/pdf"].find((mimeType) =>
      bufferMatchesSignature(header, mimeType)
    ) || null
  );
};

module.exports = { bufferMatchesSignature, matchesSignature, detectMimeType };
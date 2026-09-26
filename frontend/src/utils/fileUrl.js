import axiosInstance from "./axiosInstance";
import { BASE_URL } from "./apiPaths";

const UPLOADS_PREFIX = "/uploads/";

// "/uploads/..." (or an old "http://any-host/uploads/...") -> "/uploads/..."
export const toUploadPath = (value) => {
  if (!value) return "";
  const index = value.indexOf(UPLOADS_PREFIX);
  return index === -1 ? value : value.slice(index);
};

// full URL for a stored file path; local previews (blob:/data:) pass through
export const getFileUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;

  const uploadPath = toUploadPath(value);
  return uploadPath.startsWith(UPLOADS_PREFIX)
    ? `${BASE_URL}${uploadPath}`
    : value;
};

// error bodies come back as a Blob when responseType is "blob"
const readBlobError = async (error) => {
  const data = error.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).message;
    } catch {
      return null;
    }
  }
  return data?.message || null;
};

// private files (resumes) need the login token, so they are fetched with
// axios and opened from memory instead of linking to the URL directly
export const openProtectedFile = async (value) => {
  // open the tab right away so the browser doesn't treat it as a popup
  const tab = window.open("", "_blank");

  try {
    const response = await axiosInstance.get(toUploadPath(value), {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    if (tab) tab.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
  } catch (error) {
    tab?.close();
    error.message = (await readBlobError(error)) || "Could not open the file";
    throw error;
  }
};

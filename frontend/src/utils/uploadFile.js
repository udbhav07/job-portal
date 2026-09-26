import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

// type decides where the backend stores the file and which formats it accepts:
// "avatar" | "logo" -> PNG/JPEG, "resume" -> PDF
// resolves to the stored path, e.g. "/uploads/avatars/avatar-<id>-<time>.png"
const uploadFile = async (file, type) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosInstance.post(
      API_PATHS.FILES.UPLOAD,
      formData,
      {
        params: { type },
        headers: {
          "Content-Type": "multipart/form-data", // set header for file upload
        },
      }
    );
    return response.data.path;
  } catch (error) {
    console.error(`Error uploading the ${type}`, error);
    throw error; // Rethrow error for handling
  }
};

export default uploadFile;

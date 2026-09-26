import { Save, X, Trash2 } from "../../utils/icons";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import uploadFile from "../../utils/uploadFile";
import { openProtectedFile } from "../../utils/fileUrl";
import { validateUploadFile } from "../../utils/helper";
import Navbar from "../../components/layouts/Navbar";
import ProfileImage from "../../components/ProfileImage";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    resume: user?.resume || "",
  });

  const [formData, setFormData] = useState({ ...profileData });
  const [uploading, setUploading] = useState({ avatar: false, resume: false });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (file, type, previousValue, input) => {
    setUploading((prev) => ({ ...prev, [type]: true }));

    try {
      const avatarUrl = (await uploadFile(file, type)) || ""; // "avatar" or "resume"
      //update formdata with new url
      handleInputChange(type, avatarUrl);

      // a resume is saved right away so it shows as uploaded immediately
      if (type === "resume" && avatarUrl) {
        await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
          resume: avatarUrl,
        });
        updateUser({ resume: avatarUrl });
        toast.success("Resume uploaded");
      }
    } catch (error) {
      console.error("Image Upload Failed:", error);
      // drop the temporary preview so it can never be saved
      handleInputChange(type, previousValue);
      input.value = ""; // don't keep showing the rejected file's name
      toast.error(error.response?.data?.message || "Upload failed, please try again");
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleImageChange = (e, type) => {
    const input = e.target;
    const file = input.files[0];
    if (file) {
      const error = validateUploadFile(file, type);
      if (error) {
        input.value = ""; // clear the wrong file so it isn't shown as selected
        toast.error(error);
        return;
      }

      const previousValue = formData[type] || "";

      // create preview profile
      const previewUrl = URL.createObjectURL(file);
      handleInputChange(type, previewUrl);

      // upload image
      handleImageUpload(file, type, previousValue, input);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        formData
      );
      if (response.status === 200) {
        toast.success("Profile details updated successfully");
        // update profile data and exit edit mode
        setProfileData({ ...formData });
        updateUser({ ...formData });
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
  };

  // resumes are private, so they are opened with the user's login token
  const viewResume = async () => {
    try {
      await openProtectedFile(user?.resume);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteResume = async () => {
    setSaving(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.DELETE_RESUME, {
        resumeUrl: user?.resume || "",
      });

      if (response.status === 200) {
        toast.success("Resume deleted successfully");
        setProfileData({ ...formData, resume: "" });
        updateUser({ ...formData, resume: "" });
      }
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const userData = {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      resume: user?.resume || "",
    };

    setProfileData({ ...userData });
    setFormData({ ...userData });
    return () => {};
  }, [user]);

  return (
    <div className="bg-teal-50">
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-8 px-4 mt-16 lg:m-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-teal-600 px-8 py-6 flex justify-between items-center">
              <h1 className="text-xl font-medium text-white">Profile</h1>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <ProfileImage
                      src={formData?.avatar}
                      alt="Avatar"
                      name={formData?.name}
                      className="w-20 h-20 rounded-full border-4 border-gray-200"
                    />
                    {uploading?.avatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block">
                      <span className="sr-only">Choose Avatar</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={(e) => handleImageChange(e, "avatar")}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-800 hover:file:bg-teal-100 transition-colors"
                      />
                    </label>
                  </div>
                </div>

                {/* name input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                  />
                </div>
                {/* Email (Read-Only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                {/* Resume Url */}
                {user?.resume ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={viewResume}
                        className="text-sm text-teal-700 underline cursor-pointer"
                      >
                        View resume ({user.resume.split("/").pop()})
                      </button>
                      <button onClick={deleteResume} className="cursor-pointer">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resume
                      </label>
                      <span className="sr-only">Choose file</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => handleImageChange(e, "resume")}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-800 hover:file:bg-teal-100 transition-colors"
                      />
                    </label>
                  </div>
                )}
              </div>
              {/* Action buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <Link
                  onClick={handleCancel}
                  to="/find-jobs"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Link>
                <button
                  onClick={handleSave}
                  disabled={saving || uploading.avatar || uploading.resume}
                  className="px-6 py-3 bg-teal-700 text-white rounded-full hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="">
                    {saving ? "Saving..." : "Save Changes"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

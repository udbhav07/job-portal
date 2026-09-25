import { ArrowLeft, Grid, Bookmark, List, Book } from "../../utils/icons";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/layouts/Navbar";
import JobCard from "../../components/cards/JobCard";
import toast from "react-hot-toast";

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [savedJobList, setSavedJobList] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

  const getSavedJobs = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_SAVED_JOBS);
      // skip entries whose job has since been deleted
      setSavedJobList((response.data || []).filter((saved) => saved?.job));
    } catch (error) {
      console.error("Error Fetching Job Details:", error);
    }
  };

  const handleUnsaveJobs = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
      toast.success("Job removed successfully");
      getSavedJobs();
    } catch (error) {
      console.error("Error removing saved job:", error);
      toast.error("Something went wrong, Try again later");
    }
  };

  useEffect(() => {
    if (user) {
      getSavedJobs();
    }
  }, [user]);

  return (
    <div className="bg-teal-50">
      <Navbar />
      <div className="container mx-auto pt-24">
        {savedJobList && (
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="cursor-pointer group flex items-center space-x-2 px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:text-white bg-white/50 hover:bg-teal-700 border border-gray-200 hover:border-transparent rounded-full transition-all duration-300 shadow-lg shadow-gray-100 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </button>
                <h1 className="text-lg lg:text-xl font-semibold leading-tight text-gray-900">
                  Saved Jobs
                </h1>
              </div>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-teal-700 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    } cursor-pointer `}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-teal-700 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    } cursor-pointer `}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {/* Content Sections */}
            <div className="px-0 pb-8 space-y-8">
              {/* Job Grid */}
              {savedJobList.length === 0 ? (
                <div className="text-center py-16 lg:py-20 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20">
                  <div className="text-gray-300 mb-6">
                    <Bookmark className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                    You haven't save any jobs yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start saving jobs that interest you view them later
                  </p>
                  <button
                    onClick={() => navigate("/find-jobs")}
                    className="bg-teal-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
                  >
                    Browse Jobs
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6"
                        : "space-y-4 lg:space-y-6"
                    }
                  >
                    {savedJobList.map((savedJob) => (
                      <JobCard
                        key={savedJob._id}
                        job={savedJob?.job}
                        onClick={() => navigate(`/job/${savedJob?.job._id}`)}
                        onToggleSave={() => handleUnsaveJobs(savedJob?.job._id)}
                        saved
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;

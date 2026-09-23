import React from "react";
import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import JobSeekerDashboard from "./pages/JobSeeker/JobSeekerDashboard";
import JobDetails from "./pages/JobSeeker/JobDetails";
import SavedJobs from "./pages/JobSeeker/SavedJobs";
import UserProfile from "./pages/JobSeeker/UserProfile";
import EmployerDashboard from "./pages/Employer/EmployerDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/find-jobs" element={<JobSeekerDashboard />} />
          <Route path="/job/:jobId" element={<JobDetails />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
          <Route path="/profile" element={<UserProfile />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="employer" />}>
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          </Route>

          {/* Catch All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;

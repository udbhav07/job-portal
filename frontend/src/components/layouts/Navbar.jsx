import { useState, useEffect } from "react";
import { Bookmark } from "../../utils/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileDropDown from "./ProfileDropDown";
import { LogoMark } from "../Logo";

const Navbar = () => {
  const [profileDropDown, setProfileDropDown] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // close dropDown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropDown) {
        setProfileDropDown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropDown]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <LogoMark className="w-8 h-8" />
            <span className="text-lg text-gray-900 font-bold">JobPortal</span>
          </Link>

          {/* Auth Button */}
          <div className="flex items-center space-x-3">
            {user && (
              <button onClick={() => navigate("/saved-jobs")} 
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative cursor-pointer">
                <Bookmark className="h-5 w-5 text-gray-500" />
              </button>
            )}
            {isAuthenticated ? (
              <ProfileDropDown
                isOpen={profileDropDown}
                onToggle={(e) => {
                  e.stopPropagation();
                  setProfileDropDown(!profileDropDown);
                }}
                avatar={user?.avatar || ""}
                companyName={user?.name || ""}
                email={user?.email || ""}
                userRole={user?.role || ""}
                onLogout={logout}
              />
            ) : (
              <>
                <a href="/login" 
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-100">
                  Login
                </a>
                <a href="/signUp" 
                className="bg-teal-700 text-white px-6 py-2 rounded-full font-medium hover:bg-teal-800 transition-all duration-300 shadow-sm hover:shadow-md">
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

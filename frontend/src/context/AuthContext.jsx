import {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error("Error parsing stored user", e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // initialize synchronously from localStorage so the first render is correct
  const [user, setUser] = useState(readStoredUser);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  // forget the session locally, without navigating anywhere
  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    window.location.href = "/";
  }, [clearSession]);

  // confirm the saved token with the server and refresh the user's details
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      clearSession();
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE, {
        skipAuthRedirect: true,
      });
      const freshUser = { ...readStoredUser(), ...response.data };
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);
      setIsAuthenticated(true);
    } catch (error) {
      if (error.response?.status === 401) {
        // expired or invalid token
        clearSession();
      } else {
        // server unreachable: keep the saved session for now
        console.error("Auth check failed", error);
      }
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback((userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const newUserData = { ...prev, ...updatedUserData };
      localStorage.setItem("user", JSON.stringify(newUserData));
      return newUserData;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      updateUser,
      checkAuthStatus,
    }),
    [user, loading, isAuthenticated, login, logout, updateUser, checkAuthStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

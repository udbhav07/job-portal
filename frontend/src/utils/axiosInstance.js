import axios from "axios";
import { API_PATHS, BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // handle common errors globally
    if (error.response) {
      const url = error.config?.url || "";
      const isAuthRequest =
        url.includes(API_PATHS.AUTH.LOGIN) ||
        url.includes(API_PATHS.AUTH.REGISTER);

      // session expired or invalid: clear it and send the user to login.
      // login/register 401s are wrong credentials, so let the page show them;
      // requests marked skipAuthRedirect handle the 401 themselves
      if (
        error.response.status === 401 &&
        !isAuthRequest &&
        !error.config?.skipAuthRedirect
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else if (error.response.status === 500) {
        console.error("Server Error, please try again later");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request Timeout, please try again");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

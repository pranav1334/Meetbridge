import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  timeout: 60000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("meetbridge_token");

  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    if (
      status === 401 &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      localStorage.removeItem("meetbridge_token");
      localStorage.removeItem("meetbridge_user");

      window.dispatchEvent(new Event("authChanged"));

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default API;
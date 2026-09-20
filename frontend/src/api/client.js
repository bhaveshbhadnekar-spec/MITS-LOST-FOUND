import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // A 401 on login/register just means "wrong credentials" / "already exists" —
    // that should show as a normal form error, not force-navigate the whole app
    // back to the landing page (which was hiding the error message).
    const url = err.config?.url || "";
    const isAuthAttempt = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/google");
    if (err.response?.status === 401 && !isAuthAttempt) {
      window.dispatchEvent(new Event("auth-expired"));
    }
    return Promise.reject(err);
  }
);

export default api;
import axios, { type AxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Helper: attach Authorization header if you store a token in localStorage.
 * If you use httpOnly cookies, keep `withCredentials: true` and skip this.
 */
function attachAuth(config: AxiosRequestConfig) {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token"); // or however you store it
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return config;
}

/** Regular user API */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const userApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies if you use httpOnly cookies
  headers: {
    "X-Client": "wahejan-user",
  },
});

/** Admin API */
export const adminApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "X-Client": "wahejan-admin",
    "X-Required-Role": "admin", // optional signal; server must still verify!
  },
});

// REQUEST interceptors
userApi.interceptors.request.use((cfg) => attachAuth(cfg));
adminApi.interceptors.request.use((cfg) => attachAuth(cfg));

// RESPONSE interceptors (redirects / edge cases)
userApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 403 && typeof window !== "undefined") {
      // Forbidden — not an admin
      window.location.href = "/user/dashboard";
    } else if (err.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

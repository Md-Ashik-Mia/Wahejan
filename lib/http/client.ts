// import axios, { type AxiosRequestConfig } from "axios";

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

// /**
//  * Helper: attach Authorization header if you store a token in localStorage.
//  * If you use httpOnly cookies, keep `withCredentials: true` and skip this.
//  */
// function attachAuth(config: AxiosRequestConfig) {
//   if (typeof window !== "undefined") {
//     const token = localStorage.getItem("access_token"); // or however you store it
//     if (token) {
//       config.headers = {
//         ...config.headers,
//         Authorization: `Bearer ${token}`,
//       };
//     }
//   }
//   return config;
// }

// /** Regular user API */
// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export const userApi = axios.create({
//   baseURL: BASE_URL,
//   // withCredentials: true, // send cookies if you use httpOnly cookies
//   headers: {
//     "X-Client": "wahejan-user",
//   },
// });

// /** Admin API */
// export const adminApi = axios.create({
//   baseURL: BASE_URL,
//   // withCredentials: true,
//   headers: {
//     // "X-Client": "wahejan-admin",
//     // "X-Required-Role": "admin", // optional signal; server must still verify!
//   },
// });

// // REQUEST interceptors
// userApi.interceptors.request.use((cfg) => attachAuth(cfg));
// adminApi.interceptors.request.use((cfg) => attachAuth(cfg));

// // RESPONSE interceptors (redirects / edge cases)
// userApi.interceptors.response.use(
//   (r) => r,
//   (err) => {
//     if (err.response?.status === 401 && typeof window !== "undefined") {
//       window.location.href = "/login";
//     }
//     return Promise.reject(err);
//   }
// );

// // adminApi.interceptors.response.use(
// //   (r) => r,
// //   (err) => {
// //     if (err.response?.status === 403 && typeof window !== "undefined") {
// //       // Forbidden — not an admin
// //       window.location.href = "/user/dashboard";
// //     } else if (err.response?.status === 401 && typeof window !== "undefined") {
// //       window.location.href = "/login";
// //     }
// //     return Promise.reject(err);
// //   }
// // );

// lib/http/client.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Attach Authorization header from localStorage.
 * Used by both userApi and adminApi.
 */
async function attachAuth(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("access_token");

    // Fail-safe: If local storage is empty, try fetching from session once (resolves race conditions)
    if (!token) {
      try {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const sessionToken = (session as any)?.accessToken;
        if (typeof sessionToken === "string" && sessionToken) {
          token = sessionToken;
          localStorage.setItem("access_token", token);
          const refresh = (session as any)?.refreshToken;
          if (refresh) localStorage.setItem("refresh_token", refresh);
        }
      } catch (err) {
        // silent fail, let the 401 interceptor handle it
      }
    }

    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      const headers = config.headers;
      if (headers instanceof AxiosHeaders) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        (headers as Record<string, string | undefined>)["Authorization"] =
          `Bearer ${token}`;
      }
    }
  }
  return config;
}

/** Attach client/device info only for public/auth calls (no auth required). */
function attachClientInfo(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  if (typeof window !== "undefined") {
    // Browser cannot override real User-Agent; use a custom header.
    const clientInfo = localStorage.getItem("client_info");
    if (clientInfo) {
      const headers = config.headers;
      if (headers instanceof AxiosHeaders) {
        headers.set("X-Client-Info", clientInfo);
      } else {
        (headers as Record<string, string | undefined>)["X-Client-Info"] =
          clientInfo;
      }
    }
  }
  return config;
}

/** Generic API instance (can be used in server or client code) */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    // "User-Agent":`${brand}, ${deviceName}, ${Platform.OS}`
  },
});

// REQUEST interceptors (public/auth requests)
api.interceptors.request.use((cfg) => {
  if (typeof window === "undefined") {
    console.log(`[server-api] Requesting: ${cfg.baseURL}${cfg.url}`);
  }
  return attachClientInfo(cfg);
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window === "undefined") {
      console.error("[server-api] Error details:", {
        url: err.config?.url,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
    }
    return Promise.reject(err);
  }
);

/** Regular user API */
export const userApi = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

// Alias (some pages/imports expect this exact name)
export const userapi = userApi;

/** Admin API */
export const adminApi = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    // keep empty to avoid CORS “header not allowed” issues
  },
});

// REQUEST interceptors
userApi.interceptors.request.use(attachAuth);
adminApi.interceptors.request.use(attachAuth);

// RESPONSE interceptor for user (refreshes token on 401 if possible)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function handle401(err: any, instance: any) {
  const originalRequest = err.config;

  if (err.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!accessToken || !refreshToken) {
        throw new Error("No tokens available");
      }

      // Use the validation endpoint provided by the backend
      // Note: We use the base axios 'api' instance to avoid interceptor loops
      const { data } = await api.post("/validate-token/", {
        access: accessToken,
        refresh: refreshToken,
      });

      if (data.valid && data.access) {
        const newAccess = data.access;
        const newRefresh = data.refresh;

        localStorage.setItem("access_token", newAccess);
        if (newRefresh) localStorage.setItem("refresh_token", newRefresh);

        // Update headers and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        return instance(originalRequest);
      } else {
        throw new Error("Token validation failed");
      }
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Clear tokens and redirect to signout/login
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } catch { }

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/api/auth/signout") && !currentPath.includes("/login")) {
          window.location.href = "/api/auth/signout?callbackUrl=/login";
        }
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(err);
}

userApi.interceptors.response.use(
  (r) => r,
  (err) => handle401(err, userApi)
);

adminApi.interceptors.response.use(
  (r) => r,
  (err) => handle401(err, adminApi)
);

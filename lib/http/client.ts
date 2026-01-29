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
api.interceptors.request.use(attachClientInfo);

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

// RESPONSE interceptor for user (redirect to login on 401)
userApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } catch {
        // ignore storage errors
      }

      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/api/auth/signout")) {
        window.location.href = "/api/auth/signout?callbackUrl=/login";
      }
    }
    return Promise.reject(err);
  },
);

// You can re-enable this later if you want auto redirects for admin errors
adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } catch {
        // ignore storage errors
      }

      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/api/auth/signout")) {
        window.location.href = "/api/auth/signout?callbackUrl=/login";
      }
    }
    return Promise.reject(err);
  },
);

import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

// In production the frontend is served from the same origin as the API,
// so we use a relative path. In dev, Vite proxies /api to localhost:8080.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function getAccessToken(): string | null {
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token')
  );
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
}

// Uygulama açılırken varsa kaydedilmiş token'ı axios'a yükle
const existing = getAccessToken();
if (existing) {
  api.defaults.headers.common['Authorization'] = `Bearer ${existing}`;
}

// Her isteğe Authorization header ekle (AxiosHeaders ile tip hatasını önlüyoruz)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      const headers = AxiosHeaders.from(config.headers || {});
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = (error.config || {}) as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthCall = originalRequest.url?.includes('/auth/');

    if (status === 401 && !originalRequest._retry && !isAuthCall) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        refreshPromise = api
          .post<{ accessToken?: string; refreshToken?: string }>('/auth/refresh', { refreshToken })
          .then((res) => {
            const newAccess = res.data.accessToken;
            const newRefresh = res.data.refreshToken;
            if (newAccess) {
              setTokens(newAccess, newRefresh);
            }
            return newAccess || null;
          })
          .catch((refreshErr) => {
            clearTokens();
            throw refreshErr;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const newToken = await refreshPromise;
        if (!newToken) return Promise.reject(error);
        originalRequest._retry = true;
        const headers = AxiosHeaders.from(originalRequest.headers || {});
        headers.set('Authorization', `Bearer ${newToken}`);
        originalRequest.headers = headers;
        return api(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

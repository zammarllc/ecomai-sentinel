import axios from 'axios';
import { clearToken, getToken } from './auth.js';

function resolveBaseUrl() {
  const root = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim() : '';
  if (!root) {
    return '/api';
  }
  const normalizedRoot = root.endsWith('/') ? root.slice(0, -1) : root;
  return `${normalizedRoot}/api`;
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

export default api;


import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// Attach the JWT token from sessionStorage before every request.

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('indiwari_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────────
// If the server returns 401 (token expired/invalid), clear session and redirect.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear stored session data
      sessionStorage.removeItem('indiwari_token');
      sessionStorage.removeItem('indiwari_user');

      // Redirect to login, but only if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
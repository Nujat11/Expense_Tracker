import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const DEFAULT_API_URL = import.meta.env.VITE_API_BASE_URL || (isLocal 
  ? 'http://localhost:8000' 
  : 'https://web-development-project-shzj.onrender.com');

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 60000, // 60s timeout to allow Render free tier cold-start
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user.access_token) {
        config.headers.Authorization = `Bearer ${user.access_token}`;
      }
    } catch (e) {
      console.error('Error parsing user session token:', e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle session expiration (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config && error.config.url && error.config.url.endsWith('/login');
      // Only clear session and redirect if it's NOT a failed login attempt
      if (!isLoginRequest) {
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login?logout=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;




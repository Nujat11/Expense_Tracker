import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const DEFAULT_API_URL = import.meta.env.VITE_API_BASE_URL || (isLocal 
  ? 'http://localhost:8000' 
  : 'https://web-development-project-shzj.onrender.com');

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 60000, // 60s timeout to allow Render free tier cold-start
});

export default api;



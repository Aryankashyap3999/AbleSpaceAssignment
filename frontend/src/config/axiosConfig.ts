import axios, { type AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies to be sent with requests
});

// Add interceptor to include token from localStorage in Authorization header
axiosInstance.interceptors.request.use((config) => {
  // Token is in HttpOnly cookie, but as fallback we'll try to get it from Authorization header
  // For cross-domain, we need to send token in header instead of relying on cookies
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;


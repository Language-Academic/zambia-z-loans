import axios from 'axios';

/**
 * Zambia Z API Gateway Instance
 * Professional configuration for secure fintech communication.
 */
const api = axios.create({
  // Dynamically uses your Render URL from environment variables
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // 15-second timeout for better UX on slow networks
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Securely inject JWT for every outgoing call
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Pro-Tip: Log requests in development mode only
    if (import.meta.env.DEV) {
      console.log(`🚀 [API Request] ${config.method?.toUpperCase()} -> ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors and session expiry
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle Session Expiry (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error('🔒 Session expired or unauthorized. Redirecting to login.');
      
      // Clear local storage for safety
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Avoid redirect loops if already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }

    // Handle Server Downtime (No response)
    if (!error.response) {
      console.error('🌐 Network error: Please check your internet connection or server status.');
    }

    // Handle Specific Fintech Errors (e.g., 403 Forbidden for low credit score)
    if (error.response?.status === 403) {
      console.warn('⚠️ Action forbidden: User may not meet loan eligibility criteria.');
    }

    return Promise.reject(error);
  }
);

export default api;

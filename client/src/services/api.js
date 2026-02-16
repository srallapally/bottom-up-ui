// client/src/services/api.js
import axios from 'axios';

// ✅ Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error('❌ VITE_API_BASE_URL is not defined in .env');
    throw new Error('Missing API configuration');
}

console.log('✅ API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000, // 5 minutes for long-running operations
    withCredentials: true, // Important for session cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor (logging, auth headers if needed)
api.interceptors.request.use(
    (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor (error handling)
api.interceptors.response.use(
    (response) => {
        console.log(`[API] ✅ ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('[API] ❌ Error:', error.response?.status, error.message);

        // Handle auth errors
        if (error.response?.status === 401) {
            // Redirect to login
            window.location.href = '/auth/login';
        }

        // Handle backend unavailable
        if (error.response?.status === 502 || error.response?.status === 503) {
            console.error('Backend unavailable:', error.response?.data);
        }

        return Promise.reject(error);
    }
);

export default api;
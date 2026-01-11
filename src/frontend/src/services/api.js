import axios from 'axios';
import { toast } from 'react-toastify';

// Create Axios Instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token') || sessionStorage.getItem('accessToken') || sessionStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Global Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response, message } = error;

        // Skip toast for canceled requests
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
            return Promise.reject(error);
        }

        // Safe toast wrapper to prevent react-toastify bugs from crashing the app
        const safeToast = (msg) => {
            try {
                toast.error(msg);
            } catch (toastError) {
                console.error('Toast error:', toastError);
                console.error('Original message:', msg);
            }
        };

        if (!response) {
            // Network Error or Server Down
            safeToast('Network error or server unreachable. Please check your connection.');
            return Promise.reject(error);
        }

        // Debug logging for 404 errors
        if (response.status === 404) {
            console.warn('[API 404] URL:', error.config?.url, 'Full URL:', error.config?.baseURL + error.config?.url);
        }

        // Handle specific status codes
        switch (response.status) {
            case 401:
                // Unauthorized - Optional: Redirect to login or clear token
                safeToast('Session expired. Please login again.');
                break;
            case 403:
                safeToast('You do not have permission to perform this action.');
                break;
            case 404:
                // Don't show toast for subscription 404 (it's expected for free users)
                if (!error.config?.url?.includes('/subscription')) {
                    safeToast('Resource not found.');
                }
                break;
            case 500:
                safeToast('Internal server error. Please try again later.');
                break;
            default:
                // Generic API message or default text
                safeToast(response.data?.message || message || 'Something went wrong.');
        }

        return Promise.reject(error);
    }
);

export default api;

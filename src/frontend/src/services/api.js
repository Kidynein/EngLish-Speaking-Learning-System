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

        if (!response) {
            // Network Error or Server Down
            toast.error('Network error or server unreachable. Please check your connection.');
            return Promise.reject(error);
        }

        // Handle specific status codes
        switch (response.status) {
            case 401:
                // Unauthorized - Optional: Redirect to login or clear token
                toast.error('Session expired. Please please login again.');
                // window.location.href = '/login'; 
                break;
            case 403:
                toast.error('You do not have permission to perform this action.');
                break;
            case 404:
                toast.error('Resource not found.');
                break;
            case 500:
                toast.error('Internal server error. Please try again later.');
                break;
            default:
                // Generic API message or default text
                toast.error(response.data?.message || message || 'Something went wrong.');
        }

        return Promise.reject(error);
    }
);

export default api;

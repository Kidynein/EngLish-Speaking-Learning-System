import axios from 'axios';
import { toast } from 'react-toastify';

// Create Axios Instance
const api = axios.create({
    baseURL: '/api', // Proxy will handle forwarding to http://localhost:5000
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Adjust key if needed (e.g., 'accessToken')
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

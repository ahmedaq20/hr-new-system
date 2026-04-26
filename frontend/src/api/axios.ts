import axios from 'axios';
import { API_BASE_URL } from '../config/api';

if (!API_BASE_URL) {
    console.error('VITE_API_BASE_URL is not defined in .env file!');
}


const api = axios.create({
    baseURL: API_BASE_URL ? (API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`) : '',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle 401 Unauthorized globally
        if (error.response?.status === 401) {
            // Optionally redirect to login or clear token
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

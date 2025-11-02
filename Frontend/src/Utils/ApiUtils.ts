import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// API Base URL
const BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const apiInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiInstance.interceptors.request.use(
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

// Response interceptor for error handling
apiInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Generic API response type
export interface ApiResponse<T = unknown> {
    success: number;
    message: string;
    data: T;
}

// Generic API error response type
export interface ApiError {
    success: number;
    message: string;
    data?: unknown;
}

export default apiInstance;


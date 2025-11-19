/**
 * API Service with Axios and Interceptors
 * Centralized HTTP client for Laravel backend integration
 */

import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from './constants';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// ========================================
// REQUEST INTERCEPTOR
// ========================================
// Automatically adds Bearer token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================
// Handles errors automatically
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    
    // Handle 422 Validation Error (Laravel)
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors || {};
      const errorMessages = Object.values(validationErrors)
        .flat()
        .filter(Boolean)
        .join(', ');
      
      error.message = errorMessages || error.response.data.message || 'Error de validación';
      error.errors = validationErrors;
    }
    
    // Handle other errors
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

// Export as default for simple usage
export default api;

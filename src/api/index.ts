/**
 * API Layer - Main Entry Point
 */

export { api, default as apiService } from './apiService';
export { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from './constants';
export type { ValidationError, PaginationParams, ApiResponse, PaginatedResponse } from './types';

/**
 * API Types
 * Simplified core type definitions
 */

/**
 * Laravel Validation Error structure (422)
 */
export interface ValidationError {
  errors: Record<string, string[]>;
  message: string;
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Standard API Response wrapper (for services that need it)
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  timestamp: string;
}

/**
 * Products Service
 * API service for product operations
 * ✅ Fully integrated with Laravel backend
 */

import type { Product, CreateProductDto, UpdateProductDto, ProductFilters } from '../types/product.types';
import type { AdjustStockDto } from '../types/stock-movement.types';
import type { ApiResponse, PaginatedResponse } from '@/api/types';
import { api } from '@/api';
import {
  transformLaravelProduct,
  transformLaravelProducts,
  transformLaravelPaginatedProducts,
  transformToLaravelProductPayload,
} from '../utils/transformers';

/**
 * Products Service
 * Handles all product-related API operations with Laravel backend
 */
export const productsService = {
  /**
   * Get all products with filters
   * 🔗 LARAVEL: GET /api/v1/products (paginated)
   */
  async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const response = await api.get('/products', { params: filters });
    return transformLaravelPaginatedProducts(response.data);
  },

  /**
   * Get featured products
   * 🔗 LARAVEL: GET /api/v1/products/featured
   */
  async getFeatured(): Promise<Product[]> {
    const response = await api.get<any[]>('/products/featured');
    return transformLaravelProducts(response.data);
  },

  /**
   * Get product by ID with relations
   * 🔗 LARAVEL: GET /api/v1/products/{id}
   */
  async getById(id: string): Promise<Product | null> {
    const response = await api.get(`/products/${id}`);
    return transformLaravelProduct(response.data);
  },

  /**
   * Get products by category
   */
  async getByCategory(categoryId: string): Promise<Product[]> {
    const result = await this.getAll({ category_id: categoryId, status: 'active' });
    return result.data;
  },

  /**
   * Get products by subcategory (deprecated - subcategories are now categories)
   * @deprecated Use getByCategory instead
   */
  async getBySubcategory(subcategoryId: string): Promise<Product[]> {
    return this.getByCategory(subcategoryId);
  },

  /**
   * Search products
   */
  async search(query: string): Promise<Product[]> {
    const result = await this.getAll({ search: query });
    return result.data;
  },

  /**
   * Create product
   * 🔗 LARAVEL: POST /api/v1/products
   * Response: { message, product }
   */
  async create(data: CreateProductDto): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    const payload = transformToLaravelProductPayload(data);
    
    // Append all fields
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Append image if present
    if (data.image) {
      formData.append('image', data.image);
    }
    
    const response = await api.post<any>('/products', formData);
    
    return {
      data: transformLaravelProduct(response.data.product),
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Update product
   * 🔗 LARAVEL: PUT /api/v1/products/{id}
   * Response: { message, product }
   */
  async update(id: string, data: UpdateProductDto): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    const payload = transformToLaravelProductPayload(data);
    
    // Append all fields
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Append image if present
    if (data.image) {
      formData.append('image', data.image);
    }
    
    // Laravel requires _method=PUT with FormData
    formData.append('_method', 'PUT');
    
    const response = await api.post<any>(`/products/${id}`, formData);
    
    return {
      data: transformLaravelProduct(response.data.product),
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Soft delete product
   * 🔗 LARAVEL: DELETE /api/v1/products/{id}
   * Response: { message }
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<any>(`/products/${id}`);
    return {
      data: undefined as void,
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Force delete product (permanent)
   * 🔗 LARAVEL: DELETE /api/v1/products/{id}/force
   */
  async forceDelete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<any>(`/products/${id}/force`);
    return {
      data: undefined as void,
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Get deleted products (recycle bin)
   * 🔗 LARAVEL: GET /api/v1/products/deleted
   */
  async getDeleted(): Promise<ApiResponse<Product[]>> {
    const response = await api.get<Product[]>('/products/deleted');
    return {
      data: response.data.map(transformLaravelProduct),
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Restore deleted product
   * 🔗 LARAVEL: POST /api/v1/products/{id}/restore
   * Response: { message, product }
   */
  async restore(id: string): Promise<ApiResponse<Product>> {
    const response = await api.post<any>(`/products/${id}/restore`);
    return {
      data: transformLaravelProduct(response.data.product),
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Adjust product stock
   * 🔗 LARAVEL: POST /api/v1/products/{id}/stock
   * Response: { message, product }
   */
  async adjustStock(id: string, data: AdjustStockDto): Promise<ApiResponse<Product>> {
    const response = await api.post<any>(`/products/${id}/stock`, data);
    return {
      data: transformLaravelProduct(response.data.product),
      message: response.data.message,
      timestamp: new Date().toISOString(),
    };
  },
};

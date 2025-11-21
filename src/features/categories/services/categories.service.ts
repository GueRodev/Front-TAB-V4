/**
 * Categories Service
 * API service for category and subcategory operations
 */

import type { Category, Subcategory, CreateCategoryDto, UpdateCategoryDto, CreateSubcategoryDto, UpdateSubcategoryDto, ReorderCategoriesDto } from '../types';
import type { ApiResponse } from '@/api/types';
import { api } from '@/api/apiService';
import { API_ENDPOINTS } from '@/api/constants';
import { transformLaravelCategory, transformLaravelCategories, transformToLaravelPayload } from '../utils/transformers';

/**
 * 🔗 CONEXIÓN LARAVEL:
 * Este servicio gestiona categorías y subcategorías.
 * Actualmente usa localStorage como fallback.
 * 
 * ENDPOINTS ESPERADOS:
 * - GET    /api/categories              - Listar todas las categorías con subcategorías
 * - GET    /api/categories/{id}         - Obtener una categoría específica
 * - POST   /api/categories              - Crear categoría (admin)
 * - PUT    /api/categories/{id}         - Actualizar categoría (admin)
 * - DELETE /api/categories/{id}         - Eliminar categoría (admin)
 * - POST   /api/categories/reorder      - Reordenar categorías (drag & drop)
 * 
 * - POST   /api/subcategories           - Crear subcategoría (admin)
 * - PUT    /api/subcategories/{id}      - Actualizar subcategoría (admin)
 * - DELETE /api/subcategories/{id}      - Eliminar subcategoría (admin)
 * 
 * 📦 TODO: FUTURE RECYCLE BIN ENDPOINTS (Soft Delete Implementation)
 * 
 * ENDPOINTS PARA PAPELERA DE RECICLAJE:
 * - GET    /api/categories/recycle-bin        - List soft-deleted categories/subcategories
 *                                               Response: { data: { categories: Category[], subcategories: Subcategory[] } }
 * 
 * - POST   /api/categories/{id}/restore       - Restore category from recycle bin
 *                                               Response: { data: Category, message: string }
 * 
 * - DELETE /api/categories/{id}/force-delete  - Permanently delete category (hard delete)
 *                                               Response: { message: string }
 * 
 * - POST   /api/subcategories/{id}/restore    - Restore subcategory from recycle bin
 *                                               Response: { data: Subcategory, message: string }
 * 
 * - DELETE /api/subcategories/{id}/force-delete - Permanently delete subcategory (hard delete)
 *                                                 Response: { message: string }
 * 
 * BUSINESS RULES FOR SOFT DELETE:
 * 1. Categories deleted are sent to recycle bin for 30 days
 * 2. Associated products are automatically reassigned to "Otros" category
 * 3. "Otros" category is default and cannot be deleted (validation in backend)
 * 4. After 30 days, automatic permanent deletion via Laravel Scheduler
 * 5. Same rules apply to subcategories
 */

export const categoriesService = {
  /**
   * Get all categories with subcategories
   *
   * 🔗 CONEXIÓN LARAVEL: GET /api/v1/categories
   * Response: Category[]
   */
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES);
      const categories = transformLaravelCategories(response.data);

      return {
        data: categories,
        message: 'Categories retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get category by ID
   *
   * 🔗 CONEXIÓN LARAVEL: GET /api/v1/categories/{id}
   * Response: Category
   */
  async getById(id: string): Promise<ApiResponse<Category>> {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORY_DETAIL(id));
      const category = transformLaravelCategory(response.data);

      return {
        data: category,
        message: 'Category retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  /**
   * Create new category
   *
   * 🔗 CONEXIÓN LARAVEL: POST /api/v1/categories
   * Request: { name: string, description?: string, parent_id?: number, level?: number, order?: number, is_active?: boolean }
   * Response: Category
   */
  async create(data: CreateCategoryDto): Promise<ApiResponse<Category>> {
    try {
      const payload = transformToLaravelPayload(data);
      const response = await api.post(API_ENDPOINTS.CATEGORIES, payload);
      const category = transformLaravelCategory(response.data);

      return {
        data: category,
        message: 'Category created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update category
   *
   * 🔗 CONEXIÓN LARAVEL: PUT /api/v1/categories/{id}
   * Request: { name?: string, description?: string, parent_id?: number, level?: number, order?: number, is_active?: boolean }
   * Response: Category
   */
  async update(id: string, data: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    try {
      const payload = transformToLaravelPayload(data);
      const response = await api.put(API_ENDPOINTS.CATEGORY_DETAIL(id), payload);
      const category = transformLaravelCategory(response.data);

      return {
        data: category,
        message: 'Category updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  /**
   * Delete category (soft delete)
   *
   * 🔗 CONEXIÓN LARAVEL: DELETE /api/v1/categories/{id}
   * Response: { message: string }
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(API_ENDPOINTS.CATEGORY_DETAIL(id));

      return {
        data: undefined as void,
        message: response.data.message || 'Category deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  /**
   * Reorder categories (drag & drop)
   *
   * 🔗 CONEXIÓN LARAVEL: PUT /api/v1/categories/reorder
   * Request: { categories: Array<{ id: number, order: number }> }
   * Response: Category[] or { data: Category[] } or { message: string }
   */
  async reorder(data: ReorderCategoriesDto): Promise<ApiResponse<Category[]>> {
    try {
      // Transform string IDs to numbers for Laravel
      const payload = {
        categories: data.categories.map(item => ({
          id: Number(item.id),
          order: item.order,
        })),
      };

      const response = await api.put(API_ENDPOINTS.CATEGORIES_REORDER, payload);

      // Handle different response formats from Laravel
      let categoriesData;
      if (Array.isArray(response.data)) {
        // Direct array
        categoriesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Wrapped in data property
        categoriesData = response.data.data;
      } else if (response.data?.categories && Array.isArray(response.data.categories)) {
        // Wrapped in categories property
        categoriesData = response.data.categories;
      } else {
        // If backend only returns success message, return empty array
        console.warn('Reorder response does not contain categories array:', response.data);
        return {
          data: [],
          message: response.data?.message || 'Categories reordered successfully',
          timestamp: new Date().toISOString(),
        };
      }

      const categories = transformLaravelCategories(categoriesData);

      return {
        data: categories,
        message: response.data?.message || 'Categories reordered successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  },

  /**
   * Create new subcategory
   *
   * 🔗 CONEXIÓN LARAVEL: POST /api/v1/categories
   * Note: Subcategories are categories with parent_id set
   * Request: { name: string, description?: string, parent_id: number, level: 1 }
   * Response: Category
   */
  async createSubcategory(categoryId: string, data: CreateSubcategoryDto): Promise<ApiResponse<Subcategory>> {
    try {
      // Create as a category with parent_id
      const categoryData: CreateCategoryDto = {
        name: data.name,
        description: data.description,
        parent_id: categoryId,
        level: 1,
        is_active: true,
      };

      const response = await this.create(categoryData);

      // Convert to Subcategory format for backward compatibility
      const subcategory: Subcategory = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        order: response.data.order,
        slug: response.data.slug,
        parent_id: response.data.parent_id || undefined,
        level: response.data.level,
      };

      return {
        data: subcategory,
        message: 'Subcategory created successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  },

  /**
   * Update subcategory
   *
   * 🔗 CONEXIÓN LARAVEL: PUT /api/v1/categories/{id}
   * Note: Subcategories are categories with parent_id set
   * Request: { name?: string, description?: string, parent_id?: number, order?: number }
   * Response: Category
   */
  async updateSubcategory(
    categoryId: string,
    subcategoryId: string,
    data: UpdateSubcategoryDto & { newCategoryId?: string }
  ): Promise<ApiResponse<Subcategory>> {
    try {
      // Update as a category
      const updateData: UpdateCategoryDto = {
        name: data.name,
        description: data.description,
        order: data.order,
        level: 1, // Subcategories are always level 1
      };

      // If moving to new category, update parent_id
      if (data.newCategoryId && data.newCategoryId !== categoryId) {
        updateData.parent_id = data.newCategoryId;
      }

      const response = await this.update(subcategoryId, updateData);

      // Convert to Subcategory format for backward compatibility
      const subcategory: Subcategory = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        order: response.data.order,
        slug: response.data.slug,
        parent_id: response.data.parent_id || undefined,
        level: response.data.level,
      };

      return {
        data: subcategory,
        message: 'Subcategory updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    }
  },

  /**
   * Delete subcategory
   *
   * 🔗 CONEXIÓN LARAVEL: DELETE /api/v1/categories/{id}
   * Note: Subcategories are categories with parent_id set
   * Response: { message: string }
   */
  async deleteSubcategory(categoryId: string, subcategoryId: string): Promise<ApiResponse<void>> {
    try {
      // Delete as a category (soft delete)
      return await this.delete(subcategoryId);
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  },

  /**
   * Get deleted categories and subcategories from recycle bin
   *
   * 🔗 CONEXIÓN LARAVEL: GET /api/v1/categories/recycle-bin
   * Response: Category[] (includes both categories and subcategories with deleted_at)
   */
  async getRecycleBin(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES_RECYCLE_BIN);
      const categories = transformLaravelCategories(response.data);

      return {
        data: categories,
        message: 'Deleted categories retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching recycle bin:', error);
      throw error;
    }
  },

  /**
   * Restore category from recycle bin (soft delete)
   *
   * 🔗 CONEXIÓN LARAVEL: POST /api/v1/categories/{id}/restore
   * Response: { message: string, category: Category }
   */
  async restore(id: string): Promise<ApiResponse<Category>> {
    try {
      const response = await api.post(API_ENDPOINTS.CATEGORY_RESTORE(id));
      const category = transformLaravelCategory(response.data.category || response.data);

      return {
        data: category,
        message: response.data.message || 'Category restored successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error restoring category:', error);
      throw error;
    }
  },

  /**
   * Permanently delete category (force delete)
   *
   * 🔗 CONEXIÓN LARAVEL: DELETE /api/v1/categories/{id}/force
   * Response: { message: string }
   */
  async forceDelete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(API_ENDPOINTS.CATEGORY_FORCE_DELETE(id));

      return {
        data: undefined as void,
        message: response.data.message || 'Category permanently deleted',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error force deleting category:', error);
      throw error;
    }
  },
};

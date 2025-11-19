/**
 * Categories Service
 * API service for category and subcategory operations
 */

import type { Category, Subcategory, CreateCategoryDto, UpdateCategoryDto, CreateSubcategoryDto, UpdateSubcategoryDto, ReorderCategoriesDto } from '../types';
import type { ApiResponse } from '@/api/types';
import { STORAGE_KEYS } from '@/config';

// localStorage helpers
const getItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};
const setItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};
const localStorageAdapter = { getItem, setItem };

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
   * 🔗 CONEXIÓN LARAVEL: GET /api/categories
   * Response: { data: Category[], timestamp: string }
   */
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
      // return response;

      // Fallback: Read from localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      return {
        data: categories,
        message: 'Categories retrieved from local storage',
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
   * 🔗 CONEXIÓN LARAVEL: GET /api/categories/{id}
   * Response: { data: Category, timestamp: string }
   */
  async getById(id: string): Promise<ApiResponse<Category>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
      // return response;

      // Fallback: Read from localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      const category = categories.find(c => c.id === id);
      
      if (!category) {
        throw new Error('Category not found');
      }

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
   * 🔗 CONEXIÓN LARAVEL: POST /api/categories
   * Request: { name: string, description?: string }
   * Response: { data: Category, message: string, timestamp: string }
   */
  async create(data: CreateCategoryDto): Promise<ApiResponse<Category>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
      // return response;

      // Fallback: Save to localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: data.name,
        description: data.description,
        order: data.order ?? categories.length + 1,
        slug,
        parent_id: data.parent_id ?? null,
        level: data.level ?? 0,
        is_protected: false,
        is_active: data.is_active ?? true,
        subcategories: [],
        children: [],
        isExpanded: false,
      };

      localStorageAdapter.setItem(STORAGE_KEYS.categories, [...categories, newCategory]);

      return {
        data: newCategory,
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
   * 🔗 CONEXIÓN LARAVEL: PUT /api/categories/{id}
   * Request: { name?: string, description?: string, order?: number }
   * Response: { data: Category, message: string, timestamp: string }
   */
  async update(id: string, data: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
      // return response;

      // Fallback: Update in localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      const updatedCategories = categories.map(c => {
        if (c.id === id) {
          const updatedCategory = { ...c, ...data };
          
          // Regenerate slug if name changed
          if (data.name && data.name !== c.name) {
            updatedCategory.slug = data.name
              .toLowerCase()
              .trim()
              .replace(/[áàäâ]/g, 'a')
              .replace(/[éèëê]/g, 'e')
              .replace(/[íìïî]/g, 'i')
              .replace(/[óòöô]/g, 'o')
              .replace(/[úùüû]/g, 'u')
              .replace(/ñ/g, 'n')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '');
          }
          
          return updatedCategory;
        }
        return c;
      });

      localStorageAdapter.setItem(STORAGE_KEYS.categories, updatedCategories);

      const updatedCategory = updatedCategories.find(c => c.id === id);
      if (!updatedCategory) {
        throw new Error('Category not found');
      }

      return {
        data: updatedCategory,
        message: 'Category updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  /**
   * Delete category
   * 
   * 🔗 CONEXIÓN LARAVEL: DELETE /api/categories/{id}
   * Response: { message: string, timestamp: string }
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
      // return response;

      // Fallback: Delete from localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      const filteredCategories = categories.filter(c => c.id !== id);

      localStorageAdapter.setItem(STORAGE_KEYS.categories, filteredCategories);

      return {
        data: undefined as void,
        message: 'Category deleted successfully',
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
   * 🔗 CONEXIÓN LARAVEL: POST /api/categories/reorder
   * Request: { order: string[] } - Array de IDs en el nuevo orden
   * Response: { data: Category[], message: string, timestamp: string }
   */
  async reorder(data: ReorderCategoriesDto): Promise<ApiResponse<Category[]>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.post<ApiResponse<Category[]>>('/categories/reorder', data);
      // return response;

      // Fallback: Update order in localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      
      // Support both old format (order: string[]) and new format (categories: {id, order}[])
      let reorderedCategories: Category[];
      
      if (data.categories) {
        // New format
        reorderedCategories = data.categories.map(item => {
          const category = categories.find(c => c.id === item.id);
          return category ? { ...category, order: item.order } : null;
        }).filter((c): c is Category => c !== null);
      } else if (data.order) {
        // Old format (backward compatibility)
        reorderedCategories = data.order.map((id, index) => {
          const category = categories.find(c => c.id === id);
          return category ? { ...category, order: index + 1 } : null;
        }).filter((c): c is Category => c !== null);
      } else {
        throw new Error('Invalid reorder data format');
      }

      localStorageAdapter.setItem(STORAGE_KEYS.categories, reorderedCategories);

      return {
        data: reorderedCategories,
        message: 'Categories reordered successfully',
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
   * 🔗 CONEXIÓN LARAVEL: POST /api/subcategories
   * Request: { name: string, description?: string, category_id: string }
   * Response: { data: Subcategory, message: string, timestamp: string }
   */
  async createSubcategory(categoryId: string, data: CreateSubcategoryDto): Promise<ApiResponse<Subcategory>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.post<ApiResponse<Subcategory>>('/subcategories', {
      //   ...data,
      //   category_id: categoryId,
      // });
      // return response;

      // Fallback: Save to localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      const category = categories.find(c => c.id === categoryId);

      if (!category) {
        throw new Error('Category not found');
      }

      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newSubcategory: Subcategory = {
        id: `sub-${Date.now()}`,
        name: data.name,
        description: data.description,
        order: category.subcategories.length + 1,
        slug: `${category.slug}/${slug}`,
      };

      const updatedCategories = categories.map(c => 
        c.id === categoryId 
          ? { ...c, subcategories: [...c.subcategories, newSubcategory] }
          : c
      );

      localStorageAdapter.setItem(STORAGE_KEYS.categories, updatedCategories);

      return {
        data: newSubcategory,
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
   * 🔗 CONEXIÓN LARAVEL: PUT /api/subcategories/{id}
   * Request: { name?: string, description?: string, category_id?: string, order?: number }
   * Response: { data: Subcategory, message: string, timestamp: string }
   */
  async updateSubcategory(
    categoryId: string, 
    subcategoryId: string, 
    data: UpdateSubcategoryDto & { newCategoryId?: string }
  ): Promise<ApiResponse<Subcategory>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.put<ApiResponse<Subcategory>>(`/subcategories/${subcategoryId}`, data);
      // return response;

      // Fallback: Update in localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      let updatedSubcategory: Subcategory | null = null;

      const updatedCategories = categories.map(c => {
        if (c.id === categoryId) {
          // Remove from current category if moving
          if (data.newCategoryId && data.newCategoryId !== categoryId) {
            return {
              ...c,
              subcategories: c.subcategories.filter(s => s.id !== subcategoryId),
            };
          }

          // Update in current category
          return {
            ...c,
            subcategories: c.subcategories.map(s => {
              if (s.id === subcategoryId) {
                updatedSubcategory = { ...s, ...data };
                
                // Regenerate slug if name changed
                if (data.name && data.name !== s.name) {
                  const slug = data.name
                    .toLowerCase()
                    .trim()
                    .replace(/[áàäâ]/g, 'a')
                    .replace(/[éèëê]/g, 'e')
                    .replace(/[íìïî]/g, 'i')
                    .replace(/[óòöô]/g, 'o')
                    .replace(/[úùüû]/g, 'u')
                    .replace(/ñ/g, 'n')
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                  updatedSubcategory.slug = `${c.slug}/${slug}`;
                }
                
                return updatedSubcategory;
              }
              return s;
            }),
          };
        }

        // Add to new category if moving
        if (data.newCategoryId && c.id === data.newCategoryId && updatedSubcategory) {
          return {
            ...c,
            subcategories: [...c.subcategories, updatedSubcategory],
          };
        }

        return c;
      });

      localStorageAdapter.setItem(STORAGE_KEYS.categories, updatedCategories);

      if (!updatedSubcategory) {
        throw new Error('Subcategory not found');
      }

      return {
        data: updatedSubcategory,
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
   * 🔗 CONEXIÓN LARAVEL: DELETE /api/subcategories/{id}
   * Response: { message: string, timestamp: string }
   */
  async deleteSubcategory(categoryId: string, subcategoryId: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.delete<ApiResponse<void>>(`/subcategories/${subcategoryId}`);
      // return response;

      // Fallback: Delete from localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      
      const updatedCategories = categories.map(c => 
        c.id === categoryId
          ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subcategoryId) }
          : c
      );

      localStorageAdapter.setItem(STORAGE_KEYS.categories, updatedCategories);

      return {
        data: undefined as void,
        message: 'Subcategory deleted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  },

  /**
   * Restore category from recycle bin (soft delete)
   * 
   * 🔗 CONEXIÓN LARAVEL: POST /api/v1/categories/{id}/restore
   * Response (Laravel direct): { message: string, category: Category }
   * Note: Laravel returns direct object, not wrapped in ApiResponse
   */
  async restore(id: string): Promise<ApiResponse<Category>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.post<{ message: string; category: Category }>(`/categories/${id}/restore`);
      // return {
      //   data: response.category,
      //   message: response.message,
      //   timestamp: new Date().toISOString(),
      // };

      // Fallback: Remove deleted_at from localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      const restoredCategories = categories.map(c => {
        if (c.id === id) {
          const { deleted_at, ...restored } = c;
          return restored as Category;
        }
        return c;
      });

      localStorageAdapter.setItem(STORAGE_KEYS.categories, restoredCategories);

      const restoredCategory = restoredCategories.find(c => c.id === id);
      if (!restoredCategory) {
        throw new Error('Category not found');
      }

      return {
        data: restoredCategory,
        message: 'Category restored successfully',
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
   * Response (Laravel direct): { message: string }
   * Note: Laravel returns direct object, not wrapped in ApiResponse
   */
  async forceDelete(id: string): Promise<ApiResponse<void>> {
    try {
      // TODO: Descomentar cuando Laravel esté listo
      // const response = await apiClient.delete<{ message: string }>(`/categories/${id}/force`);
      // return {
      //   data: undefined as void,
      //   message: response.message,
      //   timestamp: new Date().toISOString(),
      // };

      // Fallback: Permanently delete from localStorage
      const categories = localStorageAdapter.getItem<Category[]>(STORAGE_KEYS.categories) || [];
      const filteredCategories = categories.filter(c => c.id !== id);

      localStorageAdapter.setItem(STORAGE_KEYS.categories, filteredCategories);

      return {
        data: undefined as void,
        message: 'Category permanently deleted',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error force deleting category:', error);
      throw error;
    }
  },
};

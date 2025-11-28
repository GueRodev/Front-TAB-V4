/**
 * Categories Context
 * Manages product categories and subcategories with Laravel API integration
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Category, Subcategory, CreateCategoryDto, UpdateCategoryDto, CreateSubcategoryDto, UpdateSubcategoryDto } from '../types';
import { categoriesService } from '../services';
import { STORAGE_KEYS } from '@/config';
import { useAuth } from '@/features/auth';

// Re-export types for backward compatibility
export type { Category, Subcategory } from '../types';

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  deletedCount: number; // Optimistic counter for recycle bin badge
  setCategories: (categories: Category[]) => void;
  syncWithAPI: () => Promise<void>;
  addCategory: (data: CreateCategoryDto) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryDto) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  restoreCategory: (id: string) => Promise<Category>;
  forceDeleteCategory: (id: string) => Promise<void>;
  addSubcategory: (categoryId: string, data: CreateSubcategoryDto) => Promise<Subcategory>;
  updateSubcategory: (categoryId: string, subcategoryId: string, data: UpdateSubcategoryDto & { newCategoryId?: string }) => Promise<Subcategory>;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => Promise<void>;
  reorderCategories: (categories: Category[]) => Promise<void>;
  refreshDeletedCount: () => Promise<void>; // Refresh deleted count from API
}

// Default context value to prevent undefined errors during initialization
const defaultContextValue: CategoriesContextType = {
  categories: [],
  loading: false,
  deletedCount: 0,
  setCategories: () => {},
  syncWithAPI: async () => {},
  addCategory: async () => ({
    id: '',
    name: '',
    slug: '',
    order: 0,
    parent_id: null,
    level: 0,
    is_protected: false,
    is_active: true,
    subcategories: [],
    children: [],
  }),
  updateCategory: async () => ({
    id: '',
    name: '',
    slug: '',
    order: 0,
    parent_id: null,
    level: 0,
    is_protected: false,
    is_active: true,
    subcategories: [],
    children: [],
  }),
  deleteCategory: async () => {},
  restoreCategory: async () => ({
    id: '',
    name: '',
    slug: '',
    order: 0,
    parent_id: null,
    level: 0,
    is_protected: false,
    is_active: true,
    subcategories: [],
    children: [],
  }),
  forceDeleteCategory: async () => {},
  addSubcategory: async () => ({ id: '', name: '', slug: '', order: 0 }),
  updateSubcategory: async () => ({ id: '', name: '', slug: '', order: 0 }),
  deleteSubcategory: async () => {},
  reorderCategories: async () => {},
  refreshDeletedCount: async () => {},
};

const CategoriesContext = createContext<CategoriesContextType>(defaultContextValue);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const { user } = useAuth();

  // Check if user is admin or moderator
  const isAdmin = user?.role === 'admin' || user?.role === 'moderador';

  // Load categories from API on mount
  useEffect(() => {
    syncWithAPI();
    // Only fetch recycle bin count if user is admin
    if (isAdmin) {
      refreshDeletedCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  /**
   * Sync categories with Laravel API
   * 🔗 CONEXIÓN LARAVEL: Loads categories from backend
   */
  const syncWithAPI = async () => {
    setLoading(true);
    try {
      const response = await categoriesService.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error syncing categories:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh deleted count from API
   * 🔗 CONEXIÓN LARAVEL: GET /api/v1/categories/recycle-bin (count only)
   */
  const refreshDeletedCount = async () => {
    try {
      const response = await categoriesService.getRecycleBin();
      setDeletedCount(response.data.length);
    } catch (error) {
      console.error('Error refreshing deleted count:', error);
      // Don't throw - this is a background operation
    }
  };

  /**
   * Add new category
   * 🔗 CONEXIÓN LARAVEL: POST /api/v1/categories
   */
  const addCategory = async (data: CreateCategoryDto): Promise<Category> => {
    setLoading(true);
    try {
      const response = await categoriesService.create(data);
      const newCategory = response.data;
      // Reload from API to get the full hierarchical structure
      await syncWithAPI();
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing category
   * 🔗 CONEXIÓN LARAVEL: PUT /api/v1/categories/{id}
   */
  const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    setLoading(true);
    try {
      const response = await categoriesService.update(id, data);
      const updatedCategory = response.data;
      // Reload from API to ensure consistency
      await syncWithAPI();
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete category (soft delete)
   * 🔗 CONEXIÓN LARAVEL: DELETE /api/v1/categories/{id}
   */
  const deleteCategory = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await categoriesService.delete(id);
      // Optimistically increment deleted count
      setDeletedCount(prev => prev + 1);
      // Reload from API to update the list
      await syncWithAPI();
    } catch (error) {
      console.error('Error deleting category:', error);
      // Revert optimistic update on error
      await refreshDeletedCount();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add new subcategory
   * 🔗 CONEXIÓN LARAVEL: POST /api/v1/categories (with parent_id)
   */
  const addSubcategory = async (categoryId: string, data: CreateSubcategoryDto): Promise<Subcategory> => {
    setLoading(true);
    try {
      const response = await categoriesService.createSubcategory(categoryId, data);
      const newSubcategory = response.data;
      // Reload from API to get the full hierarchical structure
      await syncWithAPI();
      return newSubcategory;
    } catch (error) {
      console.error('Error adding subcategory:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing subcategory
   * 🔗 CONEXIÓN LARAVEL: PUT /api/v1/categories/{id}
   */
  const updateSubcategory = async (
    categoryId: string,
    subcategoryId: string,
    data: UpdateSubcategoryDto & { newCategoryId?: string }
  ): Promise<Subcategory> => {
    setLoading(true);
    try {
      const response = await categoriesService.updateSubcategory(categoryId, subcategoryId, data);
      const updatedSubcategory = response.data;
      // Reload from API to ensure consistency
      await syncWithAPI();
      return updatedSubcategory;
    } catch (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete subcategory (soft delete)
   * 🔗 CONEXIÓN LARAVEL: DELETE /api/v1/categories/{id}
   */
  const deleteSubcategory = async (categoryId: string, subcategoryId: string): Promise<void> => {
    setLoading(true);
    try {
      await categoriesService.deleteSubcategory(categoryId, subcategoryId);
      // Optimistically increment deleted count
      setDeletedCount(prev => prev + 1);
      // Reload from API to update the list
      await syncWithAPI();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      // Revert optimistic update on error
      await refreshDeletedCount();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Restore category from recycle bin
   * 🔗 CONEXIÓN LARAVEL: POST /api/v1/categories/{id}/restore
   */
  const restoreCategory = async (id: string): Promise<Category> => {
    setLoading(true);
    try {
      const response = await categoriesService.restore(id);
      const restoredCategory = response.data;
      // Optimistically decrement deleted count
      setDeletedCount(prev => Math.max(0, prev - 1));
      // Reload from API to update the list
      await syncWithAPI();
      return restoredCategory;
    } catch (error) {
      console.error('Error restoring category:', error);
      // Revert optimistic update on error
      await refreshDeletedCount();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Permanently delete category (force delete)
   * 🔗 CONEXIÓN LARAVEL: DELETE /api/v1/categories/{id}/force
   */
  const forceDeleteCategory = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await categoriesService.forceDelete(id);
      // Optimistically decrement deleted count
      setDeletedCount(prev => Math.max(0, prev - 1));
      // Reload from API to update the list
      await syncWithAPI();
    } catch (error) {
      console.error('Error force deleting category:', error);
      // Revert optimistic update on error
      await refreshDeletedCount();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reorder categories (drag & drop)
   * 🔗 CONEXIÓN LARAVEL: PUT /api/v1/categories/reorder
   */
  const reorderCategories = async (newCategories: Category[]): Promise<void> => {
    setLoading(true);
    try {
      await categoriesService.reorder({
        categories: newCategories.map((cat, index) => ({
          id: cat.id,
          order: index + 1,
        })),
      });
      // Reload from API to get updated order
      await syncWithAPI();
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CategoriesContext.Provider value={{
      categories,
      loading,
      deletedCount,
      setCategories,
      syncWithAPI,
      addCategory,
      updateCategory,
      deleteCategory,
      restoreCategory,
      forceDeleteCategory,
      addSubcategory,
      updateSubcategory,
      deleteSubcategory,
      reorderCategories,
      refreshDeletedCount,
    }}>
      {children}
    </CategoriesContext.Provider>
  );
};

/**
 * Hook to access categories context
 * Must be used within CategoriesProvider
 */
export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context || context === defaultContextValue) {
    // If we're getting the default context, log a warning but don't crash
    console.warn('useCategories: Using default context. Make sure component is wrapped in CategoriesProvider');
  }
  return context;
};

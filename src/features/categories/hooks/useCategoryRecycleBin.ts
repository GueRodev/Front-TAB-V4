/**
 * useCategoryRecycleBin Hook
 * Business logic for managing deleted categories in recycle bin
 */

import { useMemo, useState, useEffect } from 'react';
import { useCategories } from '../contexts';
import { categoriesService } from '../services';
import { toast } from '@/hooks/use-toast';
import type { Category } from '../types';

interface UseCategoryRecycleBinOptions {
  /**
   * If true, will reload deleted categories when this value changes to true
   * Useful for reloading when the recycle bin modal/section is opened
   */
  isVisible?: boolean;
}

export const useCategoryRecycleBin = (options?: UseCategoryRecycleBinOptions) => {
  const { restoreCategory, forceDeleteCategory } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const isVisible = options?.isVisible;

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    categoryId: string;
    categoryName: string;
    action: 'restore' | 'force-delete';
  }>({
    open: false,
    categoryId: '',
    categoryName: '',
    action: 'restore',
  });

  /**
   * Load deleted categories from API on mount and when visibility changes
   */
  useEffect(() => {
    // Load on mount
    loadDeletedCategories();
  }, []);

  /**
   * Reload when recycle bin becomes visible
   */
  useEffect(() => {
    if (isVisible) {
      loadDeletedCategories();
    }
  }, [isVisible]);

  /**
   * Load deleted categories from the API
   */
  const loadDeletedCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoriesService.getRecycleBin();
      setDeletedCategories(response.data);
    } catch (error) {
      console.error('Error loading deleted categories:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las categorías eliminadas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Count of deleted categories
   */
  const deletedCount = deletedCategories.length;

  /**
   * Open restore confirmation dialog
   */
  const openRestoreDialog = (category: Category) => {
    setConfirmDialog({
      open: true,
      categoryId: category.id,
      categoryName: category.name,
      action: 'restore',
    });
  };

  /**
   * Open force delete confirmation dialog
   */
  const openForceDeleteDialog = (category: Category) => {
    setConfirmDialog({
      open: true,
      categoryId: category.id,
      categoryName: category.name,
      action: 'force-delete',
    });
  };

  /**
   * Close confirmation dialog
   */
  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      categoryId: '',
      categoryName: '',
      action: 'restore',
    });
  };

  /**
   * Confirm restore action
   */
  const confirmRestore = async () => {
    setIsLoading(true);
    try {
      await restoreCategory(confirmDialog.categoryId);
      toast({
        title: 'Éxito',
        description: `La categoría "${confirmDialog.categoryName}" ha sido restaurada exitosamente`,
      });
      closeConfirmDialog();
      await loadDeletedCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo restaurar la categoría',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Confirm force delete action
   */
  const confirmForceDelete = async () => {
    setIsLoading(true);
    try {
      await forceDeleteCategory(confirmDialog.categoryId);
      toast({
        title: 'Éxito',
        description: `La categoría "${confirmDialog.categoryName}" ha sido eliminada permanentemente`,
      });
      closeConfirmDialog();
      await loadDeletedCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar permanentemente la categoría',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle confirm action based on dialog action type
   */
  const handleConfirm = async () => {
    if (confirmDialog.action === 'restore') {
      await confirmRestore();
    } else {
      await confirmForceDelete();
    }
  };

  /**
   * Get category by ID from recycle bin
   */
  const getDeletedCategory = (id: string): Category | undefined => {
    return deletedCategories.find(c => c.id === id);
  };

  /**
   * Check if category is in recycle bin
   */
  const isInRecycleBin = (id: string): boolean => {
    return deletedCategories.some(c => c.id === id);
  };

  /**
   * Get categories that will be auto-deleted soon (deleted > 25 days ago)
   */
  const expiringCategories = useMemo(() => {
    const twentyFiveDaysAgo = new Date();
    twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);

    return deletedCategories.filter(cat => {
      if (!cat.deleted_at) return false;
      const deletedDate = new Date(cat.deleted_at);
      return deletedDate <= twentyFiveDaysAgo;
    });
  }, [deletedCategories]);

  return {
    // Data
    deletedCategories,
    deletedCount,
    expiringCategories,
    isLoading,

    // Confirmation dialog
    confirmDialog,
    openRestoreDialog,
    openForceDeleteDialog,
    closeConfirmDialog,
    handleConfirm,

    // Actions
    loadDeletedCategories,

    // Utilities
    getDeletedCategory,
    isInRecycleBin,
  };
};

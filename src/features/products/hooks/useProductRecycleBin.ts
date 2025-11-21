/**
 * Product Recycle Bin Hook
 * Manages deleted products with restore and permanent deletion
 * ✅ Implements lazy loading - only loads when visible
 */

import { useState, useEffect } from 'react';
import { useProducts } from '../contexts';
import type { Product } from '../types';
import { toast } from 'sonner';

interface UseProductRecycleBinOptions {
  isVisible?: boolean; // For lazy loading - only load when tab is visible
}

export const useProductRecycleBin = (options?: UseProductRecycleBinOptions) => {
  const { getDeletedProducts, restoreProduct, forceDeleteProduct, loading } = useProducts();
  const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const isVisible = options?.isVisible ?? false;

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
    action: 'restore' | 'force-delete';
  }>({
    open: false,
    productId: '',
    productName: '',
    action: 'restore',
  });

  // Load deleted products
  const loadDeletedProducts = async () => {
    setIsLoadingDeleted(true);
    try {
      const deleted = await getDeletedProducts();
      setDeletedProducts(deleted);
      setHasLoadedOnce(true);
    } catch (error) {
      console.error('Error loading deleted products:', error);
      toast.error('Error al cargar productos eliminados');
    } finally {
      setIsLoadingDeleted(false);
    }
  };

  // Lazy loading: only load when visible for the first time
  useEffect(() => {
    if (isVisible && !hasLoadedOnce) {
      loadDeletedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  // Open restore confirmation
  const openRestoreDialog = (product: Product) => {
    setConfirmDialog({
      open: true,
      productId: product.id,
      productName: product.name,
      action: 'restore',
    });
  };

  // Open force delete confirmation
  const openForceDeleteDialog = (product: Product) => {
    setConfirmDialog({
      open: true,
      productId: product.id,
      productName: product.name,
      action: 'force-delete',
    });
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      productId: '',
      productName: '',
      action: 'restore',
    });
  };

  // Confirm restore
  const confirmRestore = async () => {
    try {
      await restoreProduct(confirmDialog.productId);
      
      // Remove from deleted list
      setDeletedProducts(prev =>
        prev.filter(p => p.id !== confirmDialog.productId)
      );
      
      toast.success(`Producto "${confirmDialog.productName}" restaurado exitosamente`);
      closeConfirmDialog();
    } catch (error) {
      console.error('Error restoring product:', error);
      toast.error('Error al restaurar el producto');
    }
  };

  // Confirm force delete
  const confirmForceDelete = async () => {
    try {
      await forceDeleteProduct(confirmDialog.productId);
      
      // Remove from deleted list
      setDeletedProducts(prev =>
        prev.filter(p => p.id !== confirmDialog.productId)
      );
      
      toast.success(`Producto "${confirmDialog.productName}" eliminado permanentemente`);
      closeConfirmDialog();
    } catch (error) {
      console.error('Error force deleting product:', error);
      toast.error('Error al eliminar permanentemente el producto');
    }
  };

  // Handle confirm action
  const handleConfirm = async () => {
    if (confirmDialog.action === 'restore') {
      await confirmRestore();
    } else {
      await confirmForceDelete();
    }
  };

  return {
    deletedProducts,
    isLoadingDeleted,
    loadingAction: loading,
    confirmDialog,
    openRestoreDialog,
    openForceDeleteDialog,
    closeConfirmDialog,
    handleConfirm,
    refreshDeleted: loadDeletedProducts,
  };
};

/**
 * Stock Management Hook
 * Provides stock adjustment functionality for admin UI
 */

import { useState } from 'react';
import type { Product } from '../types';

export const useStockManagement = () => {
  const [adjustStockDialog, setAdjustStockDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({
    open: false,
    product: null,
  });

  const [historyDialog, setHistoryDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({
    open: false,
    product: null,
  });

  const openAdjustStockDialog = (product: Product) => {
    setAdjustStockDialog({ open: true, product });
  };

  const closeAdjustStockDialog = () => {
    setAdjustStockDialog({ open: false, product: null });
  };

  const openHistoryDialog = (product: Product) => {
    setHistoryDialog({ open: true, product });
  };

  const closeHistoryDialog = () => {
    setHistoryDialog({ open: false, product: null });
  };

  return {
    adjustStockDialog,
    openAdjustStockDialog,
    closeAdjustStockDialog,
    historyDialog,
    openHistoryDialog,
    closeHistoryDialog,
  };
};

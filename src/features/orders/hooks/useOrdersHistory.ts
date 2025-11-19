/**
 * Orders History Business Logic Hook
 * Manages completed/cancelled orders and exports
 */

import { useOrders } from '../contexts';
import { exportOrdersToPDF, exportOrdersToExcel } from '../helpers';
import type { Order } from '../types';

interface UseOrdersHistoryReturn {
  completedOrders: Order[];
  handleExportPDF: () => void;
  handleExportExcel: () => void;
}

export const useOrdersHistory = (): UseOrdersHistoryReturn => {
  const { getCompletedOrders } = useOrders();
  
  const completedOrders = getCompletedOrders();

  const handleExportPDF = () => {
    exportOrdersToPDF(completedOrders);
  };

  const handleExportExcel = () => {
    exportOrdersToExcel(completedOrders);
  };

  return {
    completedOrders,
    handleExportPDF,
    handleExportExcel,
  };
};

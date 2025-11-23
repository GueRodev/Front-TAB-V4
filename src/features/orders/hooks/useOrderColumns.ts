/**
 * Order Columns Hook
 * Manages visible columns for orders table with localStorage persistence
 */

import { useState, useEffect } from 'react';

export interface OrderColumn {
  id: string;
  label: string;
  defaultVisible: boolean;
}

// All available columns for orders table
export const ORDER_COLUMNS: OrderColumn[] = [
  { id: 'id', label: 'ID', defaultVisible: true },
  { id: 'date', label: 'Fecha', defaultVisible: true },
  { id: 'customer', label: 'Cliente', defaultVisible: true },
  { id: 'phone', label: 'Teléfono', defaultVisible: false },
  { id: 'email', label: 'Email', defaultVisible: false },
  { id: 'type', label: 'Tipo', defaultVisible: true },
  { id: 'status', label: 'Estado', defaultVisible: true },
  { id: 'total', label: 'Total', defaultVisible: true },
  { id: 'payment', label: 'Pago', defaultVisible: true },
  { id: 'delivery', label: 'Entrega', defaultVisible: false },
  { id: 'products', label: 'Productos', defaultVisible: true },
  { id: 'notes', label: 'Notas', defaultVisible: false },
  { id: 'created_at', label: 'Fecha Creación', defaultVisible: false },
  { id: 'actions', label: 'Acciones', defaultVisible: true },
];

const STORAGE_KEY = 'order-visible-columns';

export const useOrderColumns = () => {
  // Initialize from localStorage or defaults
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading columns from localStorage:', e);
    }
    return ORDER_COLUMNS.filter(c => c.defaultVisible).map(c => c.id);
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch (e) {
      console.error('Error saving columns to localStorage:', e);
    }
  }, [visibleColumns]);

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnId)) {
        // Don't allow hiding essential columns
        if (columnId === 'id' || columnId === 'actions') {
          return prev;
        }
        return prev.filter(id => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  const isColumnVisible = (columnId: string) => visibleColumns.includes(columnId);

  const resetToDefaults = () => {
    setVisibleColumns(ORDER_COLUMNS.filter(c => c.defaultVisible).map(c => c.id));
  };

  return {
    visibleColumns,
    toggleColumn,
    isColumnVisible,
    resetToDefaults,
    allColumns: ORDER_COLUMNS,
  };
};

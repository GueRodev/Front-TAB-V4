/**
 * Product Columns Hook
 * Manages visible columns for products table with localStorage persistence
 */

import { useState, useEffect } from 'react';

export interface ProductColumn {
  id: string;
  label: string;
  defaultVisible: boolean;
  sortable?: boolean;
}

// All available columns for products table
export const PRODUCT_COLUMNS: ProductColumn[] = [
  { id: 'image', label: 'Imagen', defaultVisible: true },
  { id: 'name', label: 'Nombre', defaultVisible: true },
  { id: 'brand', label: 'Marca', defaultVisible: false },
  { id: 'sku', label: 'SKU', defaultVisible: false },
  { id: 'category', label: 'Categoría', defaultVisible: true },
  { id: 'subcategory', label: 'Subcategoría', defaultVisible: false },
  { id: 'price', label: 'Precio', defaultVisible: true },
  { id: 'stock', label: 'Stock', defaultVisible: true },
  { id: 'status', label: 'Estado', defaultVisible: true },
  { id: 'featured', label: 'Destacado', defaultVisible: true },
  { id: 'created_at', label: 'Fecha Creación', defaultVisible: false },
  { id: 'updated_at', label: 'Última Actualización', defaultVisible: false },
  { id: 'actions', label: 'Acciones', defaultVisible: true },
];

const STORAGE_KEY = 'product-visible-columns';

export const useProductColumns = () => {
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
    return PRODUCT_COLUMNS.filter(c => c.defaultVisible).map(c => c.id);
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
        // Don't allow hiding all columns - keep at least name and actions
        if (columnId === 'name' || columnId === 'actions') {
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
    setVisibleColumns(PRODUCT_COLUMNS.filter(c => c.defaultVisible).map(c => c.id));
  };

  return {
    visibleColumns,
    toggleColumn,
    isColumnVisible,
    resetToDefaults,
    allColumns: PRODUCT_COLUMNS,
  };
};

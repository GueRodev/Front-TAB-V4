/**
 * Products Context
 * Manages product catalog using productsService as single source of truth
 * Pattern aligned with OrdersContext for future Laravel integration
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, AdjustStockDto, CreateProductDto, UpdateProductDto } from '../types';
import { productsService } from '../services';
import { STORAGE_KEYS } from '@/config';
import { useAuth } from '@/features/auth';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProductsContextType {
  products: Product[];
  allProducts: Product[]; // Todos los productos sin paginación (para selectores)
  loading: boolean;
  deletedCount: number;
  pagination: PaginationInfo;
  refreshProducts: () => Promise<void>;
  refreshAllProducts: () => Promise<void>; // Cargar todos los productos
  goToPage: (page: number) => Promise<void>;
  addProduct: (product: CreateProductDto) => Promise<Product>;
  updateProduct: (id: string, product: UpdateProductDto) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  restoreProduct: (id: string) => Promise<Product>;
  forceDeleteProduct: (id: string) => Promise<void>;
  getDeletedProducts: () => Promise<Product[]>;
  adjustStock: (productId: string, dto: AdjustStockDto) => Promise<Product>;
  toggleFeatured: (productId: string, isFeatured: boolean) => Promise<Product>;
  getProductsByCategory: (categoryId: string) => Product[];
  getProductsBySubcategory: (subcategoryId: string) => Product[]; // Deprecated: use getProductsByCategory
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const defaultPagination: PaginationInfo = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 15,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Todos los productos sin paginación
  const [loading, setLoading] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationInfo>(defaultPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  // Function to load products for a specific page
  const loadProductsPage = useCallback(async (page: number): Promise<void> => {
    setLoading(true);
    try {
      const result = await productsService.getAll({ page, per_page: 15 });
      setProducts(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);

      // Only load deleted count if user is admin
      if (isAdmin) {
        const deletedResult = await productsService.getDeleted();
        setDeletedCount(deletedResult.data.length);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Function to refresh products (reload current page)
  const refreshProducts = async (): Promise<void> => {
    await loadProductsPage(currentPage);
    // También refrescar allProducts
    await refreshAllProducts();
  };

  // Function to load all products without pagination (for selectors/dropdowns)
  const refreshAllProducts = useCallback(async (): Promise<void> => {
    try {
      const result = await productsService.getAll({ per_page: 1000 }); // Cargar todos
      setAllProducts(result.data);
    } catch (error) {
      console.error('Error loading all products:', error);
    }
  }, []);

  // Function to go to a specific page
  const goToPage = async (page: number): Promise<void> => {
    if (page < 1 || page > pagination.totalPages) return;
    await loadProductsPage(page);
  };

  // Load products and deleted count on mount or when user changes
  useEffect(() => {
    loadProductsPage(1);
    refreshAllProducts(); // También cargar todos los productos
  }, [loadProductsPage, refreshAllProducts]);

  const addProduct = async (productData: CreateProductDto): Promise<Product> => {
    setLoading(true);
    try {
      // Call service to persist
      const response = await productsService.create(productData);
      const newProduct = response.data;
      
      // Update local state
      setProducts(prev => [...prev, newProduct]);
      
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: UpdateProductDto): Promise<Product> => {
    setLoading(true);
    try {
      // Call service to persist
      const response = await productsService.update(id, productData);
      const updatedProduct = response.data;
      
      // Update local state
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // Call service to persist
      await productsService.delete(id);

      // Update local state
      setProducts(prev => prev.filter(product => product.id !== id));

      // Increment deleted count
      setDeletedCount(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(product => 
      product.category_id === categoryId && product.status === 'active'
    );
  };

  const getProductsBySubcategory = (subcategoryId: string) => {
    // Deprecated: subcategories are now categories
    return products.filter(product => 
      product.category_id === subcategoryId && product.status === 'active'
    );
  };

  const restoreProduct = async (id: string): Promise<Product> => {
    setLoading(true);
    try {
      const response = await productsService.restore(id);
      const restoredProduct = response.data;

      // Add back to local state
      setProducts(prev => [...prev, restoredProduct]);

      // Decrement deleted count
      setDeletedCount(prev => Math.max(0, prev - 1));

      return restoredProduct;
    } catch (error) {
      console.error('Error restoring product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forceDeleteProduct = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await productsService.forceDelete(id);

      // Remove from local state (if exists)
      setProducts(prev => prev.filter(product => product.id !== id));

      // Decrement deleted count
      setDeletedCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error force deleting product:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDeletedProducts = async (): Promise<Product[]> => {
    setLoading(true);
    try {
      const response = await productsService.getDeleted();
      return response.data;
    } catch (error) {
      console.error('Error fetching deleted products:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (productId: string, dto: AdjustStockDto): Promise<Product> => {
    setLoading(true);
    try {
      const response = await productsService.adjustStock(productId, dto);
      const updatedProduct = response.data;

      // Update local state
      setProducts(prev =>
        prev.map(product =>
          product.id === productId ? updatedProduct : product
        )
      );

      return updatedProduct;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId: string, isFeatured: boolean): Promise<Product> => {
    try {
      const response = await productsService.toggleFeatured(productId, isFeatured);
      const updatedProduct = response.data;

      // Update local state
      setProducts(prev =>
        prev.map(product =>
          product.id === productId ? updatedProduct : product
        )
      );

      return updatedProduct;
    } catch (error) {
      console.error('Error toggling featured:', error);
      throw error;
    }
  };

  return (
    <ProductsContext.Provider value={{
      products,
      allProducts,
      loading,
      deletedCount,
      pagination,
      refreshProducts,
      refreshAllProducts,
      goToPage,
      addProduct,
      updateProduct,
      deleteProduct,
      restoreProduct,
      forceDeleteProduct,
      getDeletedProducts,
      adjustStock,
      toggleFeatured,
      getProductsByCategory,
      getProductsBySubcategory,
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

/**
 * Products Context
 * Manages product catalog using productsService as single source of truth
 * Pattern aligned with OrdersContext for future Laravel integration
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, AdjustStockDto } from '../types';
import { productsService } from '../services';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
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

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await productsService.getAll();
        setProducts(result.data); // Extract data from paginated response
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Product> => {
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

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
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
      loading,
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

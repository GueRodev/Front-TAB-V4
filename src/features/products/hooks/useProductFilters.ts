/**
 * useProductFilters
 * Business logic for filtering and searching products
 */

import { useState, useMemo } from 'react';
import type { Product } from '../types';

interface UseProductFiltersProps {
  products: Product[];
  includeInactive?: boolean; // For admin views
}

export const useProductFilters = ({ 
  products, 
  includeInactive = false 
}: UseProductFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: Infinity,
  });
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('newest');

  /**
   * Filter products by search query
   */
  const filterBySearch = (products: Product[]): Product[] => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(
      product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
    );
  };

  /**
   * Filter products by category
   */
  const filterByCategory = (products: Product[]): Product[] => {
    if (!selectedCategory) return products;
    return products.filter(product => product.category_id === selectedCategory);
  };

  /**
   * Filter products by price range
   */
  const filterByPriceRange = (products: Product[]): Product[] => {
    return products.filter(
      product => product.price >= priceRange.min && product.price <= priceRange.max
    );
  };

  /**
   * Sort products
   */
  const sortProducts = (products: Product[]): Product[] => {
    const sorted = [...products];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      default:
        return sorted;
    }
  };

  /**
   * Apply all filters and sorting
   */
  const filteredProducts = useMemo(() => {
    // For admin views, include all products. For public views, only active ones.
    let result = includeInactive 
      ? products 
      : products.filter(p => p.status === 'active');
    
    result = filterBySearch(result);
    result = filterByCategory(result);
    result = filterByPriceRange(result);
    result = sortProducts(result);

    return result;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy, includeInactive]);

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: 0, max: Infinity });
    setSortBy('newest');
  };

  /**
   * Get filter summary
   */
  const getFilterSummary = () => {
    return {
      hasActiveFilters: !!(searchQuery || selectedCategory || priceRange.max !== Infinity),
      resultCount: filteredProducts.length,
      totalCount: products.length,
    };
  };

  return {
    // Filter state
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,

    // Filter actions
    setSearchQuery,
    setSelectedCategory,
    setPriceRange,
    setSortBy,
    resetFilters,

    // Filtered data
    filteredProducts,
    
    // Utility
    getFilterSummary,
  };
};

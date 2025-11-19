/**
 * useCategoryPage
 * Business logic for category page (category/subcategory lookup, product filtering)
 */

import { useMemo } from 'react';
import { useProductOperations } from '@/features/products';

interface UseCategoryPageParams {
  categorySlug?: string;
  subcategorySlug?: string;
}

export const useCategoryPage = ({ categorySlug, subcategorySlug }: UseCategoryPageParams) => {
  const {
    categories,
    getProductsByCategory,
    getProductsBySubcategory,
    handleAddToCart,
    handleToggleWishlist,
    isProductInWishlist,
    findProductById,
  } = useProductOperations();

  /**
   * Find current category by slug
   */
  const currentCategory = useMemo(() => 
    categories.find(cat => cat.slug === categorySlug),
    [categories, categorySlug]
  );

  /**
   * Find current subcategory by slug if provided
   */
  const currentSubcategory = useMemo(() => {
    if (!subcategorySlug || !currentCategory) return undefined;
    return currentCategory.subcategories.find(sub => sub.slug === subcategorySlug);
  }, [currentCategory, subcategorySlug]);

  /**
   * Get products filtered by category or subcategory
   */
  const products = useMemo(() => {
    if (!currentCategory) return [];
    
    if (currentSubcategory) {
      return getProductsBySubcategory(currentSubcategory.id);
    }
    
    return getProductsByCategory(currentCategory.id);
  }, [currentCategory, currentSubcategory, getProductsByCategory, getProductsBySubcategory]);

  /**
   * Handle wishlist toggle with product lookup
   */
  const handleWishlistToggle = (e: React.MouseEvent, productId: string) => {
    const product = findProductById(productId);
    if (product) {
      handleToggleWishlist(product, e);
    }
  };

  /**
   * Handle add to cart with product lookup
   */
  const handleCartAdd = (e: React.MouseEvent, productId: string) => {
    const product = findProductById(productId);
    if (product) {
      handleAddToCart(product, e);
    }
  };

  return {
    // Data
    currentCategory,
    currentSubcategory,
    products,
    
    // Actions
    handleWishlistToggle,
    handleCartAdd,
    isProductInWishlist,
  };
};

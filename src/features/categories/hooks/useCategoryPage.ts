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
   * Find category or subcategory by slug
   * Handles both direct category access and subcategory access without parent slug
   */
  const { currentCategory, currentSubcategory } = useMemo(() => {
    // Case 1: Direct subcategory route - /category/:category/:subcategory
    if (subcategorySlug) {
      const parentCategory = categories.find(cat => cat.slug === categorySlug);
      if (parentCategory) {
        const subcategory = parentCategory.children?.find(sub => sub.slug === subcategorySlug);
        if (subcategory) {
          return { currentCategory: parentCategory, currentSubcategory: subcategory };
        }
      }
    }

    // Case 2: Try to find as a parent category first
    const directCategory = categories.find(cat => cat.slug === categorySlug);
    if (directCategory) {
      return { currentCategory: directCategory, currentSubcategory: undefined };
    }

    // Case 3: The slug might be a subcategory - search in all categories' children
    for (const category of categories) {
      const subcategory = category.children?.find(sub => sub.slug === categorySlug);
      if (subcategory) {
        return { currentCategory: category, currentSubcategory: subcategory };
      }
    }

    return { currentCategory: undefined, currentSubcategory: undefined };
  }, [categories, categorySlug, subcategorySlug]);

  /**
   * Get products filtered by category or subcategory
   * For parent categories, get all products including from subcategories
   */
  const products = useMemo(() => {
    if (!currentCategory) return [];

    if (currentSubcategory) {
      return getProductsBySubcategory(currentSubcategory.id);
    }

    // Get products from the parent category AND all its subcategories
    const parentProducts = getProductsByCategory(currentCategory.id);
    const childrenProducts = currentCategory.children?.flatMap(
      child => getProductsBySubcategory(child.id)
    ) || [];

    // Combine and remove duplicates (in case a product is in both)
    const allProducts = [...parentProducts, ...childrenProducts];
    const uniqueProducts = allProducts.filter(
      (product, index, self) => index === self.findIndex(p => p.id === product.id)
    );

    return uniqueProducts;
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

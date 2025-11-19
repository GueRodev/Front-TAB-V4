/**
 * useProductOperations
 * Business logic for product operations (add to cart, wishlist, filtering)
 */

import { useProducts } from '../contexts';
import { useCategories } from '@/features/categories';
import { useCart } from '@/features/cart';
import { useWishlist } from '@/features/wishlist';
import { toast } from '@/hooks/use-toast';
import type { Product } from '../types';

export const useProductOperations = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  /**
   * Get featured products (active and marked as featured)
   */
  const getFeaturedProducts = () => {
    return products.filter(
      product => product.is_featured && product.status === 'active'
    );
  };

  /**
   * Get active products by category
   */
  const getProductsByCategory = (categoryId: string) => {
    return products.filter(
      product => product.category_id === categoryId && product.status === 'active'
    );
  };

  /**
   * Get active products by subcategory (deprecated - use getProductsByCategory)
   */
  const getProductsBySubcategory = (subcategoryId: string) => {
    return products.filter(
      product => product.category_id === subcategoryId && product.status === 'active'
    );
  };

  /**
   * Get category slug by category ID
   */
  const getCategorySlug = (categoryId: string): string => {
    return categories.find(c => c.id === categoryId)?.slug || '';
  };

  /**
   * Add product to cart with validation
   */
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Validate stock
    if (product.stock === 0) {
      toast({
        title: 'Sin stock',
        description: 'Este producto no está disponible actualmente',
        variant: 'destructive',
      });
      return false;
    }

    addToCart({
      id: product.id,
      name: product.name,
      image: product.image_url || '',
      price: product.price,
    });

    return true;
  };

  /**
   * Toggle product in wishlist
   */
  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const categorySlug = getCategorySlug(product.category_id);

    toggleWishlist({
      id: product.id,
      name: product.name,
      image: product.image_url || '',
      price: product.price,
      category: categorySlug,
    });
  };

  /**
   * Check if product is in wishlist
   */
  const isProductInWishlist = (productId: string): boolean => {
    return isInWishlist(productId);
  };

  /**
   * Find product by ID
   */
  const findProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  return {
    // Data
    products,
    categories,
    
    // Getters
    getFeaturedProducts,
    getProductsByCategory,
    getProductsBySubcategory,
    getCategorySlug,
    findProductById,
    
    // Actions
    handleAddToCart,
    handleToggleWishlist,
    isProductInWishlist,
  };
};

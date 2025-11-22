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
   * Get category and subcategory names from a product
   */
  const getCategoryInfo = (product: Product) => {
    // If product has eager-loaded category relation
    if (product.category) {
      const category = product.category;
      // Find if this category has a parent (is a subcategory)
      const parentCategory = categories.find(c =>
        c.children?.some(child => child.id === category.id)
      );

      if (parentCategory) {
        return {
          categoryName: parentCategory.name,
          subcategoryName: category.name
        };
      }
      return {
        categoryName: category.name,
        subcategoryName: undefined
      };
    }

    // Fallback: search in categories
    for (const cat of categories) {
      if (cat.id === product.category_id) {
        return {
          categoryName: cat.name,
          subcategoryName: undefined
        };
      }
      const subcategory = cat.children?.find(child => child.id === product.category_id);
      if (subcategory) {
        return {
          categoryName: cat.name,
          subcategoryName: subcategory.name
        };
      }
    }

    return { categoryName: getCategorySlug(product.category_id), subcategoryName: undefined };
  };

  /**
   * Toggle product in wishlist
   */
  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const { categoryName, subcategoryName } = getCategoryInfo(product);

    toggleWishlist({
      id: product.id,
      name: product.name,
      image: product.image_url || '',
      price: product.price,
      category: categoryName,
      brand: product.brand,
      subcategory: subcategoryName,
      stock: product.stock,
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

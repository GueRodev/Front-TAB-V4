/**
 * Wishlist Page Business Logic Hook
 * Handles wishlist operations and cart integration for the wishlist page
 * Also enriches wishlist data with current product info
 */

import { useMemo } from 'react';
import { useCart } from '@/features/cart';
import { useProducts } from '@/features/products';
import { useCategories } from '@/features/categories';
import { useWishlistOperations } from './useWishlistOperations';
import type { WishlistProduct } from '../contexts/WishlistContext';
import type { Product } from '@/features/products';

export const useWishlistPage = () => {
  const { wishlist, toggleWishlist, itemCount } = useWishlistOperations();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { addToCart } = useCart();

  /**
   * Get category info helper
   */
  const getCategoryInfo = (product: Product) => {
    if (product.category) {
      const category = product.category;
      const parentCategory = categories.find(c =>
        c.children?.some(child => child.id === category.id)
      );

      if (parentCategory) {
        return { categoryName: parentCategory.name, subcategoryName: category.name };
      }
      return { categoryName: category.name, subcategoryName: undefined };
    }

    for (const cat of categories) {
      if (cat.id === product.category_id) {
        return { categoryName: cat.name, subcategoryName: undefined };
      }
      const subcategory = cat.children?.find(child => child.id === product.category_id);
      if (subcategory) {
        return { categoryName: cat.name, subcategoryName: subcategory.name };
      }
    }

    return { categoryName: '', subcategoryName: undefined };
  };

  /**
   * Enriched wishlist with current product data
   * This ensures we always have the latest stock, price, etc.
   */
  const enrichedWishlist = useMemo((): WishlistProduct[] => {
    return wishlist.map(wishlistItem => {
      const currentProduct = products.find(p => p.id === wishlistItem.id);

      if (currentProduct) {
        const { categoryName, subcategoryName } = getCategoryInfo(currentProduct);
        return {
          ...wishlistItem,
          name: currentProduct.name,
          image: currentProduct.image_url || wishlistItem.image,
          price: currentProduct.price,
          brand: currentProduct.brand,
          category: categoryName || wishlistItem.category,
          subcategory: subcategoryName,
          stock: currentProduct.stock,
        };
      }

      return wishlistItem;
    });
  }, [wishlist, products, categories]);

  /**
   * Find full product by ID (for modal)
   */
  const findProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  /**
   * Handle wishlist toggle with event management
   */
  const handleToggleWishlist = (product: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleWishlist(product);
  };

  /**
   * Handle add to cart with event management and data transformation
   */
  const handleAddToCart = (product: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      brand: product.brand,
      categoryName: product.category,
    });
  };

  /**
   * Check if product is in wishlist
   */
  const isProductInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.id === productId);
  };

  return {
    wishlist: enrichedWishlist,
    itemCount,
    handleToggleWishlist,
    handleAddToCart,
    findProductById,
    isProductInWishlist,
  };
};

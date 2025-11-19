/**
 * Wishlist Page Business Logic Hook
 * Handles wishlist operations and cart integration for the wishlist page
 */

import { useCart } from '@/features/cart';
import { useWishlistOperations } from './useWishlistOperations';

export const useWishlistPage = () => {
  const { wishlist, toggleWishlist, itemCount } = useWishlistOperations();
  const { addToCart } = useCart();

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
    });
  };

  return {
    wishlist,
    itemCount,
    handleToggleWishlist,
    handleAddToCart,
  };
};

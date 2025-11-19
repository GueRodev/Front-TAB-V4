/**
 * useWishlistOperations
 * Business logic for wishlist operations
 */

import { useWishlist } from '../contexts';

export const useWishlistOperations = () => {
  const {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  } = useWishlist();

  /**
   * Check if wishlist is empty
   */
  const isEmpty = (): boolean => {
    return wishlist.length === 0;
  };

  /**
   * Get wishlist item count
   */
  const getItemCount = (): number => {
    return wishlist.length;
  };

  /**
   * Get total value of wishlist items
   */
  const getTotalValue = (): number => {
    return wishlist.reduce((total, item) => total + item.price, 0);
  };

  /**
   * Get wishlist summary
   */
  const getWishlistSummary = () => {
    return {
      itemCount: getItemCount(),
      totalValue: getTotalValue(),
      isEmpty: isEmpty(),
    };
  };

  /**
   * Clear all items from wishlist
   */
  const clearWishlist = () => {
    wishlist.forEach(item => removeFromWishlist(item.id));
  };

  return {
    // Wishlist data
    wishlist,
    itemCount: getItemCount(),
    totalValue: getTotalValue(),
    isEmpty: isEmpty(),

    // Wishlist actions
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,

    // Utility functions
    isInWishlist,
    getWishlistSummary,
  };
};

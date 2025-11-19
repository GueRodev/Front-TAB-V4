/**
 * useCartOperations
 * Business logic for shopping cart operations
 */

import { useCart } from '../contexts';
import type { CartItem } from '../types';

export const useCartOperations = () => {
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();

  /**
   * Increment item quantity
   */
  const incrementQuantity = (productId: string) => {
    const item = items.find(i => i.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }
  };

  /**
   * Decrement item quantity (removes if quantity reaches 0)
   */
  const decrementQuantity = (productId: string) => {
    const item = items.find(i => i.id === productId);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(productId, item.quantity - 1);
      } else {
        removeFromCart(productId);
      }
    }
  };

  /**
   * Check if cart is empty
   */
  const isEmpty = (): boolean => {
    return items.length === 0;
  };

  /**
   * Get cart summary
   */
  const getCartSummary = () => {
    return {
      itemCount: getTotalItems(),
      total: getTotalPrice(),
      isEmpty: isEmpty(),
    };
  };

  /**
   * Find item in cart
   */
  const findCartItem = (productId: string): CartItem | undefined => {
    return items.find(item => item.id === productId);
  };

  /**
   * Check if product is in cart
   */
  const isInCart = (productId: string): boolean => {
    return items.some(item => item.id === productId);
  };

  return {
    // Cart data
    items,
    totalItems: getTotalItems(),
    totalPrice: getTotalPrice(),
    isEmpty: isEmpty(),

    // Cart actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    incrementQuantity,
    decrementQuantity,

    // Utility functions
    getCartSummary,
    findCartItem,
    isInCart,
  };
};

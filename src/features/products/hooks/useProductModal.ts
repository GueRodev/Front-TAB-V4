/**
 * useProductModal
 * Business logic for product detail modal
 */

import { useState } from 'react';
import type { Product } from '../types';

interface UseProductModalParams {
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e?: React.MouseEvent) => void;
  isInWishlist?: (productId: string) => boolean;
}

export const useProductModal = ({
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}: UseProductModalParams) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  /**
   * Open modal with selected product
   */
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1); // Reset quantity to 1 when opening modal
    setIsModalOpen(true);
  };

  /**
   * Close modal and reset state
   */
  const closeProductModal = () => {
    setIsModalOpen(false);
    // Delay clearing product to avoid visual glitch during close animation
    setTimeout(() => {
      setSelectedProduct(null);
      setQuantity(1);
    }, 200);
  };

  /**
   * Handle add to cart from modal (with quantity support)
   */
  const handleAddToCartFromModal = () => {
    if (!selectedProduct) return;

    // Add the product 'quantity' times
    for (let i = 0; i < quantity; i++) {
      onAddToCart(selectedProduct);
    }

    closeProductModal();
  };

  /**
   * Handle toggle wishlist from modal
   */
  const handleToggleWishlistFromModal = () => {
    if (!selectedProduct) return;
    onToggleWishlist(selectedProduct);
  };

  /**
   * Check if current product is in wishlist
   */
  const isProductInWishlist = selectedProduct && isInWishlist
    ? isInWishlist(selectedProduct.id)
    : false;

  return {
    isModalOpen,
    selectedProduct,
    quantity,
    openProductModal,
    closeProductModal,
    setQuantity,
    handleAddToCartFromModal,
    handleToggleWishlistFromModal,
    isProductInWishlist,
  };
};

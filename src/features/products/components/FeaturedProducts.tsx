import React from 'react';
import { useProductOperations, useProductModal } from '@/features/products';
import { FeaturedProductsSection, ProductDetailModal } from '@/features/products';

/**
 * FeaturedProducts Component
 * Smart component that connects business logic to presentational component
 */
const FeaturedProducts: React.FC = () => {
  const {
    getFeaturedProducts,
    handleAddToCart,
    handleToggleWishlist,
    isProductInWishlist,
    getCategorySlug,
    categories,
  } = useProductOperations();

  const {
    isModalOpen,
    selectedProduct,
    quantity,
    openProductModal,
    closeProductModal,
    setQuantity,
    handleAddToCartFromModal,
    handleToggleWishlistFromModal,
    isProductInWishlist: isModalProductInWishlist,
  } = useProductModal({ 
    onAddToCart: handleAddToCart, 
    onToggleWishlist: handleToggleWishlist,
    isInWishlist: isProductInWishlist,
  });

  const featuredProducts = getFeaturedProducts();

  return (
    <>
      <FeaturedProductsSection
        products={featuredProducts}
        categories={categories}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isInWishlist={isProductInWishlist}
        getCategorySlug={getCategorySlug}
        onProductClick={openProductModal}
      />
      
      <ProductDetailModal
        product={selectedProduct}
        open={isModalOpen}
        onOpenChange={closeProductModal}
        onAddToCart={handleAddToCartFromModal}
        onToggleWishlist={handleToggleWishlistFromModal}
        isInWishlist={isModalProductInWishlist}
        categoryName={selectedProduct ? getCategorySlug(selectedProduct.category_id) : undefined}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />
    </>
  );
};

export default FeaturedProducts;

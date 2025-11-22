/**
 * FeaturedProductsSection Component
 * Pure presentational component for featured products section
 */

import React from 'react';
import { ProductGrid } from './ProductGrid';
import type { Product } from '../types';
import type { Category } from '@/features/categories';

interface FeaturedProductsSectionProps {
  products: Product[];
  categories?: Category[];
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e?: React.MouseEvent) => void;
  isInWishlist: (productId: string) => boolean;
  getCategorySlug?: (categoryId: string) => string;
  onProductClick?: (product: Product) => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  categories,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  getCategorySlug,
  onProductClick,
}) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Productos Destacados</h2>
          <p className="text-muted-foreground">
            Descubre nuestra selección especial de productos
          </p>
        </div>

        <ProductGrid
          products={products}
          categories={categories}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={isInWishlist}
          getCategorySlug={getCategorySlug}
          onProductClick={onProductClick}
        />
      </div>
    </section>
  );
};

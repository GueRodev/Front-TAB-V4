/**
 * FeaturedProductsSection Component
 * Pure presentational component for featured products section
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import type { Product } from '../types';

interface FeaturedProductsSectionProps {
  products: Product[];
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e?: React.MouseEvent) => void;
  isInWishlist: (productId: string) => boolean;
  getCategorySlug?: (categoryId: string) => string;
  onProductClick?: (product: Product) => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Productos Destacados</h2>
            <p className="text-muted-foreground">
              Descubre nuestra selección especial de productos
            </p>
          </div>
          <Link
            to="/category/all"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ProductGrid
          products={products}
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

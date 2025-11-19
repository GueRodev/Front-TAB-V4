/**
 * ProductGrid Component
 * Pure presentational component for displaying products in a grid
 */

import React from 'react';
import ProductCard from './ProductCard';
import { formatCurrency } from '@/lib/formatters';
import type { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e?: React.MouseEvent) => void;
  isInWishlist: (productId: string) => boolean;
  getCategorySlug?: (categoryId: string) => string;
  emptyMessage?: string;
  className?: string;
  onProductClick?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  getCategorySlug,
  emptyMessage = 'No hay productos disponibles',
  className = '',
  onProductClick,
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          image={product.image_url || ''}
          price={formatCurrency(product.price)}
          category={getCategorySlug ? getCategorySlug(product.category_id) : undefined}
          isWishlisted={isInWishlist(product.id)}
          onToggleWishlist={(e) => onToggleWishlist(product, e)}
          onAddToCart={(e) => onAddToCart(product, e)}
          onProductClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  );
};

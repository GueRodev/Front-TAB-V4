/**
 * WishlistGrid Component
 * Pure presentational component for wishlist products grid
 */

import React from 'react';
import { ProductCard } from '@/features/products';
import { formatCurrency } from '@/lib/formatters';

interface WishlistProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  brand?: string | null;
  subcategory?: string;
  stock?: number;
}

interface WishlistGridProps {
  products: WishlistProduct[];
  onAddToCart: (product: any, e?: React.MouseEvent) => void;
  onToggleWishlist: (product: WishlistProduct, e?: React.MouseEvent) => void;
}

export const WishlistGrid: React.FC<WishlistGridProps> = ({
  products,
  onAddToCart,
  onToggleWishlist,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          image={product.image}
          price={formatCurrency(product.price)}
          brand={product.brand}
          category={product.category}
          subcategory={product.subcategory}
          stock={product.stock}
          isWishlisted={true}
          onToggleWishlist={(e) => onToggleWishlist(product, e)}
          onAddToCart={(e) => onAddToCart(product, e)}
        />
      ))}
    </div>
  );
};

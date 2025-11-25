/**
 * ProductGrid Component
 * Pure presentational component for displaying products in a grid
 */

import React from 'react';
import ProductCard from './ProductCard';
import { formatCurrency } from '@/lib/formatters';
import type { Product } from '../types';
import type { Category } from '@/features/categories';

interface ProductGridProps {
  products: Product[];
  categories?: Category[];
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
  categories = [],
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  getCategorySlug,
  emptyMessage = 'No hay productos disponibles',
  className = '',
  onProductClick,
}) => {
  // Helper to get category info (parent and subcategory)
  const getCategoryInfo = (product: Product) => {
    // If product has eager-loaded category relation
    if (product.category) {
      const category = product.category;
      // Find if this category has a parent (is a subcategory)
      const parentCategory = categories.find(c =>
        c.children?.some(child => child.id === category.id)
      );

      if (parentCategory) {
        return {
          category: parentCategory.name,
          subcategory: category.name
        };
      }
      return {
        category: category.name,
        subcategory: undefined
      };
    }

    // Fallback: search in categories prop
    for (const cat of categories) {
      // Check if it's a direct match (parent category)
      if (cat.id === product.category_id) {
        return {
          category: cat.name,
          subcategory: undefined
        };
      }
      // Check children (subcategories)
      const subcategory = cat.children?.find(child => child.id === product.category_id);
      if (subcategory) {
        return {
          category: cat.name,
          subcategory: subcategory.name
        };
      }
    }

    return { category: undefined, subcategory: undefined };
  };
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product, index) => {
        const categoryInfo = getCategoryInfo(product);
        // Load first 4 images eagerly for better LCP, rest lazy
        const shouldLoadEager = index < 4;
        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            image={product.image_url || ''}
            price={formatCurrency(product.price)}
            brand={product.brand}
            category={categoryInfo.category || (getCategorySlug ? getCategorySlug(product.category_id) : undefined)}
            subcategory={categoryInfo.subcategory}
            stock={product.stock}
            isWishlisted={isInWishlist(product.id)}
            onToggleWishlist={(e) => onToggleWishlist(product, e)}
            onAddToCart={(e) => onAddToCart(product, e)}
            onProductClick={() => onProductClick?.(product)}
            loading={shouldLoadEager ? 'eager' : 'lazy'}
          />
        );
      })}
    </div>
  );
};

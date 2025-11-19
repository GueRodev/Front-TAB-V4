/**
 * Products List Admin Component
 * Wrapper for desktop and mobile views
 */

import { ProductsTable } from './ProductsTable';
import { ProductCardAdmin } from './ProductCardAdmin';
import type { Product } from '../types';
import type { Category } from '@/features/categories';

interface ProductsListAdminProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleFeatured: (productId: string, isFeatured: boolean) => void;
  onAdjustStock?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
}

export const ProductsListAdmin = ({
  products,
  categories,
  onEdit,
  onDelete,
  onToggleFeatured,
  onAdjustStock,
  onViewHistory,
}: ProductsListAdminProps) => {
  return (
    <>
      {/* Desktop Table View */}
      <ProductsTable
        products={products}
        categories={categories}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFeatured={onToggleFeatured}
        onAdjustStock={onAdjustStock}
        onViewHistory={onViewHistory}
      />

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {products.map((product) => {
          const category = categories.find(c => c.id === product.category_id);
          return (
            <ProductCardAdmin
              key={product.id}
              product={product}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFeatured={onToggleFeatured}
              onAdjustStock={onAdjustStock}
              onViewHistory={onViewHistory}
            />
          );
        })}
      </div>
    </>
  );
};

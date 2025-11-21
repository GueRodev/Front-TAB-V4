/**
 * Products List Admin Component
 * Wrapper for desktop and mobile views
 * ✅ Includes skeleton loading state
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
  loading?: boolean;
}

// Skeleton loader for table rows
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="p-4"><div className="h-12 w-12 bg-muted rounded" /></td>
    <td className="p-4"><div className="h-4 bg-muted rounded w-3/4" /></td>
    <td className="p-4"><div className="h-4 bg-muted rounded w-20" /></td>
    <td className="p-4"><div className="h-4 bg-muted rounded w-16" /></td>
    <td className="p-4"><div className="h-4 bg-muted rounded w-12" /></td>
    <td className="p-4"><div className="h-6 bg-muted rounded w-16" /></td>
    <td className="p-4"><div className="h-6 bg-muted rounded-full w-10" /></td>
    <td className="p-4"><div className="flex gap-2"><div className="h-8 w-8 bg-muted rounded" /><div className="h-8 w-8 bg-muted rounded" /></div></td>
  </tr>
);

// Skeleton loader for mobile cards
const CardSkeleton = () => (
  <div className="border rounded-lg p-4 animate-pulse">
    <div className="flex gap-4">
      <div className="h-20 w-20 bg-muted rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </div>
    </div>
    <div className="flex gap-2 mt-4">
      <div className="h-9 bg-muted rounded flex-1" />
      <div className="h-9 bg-muted rounded flex-1" />
    </div>
  </div>
);

export const ProductsListAdmin = ({
  products,
  categories,
  onEdit,
  onDelete,
  onToggleFeatured,
  onAdjustStock,
  onViewHistory,
  loading = false,
}: ProductsListAdminProps) => {
  // Show skeleton loading state
  if (loading && products.length === 0) {
    return (
      <>
        {/* Desktop Skeleton */}
        <div className="hidden lg:block rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left">Imagen</th>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Categoría</th>
                <th className="p-4 text-left">Precio</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Destacado</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Skeleton */}
        <div className="lg:hidden space-y-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay productos para mostrar</p>
      </div>
    );
  }

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

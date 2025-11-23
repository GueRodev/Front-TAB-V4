/**
 * Products List Admin Component
 * Wrapper for desktop and mobile views
 * ✅ Includes skeleton loading state
 * ✅ Includes pagination controls
 */

import { ProductsTable } from './ProductsTable';
import { ProductCardAdmin } from './ProductCardAdmin';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../types';
import type { Category } from '@/features/categories';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProductsListAdminProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleFeatured: (productId: string, isFeatured: boolean) => void;
  onAdjustStock?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
  loading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
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

// Pagination controls component
const PaginationControls = ({
  pagination,
  onPageChange,
  loading,
}: {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  loading?: boolean;
}) => {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
      <p className="text-sm text-muted-foreground">
        Mostrando {startItem}-{endItem} de {totalItems} productos
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPreviousPage || loading}
          className="h-8 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Anterior</span>
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage || loading}
          className="h-8 px-2"
        >
          <span className="hidden sm:inline mr-1">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const ProductsListAdmin = ({
  products,
  categories,
  onEdit,
  onDelete,
  onToggleFeatured,
  onAdjustStock,
  onViewHistory,
  loading = false,
  pagination,
  onPageChange,
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

      {/* Pagination Controls */}
      {pagination && onPageChange && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          loading={loading}
        />
      )}
    </>
  );
};

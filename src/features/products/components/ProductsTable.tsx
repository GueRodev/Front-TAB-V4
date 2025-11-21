/**
 * Products Table Component
 * Desktop table view for products list with dynamic columns
 */

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductRowDynamic } from './ProductRowDynamic';
import { ColumnSelector } from './ColumnSelector';
import { useProductColumns, PRODUCT_COLUMNS } from '../hooks/useProductColumns';
import type { Product } from '../types';
import type { Category } from '@/features/categories';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleFeatured: (productId: string, isFeatured: boolean) => void;
  onAdjustStock?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
}

export const ProductsTable = ({
  products,
  categories,
  onEdit,
  onDelete,
  onToggleFeatured,
  onAdjustStock,
  onViewHistory,
}: ProductsTableProps) => {
  const { visibleColumns, toggleColumn, isColumnVisible, resetToDefaults } = useProductColumns();

  // Helper to find parent category for a product
  const findCategoryInfo = (product: Product) => {
    // First check if category_id is a parent category
    let parentCategory = categories.find(c => c.id === product.category_id);
    let subcategory: Category | undefined;

    if (!parentCategory) {
      // It might be a subcategory, find the parent
      for (const cat of categories) {
        const foundSub = cat.children?.find(child => child.id === product.category_id);
        if (foundSub) {
          parentCategory = cat;
          subcategory = foundSub;
          break;
        }
      }
    }

    return { parentCategory, subcategory };
  };

  return (
    <div className="hidden lg:block space-y-3">
      {/* Column selector */}
      <div className="flex justify-end">
        <ColumnSelector
          visibleColumns={visibleColumns}
          onToggleColumn={toggleColumn}
          onResetColumns={resetToDefaults}
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              {PRODUCT_COLUMNS.map((column) => {
                if (!isColumnVisible(column.id)) return null;
                return (
                  <TableHead
                    key={column.id}
                    className={`font-semibold text-gray-700 ${column.id === 'actions' ? 'text-right' : ''}`}
                  >
                    {column.label}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const { parentCategory, subcategory } = findCategoryInfo(product);
              return (
                <ProductRowDynamic
                  key={product.id}
                  product={product}
                  parentCategory={parentCategory}
                  subcategory={subcategory}
                  visibleColumns={visibleColumns}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFeatured={onToggleFeatured}
                  onAdjustStock={onAdjustStock}
                  onViewHistory={onViewHistory}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

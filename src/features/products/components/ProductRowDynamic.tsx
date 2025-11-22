/**
 * Product Row Dynamic Component
 * Table row with dynamic columns support
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TableRow, TableCell } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Trash2, MoreVertical, Package, History } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '@/lib/formatters';
import type { Product } from '../types';
import type { Category } from '@/features/categories';

interface ProductRowDynamicProps {
  product: Product;
  parentCategory: Category | undefined;
  subcategory: Category | undefined;
  visibleColumns: string[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleFeatured: (productId: string, isFeatured: boolean) => void;
  onAdjustStock?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
}

export const ProductRowDynamic = ({
  product,
  parentCategory,
  subcategory,
  visibleColumns,
  onEdit,
  onDelete,
  onToggleFeatured,
  onAdjustStock,
  onViewHistory,
}: ProductRowDynamicProps) => {
  const isVisible = (columnId: string) => visibleColumns.includes(columnId);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return '-';
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      {/* Image */}
      {isVisible('image') && (
        <TableCell>
          <img
            src={product.image_url || ''}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        </TableCell>
      )}

      {/* Name */}
      {isVisible('name') && (
        <TableCell className="font-medium text-gray-900">
          {product.name}
        </TableCell>
      )}

      {/* Brand */}
      {isVisible('brand') && (
        <TableCell className="text-gray-600">
          {product.brand || '-'}
        </TableCell>
      )}

      {/* SKU */}
      {isVisible('sku') && (
        <TableCell className="text-gray-600 font-mono text-sm">
          {product.sku || '-'}
        </TableCell>
      )}

      {/* Category */}
      {isVisible('category') && (
        <TableCell className="text-gray-600">
          {parentCategory?.name || product.category?.name || 'Sin categoría'}
        </TableCell>
      )}

      {/* Subcategory */}
      {isVisible('subcategory') && (
        <TableCell className="text-gray-600">
          {subcategory?.name || '-'}
        </TableCell>
      )}

      {/* Price */}
      {isVisible('price') && (
        <TableCell className="text-gray-900 font-medium">
          {formatCurrency(product.price)}
        </TableCell>
      )}

      {/* Stock */}
      {isVisible('stock') && (
        <TableCell>
          <span
            className={`font-medium ${
              product.stock === 0
                ? 'text-red-600'
                : product.stock < 10
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {product.stock}
          </span>
        </TableCell>
      )}

      {/* Status */}
      {isVisible('status') && (
        <TableCell>
          <Badge
            variant={product.status === 'active' ? 'default' : 'secondary'}
            className={
              product.status === 'active'
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : product.status === 'out_of_stock'
                ? 'bg-red-100 text-red-800 hover:bg-red-100'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
            }
          >
            {product.status === 'active'
              ? 'Activo'
              : product.status === 'out_of_stock'
              ? 'Sin Stock'
              : 'Inactivo'}
          </Badge>
        </TableCell>
      )}

      {/* Featured */}
      {isVisible('featured') && (
        <TableCell>
          <div className="flex items-center justify-center">
            <Switch
              checked={product.is_featured}
              onCheckedChange={(checked) => onToggleFeatured(product.id, checked)}
            />
          </div>
        </TableCell>
      )}

      {/* Created At */}
      {isVisible('created_at') && (
        <TableCell className="text-gray-600 text-sm">
          {formatDate(product.created_at)}
        </TableCell>
      )}

      {/* Updated At */}
      {isVisible('updated_at') && (
        <TableCell className="text-gray-600 text-sm">
          {formatDate(product.updated_at)}
        </TableCell>
      )}

      {/* Actions */}
      {isVisible('actions') && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 hover:text-[#F97316] hover:bg-[#F97316]/10"
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {(onAdjustStock || onViewHistory) && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onAdjustStock && (
                    <DropdownMenuItem onClick={() => onAdjustStock(product)}>
                      <Package className="h-4 w-4 mr-2" />
                      Ajustar Stock
                    </DropdownMenuItem>
                  )}
                  {onViewHistory && (
                    <DropdownMenuItem onClick={() => onViewHistory(product)}>
                      <History className="h-4 w-4 mr-2" />
                      Ver Historial
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

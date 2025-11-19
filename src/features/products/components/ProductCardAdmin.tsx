/**
 * Product Card Admin Component
 * Mobile/tablet card view for products list
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Trash2, MoreVertical, Package, History } from 'lucide-react';
import type { Product } from '../types';
import type { Category } from '@/features/categories';

interface ProductCardAdminProps {
  product: Product;
  category: Category | undefined;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onToggleFeatured: (productId: string, isFeatured: boolean) => void;
  onAdjustStock?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
}

export const ProductCardAdmin = ({
  product,
  category,
  onEdit,
  onDelete,
  onToggleFeatured,
  onAdjustStock,
  onViewHistory,
}: ProductCardAdminProps) => {
  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col gap-3">
        {/* Product Header with Image and Title */}
        <div className="flex gap-3 items-start">
          <img 
            src={product.image_url || ''} 
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {product.name}
            </h4>
            <Badge 
              variant={product.status === 'active' ? 'default' : 'secondary'}
              className={`text-xs ${
                product.status === 'active' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
              }`}
            >
              {product.status === 'active' ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
        
        {/* Product Details */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <p className="text-gray-600 mb-1">Categoría</p>
            <p className="font-medium text-gray-900">{category?.name || 'Sin categoría'}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-1">Precio</p>
            <p className="font-medium text-gray-900">₡{product.price.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-1">Stock</p>
            <p className={`font-medium ${
              product.stock === 0 
                ? 'text-red-600' 
                : product.stock < 10 
                ? 'text-orange-600' 
                : 'text-green-600'
            }`}>
              {product.stock}
            </p>
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Destacado</span>
            <Switch
              checked={product.is_featured}
              onCheckedChange={(checked) => onToggleFeatured(product.id, checked)}
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
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
              <DropdownMenu>
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
        </div>
      </div>
    </div>
  );
};

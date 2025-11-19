/**
 * ProductDetailModal Component
 * Modal for displaying detailed product information
 */

import React from 'react';
import { X, ShoppingCart, Heart, Minus, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductImage } from '@/components/common';
import { formatCurrency } from '@/lib/formatters';
import type { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  isInWishlist: boolean;
  categoryName?: string;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  open,
  onOpenChange,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  categoryName,
  quantity,
  onQuantityChange,
}) => {
  if (!product) return null;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const isOutOfStock = product.stock === 0;
  const isMaxStock = quantity >= product.stock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Detalles de {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <ProductImage
              src={product.image_url || ''}
              alt={product.name}
              variant="detail"
              className="w-full h-full"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-4">
            {/* Category Badge */}
            {categoryName && (
              <Badge variant="secondary" className="w-fit">
                {categoryName}
              </Badge>
            )}

            {/* Product Name */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h2>
              {product.brand && (
                <p className="text-sm text-muted-foreground">
                  Marca: {product.brand}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="py-4">
              <p className="text-3xl md:text-4xl font-bold text-primary">
                {formatCurrency(product.price)}
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <Badge variant="destructive">Sin stock</Badge>
              ) : (
                <>
                  <Badge variant="default" className="bg-green-500">
                    ✓ En existencia
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} disponibles
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2 py-4">
                <h3 className="font-semibold text-foreground">Descripción:</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Cantidad:
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold min-w-[3ch] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={isMaxStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={onAddToCart}
                disabled={isOutOfStock}
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
              </Button>

              <Button
                onClick={onToggleWishlist}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Heart
                  className={`mr-2 h-5 w-5 ${
                    isInWishlist ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
                {isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

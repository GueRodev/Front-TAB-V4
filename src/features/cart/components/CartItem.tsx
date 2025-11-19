/**
 * CartItem Component
 * Pure presentational component for cart item display
 */

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CartItem as CartItemType } from '../types';

interface CartItemProps {
  item: CartItemType;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  return (
    <div className="flex gap-4 py-4 border-b">
      <img
        src={item.image}
        alt={item.name}
        className="w-24 h-24 object-cover rounded"
      />
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="font-bold mt-2">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDecrement(item.id)}
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onIncrement(item.id)}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

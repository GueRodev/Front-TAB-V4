/**
 * CartItemsList Component
 * Pure presentational component for displaying cart items
 */

import React from 'react';
import { CartItem } from './CartItem';
import type { CartItem as CartItemType } from '../types';

interface CartItemsListProps {
  items: CartItemType[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export const CartItemsList: React.FC<CartItemsListProps> = ({
  items,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Productos ({items.length})</h2>
      {items.map(item => (
        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
          <CartItem
            item={item}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onRemove={onRemove}
          />
        </div>
      ))}
    </div>
  );
};

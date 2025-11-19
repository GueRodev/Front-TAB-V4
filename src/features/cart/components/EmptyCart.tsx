/**
 * EmptyCart Component
 * Pure presentational component for empty cart state
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyCart: React.FC = () => {
  return (
    <div className="text-center py-16">
      <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
      <p className="text-muted-foreground mb-6">
        Agrega productos a tu carrito para continuar
      </p>
      <Button asChild>
        <Link to="/">Explorar productos</Link>
      </Button>
    </div>
  );
};

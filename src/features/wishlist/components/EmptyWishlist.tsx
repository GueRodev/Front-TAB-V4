/**
 * EmptyWishlist Component
 * Pure presentational component for empty wishlist state
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyWishlist: React.FC = () => {
  return (
    <div className="text-center py-16">
      <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Tu lista de deseos está vacía</h2>
      <p className="text-muted-foreground mb-6">
        Guarda tus productos favoritos para más tarde
      </p>
      <Button asChild>
        <Link to="/">Explorar productos</Link>
      </Button>
    </div>
  );
};

/**
 * Wishlist Context
 * Manages user wishlist/favorites using localStorage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { STORAGE_KEYS } from '@/config';

// Simplified Product interface for Wishlist
export interface WishlistProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
}

interface WishlistContextType {
  wishlist: WishlistProduct[];
  addToWishlist: (product: WishlistProduct) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: WishlistProduct) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.wishlist);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: WishlistProduct) => {
    setWishlist((prev) => [...prev, product]);
    toast({
      title: "Agregado a favoritos",
      description: `${product.name} ha sido agregado a tus favoritos`,
    });
  };

  const removeFromWishlist = (productId: string) => {
    const product = wishlist.find(p => p.id === productId);
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    toast({
      title: "Eliminado de favoritos",
      description: `${product?.name} ha sido eliminado de tus favoritos`,
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: WishlistProduct) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

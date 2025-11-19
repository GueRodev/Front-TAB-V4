import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/common';

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number | string; // Can accept both formatted string and number
  category?: string;
  badge?: 'new' | 'sale';
  isWishlisted?: boolean;
  onToggleWishlist?: (e: React.MouseEvent, productId: string) => void;
  onAddToCart?: (e: React.MouseEvent, productId: string) => void;
  onProductClick?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  image,
  price,
  category,
  badge,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onProductClick,
}) => {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md group card-hover h-full relative"
      style={{
        // Efecto neón gradient card color naranja
        // Puedes personalizar los colores RGB del gradiente aquí
        boxShadow: '0 0 20px rgba(255, 102, 0, 0.15), 0 0 40px rgba(255, 102, 0, 0.08), 0 4px 15px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 102, 0, 0.4), 0 0 60px rgba(255, 102, 0, 0.2), 0 8px 25px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 102, 0, 0.15), 0 0 40px rgba(255, 102, 0, 0.08), 0 4px 15px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div className="relative">
        <div 
          onClick={() => onProductClick?.(id)}
          className="block aspect-square overflow-hidden cursor-pointer"
        >
          <ProductImage
            src={image}
            alt={name}
            variant="card"
            className="transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {onToggleWishlist && (
          <button
            onClick={(e) => onToggleWishlist(e, id)}
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-orange hover:text-white transition-colors"
          >
            <Heart 
              size={18} 
              className={isWishlisted ? 'fill-red-500 text-red-500' : ''} 
            />
          </button>
        )}
        {badge === 'new' && (
          <span className="absolute top-4 left-4 px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">
            Nuevo
          </span>
        )}
        {badge === 'sale' && (
          <span className="absolute top-4 left-4 px-2 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">
            Oferta
          </span>
        )}
      </div>
      
      <div className="p-4">
        {category && (
          <div className="flex items-center mb-2">
            <span className="text-xs text-gray-500">{category}</span>
          </div>
        )}
        
        <div 
          onClick={() => onProductClick?.(id)}
          className="block cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 hover:text-brand-orange transition-colors mb-3 line-clamp-2">
            {name}
          </h3>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-lg">
            {typeof price === 'number' ? `₡${price.toFixed(2)}` : price}
          </span>
          {onAddToCart && (
            <Button
              onClick={(e) => onAddToCart(e, id)}
              size="sm"
              className="bg-brand-darkBlue hover:bg-brand-orange text-white transition-colors flex items-center gap-1"
            >
              <ShoppingCart size={16} />
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
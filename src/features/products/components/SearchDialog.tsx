import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProducts, type Product } from '@/features/products';
import { useCategories } from '@/features/categories';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { products } = useProducts();
  const { categories } = useCategories();

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return products
      .filter(product => 
        product.status === 'active' && 
        product.name.toLowerCase().includes(query)
      )
      .slice(0, 10); // Limit to 10 results
  }, [searchQuery, products]);

  const handleProductClick = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-brand-darkBlue">
            Buscar Productos
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Busca productos por nombre o categoría
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Buscar por nombre de producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[400px] px-6 pb-6">
          {searchQuery.trim() === '' ? (
            <div className="text-center py-8 text-gray-500">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Escribe para buscar productos</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No se encontraron productos</p>
              <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const category = categories.find(c => c.id === product.category_id);
                return (
                  <Link
                    key={product.id}
                    to={`/category/${category?.slug || ''}`}
                    onClick={handleProductClick}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-brand-orange"
                  >
                    <img
                      src={product.image_url || ''}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-darkBlue truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{category?.name}</p>
                      <p className="text-brand-orange font-bold mt-1">
                        ₡{product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;

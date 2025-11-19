/**
 * ProductSelector Component
 * Searchable product selector with category filtering
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/features/products/types';
import type { Category } from '@/features/categories/types';

interface ProductSelectorProps {
  selectedProduct: string;
  onSelectProduct: (productId: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filteredProducts: Product[];
  selectedProductData: Product | undefined;
  categories: Category[];
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProduct,
  onSelectProduct,
  categoryFilter,
  onCategoryFilterChange,
  searchQuery,
  onSearchQueryChange,
  open,
  onOpenChange,
  filteredProducts,
  selectedProductData,
  categories,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="categoryFilter">Filtrar por Categoría</Label>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger id="categoryFilter">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Producto</Label>
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedProduct
                ? selectedProductData?.name || "Seleccionar producto..."
                : "Seleccionar producto..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Buscar producto..." 
                value={searchQuery}
                onValueChange={onSearchQueryChange}
              />
              <CommandList>
                <CommandEmpty>No se encontraron productos.</CommandEmpty>
                <CommandGroup>
                  {filteredProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.id}
                      onSelect={(currentValue) => {
                        onSelectProduct(currentValue === selectedProduct ? "" : currentValue);
                        onOpenChange(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedProduct === product.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <img
                        src={product.image_url || ''}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ₡{product.price.toLocaleString('es-CR')} • Stock: {product.stock}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedProductData && (
        <div className="p-3 bg-accent rounded-lg">
          <div className="flex items-center gap-3">
            <img
              src={selectedProductData.image_url || ''}
              alt={selectedProductData.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium">{selectedProductData.name}</h4>
              <p className="text-sm text-muted-foreground">
                Precio: ₡{selectedProductData.price.toLocaleString('es-CR')}
              </p>
              <p className="text-sm text-muted-foreground">
                Stock disponible: {selectedProductData.stock}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

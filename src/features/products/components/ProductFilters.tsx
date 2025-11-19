/**
 * Product Filters Component
 * Reusable UI for product filtering (search and category)
 */

import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Category } from '@/features/categories';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categories: Category[];
  onClearFilters: () => void;
  filterCount: number;
}

export const ProductFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onClearFilters,
  filterCount,
}: ProductFiltersProps) => {
  const selectedCategoryName = categories.find(
    (cat) => cat.id === selectedCategory
  )?.name;

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {filterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {filterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Filtrar por categoría</h4>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? 'default'
                            : 'ghost'
                        }
                        className="w-full justify-start"
                        onClick={() => onCategoryChange(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Filtros activos:
          </span>

          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedCategory && selectedCategoryName && (
            <Badge variant="secondary" className="gap-1">
              Categoría: {selectedCategoryName}
              <button
                onClick={() => onCategoryChange('')}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 text-xs"
          >
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  );
};

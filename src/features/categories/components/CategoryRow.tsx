/**
 * CategoryRow Component
 * Sortable table row for desktop view with subcategories
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GripVertical, Edit2, Trash2, ChevronDown, ChevronRight, Shield, Package } from 'lucide-react';
import type { Category, Subcategory } from '../types';

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onEditSubcategory: (categoryId: string, subcategory: Subcategory) => void;
  onDeleteSubcategory: (categoryId: string, subcategoryId: string) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleExpand,
  onEditSubcategory,
  onDeleteSubcategory
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <tr ref={setNodeRef} style={style} className="border-b hover:bg-muted/50">
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <button
              onClick={() => onToggleExpand(category.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              {category.isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="font-medium">{category.name}</div>
              
              {/* Protected Badge */}
              {category.is_protected && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Protegida
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Esta categoría no puede ser eliminada</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Products Count */}
              {category.products_count !== undefined && category.products_count > 0 && (
                <Badge variant="outline" className="gap-1">
                  <Package className="h-3 w-3" />
                  {category.products_count}
                </Badge>
              )}

              {/* Deleted Badge */}
              {category.deleted_at && (
                <Badge variant="destructive">Eliminada</Badge>
              )}

              {/* Inactive Badge */}
              {!category.is_active && !category.deleted_at && (
                <Badge variant="secondary">Inactiva</Badge>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-center">{category.subcategories?.length || 0}</td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(category.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={category.is_protected}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {category.is_protected && (
                  <TooltipContent>
                    <p>Las categorías protegidas no pueden eliminarse</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </td>
      </tr>
      {category.isExpanded && category.subcategories.map((sub) => (
        <tr key={sub.id} className="border-b bg-muted/30 hover:bg-muted/50">
          <td className="px-6 py-3">
            <div className="flex items-center gap-2 pl-12">
              <span className="text-sm text-muted-foreground">└─</span>
              <div>
                <div className="text-sm font-medium">{sub.name}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-3"></td>
          <td className="px-6 py-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditSubcategory(category.id, sub)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteSubcategory(category.id, sub.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

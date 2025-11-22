/**
 * CategoryRecycleBin Component
 * Displays soft-deleted categories with restore and force delete options
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Package, 
  Calendar,
  XCircle 
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Category } from '../types';

interface CategoryRecycleBinProps {
  deletedCategories: Category[];
  onRestore: (category: Category) => void;
  onForceDelete: (category: Category) => void;
  isLoading?: boolean;
}

export const CategoryRecycleBin: React.FC<CategoryRecycleBinProps> = ({
  deletedCategories,
  onRestore,
  onForceDelete,
  isLoading = false,
}) => {
  // Loading state - show skeleton while fetching
  if (isLoading && deletedCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Papelera de Reciclaje
          </CardTitle>
          <CardDescription>
            Cargando categorías eliminadas...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Skeleton loaders */}
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-muted animate-pulse">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-9 bg-muted rounded flex-1"></div>
                    <div className="h-9 bg-muted rounded flex-1"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (deletedCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Papelera de Reciclaje
          </CardTitle>
          <CardDescription>
            Categorías eliminadas que pueden ser restauradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trash2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay categorías en la papelera</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Papelera de Reciclaje
        </CardTitle>
        <CardDescription>
          Las categorías eliminadas se conservan durante 30 días antes de ser eliminadas permanentemente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Restaurar:</strong> Los productos originales volverán automáticamente a esta categoría.
            <br />
            <strong>Eliminar permanentemente:</strong> Los productos pendientes de restaurar quedarán en "Otros".
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {deletedCategories.map((category) => (
            <Card key={category.id} className="border-destructive/50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{category.name}</h4>
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Eliminada
                        </Badge>
                      </div>
                      
                      {category.description && (
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {category.products_count !== undefined && (
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{category.products_count} productos actuales</span>
                      </div>
                    )}

                    {category.restorable_products_count !== undefined && category.restorable_products_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          {category.restorable_products_count} productos serán restaurados
                        </span>
                      </div>
                    )}

                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>{category.subcategories.length} subcategorías</span>
                      </div>
                    )}

                    {category.deleted_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Eliminada hace{' '}
                          {formatDistance(new Date(category.deleted_at), new Date(), {
                            addSuffix: false,
                            locale: es,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subcategories list */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Subcategorías incluidas:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.map((sub) => (
                          <Badge key={sub.id} variant="outline" className="text-xs">
                            {sub.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      onClick={() => onRestore(category)}
                      disabled={isLoading}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurar
                    </Button>
                    <Button
                      onClick={() => onForceDelete(category)}
                      disabled={isLoading}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Permanentemente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Footer */}
        <Alert>
          <AlertDescription className="text-xs">
            💡 <strong>Tip:</strong> Las categorías restauradas recuperarán todos sus productos y subcategorías asociadas.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

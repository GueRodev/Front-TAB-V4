/**
 * Product Recycle Bin Component
 * Displays soft-deleted products with restore and permanent deletion
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { useProductRecycleBin } from '../hooks/useProductRecycleBin';
import { OptimizedImage } from '@/components/common';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ProductRecycleBin = () => {
  const {
    deletedProducts,
    isLoadingDeleted,
    loadingAction,
    confirmDialog,
    openRestoreDialog,
    openForceDeleteDialog,
    closeConfirmDialog,
    handleConfirm,
    refreshDeleted,
  } = useProductRecycleBin();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Papelera de Productos</CardTitle>
              <CardDescription>
                Productos eliminados que pueden ser restaurados o eliminados permanentemente
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshDeleted}
              disabled={isLoadingDeleted}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDeleted ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDeleted ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando productos eliminados...
            </div>
          ) : deletedProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay productos en la papelera
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Imagen</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Eliminado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <OptimizedImage
                          src={product.image_url || ''}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.brand && (
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.category?.name || 'Sin categoría'}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="destructive" className="text-xs">
                            Eliminado
                          </Badge>
                          {product.deleted_at && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(product.deleted_at), 'dd MMM yyyy', {
                                locale: es,
                              })}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRestoreDialog(product)}
                            disabled={loadingAction}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restaurar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openForceDeleteDialog(product)}
                            disabled={loadingAction}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'restore'
                ? '¿Restaurar producto?'
                : '¿Eliminar permanentemente?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'restore' ? (
                <>
                  Estás por restaurar el producto{' '}
                  <span className="font-semibold">{confirmDialog.productName}</span>. El
                  producto volverá a estar disponible en el catálogo.
                </>
              ) : (
                <>
                  Estás por eliminar permanentemente el producto{' '}
                  <span className="font-semibold">{confirmDialog.productName}</span>. Esta
                  acción <span className="font-semibold text-destructive">no se puede deshacer</span>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingAction}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loadingAction}
              className={
                confirmDialog.action === 'force-delete'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
            >
              {loadingAction ? (
                'Procesando...'
              ) : confirmDialog.action === 'restore' ? (
                'Restaurar'
              ) : (
                'Eliminar permanentemente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

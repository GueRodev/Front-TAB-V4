/**
 * Stock Movement History Component
 * Displays stock movement history for a product
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, RefreshCw, Package, ShoppingCart, XCircle } from 'lucide-react';
import { stockMovementsService } from '../services';
import type { StockMovement, Product } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface StockMovementHistoryProps {
  product: Product;
}

export const StockMovementHistory = ({ product }: StockMovementHistoryProps) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMovements = async () => {
    setLoading(true);
    try {
      const data = await stockMovementsService.getByProduct(product.id);
      setMovements(data);
    } catch (error) {
      console.error('Error loading stock movements:', error);
      toast.error('Error al cargar el historial de movimientos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [product.id]);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <ArrowUp className="h-4 w-4" />;
      case 'salida':
        return <ArrowDown className="h-4 w-4" />;
      case 'ajuste':
        return <RefreshCw className="h-4 w-4" />;
      case 'reserva':
        return <Package className="h-4 w-4" />;
      case 'venta':
        return <ShoppingCart className="h-4 w-4" />;
      case 'cancelacion_reserva':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entrada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'salida':
      case 'venta':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'reserva':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelacion_reserva':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return '';
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'entrada':
        return 'Entrada';
      case 'salida':
        return 'Salida';
      case 'ajuste':
        return 'Ajuste';
      case 'reserva':
        return 'Reserva';
      case 'venta':
        return 'Venta';
      case 'cancelacion_reserva':
        return 'Cancelación';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historial de Movimientos</CardTitle>
            <CardDescription>
              Registro completo de cambios en el inventario de "{product.name}"
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadMovements} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && movements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Cargando historial de movimientos...
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay movimientos registrados para este producto
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Stock Anterior</TableHead>
                  <TableHead className="text-right">Stock Nuevo</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Razón</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="text-sm">
                      {format(new Date(movement.created_at), 'dd MMM yyyy, HH:mm', {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getMovementColor(movement.type)}>
                        {getMovementIcon(movement.type)}
                        <span className="ml-1">{getMovementLabel(movement.type)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          movement.quantity > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {movement.quantity > 0 ? '+' : ''}
                        {movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {movement.stock_before}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {movement.stock_after}
                    </TableCell>
                    <TableCell className="text-sm">
                      {movement.user?.name || 'Sistema'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {movement.reason || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

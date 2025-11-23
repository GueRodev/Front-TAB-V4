/**
 * OrdersTable Component
 * Table view of orders with actions
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '../types';

interface OrdersTableProps {
  orders: Order[];
  showActions?: boolean;
  compact?: boolean;
  onArchive?: (orderId: string) => void;
  onDelete?: (orderId: string, order: Order) => void;
  onComplete?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  onRestore?: (orderId: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  showActions = true,
  compact = false,
  onArchive,
  onDelete,
  onComplete,
  onCancel,
  onRestore,
}) => {
  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No hay pedidos</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Total</TableHead>
            {!compact && <TableHead>Pago</TableHead>}
            {!compact && <TableHead className="text-center">Productos</TableHead>}
            {showActions && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString('es-CR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.customerInfo.name}</div>
                  <div className="text-xs text-muted-foreground">{order.customerInfo.phone}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {order.type === 'online' ? 'En línea' : 'En tienda'}
                </Badge>
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} deletedAt={order.deleted_at} />
              </TableCell>
              <TableCell className="text-right font-semibold">
                ₡{order.total.toLocaleString('es-CR')}
              </TableCell>
              {!compact && (
                <TableCell>
                  <span className="capitalize">{order.paymentMethod || 'N/A'}</span>
                </TableCell>
              )}
              {!compact && (
                <TableCell className="text-center">
                  <Badge variant="secondary">{order.items.length}</Badge>
                </TableCell>
              )}
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {order.status === 'pending' && onComplete && onCancel && (
                      <>
                        <Button
                          onClick={() => onComplete(order)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => onCancel(order)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {order.status !== 'pending' && onArchive && (
                      <Button
                        onClick={() => onArchive(order.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    {order.status !== 'pending' && onDelete && (
                      <Button
                        onClick={() => onDelete(order.id, order)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {order.deleted_at && onRestore && (
                      <Button
                        onClick={() => onRestore(order.id)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title="Restaurar pedido"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

/**
 * Order Row Dynamic Component
 * Table row with dynamic columns support
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { Archive, Trash2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '../types';

interface OrderRowDynamicProps {
  order: Order;
  visibleColumns: string[];
  onArchive?: (orderId: string) => void;
  onDelete?: (orderId: string, order: Order) => void;
  onComplete?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  onRestore?: (orderId: string) => void;
}

export const OrderRowDynamic = ({
  order,
  visibleColumns,
  onArchive,
  onDelete,
  onComplete,
  onCancel,
  onRestore,
}: OrderRowDynamicProps) => {
  const isVisible = (columnId: string) => visibleColumns.includes(columnId);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd MMM yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return '-';
    }
  };

  const hasActions = onArchive || onDelete || onComplete || onCancel || onRestore;

  return (
    <TableRow className="hover:bg-gray-50">
      {/* ID */}
      {isVisible('id') && (
        <TableCell className="font-medium text-gray-900">
          #{order.order_number || order.id.slice(0, 8)}
        </TableCell>
      )}

      {/* Fecha */}
      {isVisible('date') && (
        <TableCell className="text-gray-600 text-sm">
          {formatDate(order.createdAt)}
        </TableCell>
      )}

      {/* Cliente */}
      {isVisible('customer') && (
        <TableCell>
          <div className="font-medium text-gray-900">{order.customerInfo?.name || '-'}</div>
        </TableCell>
      )}

      {/* Teléfono */}
      {isVisible('phone') && (
        <TableCell className="text-gray-600 text-sm">
          {order.customerInfo?.phone || '-'}
        </TableCell>
      )}

      {/* Email */}
      {isVisible('email') && (
        <TableCell className="text-gray-600 text-sm truncate max-w-[150px]">
          {order.customerInfo?.email || '-'}
        </TableCell>
      )}

      {/* Tipo */}
      {isVisible('type') && (
        <TableCell>
          <Badge variant="outline">
            {order.type === 'online' ? 'En línea' : 'En tienda'}
          </Badge>
        </TableCell>
      )}

      {/* Estado */}
      {isVisible('status') && (
        <TableCell>
          <OrderStatusBadge status={order.status} deletedAt={order.deleted_at} />
        </TableCell>
      )}

      {/* Total */}
      {isVisible('total') && (
        <TableCell className="text-right font-semibold text-gray-900">
          ₡{order.total.toLocaleString('es-CR')}
        </TableCell>
      )}

      {/* Pago */}
      {isVisible('payment') && (
        <TableCell className="text-gray-600 capitalize">
          {order.paymentMethod || 'N/A'}
        </TableCell>
      )}

      {/* Entrega */}
      {isVisible('delivery') && (
        <TableCell className="text-gray-600 capitalize">
          {order.deliveryOption === 'pickup' ? 'Retiro' : order.deliveryOption === 'delivery' ? 'Envío' : 'N/A'}
        </TableCell>
      )}

      {/* Productos */}
      {isVisible('products') && (
        <TableCell className="text-center">
          <Badge variant="secondary">{order.items?.length || 0}</Badge>
        </TableCell>
      )}

      {/* Notas */}
      {isVisible('notes') && (
        <TableCell className="text-gray-600 text-sm truncate max-w-[150px]">
          {order.notes || '-'}
        </TableCell>
      )}

      {/* Fecha Creación */}
      {isVisible('created_at') && (
        <TableCell className="text-gray-600 text-sm">
          {formatDateTime(order.createdAt)}
        </TableCell>
      )}

      {/* Acciones */}
      {isVisible('actions') && hasActions && (
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            {order.status === 'pending' && onComplete && onCancel && (
              <>
                <Button
                  onClick={() => onComplete(order)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  title="Completar"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => onCancel(order)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  title="Cancelar"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {order.status !== 'pending' && !order.deleted_at && onArchive && (
              <Button
                onClick={() => onArchive(order.id)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Archivar"
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
            {order.status !== 'pending' && !order.deleted_at && onDelete && (
              <Button
                onClick={() => onDelete(order.id, order)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Eliminar"
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
  );
};

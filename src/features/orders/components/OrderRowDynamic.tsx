/**
 * Order Row Dynamic Component
 * Table row with dynamic columns support
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { Trash2 } from 'lucide-react'; // Removed RotateCcw - restore functionality disabled
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '../types';

interface OrderRowDynamicProps {
  order: Order;
  visibleColumns: string[];
  onDelete?: (orderId: string, order: Order) => void;
  // onRestore?: (orderId: string) => void; // Restore functionality disabled
}

export const OrderRowDynamic = ({
  order,
  visibleColumns,
  onDelete,
  // onRestore, // Restore functionality disabled
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

  const hasActions = onDelete; // Removed onRestore - restore functionality disabled

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

      {/* Nombre Productos */}
      {isVisible('product_names') && (
        <TableCell className="text-gray-600 text-sm max-w-[200px]">
          <div className="space-y-0.5">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={item.id || index} className="truncate" title={`${item.name} (x${item.quantity})`}>
                  {item.name} <span className="text-gray-400">x{item.quantity}</span>
                </div>
              ))
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
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
            {!order.deleted_at && onDelete && (
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
            {/* Restore functionality disabled */}
            {/* {order.deleted_at && onRestore && (
              <Button
                onClick={() => onRestore(order.id)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                title="Restaurar pedido"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )} */}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

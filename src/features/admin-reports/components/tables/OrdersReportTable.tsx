/**
 * OrdersReportTable Component
 * Table displaying orders report data
 * ✅ Shows order details with status and audit info
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyTableRow } from '@/components/shared';
import type { OrderDetail } from '../../types';
import { formatCurrency } from '@/lib/formatters';

interface OrdersReportTableProps {
  orders: OrderDetail[];
  title?: string;
  emptyMessage?: string;
  showAudit?: boolean;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Completado';
    case 'pending':
      return 'Pendiente';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

const getOrderTypeLabel = (orderType: string) => {
  switch (orderType.toLowerCase()) {
    case 'in_store':
      return 'En tienda';
    case 'online':
      return 'En línea';
    default:
      return orderType;
  }
};

export const OrdersReportTable: React.FC<OrdersReportTableProps> = ({
  orders,
  title = 'Pedidos',
  emptyMessage = 'No hay pedidos',
  showAudit = false,
}) => {
  const isEmpty = !orders || orders.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              {showAudit && <TableHead>Acción por</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <EmptyTableRow colSpan={showAudit ? 7 : 6} message={emptyMessage} />
            ) : (
              orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell className="font-medium">#{order.order_number || order.order_id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{getOrderTypeLabel(order.order_type)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(order.total || 0))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  {showAudit && (
                    <TableCell>
                      {order.completed_by ? (
                        <span className="text-sm text-green-600">
                          ✓ {order.completed_by}
                        </span>
                      ) : order.status === 'cancelled' ? (
                        <span className="text-sm text-red-600">
                          ✗ Cancelado
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

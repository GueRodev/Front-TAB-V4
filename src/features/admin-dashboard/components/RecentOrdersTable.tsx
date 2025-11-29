/**
 * RecentOrdersTable Component
 * Displays the most recent orders
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';
import { formatOrderId } from '../helpers';
import { getStatusLabel } from '@/features/orders/helpers';
import { EmptyTableRow } from '@/components/shared';
import type { RecentOrder } from '../types';

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base md:text-lg lg:text-xl">
            Pedidos Recientes
          </CardTitle>
          <Link to="/admin/orders">
            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
              Ver todos
            </Badge>
          </Link>
        </div>
        <CardDescription className="text-xs md:text-sm">
          Últimos 5 pedidos recibidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-sm">ID</TableHead>
                <TableHead className="text-xs md:text-sm">Cliente</TableHead>
                <TableHead className="text-xs md:text-sm text-right">Total</TableHead>
                <TableHead className="text-xs md:text-sm">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <EmptyTableRow colSpan={4} message="No hay pedidos aún" />
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-xs md:text-sm">
                      {formatOrderId(order.id)}
                    </TableCell>
                    <TableCell className="text-xs md:text-sm">
                      {order.customerInfo.name}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs md:text-sm">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
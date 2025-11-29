/**
 * SalesReportTable Component
 * Table displaying sales report data with multiple sections
 * ✅ Shows top products and daily trend
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
import type { TopProductReport, DailyTrendData } from '../../types';
import { formatCurrency } from '@/lib/formatters';

interface SalesReportTableProps {
  topProducts?: TopProductReport[];
  dailyTrend?: DailyTrendData[];
}

export const SalesReportTable: React.FC<SalesReportTableProps> = ({ topProducts, dailyTrend }) => {
  return (
    <div className="space-y-6">
      {/* Top Products Table */}
      {topProducts && topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell className="text-right">{product.quantity_sold}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(product.revenue || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(product.cost || 0))}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(Number(product.profit || 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Daily Trend Table */}
      {dailyTrend && dailyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Diaria</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Ganancia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyTrend.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium">
                      {new Date(day.date).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">{day.orders}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(day.revenue || 0))}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(Number(day.profit || 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

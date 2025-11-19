/**
 * TopProductsTable Component
 * Displays the best-selling products
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';
import { EmptyTableRow } from './EmptyTableRow';
import type { TopProduct } from '../types';

interface TopProductsTableProps {
  products: TopProduct[];
}

export const TopProductsTable: React.FC<TopProductsTableProps> = ({ products }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base md:text-lg lg:text-xl">
            Productos Más Vendidos
          </CardTitle>
          <Link to="/admin/products">
            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
              Ver todos
            </Badge>
          </Link>
        </div>
        <CardDescription className="text-xs md:text-sm">
          Top 5 productos por cantidad vendida
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-sm">Producto</TableHead>
                <TableHead className="text-xs md:text-sm text-right">Vendidos</TableHead>
                <TableHead className="text-xs md:text-sm text-right">Ingresos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <EmptyTableRow colSpan={3} message="No hay ventas registradas" />
              ) : (
                products.map((product, index) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium text-xs md:text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs md:text-sm">
                      {product.quantity}
                    </TableCell>
                    <TableCell className="text-right text-xs md:text-sm text-green-600">
                      {formatCurrency(product.revenue)}
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
/**
 * ProductsReportTable Component
 * Table displaying products report data
 * ✅ Shows inventory status, out of stock, top/slow sellers
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
import type { ProductInventoryItem } from '../types';

interface ProductsReportTableProps {
  products: ProductInventoryItem[];
  title: string;
  emptyMessage?: string;
  showStock?: boolean;
  showSales?: boolean;
}

export const ProductsReportTable: React.FC<ProductsReportTableProps> = ({
  products,
  title,
  emptyMessage = 'No hay productos',
  showStock = true,
  showSales = false,
}) => {
  const isEmpty = !products || products.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              {showStock && <TableHead className="text-right">Stock</TableHead>}
              {showStock && <TableHead className="text-right">Valor Inventario</TableHead>}
              {showSales && <TableHead className="text-right">Cantidad Vendida</TableHead>}
              {showSales && <TableHead className="text-right">Ingresos</TableHead>}
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <EmptyTableRow colSpan={showStock ? 5 : 4} message={emptyMessage} />
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  {showStock && <TableCell className="text-right">{product.stock}</TableCell>}
                  {showStock && (
                    <TableCell className="text-right">
                      S/ {product.inventory_value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </TableCell>
                  )}
                  {showSales && product.total_sold !== undefined && (
                    <TableCell className="text-right">{product.total_sold}</TableCell>
                  )}
                  {showSales && product.total_revenue !== undefined && (
                    <TableCell className="text-right">
                      S/ {product.total_revenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge
                      variant={
                        product.status === 'active'
                          ? 'default'
                          : product.status === 'out_of_stock'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {product.status === 'active'
                        ? 'Activo'
                        : product.status === 'out_of_stock'
                          ? 'Sin Stock'
                          : 'Inactivo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

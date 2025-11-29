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
import { formatCurrency } from '@/lib/formatters';
import type {
  ProductDetail,
  OutOfStockProduct,
  TopSellingProduct,
  SlowMovingProduct,
} from '../../types';

// Union type for all product types that can be displayed in the table
type ProductTableItem = ProductDetail | OutOfStockProduct | TopSellingProduct | SlowMovingProduct;

interface ProductsReportTableProps {
  products: ProductTableItem[];
  title: string;
  emptyMessage?: string;
  showStock?: boolean;
  showSales?: boolean;
  showStatus?: boolean;
}

export const ProductsReportTable: React.FC<ProductsReportTableProps> = ({
  products,
  title,
  emptyMessage = 'No hay productos',
  showStock = true,
  showSales = false,
  showStatus = true,
}) => {
  const isEmpty = !products || products.length === 0;

  // Helper to get product ID
  const getProductId = (product: ProductTableItem): number => {
    if ('product_id' in product) return product.product_id;
    return 0;
  };

  // Helper to get product name
  const getProductName = (product: ProductTableItem): string => {
    if ('name' in product) return product.name;
    if ('product_name' in product) return product.product_name;
    return '';
  };

  // Helper to get stock
  const getCurrentStock = (product: ProductTableItem): number | null => {
    if ('current_stock' in product) return product.current_stock;
    return null;
  };

  // Helper to get inventory value
  const getInventoryValue = (product: ProductTableItem): number | null => {
    if ('inventory_value' in product) return product.inventory_value;
    return null;
  };

  // Helper to get total sold
  const getTotalSold = (product: ProductTableItem): number | null => {
    if ('total_sold' in product) return product.total_sold;
    return null;
  };

  // Helper to get total revenue
  const getTotalRevenue = (product: ProductTableItem): number | null => {
    if ('total_revenue' in product) return product.total_revenue;
    return null;
  };

  // Helper to get status
  const getStatus = (product: ProductTableItem): string | null => {
    if ('status' in product) return product.status;
    return null;
  };

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
              {showStatus && <TableHead>Estado</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <EmptyTableRow colSpan={showStock ? 5 : 4} message={emptyMessage} />
            ) : (
              products.map((product) => {
                const productId = getProductId(product);
                const productName = getProductName(product);
                const currentStock = getCurrentStock(product);
                const inventoryValue = getInventoryValue(product);
                const totalSold = getTotalSold(product);
                const totalRevenue = getTotalRevenue(product);
                const status = getStatus(product);

                return (
                  <TableRow key={productId}>
                    <TableCell className="font-medium">{productName}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    {showStock && (
                      <TableCell className="text-right">
                        {currentStock !== null ? currentStock : '-'}
                      </TableCell>
                    )}
                    {showStock && (
                      <TableCell className="text-right">
                        {inventoryValue !== null
                          ? formatCurrency(inventoryValue)
                          : '-'}
                      </TableCell>
                    )}
                    {showSales && (
                      <TableCell className="text-right">
                        {totalSold !== null ? totalSold : '-'}
                      </TableCell>
                    )}
                    {showSales && (
                      <TableCell className="text-right">
                        {totalRevenue !== null ? formatCurrency(totalRevenue) : '-'}
                      </TableCell>
                    )}
                    {showStatus && (
                      <TableCell>
                        {status && (
                          <Badge
                            variant={
                              status === 'active'
                                ? 'default'
                                : status === 'out_of_stock'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {status === 'active'
                              ? 'Activo'
                              : status === 'out_of_stock'
                                ? 'Sin Stock'
                                : 'Inactivo'}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

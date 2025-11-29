/**
 * Products Report Tab Component
 * Inventory and product performance reports
 */

import { useState } from 'react';
import {
  ExportButton,
  ReportSummaryCard,
  ProductsReportTable,
  LoadingState,
  ErrorState,
} from '..';
import { useProductsReport, useReportExport } from '../../hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/formatters';

export const ProductsReportTab = () => {
  const [filters] = useState<{ category_id?: number; status?: string }>({});

  const { data: report, isLoading, isError, error, refetch } = useProductsReport(filters);
  const { exportReport, isExporting, exportError } = useReportExport();

  const handleExport = async (exportFormat: 'pdf' | 'excel') => {
    await exportReport('products', exportFormat, filters);
  };

  if (isLoading) {
    return <LoadingState message="Cargando reporte de productos..." />;
  }

  if (isError) {
    return <ErrorState message={error?.message || 'Error al cargar el reporte'} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton
          reportType="products"
          filters={filters}
          isExporting={isExporting}
          onExport={handleExport}
          disabled={!report}
        />
      </div>

      {exportError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {exportError}
        </div>
      )}

      {/* Summary */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportSummaryCard
              title="Resumen de Inventario"
              items={[
                { label: 'Total Productos', value: report.summary.total_products || 0 },
                { label: 'Productos Activos', value: report.summary.active_products || 0 },
                {
                  label: 'Valor Inventario',
                  value: formatCurrency(Number(report.summary.total_inventory_value || 0)),
                  className: 'text-green-600',
                },
              ]}
            />
            <ReportSummaryCard
              title="Estado de Stock"
              items={[
                {
                  label: 'Sin Stock',
                  value: report.summary.out_of_stock_count || 0,
                  className: 'text-red-600',
                },
                { label: 'Con Stock', value: report.summary.in_stock_count || 0 },
              ]}
            />
            <ReportSummaryCard
              title="Valoración"
              items={[
                {
                  label: 'Valor Promedio/Producto',
                  value: formatCurrency(Number(report.summary.average_product_value || 0)),
                },
              ]}
            />
          </div>

          {/* Product Tables with Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="out_of_stock">Sin Stock</TabsTrigger>
              <TabsTrigger value="top_selling">Más Vendidos</TabsTrigger>
              <TabsTrigger value="slow_moving">Movimiento Lento</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ProductsReportTable
                products={report.products || []}
                title="Todos los Productos"
                showStock={true}
              />
            </TabsContent>

            <TabsContent value="out_of_stock">
              <ProductsReportTable
                products={report.out_of_stock_products || []}
                title="Productos Sin Stock"
                emptyMessage="No hay productos sin stock"
                showStock={true}
              />
            </TabsContent>

            <TabsContent value="top_selling">
              <ProductsReportTable
                products={report.top_selling_products || []}
                title="Productos Más Vendidos"
                emptyMessage="No hay datos de ventas"
                showStock={false}
                showSales={true}
                showStatus={false}
              />
            </TabsContent>

            <TabsContent value="slow_moving">
              <ProductsReportTable
                products={report.slow_moving_products || []}
                title="Productos de Movimiento Lento"
                emptyMessage="No hay productos de movimiento lento"
                showStock={false}
                showSales={true}
                showStatus={false}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

/**
 * Orders Report Tab Component
 * Orders reports with audit trail and pending orders
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  ExportButton,
  ReportSummaryCard,
  OrdersReportTable,
  LoadingState,
  ErrorState,
} from '..';
import { DateRangeFilter } from '@/features/admin-dashboard';
import { useOrdersReport, usePendingOrdersReport, useReportExport } from '../../hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';

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

const getPaymentMethodLabel = (paymentMethod: string) => {
  switch (paymentMethod.toLowerCase()) {
    case 'cash':
      return 'Efectivo';
    case 'card':
      return 'Tarjeta';
    case 'transfer':
      return 'Transferencia';
    default:
      return paymentMethod;
  }
};

export const OrdersReportTab = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const filters = {
    start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
  };

  const { data: report, isLoading, isError, error, refetch } = useOrdersReport(filters);
  const {
    data: pendingReport,
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = usePendingOrdersReport();
  const { exportReport, isExporting, exportError } = useReportExport();

  const handleExport = async (exportFormat: 'pdf' | 'excel') => {
    await exportReport('orders', exportFormat, filters);
  };

  if (isLoading) {
    return <LoadingState message="Cargando reporte de pedidos..." />;
  }

  if (isError) {
    return <ErrorState message={error?.message || 'Error al cargar el reporte'} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <ExportButton
          reportType="orders"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ReportSummaryCard
              title="Resumen General"
              items={[
                { label: 'Total Pedidos', value: report.summary.total_orders || 0 },
                {
                  label: 'Valor Total',
                  value: formatCurrency(Number(report.summary.total_revenue || 0)),
                  className: 'text-green-600',
                },
                {
                  label: 'Ticket Promedio',
                  value: formatCurrency(Number(report.summary.average_order_value || 0)),
                },
              ]}
            />

            <ReportSummaryCard
              title="Por Estado"
              items={(report.status_breakdown || []).map((item) => ({
                label: item.status === 'completed' ? 'Completados' : item.status === 'pending' ? 'Pendientes' : 'Cancelados',
                value: `${item.count || 0} (${Number(item.percentage || 0).toFixed(1)}%)`,
                className: item.status === 'completed' ? 'text-green-600' : item.status === 'cancelled' ? 'text-red-600' : '',
              }))}
            />

            <ReportSummaryCard
              title="Por Tipo de Pedido"
              items={(report.order_type_breakdown || []).map((item) => ({
                label: getOrderTypeLabel(item.order_type),
                value: `${item.orders || 0} (${Number(item.percentage || 0).toFixed(1)}%)`,
              }))}
            />

            <ReportSummaryCard
              title="Por Método de Pago"
              items={(report.payment_method_breakdown || []).map((item) => ({
                label: getPaymentMethodLabel(item.payment_method),
                value: `${item.orders || 0} pedidos`,
              }))}
            />
          </div>

          {/* Orders Tables with Tabs */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                Todos
                <Badge variant="secondary" className="ml-2">
                  {report.orders.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendientes
                {!isPendingLoading && pendingReport && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingReport.orders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <OrdersReportTable
                orders={report.orders}
                title="Todos los Pedidos"
                showAudit={true}
              />
            </TabsContent>

            <TabsContent value="pending">
              {isPendingLoading ? (
                <LoadingState message="Cargando pedidos pendientes..." variant="card" />
              ) : pendingReport ? (
                <>
                  <div className="mb-4">
                    <ReportSummaryCard
                      title="Resumen Pendientes"
                      items={[
                        { label: 'Total Pendientes', value: pendingReport.summary?.total_pending || 0 },
                        {
                          label: 'Valor Total',
                          value: formatCurrency(Number(pendingReport.summary?.total_value || 0)),
                          className: 'text-yellow-600',
                        },
                        {
                          label: 'Más Antiguo',
                          value: pendingReport.summary?.oldest_pending
                            ? new Date(pendingReport.summary.oldest_pending).toLocaleDateString('es-PE')
                            : 'N/A',
                        },
                      ]}
                    />
                  </div>
                  <OrdersReportTable
                    orders={pendingReport.orders || []}
                    title="Pedidos Pendientes"
                    emptyMessage="No hay pedidos pendientes"
                  />
                </>
              ) : null}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

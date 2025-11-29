/**
 * Sales Report Tab Component
 * Complete sales report with filtering and export
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  ExportButton,
  ReportSummaryCard,
  SalesReportTable,
  LoadingState,
  ErrorState,
} from '..';
import { DateRangeFilter, ProfitMetricCard } from '@/features/admin-dashboard';
import { useSalesReport, useReportExport } from '../../hooks';
import { DollarSign, TrendingUp, ShoppingBag, Percent } from 'lucide-react';
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

export const SalesReportTab = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const filters = {
    start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
    end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
  };

  const { data: report, isLoading, isError, error, refetch } = useSalesReport(filters);
  const { exportReport, isExporting, exportError } = useReportExport();

  const handleExport = async (exportFormat: 'pdf' | 'excel') => {
    await exportReport('sales', exportFormat, filters);
  };

  if (isLoading) {
    return <LoadingState message="Cargando reporte de ventas..." />;
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
          reportType="sales"
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

      {/* Summary Metrics */}
      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ProfitMetricCard
              title="Ingresos Totales"
              revenue={report.summary.total_revenue || 0}
              cost={report.summary.total_cost || 0}
              profit={report.summary.total_profit || 0}
              icon={DollarSign}
              variant="success"
            />
            <ReportSummaryCard
              title="Estadísticas"
              items={[
                { label: 'Total Pedidos', value: report.summary.total_orders || 0 },
                { label: 'Ticket Promedio', value: formatCurrency(Number(report.summary.average_order_value || 0)) },
                {
                  label: 'Margen Ganancia',
                  value: `${Number(report.summary.profit_margin || 0).toFixed(1)}%`,
                  className: 'text-green-600',
                },
              ]}
            />
          </div>

          {/* Payment & Order Type Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReportSummaryCard
              title="Por Tipo de Pago"
              items={(report.payment_breakdown || []).map((item) => ({
                label: getPaymentMethodLabel(item.payment_method),
                value: `${formatCurrency(Number(item.total || 0))} (${item.orders || 0} pedidos)`,
              }))}
            />
            <ReportSummaryCard
              title="Por Tipo de Pedido"
              items={(report.order_type_breakdown || []).map((item) => ({
                label: getOrderTypeLabel(item.order_type),
                value: `${formatCurrency(Number(item.total || 0))} (${item.orders || 0} pedidos)`,
              }))}
            />
          </div>

          {/* Tables */}
          <SalesReportTable topProducts={report.top_products} dailyTrend={report.daily_trend} />
        </>
      )}
    </div>
  );
};

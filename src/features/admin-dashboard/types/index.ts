/**
 * Admin Dashboard Types
 * Barrel export for all dashboard types
 */

export type {
  // Dashboard Metrics
  DashboardMetrics,
  ChartDataPoint,
  TopProduct,
  RecentOrder,
  QuickSummary,

  // Analytics
  YearlyAnalytics,
  YearlySummary,
  MonthlyData,
  SalesTrendData,
} from './dashboard.types';

// Re-export Reports types from admin-reports feature
// (For backwards compatibility during migration)
export type {
  ReportFilters,
  ReportPeriod,
  SalesReport,
  SalesSummary,
  TopProductReport,
  DailyTrendData,
  PaymentMethodBreakdown,
  OrderTypeBreakdown,
  ProductsReport,
  InventorySummary,
  InventoryValuation,
  OutOfStockProduct,
  TopSellingProduct,
  SlowMovingProduct,
  OrdersReport,
  OrdersSummary,
  StatusBreakdown,
  OrderDetail,
  ExportFormat,
  ReportType,
  ExportOptions,
} from '@/features/admin-reports/types';

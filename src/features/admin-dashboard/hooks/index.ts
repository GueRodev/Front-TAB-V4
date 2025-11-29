/**
 * Admin Dashboard Hooks
 * Barrel export for all dashboard hooks
 */

// Dashboard metrics
export { useDashboardMetrics } from './useDashboardMetrics';

// Analytics
export {
  useYearlyAnalytics,
  useMonthlyBreakdown,
  useCompareYears,
  useTopMonths,
} from './useAnalytics';

// Re-export Reports hooks from admin-reports feature
// (For backwards compatibility during migration)
export {
  useSalesReport,
  useMonthlySalesReport,
  useProductsReport,
  useProductsPerformanceReport,
  useOrdersReport,
  useOrdersAuditReport,
  usePendingOrdersReport,
  useReportExport,
  useExportSalesReport,
  useExportProductsReport,
  useExportOrdersReport,
} from '@/features/admin-reports/hooks';
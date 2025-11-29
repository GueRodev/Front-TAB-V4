/**
 * Admin Dashboard Components
 * Barrel export for all dashboard components
 */

// Dashboard components
export { MetricCard } from './MetricCard';
export { MetricsGrid } from './MetricsGrid';
export { QuickSummaryCard } from './QuickSummaryCard';
export { SalesChart } from './SalesChart';
export { RecentOrdersTable } from './RecentOrdersTable';
export { TopProductsTable } from './TopProductsTable';

// Analytics components
export { DateRangeFilter } from './DateRangeFilter';
export { YearSelector } from './YearSelector';
export { ProfitMetricCard } from './ProfitMetricCard';
export { MonthlyBreakdownChart } from './MonthlyBreakdownChart';
export { YearComparisonChart } from './YearComparisonChart';

// Re-export shared components
export { LoadingState, ErrorState, EmptyTableRow } from '@/components/shared';
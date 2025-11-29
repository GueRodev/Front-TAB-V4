/**
 * Dashboard Metrics Hook
 * Fetches dashboard data from Laravel API with caching
 * ✅ Integrated with backend dashboard endpoints
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services';
import type {
  DashboardMetrics,
  SalesTrendData,
  TopProduct,
  RecentOrder,
} from '../types';

interface UseDashboardMetricsReturn {
  // Overview metrics
  metrics: DashboardMetrics | undefined;
  isLoadingMetrics: boolean;
  metricsError: Error | null;

  // Sales trend (last 7 days)
  chartData: SalesTrendData[] | undefined;
  isLoadingChart: boolean;
  chartError: Error | null;

  // Recent orders
  recentOrders: RecentOrder[] | undefined;
  isLoadingOrders: boolean;
  ordersError: Error | null;

  // Top products
  topProducts: TopProduct[] | undefined;
  isLoadingProducts: boolean;
  productsError: Error | null;

  // Combined states
  isLoading: boolean;
  isError: boolean;

  // Refetch functions
  refetchAll: () => void;
}

/**
 * Main dashboard hook - fetches all dashboard data from API
 * 🔗 LARAVEL: Multiple endpoints with optimized caching
 */
export const useDashboardMetrics = (): UseDashboardMetricsReturn => {
  // Fetch overview metrics (5 min cache)
  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardService.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh
  });

  // Fetch sales trend for last 7 days (10 min cache)
  const {
    data: chartData,
    isLoading: isLoadingChart,
    error: chartError,
    refetch: refetchChart,
  } = useQuery({
    queryKey: ['dashboard', 'sales-trend', 7],
    queryFn: () => dashboardService.getSalesTrend(7),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch recent orders (2 min cache - most dynamic)
  const {
    data: recentOrders,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['dashboard', 'recent-orders', 5],
    queryFn: () => dashboardService.getRecentOrders(5),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000,
  });

  // Fetch top products (15 min cache - changes slowly)
  const {
    data: topProducts,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['dashboard', 'top-products', 5],
    queryFn: () => dashboardService.getTopProducts(5),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Combined loading state
  const isLoading = isLoadingMetrics || isLoadingChart || isLoadingOrders || isLoadingProducts;

  // Combined error state
  const isError = !!(metricsError || chartError || ordersError || productsError);

  // Refetch all data
  const refetchAll = () => {
    refetchMetrics();
    refetchChart();
    refetchOrders();
    refetchProducts();
  };

  return {
    // Data
    metrics,
    chartData,
    recentOrders,
    topProducts,

    // Individual loading states
    isLoadingMetrics,
    isLoadingChart,
    isLoadingOrders,
    isLoadingProducts,

    // Individual error states
    metricsError: metricsError as Error | null,
    chartError: chartError as Error | null,
    ordersError: ordersError as Error | null,
    productsError: productsError as Error | null,

    // Combined states
    isLoading,
    isError,

    // Actions
    refetchAll,
  };
};
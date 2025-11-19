/**
 * Dashboard Metrics Business Logic Hook
 * Centralizes all dashboard data processing and calculations
 */

import { useMemo } from 'react';
import { useOrders } from '@/features/orders';
import {
  calculateOrderMetrics,
  getTopProducts,
  getUniqueProductsCount,
  getRecentOrders,
  prepareChartData,
  type OrderMetrics,
  type ChartDataPoint,
} from '@/features/orders/helpers';
import type { Order } from '@/features/orders/types';

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface UseDashboardMetricsReturn {
  metrics: OrderMetrics;
  chartData: ChartDataPoint[];
  recentOrders: Order[];
  topProducts: TopProduct[];
  uniqueProducts: number;
}

export const useDashboardMetrics = (): UseDashboardMetricsReturn => {
  const { orders } = useOrders();

  // Calculate all metrics
  const metrics = useMemo(() => calculateOrderMetrics(orders), [orders]);

  // Prepare chart data for last 7 days
  const chartData = useMemo(() => prepareChartData(orders, 7), [orders]);

  // Get recent orders (last 5)
  const recentOrders = useMemo(() => getRecentOrders(orders, 5), [orders]);

  // Get top selling products (top 5)
  const topProducts = useMemo(() => getTopProducts(orders, 5), [orders]);

  // Count unique products sold
  const uniqueProducts = useMemo(() => getUniqueProductsCount(orders), [orders]);

  return {
    metrics,
    chartData,
    recentOrders,
    topProducts,
    uniqueProducts,
  };
};
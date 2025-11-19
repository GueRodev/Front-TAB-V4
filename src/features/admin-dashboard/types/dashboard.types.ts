/**
 * Dashboard Type Definitions
 */

import type { Order } from '@/features/orders/types';

export interface DashboardMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
}

export interface ChartDataPoint {
  fecha: string;
  ingresos: number;
  ventas: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export type RecentOrder = Order;

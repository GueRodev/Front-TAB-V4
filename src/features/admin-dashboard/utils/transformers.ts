/**
 * Dashboard Transformers
 * Bidirectional transformations between Laravel API and Frontend formats
 */

import type {
  RecentOrder,
  TopProduct,
  DashboardMetrics,
  SalesTrendData,
  QuickSummary
} from '../types';

/**
 * Laravel → Frontend: Transform Laravel recent order to frontend format
 */
export function transformLaravelRecentOrder(laravelOrder: any): RecentOrder {
  return {
    id: String(laravelOrder.id),
    order_number: laravelOrder.order_number,
    customerInfo: {
      name: laravelOrder.customer_name || 'Guest',
      email: laravelOrder.customer_email || '',
      phone: '', // Not provided by dashboard endpoint
    },
    total: Number(laravelOrder.total),
    status: laravelOrder.status,
    createdAt: laravelOrder.created_at,
  };
}

/**
 * Laravel → Frontend: Transform Laravel top product to frontend format
 */
export function transformLaravelTopProduct(laravelProduct: any): TopProduct {
  const revenue = Number(laravelProduct.revenue);
  const profit = Number(laravelProduct.profit || 0);
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    id: laravelProduct.product_id,
    name: laravelProduct.product_name,
    sku: laravelProduct.sku,
    quantity: Number(laravelProduct.quantity_sold),
    revenue,
    profit,
    profitMargin,
  };
}

/**
 * Laravel → Frontend: Transform Laravel dashboard metrics to frontend format
 */
export function transformLaravelDashboardMetrics(laravelMetrics: any): DashboardMetrics {
  return {
    totalRevenue: Number(laravelMetrics.total_revenue),
    monthlyRevenue: Number(laravelMetrics.monthly_revenue),
    dailyRevenue: Number(laravelMetrics.daily_revenue),
    pendingOrders: Number(laravelMetrics.pending_orders),
    completedOrders: Number(laravelMetrics.completed_orders),
    averageOrderValue: Number(laravelMetrics.average_order_value),
    totalProfit: Number(laravelMetrics.total_profit || 0),
    monthlyProfit: Number(laravelMetrics.monthly_profit || 0),
    profitMargin: Number(laravelMetrics.profit_margin || 0),
  };
}

/**
 * Laravel → Frontend: Transform Laravel sales trend data to frontend format
 */
export function transformLaravelSalesTrend(laravelTrend: any): SalesTrendData {
  return {
    date: laravelTrend.date,
    formatted_date: laravelTrend.formatted_date,
    revenue: Number(laravelTrend.revenue),
    profit: Number(laravelTrend.profit || 0),
    orders: Number(laravelTrend.orders),
  };
}

/**
 * Laravel → Frontend: Transform Laravel quick summary to frontend format
 */
export function transformLaravelQuickSummary(laravelSummary: any): QuickSummary {
  return {
    today_revenue: Number(laravelSummary.today_revenue || 0),
    today_orders: Number(laravelSummary.today_orders || 0),
    pending_orders: Number(laravelSummary.pending_orders || 0),
    low_stock_count: Number(laravelSummary.low_stock_count || 0),
  };
}

// ========================================================================
// REPORTS TRANSFORMERS
// Re-exported from admin-reports feature for backwards compatibility
// ========================================================================

export {
  transformLaravelSalesReport,
  transformLaravelProductsReport,
  transformLaravelOrdersReport,
} from '@/features/admin-reports/utils';

/**
 * Dashboard Type Definitions
 */

// ========================================================================
// DASHBOARD METRICS
// ========================================================================

export interface DashboardMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  // Nuevas métricas de profit
  totalProfit?: number;
  monthlyProfit?: number;
  profitMargin?: number;
}

export interface ChartDataPoint {
  fecha: string;
  ingresos: number;
  ventas: number;
  ganancia?: number; // Nuevo: profit por día
}

export interface TopProduct {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
  profit?: number;
  profitMargin?: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

// ========================================================================
// ANALYTICS (YEARLY)
// ========================================================================

export interface YearlyAnalytics {
  year: number;
  summary: YearlySummary;
  monthly_breakdown: MonthlyData[];
  best_month: MonthlyData | null;
  worst_month: MonthlyData | null;
}

export interface YearlySummary {
  total_revenue: number;
  total_profit: number;
  profit_margin: number;
  total_orders: number;
  average_order_value: number;
  unique_products_sold: number;
}

export interface MonthlyData {
  month: number;
  month_name: string;
  month_short: string;
  revenue: number;
  profit: number;
  orders: number;
  average_order_value: number;
  profit_margin: number;
}

// ========================================================================
// SALES TREND
// ========================================================================

export interface SalesTrendData {
  date: string;
  formatted_date: string;
  revenue: number;
  profit: number;
  orders: number;
}

// ========================================================================
// QUICK SUMMARY
// ========================================================================

export interface QuickSummary {
  today_revenue: number;
  today_orders: number;
  pending_orders: number;
  low_stock_count: number;
}

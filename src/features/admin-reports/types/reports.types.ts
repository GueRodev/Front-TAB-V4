/**
 * Admin Reports Type Definitions
 * Types for all report-related functionality
 */

// ========================================================================
// REPORT FILTERS & OPTIONS
// ========================================================================

export interface ReportFilters {
  start_date: string;
  end_date: string;
  status?: string;
  order_type?: string;
  payment_method?: string;
  category_id?: number;
}

export type ExportFormat = 'pdf' | 'excel';
export type ReportType = 'sales' | 'products' | 'orders';

export interface ExportOptions {
  reportType: ReportType;
  format: ExportFormat;
  filters: ReportFilters;
}

export interface ReportPeriod {
  start_date: string;
  end_date: string;
  days: number;
}

// ========================================================================
// SALES REPORT TYPES
// ========================================================================

export interface SalesReport {
  period: ReportPeriod;
  summary: SalesSummary;
  top_products: TopProductReport[];
  daily_trend: DailyTrendData[];
  payment_breakdown: PaymentMethodBreakdown[];
  order_type_breakdown: OrderTypeBreakdown[];
  generated_at: string;
}

export interface SalesSummary {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_margin: number;
  total_orders: number;
  total_items_sold: number;
  average_order_value: number;
}

export interface TopProductReport {
  product_id: number;
  product_name: string;
  sku: string;
  quantity_sold: number;
  revenue: number;
  cost: number;
  profit: number;
  profit_margin: number;
}

export interface DailyTrendData {
  date: string;
  formatted_date: string;
  day_name: string;
  revenue: number;
  profit: number;
  orders: number;
  items_sold: number;
}

export interface PaymentMethodBreakdown {
  payment_method: string;
  total: number;
  orders: number;
  average: number;
}

export interface OrderTypeBreakdown {
  order_type: string;
  total: number;
  orders: number;
  average: number;
}

// ========================================================================
// PRODUCTS REPORT TYPES
// ========================================================================

export interface ProductsReport {
  summary: InventorySummary;
  products: ProductDetail[];
  out_of_stock_products: OutOfStockProduct[];
  top_selling_products: TopSellingProduct[];
  slow_moving_products: SlowMovingProduct[];
  inventory_valuation?: InventoryValuation;
  generated_at: string;
}

export interface ProductDetail {
  product_id: number;
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  current_stock: number;
  sale_price: number;
  cost_price: number;
  inventory_value: number;
  status: string;
}

export interface InventorySummary {
  total_products: number;
  active_products: number;
  inactive_products?: number;
  out_of_stock_count: number;
  in_stock_count: number;
  total_stock_units?: number;
  total_inventory_value: number;
  average_product_value: number;
}

export interface InventoryValuation {
  total_value_at_sale_price: number;
  total_value_at_cost_price: number;
  potential_profit: number;
}

export interface OutOfStockProduct {
  product_id: number;
  name: string;
  sku: string;
  category: string;
  status: string;
  last_updated: string;
}

export interface TopSellingProduct {
  product_id: number;
  product_name: string;
  sku: string;
  category: string;
  current_stock: number;
  total_sold: number;
  total_revenue: number;
}

export interface SlowMovingProduct {
  product_id: number;
  product_name: string;
  sku: string;
  category: string;
  current_stock: number;
  total_sold: number;
  total_revenue: number;
}

// ========================================================================
// ORDERS REPORT TYPES
// ========================================================================

export interface OrdersReport {
  period: ReportPeriod;
  summary: OrdersSummary;
  status_breakdown: StatusBreakdown[];
  order_type_breakdown: OrderTypeBreakdown[];
  payment_method_breakdown: PaymentMethodBreakdown[];
  orders: OrderDetail[];
  generated_at: string;
}

export interface OrdersSummary {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface OrderDetail {
  order_id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  order_type: string;
  status: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  items_count: number;
  created_at: string;
  completed_at?: string;
  completed_by?: string;
}

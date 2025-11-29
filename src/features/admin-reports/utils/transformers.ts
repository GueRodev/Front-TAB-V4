/**
 * Reports Transformers
 * Bidirectional transformations between Laravel API and Frontend formats
 */

/**
 * Laravel → Frontend: Transform Laravel sales report to frontend format
 */
export function transformLaravelSalesReport(laravelReport: any): any {
  return {
    period: laravelReport.period,
    summary: laravelReport.summary,
    top_products: laravelReport.top_products || [],
    daily_trend: laravelReport.daily_trend || [],
    // Transform payment_methods → payment_breakdown
    payment_breakdown: (laravelReport.payment_methods || []).map((item: any) => ({
      payment_method: item.payment_method,
      total: Number(item.total_revenue),
      orders: Number(item.orders_count),
      average: Number(item.average_order_value || 0),
    })),
    // Transform order_types → order_type_breakdown
    order_type_breakdown: (laravelReport.order_types || []).map((item: any) => ({
      order_type: item.order_type,
      total: Number(item.total_revenue),
      orders: Number(item.orders_count),
      average: Number(item.average_order_value || 0),
    })),
    generated_at: laravelReport.generated_at,
  };
}

/**
 * Laravel → Frontend: Transform Laravel products report to frontend format
 */
export function transformLaravelProductsReport(laravelReport: any): any {
  return {
    summary: laravelReport.summary,
    products: laravelReport.products || [],
    out_of_stock_products: laravelReport.out_of_stock_products || [],
    top_selling_products: laravelReport.top_selling_products || [],
    slow_moving_products: laravelReport.slow_moving_products || [],
    inventory_valuation: laravelReport.inventory_valuation,
    generated_at: laravelReport.generated_at,
  };
}

/**
 * Laravel → Frontend: Transform Laravel orders report to frontend format
 */
export function transformLaravelOrdersReport(laravelReport: any): any {
  return {
    period: laravelReport.period,
    summary: laravelReport.summary,
    orders: laravelReport.orders || [],
    status_breakdown: laravelReport.status_breakdown || [],
    order_type_breakdown: laravelReport.order_type_breakdown || [],
    payment_method_breakdown: laravelReport.payment_method_breakdown || [],
    generated_at: laravelReport.generated_at,
  };
}

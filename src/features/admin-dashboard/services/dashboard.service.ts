/**
 * Dashboard Service
 * API service for dashboard metrics and analytics
 * ✅ Fully integrated with Laravel backend
 */

import type {
  DashboardMetrics,
  SalesTrendData,
  TopProduct,
  RecentOrder,
  QuickSummary,
} from '../types/dashboard.types';
import type { ApiResponse } from '@/api/types';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/api/constants';
import {
  transformLaravelDashboardMetrics,
  transformLaravelRecentOrder,
  transformLaravelTopProduct,
  transformLaravelSalesTrend,
  transformLaravelQuickSummary,
} from '../utils/transformers';

/**
 * Dashboard Service
 * Handles all dashboard-related API operations with Laravel backend
 */
export const dashboardService = {
  /**
   * Get dashboard overview metrics
   * 🔗 LARAVEL: GET /api/v1/dashboard/overview
   */
  async getOverview(): Promise<DashboardMetrics> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.DASHBOARD_OVERVIEW);
    return transformLaravelDashboardMetrics(response.data.data);
  },

  /**
   * Get sales trend for last N days
   * 🔗 LARAVEL: GET /api/v1/dashboard/sales-trend?days={days}
   */
  async getSalesTrend(days: number = 7): Promise<SalesTrendData[]> {
    const response = await api.get<ApiResponse<any[]>>(API_ENDPOINTS.DASHBOARD_SALES_TREND, {
      params: { days },
    });
    return response.data.data.map(transformLaravelSalesTrend);
  },

  /**
   * Get recent orders
   * 🔗 LARAVEL: GET /api/v1/dashboard/recent-orders?limit={limit}
   */
  async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    const response = await api.get<ApiResponse<any[]>>(API_ENDPOINTS.DASHBOARD_RECENT_ORDERS, {
      params: { limit },
    });
    return response.data.data.map(transformLaravelRecentOrder);
  },

  /**
   * Get top selling products
   * 🔗 LARAVEL: GET /api/v1/dashboard/top-products?limit={limit}
   */
  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    const response = await api.get<ApiResponse<any[]>>(API_ENDPOINTS.DASHBOARD_TOP_PRODUCTS, {
      params: { limit },
    });
    return response.data.data.map(transformLaravelTopProduct);
  },

  /**
   * Get quick summary
   * 🔗 LARAVEL: GET /api/v1/dashboard/quick-summary
   */
  async getQuickSummary(): Promise<QuickSummary> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.DASHBOARD_QUICK_SUMMARY);
    return transformLaravelQuickSummary(response.data.data);
  },
};

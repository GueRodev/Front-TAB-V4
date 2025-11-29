/**
 * Analytics Service
 * API service for yearly analytics and comparisons
 * ✅ Fully integrated with Laravel backend
 */

import type {
  YearlyAnalytics,
  MonthlyData,
} from '../types/dashboard.types';
import type { ApiResponse } from '@/api/types';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/api/constants';

/**
 * Analytics Service
 * Handles all analytics-related API operations with Laravel backend
 */
export const analyticsService = {
  /**
   * Get yearly analytics for a specific year
   * 🔗 LARAVEL: GET /api/v1/analytics/yearly?year={year}
   */
  async getYearlyAnalytics(year: number): Promise<YearlyAnalytics> {
    const response = await api.get<ApiResponse<YearlyAnalytics>>(API_ENDPOINTS.ANALYTICS_YEARLY, {
      params: { year },
    });
    return response.data.data;
  },

  /**
   * Get monthly breakdown for a specific year
   * 🔗 LARAVEL: GET /api/v1/analytics/monthly-breakdown?year={year}
   */
  async getMonthlyBreakdown(year: number): Promise<MonthlyData[]> {
    const response = await api.get<ApiResponse<MonthlyData[]>>(API_ENDPOINTS.ANALYTICS_MONTHLY_BREAKDOWN, {
      params: { year },
    });
    return response.data.data;
  },

  /**
   * Compare two years
   * 🔗 LARAVEL: GET /api/v1/analytics/compare-years?year1={year1}&year2={year2}
   */
  async compareYears(year1: number, year2: number): Promise<any> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.ANALYTICS_COMPARE_YEARS, {
      params: { year1, year2 },
    });
    return response.data.data;
  },

  /**
   * Get top months with best sales all time
   * 🔗 LARAVEL: GET /api/v1/analytics/top-months?limit={limit}
   */
  async getTopMonths(limit: number = 12): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(API_ENDPOINTS.ANALYTICS_TOP_MONTHS, {
      params: { limit },
    });
    return response.data.data;
  },
};

/**
 * Analytics Hook
 * Fetches yearly analytics data from Laravel API
 * ✅ Integrated with backend analytics endpoints
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services';
import type { YearlyAnalytics, MonthlyData } from '../types';

/**
 * Fetch yearly analytics
 * 🔗 LARAVEL: GET /api/v1/analytics/yearly
 */
export const useYearlyAnalytics = (year: number) => {
  return useQuery({
    queryKey: ['analytics', 'yearly', year],
    queryFn: () => analyticsService.getYearlyAnalytics(year),
    staleTime: 24 * 60 * 60 * 1000, // 1 day (historical data)
    enabled: year >= 2000 && year <= 2100,
  });
};

/**
 * Fetch monthly breakdown for a year
 * 🔗 LARAVEL: GET /api/v1/analytics/monthly-breakdown
 */
export const useMonthlyBreakdown = (year: number) => {
  return useQuery({
    queryKey: ['analytics', 'monthly-breakdown', year],
    queryFn: () => analyticsService.getMonthlyBreakdown(year),
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    enabled: year >= 2000 && year <= 2100,
  });
};

/**
 * Compare two years
 * 🔗 LARAVEL: GET /api/v1/analytics/compare-years
 */
export const useCompareYears = (year1: number, year2: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['analytics', 'compare', year1, year2],
    queryFn: () => analyticsService.compareYears(year1, year2),
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    enabled: enabled && year1 >= 2000 && year2 >= 2000 && year1 !== year2,
  });
};

/**
 * Fetch top months all time
 * 🔗 LARAVEL: GET /api/v1/analytics/top-months
 */
export const useTopMonths = (limit: number = 12) => {
  return useQuery({
    queryKey: ['analytics', 'top-months', limit],
    queryFn: () => analyticsService.getTopMonths(limit),
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    enabled: limit > 0 && limit <= 120,
  });
};

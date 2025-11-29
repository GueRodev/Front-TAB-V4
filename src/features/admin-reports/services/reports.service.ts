/**
 * Reports Service
 * API service for generating and exporting reports
 * ✅ Fully integrated with Laravel backend
 */

import type {
  SalesReport,
  ProductsReport,
  OrdersReport,
  ReportFilters,
  ExportFormat,
  ReportType,
} from '../types';
import type { ApiResponse } from '@/api/types';
import { api } from '@/api';
import { API_ENDPOINTS } from '@/api/constants';
import {
  transformLaravelSalesReport,
  transformLaravelProductsReport,
  transformLaravelOrdersReport,
} from '../utils/transformers';

/**
 * Reports Service
 * Handles all report generation and export operations with Laravel backend
 */
export const reportsService = {
  // ========================================================================
  // SALES REPORTS
  // ========================================================================

  /**
   * Generate sales report (JSON)
   * 🔗 LARAVEL: GET /api/v1/reports/sales
   */
  async getSalesReport(filters: ReportFilters): Promise<SalesReport> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.REPORTS_SALES, {
      params: filters,
    });
    return transformLaravelSalesReport(response.data.data);
  },

  /**
   * Generate monthly sales report (JSON)
   * 🔗 LARAVEL: GET /api/v1/reports/sales/monthly
   */
  async getMonthlySalesReport(year: number): Promise<any> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.REPORTS_SALES_MONTHLY, {
      params: { year },
    });
    return response.data.data;
  },

  // ========================================================================
  // PRODUCTS REPORTS
  // ========================================================================

  /**
   * Generate products/inventory report (JSON)
   * 🔗 LARAVEL: GET /api/v1/reports/products
   */
  async getProductsReport(filters?: { category_id?: number; status?: string }): Promise<ProductsReport> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.REPORTS_PRODUCTS, {
      params: filters,
    });
    return transformLaravelProductsReport(response.data.data);
  },

  /**
   * Generate products performance report (JSON)
   * 🔗 LARAVEL: GET /api/v1/reports/products/performance
   */
  async getProductsPerformanceReport(filters: ReportFilters): Promise<any> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.REPORTS_PRODUCTS_PERFORMANCE, {
      params: filters,
    });
    return response.data.data;
  },

  // ========================================================================
  // ORDERS REPORTS
  // ========================================================================

  /**
   * Generate orders report (JSON)
   * 🔗 LARAVEL: GET /api/v1/reports/orders
   */
  async getOrdersReport(filters: ReportFilters): Promise<OrdersReport> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.REPORTS_ORDERS, {
      params: filters,
    });
    return transformLaravelOrdersReport(response.data.data);
  },

  /**
   * Generate orders audit report (JSON)
   * 🔗 LARAVEL: GET /api/v1/reports/orders/audit
   */
  async getOrdersAuditReport(filters: { start_date: string; end_date: string }): Promise<any> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.REPORTS_ORDERS_AUDIT, {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Generate pending orders report (JSON)
   * 🔗 LARAVEL: GET /api/v1/reports/orders/pending
   */
  async getPendingOrdersReport(): Promise<any> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.REPORTS_ORDERS_PENDING);
    return response.data.data;
  },

  // ========================================================================
  // EXPORTS (PDF & EXCEL)
  // ========================================================================

  /**
   * Export sales report
   * 🔗 LARAVEL: GET /api/v1/reports/sales/export/{format}
   */
  async exportSalesReport(filters: ReportFilters, format: ExportFormat): Promise<Blob> {
    const response = await api.get(`/v1/reports/sales/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export products report
   * 🔗 LARAVEL: GET /api/v1/reports/products/export/{format}
   */
  async exportProductsReport(filters: any, format: ExportFormat): Promise<Blob> {
    const response = await api.get(`/v1/reports/products/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export orders report
   * 🔗 LARAVEL: GET /api/v1/reports/orders/export/{format}
   */
  async exportOrdersReport(filters: ReportFilters, format: ExportFormat): Promise<Blob> {
    const response = await api.get(`/v1/reports/orders/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Helper: Download blob as file
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Helper: Generate filename for export
   */
  generateFilename(reportType: ReportType, format: ExportFormat, filters: ReportFilters): string {
    const date = new Date().toISOString().split('T')[0];
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';

    if (filters.start_date && filters.end_date) {
      return `reporte_${reportType}_${filters.start_date}_${filters.end_date}.${extension}`;
    }

    return `reporte_${reportType}_${date}.${extension}`;
  },
};

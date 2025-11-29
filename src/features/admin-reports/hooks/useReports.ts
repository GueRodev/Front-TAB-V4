/**
 * Reports Hook
 * Handles report generation and export functionality
 * ✅ Integrated with backend reports endpoints
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsService } from '../services';
import type {
  ReportFilters,
  SalesReport,
  ProductsReport,
  OrdersReport,
  ExportFormat,
  ReportType,
} from '../types';
import { useState } from 'react';

// ========================================================================
// SALES REPORTS HOOKS
// ========================================================================

/**
 * Fetch sales report data
 * 🔗 LARAVEL: GET /api/v1/reports/sales
 */
export const useSalesReport = (filters: ReportFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['reports', 'sales', filters],
    queryFn: () => reportsService.getSalesReport(filters),
    enabled: enabled && !!filters.start_date && !!filters.end_date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch monthly sales report
 * 🔗 LARAVEL: GET /api/v1/reports/sales/monthly
 */
export const useMonthlySalesReport = (year: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['reports', 'sales', 'monthly', year],
    queryFn: () => reportsService.getMonthlySalesReport(year),
    enabled: enabled && year >= 2000 && year <= 2100,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });
};

// ========================================================================
// PRODUCTS REPORTS HOOKS
// ========================================================================

/**
 * Fetch products/inventory report
 * 🔗 LARAVEL: GET /api/v1/reports/products
 */
export const useProductsReport = (filters?: { category_id?: number; status?: string }) => {
  return useQuery({
    queryKey: ['reports', 'products', filters],
    queryFn: () => reportsService.getProductsReport(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch products performance report
 * 🔗 LARAVEL: GET /api/v1/reports/products/performance
 */
export const useProductsPerformanceReport = (filters: ReportFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['reports', 'products', 'performance', filters],
    queryFn: () => reportsService.getProductsPerformanceReport(filters),
    enabled: enabled && !!filters.start_date && !!filters.end_date,
    staleTime: 5 * 60 * 1000,
  });
};

// ========================================================================
// ORDERS REPORTS HOOKS
// ========================================================================

/**
 * Fetch orders report
 * 🔗 LARAVEL: GET /api/v1/reports/orders
 */
export const useOrdersReport = (filters: ReportFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['reports', 'orders', filters],
    queryFn: () => reportsService.getOrdersReport(filters),
    enabled: enabled && !!filters.start_date && !!filters.end_date,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch orders audit report
 * 🔗 LARAVEL: GET /api/v1/reports/orders/audit
 */
export const useOrdersAuditReport = (
  filters: { start_date: string; end_date: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['reports', 'orders', 'audit', filters],
    queryFn: () => reportsService.getOrdersAuditReport(filters),
    enabled: enabled && !!filters.start_date && !!filters.end_date,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch pending orders report
 * 🔗 LARAVEL: GET /api/v1/reports/orders/pending
 */
export const usePendingOrdersReport = () => {
  return useQuery({
    queryKey: ['reports', 'orders', 'pending'],
    queryFn: () => reportsService.getPendingOrdersReport(),
    staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic)
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

// ========================================================================
// EXPORT HOOKS
// ========================================================================

/**
 * Hook for exporting reports to PDF or Excel
 * Handles download state and file generation
 */
export const useReportExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportReport = async (
    reportType: ReportType,
    format: ExportFormat,
    filters: ReportFilters
  ) => {
    setIsExporting(true);
    setExportError(null);

    try {
      let blob: Blob;

      // Call appropriate export service based on report type
      switch (reportType) {
        case 'sales':
          blob = await reportsService.exportSalesReport(filters, format);
          break;
        case 'products':
          blob = await reportsService.exportProductsReport(filters, format);
          break;
        case 'orders':
          blob = await reportsService.exportOrdersReport(filters, format);
          break;
        default:
          throw new Error(`Tipo de reporte no soportado: ${reportType}`);
      }

      // Generate filename and download
      const filename = reportsService.generateFilename(reportType, format, filters);
      reportsService.downloadFile(blob, filename);

      setIsExporting(false);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al exportar el reporte';
      setExportError(errorMessage);
      setIsExporting(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    exportReport,
    isExporting,
    exportError,
  };
};

/**
 * Mutation hook for exporting sales report
 */
export const useExportSalesReport = () => {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: ReportFilters;
      format: ExportFormat;
    }) => reportsService.exportSalesReport(filters, format),
    onSuccess: (blob, variables) => {
      const filename = reportsService.generateFilename('sales', variables.format, variables.filters);
      reportsService.downloadFile(blob, filename);
    },
  });
};

/**
 * Mutation hook for exporting products report
 */
export const useExportProductsReport = () => {
  return useMutation({
    mutationFn: ({ filters, format }: { filters: any; format: ExportFormat }) =>
      reportsService.exportProductsReport(filters, format),
    onSuccess: (blob, variables) => {
      const filename = `reporte_productos_${new Date().toISOString().split('T')[0]}.${
        variables.format === 'pdf' ? 'pdf' : 'xlsx'
      }`;
      reportsService.downloadFile(blob, filename);
    },
  });
};

/**
 * Mutation hook for exporting orders report
 */
export const useExportOrdersReport = () => {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: ReportFilters;
      format: ExportFormat;
    }) => reportsService.exportOrdersReport(filters, format),
    onSuccess: (blob, variables) => {
      const filename = reportsService.generateFilename('orders', variables.format, variables.filters);
      reportsService.downloadFile(blob, filename);
    },
  });
};

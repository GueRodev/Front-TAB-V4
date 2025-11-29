/**
 * Admin Dashboard Services
 * Centralized export for all dashboard services
 */

export { dashboardService } from './dashboard.service';
export { analyticsService } from './analytics.service';

// Re-export Reports service from admin-reports feature
// (For backwards compatibility during migration)
export { reportsService } from '@/features/admin-reports/services';

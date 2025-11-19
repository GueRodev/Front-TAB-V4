/**
 * Dashboard Helpers
 * Utility functions for formatting and processing dashboard data
 */

import { formatCurrency } from '@/lib/formatters';

/**
 * Formats tooltip values for the sales chart
 */
export const formatChartTooltip = (value: number, name: string): [string, string] => {
  if (name === 'ingresos') return [formatCurrency(value), 'Ingresos'];
  return [value.toString(), 'Ventas'];
};

/**
 * Formats order ID to display format (first 8 characters with #)
 */
export const formatOrderId = (orderId: string): string => {
  return `#${orderId.slice(0, 8)}`;
};

/**
 * Gets the current month description for metrics
 */
export const getMonthlyDescription = (): string => {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `Ventas en ${months[new Date().getMonth()]}`;
};

/**
 * Returns chart margins configuration
 */
export const getChartMargins = () => ({
  bottom: 20,
  left: 0,
  right: 10,
  top: 10,
});

/**
 * Returns tooltip style configuration
 */
export const getTooltipStyle = () => ({
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
});

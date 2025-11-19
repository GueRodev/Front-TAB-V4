/**
 * Formatting Utilities
 * Centralized functions for consistent data formatting
 */

import { CURRENCY_CONFIG } from '@/config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format currency using app configuration
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format currency with custom symbol (for compatibility)
 */
export const formatPrice = (amount: number): string => {
  return `${CURRENCY_CONFIG.symbol}${amount.toFixed(2)}`;
};

/**
 * Format date with customizable format string
 */
export const formatDate = (date: string | Date, formatString: string = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: es });
};


/**
 * Format date with time (dd/MM/yyyy HH:mm)
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};



/**
 * Format file size in bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))}${sizes[i]}`;
};

/**
 * ProfitMetricCard Component
 * Enhanced metric card showing revenue, cost, and profit
 * ✅ Used for financial metrics with profit breakdown
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

interface ProfitMetricCardProps {
  title: string;
  revenue: number;
  cost?: number;
  profit?: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'info';
  trend?: {
    value: number;
    label: string;
  };
}

const variantStyles = {
  default: 'text-primary',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
};

export const ProfitMetricCard: React.FC<ProfitMetricCardProps> = ({
  title,
  revenue,
  cost,
  profit,
  icon: Icon,
  variant = 'default',
  trend,
}) => {
  const profitMargin = cost && revenue > 0 ? ((revenue - cost) / revenue) * 100 : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-5 w-5', variantStyles[variant])} />
      </CardHeader>
      <CardContent>
        {/* Main Revenue Value */}
        <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>

        {/* Cost Breakdown */}
        {cost !== undefined && (
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Costo:</span>
              <span>{formatCurrency(cost)}</span>
            </div>

            {profit !== undefined && (
              <div className="flex justify-between font-medium">
                <span className="text-green-600">Ganancia:</span>
                <span className="text-green-600">
                  {formatCurrency(profit)}
                </span>
              </div>
            )}

            {profitMargin !== null && (
              <div className="flex justify-between text-muted-foreground">
                <span>Margen:</span>
                <span className={cn(profitMargin >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-1 mt-3 pt-2 border-t">
            {trend.value >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                'text-xs font-medium',
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

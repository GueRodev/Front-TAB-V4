/**
 * MetricsGrid Component
 * Displays the main metric cards in a responsive grid
 */

import React from 'react';
import { MetricCard } from './MetricCard';
import { DollarSign, TrendingUp, Clock, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { getMonthlyDescription } from '../helpers';
import type { DashboardMetrics } from '../types';

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <MetricCard
        title="Ingresos Totales"
        value={formatCurrency(metrics.totalRevenue)}
        icon={DollarSign}
        description={`${metrics.completedOrders} ventas completadas`}
        variant="default"
      />
      <MetricCard
        title="Ventas del Mes"
        value={formatCurrency(metrics.monthlyRevenue)}
        icon={TrendingUp}
        description={getMonthlyDescription()}
        variant="success"
      />
      <MetricCard
        title="Ventas de Hoy"
        value={formatCurrency(metrics.dailyRevenue)}
        icon={Clock}
        description="Ingresos del día"
        variant="info"
      />
      <MetricCard
        title="Pedidos Pendientes"
        value={metrics.pendingOrders}
        icon={ShoppingCart}
        description="Requieren atención"
        variant="warning"
      />
    </div>
  );
};
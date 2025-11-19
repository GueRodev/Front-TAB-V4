/**
 * QuickSummaryCard Component
 * Displays quick summary metrics in a grid layout
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { DashboardMetrics } from '../types';

interface QuickSummaryCardProps {
  metrics: DashboardMetrics;
  uniqueProducts: number;
}

export const QuickSummaryCard: React.FC<QuickSummaryCardProps> = ({ 
  metrics, 
  uniqueProducts 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg lg:text-xl">
          Resumen Rápido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Productos Vendidos</p>
              <p className="text-lg font-bold">{uniqueProducts}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Completados</p>
              <p className="text-lg font-bold">{metrics.completedOrders}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
              <p className="text-lg font-bold">{metrics.pendingOrders}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Promedio/Pedido</p>
              <p className="text-lg font-bold">
                {formatCurrency(metrics.averageOrderValue)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
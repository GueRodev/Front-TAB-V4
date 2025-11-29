/**
 * MonthlyBreakdownChart Component
 * Bar chart showing monthly revenue, cost, and profit breakdown
 * ✅ Uses Recharts for visualization
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyData } from '../types';

interface MonthlyBreakdownChartProps {
  data: MonthlyData[];
  title?: string;
}

const MONTH_NAMES_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export const MonthlyBreakdownChart: React.FC<MonthlyBreakdownChartProps> = ({
  data,
  title = 'Breakdown Mensual',
}) => {
  // Transform data for Recharts
  const chartData = data.map((item) => ({
    month: MONTH_NAMES_SHORT[item.month - 1],
    Ingresos: item.revenue,
    Costos: item.cost,
    Ganancia: item.profit,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            />
            <Legend />
            <Bar dataKey="Ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Costos" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Ganancia" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * YearComparisonChart Component
 * Line chart comparing two years month by month
 * ✅ Used in Analytics page for year-over-year comparison
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyData } from '../types';

interface YearComparisonChartProps {
  year1Data: MonthlyData[];
  year2Data: MonthlyData[];
  year1: number;
  year2: number;
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

export const YearComparisonChart: React.FC<YearComparisonChartProps> = ({
  year1Data,
  year2Data,
  year1,
  year2,
  title = 'Comparación de Años',
}) => {
  // Create comparison data by merging both years
  const chartData = MONTH_NAMES_SHORT.map((monthName, index) => {
    const month = index + 1;
    const year1Item = year1Data.find((d) => d.month === month);
    const year2Item = year2Data.find((d) => d.month === month);

    return {
      month: monthName,
      [`${year1}`]: year1Item?.revenue || 0,
      [`${year2}`]: year2Item?.revenue || 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
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
            <Line
              type="monotone"
              dataKey={`${year1}`}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey={`${year2}`}
              stroke="hsl(220, 70%, 50%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

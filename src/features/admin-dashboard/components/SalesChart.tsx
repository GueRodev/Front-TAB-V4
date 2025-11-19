/**
 * SalesChart Component
 * Displays sales trends over the last 7 days
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatChartTooltip, getChartMargins, getTooltipStyle } from '../helpers';
import type { ChartDataPoint } from '../types';

interface SalesChartProps {
  data: ChartDataPoint[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg lg:text-xl">
          Tendencia de Ventas (Últimos 7 Días)
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Ingresos y cantidad de ventas diarias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={getChartMargins()}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="fecha" 
                tick={{ fontSize: 11 }}
                height={40}
              />
              <YAxis tick={{ fontSize: 11 }} width={60} />
              <Tooltip
                contentStyle={getTooltipStyle()}
                formatter={formatChartTooltip}
              />
              <Line 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#F97316" 
                strokeWidth={2}
                name="ingresos"
              />
              <Line 
                type="monotone" 
                dataKey="ventas" 
                stroke="#1A1F2C" 
                strokeWidth={2}
                name="ventas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
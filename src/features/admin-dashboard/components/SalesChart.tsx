/**
 * SalesChart Component
 * Displays sales trends over the last 7 days
 * ✅ Updated to work with API data (SalesTrendData)
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getChartMargins, getTooltipStyle } from '../helpers';
import type { SalesTrendData } from '../types';

interface SalesChartProps {
  data?: SalesTrendData[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data = [] }) => {
  // Transform API data to chart format
  const chartData = data.map((item) => ({
    fecha: item.formatted_date,
    ingresos: item.revenue,
    ventas: item.orders,
    ganancia: item.profit,
  }));

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
            <LineChart data={chartData} margin={getChartMargins()}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11 }}
                height={40}
              />
              <YAxis tick={{ fontSize: 11 }} width={60} />
              <Tooltip
                contentStyle={getTooltipStyle()}
                formatter={(value: number) => `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
              />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#F97316"
                strokeWidth={2}
                name="Ingresos"
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#1A1F2C"
                strokeWidth={2}
                name="Pedidos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
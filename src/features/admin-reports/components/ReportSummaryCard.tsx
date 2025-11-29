/**
 * ReportSummaryCard Component
 * Summary card for displaying report metrics
 * ✅ Used in Reports pages to show key summary data
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryItem {
  label: string;
  value: string | number;
  className?: string;
}

interface ReportSummaryCardProps {
  title: string;
  items: SummaryItem[];
}

export const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({ title, items }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">{item.label}:</span>
              <span className={`text-sm font-medium ${item.className || ''}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

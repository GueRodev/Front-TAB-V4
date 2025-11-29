/**
 * YearSelector Component
 * Dropdown selector for choosing year in analytics
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
  disabled?: boolean;
  startYear?: number;
  endYear?: number;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  startYear = 2020,
  endYear = new Date().getFullYear(),
}) => {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);

  return (
    <Select value={value.toString()} onValueChange={(val) => onChange(parseInt(val))} disabled={disabled}>
      <SelectTrigger className="w-[180px]">
        <Calendar className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Seleccionar año" />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

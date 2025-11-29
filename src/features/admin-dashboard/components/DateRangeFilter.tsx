/**
 * DateRangeFilter Component
 * Date range picker for filtering reports
 * ✅ Uses shadcn/ui Calendar component
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangeFilterProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  placeholder = 'Seleccionar rango de fechas',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const formatDateRange = (range?: DateRange) => {
    if (!range?.from) return placeholder;

    if (!range.to) {
      return format(range.from, 'dd MMM yyyy', { locale: es });
    }

    return `${format(range.from, 'dd MMM yyyy', { locale: es })} - ${format(
      range.to,
      'dd MMM yyyy',
      { locale: es }
    )}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !value?.from && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range) => {
            onChange(range);
            // Close popover when both dates are selected
            if (range?.from && range?.to) {
              setOpen(false);
            }
          }}
          locale={es}
          numberOfMonths={2}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
};

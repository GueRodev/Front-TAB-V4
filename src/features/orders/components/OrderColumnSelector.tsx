/**
 * Order Column Selector Component
 * Dropdown to toggle visible columns in orders table
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings2 } from 'lucide-react';
import { ORDER_COLUMNS } from '../hooks/useOrderColumns';

interface OrderColumnSelectorProps {
  visibleColumns: string[];
  onToggleColumn: (columnId: string) => void;
  onResetColumns: () => void;
}

export const OrderColumnSelector = ({
  visibleColumns,
  onToggleColumn,
  onResetColumns,
}: OrderColumnSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Columnas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ORDER_COLUMNS.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibleColumns.includes(column.id)}
            onCheckedChange={() => onToggleColumn(column.id)}
            disabled={column.id === 'id' || column.id === 'actions'}
          >
            {column.label}
            {(column.id === 'id' || column.id === 'actions') && (
              <span className="ml-auto text-xs text-muted-foreground">(requerido)</span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={onResetColumns}
          >
            Restablecer columnas
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

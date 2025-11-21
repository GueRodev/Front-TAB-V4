/**
 * Column Selector Component
 * Dropdown to toggle visible columns in products table
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
import { PRODUCT_COLUMNS } from '../hooks/useProductColumns';

interface ColumnSelectorProps {
  visibleColumns: string[];
  onToggleColumn: (columnId: string) => void;
  onResetColumns: () => void;
}

export const ColumnSelector = ({
  visibleColumns,
  onToggleColumn,
  onResetColumns,
}: ColumnSelectorProps) => {
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
        {PRODUCT_COLUMNS.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibleColumns.includes(column.id)}
            onCheckedChange={() => onToggleColumn(column.id)}
            disabled={column.id === 'name' || column.id === 'actions'}
          >
            {column.label}
            {(column.id === 'name' || column.id === 'actions') && (
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

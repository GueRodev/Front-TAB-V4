/**
 * EmptyTableRow Component
 * Reusable component for empty states in tables
 * Shared across Dashboard and Reports features
 */

import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

interface EmptyTableRowProps {
  colSpan: number;
  message: string;
}

export const EmptyTableRow: React.FC<EmptyTableRowProps> = ({ colSpan, message }) => {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-center text-muted-foreground text-xs md:text-sm py-8"
      >
        {message}
      </TableCell>
    </TableRow>
  );
};

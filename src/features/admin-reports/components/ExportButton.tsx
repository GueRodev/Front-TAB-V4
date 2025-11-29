/**
 * ExportButton Component
 * Button for exporting reports to PDF or Excel format
 * ✅ Uses useReportExport hook for download handling
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import type { ExportFormat, ReportType, ReportFilters } from '../types';

interface ExportButtonProps {
  reportType: ReportType;
  filters: ReportFilters | any;
  isExporting?: boolean;
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  reportType,
  filters,
  isExporting = false,
  onExport,
  disabled = false,
}) => {
  const handleExport = (format: ExportFormat) => {
    onExport(format);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar a PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} disabled={isExporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar a Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

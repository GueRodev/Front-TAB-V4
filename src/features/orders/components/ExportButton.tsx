import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";

interface ExportButtonProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExportPDF,
  onExportExcel,
  disabled = false,
  size = 'sm'
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={size} 
          className="text-xs md:text-sm h-8 md:h-9"
          disabled={disabled}
        >
          <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
          Exportar Informe
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportPDF} className="text-xs md:text-sm">
          <FileText className="h-4 w-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel} className="text-xs md:text-sm">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como Excel (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;

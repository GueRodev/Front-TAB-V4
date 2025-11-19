/**
 * Export Utilities
 * Functions for exporting data to different formats
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Order } from '@/features/orders/types';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { getStatusLabel, getTypeLabel } from './order.helpers';
import { toast } from '@/hooks/use-toast';

interface ExportableOrder {
  id: string;
  createdAt: string;
  archivedAt?: string;
  customerName: string;
  customerPhone: string;
  province?: string;
  canton?: string;
  district?: string;
  address?: string;
  type: string;
  status: string;
  paymentMethod: string;
  deliveryOption: string;
  total: number;
  products: string;
}

/**
 * Prepare orders data for export
 */
export const prepareOrdersForExport = (orders: Order[]): ExportableOrder[] => {
  return orders.map(order => ({
    id: order.id,
    createdAt: formatDateTime(order.createdAt),
    archivedAt: order.archivedAt ? formatDateTime(order.archivedAt) : 'N/A',
    customerName: order.customerInfo.name,
    customerPhone: order.customerInfo.phone,
    province: order.delivery_address?.province || 'N/A',
    canton: order.delivery_address?.canton || 'N/A',
    district: order.delivery_address?.district || 'N/A',
    address: order.delivery_address?.address || 'N/A',
    type: getTypeLabel(order.type),
    status: getStatusLabel(order.status),
    paymentMethod: order.paymentMethod || 'N/A',
    deliveryOption: order.deliveryOption === 'delivery' ? 'Envío' : 'Recoger',
    total: order.total,
    products: order.items.map(item => `${item.name} (x${item.quantity})`).join(', '),
  }));
};

/**
 * Export orders to PDF
 */
export const exportOrdersToPDF = (orders: Order[], filename: string = 'historial-pedidos.pdf'): void => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text('Historial de Pedidos', 14, 22);
  
  // Preparar datos para la tabla
  const tableData = orders.map(order => [
    order.id,
    formatDateTime(order.createdAt),
    order.customerInfo.name,
    order.customerInfo.phone,
    getTypeLabel(order.type),
    getStatusLabel(order.status),
    formatCurrency(order.total),
    order.paymentMethod || 'N/A',
  ]);

  // Crear tabla
  autoTable(doc, {
    head: [['ID', 'Fecha', 'Cliente', 'Teléfono', 'Tipo', 'Estado', 'Total', 'Pago']],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(filename);
  
  toast({
    title: "PDF generado",
    description: "El archivo PDF se ha descargado exitosamente",
  });
};

/**
 * Export orders to Excel
 */
export const exportOrdersToExcel = (orders: Order[], filename: string = 'historial-pedidos.xlsx'): void => {
  // Preparar datos
  const excelData = orders.map(order => ({
    'ID': order.id,
    'Fecha Creación': formatDateTime(order.createdAt),
    'Fecha Archivo': order.archivedAt ? formatDateTime(order.archivedAt) : 'N/A',
    'Cliente': order.customerInfo.name,
    'Teléfono': order.customerInfo.phone,
    'Provincia': order.delivery_address?.province || 'N/A',
    'Cantón': order.delivery_address?.canton || 'N/A',
    'Distrito': order.delivery_address?.district || 'N/A',
    'Dirección': order.delivery_address?.address || 'N/A',
    'Tipo': getTypeLabel(order.type),
    'Estado': getStatusLabel(order.status),
    'Método Pago': order.paymentMethod || 'N/A',
    'Opción Entrega': order.deliveryOption === 'delivery' ? 'Envío' : 'Recoger',
    'Total': order.total,
    'Productos': order.items.map(item => `${item.name} (x${item.quantity})`).join(', '),
  }));

  // Crear libro y hoja
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 15 }, // ID
    { wch: 18 }, // Fecha Creación
    { wch: 18 }, // Fecha Archivo
    { wch: 20 }, // Cliente
    { wch: 12 }, // Teléfono
    { wch: 12 }, // Provincia
    { wch: 12 }, // Cantón
    { wch: 12 }, // Distrito
    { wch: 30 }, // Dirección
    { wch: 12 }, // Tipo
    { wch: 12 }, // Estado
    { wch: 15 }, // Método Pago
    { wch: 12 }, // Opción Entrega
    { wch: 12 }, // Total
    { wch: 40 }, // Productos
  ];
  worksheet['!cols'] = columnWidths;

  // Guardar archivo
  XLSX.writeFile(workbook, filename);
  
  toast({
    title: "Excel generado",
    description: "El archivo Excel se ha descargado exitosamente",
  });
};

/**
 * OrdersTable Dynamic Component
 * Table view of orders with dynamic column selection
 */

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrderRowDynamic } from './OrderRowDynamic';
import { OrderColumnSelector } from './OrderColumnSelector';
import { useOrderColumns, ORDER_COLUMNS } from '../hooks/useOrderColumns';
import type { Order } from '../types';

interface OrdersTableDynamicProps {
  orders: Order[];
  onDelete?: (orderId: string, order: Order) => void;
  // onRestore?: (orderId: string) => void; // Restore functionality disabled
}

export const OrdersTableDynamic = ({
  orders,
  onDelete,
  // onRestore, // Restore functionality disabled
}: OrdersTableDynamicProps) => {
  const { visibleColumns, toggleColumn, isColumnVisible, resetToDefaults } = useOrderColumns();

  const hasActions = onDelete; // Removed onRestore - restore functionality disabled

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No hay pedidos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Column selector */}
      <div className="flex justify-end">
        <OrderColumnSelector
          visibleColumns={visibleColumns}
          onToggleColumn={toggleColumn}
          onResetColumns={resetToDefaults}
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                {ORDER_COLUMNS.map((column) => {
                  if (!isColumnVisible(column.id)) return null;
                  // Skip actions column if no actions provided
                  if (column.id === 'actions' && !hasActions) return null;

                  return (
                    <TableHead
                      key={column.id}
                      className={`font-semibold text-gray-700 whitespace-nowrap ${
                        column.id === 'actions' || column.id === 'total' ? 'text-right' : ''
                      } ${column.id === 'products' ? 'text-center' : ''}`}
                    >
                      {column.label}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <OrderRowDynamic
                  key={order.id}
                  order={order}
                  visibleColumns={hasActions ? visibleColumns : visibleColumns.filter(c => c !== 'actions')}
                  onDelete={onDelete}
                  // onRestore={onRestore} // Restore functionality disabled
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

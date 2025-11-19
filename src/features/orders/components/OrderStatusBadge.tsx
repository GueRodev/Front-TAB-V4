/**
 * OrderStatusBadge Component
 * Displays status badge for orders
 */

import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, XCircle } from 'lucide-react';
import type { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const config = {
    pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Package },
    in_progress: { label: 'En Proceso', variant: 'default' as const, icon: Package },
    completed: { label: 'Finalizado', variant: 'default' as const, icon: CheckCircle },
    cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
    archived: { label: 'Archivado', variant: 'secondary' as const, icon: Package },
  };
  
  const { label, variant, icon: Icon } = config[status];
  
  return (
    <Badge variant={variant} className="gap-1 text-xs whitespace-nowrap">
      <Icon className="h-3 w-3 md:h-3.5 md:w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Badge>
  );
};

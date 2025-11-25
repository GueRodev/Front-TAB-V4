/**
 * OrderStatusBadge Component
 * Displays status badge for orders
 */

import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, XCircle, Trash2, Clock } from 'lucide-react'; // Removed Loader2, Archive - in_progress and archived disabled
import type { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  deletedAt?: string | null;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, deletedAt }) => {
  // Si tiene deleted_at, mostrar como eliminado independientemente del status
  if (deletedAt) {
    return (
      <Badge variant="outline" className="gap-1 text-xs whitespace-nowrap bg-purple-600 text-white border-purple-700 hover:bg-purple-700">
        <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
        <span className="hidden sm:inline">Eliminado</span>
      </Badge>
    );
  }

  const config = {
    pending: {
      label: 'Pendiente',
      variant: 'secondary' as const,
      icon: Clock,
      className: 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600',
    },
    // In-progress functionality disabled
    // in_progress: {
    //   label: 'En Proceso',
    //   variant: 'default' as const,
    //   icon: Loader2,
    //   className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
    // },
    completed: {
      label: 'Finalizado',
      variant: 'default' as const,
      icon: CheckCircle,
      className: 'bg-green-600 text-white border-green-700 hover:bg-green-700',
    },
    cancelled: {
      label: 'Cancelado',
      variant: 'destructive' as const,
      icon: XCircle,
      className: '',
    },
    // Archived functionality disabled
    // archived: {
    //   label: 'Archivado',
    //   variant: 'outline' as const,
    //   icon: Archive,
    //   className: 'text-muted-foreground',
    // },
  };

  const { label, variant, icon: Icon, className } = config[status];

  return (
    <Badge variant={variant} className={`gap-1 text-xs whitespace-nowrap ${className}`}>
      <Icon className={`h-3 w-3 md:h-3.5 md:w-3.5`} /> {/* Removed in_progress animation */}
      <span className="hidden sm:inline">{label}</span>
    </Badge>
  );
};

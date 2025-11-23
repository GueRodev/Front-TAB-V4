/**
 * OrderActionDialog Component
 * Confirmation dialogs for order actions (cancel, delete, complete in-store)
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, XCircle, Trash2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OrderActionType = 'cancel' | 'delete' | 'complete-instore';

interface OrderActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  actionType: OrderActionType;
  orderNumber?: string;
  customerName?: string;
  orderTotal?: number;
  isLoading?: boolean;
}

const actionConfig = {
  cancel: {
    title: '¿Cancelar este pedido?',
    description: 'Esta acción marcará el pedido como cancelado.',
    confirmText: 'Sí, cancelar pedido',
    loadingText: 'Cancelando...',
    icon: XCircle,
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  delete: {
    title: '¿Eliminar este pedido?',
    description: 'El pedido será movido a la papelera y podrá ser restaurado posteriormente desde el historial.',
    confirmText: 'Sí, eliminar pedido',
    loadingText: 'Eliminando...',
    icon: Trash2,
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  'complete-instore': {
    title: '¿Completar este pedido?',
    description: '¿El cliente ha realizado el pago correctamente?',
    confirmText: 'Sí, pago recibido',
    loadingText: 'Completando...',
    icon: CheckCircle,
    buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
};

export const OrderActionDialog: React.FC<OrderActionDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  actionType,
  orderNumber,
  customerName,
  orderTotal,
  isLoading = false,
}) => {
  const config = actionConfig[actionType];
  const Icon = config.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className={cn(
              "h-5 w-5",
              actionType === 'cancel' && "text-red-600",
              actionType === 'delete' && "text-purple-600",
              actionType === 'complete-instore' && "text-green-600"
            )} />
            {config.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {orderNumber && (
              <p className="font-semibold text-foreground">
                Pedido #{orderNumber}
              </p>
            )}
            {customerName && (
              <p>
                Cliente: <span className="font-medium">{customerName}</span>
              </p>
            )}
            {orderTotal !== undefined && (
              <p>
                Total: <span className="font-semibold">₡{orderTotal.toLocaleString('es-CR')}</span>
              </p>
            )}
            <p className="text-sm pt-2">
              {config.description}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={config.buttonClass}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {config.loadingText}
              </>
            ) : (
              config.confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

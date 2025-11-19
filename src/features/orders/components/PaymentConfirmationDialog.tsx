/**
 * PaymentConfirmationDialog Component
 * Confirmation dialog for online order completion
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

interface PaymentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  customerName?: string;
  orderTotal?: number;
}

export const PaymentConfirmationDialog: React.FC<PaymentConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  customerName,
  orderTotal,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Confirmar recepción de comprobante?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              ¿Has recibido el comprobante de pago del cliente{customerName ? ` ${customerName}` : ''}?
            </p>
            {orderTotal !== undefined && (
              <p className="font-semibold">
                Monto: ₡{orderTotal.toLocaleString('es-CR')}
              </p>
            )}
            <p className="text-sm">
              Al confirmar, el pedido se marcará como completado y se actualizará el inventario.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Sí, he recibido el comprobante
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

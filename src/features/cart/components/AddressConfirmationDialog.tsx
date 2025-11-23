/**
 * AddressConfirmationDialog
 * Modal para confirmar la dirección de envío antes de finalizar compra
 */

import React from 'react';
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
import { MapPin, Loader2 } from 'lucide-react';
import type { DeliveryAddress } from '@/features/orders/types';

interface AddressConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: DeliveryAddress | null | undefined;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const AddressConfirmationDialog: React.FC<AddressConfirmationDialogProps> = ({
  open,
  onOpenChange,
  address,
  onConfirm,
  isLoading = false,
}) => {
  if (!address) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-orange" />
            Confirmar Dirección de Envío
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-3 pt-2">
            <p className="font-medium text-foreground">
              Por favor, verifica que tu dirección de envío sea correcta:
            </p>
            
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div>
                <span className="font-semibold">Provincia:</span> {address.province}
              </div>
              <div>
                <span className="font-semibold">Cantón:</span> {address.canton}
              </div>
              <div>
                <span className="font-semibold">Distrito:</span> {address.district}
              </div>
              <div>
                <span className="font-semibold">Dirección exacta:</span>
                <p className="mt-1 text-muted-foreground">{address.address}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic">
              ⚠️ Si tu dirección no es correcta, cancela y actualízala antes de continuar.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar y Editar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-brand-darkBlue hover:bg-brand-orange"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Confirmar y Continuar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

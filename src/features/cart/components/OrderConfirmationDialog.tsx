/**
 * OrderConfirmationDialog
 * Modal para confirmar el pedido antes de finalizar la compra
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
import { ShoppingBag, Store, Truck, Package, Loader2 } from 'lucide-react';
import type { CartItem } from '../types';

interface OrderConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryOption: 'pickup' | 'delivery';
  items: CartItem[];
  totalPrice: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const OrderConfirmationDialog: React.FC<OrderConfirmationDialogProps> = ({
  open,
  onOpenChange,
  deliveryOption,
  items,
  totalPrice,
  onConfirm,
  isLoading = false,
}) => {
  const isPickup = deliveryOption === 'pickup';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-orange" />
            Confirmar Pedido
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-4 pt-2">
            <p className="font-medium text-foreground">
              Estás a punto de finalizar tu compra:
            </p>

            <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
              {/* Lista de productos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Package className="h-4 w-4" />
                  Productos ({items.length}):
                </div>
                <ul className="ml-6 space-y-1">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between text-muted-foreground">
                      <span className="truncate max-w-[180px]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium text-foreground">
                        ₡{(item.price * item.quantity).toLocaleString('es-CR')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tipo de entrega */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {isPickup ? (
                  <Store className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Truck className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-semibold">Entrega:</span>
                <span>{isPickup ? 'Recoger en tienda' : 'Envío a domicilio'}</span>
              </div>

              {/* Total */}
              <div className="border-t pt-2 mt-2">
                <span className="font-bold text-lg text-foreground">
                  Total: ₡{totalPrice.toLocaleString('es-CR')}
                </span>
              </div>
            </div>

            {isPickup && (
              <p className="text-xs text-muted-foreground italic">
                Te enviaremos un mensaje de WhatsApp con los detalles de tu pedido.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
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
              'Confirmar Pedido'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

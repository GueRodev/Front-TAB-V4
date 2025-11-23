/**
 * OrderCard Component
 * Displays detailed information about a single order
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EyeOff, Trash2, CheckCircle, XCircle, Mail, Loader2, Store, X } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { cn } from '@/lib/utils';
import type { Order } from '../types';

interface OrderCardProps {
  order: Order;
  showDeliveryInfo?: boolean;
  onHide?: (orderId: string) => void;
  onDelete?: (orderId: string, order: Order) => void;
  onRemove?: (orderId: string) => void; // Quita definitivamente de la bandeja
  onComplete?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  onCompleteWithConfirmation?: (order: Order) => void;
  isCompleting?: boolean;
  isCancelling?: boolean;
  isDeleting?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  showDeliveryInfo = false,
  onHide,
  onDelete,
  onRemove,
  onComplete,
  onCancel,
  onCompleteWithConfirmation,
  isCompleting = false,
  isCancelling = false,
  isDeleting = false,
}) => {
  const handleComplete = () => {
    if (order.type === 'online' && onCompleteWithConfirmation) {
      onCompleteWithConfirmation(order);
    } else {
      onComplete(order);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <CardTitle className="text-lg md:text-xl font-bold">
              Pedido #{order.id}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <Badge variant="outline" className="text-xs">
                {order.type === 'online' ? 'En línea' : 'En tienda'}
              </Badge>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground sm:text-right">
            {new Date(order.createdAt).toLocaleDateString('es-CR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
            <br className="hidden sm:block" />
            <span className="sm:hidden"> • </span>
            {new Date(order.createdAt).toLocaleTimeString('es-CR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4 pb-3 px-4 md:px-6">
        {/* Cliente con fondo gris */}
        <div className="bg-muted/40 rounded-lg p-3 md:p-4 space-y-1.5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
            <span className="text-xs md:text-sm text-muted-foreground">Cliente:</span>
            <span className="font-semibold text-sm md:text-base">{order.customerInfo.name}</span>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
            <span className="text-xs md:text-sm text-muted-foreground">Teléfono:</span>
            <span className="font-medium text-sm md:text-base">{order.customerInfo.phone}</span>
          </div>
          {order.customerInfo.email && (
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
              <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Correo:
              </span>
              <span className="font-medium text-sm md:text-base">{order.customerInfo.email}</span>
            </div>
          )}
        </div>

        {/* Dirección de envío o Recoger en tienda */}
        {showDeliveryInfo && (
          order.delivery_address ? (
            <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-3 md:p-4 space-y-2 border border-blue-100 dark:border-blue-900">
              <div className="space-y-1">
                <span className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100">
                  📍 Dirección de envío:
                </span>
                <p className="text-xs md:text-sm font-medium">
                  {order.delivery_address.province}, {order.delivery_address.canton}, {order.delivery_address.district}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {order.delivery_address.address}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-3 md:p-4 border border-amber-100 dark:border-amber-900">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs md:text-sm font-medium text-amber-900 dark:text-amber-100">
                  Recoger en tienda
                </span>
              </div>
            </div>
          )
        )}

        {/* Total y Pago */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm md:text-base text-muted-foreground">Total:</span>
            <span className="font-bold text-lg md:text-xl text-primary">
              ₡{order.total.toLocaleString('es-CR')}
            </span>
          </div>
          {order.paymentMethod && (
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-muted-foreground">Pago:</span>
              <span className={cn(
                "font-semibold text-sm md:text-base",
                order.paymentMethod === 'sinpe' && "text-blue-600 dark:text-blue-400",
                order.paymentMethod === 'transfer' && "text-brand-darkBlue dark:text-brand-darkBlue",
                order.paymentMethod === 'cash' && "text-green-600 dark:text-green-400"
              )}>
                {order.paymentMethod === 'sinpe' ? '💳 SINPE Móvil' : 
                 order.paymentMethod === 'transfer' ? '🏦 Transferencia' : 
                 '💵 Efectivo'}
              </span>
            </div>
          )}
        </div>

        {/* Productos */}
        <div className="space-y-2 pt-3 border-t">
          <h4 className="font-semibold text-sm md:text-base flex items-center gap-2">
            📦 Productos 
            <span className="text-xs md:text-sm font-normal text-muted-foreground">
              ({order.items.length})
            </span>
          </h4>
          <div className="space-y-2 max-h-32 md:max-h-48 lg:max-h-40 overflow-y-auto pr-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 md:gap-3 p-2 bg-muted/20 rounded-md">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 md:w-12 md:h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs md:text-sm truncate">{item.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.quantity}x ₡{item.price.toLocaleString('es-CR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2 flex-col md:flex-row px-4 md:px-6">
        {order.status === 'pending' && (
          <>
            <Button
              onClick={handleComplete}
              size="sm"
              className="w-full md:flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isCompleting || isCancelling || isDeleting}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 animate-spin" />
                  <span className="text-xs md:text-sm font-semibold">Completando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
                  <span className="text-xs md:text-sm font-semibold">Completar</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => onCancel(order)}
              size="sm"
              variant="destructive"
              className="w-full md:flex-1"
              disabled={isCompleting || isCancelling || isDeleting}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 animate-spin" />
                  <span className="text-xs md:text-sm font-semibold">Cancelando...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
                  <span className="text-xs md:text-sm font-semibold">Cancelar</span>
                </>
              )}
            </Button>
            {onDelete && (
              <Button
                onClick={() => onDelete(order.id, order)}
                size="sm"
                className="w-full md:flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isCompleting || isCancelling || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 animate-spin" />
                    <span className="text-xs md:text-sm font-semibold">Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
                    <span className="text-xs md:text-sm font-semibold">Eliminar</span>
                  </>
                )}
              </Button>
            )}
          </>
        )}
        {(order.status === 'completed' || order.status === 'cancelled') && (onHide || onRemove) && (
          <>
            {onHide && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onHide(order.id)}
                      size="sm"
                      variant="outline"
                      className="w-full md:flex-1"
                    >
                      <EyeOff className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
                      <span className="text-xs md:text-sm">Ocultar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Oculta este pedido de la bandeja de entrada.
                      Seguirá visible en el historial.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onRemove && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => onRemove(order.id)}
                      size="sm"
                      className="w-full md:flex-1 bg-brand-darkBlue hover:bg-brand-darkBlue/90 text-white"
                    >
                      <X className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2" />
                      <span className="text-xs md:text-sm">Quitar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Quita este pedido definitivamente de la bandeja de entrada.
                      Seguirá visible en el historial.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

/**
 * ArchivedOrderCard Component
 * Displays archived order with restore functionality
 */

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '../types';

interface ArchivedOrderCardProps {
  order: Order;
  onRestore: (orderId: string) => void;
}

export const ArchivedOrderCard: React.FC<ArchivedOrderCardProps> = ({
  order,
  onRestore,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base">Pedido #{order.id}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <Badge variant="outline" className="text-xs">
                {order.type === 'online' ? 'En línea' : 'En tienda'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente:</span>
            <span className="font-medium">{order.customerInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teléfono:</span>
            <span className="font-medium">{order.customerInfo.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha:</span>
            <span className="font-medium">
              {new Date(order.createdAt).toLocaleDateString('es-CR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold text-base">₡{order.total.toLocaleString('es-CR')}</span>
          </div>
          {order.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método de pago:</span>
              <span className="font-medium capitalize">{order.paymentMethod}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t">
          <h4 className="font-medium text-sm">Productos ({order.items.length})</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.quantity}x ₡{item.price.toLocaleString('es-CR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {order.archived && (
        <CardFooter className="pt-3 border-t">
          <Button
            onClick={() => onRestore(order.id)}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Pedido
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

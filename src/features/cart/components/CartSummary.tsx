/**
 * CartSummary Component
 * Pure presentational component for cart summary display
 */

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WHATSAPP_CONFIG, CURRENCY_CONFIG } from '@/config';

interface CartSummaryProps {
  totalItems: number;
  totalPrice: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  totalItems,
  totalPrice,
}) => {
  const handleWhatsAppClick = () => {
    const message = `Hola! Tengo una consulta sobre mi pedido.\n\nTotal de productos: ${totalItems}\nTotal: ${CURRENCY_CONFIG.symbol}${totalPrice.toFixed(2)}`;
    const url = WHATSAPP_CONFIG.buildChatUrl(message);
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Productos ({totalItems})</span>
          <span className="font-semibold">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-semibold">A calcular</span>
        </div>
        <div className="border-t pt-4 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>

        <div className="border-t pt-4">
          <Button
            onClick={handleWhatsAppClick}
            variant="outline"
            className="w-full gap-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
          >
            <MessageCircle size={18} />
            ¿Dudas? Consulta por WhatsApp
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Responderemos tus preguntas al instante
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

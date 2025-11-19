/**
 * InStoreOrderForm Component
 * Form for creating in-store orders
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { ProductSelector } from './ProductSelector';
import type { Product } from '@/features/products/types';
import type { Category } from '@/features/categories/types';

interface InStoreOrderFormProps {
  selectedProduct: string;
  setSelectedProduct: (productId: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  categoryFilter: string;
  setCategoryFilter: (categoryId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  productSelectorOpen: boolean;
  setProductSelectorOpen: (open: boolean) => void;
  filteredProducts: Product[];
  selectedProductData: Product | undefined;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
}

export const InStoreOrderForm: React.FC<InStoreOrderFormProps> = ({
  selectedProduct,
  setSelectedProduct,
  quantity,
  setQuantity,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  paymentMethod,
  setPaymentMethod,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  productSelectorOpen,
  setProductSelectorOpen,
  filteredProducts,
  selectedProductData,
  categories,
  onSubmit,
}) => {
  const totalAmount = selectedProductData 
    ? selectedProductData.price * quantity 
    : 0;

  const isFormValid = selectedProduct && quantity > 0 && customerName && customerPhone && paymentMethod;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Crear Pedido en Tienda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <ProductSelector
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            open={productSelectorOpen}
            onOpenChange={setProductSelectorOpen}
            filteredProducts={filteredProducts}
            selectedProductData={selectedProductData}
            categories={categories}
          />

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              placeholder="Cantidad"
              disabled={!selectedProduct}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Nombre del Cliente *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Teléfono *</Label>
            <Input
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="8888-8888"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">
              Correo Electrónico <span className="text-muted-foreground text-sm">(opcional)</span>
            </Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
            <p className="text-xs text-muted-foreground">
              Para enviar comprobantes y notificaciones
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pago *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="sinpe">SINPE Móvil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {totalAmount > 0 && (
            <div className="p-4 bg-accent rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total a pagar:</span>
                <span className="text-2xl font-bold">
                  ₡{totalAmount.toLocaleString('es-CR')}
                </span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={!isFormValid}
          >
            Crear Pedido
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

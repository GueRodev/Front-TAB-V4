/**
 * InStoreOrderForm Component
 * Form for creating in-store orders with multi-product cart support
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Trash2, Minus } from 'lucide-react';
import { ProductSelector } from './ProductSelector';
import type { Product } from '@/features/products/types';
import type { Category } from '@/features/categories/types';

/**
 * Cart item structure for in-store orders
 */
interface CartItem {
  id: string;
  product_id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

interface InStoreOrderFormProps {
  // Cart props (nuevos)
  cartItems?: CartItem[];
  cartTotal?: number;
  onAddToCart?: () => void;
  onRemoveFromCart?: (productId: string) => void;
  onUpdateCartQuantity?: (productId: string, quantity: number) => void;
  onClearCart?: () => void;

  // Product selection
  selectedProduct: string;
  setSelectedProduct: (productId: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;

  // Customer info
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;

  // Product filtering
  categoryFilter: string;
  setCategoryFilter: (categoryId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  productSelectorOpen: boolean;
  setProductSelectorOpen: (open: boolean) => void;
  filteredProducts: Product[];
  selectedProductData: Product | undefined;
  categories: Category[];

  // Submit
  onSubmit: (e: React.FormEvent) => void;
}

export const InStoreOrderForm: React.FC<InStoreOrderFormProps> = ({
  // Cart props
  cartItems = [],
  cartTotal = 0,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  onClearCart,

  // Product selection
  selectedProduct,
  setSelectedProduct,
  quantity,
  setQuantity,

  // Customer info
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  paymentMethod,
  setPaymentMethod,

  // Product filtering
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  productSelectorOpen,
  setProductSelectorOpen,
  filteredProducts,
  selectedProductData,
  categories,

  // Submit
  onSubmit,
}) => {
  // Calcular total: usar cartTotal si hay carrito, sino producto individual
  const displayTotal = cartItems.length > 0
    ? cartTotal
    : (selectedProductData ? selectedProductData.price * quantity : 0);

  // Validar formulario: carrito con items O producto seleccionado, más datos cliente
  const hasProducts = cartItems.length > 0 || (selectedProduct && quantity > 0);
  const isFormValid = hasProducts && customerName && customerPhone && paymentMethod;

  // Usar modo carrito si onAddToCart está disponible
  const useCartMode = !!onAddToCart;

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
          {/* Product Selection */}
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

          {/* Quantity */}
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

          {/* Add to Cart Button (solo en modo carrito) */}
          {useCartMode && (
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              onClick={onAddToCart}
              disabled={!selectedProduct}
            >
              <Plus className="h-4 w-4" />
              Agregar al Pedido
            </Button>
          )}

          {/* Cart Items List */}
          {useCartMode && cartItems.length > 0 && (
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">
                  Productos ({cartItems.length})
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClearCart}
                  className="text-destructive hover:text-destructive h-auto py-1 px-2"
                >
                  Limpiar
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 bg-accent/50 rounded-md"
                  >
                    {/* Product Image */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₡{item.price.toLocaleString('es-CR')} c/u
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateCartQuantity?.(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateCartQuantity?.(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Subtotal */}
                    <span className="text-sm font-semibold w-20 text-right">
                      ₡{(item.price * item.quantity).toLocaleString('es-CR')}
                    </span>

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => onRemoveFromCart?.(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t pt-4">
            <Label className="text-sm font-semibold text-muted-foreground">
              Datos del Cliente
            </Label>
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Nombre del Cliente *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Teléfono *</Label>
            <Input
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="8888-8888"
            />
          </div>

          {/* Customer Email */}
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

          {/* Payment Method */}
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

          {/* Total */}
          {displayTotal > 0 && (
            <div className="p-4 bg-accent rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total a pagar:</span>
                <span className="text-2xl font-bold">
                  ₡{displayTotal.toLocaleString('es-CR')}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
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

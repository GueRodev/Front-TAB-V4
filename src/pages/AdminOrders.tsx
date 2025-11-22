/**
 * AdminOrders Page
 * Orchestrates orders management using business logic hook and UI components
 */

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/features/categories';
import {
  useOrdersAdmin,
  OrdersList,
  InStoreOrderForm,
  PaymentConfirmationDialog
} from '@/features/orders';
import { DeleteConfirmDialog } from '@/components/common';
import { ShoppingCart, Store, History, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { categories } = useCategories();
  
  // Estado local para pedidos ocultos
  const [hiddenOrderIds, setHiddenOrderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('hiddenOrderIds');
    return saved ? JSON.parse(saved) : [];
  });
  
  const {
    // Order data
    onlineOrders,
    inStoreOrders,
    isLoading,

    // In-store cart
    cartItems,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,

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

    // Order actions
    handleCreateInStoreOrder,
    handleCompleteOrder,
    handleCancelOrder,

    // Dialogs
    deleteOrderDialog,
    openDeleteOrderDialog,
    closeDeleteOrderDialog,
    confirmDeleteOrder,
    paymentConfirmDialog,
    openPaymentConfirmDialog,
    closePaymentConfirmDialog,
    confirmCompleteOrder,
  } = useOrdersAdmin();

  // Función para ocultar pedido localmente
  const handleHideOrder = (orderId: string) => {
    const newHiddenIds = [...hiddenOrderIds, orderId];
    setHiddenOrderIds(newHiddenIds);
    localStorage.setItem('hiddenOrderIds', JSON.stringify(newHiddenIds));
    toast({
      title: "Pedido ocultado",
      description: "El pedido ya no se muestra en la bandeja de entrada",
    });
  };

  // Filtrar pedidos visibles
  const visibleOnlineOrders = onlineOrders.filter(
    order => !hiddenOrderIds.includes(order.id)
  );
  
  const visibleInStoreOrders = inStoreOrders.filter(
    order => !hiddenOrderIds.includes(order.id)
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader title="Gestión de Pedidos" />

          <main className="p-3 md:p-4 lg:p-6 space-y-6 md:space-y-8 max-w-full overflow-x-hidden">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <Button
                onClick={() => {
                  setHiddenOrderIds([]);
                  localStorage.removeItem('hiddenOrderIds');
                  toast({ title: "Pedidos ocultos restaurados" });
                }}
                variant="ghost"
                size="sm"
                disabled={hiddenOrderIds.length === 0}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Mostrar Ocultos ({hiddenOrderIds.length})
              </Button>
              
              <Button
                onClick={() => navigate('/admin/orders/history')}
                variant="outline"
                className="gap-2"
              >
                <History className="h-4 w-4" />
                Ver Historial de Pedidos
              </Button>
            </div>

            {/* Section 1: Online Orders */}
            <div className="space-y-3 md:space-y-4">
              <div className="px-1">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                  <h2 className="text-base md:text-lg lg:text-xl font-bold">
                    Pedidos desde el Carrito
                  </h2>
                </div>
                <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
                  Gestiona los pedidos realizados desde la tienda online
                </p>
              </div>
              
              <Card>
                <CardContent className="p-3 md:p-4 lg:p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Cargando pedidos...</span>
                    </div>
                  ) : (
                    <OrdersList
                      orders={visibleOnlineOrders}
                      showDeliveryInfo={true}
                      emptyMessage="No hay pedidos online aún"
                      emptyIcon={<ShoppingCart className="h-10 w-10 md:h-12 md:w-12 opacity-30" />}
                      onHide={handleHideOrder}
                      onDelete={openDeleteOrderDialog}
                      onComplete={handleCompleteOrder}
                      onCancel={handleCancelOrder}
                      onCompleteWithConfirmation={openPaymentConfirmDialog}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Section 2: In-Store Orders */}
            <div className="space-y-3 md:space-y-4">
              <div className="px-1">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                  <Store className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                  <h2 className="text-base md:text-lg lg:text-xl font-bold">
                    Pedidos en Tienda Física
                  </h2>
                </div>
                <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
                  Registra y gestiona ventas presenciales
                </p>
              </div>

              <div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {/* In-Store Order Form */}
                <div className="lg:col-span-1">
                  <InStoreOrderForm
                    // Cart props
                    cartItems={cartItems}
                    cartTotal={cartTotal}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                    onUpdateCartQuantity={updateCartItemQuantity}
                    onClearCart={clearCart}
                    // Product selection
                    selectedProduct={selectedProduct}
                    setSelectedProduct={setSelectedProduct}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    // Customer info
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    customerPhone={customerPhone}
                    setCustomerPhone={setCustomerPhone}
                    customerEmail={customerEmail}
                    setCustomerEmail={setCustomerEmail}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    // Product filtering
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    productSelectorOpen={productSelectorOpen}
                    setProductSelectorOpen={setProductSelectorOpen}
                    filteredProducts={filteredProducts}
                    selectedProductData={selectedProductData}
                    categories={categories}
                    // Submit
                    onSubmit={handleCreateInStoreOrder}
                  />
                </div>

                {/* In-Store Orders List */}
                <div className="lg:col-span-1 xl:col-span-2">
                  {isLoading ? (
                    <Card>
                      <CardContent className="py-8 md:py-12 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Cargando...</span>
                      </CardContent>
                    </Card>
                  ) : visibleInStoreOrders.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 md:py-12 text-center text-muted-foreground">
                        <Store className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm md:text-base">No hay pedidos en tienda aún</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <OrdersList
                      orders={visibleInStoreOrders}
                      showDeliveryInfo={false}
                      gridColumns="grid-cols-1 lg:grid-cols-2"
                      onHide={handleHideOrder}
                      onDelete={openDeleteOrderDialog}
                      onComplete={handleCompleteOrder}
                      onCancel={handleCancelOrder}
                    />
                  )}
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Delete Order Confirmation */}
      <DeleteConfirmDialog
        open={deleteOrderDialog.open}
        onOpenChange={(open) => {
          if (!open) closeDeleteOrderDialog();
        }}
        itemName={deleteOrderDialog.order?.id || ''}
        itemType="order"
        onConfirm={confirmDeleteOrder}
      />

      {/* Payment Confirmation Dialog */}
      <PaymentConfirmationDialog
        open={paymentConfirmDialog.open}
        onOpenChange={(open) => {
          if (!open) closePaymentConfirmDialog();
        }}
        onConfirm={confirmCompleteOrder}
        customerName={paymentConfirmDialog.order?.customerInfo?.name}
        orderTotal={paymentConfirmDialog.order?.total}
      />
    </SidebarProvider>
  );
};

export default AdminOrders;

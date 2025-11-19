import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAddressSelection } from '@/features/addresses';
import { useAuth } from '@/features/auth';
import { useCartOperations, CartItemsList, EmptyCart, CartSummary, OrderForm, AddressConfirmationDialog } from '@/features/cart';
import { Header, Footer } from '@/components/layout';
import { useOrderForm, AddressSelector } from '@/features/orders';
import type { DeliveryAddress } from '@/features/orders/types';

/**
 * Cart Page
 * Checkout page with cart items and order form
 */
const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    items,
    totalPrice,
    isEmpty,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
  } = useCartOperations();

  const {
    formData,
    deliveryOption,
    paymentMethod,
    handleInputChange,
    setDeliveryOption,
    setPaymentMethod,
    submitOrder,
  } = useOrderForm();

  const {
    selectedAddressId,
    manualAddress,
    userAddresses,
    showManualInput,
    handleSelectAddress,
    handleManualAddressChange,
    getSelectedAddress,
  } = useAddressSelection(user, isAuthenticated);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAddressData, setPendingAddressData] = useState<DeliveryAddress | undefined>();

  const handleSubmit = () => {
    const addressData = deliveryOption === 'delivery' ? getSelectedAddress() : undefined;
    
    // Si es envío a domicilio, mostrar confirmación primero
    if (deliveryOption === 'delivery') {
      setPendingAddressData(addressData);
      setShowConfirmation(true);
    } else {
      // Si es pickup, procesar directamente
      submitOrder(addressData);
    }
  };

  const handleConfirmAddress = () => {
    setShowConfirmation(false);
    submitOrder(pendingAddressData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero-style background section */}
      <section className="pt-24 md:pt-32 pb-8 bg-gradient-to-b from-brand-yellow to-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-brand-orange opacity-10"></div>
          <div className="absolute left-1/3 top-1/3 w-32 h-32 rounded-full bg-brand-purple opacity-10"></div>
          <div className="absolute right-1/4 bottom-1/4 w-48 h-48 rounded-full bg-brand-skyBlue opacity-10"></div>
        </div>
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-brand-darkBlue text-white py-3 px-6 rounded-lg inline-block mb-6">
            <div className="flex items-center gap-2 text-sm uppercase font-semibold">
              <Link to="/" className="hover:text-brand-orange transition-colors">
                INICIO
              </Link>
              <span>/</span>
              <span>CARRITO</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 relative z-10">
          <h1 className="text-3xl font-bold mb-4 text-brand-darkBlue">Carrito de Compras</h1>

          {isEmpty ? (
            <EmptyCart />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <CartItemsList
                items={items}
                onIncrement={incrementQuantity}
                onDecrement={decrementQuantity}
                onRemove={removeFromCart}
              />

              <div className="space-y-6">
                <CartSummary totalItems={items.length} totalPrice={totalPrice} />

                <OrderForm
                  formData={{
                    name: formData.customerName,
                    phone: formData.customerPhone,
                  }}
                  deliveryOption={deliveryOption}
                  paymentMethod={paymentMethod}
                  onInputChange={handleInputChange}
                  onDeliveryOptionChange={setDeliveryOption}
                  onPaymentMethodChange={setPaymentMethod}
                  onSubmit={handleSubmit}
                >
                  {deliveryOption === 'delivery' && (
                    <AddressSelector
                      savedAddresses={userAddresses}
                      selectedAddressId={selectedAddressId}
                      onSelectAddress={handleSelectAddress}
                      manualAddress={manualAddress}
                      onManualAddressChange={handleManualAddressChange}
                      showManualInput={showManualInput}
                    />
                  )}
                </OrderForm>
              </div>
            </div>
          )}
        </div>
      </section>

      <AddressConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        address={pendingAddressData}
        onConfirm={handleConfirmAddress}
      />

      <Footer />
    </div>
  );
};

export default Cart;

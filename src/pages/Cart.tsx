import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartOperations, CartItemsList, EmptyCart, CartSummary, OrderForm, AddressConfirmationDialog } from '@/features/cart';
import { Header, Footer } from '@/components/layout';
import { useOrderForm, AddressSelector } from '@/features/orders';

/**
 * Cart Page
 * Checkout page with cart items and order form
 */
const Cart = () => {
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
    selectedAddressId,
    deliveryAddress,
    handleInputChange,
    setDeliveryOption,
    setPaymentMethod,
    handleSavedAddressSelect,
    handleManualAddressChange,
    handleAddressTypeChange,
    submitOrder,
  } = useOrderForm();

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = () => {
    // Si es envío a domicilio, mostrar confirmación primero
    if (deliveryOption === 'delivery' && deliveryAddress) {
      setShowConfirmation(true);
    } else {
      // Si es pickup, procesar directamente
      submitOrder();
    }
  };

  const handleConfirmAddress = () => {
    setShowConfirmation(false);
    submitOrder();
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
                      selectedAddress={deliveryAddress}
                      selectedAddressId={selectedAddressId}
                      onSelectSavedAddress={handleSavedAddressSelect}
                      onManualAddressChange={handleManualAddressChange}
                      onAddressTypeChange={handleAddressTypeChange}
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
        address={deliveryAddress}
        onConfirm={handleConfirmAddress}
      />

      <Footer />
    </div>
  );
};

export default Cart;

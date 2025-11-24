import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartOperations, CartItemsList, EmptyCart, CartSummary, OrderForm, AddressConfirmationDialog, OrderConfirmationDialog } from '@/features/cart';
import { Header, Footer } from '@/components/layout';
import { useOrderForm, AddressSelector } from '@/features/orders';
import { LoadingOverlay } from '@/components/common';
import { useAuth } from '@/features/auth';

/**
 * Cart Page
 * Checkout page with cart items and order form
 */
const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
    isSubmitting,
    handleInputChange,
    setDeliveryOption,
    setPaymentMethod,
    handleSavedAddressSelect,
    handleManualAddressChange,
    handleAddressTypeChange,
    submitOrder,
  } = useOrderForm();

  const [showAddressConfirmation, setShowAddressConfirmation] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Procesando...');
  const [loadingSubmessage, setLoadingSubmessage] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      // Mostrar overlay de redirección
      setLoadingMessage('Debes iniciar sesión');
      setLoadingSubmessage('Redirigiendo al login...');
      setShowLoadingOverlay(true);

      // Redirigir al login después de un breve delay
      setTimeout(() => {
        setShowLoadingOverlay(false);
        navigate('/auth', { state: { from: '/cart' } });
      }, 1500);
      return;
    }

    if (deliveryOption === 'delivery' && deliveryAddress) {
      // Si es envío a domicilio, mostrar confirmación de dirección
      setShowAddressConfirmation(true);
    } else {
      // Si es pickup, mostrar confirmación de pedido
      setShowOrderConfirmation(true);
    }
  };

  const handleConfirmAddress = async () => {
    // Cerrar modal y mostrar overlay
    setShowAddressConfirmation(false);
    setLoadingMessage('Enviando pedido...');
    setLoadingSubmessage('Redirigiendo a WhatsApp');
    setShowLoadingOverlay(true);

    const success = await submitOrder();

    // Dar tiempo para que WhatsApp se abra antes de ocultar overlay
    setTimeout(() => {
      setShowLoadingOverlay(false);
    }, success ? 2000 : 0);
  };

  const handleConfirmOrder = async () => {
    // Cerrar modal y mostrar overlay
    setShowOrderConfirmation(false);
    setLoadingMessage('Enviando pedido...');
    setLoadingSubmessage('Redirigiendo a WhatsApp');
    setShowLoadingOverlay(true);

    const success = await submitOrder();

    // Dar tiempo para que WhatsApp se abra antes de ocultar overlay
    setTimeout(() => {
      setShowLoadingOverlay(false);
    }, success ? 2000 : 0);
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
        open={showAddressConfirmation}
        onOpenChange={(open) => {
          if (!isSubmitting) setShowAddressConfirmation(open);
        }}
        address={deliveryAddress}
        onConfirm={handleConfirmAddress}
        isLoading={isSubmitting}
      />

      <OrderConfirmationDialog
        open={showOrderConfirmation}
        onOpenChange={(open) => {
          if (!isSubmitting) setShowOrderConfirmation(open);
        }}
        deliveryOption={deliveryOption}
        items={items}
        totalPrice={totalPrice}
        onConfirm={handleConfirmOrder}
        isLoading={isSubmitting}
      />

      <Footer />

      {/* Loading overlay for authentication redirect or WhatsApp */}
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        message={loadingMessage}
        submessage={loadingSubmessage}
      />
    </div>
  );
};

export default Cart;

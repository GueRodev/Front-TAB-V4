/**
 * Orders Admin Business Logic Hook
 * Manages all order-related operations for admin pages
 */

import { useState, useMemo } from 'react';
import { useOrders } from '../contexts';
import { useProducts } from '@/features/products';
import { useCategories } from '@/features/categories';
import { useNotifications } from '@/features/notifications';
import { toast } from '@/hooks/use-toast';
import type { Order } from '../types';
import type { Product } from '@/features/products/types';

interface DeleteOrderDialog {
  open: boolean;
  orderId: string | null;
  order: Order | null;
}

interface PaymentConfirmationDialog {
  open: boolean;
  order: Order | null;
}

interface CancelOrderDialog {
  open: boolean;
  order: Order | null;
}

interface CompleteInStoreDialog {
  open: boolean;
  order: Order | null;
}

/**
 * Cart item for in-store orders
 */
interface InStoreCartItem {
  id: string;
  product_id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number; // Para validación
}

interface UseOrdersAdminReturn {
  // Order data
  onlineOrders: Order[];
  inStoreOrders: Order[];
  isLoading: boolean;

  // Loading states for actions
  isCreatingOrder: boolean;
  isCompletingOrder: string | null; // orderId being completed
  isCancellingOrder: string | null; // orderId being cancelled
  isDeletingOrder: string | null; // orderId being deleted

  // In-store cart (múltiples productos)
  cartItems: InStoreCartItem[];
  cartTotal: number;
  addToCart: () => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Product selection (para agregar al carrito)
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

  // Product data
  activeProducts: Product[];
  filteredProducts: Product[];
  selectedProductData: Product | undefined;

  // Order actions
  handleCreateInStoreOrder: (e: React.FormEvent) => void;
  handleCompleteOrder: (order: Order) => void;
  handleCancelOrder: (order: Order) => void;

  // Dialog states
  deleteOrderDialog: DeleteOrderDialog;
  openDeleteOrderDialog: (orderId: string, order: Order) => void;
  closeDeleteOrderDialog: () => void;
  confirmDeleteOrder: () => void;

  // Payment confirmation dialog (online orders)
  paymentConfirmDialog: PaymentConfirmationDialog;
  openPaymentConfirmDialog: (order: Order) => void;
  closePaymentConfirmDialog: () => void;
  confirmCompleteOrder: () => void;

  // Cancel order dialog
  cancelOrderDialog: CancelOrderDialog;
  openCancelOrderDialog: (order: Order) => void;
  closeCancelOrderDialog: () => void;
  confirmCancelOrder: () => void;

  // Complete in-store order dialog
  completeInStoreDialog: CompleteInStoreDialog;
  openCompleteInStoreDialog: (order: Order) => void;
  closeCompleteInStoreDialog: () => void;
  confirmCompleteInStoreOrder: () => void;
}

export const useOrdersAdmin = (): UseOrdersAdminReturn => {
  // In-store cart state (múltiples productos)
  const [cartItems, setCartItems] = useState<InStoreCartItem[]>([]);

  // State for product selection (para agregar al carrito)
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Customer info state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Product filtering state
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);

  // Loading states for actions
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCompletingOrder, setIsCompletingOrder] = useState<string | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState<string | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState<string | null>(null);

  // Dialog states
  const [deleteOrderDialog, setDeleteOrderDialog] = useState<DeleteOrderDialog>({
    open: false,
    orderId: null,
    order: null,
  });

  const [paymentConfirmDialog, setPaymentConfirmDialog] = useState<PaymentConfirmationDialog>({
    open: false,
    order: null,
  });

  const [cancelOrderDialog, setCancelOrderDialog] = useState<CancelOrderDialog>({
    open: false,
    order: null,
  });

  const [completeInStoreDialog, setCompleteInStoreDialog] = useState<CompleteInStoreDialog>({
    open: false,
    order: null,
  });

  // Get data from contexts
  const { getOrdersByType, addOrder, deleteOrder, updateOrderStatus, isLoading } = useOrders();
  const { allProducts, refreshProducts } = useProducts();
  const { categories } = useCategories();
  // Notifications now come from backend automatically - no need for addNotification

  // Get orders by type
  const onlineOrders = getOrdersByType('online');
  const inStoreOrders = getOrdersByType('in-store');

  // Filter active products (usar allProducts para tener todos los productos disponibles en selectores)
  const activeProducts = allProducts.filter(p => p.status === 'active');
  
  // Filter products based on category and search
  const filteredProducts = useMemo(() => {
    let filtered = activeProducts;

    if (categoryFilter !== 'all') {
      // Buscar la categoría seleccionada
      const selectedCategory = categories.find(c => c.id === categoryFilter);

      if (selectedCategory) {
        // Obtener IDs de la categoría y todas sus subcategorías
        const categoryIds = [selectedCategory.id];
        if (selectedCategory.children && selectedCategory.children.length > 0) {
          selectedCategory.children.forEach(child => {
            categoryIds.push(child.id);
          });
        }

        // Filtrar productos que pertenezcan a la categoría o sus subcategorías
        filtered = filtered.filter(p => categoryIds.includes(p.category_id));
      } else {
        // Si no se encuentra la categoría, filtrar directamente (puede ser una subcategoría)
        filtered = filtered.filter(p => p.category_id === categoryFilter);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeProducts, categoryFilter, searchQuery, categories]);
  
  // Get selected product data
  const selectedProductData = activeProducts.find(p => p.id === selectedProduct);

  // Calculate cart total
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  /**
   * Add selected product to cart
   */
  const addToCart = () => {
    if (!selectedProduct || !selectedProductData) {
      toast({
        title: "Error",
        description: "Por favor selecciona un producto",
        variant: "destructive",
      });
      return;
    }

    // Check if product already in cart
    const existingItem = cartItems.find(item => item.id === selectedProduct);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const totalRequested = currentQtyInCart + quantity;

    if (totalRequested > selectedProductData.stock) {
      toast({
        title: "Error",
        description: `Stock insuficiente. Disponible: ${selectedProductData.stock}, en carrito: ${currentQtyInCart}`,
        variant: "destructive",
      });
      return;
    }

    if (existingItem) {
      // Update quantity if already in cart
      setCartItems(prev =>
        prev.map(item =>
          item.id === selectedProduct
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      // Add new item to cart
      setCartItems(prev => [...prev, {
        id: selectedProductData.id,
        product_id: Number(selectedProductData.id),
        name: selectedProductData.name,
        image: selectedProductData.image_url || '',
        price: selectedProductData.price,
        quantity,
        stock: selectedProductData.stock,
      }]);
    }

    // Reset selection
    setSelectedProduct('');
    setQuantity(1);

    toast({
      title: "Producto agregado",
      description: `${selectedProductData.name} x${quantity} agregado al pedido`,
    });
  };

  /**
   * Remove product from cart
   */
  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  /**
   * Update cart item quantity
   */
  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    const item = cartItems.find(i => i.id === productId);
    if (!item) return;

    if (newQuantity > item.stock) {
      toast({
        title: "Error",
        description: `Stock máximo disponible: ${item.stock}`,
        variant: "destructive",
      });
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(i =>
        i.id === productId ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Create in-store order
   * Soporta: carrito con múltiples productos O producto individual (compatibilidad)
   */
  const handleCreateInStoreOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determinar items: usar carrito si tiene productos, sino producto seleccionado
    let orderItems: Array<{
      id: string;
      product_id: number;
      name: string;
      image: string;
      price: number;
      quantity: number;
    }>;

    if (cartItems.length > 0) {
      // Usar carrito (múltiples productos)
      orderItems = cartItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));
    } else if (selectedProduct && selectedProductData) {
      // Fallback: producto individual (compatibilidad hacia atrás)
      if (quantity > selectedProductData.stock) {
        toast({
          title: "Error",
          description: "No hay suficiente stock disponible",
          variant: "destructive",
        });
        return;
      }
      orderItems = [{
        id: selectedProductData.id,
        product_id: Number(selectedProductData.id),
        name: selectedProductData.name,
        image: selectedProductData.image_url || '',
        price: selectedProductData.price,
        quantity,
      }];
    } else {
      toast({
        title: "Error",
        description: "Agrega al menos un producto al pedido",
        variant: "destructive",
      });
      return;
    }

    // Validar datos del cliente
    if (!customerName || !customerPhone || !paymentMethod) {
      toast({
        title: "Error",
        description: "Completa los datos del cliente y método de pago",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      type: 'in-store' as const,
      status: 'pending' as const,
      items: orderItems,
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail || undefined,
      },
      deliveryOption: 'pickup' as const,
      paymentMethod,
    };

    setIsCreatingOrder(true);
    try {
      const orderId = await addOrder(orderData);

      // Refrescar productos para actualizar el stock en la UI (reserva de stock)
      await refreshProducts();

      // Notification will be created by backend automatically

      // Reset form and cart
      clearCart();
      setSelectedProduct('');
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setPaymentMethod('');

      toast({
        title: "Pedido creado",
        description: "El pedido ha sido creado. Complétalo para confirmar la venta.",
      });
    } catch (error) {
      // Solo mostrar toast genérico si no es error de stock (el contexto ya muestra ese toast)
      if (error instanceof Error && !error.message.includes('Stock insuficiente')) {
        toast({
          title: "Error",
          description: "No se pudo crear el pedido",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  /**
   * Open delete confirmation dialog
   */
  const openDeleteOrderDialog = (orderId: string, order: Order) => {
    setDeleteOrderDialog({
      open: true,
      orderId,
      order,
    });
  };

  /**
   * Close delete order dialog without confirming
   */
  const closeDeleteOrderDialog = () => {
    setDeleteOrderDialog({ open: false, orderId: null, order: null });
  };

  /**
   * Confirm and delete order
   * NOTA: El backend libera el stock automáticamente si el pedido estaba pendiente/en proceso
   */
  const confirmDeleteOrder = async () => {
    if (!deleteOrderDialog.orderId || !deleteOrderDialog.order) return;

    const orderId = deleteOrderDialog.orderId;
    setIsDeletingOrder(orderId);
    try {
      // Backend libera el stock automáticamente
      await deleteOrder(orderId);

      // Refrescar productos para actualizar el stock en la UI (stock liberado)
      await refreshProducts();

      // Notification will be created by backend automatically

      toast({
        title: "Pedido eliminado",
        description: "El pedido ha sido eliminado del sistema",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el pedido",
        variant: "destructive",
      });
    } finally {
      setIsDeletingOrder(null);
    }

    setDeleteOrderDialog({ open: false, orderId: null, order: null });
  };


  /**
   * Open payment confirmation dialog for online orders
   */
  const openPaymentConfirmDialog = (order: Order) => {
    setPaymentConfirmDialog({
      open: true,
      order,
    });
  };

  /**
   * Close payment confirmation dialog without confirming
   */
  const closePaymentConfirmDialog = () => {
    setPaymentConfirmDialog({ open: false, order: null });
  };

  /**
   * Confirm and complete order (after payment confirmation)
   * NOTA: El backend maneja automáticamente el descuento de stock al completar
   */
  const confirmCompleteOrder = async () => {
    if (!paymentConfirmDialog.order) return;

    const order = paymentConfirmDialog.order;

    setIsCompletingOrder(order.id);
    try {
      // Backend automáticamente confirma la venta y descuenta el stock real
      await updateOrderStatus(order.id, 'completed');

      // Refrescar productos para actualizar el stock en la UI
      await refreshProducts();

      // Notification will be created by backend automatically

      toast({
        title: "Pedido completado",
        description: "El pedido ha sido marcado como completado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el pedido",
        variant: "destructive",
      });
    } finally {
      setIsCompletingOrder(null);
    }

    setPaymentConfirmDialog({ open: false, order: null });
  };

  /**
   * Complete order - opens confirmation dialog for in-store orders
   * Online orders are handled via onCompleteWithConfirmation prop
   */
  const handleCompleteOrder = (order: Order) => {
    if (order.type === 'in-store') {
      // In-store orders need payment confirmation dialog
      openCompleteInStoreDialog(order);
    } else {
      // Online orders: direct complete (fallback, normally uses onCompleteWithConfirmation)
      directCompleteOrder(order);
    }
  };

  /**
   * Direct complete order (without dialog)
   * NOTA: El backend maneja automáticamente el descuento de stock al completar
   */
  const directCompleteOrder = async (order: Order) => {
    setIsCompletingOrder(order.id);
    try {
      // Backend automáticamente confirma la venta y descuenta el stock real
      await updateOrderStatus(order.id, 'completed');

      // Refrescar productos para actualizar el stock en la UI
      await refreshProducts();

      // Notification will be created by backend automatically

      toast({
        title: "Pedido completado",
        description: "El pedido ha sido marcado como completado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el pedido",
        variant: "destructive",
      });
    } finally {
      setIsCompletingOrder(null);
    }
  };

  /**
   * Open cancel order dialog
   */
  const openCancelOrderDialog = (order: Order) => {
    setCancelOrderDialog({
      open: true,
      order,
    });
  };

  /**
   * Close cancel order dialog
   */
  const closeCancelOrderDialog = () => {
    setCancelOrderDialog({ open: false, order: null });
  };

  /**
   * Confirm and cancel order
   * NOTA: El backend libera el stock automáticamente al cancelar
   */
  const confirmCancelOrder = async () => {
    if (!cancelOrderDialog.order) return;

    const order = cancelOrderDialog.order;
    setIsCancellingOrder(order.id);
    try {
      await updateOrderStatus(order.id, 'cancelled');

      // Refrescar productos para actualizar el stock en la UI (stock liberado)
      await refreshProducts();

      // Notification will be created by backend automatically

      toast({
        title: "Pedido cancelado",
        description: "El pedido ha sido cancelado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar el pedido",
        variant: "destructive",
      });
    } finally {
      setIsCancellingOrder(null);
    }

    setCancelOrderDialog({ open: false, order: null });
  };

  /**
   * Open complete in-store order dialog
   */
  const openCompleteInStoreDialog = (order: Order) => {
    setCompleteInStoreDialog({
      open: true,
      order,
    });
  };

  /**
   * Close complete in-store order dialog
   */
  const closeCompleteInStoreDialog = () => {
    setCompleteInStoreDialog({ open: false, order: null });
  };

  /**
   * Confirm and complete in-store order (after payment confirmation)
   * NOTA: El backend maneja automáticamente el descuento de stock al completar
   */
  const confirmCompleteInStoreOrder = async () => {
    if (!completeInStoreDialog.order) return;

    const order = completeInStoreDialog.order;
    setIsCompletingOrder(order.id);
    try {
      // Backend automáticamente confirma la venta y descuenta el stock real
      await updateOrderStatus(order.id, 'completed');

      // Refrescar productos para actualizar el stock en la UI
      await refreshProducts();

      // Notification will be created by backend automatically

      toast({
        title: "Pedido completado",
        description: "El pedido ha sido marcado como completado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el pedido",
        variant: "destructive",
      });
    } finally {
      setIsCompletingOrder(null);
    }

    setCompleteInStoreDialog({ open: false, order: null });
  };

  /**
   * Handle cancel order - opens confirmation dialog
   */
  const handleCancelOrder = (order: Order) => {
    openCancelOrderDialog(order);
  };

  /**
   * Handle complete order - opens appropriate dialog based on order type
   */
  const handleCompleteOrderWithDialog = (order: Order) => {
    if (order.type === 'in-store') {
      openCompleteInStoreDialog(order);
    } else {
      // Online orders use the payment confirmation dialog via onCompleteWithConfirmation
      handleCompleteOrder(order);
    }
  };

  return {
    // Order data
    onlineOrders,
    inStoreOrders,
    isLoading,

    // Loading states for actions
    isCreatingOrder,
    isCompletingOrder,
    isCancellingOrder,
    isDeletingOrder,

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

    // Product data
    activeProducts,
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

    // Cancel order dialog
    cancelOrderDialog,
    openCancelOrderDialog,
    closeCancelOrderDialog,
    confirmCancelOrder,

    // Complete in-store order dialog
    completeInStoreDialog,
    openCompleteInStoreDialog,
    closeCompleteInStoreDialog,
    confirmCompleteInStoreOrder,
  };
};

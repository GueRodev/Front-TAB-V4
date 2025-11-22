/**
 * Order Transformers
 * Bidirectional transformations between Laravel API and Frontend formats
 */

import type { Order, OrderItem } from '../types';

/**
 * Laravel → Frontend: Transform Laravel API order to frontend format
 */
export function transformLaravelOrder(laravelOrder: any): Order {
  // Normalize order_type: backend may send "in_store" but frontend uses "in-store"
  let orderType = laravelOrder.order_type as string;
  if (orderType === 'in_store') {
    orderType = 'in-store';
  }

  return {
    id: String(laravelOrder.id),
    order_number: laravelOrder.order_number,
    user_id: laravelOrder.user_id ? String(laravelOrder.user_id) : undefined,
    type: orderType as Order['type'],
    status: laravelOrder.status,
    items: laravelOrder.items?.map(transformLaravelOrderItem) || [],
    subtotal: Number(laravelOrder.subtotal),
    shipping_cost: Number(laravelOrder.shipping_cost),
    total: Number(laravelOrder.total),
    createdAt: laravelOrder.created_at,
    updatedAt: laravelOrder.updated_at,
    customerInfo: {
      name: laravelOrder.customer_name,
      phone: laravelOrder.customer_phone,
      email: laravelOrder.customer_email,
    },
    delivery_address: laravelOrder.shipping_address ? {
      province: laravelOrder.shipping_address.province,
      canton: laravelOrder.shipping_address.canton,
      district: laravelOrder.shipping_address.district,
      address: laravelOrder.shipping_address.address_details,
    } : undefined,
    deliveryOption: laravelOrder.delivery_option,
    paymentMethod: laravelOrder.payment_method,
    notes: laravelOrder.notes,
    archived: laravelOrder.status === 'archived',
    deleted_at: laravelOrder.deleted_at,
  };
}

/**
 * Frontend → Laravel: Transform frontend order data to Laravel API format
 *
 * El backend acepta 3 formas de enviar dirección:
 * 1. address_id: ID de una dirección guardada del usuario
 * 2. shipping_address con IDs: { province_id, canton_id, district_id, address_details }
 * 3. shipping_address con nombres: { province, canton, district, address_details }
 *
 * El frontend usa nombres (via LocationSelector), así que enviamos opción 3.
 */
export function transformToLaravelOrderPayload(
  orderData: any,
  orderType: 'online' | 'in-store'
) {
  const payload: any = {
    customer_name: orderData.customerInfo?.name || orderData.customerName,
    customer_phone: orderData.customerInfo?.phone || orderData.customerPhone,
    customer_email: orderData.customerInfo?.email || orderData.customerEmail || null,
    delivery_option: orderData.deliveryOption,
    payment_method: orderData.paymentMethod,
    notes: orderData.notes || null,
    items: orderData.items.map((item: any) => ({
      product_id: Number(item.product_id) || Number(item.id),
      quantity: item.quantity,
    })),
  };

  // Add address only for online + delivery
  if (orderType === 'online' && orderData.deliveryOption === 'delivery') {
    // Option 1: Use saved address ID if available
    if (orderData.address_id) {
      payload.address_id = Number(orderData.address_id);
    }
    // Option 2/3: Use shipping_address with names
    else if (orderData.delivery_address) {
      payload.shipping_address = {
        province: orderData.delivery_address.province,
        canton: orderData.delivery_address.canton,
        district: orderData.delivery_address.district,
        address_details: orderData.delivery_address.address || orderData.delivery_address.address_details,
      };
    }
  }

  return payload;
}

/**
 * Laravel → Frontend: Transform Laravel order item to frontend format
 */
function transformLaravelOrderItem(laravelItem: any): OrderItem {
  return {
    id: String(laravelItem.id),
    product_id: laravelItem.product_id,
    name: laravelItem.product_name,
    product_sku: laravelItem.product_sku,
    product_description: laravelItem.product_description,
    image: laravelItem.product_image_url || '',
    price: Number(laravelItem.price_at_purchase),
    quantity: laravelItem.quantity,
    subtotal: Number(laravelItem.subtotal),
  };
}

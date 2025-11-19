/**
 * Laravel ↔ Frontend Data Transformers for Products
 * Converts between Laravel backend format and frontend structure
 */

import type { Product, CreateProductDto, UpdateProductDto } from '../types/product.types';
import type { StockMovement } from '../types/stock-movement.types';
import type { PaginatedResponse } from '@/api/types';

/**
 * Transform Laravel Product to Frontend format
 * Handles ID conversion, field renaming, and relation transformation
 */
export function transformLaravelProduct(laravelProduct: any): Product {
  return {
    // Transform IDs from number to string
    id: String(laravelProduct.id),
    category_id: String(laravelProduct.category_id),
    
    // Core fields
    name: laravelProduct.name,
    slug: laravelProduct.slug,
    brand: laravelProduct.brand,
    description: laravelProduct.description,
    sku: laravelProduct.sku,
    
    // Pricing & Stock
    price: Number(laravelProduct.price),
    stock: laravelProduct.stock,
    
    // Media
    image_url: laravelProduct.image_url,
    
    // Status
    status: laravelProduct.status,
    is_featured: laravelProduct.is_featured,
    
    // Soft delete
    deleted_at: laravelProduct.deleted_at,
    
    // Timestamps
    created_at: laravelProduct.created_at,
    updated_at: laravelProduct.updated_at,
    
    // Eager loaded relations (optional)
    category: laravelProduct.category,
    stock_movements: laravelProduct.stock_movements?.map(transformLaravelStockMovement),
    stock_movements_count: laravelProduct.stock_movements_count,
  };
}

/**
 * Transform Frontend Product to Laravel payload (CREATE/UPDATE)
 * Converts IDs to numbers and prepares data for backend
 */
export function transformToLaravelProductPayload(product: CreateProductDto | UpdateProductDto): any {
  const payload: any = {};
  
  if (product.name !== undefined) payload.name = product.name;
  if (product.category_id !== undefined) payload.category_id = Number(product.category_id);
  if (product.brand !== undefined) payload.brand = product.brand || null;
  if (product.description !== undefined) payload.description = product.description || null;
  if (product.sku !== undefined) payload.sku = product.sku || null;
  if (product.price !== undefined) payload.price = product.price;
  if (product.stock !== undefined) payload.stock = product.stock;
  if (product.status !== undefined) payload.status = product.status;
  if (product.is_featured !== undefined) payload.is_featured = product.is_featured;
  
  // Note: image is handled separately with FormData
  
  return payload;
}

/**
 * Transform Laravel StockMovement to Frontend format
 */
export function transformLaravelStockMovement(laravelMovement: any): StockMovement {
  return {
    id: String(laravelMovement.id),
    product_id: String(laravelMovement.product_id),
    type: laravelMovement.type,
    quantity: laravelMovement.quantity,
    stock_before: laravelMovement.stock_before,
    stock_after: laravelMovement.stock_after,
    reason: laravelMovement.reason,
    user_id: String(laravelMovement.user_id),
    order_id: laravelMovement.order_id ? String(laravelMovement.order_id) : null,
    created_at: laravelMovement.created_at,
    updated_at: laravelMovement.updated_at,
    
    // Relations (optional)
    product: laravelMovement.product ? transformLaravelProduct(laravelMovement.product) : undefined,
    user: laravelMovement.user,
    order: laravelMovement.order,
  };
}

/**
 * Transform Laravel paginated response to frontend format
 * Handles Laravel's pagination structure
 */
export function transformLaravelPaginatedProducts(laravelResponse: any): PaginatedResponse<Product> {
  return {
    data: laravelResponse.data.map(transformLaravelProduct),
    pagination: {
      currentPage: laravelResponse.current_page,
      totalPages: laravelResponse.last_page,
      totalItems: laravelResponse.total,
      itemsPerPage: laravelResponse.per_page,
      hasNextPage: laravelResponse.next_page_url !== null,
      hasPreviousPage: laravelResponse.prev_page_url !== null,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Transform array of Laravel products to frontend format
 */
export function transformLaravelProducts(laravelProducts: any[]): Product[] {
  return laravelProducts.map(transformLaravelProduct);
}

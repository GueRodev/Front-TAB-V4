/**
 * Products Feature Module
 * Public API for product management
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Contexts
export { ProductsProvider, useProducts } from './contexts';

// Services
export * from './services';

// Validations
export * from './validations';

// Types
export type { 
  Product, 
  ProductStatus
} from './types';

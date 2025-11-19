/**
 * Products Admin Business Logic Hook
 * Manages all business logic for admin products page
 * Updated for Laravel backend compatibility
 */

import { useState } from 'react';
import { useProducts } from '../contexts';
import { useCategories } from '@/features/categories';
import { useNotifications } from '@/features/notifications';
import { toast } from '@/hooks/use-toast';
import { productSchema } from '../validations';
import { useProductFilters } from './useProductFilters';
import type { Product, CreateProductDto } from '../types';

// Form data type for UI (strings for inputs)
export interface ProductAdminFormData {
  name: string;
  brand: string;
  category_id: string;
  sku: string;
  price: string;
  stock: string;
  description: string;
  status: 'active' | 'inactive' | 'out_of_stock';
}

interface DeleteProductDialog {
  open: boolean;
  productId: string;
  productName: string;
}

interface UseProductsAdminReturn {
  // Products data
  products: Product[];
  categories: ReturnType<typeof useCategories>['categories'];
  
  // Filters (delegated to useProductFilters)
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  filteredProducts: Product[];
  resetFilters: () => void;
  filterSummary: {
    hasActiveFilters: boolean;
    resultCount: number;
    totalCount: number;
  };

  // Dialog states
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  deleteProductDialog: DeleteProductDialog;
  
  // Form state
  selectedImage: File | null;
  selectedProduct: Product | null;
  formData: ProductAdminFormData;
  availableSubcategories: any[];
  
  // Handlers
  setIsAddDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setSelectedImage: (image: File | null) => void;
  setFormData: (data: ProductAdminFormData) => void;
  setDeleteProductDialog: (dialog: DeleteProductDialog) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  handleEditProduct: (product: Product) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleUpdateProduct: (e: React.FormEvent) => void;
  openDeleteProductDialog: (productId: string) => void;
  confirmDeleteProduct: () => void;
  handleToggleFeatured: (productId: string, is_featured: boolean) => void;
  handleOpenAddDialog: () => void;
}

export const useProductsAdmin = (): UseProductsAdminReturn => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { addNotification } = useNotifications();

  // Product filtering logic (delegated to useProductFilters)
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    resetFilters,
    getFilterSummary,
  } = useProductFilters({ 
    products, 
    includeInactive: true // Admin sees all products
  });

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState<DeleteProductDialog>({
    open: false,
    productId: '',
    productName: '',
  });

  // Form state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductAdminFormData>({
    name: '',
    brand: '',
    category_id: '',
    sku: '',
    price: '',
    stock: '',
    description: '',
    status: 'active'
  });

  // Derived state - subcategories for form (deprecated but kept for compatibility)
  const availableSubcategories = categories.find(
    c => c.id === formData.category_id
  )?.subcategories || [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand || '',
      category_id: product.category_id,
      sku: product.sku || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      status: product.status
    });
    setSelectedImage(null); // Reset image, use existing product.image_url
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        name: formData.name,
        brand: formData.brand || null,
        category_id: formData.category_id,
        sku: formData.sku || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        description: formData.description || null,
        image: selectedImage,
        status: formData.status,
        is_featured: false,
        slug: '', // Generated by backend
        image_url: '', // Generated by backend
      };

      await addProduct(productData);
      
      toast({
        title: 'Éxito',
        description: 'Producto creado exitosamente',
      });
      
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        brand: '',
        category_id: '',
        sku: '',
        price: '',
        stock: '',
        description: '',
        status: 'active'
      });
      setSelectedImage(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el producto',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    try {
      const updateData: any = {
        name: formData.name,
        brand: formData.brand || null,
        category_id: formData.category_id,
        sku: formData.sku || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        description: formData.description || null,
        status: formData.status,
      };
      
      if (selectedImage) {
        updateData.image = selectedImage;
      }

      await updateProduct(selectedProduct.id, updateData);
      
      toast({
        title: 'Éxito',
        description: 'Producto actualizado exitosamente',
      });
      
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      setSelectedImage(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el producto',
        variant: 'destructive',
      });
    }
  };

  const openDeleteProductDialog = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setDeleteProductDialog({
        open: true,
        productId: product.id,
        productName: product.name,
      });
    }
  };

  const confirmDeleteProduct = async () => {
    const { productId, productName } = deleteProductDialog;
    
    await deleteProduct(productId);
    
    toast({
      title: "Producto eliminado",
      description: `${productName} ha sido eliminado del inventario`,
    });

    setDeleteProductDialog({
      open: false,
      productId: '',
      productName: '',
    });
  };

  const handleToggleFeatured = async (productId: string, is_featured: boolean) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      await updateProduct(productId, { is_featured });
      toast({
        title: is_featured ? "Producto destacado" : "Producto no destacado",
        description: `${product.name} ${is_featured ? 'aparecerá' : 'no aparecerá'} en productos destacados`,
      });
    }
  };

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  return {
    // Products data
    products,
    categories,
    
    // Filters (delegated to useProductFilters)
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    resetFilters,
    filterSummary: getFilterSummary(),

    // Dialog states
    isAddDialogOpen,
    isEditDialogOpen,
    deleteProductDialog,
    
    // Form state
    selectedImage,
    selectedProduct,
    formData,
    availableSubcategories,
    
    // Handlers
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setSelectedImage,
    setFormData,
    setDeleteProductDialog,
    handleImageUpload,
    handleRemoveImage,
    handleEditProduct,
    handleSubmit,
    handleUpdateProduct,
    openDeleteProductDialog,
    confirmDeleteProduct,
    handleToggleFeatured,
    handleOpenAddDialog,
  };
};

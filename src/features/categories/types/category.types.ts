/**
 * Category Types - Laravel Backend Compatible
 * Hierarchical structure using parent_id instead of nested subcategories
 */

export interface Category {
  // Core fields
  id: string;                    // Transformed from Laravel number to string
  name: string;
  slug: string;
  description?: string;
  
  // Hierarchy fields (NEW - Laravel integration)
  parent_id: string | null;      // For parent-child relationships
  level: number;                 // 0=category, 1=subcategory, 2-3=more levels
  order: number;
  
  // Status fields (NEW - Laravel integration)
  is_protected: boolean;         // "Otros" category cannot be deleted
  is_active: boolean;            // Filter active/inactive
  
  // Relations (MODIFIED)
  children?: Category[];         // Changed from subcategories to children
  subcategories?: Subcategory[]; // DEPRECATED - kept for backward compatibility
  products_count?: number;       // Product counter for UI
  
  // Soft delete (NEW - Laravel integration)
  deleted_at?: string | null;    // For recycle bin functionality
  
  // Timestamps (NEW - Laravel integration)
  created_at?: string;
  updated_at?: string;
  
  // UI only
  isExpanded?: boolean;          // For collapsible UI
}

/**
 * Subcategory Type - DEPRECATED
 * ⚠️ Subcategories are now Category with parent_id !== null
 * This type is maintained only for temporary backward compatibility
 */
export interface Subcategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  slug: string;
  parent_id?: string;            // Reference to parent category
  level?: number;                // Always >= 1 for subcategories
}

// DTO types for API operations
export interface CreateCategoryDto {
  name: string;
  description?: string;
  parent_id?: string | null;     // To create as subcategory
  level?: number;                // Required by Laravel
  order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parent_id?: string | null;     // To move subcategory
  level?: number;
  order?: number;
  is_active?: boolean;
}

export interface CreateSubcategoryDto {
  name: string;
  description?: string;
}

export interface UpdateSubcategoryDto {
  name?: string;
  description?: string;
  order?: number;
}

// Reorder DTO - NEW format for Laravel
export interface ReorderCategoriesDto {
  categories: Array<{
    id: string;
    order: number;
  }>;
  order?: string[]; // DEPRECATED - old format, kept for compatibility
}

export interface CategoryWithProducts extends Category {
  products?: any[];              // For show endpoint with products relation
}

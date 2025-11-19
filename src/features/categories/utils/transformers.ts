/**
 * Laravel ↔ Frontend Data Transformers
 * Converts between Laravel backend format and frontend structure
 */

import type { Category, Subcategory } from '../types';

/**
 * Transform Laravel category response to Frontend format
 * Laravel: Category with children relation
 * Frontend: Category with both children and subcategories (for compatibility)
 */
export function transformLaravelCategory(laravelCat: any): Category {
  const transformed: Category = {
    id: String(laravelCat.id),                    // number → string
    name: laravelCat.name,
    slug: laravelCat.slug,
    description: laravelCat.description || undefined,
    parent_id: laravelCat.parent_id ? String(laravelCat.parent_id) : null,
    level: laravelCat.level ?? 0,
    order: laravelCat.order ?? 0,
    is_protected: laravelCat.is_protected ?? false,
    is_active: laravelCat.is_active ?? true,
    
    // Transform children recursively
    children: laravelCat.children?.map(transformLaravelCategory) || [],
    
    products_count: laravelCat.products_count,
    deleted_at: laravelCat.deleted_at || null,
    created_at: laravelCat.created_at,
    updated_at: laravelCat.updated_at,
    isExpanded: false,                            // UI state
  };

  // For backward compatibility, also populate subcategories array
  if (transformed.children && transformed.children.length > 0) {
    transformed.subcategories = transformed.children.map(child => ({
      id: child.id,
      name: child.name,
      description: child.description,
      order: child.order,
      slug: child.slug,
      parent_id: transformed.id,
      level: child.level,
    }));
  } else {
    transformed.subcategories = [];
  }

  return transformed;
}

/**
 * Transform Frontend Category to Laravel payload
 * For CREATE and UPDATE requests
 */
export function transformToLaravelPayload(category: Partial<Category>) {
  const payload: any = {
    name: category.name,
    description: category.description || null,
    level: category.level ?? 0,
    order: category.order ?? 0,
  };

  // Only include parent_id if explicitly set
  if (category.parent_id !== undefined) {
    payload.parent_id = category.parent_id ? Number(category.parent_id) : null;
  }

  // Only include is_active if explicitly set
  if (category.is_active !== undefined) {
    payload.is_active = category.is_active;
  }

  return payload;
}

/**
 * Flatten hierarchical categories to flat list
 * For compatibility with legacy code expecting subcategories[]
 */
export function flattenCategories(categories: Category[]): { 
  categories: Category[], 
  subcategories: Subcategory[] 
} {
  const cats: Category[] = [];
  const subs: Subcategory[] = [];
  
  categories.forEach(cat => {
    // Add parent category
    cats.push({
      ...cat,
      children: undefined,  // Remove children for flat structure
    });
    
    // Add children as subcategories
    if (cat.children && cat.children.length > 0) {
      cat.children.forEach(child => {
        subs.push({
          id: child.id,
          name: child.name,
          description: child.description,
          order: child.order,
          slug: child.slug,
          parent_id: cat.id,
          level: child.level,
        });
      });
    }
  });
  
  return { categories: cats, subcategories: subs };
}

/**
 * Unflatten subcategories back to hierarchical structure
 * For compatibility with localStorage or migration
 */
export function unflattenToHierarchy(
  categories: Category[], 
  subcategories: Subcategory[]
): Category[] {
  return categories.map(cat => ({
    ...cat,
    children: subcategories
      .filter(sub => sub.parent_id === cat.id)
      .map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        parent_id: cat.id,
        level: sub.level || 1,
        order: sub.order,
        is_protected: false,
        is_active: true,
        children: [],
        subcategories: [],
      } as Category))
      .sort((a, b) => a.order - b.order),
    subcategories: subcategories
      .filter(sub => sub.parent_id === cat.id)
      .sort((a, b) => a.order - b.order),
  }));
}

/**
 * Transform array of Laravel categories to frontend format
 */
export function transformLaravelCategories(laravelCategories: any[]): Category[] {
  return laravelCategories.map(transformLaravelCategory);
}

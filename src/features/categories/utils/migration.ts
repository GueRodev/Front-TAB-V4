/**
 * Data Migration Utilities
 * Migrate categories from old localStorage format to new Laravel format
 */

import type { Category } from '../types';
import { STORAGE_KEYS } from '@/config';

interface OldCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    order: number;
  }>;
}

/**
 * Migrate categories from old format to new Laravel format
 * Old: { id, name, subcategories: [...] }
 * New: { id, name, parent_id, level, children: [...] }
 */
export async function migrateCategoriesFormat(): Promise<Category[]> {
  const stored = localStorage.getItem(STORAGE_KEYS.categories);
  const oldCategories = stored ? JSON.parse(stored) as OldCategory[] : null;
  
  if (!oldCategories || oldCategories.length === 0) {
    return [];
  }

  const newCategories: Category[] = [];
  
  oldCategories.forEach((oldCat, index) => {
    // Convert parent category
    const parentCategory: Category = {
      id: oldCat.id,
      name: oldCat.name,
      slug: oldCat.slug,
      description: oldCat.description,
      parent_id: null,
      level: 0,
      order: oldCat.order ?? index,
      is_protected: oldCat.name.toLowerCase() === 'otros',
      is_active: true,
      children: [],
      subcategories: [],
    };
    
    // Convert subcategories to categories with parent_id
    if (oldCat.subcategories && oldCat.subcategories.length > 0) {
      const children: Category[] = oldCat.subcategories.map((sub, subIndex) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        parent_id: oldCat.id,
        level: 1,
        order: sub.order ?? subIndex,
        is_protected: false,
        is_active: true,
        children: [],
        subcategories: [],
      }));
      
      parentCategory.children = children;
      parentCategory.subcategories = oldCat.subcategories;
    }
    
    newCategories.push(parentCategory);
  });
  
  return newCategories;
}

/**
 * Check if categories need migration
 */
export function needsMigration(): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.categories);
  const categories = stored ? JSON.parse(stored) : null;
  
  if (!categories || categories.length === 0) {
    return false;
  }
  
  // Check if first category has new format fields
  const firstCat = categories[0];
  return firstCat.parent_id === undefined && firstCat.level === undefined;
}

/**
 * Perform migration and save to localStorage
 */
export async function performMigration(): Promise<void> {
  if (!needsMigration()) {
    console.log('Categories already in new format, skipping migration');
    return;
  }
  
  console.log('Migrating categories to new format...');
  const migratedCategories = await migrateCategoriesFormat();
  
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(migratedCategories));
  console.log(`Migration complete: ${migratedCategories.length} categories migrated`);
}

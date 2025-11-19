/**
 * CategoriesList Component
 * Mobile card view with drag & drop
 */

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CategoryCard } from './CategoryCard';
import type { Category, Subcategory } from '../types';

interface CategoriesListProps {
  categories: Category[];
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onEditSubcategory: (categoryId: string, subcategory: Subcategory) => void;
  onDeleteSubcategory: (categoryId: string, subcategoryId: string) => void;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({
  categories,
  onDragEnd,
  onEdit,
  onDelete,
  onToggleExpand,
  onEditSubcategory,
  onDeleteSubcategory,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="md:hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={categories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleExpand={onToggleExpand}
              onEditSubcategory={onEditSubcategory}
              onDeleteSubcategory={onDeleteSubcategory}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

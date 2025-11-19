/**
 * CategoriesTable Component
 * Desktop table view with drag & drop
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
import { CategoryRow } from './CategoryRow';
import type { Category, Subcategory } from '../types';

interface CategoriesTableProps {
  categories: Category[];
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onEditSubcategory: (categoryId: string, subcategory: Subcategory) => void;
  onDeleteSubcategory: (categoryId: string, subcategoryId: string) => void;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
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
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Nombre</th>
            <th className="px-6 py-3 text-center text-sm font-medium">Subcategorías</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
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
                <CategoryRow
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
        </tbody>
      </table>
    </div>
  );
};

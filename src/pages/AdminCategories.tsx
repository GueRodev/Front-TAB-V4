/**
 * AdminCategories Page
 * Category management page with drag & drop reordering
 */

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Trash2 } from 'lucide-react';
import {
  CategoriesTable,
  CategoriesList,
  CategoryFormDialog,
  SubcategoryFormDialog,
  CategoryRecycleBin,
} from '@/features/categories';
import { DeleteConfirmDialog } from '@/components/common';
import { useCategoriesAdmin, useCategoryRecycleBin } from '@/features/categories';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminCategories: React.FC = () => {
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const {
    // Data
    categories,
    pendingCategories,
    loading,
    hasUnsavedChanges,
    deletedCount,

    // Modal states
    isAddModalOpen,
    modalType,
    selectedCategoryId,
    setSelectedCategoryId,

    // Edit states
    isEditCategoryOpen,
    setIsEditCategoryOpen,
    isEditSubcategoryOpen,
    setIsEditSubcategoryOpen,

    // Form data
    addFormData,
    setAddFormData,
    editFormData,
    setEditFormData,

    // Delete dialog
    deleteSubcategoryDialog,
    setDeleteSubcategoryDialog,
    deleteCategoryDialog,
    setDeleteCategoryDialog,

    // Handlers
    handleDragEnd,
    handleSaveChanges,
    handleCancelChanges,
    openAddModal,
    closeAddModal,
    handleAddItem,
    openEditCategory,
    openEditSubcategory,
    handleUpdateCategory,
    handleUpdateSubcategory,
    openDeleteCategoryDialog,
    confirmDeleteCategory,
    openDeleteSubcategoryDialog,
    confirmDeleteSubcategory,
    handleToggleExpand,
  } = useCategoriesAdmin();

  const {
    deletedCategories,
    isLoading: recycleBinLoading,
    confirmDialog: recycleBinDialog,
    openRestoreDialog,
    openForceDeleteDialog,
    closeConfirmDialog: closeRecycleBinDialog,
    handleConfirm: handleRecycleBinConfirm,
  } = useCategoryRecycleBin({ isVisible: showRecycleBin });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader title="Gestión de Categorías" />

          <div className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
              {/* Page Header */}
              <div className="flex flex-col gap-4">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
                    Categorías
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base lg:text-lg">
                    Gestiona la Categoría de Productos
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  onClick={() => openAddModal('category')}
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Categoría
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (categories.length > 0) {
                      openAddModal('subcategory', categories[0].id);
                    }
                  }}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Subcategoría
                </Button>

                {hasUnsavedChanges && (
                  <>
                    <Button
                      onClick={handleSaveChanges}
                      className="w-full sm:w-auto"
                      variant="default"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </Button>
                    <Button
                      onClick={handleCancelChanges}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Descartar Cambios
                    </Button>
                  </>
                )}

                {/* Recycle Bin Toggle */}
                <div className="sm:ml-auto">
                  <Button
                    onClick={() => setShowRecycleBin(!showRecycleBin)}
                    variant={showRecycleBin ? "default" : "outline"}
                    className="w-full sm:w-auto relative"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Papelera
                    {deletedCount > 0 && (
                      <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                        {deletedCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Recycle Bin Section */}
              {showRecycleBin && (
                <CategoryRecycleBin
                  deletedCategories={deletedCategories}
                  onRestore={openRestoreDialog}
                  onForceDelete={openForceDeleteDialog}
                  isLoading={recycleBinLoading}
                />
              )}

              {/* Categories Table/Cards */}
              {!showRecycleBin && (
                <div className="bg-card rounded-lg shadow-sm border">
                  <CategoriesTable
                    categories={pendingCategories}
                    onDragEnd={handleDragEnd}
                    onEdit={openEditCategory}
                    onDelete={openDeleteCategoryDialog}
                    onToggleExpand={handleToggleExpand}
                    onEditSubcategory={openEditSubcategory}
                    onDeleteSubcategory={openDeleteSubcategoryDialog}
                  />

                  <CategoriesList
                    categories={pendingCategories}
                    onDragEnd={handleDragEnd}
                    onEdit={openEditCategory}
                    onDelete={openDeleteCategoryDialog}
                    onToggleExpand={handleToggleExpand}
                    onEditSubcategory={openEditSubcategory}
                    onDeleteSubcategory={openDeleteSubcategoryDialog}
                  />
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Add Category/Subcategory Modal */}
      {modalType === 'category' ? (
        <CategoryFormDialog
          open={isAddModalOpen}
          onOpenChange={closeAddModal}
          mode="add"
          formData={addFormData}
          onFormDataChange={setAddFormData}
          onSubmit={handleAddItem}
          loading={loading}
        />
      ) : (
        <SubcategoryFormDialog
          open={isAddModalOpen}
          onOpenChange={closeAddModal}
          mode="add"
          formData={addFormData}
          onFormDataChange={setAddFormData}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          onSubmit={handleAddItem}
          loading={loading}
        />
      )}

      {/* Edit Category Modal */}
      <CategoryFormDialog
        open={isEditCategoryOpen}
        onOpenChange={setIsEditCategoryOpen}
        mode="edit"
        formData={editFormData}
        onFormDataChange={setEditFormData}
        onSubmit={handleUpdateCategory}
        loading={loading}
      />

      {/* Edit Subcategory Modal */}
      <SubcategoryFormDialog
        open={isEditSubcategoryOpen}
        onOpenChange={setIsEditSubcategoryOpen}
        mode="edit"
        formData={editFormData}
        onFormDataChange={setEditFormData}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        onSubmit={handleUpdateSubcategory}
        loading={loading}
      />

      {/* Delete Category Confirmation */}
      <DeleteConfirmDialog
        open={deleteCategoryDialog.open}
        onOpenChange={(open) =>
          setDeleteCategoryDialog({ ...deleteCategoryDialog, open })
        }
        itemName={deleteCategoryDialog.categoryName}
        itemType="category"
        onConfirm={confirmDeleteCategory}
      />

      {/* Delete Subcategory Confirmation */}
      <DeleteConfirmDialog
        open={deleteSubcategoryDialog.open}
        onOpenChange={(open) =>
          setDeleteSubcategoryDialog({ ...deleteSubcategoryDialog, open })
        }
        itemName={deleteSubcategoryDialog.subcategoryName}
        itemType="subcategory"
        onConfirm={confirmDeleteSubcategory}
      />

      {/* Recycle Bin Confirmation Dialog */}
      <AlertDialog open={recycleBinDialog.open} onOpenChange={closeRecycleBinDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {recycleBinDialog.action === 'restore'
                ? '¿Restaurar categoría?'
                : '¿Eliminar permanentemente?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {recycleBinDialog.action === 'restore' ? (
                <>
                  Se restaurará la categoría <strong>"{recycleBinDialog.categoryName}"</strong> y
                  todos los productos que tenía asignados volverán automáticamente a esta categoría.
                </>
              ) : (
                <>
                  Esta acción eliminará permanentemente la categoría <strong>"{recycleBinDialog.categoryName}"</strong>.
                  Los productos asociados serán movidos a "Otros". Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRecycleBinConfirm}
              className={recycleBinDialog.action === 'restore'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-destructive hover:bg-destructive/90'}
            >
              {recycleBinDialog.action === 'restore' ? 'Restaurar' : 'Eliminar Permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default AdminCategories;

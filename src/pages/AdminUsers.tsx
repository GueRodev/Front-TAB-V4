/**
 * AdminUsers Page
 * Gestión de usuarios Admin y Moderador
 *
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * - Solo gestiona Admin y Moderador (NO clientes)
 * - Usa useUsersAdmin hook con API real
 */

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import { useUsersAdmin } from '@/features/admin-users';
import { AdminsList, AdminFormDialog } from '@/features/admin-users';
import { DeleteConfirmDialog } from '@/components/common';
import { useAuth } from '@/features/auth';

const AdminUsuarios: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'admin'; // Solo Super Admin puede gestionar usuarios

  const {
    filteredAdmins,
    searchAdmins,
    isAdminDialogOpen,
    editingAdmin,
    adminFormData,
    isLoading,
    isSaving,
    deleteDialogOpen,
    adminToDelete,
    setSearchAdmins,
    setAdminFormData,
    setDeleteDialogOpen,
    handleOpenAdminDialog,
    handleCloseAdminDialog,
    handleSubmitAdmin,
    handleDeleteAdmin,
    confirmDeleteAdmin,
  } = useUsersAdmin();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader title="Gestión de Usuarios" />

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* Admins Section */}
            <AdminsList
              admins={filteredAdmins}
              searchQuery={searchAdmins}
              onSearchChange={setSearchAdmins}
              onAdd={() => handleOpenAdminDialog()}
              onEdit={handleOpenAdminDialog}
              onDelete={handleDeleteAdmin}
              isLoading={isLoading}
              canManageUsers={isSuperAdmin}
            />

            {/* Admin Form Dialog */}
            <AdminFormDialog
              open={isAdminDialogOpen}
              onOpenChange={(open) => {
                if (!open) handleCloseAdminDialog();
              }}
              isEditing={!!editingAdmin}
              formData={adminFormData}
              onFormDataChange={setAdminFormData}
              onSubmit={handleSubmitAdmin}
              isLoading={isSaving}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              itemName={adminToDelete?.name || ''}
              itemType="user"
              onConfirm={confirmDeleteAdmin}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminUsuarios;

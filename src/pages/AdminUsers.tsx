/**
 * AdminUsers Page
 * Gestión de usuarios Admin, Moderador y Clientes
 *
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * - Gestiona Admin y Moderador
 * - Muestra Clientes con sus direcciones
 */

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import { useUsersAdmin, useClients } from '@/features/admin-users';
import { AdminsList, AdminFormDialog, ClientsList } from '@/features/admin-users';
import { DeleteConfirmDialog } from '@/components/common';
import { useAuth } from '@/features/auth';
import { Shield, User } from 'lucide-react';

const AdminUsuarios: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('admins');

  // Hook para administradores
  const {
    filteredAdmins,
    searchAdmins,
    isAdminDialogOpen,
    editingAdmin,
    adminFormData,
    isLoading: isLoadingAdmins,
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

  // Hook para clientes
  const {
    clients,
    isLoading: isLoadingClients,
    searchQuery: searchClients,
    expandedClient,
    setSearchQuery: setSearchClients,
    handleToggleActive,
    handleExpandAddress,
  } = useClients();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader title="Gestión de Usuarios" />

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="admins" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Administradores
                </TabsTrigger>
                <TabsTrigger value="clients" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Clientes
                </TabsTrigger>
              </TabsList>

              {/* Administradores Tab */}
              <TabsContent value="admins">
                <AdminsList
                  admins={filteredAdmins}
                  searchQuery={searchAdmins}
                  onSearchChange={setSearchAdmins}
                  onAdd={() => handleOpenAdminDialog()}
                  onEdit={handleOpenAdminDialog}
                  onDelete={handleDeleteAdmin}
                  isLoading={isLoadingAdmins}
                  canManageUsers={isSuperAdmin}
                />
              </TabsContent>

              {/* Clientes Tab */}
              <TabsContent value="clients">
                <ClientsList
                  clients={clients}
                  searchQuery={searchClients}
                  expandedClient={expandedClient}
                  onSearchChange={setSearchClients}
                  onToggle={handleToggleActive}
                  onExpand={handleExpandAddress}
                />
              </TabsContent>
            </Tabs>

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

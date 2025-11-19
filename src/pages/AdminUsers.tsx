/**
 * AdminUsers Page
 * Orchestrates users management using business logic hook and UI components
 */

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import { Separator } from '@/components/ui/separator';
import { useUsersAdmin } from '@/features/admin-users';
import { ClientsList, AdminsList, AdminFormDialog } from '@/features/admin-users';

const AdminUsuarios: React.FC = () => {
  const {
    filteredClientes,
    filteredAdmins,
    searchClientes,
    searchAdmins,
    expandedCliente,
    isAdminDialogOpen,
    editingAdmin,
    adminFormData,
    setSearchClientes,
    setSearchAdmins,
    setAdminFormData,
    handleClienteToggle,
    handleExpandCliente,
    handleOpenAdminDialog,
    handleCloseAdminDialog,
    handleSubmitAdmin,
    handleDeleteAdmin,
  } = useUsersAdmin();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader title="Gestión de Usuarios" />

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Clients Section */}
            <ClientsList
              clients={filteredClientes}
              searchQuery={searchClientes}
              expandedClient={expandedCliente}
              onSearchChange={setSearchClientes}
              onToggle={handleClienteToggle}
              onExpand={handleExpandCliente}
            />

            {/* Separator */}
            <Separator className="my-8" />

            {/* Admins Section */}
            <AdminsList
              admins={filteredAdmins}
              searchQuery={searchAdmins}
              onSearchChange={setSearchAdmins}
              onAdd={() => handleOpenAdminDialog()}
              onEdit={handleOpenAdminDialog}
              onDelete={handleDeleteAdmin}
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
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminUsuarios;

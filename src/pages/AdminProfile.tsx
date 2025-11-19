/**
 * AdminProfile Page
 * Admin profile management
 */

import { useAuth } from '@/features/auth';
import { useAdminProfile } from '@/features/admin-profile';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ProfileAvatarSection, ProfileFormFields } from '@/features/admin-profile';
import { Calendar, Clock } from 'lucide-react';

const AdminProfile = () => {
  const { user } = useAuth();
  const {
    isEditing,
    avatarPreview,
    formData,
    isUploading,
    errors,
    handleEdit,
    handleCancel,
    handleSave,
    handleAvatarChange,
    handleFieldChange,
  } = useAdminProfile(user);

  if (!user) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader title="Mi Perfil" />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Cargando perfil...</p>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader title="Mi Perfil" />
        
        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Administra tu información de perfil y credenciales de acceso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <ProfileAvatarSection
                  name={user.name}
                  role="Administrador"
                  avatarUrl={undefined}
                  avatarPreview={avatarPreview}
                  isEditing={isEditing}
                  onAvatarChange={handleAvatarChange}
                />
                
                <Separator />
                
                {/* Form Fields */}
                <ProfileFormFields
                  formData={formData}
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                  errors={errors}
                />
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {!isEditing ? (
                    <Button onClick={handleEdit}>
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleSave} 
                        disabled={isUploading}
                      >
                        {isUploading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                      <Button 
                        onClick={handleCancel} 
                        variant="outline"
                        disabled={isUploading}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
                <CardDescription>
                  Detalles sobre tu cuenta y privilegios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Rol</p>
                    <Badge variant="default" className="text-sm">
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge variant="secondary" className="text-sm">
                      Activo
                    </Badge>
                  </div>

                  {/* Created At */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Cuenta creada
                    </p>
                    <p className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Updated At */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Última actualización
                    </p>
                    <p className="text-sm">
                      {new Date(user.updated_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminProfile;

/**
 * useUsersAdmin Hook
 * Business logic for users (admins and moderators) management
 *
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * - Usa usersService con API calls reales
 * - Gestiona estado de carga y errores
 * - Filtra usuarios localmente después de cargar del servidor
 */

import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { CreateAdminFormData, UpdateAdminFormData } from '../validations';
import type { AdminProfile } from '@/features/auth';
import { usersService } from '../services';

export const useUsersAdmin = () => {
  const { toast } = useToast();

  // State
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [searchAdmins, setSearchAdmins] = useState('');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [adminFormData, setAdminFormData] = useState<CreateAdminFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'admin',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<{ id: string; name: string } | null>(null);

  // Load admins on mount
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await usersService.getAdmins();
      setAdmins(response.data);
    } catch (error: any) {
      // Detectar error de permisos del backend
      const errorMessage = error.response?.data?.message || error.message || '';

      let description = 'No se pudieron cargar los administradores';

      // Traducir mensajes comunes del backend
      if (errorMessage.includes('does not have the right roles') ||
          errorMessage.includes('right roles') ||
          error.response?.status === 403) {
        description = 'No tienes permisos para gestionar usuarios. Solo los Super Admin pueden crear/editar/eliminar administradores.';
      } else if (errorMessage) {
        description = errorMessage;
      }

      toast({
        title: 'Error al cargar administradores',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered data
  const filteredAdmins = useMemo(() => {
    if (!searchAdmins) return admins;

    return admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(searchAdmins.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchAdmins.toLowerCase())
    );
  }, [admins, searchAdmins]);

  // Handlers
  const handleOpenAdminDialog = (admin?: AdminProfile) => {
    if (admin) {
      setEditingAdmin(admin);
      setAdminFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        password_confirmation: '',
        role: admin.role,
      });
    } else {
      setEditingAdmin(null);
      setAdminFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'admin',
      });
    }
    setIsAdminDialogOpen(true);
  };

  const handleCloseAdminDialog = () => {
    setIsAdminDialogOpen(false);
    setEditingAdmin(null);
    setAdminFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'admin',
    });
  };

  const handleSubmitAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      if (editingAdmin) {
        // Actualizar usuario existente
        const updateData: UpdateAdminFormData = {
          name: adminFormData.name !== editingAdmin.name ? adminFormData.name : undefined,
          email: adminFormData.email !== editingAdmin.email ? adminFormData.email : undefined,
          role: adminFormData.role !== editingAdmin.role ? adminFormData.role : undefined,
        };

        // Solo enviar password si se proporcionó
        if (adminFormData.password) {
          updateData.password = adminFormData.password;
          updateData.password_confirmation = adminFormData.password_confirmation;
        }

        await usersService.updateAdmin(editingAdmin.id, updateData);

        toast({
          title: 'Administrador actualizado',
          description: 'Los cambios se guardaron correctamente',
        });
      } else {
        // Crear nuevo usuario
        // Asegurar que todos los campos requeridos están presentes
        if (!adminFormData.name || !adminFormData.email || !adminFormData.password || !adminFormData.password_confirmation) {
          toast({
            title: 'Error de validación',
            description: 'Todos los campos son obligatorios',
            variant: 'destructive',
          });
          return;
        }

        await usersService.createAdmin({
          name: adminFormData.name,
          email: adminFormData.email,
          password: adminFormData.password,
          password_confirmation: adminFormData.password_confirmation,
          role: adminFormData.role || 'admin',
        });

        toast({
          title: 'Administrador creado',
          description: 'El nuevo administrador ha sido creado exitosamente',
        });
      }

      // Recargar lista de admins
      await loadAdmins();
      handleCloseAdminDialog();
    } catch (error: any) {
      // Detectar error de permisos del backend
      const errorMessage = error.response?.data?.message || error.message || '';
      let description = 'Ocurrió un error inesperado';

      // Traducir mensajes comunes del backend
      if (errorMessage.includes('does not have the right roles') ||
          errorMessage.includes('right roles') ||
          error.response?.status === 403) {
        description = 'No tienes permisos para gestionar usuarios. Solo los Super Admin pueden crear/editar/eliminar administradores.';
      } else if (errorMessage) {
        description = errorMessage;
      }

      toast({
        title: editingAdmin ? 'Error al actualizar' : 'Error al crear',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = (id: string) => {
    // Buscar el admin para mostrar su nombre en el dialog
    const admin = admins.find(a => a.id === id);
    if (admin) {
      setAdminToDelete({ id: admin.id, name: admin.name });
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      await usersService.deleteAdmin(adminToDelete.id);

      toast({
        title: 'Administrador eliminado',
        description: `${adminToDelete.name} ha sido eliminado del sistema`,
      });

      // Recargar lista de admins
      await loadAdmins();
    } catch (error: any) {
      toast({
        title: 'Error al eliminar',
        description: error.message || 'No se pudo eliminar el administrador',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  };

  return {
    // Data
    filteredAdmins,
    // Search
    searchAdmins,
    // State
    isAdminDialogOpen,
    editingAdmin,
    adminFormData,
    isLoading,
    isSaving,
    // Delete Dialog State
    deleteDialogOpen,
    adminToDelete,
    // Setters
    setSearchAdmins,
    setAdminFormData,
    setDeleteDialogOpen,
    // Handlers
    handleOpenAdminDialog,
    handleCloseAdminDialog,
    handleSubmitAdmin,
    handleDeleteAdmin,
    confirmDeleteAdmin,
    // Refetch
    loadAdmins,
  };
};

/**
 * Account Page Business Logic Hook
 * ✅ INTEGRADO CON LARAVEL BACKEND
 * Handles profile editing state and actions for Cliente users
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { useProfileEditor } from '@/features/admin-profile/hooks';
import { profileService } from '@/features/admin-profile/services';
import { useToast } from '@/hooks/use-toast';
import type { ProfileFormData } from '../validations';

export const useAccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, isClient, updateUser } = useAuth();
  const { toast } = useToast();

  // Use unified profile editor with phone support for clients
  const profileEditor = useProfileEditor(user, {
    includePhone: true, // Clients need phone field
    includeAvatar: true,
    onSuccess: async (updatedUser) => {
      // Update AuthContext with new user data
      updateUser(updatedUser);

      // Optionally refetch full profile to ensure sync
      try {
        const response = await profileService.getProfile();
        updateUser(response.data);
      } catch (error) {
        console.error('Failed to refetch profile:', error);
      }
    },
  });

  const handleSave = async (data: ProfileFormData) => {
    try {
      // Use profile service directly
      const updateData = {
        name: data.name,
        email: data.email,
        ...('phone' in data && data.phone ? { phone: data.phone } : {}),
        ...(data.password && data.password.trim()
          ? {
              password: data.password,
              password_confirmation: data.password_confirmation
            }
          : {}),
      };

      const response = await profileService.updateProfile(updateData);

      // Update auth context
      updateUser(response.data);

      toast({
        title: 'Éxito',
        description: response.message || 'Perfil actualizado correctamente',
      });

      profileEditor.handleCancel();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return {
    user,
    isClient,
    isEditing: profileEditor.isEditing,
    handleEdit: profileEditor.handleEdit,
    handleCancel: profileEditor.handleCancel,
    handleSave,
    handleLogout,
  };
};

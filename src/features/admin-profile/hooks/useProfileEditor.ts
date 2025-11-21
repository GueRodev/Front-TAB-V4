/**
 * useProfileEditor Hook
 * ✅ Unified profile editor for Admin, Moderador, and Cliente users
 * Manages profile state, validation, and operations
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  profileSchema,
  profileSchemaWithPhone,
  type ProfileFormData,
  type ProfileFormDataWithPhone
} from '../validations';
import { profileService } from '../services';
import type { UserProfile } from '@/features/auth';

interface UseProfileEditorConfig {
  includePhone?: boolean;
  includeAvatar?: boolean;
  onSuccess?: (user: UserProfile) => void;
}

type FormData = ProfileFormData | ProfileFormDataWithPhone;

interface UseProfileEditorReturn {
  isEditing: boolean;
  avatarFile: File | null;
  avatarPreview: string | null;
  formData: FormData;
  isUploading: boolean;
  errors: Record<string, string>;
  handleEdit: () => void;
  handleCancel: () => void;
  handleSave: () => Promise<void>;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFieldChange: (field: keyof FormData, value: string) => void;
}

export const useProfileEditor = (
  user: UserProfile | null,
  config: UseProfileEditorConfig = {}
): UseProfileEditorReturn => {
  const { includePhone = false, includeAvatar = true, onSuccess } = config;
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    ...(includePhone ? { phone: '' } : {}),
    password: '',
    password_confirmation: '',
  } as FormData);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        ...(includePhone ? { phone: (user as any).phone || '' } : {}),
        password: '',
        password_confirmation: '',
      } as FormData);
    }
  }, [user, includePhone]);

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setErrors({});

    // Restore original data
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        ...(includePhone ? { phone: (user as any).phone || '' } : {}),
        password: '',
        password_confirmation: '',
      } as FormData);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!includeAvatar) return;

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una imagen válida',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'La imagen no debe superar los 5MB',
        variant: 'destructive',
      });
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    setErrors({});

    // Validate form data with appropriate schema
    const schema = includePhone ? profileSchemaWithPhone : profileSchema;
    const result = schema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        title: 'Error de validación',
        description: 'Por favor corrige los errores en el formulario',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload avatar if changed (only if enabled and file selected)
      let avatarUrl: string | undefined;
      if (includeAvatar && avatarFile) {
        const avatarResponse = await profileService.uploadAvatar(avatarFile);
        avatarUrl = avatarResponse.data.avatarUrl;
      }

      // Update profile
      const updateData = {
        name: formData.name,
        email: formData.email,
        ...(includePhone && 'phone' in formData ? { phone: formData.phone } : {}),
        ...(formData.password && formData.password.length > 0
          ? {
              password: formData.password,
              password_confirmation: formData.password_confirmation
            }
          : {}),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      };

      const response = await profileService.updateProfile(updateData);

      toast({
        title: 'Éxito',
        description: response.message || 'Perfil actualizado correctamente',
      });

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setFormData(prev => ({
        ...prev,
        password: '',
        password_confirmation: ''
      }));

      // Call success callback with updated user
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isEditing,
    avatarFile,
    avatarPreview,
    formData,
    isUploading,
    errors,
    handleEdit,
    handleCancel,
    handleSave,
    handleAvatarChange,
    handleFieldChange,
  };
};

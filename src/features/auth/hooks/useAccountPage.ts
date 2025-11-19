/**
 * Account Page Business Logic Hook
 * Handles profile editing state and actions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import type { ProfileFormData } from '../validations';

export const useAccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, isClient } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // TODO: Implementar lógica propia de actualización de perfil
  // Este hook debe usar su propio servicio de perfil, no AuthContext
  const updateProfile = async (data: any) => {
    console.warn('⚠️ updateProfile no implementado - pendiente módulo de perfil');
    throw new Error('Funcionalidad pendiente de implementación');
  };

  const handleEdit = () => setIsEditing(true);
  
  const handleCancel = () => setIsEditing(false);

  const handleSave = async (data: ProfileFormData) => {
    // Limpiar password vacío para no enviarlo al backend
    const cleanData = {
      ...data,
      password: data.password?.trim() || undefined,
    };
    
    // Remover el campo si está vacío
    if (!cleanData.password) {
      delete cleanData.password;
    }
    
    // Eliminar password_confirmation (solo es frontend)
    delete (cleanData as any).password_confirmation;
    
    await updateProfile(cleanData);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return {
    user,
    isClient,
    isEditing,
    handleEdit,
    handleCancel,
    handleSave,
    handleLogout,
  };
};

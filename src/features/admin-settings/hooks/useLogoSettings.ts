/**
 * useLogoSettings Hook
 * Business logic for logo management (store and admin logos)
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { validateFileType, validateFileSize, readFileAsBase64 } from '@/lib/helpers/fileValidation';
import { formatFileSize } from '@/lib/formatters';
import { FILE_UPLOAD_CONFIG } from '@/config/app.config';
import { STORAGE_KEYS } from '@/api';

const LOGO_UPDATED_EVENT = 'logoUpdated';
const ADMIN_LOGO_UPDATED_EVENT = 'adminLogoUpdated';

export const useLogoSettings = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [adminLogoPreview, setAdminLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Load logos from storage on mount
  useEffect(() => {
    const customLogo = localStorage.getItem('customLogo');
    if (customLogo) {
      setLogoPreview(customLogo);
    }
    
    const customAdminLogo = localStorage.getItem('customAdminLogo');
    if (customAdminLogo) {
      setAdminLogoPreview(customAdminLogo);
    }
  }, []);

  const handleFileChange = async (file: File, isAdmin: boolean = false) => {
    // Validate file type
    if (!validateFileType(file)) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      toast({
        title: "Error",
        description: `La imagen debe ser menor a ${formatFileSize(FILE_UPLOAD_CONFIG.maxSize)}`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const base64String = await readFileAsBase64(file);
      
      if (isAdmin) {
        setAdminLogoPreview(base64String);
      } else {
        setLogoPreview(base64String);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al leer el archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoFileChange = (file: File) => handleFileChange(file, false);
  const handleAdminLogoFileChange = (file: File) => handleFileChange(file, true);

  const saveLogo = () => {
    if (!logoPreview) return;

    localStorage.setItem('customLogo', logoPreview);
    toast({
      title: "Logo actualizado",
      description: "El logo de la tienda se ha guardado correctamente",
    });

    window.dispatchEvent(new Event(LOGO_UPDATED_EVENT));
  };

  const removeLogo = () => {
    localStorage.removeItem('customLogo');
    setLogoPreview(null);
    toast({
      title: "Logo restaurado",
      description: "Se ha restaurado el logo por defecto de la tienda",
    });

    window.dispatchEvent(new Event(LOGO_UPDATED_EVENT));
  };

  const saveAdminLogo = () => {
    if (!adminLogoPreview) return;

    localStorage.setItem('customAdminLogo', adminLogoPreview);
    toast({
      title: "Logo actualizado",
      description: "El logo del panel admin se ha guardado correctamente",
    });

    window.dispatchEvent(new Event(ADMIN_LOGO_UPDATED_EVENT));
  };

  const removeAdminLogo = () => {
    localStorage.removeItem('customAdminLogo');
    setAdminLogoPreview(null);
    toast({
      title: "Logo restaurado",
      description: "Se ha restaurado el logo por defecto del panel admin",
    });

    window.dispatchEvent(new Event(ADMIN_LOGO_UPDATED_EVENT));
  };

  const cancelLogoPreview = () => {
    const customLogo = localStorage.getItem('customLogo');
    setLogoPreview(customLogo);
  };

  const cancelAdminLogoPreview = () => {
    const customAdminLogo = localStorage.getItem('customAdminLogo');
    setAdminLogoPreview(customAdminLogo);
  };

  return {
    logoPreview,
    adminLogoPreview,
    isUploading,
    handleLogoFileChange,
    handleAdminLogoFileChange,
    saveLogo,
    removeLogo,
    saveAdminLogo,
    removeAdminLogo,
    cancelLogoPreview,
    cancelAdminLogoPreview,
  };
};
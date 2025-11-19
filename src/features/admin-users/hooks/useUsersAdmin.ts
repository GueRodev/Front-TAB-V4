/**
 * useUsersAdmin Hook
 * Business logic for users (clients and admins) management
 */

import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AdminFormData } from '../validations';

// Temporary mock data - TODO: Replace with API calls
const MOCK_CLIENTES: any[] = [];
const MOCK_ADMINS: any[] = [];

export const useUsersAdmin = () => {
  const { toast } = useToast();
  
  // State
  const [searchClientes, setSearchClientes] = useState('');
  const [searchAdmins, setSearchAdmins] = useState('');
  const [expandedCliente, setExpandedCliente] = useState<number | null>(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<typeof MOCK_ADMINS[0] | null>(null);
  const [adminFormData, setAdminFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });

  // Filtered data
  const filteredClientes = useMemo(() => {
    return MOCK_CLIENTES.filter(
      (c) =>
        c.nombre.toLowerCase().includes(searchClientes.toLowerCase()) ||
        c.email.toLowerCase().includes(searchClientes.toLowerCase())
    );
  }, [searchClientes]);

  const filteredAdmins = useMemo(() => {
    return MOCK_ADMINS.filter(
      (a) =>
        a.nombre.toLowerCase().includes(searchAdmins.toLowerCase()) ||
        a.email.toLowerCase().includes(searchAdmins.toLowerCase())
    );
  }, [searchAdmins]);

  // Handlers
  const handleClienteToggle = (id: number) => {
    toast({
      title: 'Estado actualizado',
      description: 'El estado del cliente ha sido modificado',
    });
  };

  const handleExpandCliente = (id: number) => {
    setExpandedCliente(expandedCliente === id ? null : id);
  };

  const handleOpenAdminDialog = (admin?: typeof MOCK_ADMINS[0]) => {
    if (admin) {
      setEditingAdmin(admin);
      setAdminFormData({
        name: admin.nombre,
        email: admin.email,
        password: '',
        role: admin.rol === 'Admin' ? 'admin' : 'moderador',
      });
    } else {
      setEditingAdmin(null);
      setAdminFormData({
        name: '',
        email: '',
        password: '',
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
      role: 'admin',
    });
  };

  const handleSubmitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: editingAdmin ? 'Admin actualizado' : 'Admin creado',
      description: editingAdmin
        ? 'El administrador ha sido actualizado correctamente'
        : 'El nuevo administrador ha sido creado exitosamente',
    });

    handleCloseAdminDialog();
  };

  const handleDeleteAdmin = (id: number) => {
    toast({
      title: 'Admin eliminado',
      description: 'El administrador ha sido eliminado del sistema',
      variant: 'destructive',
    });
  };

  return {
    // Data
    filteredClientes,
    filteredAdmins,
    // Search
    searchClientes,
    searchAdmins,
    // State
    expandedCliente,
    isAdminDialogOpen,
    editingAdmin,
    adminFormData,
    // Setters
    setSearchClientes,
    setSearchAdmins,
    setAdminFormData,
    // Handlers
    handleClienteToggle,
    handleExpandCliente,
    handleOpenAdminDialog,
    handleCloseAdminDialog,
    handleSubmitAdmin,
    handleDeleteAdmin,
  };
};
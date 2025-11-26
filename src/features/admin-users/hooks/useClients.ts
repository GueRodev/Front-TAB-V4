/**
 * useClients Hook
 * Gestiona el estado y operaciones de clientes para admin
 *
 * ✅ INTEGRADO CON LARAVEL BACKEND
 */

import { useState, useEffect, useMemo } from 'react';
import { usersService } from '../services/users.service';
import { toast } from 'sonner';

interface ClientAddress {
  provincia: string;
  canton: string;
  distrito: string;
  direccion: string;
}

export interface Client {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  fechaRegistro: string;
  ordenes: number;
  direccion: ClientAddress;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClient, setExpandedClient] = useState<number | null>(null);

  /**
   * Cargar clientes desde el backend
   */
  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await usersService.getClients();
      setClients(response.data);
    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
      toast.error(error.message || 'Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cargar clientes al montar el componente
   */
  useEffect(() => {
    loadClients();
  }, []);

  /**
   * Filtrar clientes por búsqueda
   */
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {
      return clients;
    }

    const query = searchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.nombre.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.telefono.includes(query)
    );
  }, [clients, searchQuery]);

  /**
   * Toggle estado activo del cliente
   */
  const handleToggleActive = (clientId: number) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === clientId ? { ...client, activo: !client.activo } : client
      )
    );
    toast.success('Estado del cliente actualizado');
  };

  /**
   * Expandir/contraer dirección del cliente
   */
  const handleExpandAddress = (clientId: number) => {
    setExpandedClient((prev) => (prev === clientId ? null : clientId));
  };

  return {
    clients: filteredClients,
    isLoading,
    searchQuery,
    expandedClient,
    setSearchQuery,
    handleToggleActive,
    handleExpandAddress,
    refreshClients: loadClients,
  };
};

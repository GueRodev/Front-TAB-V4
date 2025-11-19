/**
 * AddressList Component
 * Manages list of addresses with CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import { addressesService } from '../services';
import { toast } from '@/hooks/use-toast';
import type { Address } from '../types';

export const AddressList: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const loadAddresses = async () => {
    try {
      const response = await addressesService.getMyAddresses();
      setAddresses(response.data);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleCreate = async (data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      await addressesService.create({ ...data, user_id: 'current-user' });
      toast({ title: 'Dirección creada exitosamente' });
      setIsDialogOpen(false);
      loadAddresses();
    } catch (error) {
      toast({ title: 'Error al crear dirección', variant: 'destructive' });
    }
  };

  const handleUpdate = async (data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingAddress) return;
    
    try {
      await addressesService.update(editingAddress.id, data);
      toast({ title: 'Dirección actualizada exitosamente' });
      setIsDialogOpen(false);
      setEditingAddress(undefined);
      loadAddresses();
    } catch (error) {
      toast({ title: 'Error al actualizar dirección', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;
    
    try {
      await addressesService.delete(id);
      toast({ title: 'Dirección eliminada exitosamente' });
      loadAddresses();
    } catch (error) {
      toast({ title: 'Error al eliminar dirección', variant: 'destructive' });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressesService.setAsDefault(id);
      toast({ title: 'Dirección predeterminada actualizada' });
      loadAddresses();
    } catch (error) {
      toast({ title: 'Error al actualizar dirección', variant: 'destructive' });
    }
  };

  const openCreateDialog = () => {
    setEditingAddress(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando direcciones...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-brand-darkBlue">Mis Direcciones</h2>
        <Button onClick={openCreateDialog} className="bg-brand-orange hover:bg-brand-orange/90">
          <Plus className="mr-2" size={18} />
          Nueva Dirección
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No tienes direcciones guardadas</p>
          <Button onClick={openCreateDialog} variant="outline">
            Agregar primera dirección
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map(address => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            address={editingAddress}
            onSubmit={editingAddress ? handleUpdate : handleCreate}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingAddress(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

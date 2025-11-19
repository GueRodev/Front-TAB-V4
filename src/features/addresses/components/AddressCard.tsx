/**
 * AddressCard Component
 * Displays a single address with actions
 */

import React from 'react';
import { MapPin, Home, Briefcase, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Address } from '../types';

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (address: Address) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  selectable = false,
  selected = false,
  onSelect,
}) => {
  const getIcon = () => {
    switch (address.label.toLowerCase()) {
      case 'casa': return <Home size={18} />;
      case 'trabajo': case 'oficina': return <Briefcase size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(address);
    }
  };

  return (
    <Card 
      className={`transition-all ${selectable ? 'cursor-pointer hover:shadow-md' : ''} ${selected ? 'ring-2 ring-brand-orange' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="font-semibold text-brand-darkBlue">{address.label}</h3>
            {address.is_default && (
              <Badge className="bg-brand-orange text-white">
                <CheckCircle size={12} className="mr-1" />
                Predeterminada
              </Badge>
            )}
          </div>
          
          {!selectable && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(address);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 size={16} />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(address.id);
                  }}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-1 text-sm text-gray-600">
          <p>{address.address}</p>
          <p>{address.district}, {address.canton}</p>
          <p>{address.province}</p>
        </div>
        
        {!address.is_default && !selectable && onSetDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSetDefault(address.id);
            }}
            className="mt-3 w-full"
          >
            Marcar como predeterminada
          </Button>
        )}
        
        {selected && (
          <div className="mt-3 flex items-center gap-2 text-brand-orange font-semibold">
            <CheckCircle size={16} />
            <span>Seleccionada</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

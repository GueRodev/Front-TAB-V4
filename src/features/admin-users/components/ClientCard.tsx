/**
 * ClientCard Component
 * Mobile/tablet card view for a single client
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { MapPin } from 'lucide-react';

interface ClientAddress {
  provincia: string;
  canton: string;
  distrito: string;
  direccion: string;
}

interface Client {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
  fechaRegistro: string;
  ordenes: number;
  direccion: ClientAddress;
}

interface ClientCardProps {
  client: Client;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  onExpand: (id: number) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  isExpanded,
  onToggle,
  onExpand,
}) => {
  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{client.nombre}</h4>
          <p className="text-sm text-muted-foreground break-all">{client.email}</p>
          <p className="text-sm text-muted-foreground mt-1">{client.telefono}</p>
        </div>
        <div className="flex flex-col items-end gap-2 ml-2">
          <Badge variant={client.activo ? 'default' : 'secondary'}>
            {client.activo ? 'Activo' : 'Inactivo'}
          </Badge>
          <Switch
            checked={client.activo}
            onCheckedChange={() => onToggle(client.id)}
          />
        </div>
      </div>
      
      <Separator className="my-3" />
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-muted-foreground">Órdenes:</span>
            <span className="ml-1 font-semibold text-brand-orange">{client.ordenes}</span>
          </div>
        <div>
          <span className="text-muted-foreground">Registro:</span>
          <span className="ml-1">{client.fechaRegistro}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onExpand(client.id)}
        className="w-full text-brand-orange border-brand-orange hover:bg-brand-orange/10"
      >
        <MapPin className="h-4 w-4 mr-1" />
        {isExpanded ? 'Ocultar' : 'Ver'} Dirección
      </Button>

      {isExpanded && (
        <div className="mt-3">
          <div className="bg-muted/50 p-3 rounded-lg border">
            <h5 className="font-semibold mb-2 text-sm">Dirección</h5>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Provincia: </span>
                <span>{client.direccion.provincia}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Cantón: </span>
                <span>{client.direccion.canton}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Distrito: </span>
                <span>{client.direccion.distrito}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Dirección: </span>
                <span>{client.direccion.direccion}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
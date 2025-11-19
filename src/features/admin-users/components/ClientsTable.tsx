/**
 * ClientsTable Component
 * Desktop table view for clients
 */

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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

interface ClientsTableProps {
  clients: Client[];
  expandedClient: number | null;
  onToggle: (id: number) => void;
  onExpand: (id: number) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  expandedClient,
  onToggle,
  onExpand,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead className="text-center">Órdenes</TableHead>
          <TableHead>Registro</TableHead>
          <TableHead className="text-center">Estado</TableHead>
          <TableHead className="text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <React.Fragment key={client.id}>
            <TableRow className="hover:bg-muted/50">
              <TableCell className="font-medium">{client.nombre}</TableCell>
              <TableCell className="text-muted-foreground">{client.email}</TableCell>
              <TableCell className="text-muted-foreground">{client.telefono}</TableCell>
              <TableCell className="text-center font-semibold text-brand-orange">
                {client.ordenes}
              </TableCell>
              <TableCell className="text-muted-foreground">{client.fechaRegistro}</TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={client.activo}
                  onCheckedChange={() => onToggle(client.id)}
                />
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onExpand(client.id)}
                  className="text-brand-orange hover:text-brand-orange hover:bg-brand-orange/10"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  {expandedClient === client.id ? 'Ocultar' : 'Ver'} Dirección
                </Button>
              </TableCell>
            </TableRow>
            {expandedClient === client.id && (
              <TableRow>
                <TableCell colSpan={7} className="bg-muted/50">
                  <div className="p-4">
                    <h4 className="font-semibold mb-3">Dirección del Cliente</h4>
                    <div className="bg-background p-4 rounded-lg border max-w-md">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Provincia: </span>
                          <span>{client.direccion.provincia}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Cantón: </span>
                          <span>{client.direccion.canton}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Distrito: </span>
                          <span>{client.direccion.distrito}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Dirección: </span>
                          <span>{client.direccion.direccion}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};
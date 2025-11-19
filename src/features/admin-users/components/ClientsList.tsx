/**
 * ClientsList Component
 * Responsive list of clients with search
 */

import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ClientsTable } from './ClientsTable';
import { ClientCard } from './ClientCard';
import { Search, User } from 'lucide-react';

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

interface ClientsListProps {
  clients: Client[];
  searchQuery: string;
  expandedClient: number | null;
  onSearchChange: (query: string) => void;
  onToggle: (id: number) => void;
  onExpand: (id: number) => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  searchQuery,
  expandedClient,
  onSearchChange,
  onToggle,
  onExpand,
}) => {
  return (
    <section>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-6 w-6 text-brand-orange" />
          <h1 className="text-2xl sm:text-3xl font-bold">Clientes</h1>
        </div>
        <p className="text-muted-foreground">Gestiona los usuarios clientes de tu tienda</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar clientes por nombre o email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <ClientsTable
              clients={clients}
              expandedClient={expandedClient}
              onToggle={onToggle}
              onExpand={onExpand}
            />
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                isExpanded={expandedClient === client.id}
                onToggle={onToggle}
                onExpand={onExpand}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
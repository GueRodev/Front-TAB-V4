/**
 * AdminOrdersHistory Page
 * Historial de pedidos con tabs y filtros
 */

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  History,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  X,
  Calendar,
  Filter,
  Store,
  ShoppingCart,
  Loader2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/common';
import {
  useOrdersHistory,
  OrderCard,
  OrdersTableDynamic,
  ExportButton,
  type HistoryTab,
} from '@/features/orders';

const AdminOrdersHistory = () => {
  const navigate = useNavigate();
  const {
    filteredOrders,
    isLoading,
    activeTab,
    setActiveTab,
    counts,
    typeFilter,
    setTypeFilter,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    handleExportPDF,
    handleExportExcel,
    clearFilters,
    hasActiveFilters,
    restoreOrder,
    handleDeleteOrder,
  } = useOrdersHistory();

  // Determinar qué acciones mostrar según el tab activo
  const showActionsForTab = activeTab === 'completed' || activeTab === 'cancelled';

  const tabConfig: { value: HistoryTab; label: string; icon: React.ReactNode; count: number }[] = [
    { value: 'all', label: 'Todos', icon: <History className="h-4 w-4" />, count: counts.all },
    { value: 'completed', label: 'Completados', icon: <CheckCircle className="h-4 w-4" />, count: counts.completed },
    { value: 'cancelled', label: 'Cancelados', icon: <XCircle className="h-4 w-4" />, count: counts.cancelled },
    { value: 'pending', label: 'Pendientes', icon: <Clock className="h-4 w-4" />, count: counts.pending },
    { value: 'deleted', label: 'Eliminados', icon: <Trash2 className="h-4 w-4" />, count: counts.deleted },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader title="Historial de Pedidos" />

          <main className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6">
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <Button
                onClick={() => navigate('/admin/orders')}
                variant="outline"
                className="gap-2 w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs md:text-sm">Volver a Pedidos</span>
              </Button>

              <ExportButton
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                disabled={filteredOrders.length === 0}
              />
            </div>

            {/* Card principal con tabs y filtros */}
            <Card>
              <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                <div className="flex flex-col gap-4">
                  {/* Título */}
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-base md:text-lg lg:text-xl">
                      Historial de Pedidos
                    </CardTitle>
                  </div>

                  {/* Tabs */}
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as HistoryTab)}
                    className="w-full"
                  >
                    {/* Mobile: 2 filas de tabs compactas */}
                    <div className="md:hidden space-y-1">
                      <TabsList className="w-full grid grid-cols-3 h-auto p-1">
                        {tabConfig.slice(0, 3).map((tab) => (
                          <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex flex-col items-center gap-0.5 py-1.5 px-1 text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {tab.icon}
                            <span>{tab.label}</span>
                            <span className="text-[9px] opacity-70">({tab.count})</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsList className="w-full grid grid-cols-2 h-auto p-1">
                        {tabConfig.slice(3).map((tab) => (
                          <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="flex flex-col items-center gap-0.5 py-1.5 px-1 text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {tab.icon}
                            <span>{tab.label}</span>
                            <span className="text-[9px] opacity-70">({tab.count})</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* Tablet: grid compacto de 5 columnas con solo iconos y contadores */}
                    <TabsList className="hidden md:grid lg:hidden w-full grid-cols-5 h-auto p-1">
                      {tabConfig.map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="flex flex-col items-center gap-0.5 py-2 px-1 text-[11px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {tab.icon}
                          <span className="truncate w-full text-center">{tab.label}</span>
                          <span className="text-[10px] opacity-70">({tab.count})</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* Desktop: grid horizontal completo */}
                    <TabsList className="hidden lg:grid w-full grid-cols-5 h-auto p-1">
                      {tabConfig.map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="flex items-center justify-center gap-2 py-2 px-3 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                          <span className="text-xs opacity-70">({tab.count})</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  {/* Filtros */}
                  <div className="flex flex-col lg:flex-row gap-3">
                    {/* Búsqueda */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por cliente, teléfono o # orden..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 text-sm"
                      />
                    </div>

                    {/* Tipo de pedido */}
                    <Select
                      value={typeFilter}
                      onValueChange={(value) => setTypeFilter(value as 'all' | 'online' | 'in-store')}
                    >
                      <SelectTrigger className="w-full lg:w-[180px]">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Tipo de pedido" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <span className="flex items-center gap-2">
                            Todos los tipos
                          </span>
                        </SelectItem>
                        <SelectItem value="online">
                          <span className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Online
                          </span>
                        </SelectItem>
                        <SelectItem value="in-store">
                          <span className="flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            En tienda
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Fecha desde */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        type="date"
                        value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            from: e.target.value ? new Date(e.target.value) : null,
                          })
                        }
                        className="w-full lg:w-[150px] text-sm"
                        placeholder="Desde"
                      />
                    </div>

                    {/* Fecha hasta */}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm hidden lg:inline">-</span>
                      <Input
                        type="date"
                        value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                        onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            to: e.target.value ? new Date(e.target.value) : null,
                          })
                        }
                        className="w-full lg:w-[150px] text-sm"
                        placeholder="Hasta"
                      />
                    </div>

                    {/* Botón limpiar filtros */}
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">Limpiar</span>
                      </Button>
                    )}
                  </div>

                  {/* Indicador de resultados */}
                  <div className="text-xs text-muted-foreground">
                    Mostrando {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''}
                    {hasActiveFilters && ' (filtrados)'}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 md:p-6 pt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Cargando historial...</span>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title={hasActiveFilters ? 'Sin resultados' : 'Sin pedidos en historial'}
                    description={
                      hasActiveFilters
                        ? 'No se encontraron pedidos con los filtros seleccionados'
                        : 'Los pedidos completados, cancelados o archivados aparecerán aquí'
                    }
                  />
                ) : (
                  <>
                    {/* Vista Desktop/Tablet: OrdersTableDynamic */}
                    <div className="hidden lg:block">
                      <OrdersTableDynamic
                        orders={filteredOrders}
                        onRestore={activeTab === 'deleted' ? restoreOrder : undefined}
                        onDelete={showActionsForTab ? handleDeleteOrder : undefined}
                      />
                    </div>

                    {/* Vista Mobile/Tablet: Cards */}
                    <div className="lg:hidden space-y-3 p-4">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="relative">
                          <OrderCard
                            order={order}
                            showDeliveryInfo={order.type === 'online'}
                          />
                          {activeTab === 'deleted' && order.deleted_at && (
                            <div className="mt-2 flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => restoreOrder(order.id)}
                                className="gap-2"
                              >
                                <RotateCcw className="h-4 w-4" />
                                Restaurar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminOrdersHistory;

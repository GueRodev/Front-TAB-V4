import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import { 
  MetricsGrid,
  SalesChart,
  RecentOrdersTable,
  TopProductsTable,
  QuickSummaryCard,
} from '@/features/admin-dashboard';
import { useDashboardMetrics } from '@/features/admin-dashboard';

const Admin = () => {
  const { metrics, chartData, recentOrders, topProducts, uniqueProducts } = useDashboardMetrics();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader title="Dashboard" />

          <main className="p-3 md:p-4 lg:p-6 space-y-4 md:space-y-6">
            {/* Métricas Principales */}
            <MetricsGrid metrics={metrics} />

            {/* Gráfico de Ventas */}
            <SalesChart data={chartData} />

            {/* Tablas de Pedidos y Productos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <RecentOrdersTable orders={recentOrders} />
              <TopProductsTable products={topProducts} />
            </div>

            {/* Resumen Rápido */}
            <QuickSummaryCard metrics={metrics} uniqueProducts={uniqueProducts} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;

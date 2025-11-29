/**
 * Admin Reports Page
 * Comprehensive reports with export functionality
 * ✅ 3 Tabs: Sales, Products, Orders
 */

import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar, AdminHeader } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Package, ShoppingCart } from 'lucide-react';

// Import tab components from admin-reports feature
import {
  SalesReportTab,
  ProductsReportTab,
  OrdersReportTab,
} from '@/features/admin-reports';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <AdminHeader title="Reportes" />

          <main className="p-3 md:p-4 lg:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sales" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Ventas</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Productos</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Pedidos</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sales" className="space-y-4">
                <SalesReportTab />
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <ProductsReportTab />
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <OrdersReportTab />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminReports;

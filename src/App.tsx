
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import { WishlistProvider } from "@/features/wishlist";
import { CartProvider } from "./features/cart";
import { OrdersProvider } from "@/features/orders";
import { NotificationsProvider } from "@/features/notifications";
import { CategoriesProvider } from "./features/categories";
import { ProductsProvider } from "@/features/products";
import { ProtectedRoute } from "@/features/auth";
import { ScrollToTop } from "./components/shared";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminReports from "./pages/AdminReports";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminOrdersHistory from "./pages/AdminOrdersHistory";
import AdminSettings from "./pages/AdminSettings";
import AdminProfile from "./pages/AdminProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CategoriesProvider>
        <ProductsProvider>
          <CartProvider>
            <OrdersProvider>
              <WishlistProvider>
                <NotificationsProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <ScrollToTop />
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/category/:category" element={<CategoryPage />} />
                        <Route path="/category/:category/:subcategory" element={<CategoryPage />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                        <Route path="/cart" element={<Cart />} />
                        {/* 🔒 PROTECTED ADMIN ROUTES - Require authentication & admin role */}
                        <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                        <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReports /></ProtectedRoute>} />
                        <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
                        <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><AdminCategories /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
                        <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
                        <Route path="/admin/orders/history" element={<ProtectedRoute requireAdmin><AdminOrdersHistory /></ProtectedRoute>} />
                        <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
                        <Route path="/admin/profile" element={<ProtectedRoute requireAdmin><AdminProfile /></ProtectedRoute>} />
                        <Route path="/new-arrivals" element={<CategoryPage />} />
                        <Route path="/limited-editions" element={<CategoryPage />} />
                        <Route path="/on-sale" element={<CategoryPage />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </TooltipProvider>
                </NotificationsProvider>
              </WishlistProvider>
            </OrdersProvider>
          </CartProvider>
        </ProductsProvider>
      </CategoriesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Package2,
  User,
  FileText
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { profileService } from "@/features/admin-profile/services/profile.service";
import type { UserProfile } from "@/features/auth/types";

const menuItems = [
  { title: "Inicio", url: "/admin", icon: BarChart3 },
  { title: "Reportes", url: "/admin/reports", icon: FileText },
  { title: "Productos", url: "/admin/products", icon: Package },
  { title: "Categorías", url: "/admin/categories", icon: FolderTree },
  { title: "Usuarios", url: "/admin/users", icon: Users },
  { title: "Pedidos", url: "/admin/orders", icon: ShoppingCart },
];

const footerItems = [
  { title: "Configuración", url: "/admin/settings", icon: Settings },
  { title: "Cerrar Sesión", url: "/", icon: LogOut },
];

export function AdminSidebar() {
  const { state, open, isMobile, openMobile } = useSidebar();
  const isCollapsed = isMobile ? !openMobile : (state === "collapsed" && !open);
  const location = useLocation();

  // Función para verificar si una ruta está activa
  const isActiveRoute = (url: string) => {
    if (url === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(url);
  };

  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Cargar logo personalizado
  useEffect(() => {
    const logo = localStorage.getItem('customAdminLogo');
    setCustomLogo(logo);

    const handleLogoUpdate = () => {
      const updatedLogo = localStorage.getItem('customAdminLogo');
      setCustomLogo(updatedLogo);
    };

    window.addEventListener('adminLogoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('adminLogoUpdated', handleLogoUpdate);
  }, []);

  // Cargar usuario autenticado refactorizar si es necesario luego
  useEffect(() => {
    const loadAuthenticatedUser = async () => {
      try {
        setIsLoadingUser(true);
        const response = await profileService.getProfile();
        setAdminUser(response.data);
      } catch (error) {
        console.error('Error al cargar el usuario:', error);
        // En caso de error, el usuario permanecerá null
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadAuthenticatedUser();
  }, []);

  return (
    <Sidebar
      className="!bg-[#1A1F2C] border-none z-50"
      style={{ backgroundColor: '#1A1F2C' }}
      collapsible="icon"
    >
      {/* Header with Logo */}
      <div className={`border-b border-white/10 bg-[#1A1F2C] transition-all duration-300 ${
        isCollapsed ? 'p-5 flex items-center justify-center' : 'p-6'
      }`}>
        {customLogo ? (
          <Link to="/admin" className="flex items-center justify-center">
            <img
              src={customLogo}
              alt="Logo Admin"
              className={`object-contain transition-all duration-300 ${isCollapsed ? 'h-10 w-10' : 'h-12'}`}
            />
          </Link>
        ) : (
          <div className={`flex items-center transition-all duration-300 ${
            isCollapsed ? 'gap-0' : 'gap-3'
          }`}>
            <div className="bg-[#F97316] p-2.5 rounded-lg flex-shrink-0 transition-all duration-300">
              <Package2 className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div className={`flex flex-col leading-tight transition-all duration-300 ${
              isCollapsed
                ? 'w-0 opacity-0 scale-0'
                : 'w-auto opacity-100 scale-100 ml-0'
            }`}>
              <span className="text-white font-bold text-base tracking-wide whitespace-nowrap">TOYS AND</span>
              <span className="text-[#F97316] font-bold text-base tracking-wide whitespace-nowrap">BRICKS</span>
            </div>
          </div>
        )}
      </div>

      <SidebarContent className="!bg-[#1A1F2C] flex-1 overflow-y-auto" style={{ backgroundColor: '#1A1F2C' }}>
        <SidebarGroup className="bg-[#1A1F2C]">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider px-4 py-3 transition-all duration-300">
              Menú
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveRoute(item.url)}
                    className="text-white hover:bg-[#F97316]/20 hover:text-[#F97316] data-[active=true]:bg-[#F97316]/20 data-[active=true]:text-[#F97316] px-4 py-3 transition-all duration-200"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className={`font-medium transition-all duration-300 ${
                        isCollapsed ? 'w-0 opacity-0 scale-0' : 'w-auto opacity-100 scale-100'
                      }`}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Section - Usuario + Configuración + Cerrar Sesión */}
      <SidebarFooter className="!bg-[#1A1F2C] border-t border-white/10" style={{ backgroundColor: '#1A1F2C' }}>
        {/* User Section */}
        <div className="p-3 border-b border-white/10">
          <Link
            to="/admin/profile"
            className={`flex items-center p-2 rounded-lg hover:bg-white/5 transition-all duration-300 ${
              isCollapsed ? 'gap-0 justify-center' : 'gap-3'
            }`}
          >
            <Avatar className="h-9 w-9 border-2 border-white/10 flex-shrink-0">
              <AvatarImage src="" alt={adminUser?.name || "Admin"} />
              <AvatarFallback className="bg-[#F97316] text-white font-semibold text-sm">
                {isLoadingUser
                  ? '...'
                  : adminUser?.name
                    ? adminUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'AD'
                }
              </AvatarFallback>
            </Avatar>
            <div className={`flex flex-col min-w-0 flex-1 transition-all duration-300 ${
              isCollapsed
                ? 'w-0 opacity-0 scale-0 hidden'
                : 'w-auto opacity-100 scale-100'
            }`}>
              <span className="text-white text-sm font-medium truncate whitespace-nowrap">
                {isLoadingUser ? 'Cargando...' : adminUser?.name || 'Admin Usuario'}
              </span>
              <span className="text-white/60 text-xs truncate whitespace-nowrap">
                {isLoadingUser ? '' : adminUser?.email || 'admin@toysandbricks.com'}
              </span>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActiveRoute(item.url)}
                className="text-white hover:bg-[#F97316]/20 hover:text-[#F97316] data-[active=true]:bg-[#F97316]/20 data-[active=true]:text-[#F97316] px-4 py-2.5 transition-all duration-200"
                tooltip={isCollapsed ? item.title : undefined}
              >
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`font-medium transition-all duration-300 ${
                    isCollapsed ? 'w-0 opacity-0 scale-0' : 'w-auto opacity-100 scale-100'
                  }`}>
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

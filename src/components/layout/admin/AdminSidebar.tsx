import { Link } from 'react-router-dom';
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
  User
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

const menuItems = [
  { title: "Inicio", url: "/admin", icon: BarChart3 },
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
  
  const [customLogo, setCustomLogo] = useState<string | null>(null);

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

      <SidebarContent className="!bg-[#1A1F2C]" style={{ backgroundColor: '#1A1F2C' }}>
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
                    className="text-white hover:bg-[#F97316]/20 hover:text-[#F97316] data-[active=true]:bg-[#F97316] data-[active=true]:text-white px-4 py-3 transition-all duration-200"
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

      {/* User Section - TODO: Aquí se implementa el nombre del usuario logueado */}
      <div className="!bg-[#1A1F2C] border-t border-white/10 p-4" style={{ backgroundColor: '#1A1F2C' }}>
        <Link 
          to="/admin/profile" 
          className={`flex items-center p-2 rounded-lg hover:bg-white/5 transition-all duration-300 ${
            isCollapsed ? 'gap-0 justify-center' : 'gap-3'
          }`}
        >
          <Avatar className="h-10 w-10 border-2 border-white/10 flex-shrink-0">
            <AvatarImage src="" alt="Admin" />
            <AvatarFallback className="bg-[#F97316] text-white font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
          <div className={`flex flex-col min-w-0 flex-1 transition-all duration-300 ${
            isCollapsed 
              ? 'w-0 opacity-0 scale-0' 
              : 'w-auto opacity-100 scale-100'
          }`}>
            <span className="text-white text-sm font-medium truncate whitespace-nowrap">
              Admin Usuario
            </span>
            <span className="text-white/60 text-xs truncate whitespace-nowrap">
              admin@toysandbricks.com
            </span>
          </div>
        </Link>
      </div>

      {/* Footer Section */}
      <SidebarFooter className="!bg-[#1A1F2C] border-t border-white/10" style={{ backgroundColor: '#1A1F2C' }}>
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                className="text-white hover:bg-[#F97316]/20 hover:text-[#F97316] px-4 py-3 transition-all duration-200"
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

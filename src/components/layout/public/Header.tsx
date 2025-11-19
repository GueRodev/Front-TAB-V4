/**
 * Header Component (React Router version)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Search, User, Heart, Shield, LogOut } from 'lucide-react';
import { Logo } from '../shared';
import { SearchDialog } from '@/features/products';
import { cn } from '@/lib/utils';
import { useCart } from '@/features/cart';
import { useCategories } from '@/features/categories';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const cartCount = getTotalItems();
  const profileMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get sorted categories
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order - b.order);
  }, [categories]);

  const handleLogout = () => {
    // TODO: Implementar lógica de cierre de sesión cuando se integre autenticación
    // Por ahora solo redirige a la página de login
    navigate('/auth');
  };

  const handleProfileMenuEnter = () => {
    if (profileMenuTimeoutRef.current) {
      clearTimeout(profileMenuTimeoutRef.current);
    }
    setIsProfileMenuOpen(true);
  };

  const handleProfileMenuLeave = () => {
    profileMenuTimeoutRef.current = setTimeout(() => {
      setIsProfileMenuOpen(false);
    }, 300); // 300ms de delay antes de cerrar
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (profileMenuTimeoutRef.current) {
        clearTimeout(profileMenuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
        isScrolled 
          ? "bg-white py-2" 
          : "bg-transparent py-4"
      )}
      style={isScrolled ? {
        boxShadow: '0 0 30px rgba(0, 51, 102, 0.4), 0 0 15px rgba(0, 51, 102, 0.3), 0 4px 20px rgba(0, 51, 102, 0.25)'
      } : undefined}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              {sortedCategories.map((category) => (
                <NavigationMenuItem key={category.id}>
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent">
                        {category.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid w-[200px] gap-1 p-2 bg-white shadow-lg border rounded-md">
                          {category.subcategories
                            .sort((a, b) => a.order - b.order)
                            .map((subcategory) => (
                              <NavigationMenuLink key={subcategory.id} asChild>
                                <Link
                                  to={`/category/${subcategory.slug}`}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none">{subcategory.name}</div>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link
                      to={`/category/${category.slug}`}
                      className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-orange after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left inline-block px-4 py-2"
                    >
                      {category.name}
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Desktop Icons */}
        <div className="hidden lg:flex items-center space-x-6">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hover:text-brand-orange transition-colors"
            aria-label="Buscar productos"
          >
            <Search size={22} />
          </button>
          <Link to="/wishlist" className="hover:text-brand-orange transition-colors relative">
            <Heart size={22} />
          </Link>
          
          {/* Dropdown Menu de Perfil con Hover mejorado */}
          <div 
            className="relative"
            onMouseEnter={handleProfileMenuEnter}
            onMouseLeave={handleProfileMenuLeave}
          >
            <button className="hover:text-brand-orange transition-colors focus:outline-none">
              <User size={22} />
            </button>
            
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50 animate-fade-in">
                <div className="py-1">
                  <Link 
                    to="/account" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User size={16} />
                    Mi Perfil
                  </Link>
                  <div className="border-t border-gray-100" />
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>

          <Link to="/admin" className="hover:text-brand-orange transition-colors">
            <Shield size={22} />
          </Link>
          <Link to="/cart" className="hover:text-brand-orange transition-colors relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-orange text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-fade-in">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center space-x-4 lg:hidden">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hover:text-brand-orange transition-colors"
            aria-label="Buscar productos"
          >
            <Search size={22} />
          </button>
          <Link to="/cart" className="relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-orange text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-brand-darkBlue focus:outline-none"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg animate-fade-in absolute top-full left-0 w-full">
          <div className="container mx-auto py-4 px-4">
            <nav className="flex flex-col space-y-4">
              {sortedCategories.map((category) => (
                <div key={category.id}>
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <div className="border-b pb-2">
                      <Link
                        to={`/category/${category.slug}`}
                        className="text-brand-darkBlue font-semibold py-2 hover:text-brand-orange transition-colors block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                      <div className="ml-4 mt-2 space-y-2">
                        {category.subcategories
                          .sort((a, b) => a.order - b.order)
                          .map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              to={`/category/${subcategory.slug}`}
                              className="block text-gray-600 py-1 hover:text-brand-orange transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={`/category/${category.slug}`}
                      className="text-brand-darkBlue font-semibold py-2 hover:text-brand-orange transition-colors block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="flex justify-between py-2">
                <Link to="/account" className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors flex items-center gap-2">
                  <User size={18} /> Cuenta
                </Link>
                <Link to="/wishlist" className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors flex items-center gap-2">
                  <Heart size={18} /> Favoritos
                </Link>
              </div>
              <Link to="/admin" className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}>
                <Shield size={18} /> Admin
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
};

export default Header;

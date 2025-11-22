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
import { useAuth } from '@/features/auth';
import { useWishlist } from '@/features/wishlist';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { categories } = useCategories();
  const { isAdmin, logout, isAuthenticated } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const cartCount = getTotalItems();
  const wishlistCount = wishlist.length;

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

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

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
        <nav className="hidden lg:flex items-center space-x-2">
          {sortedCategories.map((category) => (
            <div key={category.id} className="relative group">
              {category.subcategories && category.subcategories.length > 0 ? (
                <>
                  <Link
                    to={`/category/${category.slug}`}
                    className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors inline-flex items-center gap-1 px-4 py-2"
                  >
                    {category.name}
                    <svg
                      className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-2 min-w-[180px]">
                      {category.subcategories
                        .sort((a, b) => a.order - b.order)
                        .map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            to={`/category/${subcategory.slug}`}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors"
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to={`/category/${category.slug}`}
                  className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-orange after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left inline-block px-4 py-2"
                >
                  {category.name}
                </Link>
              )}
            </div>
          ))}
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
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-fade-in">
                {wishlistCount}
              </span>
            )}
          </Link>
          
          {/* Dropdown Menu de Perfil / Login */}
          <div className="relative group">
            <button className="hover:text-brand-orange transition-colors focus:outline-none">
              <User size={22} />
            </button>
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-2 min-w-[160px]">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors"
                    >
                      <User size={16} />
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-brand-orange transition-colors"
                  >
                    <User size={16} />
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          </div>

          {isAdmin() && (
            <Link to="/admin" className="hover:text-brand-orange transition-colors">
              <Shield size={22} />
            </Link>
          )}
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
        <div className="lg:hidden bg-white shadow-lg animate-fade-in absolute top-full left-0 w-full max-h-[calc(100vh-80px)] overflow-y-auto">
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
              <div className="border-t pt-4 mt-2">
                <Link to="/wishlist" className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}>
                  <div className="relative">
                    <Heart size={18} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  Favoritos
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/account" className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}>
                      <User size={18} /> Mi Cuenta
                    </Link>
                    {isAdmin() && (
                      <Link to="/admin" className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}>
                        <Shield size={18} /> Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-red-600 font-semibold hover:text-red-700 transition-colors flex items-center gap-2 py-2 text-left"
                    >
                      <LogOut size={18} /> Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <Link to="/auth" className="text-brand-darkBlue font-semibold hover:text-brand-orange transition-colors flex items-center gap-2 py-2" onClick={() => setIsMenuOpen(false)}>
                    <User size={18} /> Iniciar Sesión
                  </Link>
                )}
              </div>
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

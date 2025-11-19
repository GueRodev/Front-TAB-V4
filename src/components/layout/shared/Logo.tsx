
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '@/components/common';

interface LogoProps {
  variant?: 'default' | 'white' | 'small';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'default', className = '' }) => {
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    // Check for custom logo on mount
    const logo = localStorage.getItem('customLogo');
    setCustomLogo(logo);

    // Listen for logo updates
    const handleLogoUpdate = () => {
      const updatedLogo = localStorage.getItem('customLogo');
      setCustomLogo(updatedLogo);
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);
  const getLogoClasses = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'small':
        return 'text-brand-darkBlue text-xl';
      default:
        return 'text-brand-darkBlue';
    }
  };

  // If custom logo exists, show it
  if (customLogo) {
    return (
      <Link 
        to="/" 
        className={`flex items-center transition-transform hover:scale-105 ${className}`}
      >
        <OptimizedImage
          src={customLogo}
          alt="Logo"
          loading="eager"
          objectFit="contain"
          className={variant === 'small' ? 'h-8' : 'h-10 md:h-12'}
        />
      </Link>
    );
  }

  // Default logo
  return (
    <Link 
      to="/" 
      className={`flex items-center gap-2 transition-transform hover:scale-105 ${getLogoClasses()} ${className}`}
    >
      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-brand-darkBlue flex items-center justify-center border-2 border-white">
        <div className="absolute top-1 w-4 h-1 bg-brand-darkBlue rounded-full border border-white"></div>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="absolute bottom-1 flex space-x-[2px]">
          <div className="w-1 h-1 bg-brand-orange"></div>
          <div className="w-1 h-1 bg-brand-orange"></div>
          <div className="w-1 h-1 bg-brand-orange"></div>
        </div>
      </div>
      <div className="font-display font-bold leading-none">
        <span className={`block text-xl md:text-2xl ${variant === 'white' ? 'text-white' : 'text-brand-darkBlue'}`}>
          TOYS <span className="text-brand-orange">AND</span>
        </span>
        <span className="block text-brand-orange text-xl md:text-2xl">BRICKS</span>
      </div>
    </Link>
  );
};

export default Logo;

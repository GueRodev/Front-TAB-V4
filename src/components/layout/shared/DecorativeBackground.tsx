import React from 'react';

interface DecorativeBackgroundProps {
  variant?: 'default' | 'minimal';
}

const DecorativeBackground: React.FC<DecorativeBackgroundProps> = ({ variant = 'default' }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-brand-orange opacity-10"></div>
      <div className="absolute left-1/3 top-1/3 w-32 h-32 rounded-full bg-brand-purple opacity-10"></div>
      <div className="absolute right-1/4 bottom-1/4 w-48 h-48 rounded-full bg-brand-skyBlue opacity-10"></div>
    </div>
  );
};

export default DecorativeBackground;

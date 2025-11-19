import React, { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * OptimizedImage Component
 * 
 * A reusable image component with built-in optimization features:
 * - Lazy loading by default
 * - Loading state with skeleton
 * - Error fallback
 */

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: 'square' | 'video' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallback = '/placeholder.svg',
  loading = 'lazy',
  aspectRatio = 'auto',
  objectFit = 'cover',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallback) {
      setImageSrc(fallback);
    }
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Actual image */}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFitClasses[objectFit],
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />

      {/* Error state indicator */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs">
          Sin imagen
        </div>
      )}
    </div>
  );
};

/**
 * ProductImage Component
 * Specialized variant for product images with consistent styling
 */
interface ProductImageProps extends Omit<OptimizedImageProps, 'aspectRatio' | 'objectFit'> {
  variant?: 'card' | 'detail' | 'thumbnail';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  variant = 'card',
  className,
  ...props
}) => {
  const variantClasses = {
    card: 'rounded-lg',
    detail: 'rounded-xl',
    thumbnail: 'rounded-md',
  };

  return (
    <OptimizedImage
      aspectRatio="square"
      objectFit="cover"
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  );
};

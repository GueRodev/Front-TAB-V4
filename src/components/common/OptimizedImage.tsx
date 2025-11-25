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
  // Use fallback immediately if src is empty/null to prevent 404s
  const [imageSrc, setImageSrc] = useState(src || fallback);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  // Update image src when prop changes, but use fallback if empty
  React.useEffect(() => {
    if (src && src !== imageSrc) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);
    } else if (!src) {
      setImageSrc(fallback);
      setHasError(true);
      setIsLoading(false);
    }
  }, [src, fallback]);

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
      {/* Loading skeleton - Reserve space to prevent CLS */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ minHeight: aspectRatio === 'square' ? '100%' : '200px' }}
        />
      )}

      {/* Actual image with fixed dimensions to prevent layout shift */}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        width={aspectRatio === 'square' ? '400' : undefined}
        height={aspectRatio === 'square' ? '400' : undefined}
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

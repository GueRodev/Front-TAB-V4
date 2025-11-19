/**
 * Empty State Component
 * Generic reusable component for displaying empty states
 */

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => {
  return (
    <div className="py-12 text-center text-muted-foreground px-4">
      <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm md:text-base font-medium">{title}</p>
      {description && (
        <p className="text-xs md:text-sm mt-1">{description}</p>
      )}
    </div>
  );
};

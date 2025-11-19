import React from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NotificationsPopover } from '@/features/notifications';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AdminHeaderProps {
  title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  return (
    <header className="sticky top-0 z-40 flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b bg-background px-3 md:px-6">
      <SidebarTrigger className="-ml-1 md:-ml-2" />
      
      {title && (
        <h1 className="text-base md:text-xl font-semibold text-foreground">
          {title}
        </h1>
      )}
      
      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <NotificationsPopover />
        <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-10 md:w-10" asChild>
          <Link to="/admin/profile">
            <User className="h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;

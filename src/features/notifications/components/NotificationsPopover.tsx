import React, { useState } from 'react';
import { Bell, ShoppingBag, User as UserIcon, Package, MoreVertical } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '../contexts';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NotificationsPopover: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const allNotifications = notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="h-4 w-4" />;
      case 'user':
        return <UserIcon className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Redirigir según el tipo de notificación
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    } else if (notification.type === 'order' && notification.orderId) {
      // Redirigir a la página de pedidos con el pedido específico
      navigate('/admin/orders');
      setOpen(false);
    } else if (notification.type === 'order') {
      navigate('/admin/orders');
      setOpen(false);
    } else if (notification.type === 'user') {
      navigate('/admin/users');
      setOpen(false);
    } else if (notification.type === 'product') {
      navigate('/admin/products');
      setOpen(false);
    }
  };

  const NotificationItem = ({ notification }: { notification: any }) => (
    <div
      onClick={() => handleNotificationClick(notification)}
      className={cn(
        "flex items-start gap-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/40 last:border-0",
        !notification.read && "bg-accent/20"
      )}
    >
      <div className="flex-shrink-0 mt-1 p-2 rounded-full bg-primary/10">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <span className="text-xs text-muted-foreground mt-1 inline-block">
          {notification.time}
        </span>
      </div>
      {!notification.read && (
        <div className="flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
        </div>
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-10 md:w-10">
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] md:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Notificaciones</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent p-0">
            <TabsTrigger 
              value="todas" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Todas
            </TabsTrigger>
            <TabsTrigger 
              value="no-leidas"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              No leídas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="m-0">
            <ScrollArea className="h-96">
              {allNotifications.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
                    <span className="text-sm font-medium">Nuevas</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={markAllAsRead}
                    >
                      Marcar todas como leídas
                    </Button>
                  </div>
                  {allNotifications.map(notification => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No tienes notificaciones</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="no-leidas" className="m-0">
            <ScrollArea className="h-96">
              {unreadNotifications.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
                    <span className="text-sm font-medium">Nuevas</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={markAllAsRead}
                    >
                      Marcar todas como leídas
                    </Button>
                  </div>
                  {unreadNotifications.map(notification => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No tienes notificaciones sin leer</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;

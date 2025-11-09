import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContextMySQL";
import { useOrders } from "@/contexts/OrdersContext";
import { Bell, Package, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'promotion';
  title: string;
  message: string;
  orderId?: number;
  read: boolean;
  timestamp: Date;
}

export default function OrderNotification() {
  const { user } = useAuth();
  const { loadUserOrders } = useOrders();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  // Funções auxiliares para localStorage
  const getShownNotifications = (): Set<string> => {
    if (!user?.id) return new Set();
    try {
      const stored = localStorage.getItem(`shown_notifications_${user.id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const saveShownNotification = (notificationId: string) => {
    if (!user?.id) return;
    try {
      const shown = getShownNotifications();
      shown.add(notificationId);
      localStorage.setItem(`shown_notifications_${user.id}`, JSON.stringify(Array.from(shown)));
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      // Carregar notificações do localStorage se existir
      try {
        const stored = localStorage.getItem(`notifications_${user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Converter timestamps de string para Date
          const notificationsWithDates = parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          setNotifications(notificationsWithDates);
          setHasUnread(notificationsWithDates.some((n: Notification) => !n.read));
        }
      } catch (error) {
        console.error('Error loading stored notifications:', error);
      }

      checkOrderNotifications();
      // Verificar a cada 5 minutos (não 30 segundos)
      const interval = setInterval(checkOrderNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkOrderNotifications = async () => {
    if (!user?.id) return;

    try {
      // Buscar pedidos do usuário
      const orders = await loadUserOrders(user.id);
      
      // Notificações já mostradas (persistidas)
      const shownIds = getShownNotifications();
      
      const newNotifications: Notification[] = [];

      orders.forEach((order: any) => {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

        // Notificação de confirmação (apenas uma vez, nas primeiras 2 horas)
        if (order.status === 'confirmed' && hoursSinceCreation < 2) {
          const notificationId = `confirmed_${order.id}`;
          const existing = notifications.find(n => n.orderId === order.id && n.type === 'order_confirmed');
          
          if (!existing && !shownIds.has(notificationId)) {
            newNotifications.push({
              id: notificationId,
              type: 'order_confirmed',
              title: 'Pedido Confirmado!',
              message: `Seu pedido #${order.id} foi confirmado e está sendo preparado.`,
              orderId: order.id,
              read: false,
              timestamp: new Date(),
            });
            saveShownNotification(notificationId);
          }
        }

        // Notificação de envio (apenas uma vez, quando status é 'shipped')
        if (order.status === 'shipped') {
          const notificationId = `shipped_${order.id}`;
          const existing = notifications.find(n => n.orderId === order.id && n.type === 'order_shipped');
          
          if (!existing && !shownIds.has(notificationId)) {
            newNotifications.push({
              id: notificationId,
              type: 'order_shipped',
              title: 'Pedido Enviado!',
              message: `Seu pedido #${order.id} foi enviado e está a caminho.`,
              orderId: order.id,
              read: false,
              timestamp: new Date(),
            });
            
            // Mostrar toast apenas uma vez
            toast.success(`Pedido #${order.id} foi enviado!`, {
              description: 'Você pode rastrear seu pedido agora.',
              action: {
                label: 'Rastrear',
                onClick: () => navigate(`/tracking/${order.id}`),
              },
            });
            
            saveShownNotification(notificationId);
          }
        }

        // Notificação de entrega (APENAS UMA VEZ)
        if (order.status === 'delivered') {
          const notificationId = `delivered_${order.id}`;
          const existing = notifications.find(n => n.orderId === order.id && n.type === 'order_delivered');
          
          // Verificar se já foi mostrado antes (no localStorage)
          if (!existing && !shownIds.has(notificationId)) {
            newNotifications.push({
              id: notificationId,
              type: 'order_delivered',
              title: 'Pedido Entregue! 🎉',
              message: `Seu pedido #${order.id} foi entregue com sucesso.`,
              orderId: order.id,
              read: false,
              timestamp: new Date(),
            });
            
            // Mostrar toast APENAS UMA VEZ
            toast.success(`Pedido #${order.id} foi entregue!`, {
              description: 'Obrigado pela sua compra!',
              duration: 5000,
            });
            
            // Marcar como mostrado para nunca mais mostrar
            saveShownNotification(notificationId);
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => {
          const updated = [...newNotifications, ...prev];
          // Remover duplicatas
          const unique = Array.from(new Map(updated.map(n => [n.id, n])).values());
          // Limitar a 20 notificações
          const limited = unique.slice(0, 20);
          
          // Salvar no localStorage
          try {
            localStorage.setItem(`notifications_${user.id}`, JSON.stringify(limited));
          } catch (error) {
            console.error('Error saving notifications:', error);
          }
          
          return limited;
        });
        setHasUnread(true);
      }

      // Verificar se há não lidas
      const currentNotifications = notifications.length > 0 ? notifications : 
        (() => {
          try {
            const stored = localStorage.getItem(`notifications_${user.id}`);
            return stored ? JSON.parse(stored).map((n: any) => ({
              ...n,
              timestamp: new Date(n.timestamp)
            })) : [];
          } catch {
            return [];
          }
        })();
      
      const unread = currentNotifications.filter((n: Notification) => !n.read).length;
      setHasUnread(unread > 0);

    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      
      // Salvar no localStorage
      if (user?.id) {
        try {
          localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving notifications:', error);
        }
      }
      
      return updated;
    });
    
    const unreadCount = notifications.filter(n => n.id !== id && !n.read).length;
    setHasUnread(unreadCount > 0);
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      
      // Salvar no localStorage
      if (user?.id) {
        try {
          localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving notifications:', error);
        }
      }
      
      return updated;
    });
    setHasUnread(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.orderId) {
      if (notification.type === 'order_shipped' || notification.type === 'order_delivered') {
        navigate(`/tracking/${notification.orderId}`);
      } else {
        navigate('/profile#pedidos');
      }
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 w-full">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'order_delivered' ? 'bg-green-100 text-green-600' :
                    notification.type === 'order_shipped' ? 'bg-blue-100 text-blue-600' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {notification.type === 'order_delivered' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => navigate('/profile#pedidos')}
          >
            Ver todos os pedidos
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Notification, ToastMessage, NotificationType, NotificationCategory } from './types';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  activeToast: ToastMessage | null;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  hideToast: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Datos de prueba iniciales para mostrar todos los tipos y categorías del diseño
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    category: 'pagos',
    title: '¡Pago registrado!',
    message: 'El pago de S/ 250.00 fue registrado correctamente.',
    createdAt: new Date(Date.now() - 5 * 60000), // hace 5 min
    isRead: false,
  },
  {
    id: '2',
    type: 'info',
    category: 'pedidos',
    title: 'Nuevo pedido recibido',
    message: 'Pedido #1234 por S/ 189.90',
    createdAt: new Date(Date.now() - 25 * 60000), // hace 25 min
    isRead: false,
  },
  {
    id: '3',
    type: 'warning',
    category: 'recordatorios',
    title: 'Recordatorio de tareas',
    message: 'Tienes 3 tareas pendientes para hoy.',
    createdAt: new Date(Date.now() - 60 * 60000), // hace 1 hora
    isRead: false,
  },
  {
    id: '4',
    type: 'error',
    category: 'sistema',
    title: 'Stock bajo detectado',
    message: '"Café Molido 250g" tiene stock bajo (5 unidades).',
    createdAt: new Date(Date.now() - 120 * 60000), // hace 2 horas
    isRead: false,
  },
  {
    id: '5',
    type: 'info',
    category: 'calendario',
    title: 'Reunión con cliente',
    message: 'Cita programada con María Fe a las 4:00 PM.',
    createdAt: new Date(Date.now() - 240 * 60000), // hace 4 horas
    isRead: true,
  },
  {
    id: '6',
    type: 'success',
    category: 'promociones',
    title: 'Campaña activada',
    message: 'Tu promoción "Descuento del Día del Padre" ya está online.',
    createdAt: new Date(Date.now() - 1440 * 60000), // hace 1 día
    isRead: true,
  }
];


export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const newToast = { ...toast, id: Math.random().toString(36).substr(2, 9) };
    setActiveToast(newToast);
    
    // Auto ocultar después de 4 segundos
    setTimeout(() => {
      setActiveToast((current) => (current?.id === newToast.id ? null : current));
    }, 4000);
  }, []);

  const hideToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const addNotification = useCallback((data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    
    // Opcionalmente mostrar toast al recibir notificación
    showToast({
      type: data.type,
      title: data.title,
      message: data.message,
    });
  }, [showToast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const value = {
    notifications,
    unreadCount,
    activeToast,
    showToast,
    hideToast,
    addNotification,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, ToastMessage, NotificationType, NotificationCategory } from './types';

export interface NotificationSettings {
  general: boolean;
  categories: {
    pedidos: boolean;
    pagos: boolean;
    recordatorios: boolean;
    promociones: boolean;
    calendario: boolean;
  };
  channels: {
    push: boolean;
    email: boolean;
  };
}

const DEFAULT_SETTINGS: NotificationSettings = {
  general: true,
  categories: {
    pedidos: true,
    pagos: true,
    recordatorios: true,
    promociones: false,
    calendario: true,
  },
  channels: {
    push: true,
    email: false,
  },
};

const SETTINGS_STORAGE_KEY = 'emprendex:notificationSettings:v1';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  activeToast: ToastMessage | null;
  settings: NotificationSettings;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  hideToast: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updateSettings: (newSettings: NotificationSettings) => Promise<void>;
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
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  // Cargar configuración al iniciar
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({
            general: parsed.general ?? DEFAULT_SETTINGS.general,
            categories: { ...DEFAULT_SETTINGS.categories, ...parsed.categories },
            channels: { ...DEFAULT_SETTINGS.channels, ...parsed.channels },
          });
        }
      } catch (e) {
        console.error('Error loading notification settings', e);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Error saving notification settings', e);
    }
  }, []);

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
    // Si las notificaciones generales están desactivadas
    if (!settings.general) {
      return;
    }

    // Filtrar por categoría configurable
    if (data.category !== 'sistema') {
      const isCategoryEnabled = settings.categories[data.category as keyof typeof settings.categories];
      if (isCategoryEnabled === false) {
        return;
      }
    }

    const newNotification: Notification = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    
    // Solo mostrar Toast si la notificación push está activa como canal
    if (settings.channels.push) {
      showToast({
        type: data.type,
        title: data.title,
        message: data.message,
      });
    }
  }, [showToast, settings]);

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
    settings,
    showToast,
    hideToast,
    addNotification,
    markAsRead,
    markAllAsRead,
    updateSettings,
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

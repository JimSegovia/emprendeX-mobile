export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationCategory = 'pedidos' | 'pagos' | 'recordatorios' | 'calendario' | 'promociones' | 'sistema';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  link?: string; // Ruta opcional a donde navegar al tocar
}

export interface ToastMessage {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

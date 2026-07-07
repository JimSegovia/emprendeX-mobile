import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShoppingBag, DollarSign, Bell, Calendar, Tag, Megaphone } from 'lucide-react-native';
import { Notification, NotificationCategory } from '@/lib/notifications/types';
import { useNotifications } from '@/lib/notifications/NotificationContext';
import { useAccountPreferences } from '@/lib/account-preferences-context';

const CategoryIcons: Record<NotificationCategory, typeof ShoppingBag> = {
  pedidos: ShoppingBag,
  pagos: DollarSign,
  recordatorios: Bell,
  calendario: Calendar,
  promociones: Tag,
  sistema: Megaphone,
};

const CategoryColors: Record<NotificationCategory, { bg: string; icon: string }> = {
  pedidos: { bg: 'bg-green-50', icon: '#16a34a' },
  pagos: { bg: 'bg-emerald-50', icon: '#10b981' },
  recordatorios: { bg: 'bg-orange-50', icon: '#f59e0b' },
  calendario: { bg: 'bg-blue-50', icon: '#3b82f6' },
  promociones: { bg: 'bg-purple-50', icon: '#8b5cf6' },
  sistema: { bg: 'bg-slate-100', icon: '#64748b' },
};

interface NotificationItemProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const { markAsRead } = useNotifications();
  const { palette } = useAccountPreferences();

  const handlePress = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (onPress) {
      onPress(notification);
    }
  };

  const Icon = CategoryIcons[notification.category] || Megaphone;
  const colors = CategoryColors[notification.category] || CategoryColors.sistema;

  // Formato simple de fecha relativa
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `Hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `Hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `Hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `Hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `Hace ${Math.floor(interval)} min`;
    return 'Hace un momento';
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className={`flex-row items-center p-4 border-b border-slate-100 ${notification.isRead ? 'bg-white' : 'bg-slate-50'}`}
    >
      <View className="w-3 items-center justify-center mr-1">
        {!notification.isRead && (
          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }} />
        )}
      </View>

      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${colors.bg}`}>
        <Icon size={20} color={colors.icon} />
      </View>

      <View className="flex-1 mr-2">
        <Text className={`text-sm mb-0.5 ${notification.isRead ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'}`}>
          {notification.title}
        </Text>
        <Text className="text-xs text-slate-500 line-clamp-2">
          {notification.message}
        </Text>
      </View>

      <Text className="text-[10px] text-slate-400">
        {getTimeAgo(notification.createdAt)}
      </Text>
    </TouchableOpacity>
  );
};

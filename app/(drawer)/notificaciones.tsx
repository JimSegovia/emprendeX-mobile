import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNotifications } from '@/lib/notifications/NotificationContext';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useAccountPreferences } from '@/lib/account-preferences-context';

export default function NotificationsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'read':
        return notifications.filter(n => n.isRead);
      case 'all':
      default:
        return notifications;
    }
  }, [notifications, filter]);

  return (
    <View className="flex-1 bg-white">
      <View
        className="px-5 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={openDrawer} className="p-2 -ml-2 mr-2">
              <Menu color="white" size={24} />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-white text-xl font-bold mr-2">Notificaciones</Text>
              <View className="border border-white/40 rounded-full px-2 py-0.5">
                <Text className="text-white text-[10px] font-bold">PRO</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={markAllAsRead} className="border border-white/30 rounded-xl px-3 py-1.5 flex-shrink-0">
            <Text className="text-xs font-semibold text-white">Marcar leídas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row items-center border-b border-slate-200 bg-white">
        {(['all', 'unread', 'read'] as const).map((key) => {
          const label = key === 'all' ? 'Todas' : key === 'unread' ? 'No leídas' : 'Leídas';
          const active = filter === key;
          return (
            <TouchableOpacity
              key={key}
              className="flex-1 items-center justify-center py-3 border-b-2 flex-row gap-1"
              style={{ borderBottomColor: active ? palette.primary : 'transparent' }}
              onPress={() => setFilter(key)}
            >
              <Text className="text-sm font-medium" style={{ color: active ? palette.primaryText : '#64748b' }}>
                {label}
              </Text>
              {key === 'unread' && unreadCount > 0 && (
                <View className="px-1.5 rounded-full items-center justify-center min-w-[20px] h-5" style={{ backgroundColor: palette.primary }}>
                  <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <ScrollView className="flex-1 bg-slate-50">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onPress={(n) => {
                if (n.link) {
                  router.push(n.link as any);
                }
              }}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-20 pb-10 px-4">
            <Text className="text-slate-400 text-base">No hay notificaciones</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

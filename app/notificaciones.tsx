import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '@/lib/notifications/NotificationContext';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { useAccountPreferences } from '@/lib/account-preferences-context';

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsScreen() {
  const router = useRouter();
  const { palette } = useAccountPreferences();
  const { notifications, unreadCount, markAllAsRead, settings } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');

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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100" style={{ backgroundColor: palette.primary }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-white">Notificaciones</Text>
        </View>
        <TouchableOpacity onPress={markAllAsRead} className="p-1">
          <Text className="text-sm font-medium text-white opacity-90">Marcar todas como leídas</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row items-center border-b border-slate-200">
        <TouchableOpacity 
          className="flex-1 items-center justify-center py-3 border-b-2"
          style={{ borderBottomColor: filter === 'all' ? palette.primary : 'transparent' }}
          onPress={() => setFilter('all')}
        >
          <Text className="text-sm font-medium" style={{ color: filter === 'all' ? palette.primaryText : '#64748b' }}>
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 items-center justify-center py-3 border-b-2 flex-row gap-1"
          style={{ borderBottomColor: filter === 'unread' ? palette.primary : 'transparent' }}
          onPress={() => setFilter('unread')}
        >
          <Text className="text-sm font-medium" style={{ color: filter === 'unread' ? palette.primaryText : '#64748b' }}>
            No leídas
          </Text>
          {unreadCount > 0 && (
            <View className="px-1.5 rounded-full items-center justify-center min-w-[20px] h-5" style={{ backgroundColor: palette.primary }}>
              <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-1 items-center justify-center py-3 border-b-2"
          style={{ borderBottomColor: filter === 'read' ? palette.primary : 'transparent' }}
          onPress={() => setFilter('read')}
        >
          <Text className="text-sm font-medium" style={{ color: filter === 'read' ? palette.primaryText : '#64748b' }}>
            Leídas
          </Text>
        </TouchableOpacity>
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
            <Text className="text-slate-300 text-xs mt-4 text-center">
              Debug info: general={String(settings?.general)} categories={JSON.stringify(settings?.categories)} count={notifications?.length}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

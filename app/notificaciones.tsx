import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useNotifications } from '../lib/notifications/NotificationContext';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { useAccountPreferences } from '../lib/account-preferences-context';
import { NotificationBadge } from '../components/ui/NotificationBadge';

type FilterType = 'all' | 'unread' | 'read';

export default function NotificationsScreen() {
  const router = useRouter();
  const { palette } = useAccountPreferences();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
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
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? 24 : 0 }}>
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
          className={`flex-1 items-center justify-center py-3 border-b-2 ${filter === 'all' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setFilter('all')}
        >
          <Text className={`text-sm font-medium ${filter === 'all' ? 'text-indigo-600' : 'text-slate-500'}`}>
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 items-center justify-center py-3 border-b-2 flex-row gap-1 ${filter === 'unread' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setFilter('unread')}
        >
          <Text className={`text-sm font-medium ${filter === 'unread' ? 'text-indigo-600' : 'text-slate-500'}`}>
            No leídas
          </Text>
          {unreadCount > 0 && (
            <View className="bg-indigo-600 px-1.5 rounded-full items-center justify-center min-w-[20px] h-5">
              <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex-1 items-center justify-center py-3 border-b-2 ${filter === 'read' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setFilter('read')}
        >
          <Text className={`text-sm font-medium ${filter === 'read' ? 'text-indigo-600' : 'text-slate-500'}`}>
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
                // Posible navegación si hay un link
                if (n.link) {
                  router.push(n.link as any);
                }
              }}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-20 pb-10">
            <Text className="text-slate-400 text-base">No hay notificaciones</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

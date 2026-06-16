import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Menu } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { fetchCalendarioEventos, getReadableCalendarioError, type CalendarioEvento } from '@/lib/calendario';

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const [events, setEvents] = useState<CalendarioEvento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  useEffect(() => {
    const loadEvents = async () => {
      if (!accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        setEvents(await fetchCalendarioEventos(accessToken));
      } catch (loadError) {
        setError(getReadableCalendarioError(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvents();
  }, [accessToken]);

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View className="px-4 pb-4" style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }} entering={sectionEntering(0)}>
        <View className="flex-row items-center"><TouchableOpacity onPress={openDrawer} className="mr-4"><Menu color="white" size={24} /></TouchableOpacity><Text className="text-white text-xl font-semibold">Calendario</Text></View>
      </Animated.View>
      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        {isLoading ? <View className="py-10 items-center"><ActivityIndicator color={palette.primary} /><Text className="mt-3 text-slate-500">Cargando eventos...</Text></View> : null}
        {error ? <Text className="text-rose-600">{error}</Text> : null}
        {events.map((event) => (
          <Animated.View key={event.id} className="mb-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(1)}>
            <View className="flex-row items-center justify-between"><Text className="text-lg font-semibold text-slate-800">{event.referenceCode}</Text><Calendar size={18} color={palette.primary} /></View>
            <Text className="mt-2 text-sm text-slate-500">{event.type}</Text>
            <Text className="mt-2 font-semibold text-slate-800">{event.title}</Text>
            <Text className="mt-2 text-sm text-slate-500">{new Date(event.date).toLocaleDateString()}</Text>
            <Text className="mt-3 text-xs font-semibold" style={{ color: palette.primaryText }}>{event.status}</Text>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

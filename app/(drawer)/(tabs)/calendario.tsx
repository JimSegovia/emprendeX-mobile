import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Filter, Box, Calendar as CalendarIcon, Plus } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { useScrollToTopOnFocus } from '@/hooks/use-scroll-to-top';
import { useAccountPreferences } from '@/lib/account-preferences-context';

type EventStatus = 'en_camino' | 'reservado' | 'pendiente';

interface MockEvent {
  id: string;
  type: 'pedido' | 'alquiler';
  title: string;
  customer: string;
  time: string;
  status: EventStatus;
}

const mockEvents: MockEvent[] = [
  {
    id: '1',
    type: 'pedido',
    title: 'Pedido #1023',
    customer: 'Maria L+¦pez',
    time: '2:00 p.m',
    status: 'en_camino',
  },
  {
    id: '2',
    type: 'alquiler',
    title: 'Alquiler #2001',
    customer: 'Carlos Ram+¡rez',
    time: '3:00 p.m',
    status: 'reservado',
  },
  {
    id: '3',
    type: 'pedido',
    title: 'Pedido #1024',
    customer: 'Juan P+®rez',
    time: '4:00 p.m',
    status: 'pendiente',
  },
];

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const mainScrollRef = useScrollToTopOnFocus();
  const { palette } = useAccountPreferences();

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // Static calendar for May
  const daysOfWeek = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  // Group days into weeks (7 days per week)
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  for (let i = 0; i < calendarDays.length; i++) {
    currentWeek.push(calendarDays[i]);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const renderBadge = (status: EventStatus) => {
    switch (status) {
      case 'en_camino':
        return (
          <View className="rounded-full bg-orange-100/80 px-3 py-1">
            <Text className="text-xs font-semibold text-orange-500">En camino</Text>
          </View>
        );
      case 'reservado':
        return (
          <View className="rounded-full bg-emerald-100/80 px-3 py-1">
            <Text className="text-xs font-semibold text-emerald-500">Reservado</Text>
          </View>
        );
      case 'pendiente':
        return (
          <View className="rounded-full bg-amber-100/80 px-3 py-1">
            <Text className="text-xs font-semibold text-amber-500">Pendiente</Text>
          </View>
        );
    }
  };

  return (
    <Animated.View className="flex-1 bg-slate-50" entering={screenEntering}>
      {/* Top Header */}
      <Animated.View
        style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: palette.primary, zIndex: 10 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity onPress={openDrawer} className="p-2 -ml-2">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Calendario</Text>
          <TouchableOpacity className="p-2 -mr-2">
            <Filter color="white" size={22} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        ref={mainScrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 100) }}
      >
        {/* Calendar Section */}
        <Animated.View className="pt-6 px-4" entering={sectionEntering(1)}>
          <View className="items-center mb-6">
            <Text className="text-sm font-semibold text-slate-800">Mayo</Text>
          </View>

          {/* Days of week */}
          <View className="flex-row justify-between mb-4 px-2">
            {daysOfWeek.map((day) => (
              <Text key={day} className="text-xs font-medium text-slate-800 w-8 text-center">
                {day}
              </Text>
            ))}
          </View>

          {/* Dates Grid */}
          <View className="px-2">
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} className="flex-row justify-between mb-4">
                {week.map((day, dayIndex) => (
                  <View key={dayIndex} className="w-8 items-center justify-center">
                    {day ? (
                      <Text className="text-sm font-medium text-slate-800">
                        {day}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </Animated.View>

        <View className="h-[1px] bg-slate-200 mx-5 my-4" />

        {/* Selected Date & Events Section */}
        <Animated.View className="px-5" entering={sectionEntering(2)}>
          <Text className="text-sm font-medium mb-4" style={{ color: palette.primary }}>
            Lunes 20 de mayo
          </Text>

          {mockEvents.map((event) => (
            <View
              key={event.id}
              className="mb-4 flex-row items-center justify-between rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm shadow-slate-100"
            >
              <View className="flex-row items-center" style={{ flex: 1, paddingRight: 12 }}>
                <View
                  className="h-12 w-12 items-center justify-center rounded-xl mr-4"
                  style={{ borderWidth: 1, borderColor: palette.primaryBorder, backgroundColor: palette.primarySoft }}
                >
                  {event.type === 'pedido' ? (
                    <Box size={22} color={palette.primary} />
                  ) : (
                    <CalendarIcon size={22} color={palette.primary} />
                  )}
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-800 mb-1">{event.title}</Text>
                  <Text className="text-xs text-slate-500">{event.customer}</Text>
                </View>
              </View>
              <View className="items-end justify-center">
                <Text className="text-xs font-medium text-slate-500 mb-2">{event.time}</Text>
                {renderBadge(event.status)}
              </View>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Custom FAB */}
      <TouchableOpacity
        activeOpacity={0.8}
        className="absolute h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{
          bottom: 24,
          right: 24,
          backgroundColor: palette.primary,
          shadowColor: palette.shadow,
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>
    </Animated.View>
  );
}

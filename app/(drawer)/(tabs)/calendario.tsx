import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Box, ChevronLeft, ChevronRight, Truck, Store, CreditCard, CalendarDays } from 'lucide-react-native';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { useScrollToTopOnFocus } from '@/hooks/use-scroll-to-top';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { fetchCalendarioEventos, type CalendarioEvento, getReadableCalendarioError } from '@/lib/calendario';
import { getBadgeBgColor, getBadgeLabel, getBadgeTextColor } from '@/lib/status-badge';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const firstDay = new Date(year, month, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
}

function buildWeeks(year: number, month: number): (number | null)[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
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

  return weeks;
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseEventDate(event: CalendarioEvento): Date {
  return new Date(event.date);
}

function eventsByDate(events: CalendarioEvento[]): Map<string, CalendarioEvento[]> {
  const map = new Map<string, CalendarioEvento[]>();
  for (const event of events) {
    const d = parseEventDate(event);
    const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
    const bucket = map.get(key) ?? [];
    bucket.push(event);
    map.set(key, bucket);
  }
  return map;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatCurrency(value: string): string {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 'S/ 0.00';
  return `S/ ${num.toFixed(2)}`;
}

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const mainScrollRef = useScrollToTopOnFocus();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();

  const [events, setEvents] = useState<CalendarioEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const loadEvents = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCalendarioEventos(accessToken);
      setEvents(data);
    } catch (err: unknown) {
      setError(getReadableCalendarioError(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadEvents();
    }, [loadEvents]),
  );

  const eventsByDay = useMemo(() => eventsByDate(events), [events]);
  const weeks = useMemo(() => buildWeeks(currentYear, currentMonth), [currentYear, currentMonth]);

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedEvents = selectedDate ? (eventsByDay.get(selectedDate) ?? []) : [];
  const hasEventsInMonth = useMemo(() => {
    for (let day = 1; day <= getDaysInMonth(currentYear, currentMonth); day++) {
      const key = formatDateKey(currentYear, currentMonth, day);
      if (eventsByDay.has(key)) return true;
    }
    return false;
  }, [currentYear, currentMonth, eventsByDay]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDayPress = (day: number) => {
    const key = formatDateKey(currentYear, currentMonth, day);
    setSelectedDate((prev) => (prev === key ? null : key));
  };

  const handleEventPress = (event: CalendarioEvento) => {
    router.push(`/(drawer)/(tabs)/operaciones/${event.id}`);
  };

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const renderBadge = (status: string) => (
    <View
      className="rounded-full px-2.5 py-0.5"
      style={{ backgroundColor: getBadgeBgColor(status) }}
    >
      <Text
        className="text-xs font-semibold"
        style={{ color: getBadgeTextColor(status) }}
      >
        {getBadgeLabel(status)}
      </Text>
    </View>
  );

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return null;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const dayName = date.toLocaleDateString('es-PE', { weekday: 'long' });
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${d} de ${MONTHS[m - 1]}`;
  }, [selectedDate]);

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
          <View className="w-10" />
        </View>
      </Animated.View>

      <ScrollView
        ref={mainScrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 100) }}
      >
        {/* Month Navigation */}
        <Animated.View className="pt-4 px-5" entering={sectionEntering(1)}>
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={goToPrevMonth} className="p-2">
              <ChevronLeft size={20} color="#475569" />
            </TouchableOpacity>
            <Text className="text-base font-bold text-slate-800">
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} className="p-2">
              <ChevronRight size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Days of week */}
          <View className="flex-row justify-between mb-3 px-1">
            {DAYS_OF_WEEK.map((day) => (
              <Text key={day} className="text-xs font-medium text-slate-400 w-9 text-center">
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="px-1">
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} className="flex-row justify-between mb-2.5">
                {week.map((day, dayIndex) => {
                  if (day === null) {
                    return <View key={`empty-${dayIndex}`} className="w-9 h-9" />;
                  }

                  const key = formatDateKey(currentYear, currentMonth, day);
                  const hasEvents = eventsByDay.has(key);
                  const isSelected = selectedDate === key;
                  const isToday = key === todayKey;

                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => handleDayPress(day)}
                      className={`w-9 h-9 items-center justify-center rounded-full ${
                        isSelected
                          ? 'bg-slate-800'
                          : isToday
                            ? 'border border-slate-800'
                            : ''
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-white' : isToday ? 'text-slate-800' : 'text-slate-600'
                        }`}
                      >
                        {day}
                      </Text>
                      {hasEvents && !isSelected && (
                        <View className="absolute bottom-0.5 h-1 w-1 rounded-full bg-amber-400" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </Animated.View>

        <View className="h-[1px] bg-slate-200 mx-5 my-4" />

        {/* Events Section */}
        <Animated.View className="px-5" entering={sectionEntering(2)}>
          {loading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color={palette.primary} />
              <Text className="text-slate-500 mt-4 font-medium">Cargando eventos...</Text>
            </View>
          ) : error ? (
            <View className="items-center py-16 px-4">
              <CalendarDays size={40} color="#94a3b8" />
              <Text className="text-slate-500 mt-4 text-center font-medium">{error}</Text>
              <TouchableOpacity
                className="mt-4 px-6 py-2.5 rounded-xl"
                style={{ backgroundColor: palette.primarySoft }}
                onPress={() => { void loadEvents(); }}
              >
                <Text className="font-semibold text-sm" style={{ color: palette.primary }}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : !hasEventsInMonth ? (
            <View className="items-center py-16 mt-4">
              <CalendarDays size={40} color="#cbd5e1" />
              <Text className="text-slate-400 mt-4 text-center font-medium">
                No hay eventos en {MONTHS[currentMonth]}
              </Text>
              <Text className="text-slate-400 text-center text-sm mt-1">
                Crea pedidos o cotizaciones para verlos aquí
              </Text>
            </View>
          ) : (
            <>
              {selectedDateLabel ? (
                <Text className="text-sm font-medium mb-3" style={{ color: palette.primary }}>
                  {selectedDateLabel}
                </Text>
              ) : (
                <Text className="text-sm text-slate-400 mb-3">
                  Selecciona un día para ver sus eventos
                </Text>
              )}

              {selectedEvents.length === 0 && selectedDate ? (
                <View className="items-center py-8">
                  <Text className="text-slate-400 font-medium">Sin eventos para esta fecha</Text>
                </View>
              ) : (
                selectedEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    activeOpacity={0.7}
                    className="mb-3 flex-row items-center rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm shadow-slate-100"
                    onPress={() => handleEventPress(event)}
                  >
                    <View
                      className="h-11 w-11 items-center justify-center rounded-xl mr-3.5"
                      style={{ borderWidth: 1, borderColor: palette.primaryBorder, backgroundColor: palette.primarySoft }}
                    >
                      <Box size={20} color={palette.primary} />
                    </View>

                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-sm font-semibold text-slate-800">{event.referenceCode}</Text>
                        {event.deliveryMethod && (
                          <View className="ml-2">
                            {event.deliveryMethod === 'Entrega a domicilio' ? (
                              <Truck size={12} color="#64748b" />
                            ) : (
                              <Store size={12} color="#64748b" />
                            )}
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-slate-500 mb-1.5">{event.customerFullName}</Text>
                      <View className="flex-row items-center space-x-3">
                        <View className="flex-row items-center">
                          <CreditCard size={11} color="#94a3b8" />
                          <Text className="text-xs text-slate-500 ml-1">{formatCurrency(event.total)}</Text>
                        </View>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-xs font-medium text-slate-400 mb-1.5">
                        {formatTime(event.time)}
                      </Text>
                      {renderBadge(event.status)}
                      {event.paymentStatus && event.type === 'Pedido' && (
                        <View className="mt-1">
                          {renderBadge(event.paymentStatus)}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

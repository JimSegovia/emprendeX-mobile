import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Filter, ChevronLeft, ChevronRight, Plus, Box, Calendar as CalendarIcon, Menu } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // Mock calendar data
  const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Generating a simple 5x7 grid for May 2024 (starts on Wednesday)
  const days = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - 1; // offset for Wednesday start
    if (dayNum < 1) return { day: '', type: 'empty' };
    if (dayNum > 31) return { day: dayNum - 31, type: 'next-month' };
    
    // Add dots to some days
    let dots = [];
    if (dayNum === 9 || dayNum === 16 || dayNum === 23) dots.push('bg-green-500');
    if (dayNum === 15 || dayNum === 20) dots.push('bg-orange-500');
    
    return { day: dayNum, type: dayNum === 20 ? 'active' : 'current-month', dots };
  });

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      {/* Header */}
      <Animated.View 
        className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Calendario</Text>
        </View>
        <TouchableOpacity>
          <Filter color="white" size={24} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false} entering={sectionEntering(1)}>
        {/* Month Selector */}
        <Animated.View className="flex-row items-center justify-between mb-6 px-4" entering={sectionEntering(2)}>
          <TouchableOpacity>
            <ChevronLeft size={24} color="#334155" />
          </TouchableOpacity>
          <Text className="text-slate-800 font-bold text-lg">Mayo 2024</Text>
          <TouchableOpacity>
            <ChevronRight size={24} color="#334155" />
          </TouchableOpacity>
        </Animated.View>

        {/* Calendar Grid */}
        <Animated.View className="mb-6" entering={sectionEntering(3)}>
          <View className="flex-row justify-between mb-4">
            {weekdays.map((day, i) => (
              <Text key={i} className="text-slate-500 text-sm font-medium w-10 text-center">
                {day}
              </Text>
            ))}
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {days.map((item, index) => (
              <View key={index} className="w-10 h-10 items-center justify-center mb-2 relative">
                {item.type === 'active' ? (
                  <View className="w-9 h-9 rounded-full bg-violet-600 items-center justify-center">
                    <Text className="text-white font-bold">{item.day}</Text>
                  </View>
                ) : (
                  <Text className={`font-medium ${item.type === 'next-month' ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.day}
                  </Text>
                )}
                
                {/* Dots indicator */}
                {item.dots && item.dots.length > 0 && (
                  <View className="absolute bottom-1 flex-row space-x-0.5">
                    {item.dots.map((dotColor, i) => (
                      <View key={i} className={`w-1 h-1 rounded-full ${dotColor}`} />
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        <View className="h-[1px] bg-slate-100 mb-6" />

        {/* Selected Date section */}
        <Text className="text-violet-600 font-bold text-lg mb-4">Lunes 20 de mayo</Text>

        {/* Events List */}
        <Animated.View className="space-y-3 pb-24" entering={sectionEntering(4)}>
          {/* Item 1 */}
          <Animated.View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 mb-3" entering={sectionEntering(5)}>
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-violet-50 items-center justify-center mr-3 border border-violet-100">
                <Box size={24} color="#7c3aed" />
              </View>
              <View>
                <Text className="font-bold text-slate-800 mb-0.5">Pedido #1023</Text>
                <Text className="text-slate-500 text-sm">María López</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-slate-500 text-sm mb-2">2:00 p.m.</Text>
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-600 font-semibold text-xs">En camino</Text>
              </View>
            </View>
          </Animated.View>

          {/* Item 2 */}
          <Animated.View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 mb-3" entering={sectionEntering(6)}>
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-violet-50 items-center justify-center mr-3 border border-violet-100">
                <CalendarIcon size={24} color="#7c3aed" />
              </View>
              <View>
                <Text className="font-bold text-slate-800 mb-0.5">Cotización #2001</Text>
                <Text className="text-slate-500 text-sm">Carlos Ramírez</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-slate-500 text-sm mb-2">3:00 p.m.</Text>
              <View className="bg-amber-100 px-3 py-1 rounded-full">
                <Text className="text-amber-600 font-semibold text-xs">Pendiente</Text>
              </View>
            </View>
          </Animated.View>

          {/* Item 3 */}
          <Animated.View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 mb-3" entering={sectionEntering(7)}>
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-violet-50 items-center justify-center mr-3 border border-violet-100">
                <Box size={24} color="#f59e0b" />
              </View>
              <View>
                <Text className="font-bold text-slate-800 mb-0.5">Pedido #1024</Text>
                <Text className="text-slate-500 text-sm">Juan Pérez</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-slate-500 text-sm mb-2">4:00 p.m.</Text>
              <View className="bg-amber-100 px-3 py-1 rounded-full">
                <Text className="text-amber-600 font-semibold text-xs">Pendiente</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        className="absolute right-6 w-14 h-14 bg-violet-600 rounded-full items-center justify-center shadow-lg shadow-violet-300"
        style={{ bottom: Math.max(insets.bottom, 16) + 8 }}
        onPress={() => router.push('/(drawer)/(tabs)/operaciones/nueva')}
      >
        <Plus color="white" size={30} />
      </TouchableOpacity>
    </Animated.View>
  );
}

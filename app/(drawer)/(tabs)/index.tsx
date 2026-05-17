import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import {
  ArrowUpRight,
  Bell,
  Calendar,
  FileText,
  Menu,
  PlusSquare,
  Search,
  UserPlus,
} from 'lucide-react-native';
import Animated, {
  AnimatedTouchableOpacity,
  itemEntering,
  screenEntering,
  sectionEntering,
} from '@/components/ui/motion';
import { useAuthSession } from '@/lib/auth-session-context';
import { useModulePreferences } from '@/lib/module-preferences-context';

type QuickAction = {
  key: string;
  label: string;
  icon: typeof PlusSquare;
  onPress: () => void;
};

export default function DashboardScreen() {
  const { authState } = useAuthSession();
  const { isModuleEnabled } = useModulePreferences();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const firstName = authState?.user.firstNames.split(' ')[0] ?? 'Hola';
  const isOperationsEnabled = isModuleEnabled('operaciones');
  const isClientsEnabled = isModuleEnabled('clientes');
  const isQuotesEnabled = isModuleEnabled('cotizaciones');

  const quickActions: QuickAction[] = [
    {
      key: 'new-quote',
      label: `Nueva\ncotización`,
      icon: PlusSquare,
      onPress: () => router.push('/(drawer)/(tabs)/operaciones/nueva'),
    },
    {
      key: 'view-quotes',
      label: `Ver\ncotizaciones`,
      icon: FileText,
      onPress: () => router.push('/(drawer)/(tabs)/cotizaciones'),
    },
    {
      key: 'new-client',
      label: `Nuevo\ncliente`,
      icon: UserPlus,
      onPress: () => router.push('/(drawer)/(tabs)/clientes/form'),
    },
    {
      key: 'new-operation',
      label: `Nueva\noperación`,
      icon: Calendar,
      onPress: () => router.push('/(drawer)/(tabs)/operaciones/nueva'),
    },
  ].filter((action) => {
    if (action.key === 'new-client') {
      return isClientsEnabled;
    }

    if (action.key === 'new-operation') {
      return isOperationsEnabled;
    }

    return isQuotesEnabled;
  });

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <Animated.View className="flex-1 bg-slate-50" entering={screenEntering}>
      <StatusBar style="light" backgroundColor="#7c3aed" />

      <Animated.View
        className="flex-row items-center justify-between bg-violet-600 px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-baseline">
            <Image
              source={require('../../../assets/images/logo full blanco.png')}
              style={{ width: 150, height: 40 }}
              contentFit="contain"
              contentPosition="center"
            />
          </View>
        </View>
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity className="mr-3">
            <Search size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="relative">
            <Bell size={22} color="white" />
            <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full border-2 border-violet-600" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
        <Animated.View className="px-6 pt-6 pb-4" entering={sectionEntering(1)}>
          <Text className="text-2xl font-extrabold text-slate-800 mb-1">
            {`¡Hola, ${firstName}! 👋`}
          </Text>
          <Text className="text-slate-500 text-base">Resumen de hoy</Text>
        </Animated.View>

        <Animated.View
          className="px-6 flex-row flex-wrap justify-between"
          entering={sectionEntering(2)}
        >
          <Animated.View
            className="w-[48%] bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm shadow-slate-100"
            entering={itemEntering(0)}
          >
            <Text className="text-slate-500 font-medium text-xs mb-2">Ventas del día</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">S/ 1,250.00</Text>
            <View className="flex-row items-center">
              <ArrowUpRight size={14} color="#10b981" />
              <Text className="text-emerald-500 font-semibold text-xs ml-1">
                18% vs ayer
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            className="w-[48%] bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm shadow-slate-100"
            entering={itemEntering(1)}
          >
            <Text className="text-slate-500 font-medium text-xs mb-2">Pedidos</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">12</Text>
            <Text className="text-violet-600 font-semibold text-xs">3 pendientes</Text>
          </Animated.View>

          <Animated.View
            className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100"
            entering={itemEntering(2)}
          >
            <Text className="text-slate-500 font-medium text-xs mb-2">
              Cobros pendientes
            </Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">S/ 350.00</Text>
          </Animated.View>

          <Animated.View
            className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100"
            entering={itemEntering(3)}
          >
            <Text className="text-slate-500 font-medium text-xs mb-2">Clientes nuevos</Text>
            <Text className="text-2xl font-bold text-slate-800 mb-2">5</Text>
            <View className="flex-row items-center">
              <ArrowUpRight size={14} color="#10b981" />
              <Text className="text-emerald-500 font-semibold text-xs ml-1">2 vs ayer</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {isOperationsEnabled ? (
          <Animated.View className="px-6 mt-8 mb-4" entering={sectionEntering(3)}>
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-lg font-bold text-slate-800">Próximas entregas</Text>
              <TouchableOpacity
                onPress={() => router.navigate('/(drawer)/(tabs)/operaciones')}
              >
                <Text className="text-violet-600 font-medium text-sm">Ver todas</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 overflow-hidden">
              <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
                <View>
                  <Text className="font-bold text-slate-800 mb-0.5">Pedido #1023</Text>
                  <Text className="text-slate-500 text-xs">María López</Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-400 text-xs mb-1.5">Hoy, 2:00 p.m.</Text>
                  <View className="bg-orange-50 px-2.5 py-1 rounded-md">
                    <Text className="text-orange-500 font-semibold text-xs">En camino</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
                <View>
                  <Text className="font-bold text-slate-800 mb-0.5">Pedido #1024</Text>
                  <Text className="text-slate-500 text-xs">Juan Pérez</Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-400 text-xs mb-1.5">Hoy, 4:00 p.m.</Text>
                  <View className="bg-amber-50 px-2.5 py-1 rounded-md">
                    <Text className="text-amber-500 font-semibold text-xs">Pendiente</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between p-4">
                <View>
                  <Text className="font-bold text-slate-800 mb-0.5">Pedido #1025</Text>
                  <Text className="text-slate-500 text-xs">Lucía Fernández</Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-400 text-xs mb-1.5">
                    Mañana, 10:00 a.m.
                  </Text>
                  <View className="bg-emerald-50 px-2.5 py-1 rounded-md">
                    <Text className="text-emerald-500 font-semibold text-xs">
                      Confirmado
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        ) : null}

        {quickActions.length > 0 ? (
          <Animated.View className="mt-4 mb-10" entering={sectionEntering(4)}>
            <Text className="px-6 text-lg font-bold text-slate-800 mb-4">
              Acciones rápidas
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            >
              {quickActions.map((action, index) => {
                const Icon = action.icon;

                return (
                  <AnimatedTouchableOpacity
                    key={action.key}
                    className="bg-white p-4 rounded-2xl items-center justify-center border border-slate-100 shadow-sm shadow-slate-100 w-[100px] h-[100px]"
                    entering={itemEntering(index)}
                    onPress={action.onPress}
                  >
                    <View className="bg-violet-50 p-2 rounded-lg mb-2">
                      <Icon size={24} color="#7c3aed" />
                    </View>
                    <Text className="text-slate-600 font-medium text-xs text-center leading-tight">
                      {action.label}
                    </Text>
                  </AnimatedTouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        ) : null}
      </ScrollView>
    </Animated.View>
  );
}

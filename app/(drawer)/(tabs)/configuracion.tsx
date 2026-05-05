import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDown, ArrowUp, Briefcase, CreditCard, Crown, FileText, Menu, Package, Users } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import Animated, { AnimatedTouchableOpacity, screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';

const businessProfile = {
  name: 'Dulce Taller',
  category: 'Pasteleria personalizada',
  currency: 'Soles peruanos (S/)',
};

const initialModules = [
  { id: 'clientes', label: 'Clientes', detail: 'Gestion de contactos y fichas.', icon: Users },
  { id: 'productos', label: 'Productos / Servicios', detail: 'Catalogo reutilizable para pedidos.', icon: Package },
  { id: 'cotizaciones', label: 'Cotizaciones', detail: 'Respuestas rapidas para leads.', icon: FileText },
  { id: 'pagos', label: 'Pagos', detail: 'Control de adelantos y saldos.', icon: CreditCard },
];

const premiumModules = [
  { id: 'reportes', label: 'Reportes avanzados', detail: 'Comparativos, periodos y tendencias.' },
  { id: 'alertas', label: 'Alertas inteligentes', detail: 'Recordatorios automáticos por prioridad.' },
];

export default function ConfiguracionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);

  const handleLogout = () => {
    router.replace('/');
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;

    if (nextIndex < 0 || nextIndex >= modules.length) {
      return;
    }

    const nextModules = [...modules];
    const [selected] = nextModules.splice(index, 1);
    nextModules.splice(nextIndex, 0, selected);
    setModules(nextModules);
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Configuración</Text>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        <Animated.View className="mb-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(1)}>
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
              <Briefcase size={22} color="#7c3aed" />
            </View>
            <View>
              <Text className="text-lg font-bold text-slate-800">Datos del negocio</Text>
            </View>
          </View>

          <View className="rounded-2xl bg-slate-50 p-4">
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-500">Nombre</Text>
              <Text className="font-semibold text-slate-800">{businessProfile.name}</Text>
            </View>
            <View className="mt-3 flex-row justify-between">
              <Text className="text-sm text-slate-500">Rubro</Text>
              <Text className="font-semibold text-slate-800">{businessProfile.category}</Text>
            </View>
            <View className="mt-3 flex-row justify-between">
              <Text className="text-sm text-slate-500">Moneda</Text>
              <Text className="font-semibold text-slate-800">{businessProfile.currency}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View className="mb-6 rounded-[28px] border border-slate-100 bg-slate-50 p-5" entering={sectionEntering(2)}>
          <Text className="text-lg font-bold text-slate-800">Módulos visibles</Text>

          <View className="mt-4 flex-row flex-wrap">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <View key={module.id} className={`mr-3 flex-row items-center rounded-full border border-violet-100 bg-white px-4 py-3 ${index > 1 ? 'mt-3' : ''}`}>
                  <Icon size={16} color="#7c3aed" />
                  <Text className="ml-2 text-sm font-semibold text-violet-700">{module.label}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View className="mb-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(3)}>
          <Text className="text-lg font-bold text-slate-800">Orden del menú principal</Text>

          <View className="mt-5">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <AnimatedTouchableOpacity key={module.id} className={`rounded-[24px] border border-slate-100 bg-slate-50 p-4 ${index === 0 ? '' : 'mt-3'}`} layout={smoothLayout} activeOpacity={0.9}>
                  <View className="flex-row items-center justify-between">
                    <View className="mr-4 flex-1 flex-row items-center">
                      <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-white">
                        <Icon size={20} color="#7c3aed" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-slate-800">{module.label}</Text>
                        <Text className="mt-1 text-xs leading-5 text-slate-500">{module.detail}</Text>
                      </View>
                    </View>

                    <View>
                      <TouchableOpacity
                        className={`rounded-xl px-3 py-2 ${index === 0 ? 'bg-slate-100' : 'border border-slate-200 bg-white'}`}
                        onPress={() => moveModule(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp size={16} color={index === 0 ? '#cbd5e1' : '#475569'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className={`mt-2 rounded-xl px-3 py-2 ${index === modules.length - 1 ? 'bg-slate-100' : 'border border-slate-200 bg-white'}`}
                        onPress={() => moveModule(index, 'down')}
                        disabled={index === modules.length - 1}
                      >
                        <ArrowDown size={16} color={index === modules.length - 1 ? '#cbd5e1' : '#475569'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </AnimatedTouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View className="rounded-[28px] border border-amber-100 bg-amber-50 p-5" entering={sectionEntering(4)}>
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
              <Crown size={22} color="#d97706" />
            </View>
            <View>
              <Text className="text-lg font-bold text-amber-900">Módulos premium bloqueados</Text>
            </View>
          </View>

          {premiumModules.map((module, index) => (
            <View key={module.id} className={`rounded-2xl border border-amber-200 bg-white p-4 ${index === 0 ? '' : 'mt-3'}`}>
              <View className="flex-row items-center justify-between">
                <View className="mr-4 flex-1">
                  <Text className="font-bold text-slate-800">{module.label}</Text>
                  <Text className="mt-1 text-sm leading-6 text-slate-500">{module.detail}</Text>
                </View>
                <View className="rounded-full bg-amber-100 px-3 py-1.5">
                  <Text className="text-xs font-semibold text-amber-700">Pro</Text>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity className="mt-5 items-center rounded-2xl bg-violet-600 py-4" onPress={() => router.push('/(drawer)/(tabs)/plan-pro')}>
            <Text className="text-lg font-bold text-white">Gestionar plan Pro</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View className="mt-6 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(5)}>
          <Text className="text-lg font-bold text-slate-800">Sesión</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Si necesitas salir del espacio interno de la app, este es el punto más seguro y consistente para volver al login.
          </Text>

          <TouchableOpacity className="mt-5 items-center rounded-2xl border border-rose-200 bg-rose-50 py-4" onPress={handleLogout}>
            <Text className="text-base font-bold text-rose-600">Volver al login</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

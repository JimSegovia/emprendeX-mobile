import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Package, 
  Users, 
  Briefcase, 
  Crown,
  FileText, 
  CreditCard, 
  BarChart2,
  Check,
  type LucideIcon,
} from 'lucide-react-native';
import Animated, { AnimatedTouchableOpacity, quickCheckEntering, quickCheckExiting, screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';

type ModuleItem = {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  defaultChecked: boolean;
  premium?: boolean;
};

const MODULES = [
  { id: 'pedidos', title: 'Pedidos', desc: 'Gestiona pedidos y entregas.', icon: Package, defaultChecked: true },
  { id: 'clientes', title: 'Clientes', desc: 'Administra tus clientes.', icon: Users, defaultChecked: true },
  { id: 'productos', title: 'Productos / Servicios', desc: 'Gestiona tu catálogo.', icon: Briefcase, defaultChecked: true },
  { id: 'cotizaciones', title: 'Cotizaciones', desc: 'Crea y envía cotizaciones.', icon: FileText, defaultChecked: true },
  { id: 'pagos', title: 'Pagos', desc: 'Controla pagos y deudas.', icon: CreditCard, defaultChecked: true },
  { id: 'reportes', title: 'Reportes avanzados', desc: 'Comparativos, evolución y resúmenes premium.', icon: BarChart2, defaultChecked: false, premium: true },
  { id: 'alertas-pro', title: 'Alertas inteligentes', desc: 'Recordatorios automáticos y foco en pendientes clave.', icon: Crown, defaultChecked: false, premium: true },
] as ModuleItem[];

export default function ModulesScreen() {
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>(
    MODULES.reduce((acc, mod) => ({ ...acc, [mod.id]: mod.defaultChecked }), {})
  );

  const toggleModule = (id: string) => {
    setSelectedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleModulePress = (module: ModuleItem) => {
    if (module.premium) {
      router.push('/(drawer)/(tabs)/plan-pro');
      return;
    }

    toggleModule(module.id);
  };

  const handleSave = () => {
    // Save modules logic here, then navigate to main app
    router.replace('/(drawer)/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      {/* Header */}
      <Animated.View className="flex-row items-center px-4 mb-4" entering={sectionEntering(0)}>
        <TouchableOpacity 
          className="p-2 rounded-full"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View className="items-center px-6 mb-6" entering={sectionEntering(1)}>
        <Text className="text-3xl font-bold text-slate-800 text-center mb-2">
          Elige tus módulos
        </Text>
        <Text className="text-slate-500 text-center text-base">
          Activa los módulos que necesitas. Puedes cambiarlos después.
        </Text>
        <Text className="mt-2 text-center text-sm text-violet-600">
          Los módulos Pro aparecen bloqueados para la demo freemium.
        </Text>
      </Animated.View>

      {/* Modules List */}
      <Animated.ScrollView className="flex-1 px-6" entering={screenEntering}>
        <Animated.View className="border border-slate-100 rounded-3xl overflow-hidden mb-6 bg-white shadow-sm shadow-slate-100" entering={sectionEntering(2)}>
          {MODULES.map((module, index) => {
            const isSelected = selectedModules[module.id];
            const isLast = index === MODULES.length - 1;
            const Icon = module.icon;
            const isPremium = Boolean(module.premium);

            return (
              <AnimatedTouchableOpacity
                key={module.id}
                className={`flex-row items-center p-4 ${isPremium ? 'bg-amber-50' : 'bg-white'} ${!isLast ? 'border-b border-slate-100' : ''}`}
                activeOpacity={0.7}
                onPress={() => handleModulePress(module)}
                entering={sectionEntering(index)}
                layout={smoothLayout}
              >
                <View className={`${isPremium ? 'bg-amber-100' : 'bg-violet-50'} p-2 rounded-xl mr-4`}>
                  <Icon size={24} color={isPremium ? '#d97706' : '#7c3aed'} />
                </View>
                <View className="flex-1 pr-4">
                  <View className="mb-1 flex-row items-center">
                    <Text className="text-slate-800 font-bold text-base">{module.title}</Text>
                    {isPremium && (
                      <View className="ml-2 rounded-full bg-amber-500 px-2 py-1">
                        <Text className="text-[10px] font-bold uppercase tracking-wide text-white">Pro</Text>
                      </View>
                    )}
                  </View>
                  <Text className={`text-xs ${isPremium ? 'text-amber-800' : 'text-slate-500'}`}>{module.desc}</Text>
                </View>
                
                {isPremium ? (
                  <View className="rounded-full border border-amber-200 bg-white px-3 py-1.5">
                    <Text className="text-xs font-semibold text-amber-700">Ver plan</Text>
                  </View>
                ) : (
                  <View 
                    className={`w-6 h-6 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-violet-600 border-violet-600' : 'bg-transparent border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <Animated.View entering={quickCheckEntering} exiting={quickCheckExiting}>
                        <Check size={16} color="white" strokeWidth={3} />
                      </Animated.View>
                    )}
                  </View>
                )}
              </AnimatedTouchableOpacity>
            );
          })}
        </Animated.View>
      </Animated.ScrollView>

      {/* Footer */}
      <Animated.View className="p-6 bg-white" entering={sectionEntering(3)}>
        <TouchableOpacity 
          className="w-full bg-violet-600 rounded-xl py-4 items-center justify-center active:bg-violet-700"
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-lg">Guardar y continuar</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

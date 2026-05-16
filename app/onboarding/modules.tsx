import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  BarChart2,
  Briefcase,
  Check,
  CreditCard,
  Crown,
  FileText,
  type LucideIcon,
  Users,
} from 'lucide-react-native';
import type { ModuleId } from '@/lib/modules';
import Animated, {
  AnimatedTouchableOpacity,
  quickCheckEntering,
  quickCheckExiting,
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';
import {
  completeOnboardingModules,
  getReadableAuthError,
  resolvePostAuthRoute,
} from '@/lib/auth';
import { useAuthSession } from '@/lib/auth-session-context';

type SelectableModuleId = Extract<
  ModuleId,
  'operaciones' | 'clientes' | 'productos' | 'cotizaciones' | 'pagos'
>;

type ModuleItem = {
  id: SelectableModuleId | 'reportes' | 'alertas-pro';
  title: string;
  desc: string;
  icon: LucideIcon;
  defaultChecked: boolean;
  premium?: boolean;
};

const MODULES: ModuleItem[] = [
  {
    id: 'operaciones',
    title: 'Operaciones',
    desc: 'Gestiona pedidos, registros y seguimiento.',
    icon: FileText,
    defaultChecked: true,
  },
  {
    id: 'clientes',
    title: 'Clientes',
    desc: 'Administra tus clientes.',
    icon: Users,
    defaultChecked: true,
  },
  {
    id: 'productos',
    title: 'Productos / Servicios',
    desc: 'Gestiona tu catálogo.',
    icon: Briefcase,
    defaultChecked: true,
  },
  {
    id: 'cotizaciones',
    title: 'Cotizaciones',
    desc: 'Crea y envía cotizaciones.',
    icon: FileText,
    defaultChecked: true,
  },
  {
    id: 'pagos',
    title: 'Pagos',
    desc: 'Controla pagos y deudas.',
    icon: CreditCard,
    defaultChecked: true,
  },
  {
    id: 'reportes',
    title: 'Reportes avanzados',
    desc: 'Comparativos, evolución y resúmenes premium.',
    icon: BarChart2,
    defaultChecked: false,
    premium: true,
  },
  {
    id: 'alertas-pro',
    title: 'Alertas inteligentes',
    desc: 'Recordatorios automáticos y foco en pendientes clave.',
    icon: Crown,
    defaultChecked: false,
    premium: true,
  },
];

const DEFAULT_SELECTED_MODULE_IDS: SelectableModuleId[] = [
  'operaciones',
  'clientes',
  'productos',
  'cotizaciones',
  'pagos',
];

function buildSelectedModulesState(
  enabledModuleIds: ModuleId[] | undefined,
): Record<string, boolean> {
  const enabledIds =
    enabledModuleIds && enabledModuleIds.length > 0
      ? enabledModuleIds
      : DEFAULT_SELECTED_MODULE_IDS;

  return MODULES.reduce<Record<string, boolean>>((accumulator, module) => {
    accumulator[module.id] = enabledIds.includes(module.id as ModuleId);
    return accumulator;
  }, {});
}

export default function ModulesScreen() {
  const { accessToken, authState, isHydrated, updateAuthState } = useAuthSession();
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>(
    buildSelectedModulesState(authState?.user.enabledModuleIds),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedModules(buildSelectedModulesState(authState?.user.enabledModuleIds));
  }, [authState]);

  useEffect(() => {
    if (!isHydrated || accessToken) {
      return;
    }

    router.replace('/');
  }, [accessToken, isHydrated]);

  const toggleModule = (id: SelectableModuleId) => {
    setSelectedModules((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const handleModulePress = (module: ModuleItem) => {
    if (module.premium) {
      router.push('/(drawer)/(tabs)/plan-pro');
      return;
    }

    toggleModule(module.id as SelectableModuleId);
  };

  const handleSave = async () => {
    if (!accessToken) {
      return;
    }

    const selectedModuleIds = MODULES.filter(
      (module) => !module.premium && selectedModules[module.id],
    ).map((module) => module.id as SelectableModuleId);

    if (selectedModuleIds.length === 0) {
      setSubmitError('Selecciona al menos un módulo para continuar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const nextAuthState = await completeOnboardingModules(accessToken, {
        selectedModuleIds,
      });

      updateAuthState(nextAuthState);
      router.replace(resolvePostAuthRoute(nextAuthState));
    } catch (error) {
      setSubmitError(getReadableAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || !accessToken) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-12">
      <Animated.View
        className="flex-row items-center px-4 mb-4"
        entering={sectionEntering(0)}
      >
        <TouchableOpacity className="p-2 rounded-full" onPress={() => router.back()}>
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

      <Animated.ScrollView className="flex-1 px-6" entering={screenEntering}>
        <Animated.View
          className="border border-slate-100 rounded-3xl overflow-hidden mb-6 bg-white shadow-sm shadow-slate-100"
          entering={sectionEntering(2)}
        >
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
                    <Text className="text-slate-800 font-bold text-base">
                      {module.title}
                    </Text>
                    {isPremium ? (
                      <View className="ml-2 rounded-full bg-amber-500 px-2 py-1">
                        <Text className="text-[10px] font-bold uppercase tracking-wide text-white">
                          Pro
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    className={`text-xs ${isPremium ? 'text-amber-800' : 'text-slate-500'}`}
                  >
                    {module.desc}
                  </Text>
                </View>

                {isPremium ? (
                  <View className="rounded-full border border-amber-200 bg-white px-3 py-1.5">
                    <Text className="text-xs font-semibold text-amber-700">
                      Ver plan
                    </Text>
                  </View>
                ) : (
                  <View
                    className={`w-6 h-6 rounded flex items-center justify-center border ${isSelected ? 'bg-violet-600 border-violet-600' : 'bg-transparent border-slate-300'}`}
                  >
                    {isSelected ? (
                      <Animated.View
                        entering={quickCheckEntering}
                        exiting={quickCheckExiting}
                      >
                        <Check size={16} color="white" strokeWidth={3} />
                      </Animated.View>
                    ) : null}
                  </View>
                )}
              </AnimatedTouchableOpacity>
            );
          })}
        </Animated.View>
      </Animated.ScrollView>

      <Animated.View className="p-6 bg-white" entering={sectionEntering(3)}>
        {submitError ? (
          <View className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
            <Text className="text-sm font-medium text-rose-600">{submitError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          className={`w-full rounded-xl py-4 items-center justify-center ${isSubmitting ? 'bg-violet-500' : 'bg-violet-600 active:bg-violet-700'}`}
          onPress={() => {
            void handleSave();
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" />
              <Text className="ml-3 text-white font-bold text-lg">Guardando...</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg">Guardar y continuar</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

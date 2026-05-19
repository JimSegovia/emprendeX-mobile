import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  BarChart2,
  Briefcase,
  Calculator,
  Crown,
  FileText,
  type LucideIcon,
  Users,
} from 'lucide-react-native';
import type { ModuleId } from '@/lib/modules';
import Animated, {
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';
import { completeOnboardingModules, getReadableAuthError, resolvePostAuthRoute } from '@/lib/auth';
import { useAuthSession } from '@/lib/auth-session-context';

type SelectableModuleId = Extract<
  ModuleId,
  'operaciones' | 'clientes' | 'productos' | 'cotizaciones' | 'contabilidad'
>;

type ModuleItem = {
  id: SelectableModuleId | 'reportes' | 'alertas-pro';
  title: string;
  desc: string;
  icon: LucideIcon;
  premium?: boolean;
};

const MODULES: ModuleItem[] = [
  {
    id: 'operaciones',
    title: 'Operaciones',
    desc: 'Gestiona pedidos, registros y seguimiento.',
    icon: FileText,
  },
  {
    id: 'clientes',
    title: 'Clientes',
    desc: 'Administra tus clientes.',
    icon: Users,
  },
  {
    id: 'productos',
    title: 'Productos / Servicios',
    desc: 'Gestiona tu catálogo.',
    icon: Briefcase,
  },
  {
    id: 'cotizaciones',
    title: 'Cotizaciones',
    desc: 'Crea y envía cotizaciones.',
    icon: FileText,
  },
  {
    id: 'contabilidad',
    title: 'Contabilidad',
    desc: 'Controla pagos y gastos.',
    icon: Calculator,
  },
  {
    id: 'reportes',
    title: 'Reportes avanzados',
    desc: 'Comparativos, evolución y resúmenes premium.',
    icon: BarChart2,
    premium: true,
  },
  {
    id: 'alertas-pro',
    title: 'Alertas inteligentes',
    desc: 'Recordatorios automáticos y foco en pendientes clave.',
    icon: Crown,
    premium: true,
  },
];

export default function ModulesScreen() {
  const { accessToken, isHydrated, updateAuthState } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated || accessToken) {
      return;
    }

    router.replace('/');
  }, [accessToken, isHydrated]);

  const handleSave = async () => {
    if (!accessToken) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const nextAuthState = await completeOnboardingModules(accessToken);

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
      <Animated.View className="flex-row items-center px-4 mb-4" entering={sectionEntering(0)}>
        <TouchableOpacity className="p-2 rounded-full" onPress={() => router.back()}>
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View className="items-center px-6 mb-6" entering={sectionEntering(1)}>
        <Text className="text-3xl font-bold text-slate-800 text-center mb-2">
          Conoce tus módulos
        </Text>
        <Text className="text-slate-500 text-center text-base">
          Explora los espacios clave que tendrás disponibles desde el inicio.
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
            const isLast = index === MODULES.length - 1;
            const Icon = module.icon;
            const isPremium = Boolean(module.premium);

            return (
              <Animated.View
                key={module.id}
                className={`flex-row items-center p-4 ${isPremium ? 'bg-amber-50' : 'bg-white'} ${!isLast ? 'border-b border-slate-100' : ''}`}
                entering={sectionEntering(index)}
                layout={smoothLayout}
              >
                <View
                  className={`${isPremium ? 'bg-amber-100' : 'bg-violet-50'} p-2 rounded-xl mr-4`}
                >
                  <Icon size={24} color={isPremium ? '#d97706' : '#7c3aed'} />
                </View>
                <View className="flex-1 pr-4">
                  <View className="mb-1 flex-row items-center">
                    <Text className="text-slate-800 font-bold text-base">{module.title}</Text>
                    {isPremium ? (
                      <View className="ml-2 rounded-full bg-amber-500 px-2 py-1">
                        <Text className="text-[10px] font-bold uppercase tracking-wide text-white">
                          Pro
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className={`text-xs ${isPremium ? 'text-amber-800' : 'text-slate-500'}`}>
                    {module.desc}
                  </Text>
                </View>

                {isPremium ? (
                  <View className="rounded-full border border-amber-200 bg-white px-3 py-1.5">
                    <Text className="text-xs font-semibold text-amber-700">Ver plan</Text>
                  </View>
                ) : null}
              </Animated.View>
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
              <Text className="ml-3 text-white font-bold text-lg">Continuar...</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg">Continuar</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

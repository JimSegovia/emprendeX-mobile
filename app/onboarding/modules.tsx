import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { router } from 'expo-router';
import {
  ArrowLeft,
} from 'lucide-react-native';
import { DEFAULT_MODULES, type ModuleId } from '@/lib/modules';
import Animated, {
  screenEntering,
  sectionEntering,
  smoothLayout,
} from '@/components/ui/motion';
import { completeOnboardingModules, getReadableAuthError, resolvePostAuthRoute } from '@/lib/auth';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';

type SelectableModuleId = Extract<
  ModuleId,
  'operaciones' | 'clientes' | 'catalogo' | 'cotizaciones' | 'contabilidad'
>;

const ONBOARDING_MODULE_IDS: (SelectableModuleId | 'reportes' | 'alertas-pro')[] = [
  'operaciones',
  'clientes',
  'catalogo',
  'cotizaciones',
  'contabilidad',
  'reportes',
  'alertas-pro',
];

const MODULES = DEFAULT_MODULES.filter((module) =>
  ONBOARDING_MODULE_IDS.includes(module.id as (typeof ONBOARDING_MODULE_IDS)[number]),
).map((module) => ({
  id: module.id as SelectableModuleId | 'reportes' | 'alertas-pro',
  title: module.label,
  desc: module.detail ?? '',
  icon: module.icon,
  premium: module.premium,
}));

export default function ModulesScreen() {
  const { palette } = useAccountPreferences();
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
      <AppSafeArea className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={palette.primary} />
      </AppSafeArea>
    );
  }

  return (
    <AppSafeArea className="flex-1 bg-white pt-12">
      <Animated.View className="flex-row items-center px-4 mb-4" entering={sectionEntering(0)}>
        <TouchableOpacity className="p-2 rounded-full" onPress={() => router.back()}>
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View className="items-center px-6 mb-6" entering={sectionEntering(1)}>
        <Text className="text-2xl font-semibold text-slate-800 text-center mb-2">
          Conoce tus módulos
        </Text>
        <Text className="text-slate-500 text-center text-base">
          Explora los espacios clave que tendrás disponibles desde el inicio.
        </Text>
        <Text className="mt-2 text-center text-sm" style={{ color: palette.primaryText }}>
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
                  className={`${isPremium ? 'bg-amber-100' : ''} p-2 rounded-xl mr-4`}
                  style={{ backgroundColor: isPremium ? undefined : palette.primarySoft }}
                >
                  <Icon size={24} color={isPremium ? '#d97706' : palette.primary} />
                </View>
                <View className="flex-1 pr-4">
                  <View className="mb-1 flex-row items-center">
                    <Text className="text-slate-800 font-semibold text-base">{module.title}</Text>
                    {isPremium ? (
                      <View className="ml-2 rounded-full bg-amber-500 px-2 py-1">
                        <Text className="text-[10px] font-semibold uppercase tracking-wide text-white">
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
          className="w-full rounded-xl py-4 items-center justify-center"
          style={{ backgroundColor: isSubmitting ? palette.primaryDark : palette.primary }}
          onPress={() => {
            void handleSave();
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" />
              <Text className="ml-3 text-white font-semibold text-lg">Continuar...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">Continuar</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </AppSafeArea>
  );
}

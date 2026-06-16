import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, Check, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { AnimatedTouchableOpacity, screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { DEFAULT_MODULES } from '@/lib/modules';
import { fetchPlanes, getReadablePlanesError, type Plan } from '@/lib/planes';
import { formatCurrencyValue } from '@/lib/runtime-config';

export default function PlanProScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      if (!accessToken) return;
      setIsLoading(true);
      setError(null);
      try {
        setPlans(await fetchPlanes(accessToken));
      } catch (loadError) {
        setError(getReadablePlanesError(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPlans();
  }, [accessToken]);

  const proPlan = useMemo(
    () =>
      plans.find((plan) => plan.name.trim().toLowerCase() === 'pro') ??
      plans.find((plan) => plan.prices.some((price) => price.isActive)) ??
      plans[0] ??
      null,
    [plans],
  );
  const availablePrices = useMemo(
    () => proPlan?.prices.filter((price) => price.isActive) ?? [],
    [proPlan],
  );
  const highlightedFeatures = useMemo(
    () => DEFAULT_MODULES.filter((module) => module.premium).map((module) => module.label),
    [],
  );

  useEffect(() => {
    if (availablePrices.length === 0) {
      setSelectedPlan(null);
      return;
    }

    if (!selectedPlan || !availablePrices.some((price) => price.period === selectedPlan)) {
      setSelectedPlan(availablePrices[0]?.period ?? null);
    }
  }, [availablePrices, selectedPlan]);

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View className="px-4 pb-4 flex-row items-center justify-between" style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }} entering={sectionEntering(0)}>
        <View className="flex-row items-center"><TouchableOpacity onPress={() => router.back()} className="mr-4"><ArrowLeft color="white" size={24} /></TouchableOpacity><Text className="text-white text-xl font-semibold">Plan Pro</Text></View>
      </Animated.View>
      <Animated.ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }} entering={sectionEntering(1)}>
        <Animated.View className="items-center justify-center mb-8 relative" entering={sectionEntering(2)}>
          <Crown size={80} color="#f59e0b" strokeWidth={1.5} />
          <View className="absolute top-0 right-1/4"><Sparkles size={24} color="#f59e0b" /></View>
          <View className="absolute bottom-2 left-1/4"><Sparkles size={16} color="#f59e0b" /></View>
        </Animated.View>
        {isLoading ? <View className="py-10 items-center"><ActivityIndicator color={palette.primary} /><Text className="mt-3 text-slate-500">Cargando planes...</Text></View> : null}
        {error ? <Text className="text-rose-600">{error}</Text> : null}
        <Text className="text-center text-slate-800 text-lg mb-8">
          Desbloquea todo el potencial de{`\n`}
          <Text className="text-2xl font-semibold tracking-tight" style={{ color: palette.primaryText }}>EmprendeX</Text>
        </Text>
        <Animated.View className="mb-10 px-2 space-y-4" entering={sectionEntering(3)}>
          {highlightedFeatures.map((feature) => <View key={feature} className="flex-row items-center mb-3"><Check size={20} color="#10b981" className="mr-3" /><Text className="text-slate-700 text-base">{feature}</Text></View>)}
        </Animated.View>
        {availablePrices.length > 0 ? (
          <Animated.View className="flex-row justify-between mb-8" entering={sectionEntering(4)}>
            {availablePrices.slice(0, 2).map((price) => {
              const isSelected = selectedPlan === price.period;

              return (
                <AnimatedTouchableOpacity key={price.id} className="w-[48%] p-4 rounded-2xl border-2" style={{ borderColor: isSelected ? palette.primary : '#f1f5f9', backgroundColor: isSelected ? palette.primarySoft : '#ffffff' }} onPress={() => setSelectedPlan(price.period)} layout={smoothLayout}><Text className="font-semibold mb-2" style={{ color: isSelected ? palette.primaryText : '#1e293b' }}>{price.period}</Text><Text className="text-2xl font-semibold text-slate-800">{formatCurrencyValue(price.price)}</Text></AnimatedTouchableOpacity>
              );
            })}
          </Animated.View>
        ) : null}
        <TouchableOpacity className="w-full py-4 rounded-xl items-center shadow-md mb-6" style={{ backgroundColor: palette.primary, shadowColor: palette.shadow }}><Text className="text-white font-semibold text-lg">Activar Plan Pro</Text></TouchableOpacity>
        <TouchableOpacity className="items-center pb-8" onPress={() => router.back()}><Text className="font-medium" style={{ color: palette.primaryText }}>Ahora no, continuar gratis</Text></TouchableOpacity>
      </Animated.ScrollView>
    </Animated.View>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, Check, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { AnimatedTouchableOpacity, screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';
import { useAuthSession } from '@/lib/auth-session-context';
import { fetchPlanes, getReadablePlanesError, type Plan } from '@/lib/planes';

export default function PlanProScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accessToken } = useAuthSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('Mensual');
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

  const proPlan = useMemo(() => plans.find((plan) => plan.name.toLowerCase() === 'pro') ?? null, [plans]);
  const monthlyPrice = proPlan?.prices.find((price) => price.period === 'Mensual');
  const yearlyPrice = proPlan?.prices.find((price) => price.period === 'Anual');
  const features = ['Módulos ilimitados', 'Reportes avanzados', 'Calendario inteligente', 'Exportación de datos', 'Soporte prioritario'];

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between" style={{ paddingTop: Math.max(insets.top, 16) + 16 }} entering={sectionEntering(0)}>
        <View className="flex-row items-center"><TouchableOpacity onPress={() => router.back()} className="mr-4"><ArrowLeft color="white" size={24} /></TouchableOpacity><Text className="text-white text-xl font-bold">Plan Pro</Text></View>
      </Animated.View>
      <Animated.ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }} entering={sectionEntering(1)}>
        <Animated.View className="items-center justify-center mb-8 relative" entering={sectionEntering(2)}>
          <Crown size={80} color="#f59e0b" strokeWidth={1.5} />
          <View className="absolute top-0 right-1/4"><Sparkles size={24} color="#f59e0b" /></View>
          <View className="absolute bottom-2 left-1/4"><Sparkles size={16} color="#f59e0b" /></View>
        </Animated.View>
        {isLoading ? <View className="py-10 items-center"><ActivityIndicator color="#7c3aed" /><Text className="mt-3 text-slate-500">Cargando planes...</Text></View> : null}
        {error ? <Text className="text-rose-600">{error}</Text> : null}
        <Text className="text-center text-slate-800 text-lg mb-8">
          Desbloquea todo el potencial de{`\n`}
          <Text className="text-2xl font-extrabold text-violet-900 tracking-tight">EmprendeX</Text>
        </Text>
        <Animated.View className="mb-10 px-2 space-y-4" entering={sectionEntering(3)}>
          {features.map((feature) => <View key={feature} className="flex-row items-center mb-3"><Check size={20} color="#10b981" className="mr-3" /><Text className="text-slate-700 text-base">{feature}</Text></View>)}
        </Animated.View>
        <Animated.View className="flex-row justify-between mb-8" entering={sectionEntering(4)}>
          <AnimatedTouchableOpacity className={`w-[48%] p-4 rounded-2xl border-2 ${selectedPlan === 'Mensual' ? 'border-violet-600 bg-violet-50' : 'border-slate-100 bg-white'}`} onPress={() => setSelectedPlan('Mensual')} layout={smoothLayout}><Text className={`font-bold mb-2 ${selectedPlan === 'Mensual' ? 'text-violet-900' : 'text-slate-800'}`}>Mensual</Text><Text className="text-2xl font-extrabold text-slate-800">S/ {monthlyPrice?.price ?? '0.00'}</Text></AnimatedTouchableOpacity>
          <AnimatedTouchableOpacity className={`w-[48%] p-4 rounded-2xl border-2 ${selectedPlan === 'Anual' ? 'border-violet-600 bg-violet-50' : 'border-slate-100 bg-slate-50'}`} onPress={() => setSelectedPlan('Anual')} layout={smoothLayout}><Text className={`font-bold mb-2 ${selectedPlan === 'Anual' ? 'text-violet-900' : 'text-slate-600'}`}>Anual</Text><Text className="text-2xl font-extrabold text-slate-800 mb-1">S/ {yearlyPrice?.price ?? '0.00'}</Text></AnimatedTouchableOpacity>
        </Animated.View>
        <TouchableOpacity className="bg-violet-600 w-full py-4 rounded-xl items-center shadow-md shadow-violet-200 mb-6"><Text className="text-white font-bold text-lg">Activar Plan Pro</Text></TouchableOpacity>
        <TouchableOpacity className="items-center pb-8" onPress={() => router.back()}><Text className="text-violet-600 font-medium">Ahora no, continuar gratis</Text></TouchableOpacity>
      </Animated.ScrollView>
    </Animated.View>
  );
}

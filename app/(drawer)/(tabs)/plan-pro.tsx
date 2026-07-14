import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Animated as RNAnimated, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Lock, Shield, Star, RotateCw, Pause, ArrowLeftRight, Info, Crown, CreditCard, Banknote } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/lib/auth-session-context';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { upgradeToPro, downgradeToBasic } from '@/lib/subscriptions';
import Animated, { screenEntering } from '@/components/ui/motion';
import { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

type FlowStep = 'MANAGEMENT' | 'SELECTION' | 'CONFIRMATION' | 'MERCADOPAGO' | 'SUCCESS';

function formatEndsAt(isoDate: string): string {
  const date = new Date(isoDate);
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function daysUntil(isoDate: string): number {
  const now = new Date();
  const end = new Date(isoDate);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function PlanProScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { authState, accessToken, updateAuthState } = useAuthSession();
  const { palette } = useAccountPreferences();

  const isPremium = authState?.user.activeSubscription?.isPremium === true;
  const subscription = authState?.user.activeSubscription;

  const initialStep: FlowStep = isPremium ? 'MANAGEMENT' : 'SELECTION';
  const [currentStep, setCurrentStep] = useState<FlowStep>(initialStep);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const renewalDays = subscription?.endsAt ? daysUntil(subscription.endsAt) : 0;
  const renewalDateFormatted = subscription?.endsAt ? formatEndsAt(subscription.endsAt) : '';

  const [renewSuccess, setRenewSuccess] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const confettiPieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    color: ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#a78bfa', '#fb923c', '#f87171', '#2dd4bf'][i % 8],
    x: Math.random() * screenWidth,
    delay: Math.random() * 3000,
    size: 6 + Math.random() * 10,
  })), [screenWidth]);
  const [cancelStep, setCancelStep] = useState<'idle' | 'done'>('idle');

  const handleRenew = () => {
    Alert.alert('Renovar suscripción', '¿Deseas renovar tu suscripción de manera anticipada?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Renovar ahora', onPress: () => setRenewSuccess(true) },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancelar suscripción', `¿Estás seguro de que deseas cancelar? Seguirás disfrutando de ${isPremium ? 'PRO' : 'tu plan actual'} hasta el ${renewalDateFormatted}.`, [
      { text: 'Mantener plan', style: 'cancel' },
      { text: 'Confirmar cancelación', style: 'destructive', onPress: () => setCancelStep('done') },
    ]);
  };



  const handleBack = async () => {
    if (currentStep === 'MANAGEMENT') {
      router.replace('/(drawer)/(tabs)/configuracion');
    } else if (currentStep === 'SELECTION') {
      setCurrentStep('MANAGEMENT');
    } else if (currentStep === 'CONFIRMATION') {
      setCurrentStep('SELECTION');
    } else if (currentStep === 'MERCADOPAGO') {
      setCurrentStep('CONFIRMATION');
    } else if (currentStep === 'SUCCESS') {
      setCurrentStep('MANAGEMENT');
    }
  };

  const handleUpgrade = async () => {
    if (!accessToken || isUpgrading) {
      return;
    }

    setIsUpgrading(true);
    setUpgradeError(null);

    try {
      const updatedUser = await upgradeToPro(accessToken);

      if (authState) {
        updateAuthState({
          ...authState,
          user: updatedUser,
        });
      }

      setCurrentStep('SUCCESS');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo completar la actualización. Intenta de nuevo.';
      setUpgradeError(message);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!accessToken || isUpgrading) return;

    setIsUpgrading(true);
    setUpgradeError(null);

    try {
      const updatedUser = await downgradeToBasic(accessToken);

      if (authState) {
        updateAuthState({
          ...authState,
          user: updatedUser,
        });
      }

      setCurrentStep('MANAGEMENT');
    } catch (error: unknown) {
      setUpgradeError(error instanceof Error ? error.message : 'No se pudo completar la operación.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const topBarColor = palette.primary;

  const renderManagement = () => (
    <Animated.View className="flex-1" entering={screenEntering} key="management">
      <View className="px-5 pb-4" style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: topBarColor }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 mr-2">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Text className="text-white text-xl font-bold mr-2">Mi Plan</Text>
            <View className="border border-white/40 rounded-full px-2 py-0.5">
              <Text className="text-white text-[10px] font-bold">{isPremium ? 'PRO' : 'BÁSICO'}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-[28px] border-2 bg-white p-6 mb-4" style={{ borderColor: palette.primary }}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: palette.primary }}>
                <Crown size={22} color="white" />
              </View>
              <View>
                <Text className="text-sm text-slate-500">Plan actual</Text>
                <Text className="text-xl font-bold text-slate-800">{isPremium ? 'PRO' : 'Básico'}</Text>
              </View>
            </View>
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: palette.primary }}>
              <Text className="text-white text-xs font-bold">Activo</Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1 rounded-2xl bg-slate-50 p-3 mr-2">
              <Text className="text-xs text-slate-500">Precio</Text>
              <Text className="text-base font-bold text-slate-800">S/ {isPremium ? subscription?.price ?? '29.90' : '0'}</Text>
              <Text className="text-xs text-slate-400">/ mes</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-slate-50 p-3 ml-2">
              <Text className="text-xs text-slate-500">Renovación</Text>
              <Text className="text-base font-bold text-slate-800">{renewalDateFormatted}</Text>
              <Text className="text-xs text-slate-400">en {renewalDays} días</Text>
            </View>
          </View>
        </View>

        <View className="rounded-[28px] border border-slate-200 bg-white p-5 mb-4">
          {renewSuccess ? (
            <View className="rounded-2xl bg-emerald-50 p-4 flex-row items-center">
              <Check size={18} color="#10b981" />
              <Text className="text-sm font-semibold text-emerald-800 ml-2">Suscripción renovada</Text>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={handleRenew}
              activeOpacity={0.7}
            >
              <View className="h-10 w-10 rounded-xl items-center justify-center bg-emerald-50 mr-3">
                <RotateCw size={20} color="#10b981" />
              </View>
              <Text className="text-sm font-semibold text-slate-800 flex-1">Renovar ahora</Text>
              <Text className="text-slate-400 text-lg">›</Text>
            </TouchableOpacity>
          )}

          {cancelStep === 'done' ? (
            <View className="rounded-2xl bg-amber-50 p-4 flex-row items-center mt-2">
              <Info size={18} color="#d97706" />
              <Text className="text-sm font-semibold text-amber-800 ml-2 flex-1">Cancelación programada</Text>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center py-2 border-t border-slate-50"
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <View className="h-10 w-10 rounded-xl items-center justify-center bg-amber-50 mr-3">
                <Pause size={20} color="#f59e0b" />
              </View>
              <Text className="text-sm font-semibold text-slate-800 flex-1">Cancelar suscripción</Text>
              <Text className="text-slate-400 text-lg">›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-row items-center py-2 border-t border-slate-50"
            onPress={() => setCurrentStep('SELECTION')}
            activeOpacity={0.7}
          >
            <View className="h-10 w-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}>
              <ArrowLeftRight size={20} color={palette.primary} />
            </View>
            <Text className="text-sm font-semibold text-slate-800 flex-1">Cambiar de plan</Text>
            <Text className="text-slate-400 text-lg">›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderSelection = () => (
    <Animated.View className="flex-1" entering={SlideInRight} exiting={SlideOutLeft} key="selection">
      <View className="px-5 pb-4" style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: topBarColor }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 mr-2">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Elegir plan</Text>
        </View>
      </View>

      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text className="text-xl font-bold text-slate-800 text-center mb-2">Elige el plan ideal</Text>
        <Text className="text-slate-500 text-center text-sm mb-6">Herramientas avanzadas para hacer crecer tu negocio</Text>

        <View className="rounded-[28px] border border-slate-200 bg-white p-5 mb-4">
          <View className="items-center mb-4">
            <View className="h-14 w-14 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: palette.primarySoft }}>
              <View className="h-7 w-7 border-2 rounded-md" style={{ borderColor: palette.primary }} />
            </View>
            <Text className="text-xl font-bold text-slate-800">Plan Gratis</Text>
            <Text className="text-sm text-slate-500 mt-1">S/ 0 / mes</Text>
          </View>

          <View className="rounded-2xl bg-slate-50 p-4 mb-4">
            <View className="flex-row flex-wrap">
              {['Clientes', 'Cotizaciones', 'Pedidos', 'Pagos', 'Inventario básico', 'Reportes básicos'].map((item, i) => (
                <View key={item} className="flex-row items-center w-1/2 mb-2">
                  <Check size={14} color={palette.primary} />
                  <Text className="text-xs text-slate-600 ml-2">{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {isPremium ? (
            <TouchableOpacity
              className="rounded-2xl border border-slate-200 bg-white py-3.5 items-center"
              onPress={() => {
                Alert.alert('Cambiar a plan Gratis', 'Si cambias a Gratis, perderás acceso a los módulos premium al finalizar tu período actual.', [
                  { text: 'Mantenerme en PRO', style: 'cancel' },
                  { text: 'Cambiar a Gratis', style: 'destructive', onPress: () => { void handleDowngrade(); } },
                ]);
              }}
            >
              <Text className="text-slate-600 font-semibold text-sm">Cambiar a Gratis</Text>
            </TouchableOpacity>
          ) : (
            <View className="rounded-2xl bg-slate-100 py-3.5 items-center">
              <Text className="text-slate-500 font-semibold text-sm">Plan actual</Text>
            </View>
          )}
        </View>

        <View className="rounded-[28px] border-2 bg-white p-5 mb-4 relative overflow-hidden" style={{ borderColor: palette.primary }}>
          <View className="absolute top-4 right-4">
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: palette.primary }}>
              <Text className="text-white text-[10px] font-bold">Recomendado</Text>
            </View>
          </View>

          <View className="items-center mb-4 mt-2">
            <View className="h-14 w-14 rounded-2xl items-center justify-center mb-3 bg-amber-50">
              <Star size={26} color="#f59e0b" />
            </View>
            <Text className="text-xl font-bold text-slate-800">Plan Pro</Text>
            <Text className="text-sm text-slate-500 mt-1">S/ 29.90 / mes</Text>
          </View>

          <Text className="text-xs font-semibold text-slate-500 mb-3">Todo del plan Gratis, más:</Text>
          <View className="rounded-2xl bg-slate-50 p-4 mb-4">
            <View className="flex-row flex-wrap">
              {['Calendario', 'Reportes avanzados', 'Análisis e IA', 'Exportar a Excel', 'Estadísticas', 'Soporte prioritario'].map((item, i) => (
                <View key={item} className="flex-row items-center w-1/2 mb-2">
                  <Check size={14} color="#10b981" />
                  <Text className="text-xs text-slate-700 font-medium ml-2">{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            className="rounded-2xl py-3.5 items-center"
            style={{ backgroundColor: palette.primary }}
            onPress={() => setCurrentStep('CONFIRMATION')}
          >
            <Text className="text-white font-bold text-sm">Actualizar a Pro</Text>
          </TouchableOpacity>
        </View>

        <View className="rounded-2xl p-4 flex-row items-center" style={{ backgroundColor: palette.primarySoft }}>
          <Shield size={22} color={palette.primary} />
          <View className="ml-3 flex-1">
            <Text className="text-slate-800 font-semibold text-sm">Sin contratos</Text>
            <Text className="text-slate-500 text-xs">Cancela cuando quieras. Se renueva automáticamente.</Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderConfirmation = () => (
    <Animated.View className="flex-1" entering={SlideInRight} exiting={SlideOutLeft} key="confirmation">
      <View className="px-5 pb-4" style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: topBarColor }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 mr-2">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Confirmar plan</Text>
        </View>
      </View>

      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View className="rounded-[28px] border border-slate-200 bg-white p-5 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-slate-800 text-base">Resumen</Text>
            <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: palette.primary }}>
              <Text className="text-white text-xs font-bold">PRO</Text>
            </View>
          </View>

          <View className="rounded-2xl bg-slate-50 p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-600 text-sm">Plan Pro · Mensual</Text>
              <Text className="font-semibold text-slate-800">S/ 29.90</Text>
            </View>
            <View className="h-px bg-slate-200 mb-3" />
            <View className="flex-row justify-between items-center">
              <Text className="font-semibold text-slate-700">Total a pagar</Text>
              <Text className="font-bold text-xl" style={{ color: palette.primary }}>S/ 29.90</Text>
            </View>
          </View>
        </View>

        <View className="rounded-[28px] border border-slate-200 bg-white p-5 mb-4">
          <Text className="font-bold text-slate-800 text-base mb-4">Pago con MercadoPago</Text>

          <View className="bg-slate-50 rounded-2xl p-4 items-center mb-4">
            <View className="flex-row items-center mb-3">
              <Image
                source={{ uri: 'https://http2.mlstatic.com/frontend-assets/ui-navigation/5.19.1/mercadopago/logo__small.png' }}
                style={{ width: 40, height: 40, borderRadius: 8 }}
                resizeMode="contain"
              />
              <Text className="font-bold text-slate-700 text-sm ml-2">MercadoPago</Text>
            </View>
            <Lock size={14} color="#64748b" />
            <Text className="text-xs text-slate-500 mt-1">Pago seguro procesado por MercadoPago</Text>
          </View>

          <TouchableOpacity
            className="rounded-2xl py-3.5 items-center"
            style={{ backgroundColor: palette.primary }}
            onPress={() => setCurrentStep('MERCADOPAGO')}
          >
            <View className="flex-row items-center">
              <Lock size={16} color="white" />
              <Text className="text-white font-bold text-sm ml-2">Pagar con MercadoPago</Text>
            </View>
          </TouchableOpacity>

          <Text className="text-center text-xs text-slate-400 mt-3">Serás redirigido al checkout seguro</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderMercadoPago = () => (
    <Animated.View className="flex-1 bg-white" entering={SlideInRight} exiting={SlideOutLeft} key="mercadopago">
      <View style={{ paddingTop: Math.max(insets.top, 12), backgroundColor: '#009ee3', paddingBottom: 12 }}>
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleBack} disabled={isUpgrading}>
            <Text className="text-white font-medium text-sm">Cancelar</Text>
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Image
              source={{ uri: 'https://http2.mlstatic.com/frontend-assets/ui-navigation/5.19.1/mercadopago/logo__small.png' }}
              style={{ width: 36, height: 36, borderRadius: 6 }}
              resizeMode="contain"
            />
          </View>
          <View style={{ width: 60 }} />
        </View>
      </View>

      <ScrollView className="flex-1 bg-[#f5f5f5]" contentContainerStyle={{ padding: 16 }}>
        {isUpgrading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={palette.primary} />
            <Text className="text-slate-600 font-medium mt-4 text-base">Procesando tu suscripción Pro...</Text>
            <Text className="text-slate-400 text-sm mt-1">Esto tomará solo un momento</Text>
          </View>
        ) : (
          <>
            {upgradeError ? (
              <View className="mb-4 rounded-xl bg-rose-50 px-4 py-3">
                <Text className="text-sm font-medium text-rose-600">{upgradeError}</Text>
              </View>
            ) : null}

            <View className="bg-white rounded-2xl p-5 mb-4">
              <View className="mb-4">
                <Text className="text-base font-semibold text-slate-800">Plan Pro · Mensual</Text>
                <Text className="text-xs text-slate-500">Suscripción renovable</Text>
              </View>

              <View className="rounded-xl bg-slate-50 p-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-slate-600">Subtotal</Text>
                  <Text className="text-sm text-slate-800">S/ 29.90</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-slate-600">Impuestos</Text>
                  <Text className="text-sm text-slate-800">S/ 0.00</Text>
                </View>
                <View className="h-px bg-slate-200 my-3" />
                <View className="flex-row justify-between">
                  <Text className="font-semibold text-slate-800">Total</Text>
                  <Text className="font-bold text-lg text-slate-800">S/ 29.90</Text>
                </View>
              </View>
            </View>

            <Text className="font-semibold text-slate-800 text-base mb-3 ml-1">Método de pago</Text>

            <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-3.5 border-b border-slate-100"
                onPress={() => { void handleUpgrade(); }}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 items-center justify-center mr-3">
                    <CreditCard size={22} color="#1a1f71" />
                  </View>
                  <Text className="text-sm font-medium text-slate-800">Tarjeta de crédito o débito</Text>
                </View>
                <Text className="text-slate-400 text-lg">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-3.5 border-b border-slate-100"
                onPress={() => { void handleUpgrade(); }}
              >
                <View className="flex-row items-center">
                  <Image source={{ uri: 'https://http2.mlstatic.com/frontend-assets/ui-navigation/5.19.1/mercadopago/logo__small.png' }} style={{ width: 28, height: 28, borderRadius: 6, marginRight: 12 }} resizeMode="contain" />
                  <Text className="text-sm font-medium text-slate-800">Saldo de MercadoPago</Text>
                </View>
                <Text className="text-slate-400 text-lg">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-3.5"
                onPress={() => { void handleUpgrade(); }}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 items-center justify-center mr-3">
                    <Banknote size={22} color="#10b981" />
                  </View>
                  <Text className="text-sm font-medium text-slate-800">Pago Efectivo</Text>
                </View>
                <Text className="text-slate-400 text-lg">›</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center mb-6">
              <Lock size={12} color="#94a3b8" />
              <Text className="text-xs text-slate-400 ml-1">Pago seguro procesado por MercadoPago</Text>
            </View>
          </>
        )}
      </ScrollView>
    </Animated.View>
  );

  function ConfettiPiece({ color, x, delay, size }: { color: string; x: number; delay: number; size: number }) {
    const fallAnim = React.useRef(new RNAnimated.Value(0)).current;
    const spinAnim = React.useRef(new RNAnimated.Value(0)).current;

    React.useEffect(() => {
      const loop = RNAnimated.loop(
        RNAnimated.parallel([
          RNAnimated.sequence([
            RNAnimated.delay(delay),
            RNAnimated.timing(fallAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
          ]),
          RNAnimated.sequence([
            RNAnimated.delay(delay),
            RNAnimated.timing(spinAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
          ]),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }, [delay, fallAnim, spinAnim]);

    const translateY = fallAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 500] });
    const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });
    const opacity = fallAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0.2] });

    const shapes = ['rounded-full', 'rounded-sm'];
    const shape = shapes[size > 8 ? 0 : 1];

    return (
      <RNAnimated.View
        className={`absolute ${shape}`}
        style={{
          left: x,
          width: size,
          height: size,
          backgroundColor: color,
          transform: [{ translateY }, { rotate }],
          opacity,
        }}
      />
    );
  }

  const renderSuccess = () => (
    <Animated.View className="flex-1" style={{ backgroundColor: palette.primary }} entering={FadeIn.delay(200)} exiting={FadeOut} key="success">
      <View className="absolute inset-0 overflow-hidden">
        {confettiPieces.map((p, i) => (
          <ConfettiPiece key={i} color={p.color} x={p.x} delay={p.delay} size={p.size} />
        ))}
      </View>

      <View className="flex-1 items-center justify-center px-8" style={{ paddingTop: Math.max(insets.top, 40) }}>
          <View className="h-24 w-24 bg-white rounded-full items-center justify-center shadow-2xl mb-8">
            <Check size={44} color="#10b981" strokeWidth={3} />
          </View>

          <Text className="text-white text-3xl font-bold text-center mb-3">¡Bienvenido a PRO!</Text>
          <Text className="text-white/80 text-center text-base mb-10">
            Todas las herramientas premium están activadas.
          </Text>

          <TouchableOpacity
            className="bg-white py-4 rounded-2xl items-center w-full"
            onPress={handleBack}
          >
            <Text className="font-bold text-base" style={{ color: palette.primary }}>Comenzar</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mt-4" onPress={handleBack}>
            <Text className="text-white/70 font-medium text-sm">Ir al inicio</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
  );

  return (
    <View className="flex-1 bg-white">
      {currentStep === 'MANAGEMENT' && renderManagement()}
      {currentStep === 'SELECTION' && renderSelection()}
      {currentStep === 'CONFIRMATION' && renderConfirmation()}
      {currentStep === 'MERCADOPAGO' && renderMercadoPago()}
      {currentStep === 'SUCCESS' && renderSuccess()}
    </View>
  );
}

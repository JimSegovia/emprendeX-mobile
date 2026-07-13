import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Lock, Shield, Sparkles, CreditCard, Star, Calendar, PieChart, Download, BarChart2, Bell, Headset, RotateCw, Pause, ArrowLeftRight, Info, Crown, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/lib/auth-session-context';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { upgradeToPro } from '@/lib/subscriptions';
import Animated, { screenEntering } from '@/components/ui/motion';
import { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

type FlowStep = 'MANAGEMENT' | 'SELECTION' | 'CONFIRMATION' | 'MERCADOPAGO' | 'SUCCESS';

const MOCK_PAYMENT_HISTORY = [
  { id: '1', date: '15 May 2025', label: 'Plan PRO - Mensual', amount: 'S/ 29.90', status: 'Pagado' },
  { id: '2', date: '15 Abr 2025', label: 'Plan PRO - Mensual', amount: 'S/ 29.90', status: 'Pagado' },
  { id: '3', date: '15 Mar 2025', label: 'Plan PRO - Mensual', amount: 'S/ 29.90', status: 'Pagado' },
];

const PRO_FEATURES = [
  { icon: TrendingUp, label: 'Reportes\navanzados' },
  { icon: Calendar, label: 'Calendario' },
  { icon: Sparkles, label: 'Análisis con\nIA' },
  { icon: Download, label: 'Exportar a\nExcel' },
  { icon: Bell, label: 'Recordatorios\nilimitados' },
  { icon: Headset, label: 'Soporte\nprioritario' },
];

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
  const { authState, accessToken, updateAuthState, refreshAuthState } = useAuthSession();
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
  const [cancelStep, setCancelStep] = useState<'idle' | 'done'>('idle');

  const handleRenew = () => {
    Alert.alert('Renovar suscripción', '¿Deseas renovar tu suscripción de manera anticipada?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Renovar ahora', onPress: () => setRenewSuccess(true) },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancelar suscripción', `¿Estás seguro de que deseas cancelar? Seguirás disfrutando de PRO hasta el ${renewalDateFormatted}.`, [
      { text: 'Mantener plan', style: 'cancel' },
      { text: 'Confirmar cancelación', style: 'destructive', onPress: () => setCancelStep('done') },
    ]);
  };

  const handleBack = async () => {
    if (currentStep === 'MANAGEMENT' || currentStep === 'SELECTION') {
      router.back();
    } else if (currentStep === 'CONFIRMATION') {
      setCurrentStep(isPremium ? 'MANAGEMENT' : 'SELECTION');
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

  const topBarColor = palette.primaryDark;

  const renderManagement = () => (
    <Animated.View className="flex-1" entering={screenEntering} key="management">
      <View style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: topBarColor, paddingBottom: 20 }}>
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 mr-2">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center">
            <Text className="text-white text-xl font-bold">Mi Plan</Text>
            <View className="ml-3 rounded-full bg-amber-100 px-2 py-0.5">
              <Text className="text-xs font-bold text-amber-800">PRO</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 bg-[#f8fafc]" contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Plan actual card */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View className="h-14 w-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: palette.primary }}>
                <Crown size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-slate-500 font-medium">Plan actual</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-2xl font-bold text-slate-800">PRO</Text>
                  <View className="ml-2 rounded-full px-2.5 py-0.5" style={{ backgroundColor: palette.primary }}>
                    <Text className="text-white text-xs font-bold">Activo</Text>
                  </View>
                </View>
                <Text className="text-sm text-slate-500 mt-1 leading-5">Disfruta de todas las funcionalidades premium de tu negocio.</Text>
              </View>
            </View>
          </View>

          <View className="h-[1px] bg-slate-100 mb-4" />

          <View className="flex-row">
            <View className="flex-1 flex-row items-start">
              <View className="h-10 w-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}>
                <Calendar size={20} color={palette.primary} />
              </View>
              <View>
                <Text className="text-xs text-slate-500">Próxima renovación</Text>
                <Text className="text-sm font-bold text-slate-800 mt-0.5">{renewalDateFormatted}</Text>
                <Text className="text-xs font-semibold mt-0.5" style={{ color: palette.primary }}>(en {renewalDays} días)</Text>
              </View>
            </View>
          </View>

          <View className="mt-4 rounded-2xl px-4 py-3 flex-row items-center" style={{ backgroundColor: palette.primarySoft }}>
            <View style={{ marginRight: 10 }}>
              <Info size={18} color={palette.primary} />
            </View>
            <Text className="text-sm font-medium flex-1" style={{ color: palette.primaryText }}>
              Tu plan se renovará automáticamente por S/ {subscription?.price ?? '29.90'}.
            </Text>
          </View>
        </View>

        {/* Acciones */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
          <Text className="text-base font-bold text-slate-800 mb-4">Acciones</Text>

          {renewSuccess ? (
            <View className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex-row items-center mb-3">
              <Check size={18} color="#10b981" style={{ marginRight: 8 }} />
              <Text className="text-sm font-semibold text-emerald-800 flex-1">Suscripción renovada exitosamente</Text>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 border-b border-slate-100"
              onPress={handleRenew}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className="h-10 w-10 rounded-xl items-center justify-center mr-3 bg-emerald-50">
                  <RotateCw size={20} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-800">Renovar ahora</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Renueva tu suscripción de manera anticipada.</Text>
                </View>
              </View>
              <Text className="text-slate-400 text-lg ml-2">›</Text>
            </TouchableOpacity>
          )}

          {cancelStep === 'done' ? (
            <View className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex-row items-center mb-3">
              <Info size={18} color="#d97706" style={{ marginRight: 8 }} />
              <Text className="text-sm font-semibold text-amber-800 flex-1">Cancelación programada para el {renewalDateFormatted}</Text>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 border-b border-slate-100"
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className="h-10 w-10 rounded-xl items-center justify-center mr-3 bg-amber-50">
                  <Pause size={20} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-800">Cancelar suscripción</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">Cancelar al finalizar el período actual.</Text>
                </View>
              </View>
              <Text className="text-slate-400 text-lg ml-2">›</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={() => setCurrentStep('SELECTION')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <View className="h-10 w-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}>
                <ArrowLeftRight size={20} color={palette.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-800">Cambiar de plan</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Ver otros planes disponibles.</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-lg ml-2">›</Text>
          </TouchableOpacity>
        </View>

        {/* Incluido en tu plan PRO */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
          <Text className="text-base font-bold text-slate-800 mb-4">Incluido en tu plan PRO</Text>
          <View className="flex-row flex-wrap justify-between">
            {PRO_FEATURES.map((feature, index) => (
              <View key={feature.label} className="items-center mb-4" style={{ width: '30%' }}>
                <View className="h-12 w-12 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: palette.primarySoft }}>
                  <feature.icon size={22} color={palette.primary} />
                </View>
                <Text className="text-[11px] font-semibold text-slate-700 text-center leading-4">{feature.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Historial de pagos */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-bold text-slate-800">Historial de pagos</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-sm font-semibold" style={{ color: palette.primary }}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {MOCK_PAYMENT_HISTORY.map((payment, index) => (
            <View key={payment.id} className={`flex-row items-center justify-between py-3 ${index < MOCK_PAYMENT_HISTORY.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <View className="flex-row items-center flex-1">
                <View className="h-9 w-9 rounded-full bg-emerald-50 items-center justify-center mr-3">
                  <Check size={16} color="#10b981" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-800">{payment.date}</Text>
                  <Text className="text-xs text-slate-500">{payment.label}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-sm font-bold text-slate-800">{payment.amount}</Text>
                <Text className="text-xs font-semibold text-emerald-600">{payment.status}</Text>
              </View>
              <Text className="text-slate-400 text-lg ml-3">›</Text>
            </View>
          ))}
        </View>

        {/* ¿Qué sucede si cancelas? */}
        <View className="rounded-3xl p-5 border border-amber-200 bg-amber-50">
          <View className="flex-row items-start">
            <View className="h-8 w-8 rounded-full bg-amber-100 items-center justify-center mr-3 mt-0.5">
              <Info size={18} color="#d97706" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-amber-900 mb-1">¿Qué sucede si cancelas?</Text>
              <Text className="text-sm text-amber-800 leading-5">
                Seguirás disfrutando de tu plan PRO hasta el {renewalDateFormatted}. Después de esa fecha, tu cuenta se cambiará automáticamente al plan FREE.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderSelection = () => (
    <Animated.View className="flex-1" entering={SlideInRight} exiting={SlideOutLeft} key="selection">
      {/* Header */}
      <View style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: topBarColor, paddingBottom: 16 }}>
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 mr-2">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View className="flex-1 items-center mr-10">
            <Text className="text-white text-lg font-semibold">Mi Plan</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 bg-[#f8fafc]" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View className="items-center mb-8 pt-4">
          <Text className="text-xl font-bold text-slate-800 text-center mb-2">Elige el plan ideal para tu negocio</Text>
          <Text className="text-slate-500 text-center text-sm px-4">
            Actualiza a Pro y accede a herramientas avanzadas para crecer más.
          </Text>
        </View>

        <View className="flex-row justify-between mb-8 h-[440px]">
          {/* Plan Gratis */}
          <View className="w-[48%] bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex-col justify-between">
            <View>
              <View className="items-center mb-4">
                <View className="h-12 w-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: palette.primarySoft }}>
                  <View className="h-6 w-6 border-2 rounded-sm" style={{ borderColor: palette.primary }} />
                </View>
                <Text className="text-lg font-bold text-slate-800">Gratis</Text>
                <Text className="text-xs text-slate-500 font-medium mt-1"><Text className="text-lg font-bold" style={{ color: palette.primary }}>S/ 0</Text> / mes</Text>
              </View>
              <View className="space-y-3">
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Clientes</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Cotizaciones</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Pedidos</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Pagos</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Inventario básico</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Reportes básicos</Text></View>
              </View>
            </View>
            {isPremium ? (
              <TouchableOpacity
                className="rounded-2xl border border-slate-200 py-3 items-center mt-4"
                onPress={() => {
                  Alert.alert('Cambiar a plan Gratis', 'Si cambias a Gratis, perderás acceso a los módulos premium al finalizar tu período actual.', [
                    { text: 'Mantenerme en PRO', style: 'cancel' },
                    { text: 'Cambiar a Gratis', style: 'destructive', onPress: () => setCurrentStep('MANAGEMENT') },
                  ]);
                }}
              >
                <Text className="text-slate-600 font-semibold text-sm">Cambiar a Gratis</Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-slate-100 py-3 rounded-2xl items-center mt-4">
                <Text className="text-slate-500 font-semibold text-sm">Plan actual</Text>
              </View>
            )}
          </View>

          {/* Plan Pro */}
          <View className="w-[48%] bg-white rounded-3xl border-2  p-4 shadow-md flex-col justify-between relative overflow-hidden" style={{ borderColor: palette.primary }}>
            <View className="absolute top-0 inset-x-0 items-center  py-1 rounded-b-lg mx-6" style={{ backgroundColor: palette.primary }}>
              <Text className="text-white text-[9px] font-bold">MÁS POPULAR</Text>
            </View>
            <View className="mt-4">
              <View className="items-center mb-4 mt-2">
                <View className="h-12 w-12 rounded-full bg-orange-50 items-center justify-center mb-2">
                  <Star size={24} color="#f59e0b" />
                </View>
                <Text className="text-lg font-bold text-slate-800">Pro</Text>
                <Text className="text-xs text-slate-500 font-medium mt-1"><Text className="text-lg font-bold" style={{ color: palette.primary }}>S/ 29.90</Text> / mes</Text>
              </View>
              <Text className="text-[10px] font-semibold text-slate-800 mb-3 text-center">Todo lo del plan Gratis, más:</Text>
              <View className="space-y-3">
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Calendario</Text></View>
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Reportes avanzados</Text></View>
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Análisis e IA</Text></View>
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Exportar a Excel</Text></View>
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Estadísticas avanzadas</Text></View>
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Soporte prioritario</Text></View>
              </View>
            </View>
            <TouchableOpacity 
              className=" py-3 rounded-2xl items-center mt-4" style={{ backgroundColor: palette.primary }}
              onPress={() => setCurrentStep('CONFIRMATION')}
            >
              <Text className="text-white font-bold text-sm">Actualizar a Pro</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className=" rounded-2xl p-4 flex-row items-center mb-6" style={{ backgroundColor: palette.primarySoft }}>
          <Shield color={palette.primary} size={24} className="mr-4" />
          <View className="flex-1">
            <Text className="text-slate-800 font-bold text-sm mb-1">Sin contratos. Cancela cuando quieras.</Text>
            <Text className="text-slate-500 text-xs">Tu plan se renueva automáticamente cada mes.</Text>
          </View>
        </View>

        <TouchableOpacity className="items-center">
          <Text className=" font-semibold text-sm" style={{ color: palette.primary }}>¿Tienes un código de promoción?</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  const renderConfirmation = () => (
    <Animated.View className="flex-1" entering={SlideInRight} exiting={SlideOutLeft} key="confirmation">
      {/* Header */}
      <View style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: topBarColor, paddingBottom: 16 }}>
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 mr-2">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View className="flex-1 items-center mr-10">
            <Text className="text-white text-lg font-semibold">Confirmar compra</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 bg-[#f8fafc]" contentContainerStyle={{ padding: 20 }}>
        
        {/* Resumen del plan */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-bold text-slate-800 text-base">Resumen del plan</Text>
            <View className=" rounded-lg px-2 py-1" style={{ backgroundColor: palette.primary }}>
              <Text className="text-white text-xs font-bold">PRO</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Star color="#64748b" size={18} />
              <Text className="text-slate-600 ml-3 font-medium text-sm">Plan</Text>
            </View>
            <Text className="font-semibold text-slate-800">Pro</Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Calendar color="#64748b" size={18} />
              <Text className="text-slate-600 ml-3 font-medium text-sm">Duración</Text>
            </View>
            <Text className="font-semibold text-slate-800">Mensual</Text>
          </View>

          <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-slate-100">
            <View className="flex-row items-center">
              <Text className="text-slate-600 ml-8 font-medium text-sm">Precio mensual</Text>
            </View>
            <Text className="font-semibold text-slate-800">S/ 29.90</Text>
          </View>

          <View className="flex-row justify-between items-center mt-2">
            <Text className="font-semibold text-slate-600 text-base">Total a pagar</Text>
            <Text className="font-bold text-xl" style={{ color: palette.primary }}>S/ 29.90</Text>
          </View>
        </View>

        {/* Método de pago */}
        <Text className="font-bold text-slate-800 text-base mb-4 ml-1">Método de pago</Text>
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-8 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-10 w-10 bg-blue-50 rounded-full items-center justify-center mr-4">
              <View className="h-5 w-5 bg-blue-500 rounded-sm" />
            </View>
            <View>
              <Text className="font-bold text-slate-800 text-sm">MercadoPago</Text>
              <Text className="text-xs text-slate-500">Paga de forma segura</Text>
            </View>
          </View>
          <View className="h-5 w-5 rounded-full border-2  items-center justify-center" style={{ borderColor: palette.primary }}>
            <View className="h-2.5 w-2.5 rounded-full " style={{ backgroundColor: palette.primary }} />
          </View>
        </View>

        {/* Beneficios */}
        <View className="space-y-4 mb-10 px-2">
          <View className="flex-row items-start">
            <View className="mt-0.5 mr-4  p-1.5 rounded-lg" style={{ backgroundColor: palette.primarySoft }}><Sparkles size={16} color={palette.primary} /></View>
            <View>
              <Text className="font-semibold text-slate-800 text-sm">Accede a mdulos premium</Text>
              <Text className="text-xs text-slate-500 mt-1">Calendario, Reportes, IA y más.</Text>
            </View>
          </View>
          <View className="flex-row items-start">
            <View className="mt-0.5 mr-4  p-1.5 rounded-lg" style={{ backgroundColor: palette.primarySoft }}><Star size={16} color={palette.primary} /></View>
            <View>
              <Text className="font-semibold text-slate-800 text-sm">Cancela cuando quieras</Text>
              <Text className="text-xs text-slate-500 mt-1">Sin contratos ni permanencias.</Text>
            </View>
          </View>
          <View className="flex-row items-start">
            <View className="mt-0.5 mr-4 bg-emerald-100 p-1.5 rounded-lg"><Shield size={16} color="#10b981" /></View>
            <View>
              <Text className="font-semibold text-slate-800 text-sm">Pago 100% seguro</Text>
              <Text className="text-xs text-slate-500 mt-1">Procesado por MercadoPago.</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          className=" py-4 rounded-2xl items-center flex-row justify-center" style={{ backgroundColor: palette.primary }}
          onPress={() => setCurrentStep('MERCADOPAGO')}
        >
          <Lock size={18} color="white" className="mr-2" />
          <Text className="text-white font-bold text-base">Continuar con MercadoPago</Text>
        </TouchableOpacity>
        
        <Text className="text-center text-xs text-slate-500 mt-4 px-6">
          Serás redirigido al checkout seguro de MercadoPago.
        </Text>

      </ScrollView>
    </Animated.View>
  );

  const renderMercadoPago = () => (
    <Animated.View className="flex-1 bg-[#f5f5f5]" entering={SlideInRight} exiting={SlideOutLeft} key="mercadopago">
      {/* Mock Browser Header */}
      <View style={{ paddingTop: Math.max(insets.top, 10), backgroundColor: '#ffffff', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleBack} disabled={isUpgrading}><Text className="text-blue-500 font-medium text-sm">Cancelar</Text></TouchableOpacity>
          <View className="flex-1 flex-row items-center justify-center">
            <Lock size={10} color="#333" className="mr-1" />
            <Text className="text-slate-800 text-[11px] font-medium">checkout.mercadopago.com</Text>
          </View>
          <RotateCw size={16} color="#333" />
        </View>
      </View>

      {/* MP Header */}
      <View className="bg-[#009ee3] pt-6 pb-4">
        <View className="items-center mb-6">
          <Text className="text-white font-bold text-xl italic tracking-wider">mercado</Text>
          <Text className="text-white font-bold text-xl italic tracking-wider -mt-2">pago</Text>
        </View>
        <View className="flex-row items-center justify-between bg-[#0086c9] px-4 py-3">
          <View className="flex-row items-center">
            <View className="h-4 w-4 border border-white rounded-full items-center justify-center mr-2"/>
            <Text className="text-white font-medium text-sm">Detalle de tu compra</Text>
          </View>
          <Lock size={14} color="white" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {isUpgrading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={palette.primary} />
            <Text className="text-slate-600 font-medium mt-4 text-base">Procesando tu suscripción Pro...</Text>
            <Text className="text-slate-400 text-sm mt-1">Esto tomará solo un momento</Text>
          </View>
        ) : (
          <>

        {upgradeError ? (
          <View className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
            <Text className="text-sm font-medium text-rose-600">{upgradeError}</Text>
          </View>
        ) : null}
        {/* Order details */}
        <View className="bg-white rounded-lg p-5 shadow-sm mb-6 border border-slate-100">
          <View className="flex-row justify-between mb-2">
            <Text className="font-semibold text-slate-800 text-base">Plan Pro - Mensual</Text>
            <Text className="font-bold text-slate-800 text-base">S/ 29.90</Text>
          </View>
          <Text className="text-slate-500 text-sm mb-6">Suscripción mensual</Text>
          
          <View className="h-[1px] bg-slate-200 mb-4" />
          
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-slate-800 text-base">Total a pagar</Text>
            <Text className="font-bold text-slate-800 text-2xl">S/ 29.90</Text>
          </View>
        </View>

        <Text className="font-semibold text-slate-800 text-base mb-4 ml-1">Elige cómo pagar</Text>
        
        {/* Payment Options */}
        <View className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-slate-100"
            onPress={() => { void handleUpgrade(); }}
          >
            <View className="flex-row items-center flex-1">
              <View className="h-8 w-8 items-center justify-center mr-3"><CreditCard color="#009ee3" size={24} /></View>
              <View className="flex-1">
                <Text className="font-medium text-slate-800">Tarjeta de crédito</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Visa, Mastercard, American Express</Text>
              </View>
            </View>
            <Text className="text-slate-400 font-bold text-lg">{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-slate-100"
            onPress={() => { void handleUpgrade(); }}
          >
            <View className="flex-row items-center flex-1">
              <View className="h-8 w-8 items-center justify-center mr-3"><CreditCard color="#009ee3" size={24} /></View>
              <View className="flex-1">
                <Text className="font-medium text-slate-800">Tarjeta de débito</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Visa Débito, Mastercard Débito</Text>
              </View>
            </View>
            <Text className="text-slate-400 font-bold text-lg">{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-slate-100"
            onPress={() => { void handleUpgrade(); }}
          >
            <View className="flex-row items-center flex-1">
              <View className="h-8 w-8 bg-blue-50 items-center justify-center mr-3 rounded-full"><View className="h-4 w-4 bg-[#009ee3] rounded-sm" /></View>
              <View className="flex-1">
                <Text className="font-medium text-slate-800">Mercado Pago</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Saldo disponible en tu cuenta</Text>
              </View>
            </View>
            <Text className="text-slate-400 font-bold text-lg">{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-slate-100"
            onPress={() => { void handleUpgrade(); }}
          >
            <View className="flex-row items-center flex-1">
              <View className="h-8 w-8 items-center justify-center mr-3"><View className="h-5 w-6 border-2 border-[#009ee3] rounded-sm" /></View>
              <View className="flex-1">
                <Text className="font-medium text-slate-800">Transferencia bancaria</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Desde tu banca por internet</Text>
              </View>
            </View>
            <Text className="text-slate-400 font-bold text-lg">{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center mt-6 mb-10">
          <Lock size={12} color="#94a3b8" />
          <Text className="text-xs text-slate-400 ml-2">Tus datos están protegidos con encriptación SSL</Text>
        </View>
          </>
        )}
      </ScrollView>
    </Animated.View>
  );

  const renderSuccess = () => (
    <Animated.View className="flex-1 " style={{ backgroundColor: palette.primary }} entering={FadeIn.delay(200)} exiting={FadeOut} key="success">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: Math.max(insets.top, 40), paddingHorizontal: 24, paddingBottom: 40 }}>
        
        <View className="items-center mb-10 mt-10">
          <Text className="text-white/80 font-medium mb-10">¡Pago exitoso!</Text>
          
          <View className="h-28 w-28 bg-white rounded-full items-center justify-center mb-8 shadow-lg relative">
            <Check size={56} color="#10b981" strokeWidth={3} />
            {/* Simple confetti dots mocked with absolute positioning */}
            <View className="absolute -top-4 -left-4 h-3 w-3 rounded-full bg-yellow-400" />
            <View className="absolute top-10 -left-8 h-2 w-2 rounded-full bg-blue-400" />
            <View className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-pink-400" />
            <View className="absolute -top-6 right-2 h-2 w-2 rounded-full bg-emerald-400" />
            <View className="absolute top-4 -right-8 h-3 w-3 rounded-full bg-orange-400" />
            <View className="absolute -bottom-4 right-0 h-2 w-2 rounded-full bg-purple-400" />
          </View>
          
          <Text className="text-white text-3xl font-bold mb-4">¡Bienvenido a PRO!</Text>
          <Text className="text-white/90 text-center text-sm px-4 mb-2">
            Tu pago fue realizado con éxito.
          </Text>
          <Text className="text-white/90 text-center text-sm px-4">
            Ya puedes disfrutar de todas las herramientas premium.
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-xl mb-10">
          <Text className="font-semibold text-slate-800 mb-6">Módulos desbloqueados</Text>
          
          <View className="space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8  rounded-lg items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}><Calendar size={16} color={palette.primary} /></View>
                <Text className="font-medium text-slate-700">Calendario</Text>
              </View>
              <View className="h-5 w-5 bg-emerald-100 rounded-full items-center justify-center"><Check size={12} color="#10b981" /></View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8  rounded-lg items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}><PieChart size={16} color={palette.primary} /></View>
                <Text className="font-medium text-slate-700">Reportes avanzados</Text>
              </View>
              <View className="h-5 w-5 bg-emerald-100 rounded-full items-center justify-center"><Check size={12} color="#10b981" /></View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8  rounded-lg items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}><Sparkles size={16} color={palette.primary} /></View>
                <Text className="font-medium text-slate-700">Análisis e IA</Text>
              </View>
              <View className="h-5 w-5 bg-emerald-100 rounded-full items-center justify-center"><Check size={12} color="#10b981" /></View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8  rounded-lg items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}><Download size={16} color={palette.primary} /></View>
                <Text className="font-medium text-slate-700">Exportar a Excel</Text>
              </View>
              <View className="h-5 w-5 bg-emerald-100 rounded-full items-center justify-center"><Check size={12} color="#10b981" /></View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8  rounded-lg items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}><BarChart2 size={16} color={palette.primary} /></View>
                <Text className="font-medium text-slate-700">Estadísticas avanzadas</Text>
              </View>
              <View className="h-5 w-5 bg-emerald-100 rounded-full items-center justify-center"><Check size={12} color="#10b981" /></View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8  rounded-lg items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}><Bell size={16} color={palette.primary} /></View>
                <Text className="font-medium text-slate-700">Recordatorios</Text>
              </View>
              <View className="h-5 w-5 bg-emerald-100 rounded-full items-center justify-center"><Check size={12} color="#10b981" /></View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-8 w-8  rounded-lg items-center justify-center mr-3" style={{ backgroundColor: palette.primarySoft }}><Headset size={16} color={palette.primary} /></View>
                <Text className="font-medium text-slate-700">Soporte prioritario</Text>
              </View>
              <View className="h-5 w-5 bg-emerald-100 rounded-full items-center justify-center"><Check size={12} color="#10b981" /></View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-white py-4 rounded-2xl items-center mb-6"
          onPress={handleBack}
        >
          <Text className=" font-bold text-base" style={{ color: palette.primary }}>Comenzar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center" onPress={handleBack}>
          <Text className="text-white/80 font-medium">Ir al inicio</Text>
        </TouchableOpacity>
      </ScrollView>
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

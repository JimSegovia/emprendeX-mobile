import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Lock, Shield, Sparkles, CreditCard, Star, Calendar, PieChart, Download, BarChart2, Bell, Headset, X, RotateCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthSession } from '@/lib/auth-session-context';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import type { ModuleId } from '@/lib/modules';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

type FlowStep = 'SELECTION' | 'CONFIRMATION' | 'MERCADOPAGO' | 'SUCCESS';

export default function PlanProScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { authState, updateAuthState } = useAuthSession();
  const { palette } = useAccountPreferences();
  const [currentStep, setCurrentStep] = useState<FlowStep>('SELECTION');

  const handleBack = () => {
    if (currentStep === 'SELECTION') {
      router.back();
    } else if (currentStep === 'CONFIRMATION') {
      setCurrentStep('SELECTION');
    } else if (currentStep === 'MERCADOPAGO') {
      setCurrentStep('CONFIRMATION');
    } else if (currentStep === 'SUCCESS') {
      if (authState) {
        updateAuthState({
          ...authState,
          user: {
            ...authState.user,
            enabledModuleIds: Array.from(new Set([...authState.user.enabledModuleIds, 'calendario', 'reportes', 'alertas-pro'] as ModuleId[]))
          }
        });
      }
      router.replace('/(drawer)/(tabs)/');
    }
  };

  const topBarColor = palette.primaryDark;

  const renderSelection = () => (
    <Animated.View className="flex-1" entering={SlideInRight} exiting={SlideOutLeft} key="selection">
      {/* Header */}
      <View style={{ paddingTop: Math.max(insets.top, 16), backgroundColor: topBarColor, paddingBottom: 16 }}>
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2 mr-2">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View className="flex-1 items-center mr-10">
            <Text className="text-white text-lg font-semibold">Mi suscripci+¶n</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 bg-[#f8fafc]" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View className="items-center mb-8 pt-4">
          <Text className="text-xl font-bold text-slate-800 text-center mb-2">Elige el plan ideal para tu negocio</Text>
          <Text className="text-slate-500 text-center text-sm px-4">
            Actualiza a Pro y accede a herramientas avanzadas para crecer m+Ìs.
          </Text>
        </View>

        <View className="flex-row justify-between mb-8 h-[440px]">
          {/* Plan Gratis */}
          <View className="w-[48%] bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex-col justify-between">
            <View>
              <View className="items-center mb-4">
                <View className="h-12 w-12 rounded-full  items-center justify-center mb-2" style={{ backgroundColor: palette.primarySoft }}>
                  <View className="h-6 w-6 border-2  rounded-sm" style={{ borderColor: palette.primary }} />
                </View>
                <Text className="text-lg font-bold text-slate-800">Gratis</Text>
                <Text className="text-xs text-slate-500 font-medium mt-1"><Text className="text-lg font-bold" style={{ color: palette.primary }}>S/ 0</Text> / mes</Text>
              </View>
              <View className="space-y-3">
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Clientes</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Cotizaciones</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Pedidos</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Pagos</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Inventario b+Ìsico</Text></View>
                <View className="flex-row items-center"><Check size={14} color={palette.primary} /><Text className="text-[11px] text-slate-700 ml-2">Reportes b+Ìsicos</Text></View>
              </View>
            </View>
            <View className="bg-slate-100 py-3 rounded-2xl items-center mt-4">
              <Text className="text-slate-500 font-semibold text-sm">Plan actual</Text>
            </View>
          </View>

          {/* Plan Pro */}
          <View className="w-[48%] bg-white rounded-3xl border-2  p-4 shadow-md flex-col justify-between relative overflow-hidden" style={{ borderColor: palette.primary }}>
            <View className="absolute top-0 inset-x-0 items-center  py-1 rounded-b-lg mx-6" style={{ backgroundColor: palette.primary }}>
              <Text className="text-white text-[9px] font-bold">M+¸S POPULAR</Text>
            </View>
            <View className="mt-4">
              <View className="items-center mb-4 mt-2">
                <View className="h-12 w-12 rounded-full bg-orange-50 items-center justify-center mb-2">
                  <Star size={24} color="#f59e0b" />
                </View>
                <Text className="text-lg font-bold text-slate-800">Pro</Text>
                <Text className="text-xs text-slate-500 font-medium mt-1"><Text className="text-lg font-bold" style={{ color: palette.primary }}>S/ 29.90</Text> / mes</Text>
              </View>
              <Text className="text-[10px] font-semibold text-slate-800 mb-3 text-center">Todo lo del plan Gratis, m+Ìs:</Text>
              <View className="space-y-3">
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Calendario</Text></View>
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Reportes avanzados</Text></View>
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">An+Ìlisis e IA</Text></View>
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Exportar a Excel</Text></View>
                <View className="flex-row items-center"><Check size={14} color="#10b981" /><Text className="text-[11px] font-medium text-slate-800 ml-2">Estad+°sticas avanzadas</Text></View>
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
            <Text className="text-slate-500 text-xs">Tu plan se renueva autom+Ìticamente cada mes.</Text>
          </View>
        </View>

        <TouchableOpacity className="items-center">
          <Text className=" font-semibold text-sm" style={{ color: palette.primary }}>-+Tienes un c+¶digo de promoci+¶n?</Text>
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
              <Text className="text-slate-600 ml-3 font-medium text-sm">Duraci+¶n</Text>
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

        {/* M+Ætodo de pago */}
        <Text className="font-bold text-slate-800 text-base mb-4 ml-1">M+Ætodo de pago</Text>
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
              <Text className="font-semibold text-slate-800 text-sm">Accede a m+¶dulos premium</Text>
              <Text className="text-xs text-slate-500 mt-1">Calendario, Reportes, IA y m+Ìs.</Text>
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
          Ser+Ìs redirigido al checkout seguro de MercadoPago.
        </Text>

      </ScrollView>
    </Animated.View>
  );

  const renderMercadoPago = () => (
    <Animated.View className="flex-1 bg-[#f5f5f5]" entering={SlideInRight} exiting={SlideOutLeft} key="mercadopago">
      {/* Mock Browser Header */}
      <View style={{ paddingTop: Math.max(insets.top, 10), backgroundColor: '#ffffff', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleBack}><Text className="text-blue-500 font-medium text-sm">Cancelar</Text></TouchableOpacity>
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
        {/* Order details */}
        <View className="bg-white rounded-lg p-5 shadow-sm mb-6 border border-slate-100">
          <View className="flex-row justify-between mb-2">
            <Text className="font-semibold text-slate-800 text-base">Plan Pro - Mensual</Text>
            <Text className="font-bold text-slate-800 text-base">S/ 29.90</Text>
          </View>
          <Text className="text-slate-500 text-sm mb-6">Suscripci+¶n mensual</Text>
          
          <View className="h-[1px] bg-slate-200 mb-4" />
          
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-slate-800 text-base">Total a pagar</Text>
            <Text className="font-bold text-slate-800 text-2xl">S/ 29.90</Text>
          </View>
        </View>

        <Text className="font-semibold text-slate-800 text-base mb-4 ml-1">Elige c+¶mo pagar</Text>
        
        {/* Payment Options */}
        <View className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-slate-100"
            onPress={() => setCurrentStep('SUCCESS')}
          >
            <View className="flex-row items-center flex-1">
              <View className="h-8 w-8 items-center justify-center mr-3"><CreditCard color="#009ee3" size={24} /></View>
              <View className="flex-1">
                <Text className="font-medium text-slate-800">Tarjeta de cr+Ædito</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Visa, Mastercard, American Express</Text>
              </View>
            </View>
            <Text className="text-slate-400 font-bold text-lg">{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-slate-100"
            onPress={() => setCurrentStep('SUCCESS')}
          >
            <View className="flex-row items-center flex-1">
              <View className="h-8 w-8 items-center justify-center mr-3"><CreditCard color="#009ee3" size={24} /></View>
              <View className="flex-1">
                <Text className="font-medium text-slate-800">Tarjeta de d+Æbito</Text>
                <Text className="text-xs text-slate-500 mt-0.5">Visa D+Æbito, Mastercard D+Æbito</Text>
              </View>
            </View>
            <Text className="text-slate-400 font-bold text-lg">{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-slate-100"
            onPress={() => setCurrentStep('SUCCESS')}
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
            onPress={() => setCurrentStep('SUCCESS')}
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
          <Text className="text-xs text-slate-400 ml-2">Tus datos est+Ìn protegidos con encriptaci+¶n SSL</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderSuccess = () => (
    <Animated.View className="flex-1 " style={{ backgroundColor: palette.primary }} entering={FadeIn.delay(200)} exiting={FadeOut} key="success">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: Math.max(insets.top, 40), paddingHorizontal: 24, paddingBottom: 40 }}>
        
        <View className="items-center mb-10 mt-10">
          <Text className="text-white/80 font-medium mb-10">-ÌPago exitoso!</Text>
          
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
          
          <Text className="text-white text-3xl font-bold mb-4">-ÌBienvenido a PRO!</Text>
          <Text className="text-white/90 text-center text-sm px-4 mb-2">
            Tu pago fue realizado con +Æxito.
          </Text>
          <Text className="text-white/90 text-center text-sm px-4">
            Ya puedes disfrutar de todas las herramientas premium.
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-xl mb-10">
          <Text className="font-semibold text-slate-800 mb-6">M+¶dulos desbloqueados</Text>
          
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
                <Text className="font-medium text-slate-700">An+Ìlisis e IA</Text>
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
                <Text className="font-medium text-slate-700">Estad+°sticas avanzadas</Text>
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
      {currentStep === 'SELECTION' && renderSelection()}
      {currentStep === 'CONFIRMATION' && renderConfirmation()}
      {currentStep === 'MERCADOPAGO' && renderMercadoPago()}
      {currentStep === 'SUCCESS' && renderSuccess()}
    </View>
  );
}

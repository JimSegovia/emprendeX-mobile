import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, Check, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function PlanProScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('mensual');

  const features = [
    'Módulos ilimitados',
    'Reportes avanzados',
    'Respaldos automáticos en la nube',
    'Exportación de datos',
    'Soporte prioritario'
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className="bg-violet-600 px-4 pb-4 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Plan Pro</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        {/* Crown Icon */}
        <View className="items-center justify-center mb-8 relative">
          <Crown size={80} color="#f59e0b" strokeWidth={1.5} />
          <View className="absolute top-0 right-1/4">
            <Sparkles size={24} color="#f59e0b" />
          </View>
          <View className="absolute bottom-2 left-1/4">
            <Sparkles size={16} color="#f59e0b" />
          </View>
        </View>

        {/* Title */}
        <Text className="text-center text-slate-800 text-lg mb-8">
          Desbloquea todo el potencial de{'\n'}
          <Text className="text-2xl font-extrabold text-violet-900 tracking-tight">EmprendeX</Text>
        </Text>

        {/* Features List */}
        <View className="mb-10 px-2 space-y-4">
          {features.map((feature, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <Check size={20} color="#10b981" className="mr-3" />
              <Text className="text-slate-700 text-base">{feature}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Plans */}
        <View className="flex-row justify-between mb-8">
          {/* Mensual */}
          <TouchableOpacity 
            className={`w-[48%] p-4 rounded-2xl border-2 ${selectedPlan === 'mensual' ? 'border-violet-600 bg-violet-50' : 'border-slate-100 bg-white'}`}
            onPress={() => setSelectedPlan('mensual')}
          >
            <Text className={`font-bold mb-2 ${selectedPlan === 'mensual' ? 'text-violet-900' : 'text-slate-800'}`}>Mensual</Text>
            <Text className="text-2xl font-extrabold text-slate-800">S/ 29.90</Text>
          </TouchableOpacity>

          {/* Anual */}
          <TouchableOpacity 
            className={`w-[48%] p-4 rounded-2xl border-2 ${selectedPlan === 'anual' ? 'border-violet-600 bg-violet-50' : 'border-slate-100 bg-slate-50'}`}
            onPress={() => setSelectedPlan('anual')}
          >
            <Text className={`font-bold mb-2 ${selectedPlan === 'anual' ? 'text-violet-900' : 'text-slate-600'}`}>Anual</Text>
            <Text className="text-2xl font-extrabold text-slate-800 mb-1">S/ 299.00</Text>
            <Text className="text-slate-500 text-xs">Ahorra 17%</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity className="bg-violet-600 w-full py-4 rounded-xl items-center shadow-md shadow-violet-200 mb-6">
          <Text className="text-white font-bold text-lg">Activar Plan Pro</Text>
        </TouchableOpacity>

        {/* Link */}
        <TouchableOpacity className="items-center pb-12" onPress={() => router.back()}>
          <Text className="text-violet-600 font-medium">Ahora no, continuar gratis</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

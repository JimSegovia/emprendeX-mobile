import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

export default function RegisterScreen() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const hasNameError = attemptedSubmit && !businessName.trim();
  const hasCategoryError = attemptedSubmit && !businessCategory.trim();

  const handleContinue = () => {
    setAttemptedSubmit(true);

    if (!businessName.trim() || !businessCategory.trim()) {
      return;
    }

    router.replace('/onboarding/modules');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View className="flex-1 bg-white" entering={screenEntering}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <Animated.View className="px-6 pt-4" entering={sectionEntering(0)}>
            <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-slate-100">
              <ArrowLeft size={22} color="#334155" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View className="px-6 pt-5" entering={sectionEntering(1)}>
            <Text className="text-3xl font-extrabold text-slate-800">Datos del negocio</Text>
          </Animated.View>

          <Animated.View className="mx-6 mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(2)}>
            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">Nombre del negocio *</Text>
              <TextInput
                className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasNameError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                placeholder="Ej. Dulce Taller"
                placeholderTextColor="#94a3b8"
                value={businessName}
                onChangeText={setBusinessName}
              />
              {hasNameError && <Text className="mt-2 text-sm text-rose-500">Ingresa el nombre del negocio.</Text>}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">Rubro principal *</Text>
              <TextInput
                className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasCategoryError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                placeholder="Ej. Pasteleria personalizada"
                placeholderTextColor="#94a3b8"
                value={businessCategory}
                onChangeText={setBusinessCategory}
              />
              {hasCategoryError && <Text className="mt-2 text-sm text-rose-500">Ingresa el rubro principal.</Text>}
            </View>

            <View>
              <Text className="mb-3 text-sm font-semibold text-slate-700">Moneda base</Text>
              <View className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4">
                <View className="flex-row items-center">
                  <CreditCard size={16} color="#7c3aed" />
                  <Text className="ml-2 font-semibold text-violet-700">Soles peruanos (S/)</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View className="px-6 pt-6" entering={sectionEntering(3)}>
            <TouchableOpacity className="items-center rounded-2xl bg-violet-600 py-4" onPress={handleContinue}>
              <Text className="text-lg font-bold text-white">Continuar con modulos</Text>
            </TouchableOpacity>
            <TouchableOpacity className="mt-4 items-center" onPress={() => router.back()}>
              <Text className="font-medium text-violet-600">Ya tengo cuenta, volver</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

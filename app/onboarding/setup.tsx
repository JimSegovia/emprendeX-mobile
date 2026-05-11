import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronDown, ChevronLeft, Info, Check } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering, smoothLayout } from '@/components/ui/motion';

const CATEGORIES = [
  'Restaurante / Comida',
  'Tienda de Ropa / Moda',
  'Tecnología / Electrónica',
  'Servicios Profesionales',
  'Salud y Belleza',
  'Bodega / Minimarket',
  'Otro',
];

const CURRENCIES = [
  { label: 'Soles (PEN)', value: 'PEN' },
  { label: 'Dólares (USD)', value: 'USD' },
  { label: 'Pesos Mexicanos (MXN)', value: 'MXN' },
  { label: 'Euros (EUR)', value: 'EUR' },
];

export default function SetupScreen() {
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState('');

  // Modals state
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);

  const isFormValid = businessName.trim().length > 0 && category !== '' && currency !== '';

  const handleContinue = () => {
    if (isFormValid) {
      router.push('/onboarding/modules');
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/modules');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <Animated.View className="flex-row items-center px-4 pt-4 mb-2" entering={sectionEntering(0)}>
          <TouchableOpacity 
            className="p-2 rounded-full"
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#334155" />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <Animated.View entering={sectionEntering(1)} className="items-center mb-8">
            <Text className="text-[28px] font-extrabold text-slate-800 text-center mb-3">
              Configura tu negocio
            </Text>
            <Text className="text-slate-500 text-center text-base px-4 leading-relaxed mb-6">
              Ingresa la información básica de tu negocio para empezar.
            </Text>

            {/* Stepper */}
            <View className="flex-row justify-center space-x-2">
              <View className="h-1.5 w-12 bg-violet-600 rounded-full" />
              <View className="h-1.5 w-12 bg-violet-600 rounded-full" />
              <View className="h-1.5 w-12 bg-slate-200 rounded-full" />
            </View>
          </Animated.View>

          <Animated.View entering={sectionEntering(2)} className="space-y-6">
            {/* Business Name */}
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2">Nombre de tu negocio</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                placeholder="Ej. Pastelería Dulce Momento"
                placeholderTextColor="#94a3b8"
                value={businessName}
                onChangeText={setBusinessName}
              />
              <Text className="text-xs text-slate-400 mt-1.5">
                Usa el nombre con el que identificarás tu negocio.
              </Text>
            </View>

            {/* Category */}
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2">Rubro o categoría</Text>
              <TouchableOpacity
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text className={`text-base ${category ? 'text-slate-800' : 'text-slate-400'}`}>
                  {category || 'Selecciona el rubro de tu negocio'}
                </Text>
                <ChevronDown size={20} color="#94a3b8" />
              </TouchableOpacity>
              <Text className="text-xs text-slate-400 mt-1.5">
                Esto nos ayuda a personalizar tu experiencia.
              </Text>
            </View>

            {/* Currency */}
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2">Moneda</Text>
              <TouchableOpacity
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                onPress={() => setCurrencyModalVisible(true)}
              >
                <Text className={`text-base ${currency ? 'text-slate-800' : 'text-slate-400'}`}>
                  {CURRENCIES.find(c => c.value === currency)?.label || 'Selecciona la moneda'}
                </Text>
                <ChevronDown size={20} color="#94a3b8" />
              </TouchableOpacity>
              <Text className="text-xs text-slate-400 mt-1.5">
                Podrás cambiarla más adelante en configuración.
              </Text>
            </View>

            {/* Info Box */}
            <View className="bg-violet-50 rounded-2xl p-4 flex-row items-start border border-violet-100 mt-4">
              <View className="mt-0.5 mr-3">
                <Info size={20} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="text-violet-900 font-semibold text-sm mb-1">
                  ¿Por qué te pedimos esto?
                </Text>
                <Text className="text-violet-800/80 text-xs leading-5">
                  Con esta información configuraremos tu espacio de trabajo y tus reportes con los valores y opciones correctas para tu negocio.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <Animated.View className="px-6 py-6 pb-8 pt-4 bg-white border-t border-slate-50" entering={sectionEntering(3)}>
          <TouchableOpacity 
            className={`w-full rounded-xl py-4 items-center justify-center mb-4 ${isFormValid ? 'bg-violet-600 active:bg-violet-700' : 'bg-slate-200'}`}
            disabled={!isFormValid}
            onPress={handleContinue}
          >
            <Text className={`font-bold text-lg ${isFormValid ? 'text-white' : 'text-slate-400'}`}>Continuar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-full py-2 items-center justify-center"
            onPress={handleSkip}
          >
            <Text className="text-violet-600 font-semibold text-sm">Ahora no, lo haré después</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl pt-6 pb-8 px-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-800">Selecciona el rubro</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <ChevronDown size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center justify-between py-4 border-b border-slate-100`}
                  onPress={() => {
                    setCategory(item);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text className={`text-base ${category === item ? 'text-violet-600 font-bold' : 'text-slate-700'}`}>{item}</Text>
                  {category === item && <Check size={20} color="#7c3aed" />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={isCurrencyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl pt-6 pb-8 px-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-800">Selecciona la moneda</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <ChevronDown size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center justify-between py-4 border-b border-slate-100`}
                  onPress={() => {
                    setCurrency(item.value);
                    setCurrencyModalVisible(false);
                  }}
                >
                  <Text className={`text-base ${currency === item.value ? 'text-violet-600 font-bold' : 'text-slate-700'}`}>{item.label}</Text>
                  {currency === item.value && <Check size={20} color="#7c3aed" />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

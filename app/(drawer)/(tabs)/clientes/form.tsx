import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

export default function ClienteFormScreen() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Very basic validation
  const isEmailValid = email.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid =
    name.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    isEmailValid &&
    phone.trim().length > 0;

  const handleContinue = () => {
    if (isFormValid) {
      // In a real app, save to state/context/API here.
      // For now, go back to the previous screen (clientes list).
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View className="flex-1" entering={screenEntering}>
          {/* Header */}
          <Animated.View className="flex-row items-center px-4 pt-4 mb-2" entering={sectionEntering(0)}>
            <TouchableOpacity 
              className="p-2 rounded-full"
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#334155" />
            </TouchableOpacity>
          </Animated.View>

          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <Animated.View entering={sectionEntering(1)} className="items-center mb-8 mt-2">
              <Text className="text-[28px] font-extrabold text-slate-800 text-center mb-3">
                Registre un cliente
              </Text>
              <Text className="text-slate-500 text-center text-base px-4 leading-relaxed">
                Ingresa la información básica de tu cliente
              </Text>
            </Animated.View>

            <Animated.View entering={sectionEntering(2)} className="space-y-6">
              {/* Name */}
              <View>
                <Text className="text-sm font-bold text-slate-800 mb-2">Nombre de tu cliente</Text>
                <TextInput
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                  placeholder="Ej. Jim Bryan Jordan"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                />
                <Text className="text-xs text-slate-400 mt-1.5">
                  Usa el nombre con el que identificarás tu próximo cliente.
                </Text>
              </View>

              {/* Last Name */}
              <View>
                <Text className="text-sm font-bold text-slate-800 mb-2">Apellido de tu cliente</Text>
                <TextInput
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                  placeholder="Ej. Espinoza Picon"
                  placeholderTextColor="#94a3b8"
                  value={lastName}
                  onChangeText={setLastName}
                />
                <Text className="text-xs text-slate-400 mt-1.5">
                  Usa el apellido con el que identificarás tu próximo cliente.
                </Text>
              </View>

              {/* Email */}
              <View>
                <Text className="text-sm font-bold text-slate-800 mb-2">Correo Eléctronico</Text>
                <TextInput
                  className={`w-full bg-white border ${!isEmailValid && email.length > 0 ? 'border-rose-300' : 'border-slate-200'} rounded-xl px-4 py-3.5 text-base text-slate-800`}
                  placeholder="Ej. nombre@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <Text className="text-xs text-slate-400 mt-1.5">
                  Usa el correo con el que te comunicas con tu cliente.
                </Text>
              </View>

              {/* Phone */}
              <View>
                <Text className="text-sm font-bold text-slate-800 mb-2">Celular</Text>
                <TextInput
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                  placeholder="Ej. 945678234"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <Text className="text-xs text-slate-400 mt-1.5">
                  Usa el celular con el que te comunicas con tu cliente.
                </Text>
              </View>

              {/* Address */}
              <View>
                <Text className="text-sm font-bold text-slate-800 mb-2">Dirección</Text>
                <TextInput
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                  placeholder="Ej. Jr. Hermanda, Avenida Ejemplo"
                  placeholderTextColor="#94a3b8"
                  value={address}
                  onChangeText={setAddress}
                />
                <Text className="text-xs text-slate-400 mt-1.5">
                  Coloca la dirección de tu cliente
                </Text>
              </View>

              {/* Info Box */}
              <View className="bg-violet-50 rounded-2xl p-4 flex-row items-start border border-violet-100 mt-2">
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
          <Animated.View className="px-6 py-6 pb-8 bg-white border-t border-slate-50" entering={sectionEntering(3)}>
            <TouchableOpacity 
              className={`w-full rounded-xl py-4 items-center justify-center ${isFormValid ? 'bg-violet-600 active:bg-violet-700' : 'bg-slate-200'}`}
              disabled={!isFormValid}
              onPress={handleContinue}
            >
              <Text className={`font-bold text-lg ${isFormValid ? 'text-white' : 'text-slate-400'}`}>Continuar</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

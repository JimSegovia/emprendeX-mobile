import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Users } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

const CLIENTS = [
  { id: '1', name: 'Maria López', phone: '987 654 321', district: 'Los Olivos', notes: 'Prefiere WhatsApp en la tarde.' },
  { id: '2', name: 'Juan Pérez', phone: '912 345 678', district: 'Pueblo Libre', notes: 'Recojo en taller los viernes.' },
  { id: '3', name: 'Lucía Fernández', phone: '946 678 901', district: 'Surco', notes: 'Suele pedir personalizados.' },
];

export default function ClienteFormScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const existingClient = useMemo(() => CLIENTS.find((client) => client.id === id), [id]);
  const [name, setName] = useState(existingClient?.name ?? '');
  const [phone, setPhone] = useState(existingClient?.phone ?? '');
  const [district, setDistrict] = useState(existingClient?.district ?? '');
  const [notes, setNotes] = useState(existingClient?.notes ?? '');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const hasNameError = attemptedSubmit && !name.trim();
  const hasPhoneError = attemptedSubmit && !phone.trim();

  const handleSave = () => {
    setAttemptedSubmit(true);

    if (!name.trim() || !phone.trim()) {
      return;
    }

    router.back();
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-xl font-bold">{existingClient ? 'Editar cliente' : 'Nuevo cliente'}</Text>
            </View>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Users size={22} color="white" />
          </View>
        </View>
      </Animated.View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        <Animated.View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" entering={sectionEntering(1)}>
          <View className="mb-5">
            <Text className="mb-2 text-sm font-semibold text-slate-700">Nombre completo *</Text>
            <TextInput
              className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasNameError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
              placeholder="Ej. Maria López"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
            {hasNameError && <Text className="mt-2 text-sm text-rose-500">Ingresa el nombre del cliente.</Text>}
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-sm font-semibold text-slate-700">Telefono o WhatsApp *</Text>
            <TextInput
              className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasPhoneError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
              placeholder="Ej. 987 654 321"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            {hasPhoneError && <Text className="mt-2 text-sm text-rose-500">Ingresa un telefono de contacto.</Text>}
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-sm font-semibold text-slate-700">Distrito</Text>
            <TextInput
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-800"
              placeholder="Ej. Miraflores"
              placeholderTextColor="#94a3b8"
              value={district}
              onChangeText={setDistrict}
            />
          </View>

          <View>
            <Text className="mb-2 text-sm font-semibold text-slate-700">Notas</Text>
            <TextInput
              className="min-h-[110px] rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-800"
              placeholder="Preferencias, horarios, direccion o detalles utiles."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </Animated.View>

        <TouchableOpacity className="mt-6 items-center rounded-2xl bg-violet-600 py-4" onPress={handleSave}>
          <Text className="text-lg font-bold text-white">Guardar cliente</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

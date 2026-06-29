import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import {
  createCliente,
  fetchClienteById,
  getReadableClientesError,
  updateCliente,
} from '@/lib/clientes';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { DNI_LENGTH, isValidDni, sanitizeDniInput } from '@/lib/dni';

export default function ClienteFormScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const [firstNames, setFirstNames] = useState('');
  const [lastNames, setLastNames] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!id || !accessToken) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const customer = await fetchClienteById(accessToken, id);
        setFirstNames(customer.firstNames);
        setLastNames(customer.lastNames ?? '');
        setDni(customer.dni);
        setEmail(customer.email ?? '');
        setPhone(customer.phone ?? '');
        setAddress(customer.address ?? '');
      } catch (loadError) {
        setError(getReadableClientesError(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCustomer();
  }, [accessToken, id]);

  const isEmailValid = email.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isDniValid = isValidDni(dni);
  const hasFirstNamesError = attemptedSubmit && !firstNames.trim();
  const hasDniError = attemptedSubmit && !isDniValid;
  const hasEmailError = attemptedSubmit && !isEmailValid;
  const isFormValid = firstNames.trim().length > 0 && isDniValid && isEmailValid;

  const handleContinue = async () => {
    setAttemptedSubmit(true);

    if (!isFormValid || !accessToken) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        firstNames: firstNames.trim(),
        dni,
        lastNames: lastNames.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      };

      if (id) {
        await updateCliente(accessToken, id, payload);
      } else {
        await createCliente(accessToken, payload);
      }

      router.back();
    } catch (submitError) {
      setError(getReadableClientesError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppSafeArea className="flex-1 bg-white">
      <View className="flex-1">
        <Animated.View className="flex-1" entering={screenEntering}>
          <Animated.View
            className="flex-row items-center px-4 pt-4 mb-2"
            entering={sectionEntering(0)}
          >
            <TouchableOpacity className="p-2 rounded-full" onPress={() => router.back()}>
              <ArrowLeft size={24} color="#334155" />
            </TouchableOpacity>
          </Animated.View>

          <KeyboardAwareLayout
            style={{ paddingHorizontal: 20 }}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          >
            <Animated.View entering={sectionEntering(1)} className="items-center mb-8 mt-2">
              <Text className="text-2xl font-semibold text-slate-800 text-center mb-3">
                {id ? 'Editar cliente' : 'Registrar cliente'}
              </Text>
              <Text className="text-slate-500 text-center text-base px-4 leading-relaxed">
                Ingresa la información básica del cliente.
              </Text>
            </Animated.View>

            {isLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator color={palette.primary} />
                <Text className="mt-3 text-slate-500">Cargando cliente...</Text>
              </View>
            ) : (
              <Animated.View entering={sectionEntering(2)} className="space-y-6">
                <View>
                  <Text className="text-sm font-semibold text-slate-800 mb-2">Nombres</Text>
                  <TextInput
                    className={`w-full bg-white border ${hasFirstNamesError ? 'border-rose-300' : 'border-slate-200'} rounded-xl px-4 py-3.5 text-base text-slate-800`}
                    placeholder="Ej. Jim Bryan Jordan"
                    placeholderTextColor="#94a3b8"
                    value={firstNames}
                    onChangeText={setFirstNames}
                  />
                  {hasFirstNamesError ? (
                    <Text className="mt-2 text-sm text-rose-500">
                      Ingresa los nombres del cliente.
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-800 mb-2">Apellidos</Text>
                  <TextInput
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                    placeholder="Ej. Espinoza Picon"
                    placeholderTextColor="#94a3b8"
                    value={lastNames}
                    onChangeText={setLastNames}
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-800 mb-2">DNI</Text>
                  <TextInput
                    className={`w-full bg-white border ${hasDniError ? 'border-rose-300' : 'border-slate-200'} rounded-xl px-4 py-3.5 text-base text-slate-800`}
                    placeholder="Solo números"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    maxLength={DNI_LENGTH}
                    autoCorrect={false}
                    value={dni}
                    onChangeText={(value) => setDni(sanitizeDniInput(value))}
                  />
                  {hasDniError ? (
                    <Text className="mt-2 text-sm text-rose-500">
                      {`Ingresa un DNI de ${DNI_LENGTH} dígitos.`}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-800 mb-2">Correo electrónico</Text>
                  <TextInput
                    className={`w-full bg-white border ${hasEmailError ? 'border-rose-300' : 'border-slate-200'} rounded-xl px-4 py-3.5 text-base text-slate-800`}
                    placeholder="Ej. nombre@example.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                  {hasEmailError ? (
                    <Text className="mt-2 text-sm text-rose-500">Ingresa un correo válido.</Text>
                  ) : null}
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-800 mb-2">Celular</Text>
                  <TextInput
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                    placeholder="Ej. 945678234"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <View>
                  <Text className="text-sm font-semibold text-slate-800 mb-2">Dirección</Text>
                  <TextInput
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                    placeholder="Ej. Jr. Hermanda, Avenida Ejemplo"
                    placeholderTextColor="#94a3b8"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>

                <View
                  className="rounded-2xl p-4 flex-row items-start border mt-2"
                  style={{ backgroundColor: palette.primarySoft, borderColor: palette.primaryBorder }}
                >
                  <View className="mt-0.5 mr-3">
                    <Info size={20} color={palette.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-sm mb-1" style={{ color: palette.primaryText }}>
                      Información del cliente
                    </Text>
                    <Text className="text-xs leading-5" style={{ color: palette.primaryText }}>
                      Estos datos se usarán en cotizaciones, pedidos y cobros.
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </KeyboardAwareLayout>

          <Animated.View
            className="px-6 py-6 pb-8 bg-white border-t border-slate-50"
            entering={sectionEntering(3)}
          >
            {error ? (
              <View className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <Text className="text-sm font-medium text-rose-600">{error}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              className="w-full rounded-xl py-4 items-center justify-center"
              style={{ backgroundColor: isFormValid && !isSubmitting ? palette.primary : '#e2e8f0' }}
              disabled={!isFormValid || isSubmitting || isLoading}
              onPress={() => {
                void handleContinue();
              }}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" />
                  <Text className="ml-3 font-semibold text-lg text-white">Guardando...</Text>
                </View>
              ) : (
                <Text
                  className={`font-semibold text-lg ${isFormValid ? 'text-white' : 'text-slate-400'}`}
                >
                  {id ? 'Guardar cambios' : 'Continuar'}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </AppSafeArea>
  );
}

import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { getColorPalette } from '@/lib/account-preferences';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const palette = getColorPalette('violet');
  const [email, setEmail] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mockToken, setMockToken] = useState<string | null>(null);

  const hasEmailError = attemptedSubmit && !EMAIL_REGEX.test(email.trim());

  const handleSendLink = async () => {
    setAttemptedSubmit(true);

    if (hasEmailError) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const token = `mock-reset-token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setMockToken(token);
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <AppSafeArea className="flex-1 bg-white">
      <Animated.View className="flex-1 bg-white" entering={screenEntering}>
        <KeyboardAwareLayout contentContainerStyle={{ paddingBottom: 32 }}>
          <Animated.View className="px-6 pt-4" entering={sectionEntering(0)}>
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full bg-slate-100"
            >
              <ArrowLeft size={22} color="#334155" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View className="px-6 pt-8" entering={sectionEntering(1)}>
            <Text className="text-2xl font-semibold text-slate-800">Recuperar contraseña</Text>
            <Text className="mt-2 text-base leading-6 text-slate-500">
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para
              restablecer tu contraseña.
            </Text>
          </Animated.View>

          {isSuccess ? (
            <Animated.View
              className="mx-6 mt-8"
              entering={sectionEntering(2)}
            >
              <View className="items-center rounded-[28px] border border-emerald-100 bg-emerald-50 p-8">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle size={32} color="#059669" />
                </View>
                <Text className="mb-2 text-center text-lg font-semibold text-emerald-800">
                  Revisa tu correo
                </Text>
                <Text className="text-center text-base leading-6 text-emerald-700">
                  Si el correo <Text className="font-semibold">{email.trim().toLowerCase()}</Text> está
                  registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.
                </Text>
              </View>

              {mockToken ? (
                <View className="mt-4 items-center rounded-[28px] border border-violet-100 bg-violet-50 p-6">
                  <Text className="mb-2 text-center text-sm font-semibold text-violet-700">
                    Modo demo — Token generado:
                  </Text>
                  <Text className="mb-4 text-center text-xs font-mono text-violet-600" selectable>
                    {mockToken}
                  </Text>
                  <TouchableOpacity
                    className="rounded-xl bg-violet-600 px-8 py-3"
                    onPress={() => router.push(`/reset-password?token=${encodeURIComponent(mockToken)}`)}
                  >
                    <Text className="text-center font-semibold text-white">Simular clic en enlace</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </Animated.View>
          ) : (
            <Animated.View
              className="mx-6 mt-8 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
              entering={sectionEntering(2)}
            >
              <View className="mb-5">
                <Text className="mb-2 text-sm font-semibold text-slate-700">Correo electrónico</Text>
                <View className="relative justify-center">
                  <TextInput
                    className={`rounded-2xl border px-4 py-4 pl-12 text-base text-slate-800 ${hasEmailError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                  <View className="absolute left-4">
                    <Mail size={20} color="#94a3b8" />
                  </View>
                </View>
                {hasEmailError ? (
                  <Text className="mt-2 text-sm text-rose-500">Ingresa un correo válido.</Text>
                ) : null}
              </View>

              {submitError ? (
                <View className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                  <Text className="text-sm font-medium text-rose-600">{submitError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                className="items-center rounded-2xl py-4"
                style={{ backgroundColor: isSubmitting ? palette.primaryDark : palette.primary }}
                onPress={() => {
                  void handleSendLink();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" />
                    <Text className="ml-3 text-lg font-semibold text-white">Enviando...</Text>
                  </View>
                ) : (
                  <Text className="text-lg font-semibold text-white">Enviar enlace</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View className="px-6 pt-8" entering={sectionEntering(3)}>
            <TouchableOpacity
              className="items-center"
              onPress={() => router.replace('/')}
            >
              <Text className="font-medium" style={{ color: palette.primaryText }}>
                Volver al inicio de sesión
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAwareLayout>
      </Animated.View>
    </AppSafeArea>
  );
}

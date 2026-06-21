import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { getColorPalette } from '@/lib/account-preferences';
import { AUTH_PASSWORD_MIN_LENGTH } from '@/lib/runtime-config';

export default function ResetPasswordScreen() {
  const palette = getColorPalette('violet');
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasPasswordError =
    attemptedSubmit && password.trim().length < AUTH_PASSWORD_MIN_LENGTH;
  const hasConfirmPasswordError =
    attemptedSubmit &&
    (confirmPassword.trim().length === 0 || confirmPassword !== password);

  const handleResetPassword = async () => {
    setAttemptedSubmit(true);

    if (hasPasswordError || hasConfirmPasswordError || !token) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    router.replace('/');
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
            <Text className="text-2xl font-semibold text-slate-800">Nueva contraseña</Text>
            <Text className="mt-2 text-base leading-6 text-slate-500">
              Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
            </Text>
          </Animated.View>

          {!token ? (
            <Animated.View
              className="mx-6 mt-8 items-center rounded-[28px] border border-amber-100 bg-amber-50 p-8"
              entering={sectionEntering(2)}
            >
              <Lock size={32} color="#d97706" />
              <Text className="mt-4 text-center text-base leading-6 text-amber-700">
                El enlace de restablecimiento no es válido o ha expirado. Solicita uno nuevo desde la
                pantalla de inicio de sesión.
              </Text>
            </Animated.View>
          ) : (
            <Animated.View
              className="mx-6 mt-8 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
              entering={sectionEntering(2)}
            >
              <View className="mb-5">
                <Text className="mb-2 text-sm font-semibold text-slate-700">Nueva contraseña</Text>
                <View className="relative justify-center">
                  <TextInput
                    className={`rounded-2xl border px-4 py-4 pl-12 pr-12 text-base text-slate-800 ${hasPasswordError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                    placeholder={`Mínimo ${AUTH_PASSWORD_MIN_LENGTH} caracteres`}
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <View className="absolute left-4">
                    <Lock size={20} color="#94a3b8" />
                  </View>
                  <TouchableOpacity
                    className="absolute right-4"
                    onPress={() => setShowPassword((currentValue) => !currentValue)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
                {hasPasswordError ? (
                  <Text className="mt-2 text-sm text-rose-500">
                    {`La contraseña debe tener al menos ${AUTH_PASSWORD_MIN_LENGTH} caracteres.`}
                  </Text>
                ) : null}
              </View>

              <View className="mb-5">
                <Text className="mb-2 text-sm font-semibold text-slate-700">
                  Confirma tu contraseña
                </Text>
                <View className="relative justify-center">
                  <TextInput
                    className={`rounded-2xl border px-4 py-4 pl-12 pr-12 text-base text-slate-800 ${hasConfirmPasswordError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <View className="absolute left-4">
                    <Lock size={20} color="#94a3b8" />
                  </View>
                  <TouchableOpacity
                    className="absolute right-4"
                    onPress={() => setShowConfirmPassword((currentValue) => !currentValue)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#94a3b8" />
                    ) : (
                      <Eye size={20} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                </View>
                {hasConfirmPasswordError && !confirmPassword.trim() ? (
                  <Text className="mt-2 text-sm text-rose-500">Confirma tu contraseña.</Text>
                ) : null}
                {hasConfirmPasswordError && confirmPassword.trim().length > 0 ? (
                  <Text className="mt-2 text-sm text-rose-500">Las contraseñas no coinciden.</Text>
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
                  void handleResetPassword();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" />
                    <Text className="ml-3 text-lg font-semibold text-white">
                      Restableciendo...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-lg font-semibold text-white">
                    Restablecer contraseña
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View className="px-6 pt-8" entering={sectionEntering(3)}>
            <TouchableOpacity className="items-center" onPress={() => router.replace('/')}>
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

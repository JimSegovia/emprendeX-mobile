import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { getColorPalette } from '@/lib/account-preferences';
import { getReadableAuthError, loginUser, resolvePostAuthRoute } from '@/lib/auth';
import { useAuthSession } from '@/lib/auth-session-context';
import { AUTH_PASSWORD_MIN_LENGTH } from '@/lib/runtime-config';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const palette = getColorPalette('violet');
  const { authState, isHydrated, setAuthenticatedSession } = useAuthSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated || !authState) {
      return;
    }

    router.replace(resolvePostAuthRoute(authState));
  }, [authState, isHydrated]);

  const hasEmailError = attemptedSubmit && !EMAIL_REGEX.test(email.trim());
  const hasPasswordError =
    attemptedSubmit && password.trim().length < AUTH_PASSWORD_MIN_LENGTH;

  const handleLogin = async () => {
    setAttemptedSubmit(true);

    if (hasEmailError || hasPasswordError) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const session = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      await setAuthenticatedSession(session);
      router.replace(resolvePostAuthRoute(session));
    } catch (error) {
      setSubmitError(getReadableAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated || authState) {
    return (
      <AppSafeArea className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={palette.primary} />
      </AppSafeArea>
    );
  }

  return (
    <AppSafeArea className="flex-1 bg-white">
      <KeyboardAwareLayout>
          <Animated.View className="flex-1 px-8 py-10 justify-between" entering={screenEntering}>
            <Animated.View className="items-center mt-4" entering={sectionEntering(0)}>
<View className="flex-row items-center justify-center">
  <Image
    source={require('../assets/images/Logo.png')}
    style={{ width: 230, height: 70 }}
    contentFit="contain"
    contentPosition="center"
  />
</View>
              <Text className="text-slate-500 text-base font-medium mt-1">
                Tu negocio, en orden.
              </Text>
            </Animated.View>

            <Animated.View
              className="items-center justify-center my-6"
              entering={sectionEntering(1)}
            >
              <Image
                source={require('../assets/images/emprendex-login.png')}
                style={{ width: '100%', aspectRatio: 1.5 }}
                contentFit="contain"
                contentPosition="center"
              />
            </Animated.View>

            <Animated.View className="w-full" entering={sectionEntering(2)}>
              <View className="mb-5">
                <Text className="text-slate-700 font-semibold mb-2">Correo electrónico</Text>
                <TextInput
                  className={`rounded-xl border px-4 py-3.5 text-base text-slate-800 ${hasEmailError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
                {hasEmailError ? (
                  <Text className="mt-2 text-sm text-rose-500">Ingresa un correo válido.</Text>
                ) : null}
              </View>

              <View className="mb-2">
                <Text className="text-slate-700 font-semibold mb-2">Contraseña</Text>
                <View className="relative justify-center">
                  <TextInput
                    className={`rounded-xl border px-4 py-3.5 pr-12 text-base text-slate-800 ${hasPasswordError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
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

              <View className="items-end mb-8">
                <TouchableOpacity>
                  <Text className="font-medium text-sm" style={{ color: palette.primaryText }}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>

              {submitError ? (
                <View className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                  <Text className="text-sm font-medium text-rose-600">{submitError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                className="mb-6 rounded-xl py-4 items-center justify-center shadow-sm"
                style={{ backgroundColor: isSubmitting ? palette.primaryDark : palette.primary, shadowColor: palette.shadow }}
                onPress={() => {
                  void handleLogin();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" />
                    <Text className="ml-3 text-white font-semibold text-lg">Ingresando...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-lg">Iniciar sesión</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mb-4">
                <Text className="text-slate-500 font-medium mr-1">¿No tienes cuenta?</Text>
                <Link href="/register" asChild>
                  <TouchableOpacity>
                    <Text className="font-semibold" style={{ color: palette.primaryText }}>Regístrate</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </Animated.View>
          </Animated.View>
      </KeyboardAwareLayout>
    </AppSafeArea>
  );
}

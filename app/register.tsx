import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Eye, EyeOff } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import {
  getReadableAuthError,
  registerUser,
  resolvePostAuthRoute,
} from '@/lib/auth';
import { useAuthSession } from '@/lib/auth-session-context';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const { authState, isHydrated, setAuthenticatedSession } = useAuthSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated || !authState) {
      return;
    }

    router.replace(resolvePostAuthRoute(authState));
  }, [authState, isHydrated, router]);

  const hasEmailError = attemptedSubmit && !EMAIL_REGEX.test(email.trim());
  const hasPasswordError = attemptedSubmit && password.trim().length < 8;
  const hasConfirmPasswordError =
    attemptedSubmit && confirmPassword.trim().length > 0 && confirmPassword !== password;
  const hasNameError = attemptedSubmit && !businessName.trim();
  const hasCategoryError = attemptedSubmit && !businessCategory.trim();

  const handleRegister = async () => {
    setAttemptedSubmit(true);

    if (
      hasEmailError ||
      hasPasswordError ||
      password !== confirmPassword ||
      !confirmPassword.trim() ||
      hasNameError ||
      hasCategoryError
    ) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const session = await registerUser({
        email: email.trim().toLowerCase(),
        password,
        businessName: businessName.trim(),
        businessCategory: businessCategory.trim(),
        currencyCode: 'PEN',
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
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View className="flex-1 bg-white" entering={screenEntering}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <Animated.View className="px-6 pt-4" entering={sectionEntering(0)}>
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full bg-slate-100"
            >
              <ArrowLeft size={22} color="#334155" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View className="px-6 pt-5" entering={sectionEntering(1)}>
            <Text className="text-3xl font-extrabold text-slate-800">
              Crea tu cuenta
            </Text>
            <Text className="mt-2 text-base leading-6 text-slate-500">
              Registra tu acceso y los datos base de tu negocio para empezar.
            </Text>
          </Animated.View>

          <Animated.View
            className="mx-6 mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
            entering={sectionEntering(2)}
          >
            <Text className="mb-4 text-sm font-bold uppercase tracking-wide text-violet-600">
              Tu cuenta
            </Text>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">
                Correo electronico *
              </Text>
              <TextInput
                className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasEmailError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
              {hasEmailError ? (
                <Text className="mt-2 text-sm text-rose-500">
                  Ingresa un correo valido.
                </Text>
              ) : null}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">
                Contrasena *
              </Text>
              <View className="relative justify-center">
                <TextInput
                  className={`rounded-2xl border px-4 py-4 pr-12 text-base text-slate-800 ${hasPasswordError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                  placeholder="Minimo 8 caracteres"
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
                  La contrasena debe tener al menos 8 caracteres.
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-sm font-semibold text-slate-700">
                Confirma tu contrasena *
              </Text>
              <View className="relative justify-center">
                <TextInput
                  className={`rounded-2xl border px-4 py-4 pr-12 text-base text-slate-800 ${hasConfirmPasswordError || (attemptedSubmit && !confirmPassword.trim()) ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                  placeholder="Repite tu contrasena"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() =>
                    setShowConfirmPassword((currentValue) => !currentValue)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
              {attemptedSubmit && !confirmPassword.trim() ? (
                <Text className="mt-2 text-sm text-rose-500">
                  Confirma tu contrasena.
                </Text>
              ) : null}
              {hasConfirmPasswordError ? (
                <Text className="mt-2 text-sm text-rose-500">
                  Las contrasenas no coinciden.
                </Text>
              ) : null}
            </View>
          </Animated.View>

          <Animated.View
            className="mx-6 mt-5 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
            entering={sectionEntering(3)}
          >
            <Text className="mb-4 text-sm font-bold uppercase tracking-wide text-violet-600">
              Datos del negocio
            </Text>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">
                Nombre del negocio *
              </Text>
              <TextInput
                className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasNameError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                placeholder="Ej. Dulce Taller"
                placeholderTextColor="#94a3b8"
                value={businessName}
                onChangeText={setBusinessName}
              />
              {hasNameError ? (
                <Text className="mt-2 text-sm text-rose-500">
                  Ingresa el nombre del negocio.
                </Text>
              ) : null}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">
                Rubro principal *
              </Text>
              <TextInput
                className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasCategoryError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                placeholder="Ej. Pasteleria personalizada"
                placeholderTextColor="#94a3b8"
                value={businessCategory}
                onChangeText={setBusinessCategory}
              />
              {hasCategoryError ? (
                <Text className="mt-2 text-sm text-rose-500">
                  Ingresa el rubro principal.
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-3 text-sm font-semibold text-slate-700">
                Moneda base
              </Text>
              <View className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4">
                <View className="flex-row items-center">
                  <CreditCard size={16} color="#7c3aed" />
                  <Text className="ml-2 font-semibold text-violet-700">
                    Soles peruanos (S/)
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View className="px-6 pt-6" entering={sectionEntering(4)}>
            {submitError ? (
              <View className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <Text className="text-sm font-medium text-rose-600">
                  {submitError}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              className={`items-center rounded-2xl py-4 ${isSubmitting ? 'bg-violet-500' : 'bg-violet-600'}`}
              onPress={() => {
                void handleRegister();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" />
                  <Text className="ml-3 text-lg font-bold text-white">
                    Creando cuenta...
                  </Text>
                </View>
              ) : (
                <Text className="text-lg font-bold text-white">
                  Crear cuenta y continuar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="mt-4 items-center" onPress={() => router.back()}>
              <Text className="font-medium text-violet-600">
                Ya tengo cuenta, volver
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

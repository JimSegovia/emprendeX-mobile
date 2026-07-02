import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image as RNImage, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { AppSafeArea } from '@/components/AppSafeArea';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Eye, EyeOff } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { getColorPalette } from '@/lib/account-preferences';
import { getReadableAuthError, registerUser, resolvePostAuthRoute } from '@/lib/auth';
import { useAuthSession } from '@/lib/auth-session-context';
import { DNI_LENGTH, isValidDni, sanitizeDniInput } from '@/lib/dni';
import { AUTH_PASSWORD_MIN_LENGTH } from '@/lib/runtime-config';
import { AttachmentSheet } from '@/components/ui/attachment-sheet';
import { uploadBusinessLogo } from '@/lib/business-preferences';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const palette = getColorPalette('violet');
  const { authState, isHydrated, setAuthenticatedSession } = useAuthSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
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
  const [selectedLogoUri, setSelectedLogoUri] = useState<string | null>(null);
  const [showLogoSheet, setShowLogoSheet] = useState(false);
  const [logoPreviewHeight, setLogoPreviewHeight] = useState(160);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (!selectedLogoUri) return;
    const scheme = selectedLogoUri.split(':')[0];
    if (scheme === 'ph' || scheme === 'assets-library') {
      setLogoPreviewHeight(160);
      return;
    }
    RNImage.getSize(
      selectedLogoUri,
      (width, height) => {
        const maxWidth = screenWidth - 72;
        setLogoPreviewHeight(Math.min(height > 0 ? (maxWidth * height) / width : 160, 200));
      },
      () => setLogoPreviewHeight(160),
    );
  }, [selectedLogoUri, screenWidth]);

  useEffect(() => {
    if (!isHydrated || !authState) {
      return;
    }

    router.replace(resolvePostAuthRoute(authState));
  }, [authState, isHydrated, router]);

  const hasFirstNameError = attemptedSubmit && !firstName.trim();
  const hasLastNameError = attemptedSubmit && !lastName.trim();
  const hasDniError = attemptedSubmit && !isValidDni(dni);
  const hasPhoneError = attemptedSubmit && !phone.trim();
  const hasEmailError = attemptedSubmit && !EMAIL_REGEX.test(email.trim());
  const hasPasswordError =
    attemptedSubmit && password.trim().length < AUTH_PASSWORD_MIN_LENGTH;
  const hasConfirmPasswordError =
    attemptedSubmit && confirmPassword.trim().length > 0 && confirmPassword !== password;
  const hasNameError = attemptedSubmit && !businessName.trim();
  const hasCategoryError = attemptedSubmit && !businessCategory.trim();

  const handleRegister = async () => {
    setAttemptedSubmit(true);

    if (
      hasFirstNameError ||
      hasLastNameError ||
      hasDniError ||
      hasPhoneError ||
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
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dni,
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,
        businessName: businessName.trim(),
        businessCategory: businessCategory.trim(),
      });

      await setAuthenticatedSession(session);

      if (selectedLogoUri && session.accessToken) {
        try {
          await uploadBusinessLogo(session.accessToken, selectedLogoUri);
        } catch {
          // Logo upload failure is non-blocking
        }
      }

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

          <Animated.View className="px-6 pt-5" entering={sectionEntering(1)}>
            <Text className="text-2xl font-semibold text-slate-800">Crea tu cuenta</Text>
            <Text className="mt-2 text-base leading-6 text-slate-500">
              Registra tu acceso y los datos base de tu negocio para empezar.
            </Text>
          </Animated.View>

          <Animated.View
            className="mx-6 mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
            entering={sectionEntering(2)}
          >
            <Text className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: palette.primaryText }}>
              Tu cuenta
            </Text>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">Nombres *</Text>
              <TextInput
                className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasFirstNameError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                placeholder="Ej. Juan"
                placeholderTextColor="#94a3b8"
                value={firstName}
                onChangeText={setFirstName}
              />
              {hasFirstNameError ? (
                <Text className="mt-2 text-sm text-rose-500">Ingresa tus nombres.</Text>
              ) : null}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">Apellidos *</Text>
              <TextInput
                className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasLastNameError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                placeholder="Ej. Perez"
                placeholderTextColor="#94a3b8"
                value={lastName}
                onChangeText={setLastName}
              />
              {hasLastNameError ? (
                <Text className="mt-2 text-sm text-rose-500">Ingresa tus apellidos.</Text>
              ) : null}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">DNI *</Text>
              <TextInput
                className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasDniError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
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

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">Celular *</Text>
              <TextInput
                className={`rounded-2xl border px-4 py-4 text-base text-slate-800 ${hasPhoneError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                placeholder="Ej. 999888777"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              {hasPhoneError ? (
                <Text className="mt-2 text-sm text-rose-500">Ingresa tu número de celular.</Text>
              ) : null}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">
                Correo electrónico *
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
                <Text className="mt-2 text-sm text-rose-500">Ingresa un correo válido.</Text>
              ) : null}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">Contraseña *</Text>
              <View className="relative justify-center">
                <TextInput
                  className={`rounded-2xl border px-4 py-4 pr-12 text-base text-slate-800 ${hasPasswordError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                    placeholder={`Mínimo ${AUTH_PASSWORD_MIN_LENGTH} caracteres`}
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

            <View>
              <Text className="mb-2 text-sm font-semibold text-slate-700">
                Confirma tu contraseña *
              </Text>
              <View className="relative justify-center">
                <TextInput
                  className={`rounded-2xl border px-4 py-4 pr-12 text-base text-slate-800 ${hasConfirmPasswordError || (attemptedSubmit && !confirmPassword.trim()) ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
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
              {attemptedSubmit && !confirmPassword.trim() ? (
                <Text className="mt-2 text-sm text-rose-500">Confirma tu contraseña.</Text>
              ) : null}
              {hasConfirmPasswordError ? (
                <Text className="mt-2 text-sm text-rose-500">Las contraseñas no coinciden.</Text>
              ) : null}
            </View>
          </Animated.View>

          <Animated.View
            className="mx-6 mt-5 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
            entering={sectionEntering(3)}
          >
            <Text className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: palette.primaryText }}>
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
                <Text className="mt-2 text-sm text-rose-500">Ingresa el nombre del negocio.</Text>
              ) : null}
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
              {hasCategoryError ? (
                <Text className="mt-2 text-sm text-rose-500">Ingresa el rubro principal.</Text>
              ) : null}
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700">Logo del negocio</Text>

              <TouchableOpacity
                className="overflow-hidden rounded-2xl border border-slate-200"
                activeOpacity={0.85}
                onPress={() => setShowLogoSheet(true)}
                style={{ height: logoPreviewHeight }}
              >
                {selectedLogoUri ? (
                  <Image
                    source={{ uri: selectedLogoUri }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center bg-slate-50">
                    <Camera size={24} color="#94a3b8" />
                    <Text className="mt-2 text-sm font-semibold text-slate-400">Agregar logo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View className="px-6 pt-6" entering={sectionEntering(4)}>
            {submitError ? (
              <View className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <Text className="text-sm font-medium text-rose-600">{submitError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              className="items-center rounded-2xl py-4"
              style={{ backgroundColor: isSubmitting ? palette.primaryDark : palette.primary }}
              onPress={() => {
                void handleRegister();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" />
                  <Text className="ml-3 text-lg font-semibold text-white">Creando cuenta...</Text>
                </View>
              ) : (
                <Text className="text-lg font-semibold text-white">Crear cuenta y continuar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="mt-4 items-center" onPress={() => router.back()}>
              <Text className="font-medium" style={{ color: palette.primaryText }}>Ya tengo cuenta, volver</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAwareLayout>
      </Animated.View>

      {showLogoSheet ? (
        <AttachmentSheet
          visible={showLogoSheet}
          onClose={() => setShowLogoSheet(false)}
          onAttach={(uris) => {
            if (uris[0]) {
              setSelectedLogoUri(uris[0]);
            }
            setShowLogoSheet(false);
          }}
        />
      ) : null}
    </AppSafeArea>
  );
}

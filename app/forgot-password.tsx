import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { router } from 'expo-router';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Google Icon Component
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.08-.2-.17-.42-.23-.63z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </Svg>
);

// Custom Padlock Illustration SVG
const PadlockIllustration = () => (
  <View className="relative w-28 h-28 items-center justify-center">
    <Svg width={110} height={110} viewBox="0 0 100 100">
      {/* Decorative stars */}
      <Path d="M12,22 L13.5,25 L16.5,25.8 L13.5,26.6 L12,29.6 L10.5,26.6 L7.5,25.8 L10.5,25 L12,22 Z" fill="#A78BFA" opacity="0.6" />
      <Path d="M88,18 L89,20 L91,20.5 L89,21 L88,23 L87,21 L85,20.5 L87,20 L88,18 Z" fill="#A78BFA" opacity="0.6" />
      <Circle cx="84" cy="52" r="2" fill="#A78BFA" opacity="0.4" />
      <Circle cx="16" cy="68" r="3" fill="#A78BFA" opacity="0.4" />

      {/* Lock Shackle */}
      <Path
        d="M32,45 V30 A18,18 0 0,1 68,30 V45"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* Lock Body */}
      <Rect
        x="24"
        y="44"
        width="52"
        height="44"
        rx="10"
        fill="#FFFFFF"
        opacity="0.2"
      />
      {/* Lock Keyhole */}
      <Circle cx="50" cy="62" r="5" fill="#FFFFFF" opacity="0.3" />
      <Path d="M47,62 L53,62 L52,76 L48,76 Z" fill="#FFFFFF" opacity="0.3" />

      {/* White circle badge */}
      <Circle cx="76" cy="74" r="13" fill="#FFFFFF" />
    </Svg>
    {/* Question mark text inside badge */}
    <View className="absolute bottom-[13] right-[11] w-6 h-6 items-center justify-center">
      <Text className="text-violet-700 font-bold text-base">?</Text>
    </View>
  </View>
);

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mockToken, setMockToken] = useState<string | null>(null);

  const hasEmailError = attemptedSubmit && !EMAIL_REGEX.test(email.trim());

  const handleSendLink = async () => {
    setAttemptedSubmit(true);

    if (hasEmailError || !email.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const token = `mock-reset-token-${Date.now()}`;
    setMockToken(token);
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <AppSafeArea className="flex-1 bg-violet-700" edges={['top']}>
      <Animated.View className="flex-1 bg-violet-700" entering={screenEntering}>
        <KeyboardAwareLayout contentContainerStyle={{ flexGrow: 1 }}>
          
          {/* Header Section */}
          <View className="px-6 pt-4 pb-8 bg-violet-700">
            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-violet-600/50 mb-6"
            >
              <ArrowLeft size={22} color="white" />
            </TouchableOpacity>

            {/* Title & Image Layout */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-3xl font-extrabold text-white tracking-tight">
                  Olvidé mi contraseña
                </Text>
                <Text className="mt-2 text-base text-violet-200 leading-5">
                  Te ayudaremos a recuperar el acceso a tu cuenta
                </Text>
              </View>
              <PadlockIllustration />
            </View>
          </View>

          {/* Main Card Content */}
          <View className="flex-1 bg-white rounded-t-[36px] px-6 pt-10 pb-8 shadow-2xl">
            {isSuccess ? (
              <Animated.View entering={sectionEntering(0)} className="flex-1 items-center justify-center py-6">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 size={48} color="#10B981" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 text-center mb-3">
                  ¡Enlace enviado!
                </Text>
                <Text className="text-base text-slate-500 text-center leading-6 mb-8">
                  Hemos enviado un correo a <Text className="font-semibold text-slate-800">{email.trim().toLowerCase()}</Text> con las instrucciones para restablecer tu contraseña.
                </Text>

                {mockToken && (
                  <View className="w-full bg-violet-50 border border-violet-100 rounded-3xl p-5 items-center mb-8">
                    <Text className="text-sm font-semibold text-violet-800 mb-1">Modo Demo</Text>
                    <Text className="text-xs text-violet-600 text-center mb-4">
                      Simula el clic del enlace recibido por correo electrónico:
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/reset-password', params: { token: mockToken } })}
                      className="bg-violet-700 py-3 px-6 rounded-2xl w-full"
                    >
                      <Text className="text-white text-center font-bold text-sm">
                        Simular clic en enlace
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setIsSuccess(false)}
                  className="border border-slate-200 py-4 px-6 rounded-2xl w-full"
                >
                  <Text className="text-slate-700 text-center font-semibold text-base">
                    Volver a intentar
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.View className="flex-1 justify-between" entering={sectionEntering(0)}>
                <View>
                  {/* Top Centered Mail Icon */}
                  <View className="items-center mb-6">
                    <View className="w-20 h-20 bg-violet-50 rounded-full items-center justify-center">
                      <Mail size={32} color="#6D28D9" />
                    </View>
                    <Text className="text-xl font-bold text-slate-900 mt-6 text-center">
                      Ingresa tu correo electrónico
                    </Text>
                    <Text className="text-sm text-slate-500 mt-2 text-center leading-relaxed">
                      Te enviaremos un enlace para que puedas restablecer tu contraseña.
                    </Text>
                  </View>

                  {/* Input Correo electrónico */}
                  <View className="mb-6">
                    <Text className="mb-2 text-sm font-bold text-slate-700">
                      Correo electrónico
                    </Text>
                    <View className="relative justify-center">
                      <TextInput
                        className={`rounded-2xl border px-4 py-4 pl-12 text-base text-slate-800 ${
                          hasEmailError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
                        }`}
                        placeholder="ejemplo@correo.com"
                        placeholderTextColor="#94A3B8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          if (attemptedSubmit) setAttemptedSubmit(false);
                        }}
                      />
                      <View className="absolute left-4">
                        <Mail size={20} color="#94A3B8" />
                      </View>
                    </View>
                    {hasEmailError && (
                      <Text className="mt-2 text-sm text-rose-500 font-medium pl-1">
                        Ingresa un correo válido.
                      </Text>
                    )}
                  </View>

                  {submitError && (
                    <View className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                      <Text className="text-sm font-medium text-rose-600">{submitError}</Text>
                    </View>
                  )}

                  {/* Submit Button */}
                  <TouchableOpacity
                    className="items-center justify-center rounded-2xl py-4 bg-violet-700 active:bg-violet-800"
                    onPress={() => {
                      void handleSendLink();
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator color="white" size="small" />
                        <Text className="ml-3 text-base font-bold text-white">Enviando...</Text>
                      </View>
                    ) : (
                      <Text className="text-base font-bold text-white">
                        Enviar enlace de recuperación
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Divider with circle */}
                  <View className="flex-row items-center my-8">
                    <View className="flex-1 h-[1px] bg-slate-100" />
                    <View className="mx-4 w-2 h-2 rounded-full border border-slate-300 bg-white" />
                    <View className="flex-1 h-[1px] bg-slate-100" />
                  </View>

                  {/* Google Sign In Button */}
                  <TouchableOpacity
                    className="flex-row items-center justify-center border border-slate-200 rounded-2xl py-4 bg-white active:bg-slate-50"
                    onPress={() => {
                      // Demo alert or dummy trigger
                    }}
                  >
                    <GoogleIcon />
                    <Text className="ml-3 text-base font-bold text-slate-700">
                      Continuar con Google
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Return link */}
                <TouchableOpacity
                  className="items-center py-4 mt-8"
                  onPress={() => router.replace('/')}
                >
                  <Text className="font-semibold text-violet-700 text-sm">
                    Volver al inicio de sesión
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

        </KeyboardAwareLayout>
      </Animated.View>
    </AppSafeArea>
  );
}

import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Lock, Check } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// Custom Shield Illustration SVG
const ShieldIllustration = () => (
  <View className="relative w-28 h-28 items-center justify-center">
    <Svg width={110} height={110} viewBox="0 0 100 100">
      {/* Stars/Dots decoration */}
      <Path d="M10,35 L11.5,38 L14.5,38.8 L11.5,39.6 L10,42.6 L8.5,39.6 L5.5,38.8 L8.5,38 L10,35 Z" fill="#A78BFA" opacity="0.6" />
      <Path d="M92,42 L93,44 L95,44.5 L93,45 L92,47 L91,45 L89,44.5 L91,44 L92,42 Z" fill="#A78BFA" opacity="0.6" />
      <Circle cx="86" cy="22" r="2.5" fill="#A78BFA" opacity="0.4" />
      <Circle cx="18" cy="80" r="2" fill="#A78BFA" opacity="0.4" />

      {/* Shield Silhouette */}
      <Path
        d="M50,15 C50,15 80,20 80,48 C80,72 50,87 50,87 C50,87 20,72 20,48 C20,20 50,15 50,15 Z"
        fill="#FFFFFF"
        opacity="0.2"
      />
      {/* Inner Shield border */}
      <Path
        d="M50,21 C50,21 74,25 74,48 C74,68 50,80 50,80 C50,80 26,68 26,48 C26,25 50,21 50,21 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        opacity="0.25"
      />
      {/* Padlock Silhouette inside shield */}
      {/* Lock Shackle */}
      <Path
        d="M40,48 V40 A10,10 0 0,1 60,40 V48"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Lock Body */}
      <Rect
        x="34"
        y="46"
        width="32"
        height="26"
        rx="5"
        fill="#FFFFFF"
        opacity="0.75"
      />
      {/* Keyhole */}
      <Circle cx="50" cy="56" r="3" fill="#582CD6" />
      <Path d="M48.5,56 L51.5,56 L51,66 L49,66 Z" fill="#582CD6" />

      {/* Circle badge for check */}
      <Circle cx="76" cy="74" r="13" fill="#FFFFFF" />
    </Svg>
    {/* Check mark text inside badge */}
    <View className="absolute bottom-[13] right-[11] w-6 h-6 items-center justify-center bg-emerald-500 rounded-full border border-white">
      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 6L9 17l-5-5" />
      </Svg>
    </View>
  </View>
);

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password rules validation
  const ruleLength = password.length >= 8;
  const ruleUppercase = /[A-Z]/.test(password);
  const ruleLowercase = /[a-z]/.test(password);
  const ruleSpecialOrNumber = /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password);

  const criteriaMetCount = [ruleLength, ruleUppercase, ruleLowercase, ruleSpecialOrNumber].filter(Boolean).length;

  const getStrengthText = () => {
    if (password.length === 0) return 'Vacía';
    if (criteriaMetCount <= 1) return 'Muy débil';
    if (criteriaMetCount === 2) return 'Media';
    if (criteriaMetCount === 3) return 'Buena';
    return 'Fuerte';
  };

  const getStrengthColor = () => {
    if (password.length === 0) return 'text-slate-400';
    if (criteriaMetCount <= 1) return 'text-rose-500';
    if (criteriaMetCount <= 3) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getStrengthBgColor = () => {
    if (password.length === 0) return 'bg-slate-200';
    if (criteriaMetCount <= 1) return 'bg-rose-500';
    if (criteriaMetCount <= 3) return 'bg-amber-500';
    return 'bg-violet-700';
  };

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleResetPassword = async () => {
    setAttemptedSubmit(true);

    if (criteriaMetCount < 4 || !passwordsMatch || !token) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
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
                  Restablecer contraseña
                </Text>
                <Text className="mt-2 text-base text-violet-200 leading-5">
                  Crea una nueva contraseña segura para tu cuenta
                </Text>
              </View>
              <ShieldIllustration />
            </View>
          </View>

          {/* Main Card Content */}
          <View className="flex-1 bg-white rounded-t-[36px] px-6 pt-10 pb-8 shadow-2xl">
            {!token ? (
              <View className="flex-1 items-center justify-center py-10">
                <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-amber-50">
                  <Lock size={40} color="#D97706" />
                </View>
                <Text className="text-xl font-bold text-slate-800 text-center mb-2">
                  Enlace inválido o expirado
                </Text>
                <Text className="text-sm text-slate-500 text-center leading-5 mb-8">
                  El token de recuperación no es válido. Por favor, solicita un nuevo enlace.
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/forgot-password')}
                  className="bg-violet-700 py-4 px-6 rounded-2xl w-full"
                >
                  <Text className="text-white text-center font-bold text-base">
                    Solicitar nuevo enlace
                  </Text>
                </TouchableOpacity>
              </View>
            ) : isSuccess ? (
              <Animated.View entering={sectionEntering(0)} className="flex-1 items-center justify-center py-6">
                <View className="mb-6 h-20 w-20 items-center justify-center bg-emerald-50 rounded-full">
                  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M20 6L9 17l-5-5" />
                  </Svg>
                </View>
                <Text className="text-2xl font-bold text-slate-900 text-center mb-3">
                  ¡Contraseña actualizada!
                </Text>
                <Text className="text-base text-slate-500 text-center leading-6 mb-8 px-4">
                  Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace('/')}
                  className="bg-violet-700 py-4 px-6 rounded-2xl w-full"
                >
                  <Text className="text-white text-center font-bold text-base">
                    Iniciar sesión
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.View className="flex-1 justify-between" entering={sectionEntering(0)}>
                <View>
                  {/* Field: Nueva contraseña */}
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-bold text-slate-700">
                      Nueva contraseña
                    </Text>
                    <View className="relative justify-center">
                      <TextInput
                        className="rounded-2xl border border-slate-200 px-4 py-4 pl-12 pr-12 text-base text-slate-800 bg-white"
                        placeholder="••••••••••••"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                      />
                      <View className="absolute left-4">
                        <Lock size={20} color="#94A3B8" />
                      </View>
                      <TouchableOpacity
                        className="absolute right-4"
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#94A3B8" />
                        ) : (
                          <Eye size={20} color="#94A3B8" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <View className="mb-5">
                      {/* Progress Bar (4 segments) */}
                      <View className="flex-row space-x-1 h-1.5 w-full mb-3 rounded-full overflow-hidden bg-slate-100">
                        <View className={`flex-1 h-full mr-1 rounded-l-full ${criteriaMetCount >= 1 ? getStrengthBgColor() : 'bg-slate-200'}`} />
                        <View className={`flex-1 h-full mr-1 ${criteriaMetCount >= 2 ? getStrengthBgColor() : 'bg-slate-200'}`} />
                        <View className={`flex-1 h-full mr-1 ${criteriaMetCount >= 3 ? getStrengthBgColor() : 'bg-slate-200'}`} />
                        <View className={`flex-1 h-full rounded-r-full ${criteriaMetCount >= 4 ? getStrengthBgColor() : 'bg-slate-200'}`} />
                      </View>

                      {/* Strength Text Indicator */}
                      <View className="flex-row items-center mb-4">
                        <View className="w-5 h-5 bg-emerald-50 rounded-full items-center justify-center mr-2">
                          <Check size={12} color="#10B981" strokeWidth={3} />
                        </View>
                        <Text className="text-sm font-semibold text-slate-700">
                          Fortaleza:{' '}
                          <Text className={`font-bold ${getStrengthColor()}`}>
                            {getStrengthText()}
                          </Text>
                        </Text>
                      </View>

                      {/* Rules list */}
                      <Text className="text-xs font-semibold text-slate-500 mb-2">
                        Tu contraseña debe tener al menos:
                      </Text>
                      
                      <View className="space-y-1.5">
                        <View className="flex-row items-center mb-1">
                          <Check size={14} color={ruleLength ? '#10B981' : '#94A3B8'} strokeWidth={3} />
                          <Text className={`ml-2 text-xs font-medium ${ruleLength ? 'text-slate-700' : 'text-slate-400'}`}>
                            8 caracteres o más
                          </Text>
                        </View>

                        <View className="flex-row items-center mb-1">
                          <Check size={14} color={ruleUppercase ? '#10B981' : '#94A3B8'} strokeWidth={3} />
                          <Text className={`ml-2 text-xs font-medium ${ruleUppercase ? 'text-slate-700' : 'text-slate-400'}`}>
                            Una letra mayúscula
                          </Text>
                        </View>

                        <View className="flex-row items-center mb-1">
                          <Check size={14} color={ruleLowercase ? '#10B981' : '#94A3B8'} strokeWidth={3} />
                          <Text className={`ml-2 text-xs font-medium ${ruleLowercase ? 'text-slate-700' : 'text-slate-400'}`}>
                            Una letra minúscula
                          </Text>
                        </View>

                        <View className="flex-row items-center mb-1">
                          <Check size={14} color={ruleSpecialOrNumber ? '#10B981' : '#94A3B8'} strokeWidth={3} />
                          <Text className={`ml-2 text-xs font-medium ${ruleSpecialOrNumber ? 'text-slate-700' : 'text-slate-400'}`}>
                            Un número o carácter especial
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Field: Confirmar nueva contraseña */}
                  <View className="mb-6 mt-4">
                    <Text className="mb-2 text-sm font-bold text-slate-700">
                      Confirmar nueva contraseña
                    </Text>
                    <View className="relative justify-center">
                      <TextInput
                        className="rounded-2xl border border-slate-200 px-4 py-4 pl-12 pr-12 text-base text-slate-800 bg-white"
                        placeholder="••••••••••••"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                      <View className="absolute left-4">
                        <Lock size={20} color="#94A3B8" />
                      </View>
                      <TouchableOpacity
                        className="absolute right-4"
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} color="#94A3B8" />
                        ) : (
                          <Eye size={20} color="#94A3B8" />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Matching Validation Feedback */}
                    {passwordsMatch && (
                      <View className="flex-row items-center mt-3 pl-1">
                        <View className="w-5 h-5 bg-emerald-50 rounded-full items-center justify-center mr-2">
                          <Check size={12} color="#10B981" strokeWidth={3} />
                        </View>
                        <Text className="text-xs font-bold text-emerald-600">
                          Las contraseñas coinciden
                        </Text>
                      </View>
                    )}

                    {attemptedSubmit && !passwordsMatch && confirmPassword.length > 0 && (
                      <Text className="mt-2 text-xs font-medium text-rose-500 pl-1">
                        Las contraseñas no coinciden.
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
                    className={`items-center justify-center rounded-2xl py-4 ${
                      criteriaMetCount === 4 && passwordsMatch
                        ? 'bg-violet-700 active:bg-violet-800'
                        : 'bg-slate-300'
                    }`}
                    onPress={() => {
                      void handleResetPassword();
                    }}
                    disabled={isSubmitting || criteriaMetCount < 4 || !passwordsMatch}
                  >
                    {isSubmitting ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator color="white" size="small" />
                        <Text className="ml-3 text-base font-bold text-white">Actualizando...</Text>
                      </View>
                    ) : (
                      <Text className="text-base font-bold text-white">
                        Actualizar contraseña
                      </Text>
                    )}
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

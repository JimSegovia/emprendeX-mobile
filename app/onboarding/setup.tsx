import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppSafeArea } from '@/components/AppSafeArea';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { router } from 'expo-router';
import { Check, ChevronDown, ChevronLeft, Info } from 'lucide-react-native';
import Animated, { sectionEntering } from '@/components/ui/motion';
import { getReadableAuthError, resolvePostAuthRoute, updateOnboardingSetup } from '@/lib/auth';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { BUSINESS_CATEGORIES } from '@/lib/business-categories';

export default function SetupScreen() {
  const { palette } = useAccountPreferences();
  const { accessToken, authState, isHydrated, updateAuthState } = useAuthSession();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!authState) {
      return;
    }

    setBusinessName(authState.user.businessProfile.name ?? '');
    setCategory(authState.user.businessProfile.category ?? '');
  }, [authState]);

  useEffect(() => {
    if (!isHydrated || accessToken) {
      return;
    }

    router.replace('/');
  }, [accessToken, isHydrated]);

  const isFormValid = businessName.trim().length > 0 && category !== '';

  const handleContinue = async () => {
    if (!isFormValid || !accessToken) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const nextAuthState = await updateOnboardingSetup(accessToken, {
        businessName: businessName.trim(),
        businessCategory: category,
      });

      updateAuthState(nextAuthState);
      router.replace(resolvePostAuthRoute(nextAuthState));
    } catch (error) {
      setSubmitError(getReadableAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/modules');
  };

  if (!isHydrated || !accessToken) {
    return (
      <AppSafeArea className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={palette.primary} />
      </AppSafeArea>
    );
  }

  return (
    <AppSafeArea className="flex-1 bg-white">
      <View className="flex-1">
        <Animated.View
          className="flex-row items-center px-4 pt-4 mb-2"
          entering={sectionEntering(0)}
        >
          <TouchableOpacity className="p-2 rounded-full" onPress={() => router.back()}>
            <ChevronLeft size={24} color="#334155" />
          </TouchableOpacity>
        </Animated.View>

        <KeyboardAwareLayout style={{ paddingHorizontal: 24 }}>
          <Animated.View entering={sectionEntering(1)} className="items-center mb-8">
            <Text className="text-2xl font-semibold text-slate-800 text-center mb-3">
              Configura tu negocio
            </Text>
            <Text className="text-slate-500 text-center text-base px-4 leading-relaxed mb-6">
              Ingresa la información básica de tu negocio para empezar.
            </Text>

            <View className="flex-row justify-center space-x-2">
              <View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: palette.primary }} />
              <View className="h-1.5 w-12 rounded-full" style={{ backgroundColor: palette.primary }} />
              <View className="h-1.5 w-12 bg-slate-200 rounded-full" />
            </View>
          </Animated.View>

          <Animated.View entering={sectionEntering(2)} className="space-y-6">
            <View>
              <Text className="text-sm font-semibold text-slate-700 mb-2">Nombre de tu negocio</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                placeholder="Ej. Pastelería Dulce Momento"
                placeholderTextColor="#94a3b8"
                value={businessName}
                onChangeText={setBusinessName}
              />
              <Text className="text-xs text-slate-400 mt-1.5">
                Usa el nombre con el que identificarás tu negocio.
              </Text>
            </View>

            <View>
              <Text className="text-sm font-semibold text-slate-700 mb-2">Rubro o categoría</Text>
              <TouchableOpacity
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text className={`text-base ${category ? 'text-slate-800' : 'text-slate-400'}`}>
                  {category || 'Selecciona el rubro de tu negocio'}
                </Text>
                <ChevronDown size={20} color="#94a3b8" />
              </TouchableOpacity>
              <Text className="text-xs text-slate-400 mt-1.5">
                Esto nos ayuda a personalizar tu experiencia.
              </Text>
            </View>

            <View
              className="rounded-2xl p-4 flex-row items-start border mt-4"
              style={{ backgroundColor: palette.primarySoft, borderColor: palette.primaryBorder }}
            >
              <View className="mt-0.5 mr-3">
                <Info size={20} color={palette.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-sm mb-1" style={{ color: palette.primaryText }}>
                  ¿Por qué te pedimos esto?
                </Text>
                <Text className="text-xs leading-5" style={{ color: palette.primaryText }}>
                  Con esta información configuraremos tu espacio de trabajo y tus reportes con los
                  valores y opciones correctas para tu negocio.
                </Text>
              </View>
            </View>
          </Animated.View>
          </KeyboardAwareLayout>

        <Animated.View
          className="px-6 py-6 pb-8 pt-4 bg-white border-t border-slate-50"
          entering={sectionEntering(3)}
        >
          {submitError ? (
            <View className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
              <Text className="text-sm font-medium text-rose-600">{submitError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            className="w-full rounded-xl py-4 items-center justify-center mb-4"
            style={{ backgroundColor: isFormValid && !isSubmitting ? palette.primary : '#e2e8f0' }}
            disabled={!isFormValid || isSubmitting}
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
                Continuar
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-2 items-center justify-center"
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text className="font-semibold text-sm" style={{ color: palette.primaryText }}>Ahora no, lo haré después</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl pt-6 pb-8 px-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-semibold text-slate-800">Selecciona el rubro</Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                className="p-2 bg-slate-100 rounded-full"
              >
                <ChevronDown size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={BUSINESS_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center justify-between py-4 border-b border-slate-100"
                  onPress={() => {
                    setCategory(item);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text
                    className={`text-base ${category === item ? 'font-semibold' : 'text-slate-700'}`}
                    style={{ color: category === item ? palette.primaryText : undefined }}
                  >
                    {item}
                  </Text>
                  {category === item ? <Check size={20} color={palette.primary} /> : null}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </AppSafeArea>
  );
}

import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { COLOR_PALETTES } from '@/lib/account-preferences';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { getReadableAuthError, updateCurrentUserProfile } from '@/lib/auth';
import { useAuthSession } from '@/lib/auth-session-context';
import { BUSINESS_CATEGORIES } from '@/lib/business-categories';
import { getReadableBusinessPreferencesError } from '@/lib/business-preferences';
import { useModulePreferences } from '@/lib/module-preferences-context';
import { DEFAULT_MODULES, type ModuleDefinition, type ModuleId } from '@/lib/modules';
import {
  createPublicCatalogSharePayload,
  fetchBusinessPublicCatalog,
  getReadablePublicCatalogError,
  type BusinessPublicCatalogSettings,
  updateBusinessPublicCatalog,
} from '@/lib/public-catalog';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { Briefcase, Crown, Globe, GripVertical, Link2, Menu, Paintbrush, Pencil } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const premiumModules = [
  {
    id: 'calendario',
    label: 'Calendario',
    detail: 'Agenda visual, recordatorios y estados.',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    detail: 'Comparativos, periodos y tendencias.',
  },
  {
    id: 'alertas-pro',
    label: 'Alertas inteligentes',
    detail: 'Recordatorios automáticos y foco en pendientes clave.',
  },
];

export default function ConfiguracionScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const navigation = useNavigation();
  const router = useRouter();
  const {
    colorPaletteId,
    isHydrated: areAccountPreferencesHydrated,
    isSaving: isSavingPreferences,
    palette,
    setColorPalette,
  } = useAccountPreferences();
  const { accessToken, authState, signOut, updateAuthState } = useAuthSession();
  const { isHydrated, visibleOrder, setOrder, reset } = useModulePreferences();

  const [localOrder, setLocalOrder] = useState<ModuleId[]>(visibleOrder);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isReorderingModules, setIsReorderingModules] = useState(false);
  const [catalogSettings, setCatalogSettings] =
    useState<BusinessPublicCatalogSettings | null>(null);
  const [catalogSlug, setCatalogSlug] = useState('');
  const [catalogIsPublic, setCatalogIsPublic] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [isCatalogSaving, setIsCatalogSaving] = useState(false);
  const [isCatalogSharing, setIsCatalogSharing] = useState(false);
  useEffect(() => setLocalOrder(visibleOrder), [visibleOrder]);

  const modulesById = useMemo(() => {
    return new Map<ModuleId, ModuleDefinition>(
      DEFAULT_MODULES.map((module) => [module.id, module]),
    );
  }, []);

  const orderedModules = useMemo(() => {
    return localOrder.map((id) => modulesById.get(id)).filter(Boolean) as ModuleDefinition[];
  }, [localOrder, modulesById]);
  const selectedPalette = useMemo(() => {
    return COLOR_PALETTES.find((option) => option.id === colorPaletteId) ?? COLOR_PALETTES[0];
  }, [colorPaletteId]);
  const moduleDragHitSlop = useMemo(
    () => ({ left: -Math.max(windowWidth - 160, 0) }),
    [windowWidth],
  );

  const businessProfile = authState?.user.businessProfile;
  const ownerDisplayName = authState
    ? [authState.user.firstNames, authState.user.lastNames].filter(Boolean).join(' ')
    : 'Pendiente';
  const planName = authState?.user.activeSubscription?.planName ?? 'Sin plan';
  const businessDetails = [
    { label: 'Nombre', value: businessProfile?.name ?? 'Pendiente' },
    { label: 'Rubro', value: businessProfile?.category ?? 'Pendiente' },
    { label: 'Responsable', value: ownerDisplayName },
    { label: 'Celular', value: authState?.user.phone ?? 'Pendiente' },
    { label: 'DNI', value: authState?.user.dni ?? 'Pendiente' },
    { label: 'Correo', value: authState?.user.email ?? 'Pendiente' },
    { label: 'Plan', value: planName },
  ];

  useEffect(() => {
    if (!authState) {
      return;
    }

    setFirstName(authState.user.firstNames);
    setLastName(authState.user.lastNames);
    setBusinessName(authState.user.businessProfile.name ?? '');
    setBusinessCategory(authState.user.businessProfile.category ?? '');
  }, [authState]);

  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedBusinessName = businessName.trim();
  const trimmedBusinessCategory = businessCategory.trim();
  const isProfileFormValid =
    trimmedFirstName.length >= 2 &&
    trimmedLastName.length >= 2 &&
    trimmedBusinessName.length >= 2 &&
    trimmedBusinessCategory.length >= 2;
  const hasProfileChanges =
    trimmedFirstName !== (authState?.user.firstNames.trim() ?? '') ||
    trimmedLastName !== (authState?.user.lastNames.trim() ?? '') ||
    trimmedBusinessName !== (businessProfile?.name?.trim() ?? '') ||
    trimmedBusinessCategory !== (businessProfile?.category?.trim() ?? '');

  useEffect(() => {
    const loadCatalogSettings = async () => {
      if (!accessToken) {
        return;
      }

      setIsCatalogLoading(true);
      setCatalogError(null);

      try {
        const response = await fetchBusinessPublicCatalog(accessToken);
        setCatalogSettings(response);
        setCatalogSlug(response.publicCatalogSlug);
        setCatalogIsPublic(response.catalogIsPublic);
      } catch (loadError) {
        setCatalogError(getReadablePublicCatalogError(loadError));
      } finally {
        setIsCatalogLoading(false);
      }
    };

    void loadCatalogSettings();
  }, [accessToken]);

  const persistLocalOrder = (nextOrder: ModuleId[]) => {
    setLocalOrder(nextOrder);
    setOrder(nextOrder);
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleLogout = async () => {
    await signOut();

    // Obtener el navegador raíz para evitar el conflicto de rutas con (tabs)/index
    const rootNav = navigation.getParent('root') || navigation.getParent()?.getParent();
    if (rootNav) {
      rootNav.reset({
        index: 0,
        routes: [{ name: 'index' }],
      });
    } else {
      router.replace('/');
    }
  };

  const handleSaveCatalogSettings = async () => {
    if (!accessToken || isCatalogSaving) {
      return;
    }

    setIsCatalogSaving(true);
    setCatalogError(null);

    try {
      const response = await updateBusinessPublicCatalog(accessToken, {
        publicCatalogSlug: catalogSlug.trim(),
        catalogIsPublic,
      });

      setCatalogSettings(response);
      setCatalogSlug(response.publicCatalogSlug);
      setCatalogIsPublic(response.catalogIsPublic);
    } catch (saveError) {
      setCatalogError(getReadablePublicCatalogError(saveError));
    } finally {
      setIsCatalogSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!accessToken || isProfileSaving || !isProfileFormValid) {
      return;
    }

    setIsProfileSaving(true);
    setProfileError(null);

    try {
      const nextAuthState = await updateCurrentUserProfile(accessToken, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        businessName: trimmedBusinessName,
        businessCategory: trimmedBusinessCategory,
      });

      updateAuthState(nextAuthState);
      setIsEditingProfile(false);
    } catch (saveError) {
      setProfileError(getReadableAuthError(saveError));
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleShareCatalog = async () => {
    if (!catalogSettings || isCatalogSharing) {
      return;
    }

    if (!catalogIsPublic) {
      Alert.alert(
        'Catálogo no publicado',
        'Activa tu catálogo público antes de compartirlo.',
      );
      return;
    }

    setIsCatalogSharing(true);

    try {
      await Share.share(
        createPublicCatalogSharePayload(
          catalogSettings.publicCatalogUrl,
          'Hola, te comparto nuestro catálogo público para que explores lo que tenemos disponible.',
        ),
      );
    } catch (shareError) {
      Alert.alert(
        'No se pudo compartir el catálogo',
        getReadablePublicCatalogError(shareError),
      );
    } finally {
      setIsCatalogSharing(false);
    }
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={openDrawer} className="mr-4">
            <Menu color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">Configuración</Text>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        scrollEnabled={!isReorderingModules}
      >
        <Animated.View
          className="mb-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
          entering={sectionEntering(1)}
        >
          <View className="mb-4 flex-row items-center">
            <View
              className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: palette.primarySoft }}
            >
              <Briefcase size={22} color={palette.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-slate-800">Datos del negocio</Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center rounded-full border bg-white px-3 py-2"
              style={{ borderColor: palette.primaryBorder }}
              onPress={() => {
                setProfileError(null);
                setIsEditingProfile(true);
              }}
              activeOpacity={0.8}
            >
              <Pencil size={14} color={palette.primaryText} />
              <Text className="ml-2 text-xs font-semibold" style={{ color: palette.primaryText }}>
                Editar
              </Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-2xl bg-slate-50 p-4">
            {businessDetails.map((detail, index) => (
              <View
                key={detail.label}
                className={`flex-row items-center justify-between ${index === 0 ? '' : 'mt-3'}`}
              >
                <Text className="w-28 pr-4 text-sm text-slate-500">{detail.label}</Text>
                <Text className="flex-1 text-right font-semibold leading-5 text-slate-800">
                  {detail.value}
                </Text>
              </View>
            ))}
          </View>

        </Animated.View>

        <Animated.View
          className="mb-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
          entering={sectionEntering(2)}
        >
          <View className="mb-4 flex-row items-center">
            <View
              className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: palette.primarySoft }}
            >
              <Paintbrush size={22} color={palette.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-slate-800">Preferencias de cuenta</Text>
              <Text className="mt-1 text-sm text-slate-500">Elige la paleta de la aplicación.</Text>
            </View>
          </View>

          <View
            className="mb-4 rounded-[28px] border p-4"
            style={{
              backgroundColor: selectedPalette.primarySoft,
              borderColor: selectedPalette.primaryBorder,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="mr-4 flex-1 flex-row items-center">
                <View className="mr-3 flex-row">
                  <View
                    className="h-10 w-10 rounded-full border-2 border-white"
                    style={{ backgroundColor: selectedPalette.primary }}
                  />
                  <View
                    className="-ml-3 h-10 w-10 rounded-full border-2 border-white"
                    style={{ backgroundColor: selectedPalette.primaryBorder }}
                  />
                  <View
                    className="-ml-3 h-10 w-10 rounded-full border-2 border-white"
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-800">
                    {selectedPalette.label}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-slate-600">
                    {selectedPalette.description}
                  </Text>
                </View>
              </View>

              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.78)' }}
              >
                <Text className="text-xs font-semibold" style={{ color: selectedPalette.primaryText }}>
                  Activa
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              <View
                className="rounded-full border px-3 py-1.5"
                style={{ borderColor: selectedPalette.primaryBorder, backgroundColor: '#ffffff' }}
              >
                <Text className="text-xs font-semibold" style={{ color: selectedPalette.primaryText }}>
                  Aplicación
                </Text>
              </View>
              <View
                className="rounded-full border px-3 py-1.5"
                style={{ borderColor: selectedPalette.primaryBorder, backgroundColor: '#ffffff' }}
              >
                <Text className="text-xs font-semibold" style={{ color: selectedPalette.primaryText }}>
                  Catálogo público
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {COLOR_PALETTES.map((option) => {
              const isSelected = option.id === colorPaletteId;

              return (
                <TouchableOpacity
                  key={option.id}
                  className="mb-3 rounded-[22px] border px-2.5 py-3"
                  style={{
                    width: '23.5%',
                    backgroundColor: isSelected ? option.primarySoft : '#ffffff',
                    borderColor: isSelected ? option.primaryBorder : '#e2e8f0',
                  }}
                  activeOpacity={0.82}
                  disabled={!areAccountPreferencesHydrated || isSavingPreferences}
                   onPress={() => {
                     setPreferencesError(null);
                     void setColorPalette(option.id).catch((error) => {
                       setPreferencesError(getReadableBusinessPreferencesError(error));
                    });
                   }}
                  accessibilityRole="button"
                  accessibilityLabel={`Usar paleta ${option.label}`}
                >
                  <View className="items-center">
                    <View className="flex-row">
                      <View
                        className="h-7 w-7 rounded-full border-2 border-white"
                        style={{ backgroundColor: option.primary }}
                      />
                      <View
                        className="-ml-2.5 h-7 w-7 rounded-full border-2 border-white"
                        style={{ backgroundColor: option.primarySoft }}
                      />
                    </View>
                    <Text className="mt-2 text-center text-[11px] font-semibold text-slate-800">
                      {option.label}
                    </Text>
                    <View
                      className="mt-2 h-5 w-5 items-center justify-center rounded-full border"
                      style={{
                        borderColor: isSelected ? option.primary : '#cbd5e1',
                        backgroundColor: isSelected ? option.primary : '#ffffff',
                      }}
                    >
                      {isSelected ? <View className="h-2 w-2 rounded-full bg-white" /> : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="mt-1 text-xs leading-5 text-slate-500">
            Toca un color para guardarlo al instante. La misma identidad visual se aplica en tu app y en el catálogo público.
          </Text>

          {isSavingPreferences ? (
            <Text className="mt-3 text-sm font-medium text-slate-500">
              Guardando preferencias...
            </Text>
          ) : null}

          {preferencesError ? (
            <Text className="mt-3 text-sm font-medium text-rose-600">
              {preferencesError}
            </Text>
          ) : null}
        </Animated.View>

        <Animated.View
          className="mb-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
          entering={sectionEntering(4)}
        >
          <View className="mb-4 flex-row items-center">
            <View
              className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: palette.primarySoft }}
            >
              <Globe size={22} color={palette.primary} />
            </View>
            <View>
              <Text className="text-lg font-semibold text-slate-800">Catálogo público</Text>
            </View>
          </View>

          {isCatalogLoading ? (
            <View className="rounded-2xl bg-slate-50 p-4">
              <View className="flex-row items-center">
                <ActivityIndicator color={palette.primary} />
                <Text className="ml-3 text-sm font-medium text-slate-600">
                  Cargando configuración del catálogo...
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View className="rounded-2xl bg-slate-50 p-4">
                <Text className="text-sm text-slate-500">Slug público</Text>
                <TextInput
                  className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-800"
                  value={catalogSlug}
                  onChangeText={setCatalogSlug}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="mi-negocio"
                  placeholderTextColor="#94a3b8"
                />

                <Text className="mt-4 text-sm text-slate-500">Estado</Text>
                <View className="mt-2 flex-row gap-3">
                  <TouchableOpacity
                    className={`flex-1 rounded-2xl px-4 py-3 ${catalogIsPublic ? '' : 'border border-slate-200 bg-white'}`}
                    style={{ backgroundColor: catalogIsPublic ? palette.primary : '#ffffff' }}
                    onPress={() => setCatalogIsPublic(true)}
                  >
                    <Text
                      className={`text-center font-semibold ${catalogIsPublic ? 'text-white' : 'text-slate-700'}`}
                    >
                      Publicado
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 rounded-2xl px-4 py-3 ${!catalogIsPublic ? 'bg-slate-800' : 'border border-slate-200 bg-white'}`}
                    onPress={() => setCatalogIsPublic(false)}
                  >
                    <Text
                      className={`text-center font-semibold ${!catalogIsPublic ? 'text-white' : 'text-slate-700'}`}
                    >
                      Oculto
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text className="mt-4 text-sm text-slate-500">URL pública</Text>
                <View className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3">
                  <Text className="text-sm leading-6 text-slate-700">
                    {catalogSettings?.publicCatalogUrl ?? 'Sin URL disponible'}
                  </Text>
                </View>
              </View>

              {catalogError ? (
                <Text className="mt-3 text-sm font-medium text-rose-600">
                  {catalogError}
                </Text>
              ) : null}

              <View className="mt-4 flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  onPress={() => {
                    void handleShareCatalog();
                  }}
                  disabled={isCatalogSharing || !catalogSettings}
                >
                  <Link2 size={16} color="#475569" />
                  <Text className="ml-2 font-semibold text-slate-700">
                    {isCatalogSharing ? 'Compartiendo...' : 'Compartir'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 rounded-2xl px-4 py-3"
                  style={{ backgroundColor: palette.primary }}
                  onPress={() => {
                    void handleSaveCatalogSettings();
                  }}
                  disabled={isCatalogSaving}
                >
                  <Text className="text-center font-semibold text-white">
                    {isCatalogSaving ? 'Guardando...' : 'Guardar cambios'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>

        <Animated.View
          className="mb-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
          entering={sectionEntering(3)}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-slate-800">Orden de la barra lateral</Text>
            <TouchableOpacity
              className="rounded-full border bg-white px-3 py-2"
              style={{ borderColor: palette.primaryBorder }}
              onPress={() => {
                reset();
              }}
              activeOpacity={0.8}
            >
              <Text className="text-xs font-semibold" style={{ color: palette.primaryText }}>Restablecer</Text>
            </TouchableOpacity>
          </View>

          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Aquí puedes personalizar el orden de los módulos en la barra lateral según tu uso personal.
          </Text>
          <Text className="mt-1 text-sm leading-6 text-slate-500">
            Arrastra y suelta para organizar
          </Text>
          <View className="mt-4">
            {!isHydrated ? (
              <View className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="text-sm font-semibold text-slate-700">Cargando preferencias…</Text>
              </View>
            ) : (
              <DraggableFlatList
                data={orderedModules}
                keyExtractor={(item) => item.id}
                onDragBegin={() => {
                  setIsReorderingModules(true);
                }}
                onRelease={() => {
                  setIsReorderingModules(false);
                }}
                onDragEnd={({ data }) => {
                  setIsReorderingModules(false);
                  persistLocalOrder(data.map((item) => item.id));
                }}
                activationDistance={10}
                dragHitSlop={moduleDragHitSlop}
                scrollEnabled={false}
                renderItem={({
                  item,
                  drag,
                  isActive,
                  getIndex,
                }: RenderItemParams<ModuleDefinition>) => {
                  const index = getIndex?.() ?? 0;
                  const Icon = item.icon;

                  return (
                    <View
                      className={`rounded-[24px] border border-slate-100 p-4 ${index === 0 ? '' : 'mt-3'}`}
                      style={{ backgroundColor: isActive ? palette.primarySoft : '#f8fafc' }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="mr-4 flex-1 flex-row items-center">
                          <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-white">
                            <Icon size={20} color={palette.primary} />
                          </View>
                          <View className="flex-1">
                            <Text className="font-semibold text-slate-800">{item.label}</Text>
                            {item.detail ? (
                              <Text className="mt-1 text-xs leading-5 text-slate-500">
                                {item.detail}
                              </Text>
                            ) : null}
                          </View>
                        </View>

                        <TouchableOpacity
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                          onLongPress={drag}
                          delayLongPress={180}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={`Reordenar ${item.label}`}
                        >
                          <GripVertical size={18} color={isActive ? palette.primary : '#475569'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </Animated.View>

        <Animated.View
          className="rounded-[28px] border border-amber-100 bg-amber-50 p-5"
          entering={sectionEntering(5)}
        >
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
              <Crown size={22} color="#d97706" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-amber-900">Módulos premium bloqueados</Text>
            </View>
          </View>

          {premiumModules.map((module, index) => (
            <View
              key={module.id}
              className={`rounded-2xl border border-amber-200 bg-white p-4 ${index === 0 ? '' : 'mt-3'}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="mr-4 flex-1">
                  <Text className="font-semibold text-slate-800">{module.label}</Text>
                  <Text className="mt-1 text-sm leading-6 text-slate-500">{module.detail}</Text>
                </View>
                <View className="rounded-full bg-amber-100 px-3 py-1.5">
                  <Text className="text-xs font-semibold text-amber-700">Pro</Text>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            className="mt-5 items-center rounded-2xl py-4"
            style={{ backgroundColor: palette.primary }}
            onPress={() => router.push('/(drawer)/(tabs)/plan-pro')}
          >
            <Text className="text-lg font-semibold text-white">Gestionar plan Pro</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View className="mt-6" entering={sectionEntering(6)}>
          <TouchableOpacity
            className="items-center rounded-2xl border border-rose-200 bg-rose-50 py-4"
            onPress={() => {
              void handleLogout();
            }}
          >
            <Text className="text-base font-semibold text-rose-600">Cerrar sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={isEditingProfile}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isProfileSaving) {
            setProfileError(null);
            setIsEditingProfile(false);
          }
        }}
      >
        <View className="flex-1 justify-center bg-black/45 px-5">
          <View
            className="rounded-[28px] border bg-white p-5"
            style={{ borderColor: palette.primaryBorder, shadowColor: palette.shadow }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-semibold text-slate-800">Editar datos</Text>
                <Text className="mt-1 text-sm text-slate-500">Usuario y negocio</Text>
              </View>
              <TouchableOpacity
                className="rounded-full border bg-white px-3 py-2"
                style={{ borderColor: palette.primaryBorder }}
                onPress={() => {
                  setProfileError(null);
                  setIsEditingProfile(false);
                }}
                disabled={isProfileSaving}
              >
                <Text className="text-xs font-semibold" style={{ color: palette.primaryText }}>
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
              <Text className="text-sm" style={{ color: palette.primaryText }}>Nombres</Text>
              <TextInput
                className="mt-2 rounded-2xl border px-4 py-3 text-base font-semibold text-slate-800"
                style={{ borderColor: palette.primaryBorder, backgroundColor: palette.primarySoft }}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                placeholder="Tus nombres"
                placeholderTextColor="#94a3b8"
              />

              <Text className="mt-4 text-sm" style={{ color: palette.primaryText }}>Apellidos</Text>
              <TextInput
                className="mt-2 rounded-2xl border px-4 py-3 text-base font-semibold text-slate-800"
                style={{ borderColor: palette.primaryBorder, backgroundColor: palette.primarySoft }}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                placeholder="Tus apellidos"
                placeholderTextColor="#94a3b8"
              />

              <Text className="mt-4 text-sm" style={{ color: palette.primaryText }}>
                Nombre del negocio
              </Text>
              <TextInput
                className="mt-2 rounded-2xl border px-4 py-3 text-base font-semibold text-slate-800"
                style={{ borderColor: palette.primaryBorder, backgroundColor: palette.primarySoft }}
                value={businessName}
                onChangeText={setBusinessName}
                autoCapitalize="words"
                placeholder="Nombre del negocio"
                placeholderTextColor="#94a3b8"
              />

              <Text className="mt-4 text-sm" style={{ color: palette.primaryText }}>Rubro</Text>
              <TextInput
                className="mt-2 rounded-2xl border px-4 py-3 text-base font-semibold text-slate-800"
                style={{ borderColor: palette.primaryBorder, backgroundColor: palette.primarySoft }}
                value={businessCategory}
                onChangeText={setBusinessCategory}
                autoCapitalize="sentences"
                placeholder={BUSINESS_CATEGORIES[0]}
                placeholderTextColor="#94a3b8"
              />

              {profileError ? (
                <Text className="mt-3 text-sm font-medium text-rose-600">{profileError}</Text>
              ) : null}
            </ScrollView>

            <View className="mt-5 flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-2xl border bg-white px-4 py-3"
                style={{ borderColor: palette.primaryBorder }}
                onPress={() => {
                  setProfileError(null);
                  setIsEditingProfile(false);
                }}
                disabled={isProfileSaving}
              >
                <Text className="text-center font-semibold" style={{ color: palette.primaryText }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-2xl px-4 py-3"
                style={{
                  backgroundColor:
                    isProfileFormValid && hasProfileChanges && !isProfileSaving
                      ? palette.primary
                      : '#e2e8f0',
                }}
                onPress={() => {
                  void handleSaveProfile();
                }}
                disabled={!isProfileFormValid || !hasProfileChanges || isProfileSaving}
              >
                <Text
                  className={`text-center font-semibold ${isProfileFormValid && hasProfileChanges && !isProfileSaving ? 'text-white' : 'text-slate-400'}`}
                >
                  {isProfileSaving ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

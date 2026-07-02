import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image as RNImage,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Briefcase, Camera, ImageIcon, Package } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import {
  deleteCatalogImage,
  deleteCatalogItem,
  fetchCatalogItemById,
  formatMoney,
  getReadableCatalogError,
  uploadCatalogImage,
  type CatalogItem,
} from '@/lib/catalog';
import { AttachmentSheet } from '@/components/ui/attachment-sheet';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';

export default function CatalogDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(256);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (item?.imageUrl) {
      RNImage.getSize(
        item.imageUrl,
        (width, height) => {
          const maxWidth = screenWidth - 48;
          const calculated = height > 0 ? (maxWidth * height) / width : 256;
          setPreviewHeight(Math.min(calculated, 320));
        },
        () => setPreviewHeight(256),
      );
    }
  }, [item?.imageUrl, screenWidth]);

  useEffect(() => {
    const loadItem = async () => {
      if (!accessToken || !id) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const nextItem = await fetchCatalogItemById(accessToken, id);
        setItem(nextItem);
      } catch (catalogError) {
        setError(getReadableCatalogError(catalogError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadItem();
  }, [accessToken, id]);

  if (isLoading) {
    return (
      <Animated.View
        className="flex-1 items-center justify-center bg-white"
        entering={screenEntering}
      >
        <ActivityIndicator color={palette.primary} />
      </Animated.View>
    );
  }

  if (!item || error) {
    return (
      <Animated.View className="flex-1 bg-white" entering={screenEntering}>
        <Animated.View
          className="px-4 pb-4"
          style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
          entering={sectionEntering(0)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-4">
              <TouchableOpacity
                onPress={() => router.navigate('/(drawer)/(tabs)/catalog')}
                className="mr-4"
              >
                <ArrowLeft color="white" size={24} />
              </TouchableOpacity>
              <Text className="text-white text-xl font-semibold">Detalle</Text>
            </View>
          </View>
        </Animated.View>

        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-semibold text-rose-600 text-center">
            {error ?? 'No se encontró el item solicitado.'}
          </Text>
        </View>
      </Animated.View>
    );
  }

  const isService = item.kind === 'Servicio';
  const Icon = isService ? Briefcase : Package;
  const createdAt = new Date(item.createdAt).toLocaleDateString();
  const updatedAt = new Date(item.updatedAt).toLocaleDateString();

  const handleUploadImage = async (uri: string) => {
    if (!accessToken || !item) {
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      const updatedItem = await uploadCatalogImage(accessToken, item.id, uri);
      setItem(updatedItem);
    } catch (catalogError) {
      setError(getReadableCatalogError(catalogError));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!accessToken || !item || !item.imageUrl) {
      return;
    }

    setIsDeletingImage(true);
    setError(null);

    try {
      await deleteCatalogImage(accessToken, item.id);
      setItem({ ...item, imageUrl: null });
    } catch (catalogError) {
      setError(getReadableCatalogError(catalogError));
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !item || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCatalogItem(accessToken, item.id);
      router.replace('/(drawer)/(tabs)/catalog');
    } catch (catalogError) {
      setError(getReadableCatalogError(catalogError));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity
              onPress={() => router.navigate('/(drawer)/(tabs)/catalog')}
              className="mr-4"
            >
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-semibold">Detalle</Text>
          </View>
          <View
            className={`h-12 w-12 items-center justify-center rounded-2xl ${isService ? 'bg-emerald-50/20' : 'bg-white/15'}`}
          >
            <Icon size={22} color="white" />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        <Animated.View entering={sectionEntering(1)}>
          <View className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm shadow-slate-100">

            <View className="p-5">
              <View className="mb-3 flex-row items-center">
                  <View
                    className={`mr-2 rounded-full px-3 py-1.5 ${isService ? 'bg-emerald-50' : ''}`}
                    style={{ backgroundColor: isService ? undefined : palette.primarySoft }}
                  >
                    <Text
                      className={`text-xs font-semibold ${isService ? 'text-emerald-700' : ''}`}
                      style={{ color: isService ? undefined : palette.primaryText }}
                    >
                      {item.kind}
                    </Text>
                  </View>
                </View>
              <Text className="text-2xl font-semibold leading-8 text-slate-900">{item.name}</Text>
              <Text className="mt-3 text-sm leading-6 text-slate-500">
                {item.description || 'Sin descripción'}
              </Text>
              <View className="mt-5 rounded-3xl bg-slate-50 p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Precio base
                </Text>
                <Text className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatMoney(item.currencySymbol, item.price)}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="mb-4 text-lg font-semibold text-slate-900">Detalles completos</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Código</Text>
                <Text className="text-sm font-semibold text-slate-800">{item.referenceCode}</Text>
              </View>
            {item.sku ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">SKU</Text>
                <Text className="text-sm font-semibold text-slate-800">{item.sku}</Text>
              </View>
            ) : null}
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Unidad</Text>
              <Text className="text-sm font-semibold text-slate-800">{item.unit.name}</Text>
            </View>
            {typeof item.stock === 'number' ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Stock</Text>
                <Text className="text-sm font-semibold text-slate-800">{item.stock}</Text>
              </View>
            ) : null}
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Categoría</Text>
              <Text className="text-sm font-semibold text-slate-800">{item.category.name}</Text>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Precio base</Text>
              <Text className="text-lg font-semibold text-slate-800">
                {formatMoney(item.currencySymbol, item.price)}
              </Text>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Creado</Text>
              <Text className="text-sm font-semibold text-slate-800">{createdAt}</Text>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Actualizado</Text>
              <Text className="text-sm font-semibold text-slate-800">{updatedAt}</Text>
            </View>
          </View>

          {/* ── Image management ── */}
          <View className="mt-5 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-semibold text-slate-900">Imagen</Text>

            {item.imageUrl ? (
              <View>
                <View className="mt-3 overflow-hidden rounded-2xl bg-slate-100" style={{ height: previewHeight }}>
                  <Image
                    source={item.imageUrl}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                    transition={220}
                    cachePolicy="memory-disk"
                    recyclingKey={item.imageUrl}
                  />
                </View>
                <View className="mt-3 flex-row">
                  <TouchableOpacity
                    className="mr-3 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 items-center flex-row justify-center"
                    activeOpacity={0.85}
                    onPress={() => setShowAttachmentSheet(true)}
                  >
                    <Camera size={16} color="#334155" />
                    <Text className="ml-2 text-sm font-semibold text-slate-700">Cambiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 items-center flex-row justify-center"
                    activeOpacity={0.85}
                    onPress={() => { void handleDeleteImage(); }}
                    disabled={isDeletingImage}
                  >
                    <Text className="text-sm font-semibold text-rose-600">
                      {isDeletingImage ? 'Eliminando...' : 'Eliminar foto'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="mt-3 h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50"
                activeOpacity={0.85}
                onPress={() => setShowAttachmentSheet(true)}
              >
                {isUploadingImage ? (
                  <ActivityIndicator color={palette.primary} />
                ) : (
                  <>
                    <View className="h-14 w-14 rounded-2xl bg-slate-100 items-center justify-center">
                      <ImageIcon size={28} color="#94a3b8" />
                    </View>
                    <Text className="mt-3 text-sm font-semibold text-slate-500">Agregar foto</Text>
                    <Text className="mt-1 text-xs text-slate-400">Toca para adjuntar una imagen</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {error ? (
            <View className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <Text className="text-sm font-semibold text-rose-600">{error}</Text>
            </View>
          ) : null}

          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-2xl px-4 py-3 items-center"
              style={{ backgroundColor: palette.primary }}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: '/(drawer)/(tabs)/catalog/new',
                  params: { id: item.id },
                })
              }
            >
              <Text className="font-semibold text-white">Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 items-center"
              activeOpacity={0.85}
              onPress={() => {
                void handleDelete();
              }}
              disabled={isDeleting}
            >
              <Text className="font-semibold text-rose-600">
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      <AttachmentSheet
        visible={showAttachmentSheet}
        onClose={() => setShowAttachmentSheet(false)}
        onAttach={(uris) => {
          if (uris.length > 0) {
            void handleUploadImage(uris[0]);
          }
          setShowAttachmentSheet(false);
        }}
      />
    </Animated.View>
  );
}


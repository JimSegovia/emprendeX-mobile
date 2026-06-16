import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import {
  deleteCliente,
  fetchClienteById,
  getReadableClientesError,
  type ClienteDetalle,
} from '@/lib/clientes';
import { useAuthSession } from '@/lib/auth-session-context';
import {
  createPublicCatalogSharePayload,
  fetchBusinessPublicCatalog,
  getReadablePublicCatalogError,
} from '@/lib/public-catalog';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { formatCurrencyValue } from '@/lib/runtime-config';

const statusStyles = {
  Pendiente: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Aprobada: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Activo: { bg: 'themed', text: 'themed' },
  Entregado: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  'En camino': { bg: 'bg-orange-50', text: 'text-orange-600' },
} as const;

export default function ClienteDetalleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const [client, setClient] = useState<ClienteDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharingCatalog, setIsSharingCatalog] = useState(false);

  const getClientPhoneDigits = () => {
    const normalizedPhone = client?.phone?.replace(/\D/g, '') ?? '';
    return normalizedPhone;
  };

  useEffect(() => {
    const loadClient = async () => {
      if (!id || !accessToken) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        setClient(await fetchClienteById(accessToken, id));
      } catch (loadError) {
        setError(getReadableClientesError(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadClient();
  }, [accessToken, id]);

  const lastOperationTotal = useMemo(() => client?.operations[0]?.total ?? null, [client]);

  const handleDelete = () => {
    if (!accessToken || !id) {
      return;
    }

    Alert.alert('Eliminar cliente', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCliente(accessToken, id);
            router.back();
          } catch (deleteError) {
            Alert.alert('No se pudo eliminar', getReadableClientesError(deleteError));
          }
        },
      },
    ]);
  };

  const handleShareCatalog = async () => {
    if (!accessToken || !client || isSharingCatalog) {
      return;
    }

    const phoneDigits = getClientPhoneDigits();

    if (!phoneDigits) {
      Alert.alert(
        'Teléfono no disponible',
        'El cliente no tiene un teléfono válido para abrir WhatsApp.',
      );
      return;
    }

    setIsSharingCatalog(true);

    try {
      const response = await fetchBusinessPublicCatalog(accessToken);

      if (!response.catalogIsPublic) {
        Alert.alert(
          'Catálogo no publicado',
          'Activa tu catálogo público desde Configuración antes de compartirlo.',
        );
        return;
      }

      const sharePayload = createPublicCatalogSharePayload(
        response.publicCatalogUrl,
        'Hola, te comparto nuestro catálogo para que selecciones lo que deseas cotizar.',
      );

      const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(sharePayload.message)}`;
      await Linking.openURL(whatsappUrl);
    } catch (shareError) {
      Alert.alert(
        'No se pudo compartir el catálogo',
        getReadablePublicCatalogError(shareError),
      );
    } finally {
      setIsSharingCatalog(false);
    }
  };

  const handleCallClient = async () => {
    const normalizedPhone = client?.phone?.trim();

    if (!normalizedPhone) {
      Alert.alert('Teléfono no disponible', 'El cliente no tiene un número registrado.');
      return;
    }

    try {
      await Linking.openURL(`tel:${normalizedPhone}`);
    } catch {
      Alert.alert('No se pudo llamar', 'No fue posible abrir la app de teléfono.');
    }
  };

  if (isLoading || !client) {
    return (
      <Animated.View
        className="flex-1 bg-white items-center justify-center"
        entering={screenEntering}
      >
        {error ? (
          <Text className="px-6 text-center text-rose-600">{error}</Text>
        ) : (
          <>
            <ActivityIndicator color={palette.primary} />
            <Text className="mt-3 text-slate-500">Cargando cliente...</Text>
          </>
        )}
      </Animated.View>
    );
  }

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text className="text-white text-xl font-semibold">Ficha del cliente</Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10">
            <Text className="text-lg font-semibold text-white">{client.fullName.charAt(0)}</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
      >
        <Animated.View
          className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
          entering={sectionEntering(1)}
        >
          <Text className="text-2xl font-semibold text-slate-800">{client.fullName}</Text>
          <Text className="mt-2 text-sm font-medium text-slate-600">DNI {client.dni}</Text>
          <Text className="mt-2 text-sm text-slate-500">
            {client.phone ?? 'Sin teléfono'} · {client.email ?? 'Sin correo'}
          </Text>
          <Text className="mt-4 text-sm leading-6 text-slate-600">
            {client.address ?? 'Sin dirección registrada'}
          </Text>

          <View className="mt-5 gap-3">
            <TouchableOpacity
              className="rounded-2xl px-4 py-3"
              style={{ backgroundColor: palette.primary }}
              onPress={() => {
                void handleShareCatalog();
              }}
              disabled={isSharingCatalog}
            >
              <View className="flex-row items-center justify-center">
                <MessageCircle size={16} color="white" />
                <Text className="ml-2 font-semibold text-white">
                  {isSharingCatalog ? 'Abriendo WhatsApp...' : 'Compartir catálogo'}
                </Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
                onPress={() => {
                  void handleCallClient();
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Phone size={16} color="#059669" />
                  <Text className="ml-2 text-center font-semibold text-emerald-700">Llamar</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                onPress={() =>
                  router.push({
                    pathname: '/(drawer)/(tabs)/clientes/form',
                    params: { id: client.id },
                  })
                }
              >
                <Text className="text-center font-semibold text-slate-700">Editar</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
                onPress={handleDelete}
              >
                <Text className="text-center font-semibold text-rose-600">Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          className="mt-6 rounded-[28px] border border-slate-100 bg-slate-50 p-5"
          entering={sectionEntering(2)}
        >
          <Text className="text-lg font-semibold text-slate-800">Resumen comercial</Text>
          <View className="mt-4 flex-row flex-wrap justify-between">
            <View className="mb-3 w-[48%] rounded-2xl border border-slate-100 bg-white p-4">
              <Text className="text-xs font-medium text-slate-500">Operaciones</Text>
              <Text className="mt-2 text-2xl font-semibold text-slate-800">
                {client.operations.length}
              </Text>
            </View>
            <View className="mb-3 w-[48%] rounded-2xl border border-slate-100 bg-white p-4">
              <Text className="text-xs font-medium text-slate-500">Último total</Text>
              <Text className="mt-2 text-2xl font-semibold text-slate-800">
                {formatCurrencyValue(lastOperationTotal)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View className="mt-6" entering={sectionEntering(3)}>
          <View className="mb-4 flex-row items-end justify-between">
            <Text className="text-lg font-semibold text-slate-800">Operaciones asociadas</Text>
            <Text className="text-sm font-medium" style={{ color: palette.primaryText }}>
              Historial comercial
            </Text>
          </View>

          {client.operations.map((operation) => {
            const styles = statusStyles[operation.status as keyof typeof statusStyles] ?? {
              bg: 'bg-slate-100',
              text: 'text-slate-700',
            };

            return (
              <View
                key={operation.id}
                className="mb-3 rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-semibold text-slate-800">
                      {operation.referenceCode}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-500">{operation.type}</Text>
                  </View>
                  <View
                    className={`rounded-full px-3 py-1.5 ${styles.bg === 'themed' ? '' : styles.bg}`}
                    style={{ backgroundColor: styles.bg === 'themed' ? palette.primarySoft : undefined }}
                  >
                    <Text
                      className={`text-xs font-semibold ${styles.text === 'themed' ? '' : styles.text}`}
                      style={{ color: styles.text === 'themed' ? palette.primaryText : undefined }}
                    >
                      {operation.status}
                    </Text>
                  </View>
                </View>
                <Text className="mt-4 text-lg font-semibold text-slate-800">{formatCurrencyValue(operation.total)}</Text>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

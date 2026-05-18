import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import {
  fetchProductosServiciosItems,
  getReadableProductosServiciosError,
} from '@/lib/productos-servicios';
import { useAuthSession } from '@/lib/auth-session-context';

export default function NuevaOperacionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuthSession();

  const clientOptions = [
    { label: 'Maria López', value: 'maria' },
    { label: 'Lucía Fernández', value: 'lucia' },
    { label: 'Ana Torres', value: 'ana' },
  ];
  const methodOptions = [
    { label: 'Delivery', value: 'delivery' },
    { label: 'Recojo en tienda', value: 'recojo' },
  ];

  const [client, setClient] = useState<string | null>(null);
  const [clientOpen, setClientOpen] = useState(false);
  const [clientItems, setClientItems] = useState(clientOptions);
  const [product, setProduct] = useState<string[]>([]);
  const [productOpen, setProductOpen] = useState(false);
  const [productItems, setProductItems] = useState<{ label: string; value: string }[]>([]);
  const [method, setMethod] = useState<string | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [methodItems, setMethodItems] = useState(methodOptions);
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [catalogItemsById, setCatalogItemsById] = useState<Record<string, { name: string; price: number }>>({});
  const dropdownSpacing = 220;

  useEffect(() => {
    const loadItems = async () => {
      if (!accessToken) {
        return;
      }

      setIsLoadingProducts(true);
      setProductsError(null);

      try {
        const items = await fetchProductosServiciosItems(accessToken);
        setProductItems(
          items.map((item) => ({
            label: `${item.name} - S/ ${item.price.toFixed(2)}`,
            value: item.id,
          })),
        );
        setCatalogItemsById(
          Object.fromEntries(
            items.map((item) => [item.id, { name: item.name, price: item.price }]),
          ),
        );
      } catch (productosServiciosError) {
        setProductsError(getReadableProductosServiciosError(productosServiciosError));
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void loadItems();
  }, [accessToken]);

  const selectedProducts = useMemo(() => {
    return product
      .map((productId) => catalogItemsById[productId])
      .filter(Boolean) as { name: string; price: number }[];
  }, [catalogItemsById, product]);

  const totalQuote = useMemo(() => {
    return selectedProducts.reduce((sum, item) => sum + item.price, 0);
  }, [selectedProducts]);

  function handleDateChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    setShowDate(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  }

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4 flex-row items-center"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <TouchableOpacity onPress={() => router.replace('/(drawer)/(tabs)/cotizaciones')} className="mr-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Nueva cotización</Text>
      </Animated.View>

      <Animated.View
        className="border-b border-slate-100 bg-violet-50/70 px-4 py-4"
        entering={sectionEntering(1)}
      >
        <View className="flex-row items-center">
          <View className="rounded-full bg-violet-600 px-4 py-2">
            <Text className="text-xs font-bold uppercase tracking-wide text-white">1. Cotización</Text>
          </View>
          <View className="mx-3 h-[1px] flex-1 bg-violet-200" />
          <View className="rounded-full border border-violet-200 bg-white px-4 py-2">
            <Text className="text-xs font-bold uppercase tracking-wide text-violet-300">2. Pedido</Text>
          </View>
        </View>
        <Text className="mt-3 text-sm leading-5 text-slate-600">
          Primero registras cliente y productos/servicios en la cotización. Cuando sea aprobada,
          recién pasa a pedido.
        </Text>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        entering={sectionEntering(2)}
      >
        <Animated.View className="mb-6" entering={sectionEntering(3)}>
          <Text className="font-bold text-slate-800 mb-2">Cliente</Text>
          <DropDownPicker
            open={clientOpen}
            value={client}
            items={clientItems}
            setOpen={setClientOpen}
            setValue={setClient}
            setItems={setClientItems}
            placeholder="Seleccionar cliente"
            listMode="SCROLLVIEW"
            maxHeight={dropdownSpacing}
            zIndex={3000}
            zIndexInverse={1000}
            style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
            dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
            textStyle={{ color: client ? '#0f172a' : '#94a3b8' }}
            onOpen={() => {
              setProductOpen(false);
              setMethodOpen(false);
              setShowDate(false);
            }}
          />
          <View style={{ height: clientOpen ? dropdownSpacing : 0 }} />
          <TouchableOpacity
            className="items-end mt-2"
            onPress={() => router.push('/(drawer)/(tabs)/clientes/form')}
          >
            <Text className="text-violet-600 font-medium">+ Nuevo cliente</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View className="mb-6" entering={sectionEntering(4)}>
          <Text className="font-bold text-slate-800 mb-2">Productos / Servicios</Text>
          <DropDownPicker
            open={productOpen}
            value={product}
            items={productItems}
            setOpen={setProductOpen}
            setValue={setProduct}
            setItems={setProductItems}
            multiple={true}
            min={0}
            max={10}
            placeholder="Seleccionar productos/servicios"
            listMode="SCROLLVIEW"
            maxHeight={dropdownSpacing}
            zIndex={2500}
            zIndexInverse={1500}
            style={{ borderColor: '#e5e7eb', backgroundColor: 'white', marginBottom: 8 }}
            dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
            textStyle={{ color: product.length > 0 ? '#0f172a' : '#94a3b8' }}
            onOpen={() => {
              setClientOpen(false);
              setMethodOpen(false);
              setShowDate(false);
            }}
          />
          <View style={{ height: productOpen ? dropdownSpacing : 0 }} />

          {isLoadingProducts ? (
            <View className="mt-2 flex-row items-center">
              <ActivityIndicator color="#7c3aed" />
              <Text className="ml-3 text-sm text-slate-500">Cargando items...</Text>
            </View>
          ) : null}

          {productsError ? (
            <Text className="mt-2 text-sm font-medium text-rose-600">{productsError}</Text>
          ) : null}

          <TouchableOpacity
            className="items-end mt-2"
            onPress={() => router.push('/(drawer)/(tabs)/productos')}
          >
            <Text className="text-violet-600 font-medium">+ Agregar item</Text>
          </TouchableOpacity>
        </Animated.View>

        {selectedProducts.length > 0 ? (
          <Animated.View
            className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4"
            entering={sectionEntering(5)}
          >
            <Text className="text-sm font-semibold text-slate-800">Items seleccionados</Text>
            {selectedProducts.map((selectedItem, index) => (
              <View key={`${selectedItem.name}-${index}`} className="mt-3 flex-row justify-between">
                <Text className="text-sm text-slate-600">{selectedItem.name}</Text>
                <Text className="text-sm font-semibold text-slate-800">
                  S/ {selectedItem.price.toFixed(2)}
                </Text>
              </View>
            ))}
          </Animated.View>
        ) : null}

        <Animated.View className="mb-6" entering={sectionEntering(6)}>
          <Text className="font-bold text-slate-800 mb-2">Fecha de entrega estimada</Text>
          <TouchableOpacity
            className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white"
            onPress={() => {
              setClientOpen(false);
              setProductOpen(false);
              setMethodOpen(false);
              setShowDate(true);
            }}
          >
            <Text className="text-slate-800">{date.toLocaleDateString()}</Text>
            <Calendar color="#94a3b8" size={20} />
          </TouchableOpacity>
          {showDate ? (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          ) : null}
        </Animated.View>

        <Animated.View className="mb-6" entering={sectionEntering(7)}>
          <Text className="font-bold text-slate-800 mb-2">Método de entrega</Text>
          <DropDownPicker
            open={methodOpen}
            value={method}
            items={methodItems}
            setOpen={setMethodOpen}
            setValue={setMethod}
            setItems={setMethodItems}
            placeholder="Seleccionar método de entrega"
            listMode="SCROLLVIEW"
            maxHeight={dropdownSpacing}
            zIndex={2000}
            zIndexInverse={2000}
            style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
            dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
            textStyle={{ color: method ? '#0f172a' : '#94a3b8' }}
            onOpen={() => {
              setClientOpen(false);
              setProductOpen(false);
              setShowDate(false);
            }}
          />
          <View style={{ height: methodOpen ? dropdownSpacing : 0 }} />
        </Animated.View>

        <Animated.View
          className="mb-8 rounded-2xl border border-violet-100 bg-violet-50 p-4"
          entering={sectionEntering(8)}
        >
          <Text className="text-sm font-semibold text-violet-900">Siguiente paso</Text>
          <Text className="mt-2 text-sm leading-6 text-violet-800">
            Cuando la cotización esté aprobada, podrás convertirla en pedido sin volver a ingresar
            cliente, items ni total.
          </Text>
        </Animated.View>
      </Animated.ScrollView>

      <Animated.View
        className="border-t border-slate-100 bg-white px-4 pt-4 flex-row items-center justify-between"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        entering={sectionEntering(9)}
      >
        <View>
          <Text className="text-slate-500 font-medium">Total cotizado</Text>
          <Text className="text-lg font-bold text-slate-800">S/ {totalQuote.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          className="bg-violet-600 px-8 py-3 rounded-xl"
          disabled={!client || product.length === 0 || !method}
          onPress={() => {
            router.replace('/(drawer)/(tabs)/cotizaciones');
          }}
        >
          <Text className="text-white font-bold">Guardar cotización</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

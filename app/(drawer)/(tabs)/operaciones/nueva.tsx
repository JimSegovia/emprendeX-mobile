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
  type ProductosServiciosItem,
  type ProductosServiciosItemKind,
} from '@/lib/productos-servicios';
import { fetchClientes, getReadableClientesError } from '@/lib/clientes';
import { createCotizacion, getReadableVentasError } from '@/lib/ventas';
import { useAuthSession } from '@/lib/auth-session-context';

export default function NuevaOperacionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuthSession();

  const methodOptions = [
    { label: 'Delivery', value: 'Delivery' },
    { label: 'Recojo en tienda', value: 'Recojo en tienda' },
  ] as const;

  const [client, setClient] = useState<string | null>(null);
  const [clientOpen, setClientOpen] = useState(false);
  const [clientItems, setClientItems] = useState<{ label: string; value: string }[]>([]);
  const [itemKind, setItemKind] = useState<ProductosServiciosItemKind>('Producto');
  const [product, setProduct] = useState<string[]>([]);
  const [productOpen, setProductOpen] = useState(false);
  const [productItems, setProductItems] = useState<{ label: string; value: string }[]>([]);
  const [method, setMethod] = useState<'Delivery' | 'Recojo en tienda' | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [methodItems, setMethodItems] = useState([...methodOptions]);
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catalogItems, setCatalogItems] = useState<ProductosServiciosItem[]>([]);
  const [catalogItemsById, setCatalogItemsById] = useState<Record<string, { name: string; price: number; kind: ProductosServiciosItemKind }>>({});
  const dropdownSpacing = 220;

  useEffect(() => {
    const loadDependencies = async () => {
      if (!accessToken) {
        return;
      }

      setIsLoadingProducts(true);
      setProductsError(null);
      setClientsError(null);

      try {
        const [items, loadedClients] = await Promise.all([
          fetchProductosServiciosItems(accessToken),
          fetchClientes(accessToken),
        ]);

        setCatalogItems(items);
        setCatalogItemsById(
          Object.fromEntries(
            items.map((item) => [item.id, { name: item.name, price: item.price, kind: item.kind }]),
          ),
        );
        setClientItems(loadedClients.map((item) => ({ label: item.fullName, value: item.id })));
      } catch (dependencyError) {
        const message = dependencyError instanceof Error ? dependencyError.message : '';
        if (message.toLowerCase().includes('cliente')) {
          setClientsError(getReadableClientesError(dependencyError));
        } else {
          setProductsError(getReadableProductosServiciosError(dependencyError));
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void loadDependencies();
  }, [accessToken]);

  useEffect(() => {
    const filteredItems = catalogItems.filter((item) => item.kind === itemKind);
    setProductItems(
      filteredItems.map((item) => ({
        label: `${item.name} - S/ ${item.price.toFixed(2)}`,
        value: item.id,
      })),
    );
  }, [catalogItems, itemKind]);

  const selectedProducts = useMemo(() => {
    return product
      .map((productId) => catalogItemsById[productId])
      .filter(Boolean)
      .filter((item) => item.kind === itemKind) as { name: string; price: number; kind: ProductosServiciosItemKind }[];
  }, [catalogItemsById, itemKind, product]);

  const totalQuote = useMemo(() => selectedProducts.reduce((sum, item) => sum + item.price, 0), [selectedProducts]);

  const handleItemKindChange = (nextKind: ProductosServiciosItemKind) => {
    if (nextKind === itemKind) return;
    setItemKind(nextKind);
    setProduct([]);
    setProductOpen(false);
  };

  function handleDateChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    setShowDate(false);
    if (selectedDate) setDate(selectedDate);
  }

  const handleSave = async () => {
    if (!accessToken || !client || product.length === 0 || !method) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createCotizacion(accessToken, {
        customerId: client,
        itemIds: product,
        deliveryDate: date.toISOString(),
        deliveryMethod: method,
      });
      router.replace('/(drawer)/(tabs)/cotizaciones');
    } catch (saveError) {
      setSubmitError(getReadableVentasError(saveError));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          />
          <View style={{ height: clientOpen ? dropdownSpacing : 0 }} />
          <TouchableOpacity className="items-end mt-2" onPress={() => router.push('/(drawer)/(tabs)/clientes/form')}>
            <Text className="text-violet-600 font-medium">+ Nuevo cliente</Text>
          </TouchableOpacity>
          {clientsError ? <Text className="mt-2 text-sm font-medium text-rose-600">{clientsError}</Text> : null}
        </Animated.View>

        <Animated.View className="mb-6" entering={sectionEntering(4)}>
          <Text className="text-sm font-semibold text-slate-700 mb-2">Tipo de items</Text>
          <View className="flex-row">
            <TouchableOpacity className={`mr-3 flex-1 items-center rounded-2xl border px-4 py-3 ${itemKind === 'Producto' ? 'border-violet-200 bg-violet-50' : 'border-slate-200 bg-white'}`} onPress={() => handleItemKindChange('Producto')}>
              <Text className={`font-semibold ${itemKind === 'Producto' ? 'text-violet-700' : 'text-slate-600'}`}>Productos</Text>
            </TouchableOpacity>
            <TouchableOpacity className={`flex-1 items-center rounded-2xl border px-4 py-3 ${itemKind === 'Servicio' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`} onPress={() => handleItemKindChange('Servicio')}>
              <Text className={`font-semibold ${itemKind === 'Servicio' ? 'text-emerald-700' : 'text-slate-600'}`}>Servicios</Text>
            </TouchableOpacity>
          </View>
          <Text className="font-bold text-slate-800 mb-2 mt-4">{itemKind === 'Producto' ? 'Productos' : 'Servicios'}</Text>
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
            placeholder={`Seleccionar ${itemKind === 'Producto' ? 'productos' : 'servicios'}`}
            listMode="SCROLLVIEW"
            maxHeight={dropdownSpacing}
            zIndex={2500}
            zIndexInverse={1500}
            style={{ borderColor: '#e5e7eb', backgroundColor: 'white', marginBottom: 8 }}
            dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
            textStyle={{ color: product.length > 0 ? '#0f172a' : '#94a3b8' }}
          />
          <View style={{ height: productOpen ? dropdownSpacing : 0 }} />
          {isLoadingProducts ? (
            <View className="mt-2 flex-row items-center">
              <ActivityIndicator color="#7c3aed" />
              <Text className="ml-3 text-sm text-slate-500">Cargando items...</Text>
            </View>
          ) : null}
          {productsError ? <Text className="mt-2 text-sm font-medium text-rose-600">{productsError}</Text> : null}
          <TouchableOpacity className="items-end mt-2" onPress={() => router.push('/(drawer)/(tabs)/productos')}>
            <Text className="text-violet-600 font-medium">+ Agregar item</Text>
          </TouchableOpacity>
        </Animated.View>

        {selectedProducts.length > 0 ? (
          <Animated.View className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4" entering={sectionEntering(5)}>
            <Text className="text-sm font-semibold text-slate-800">Items seleccionados</Text>
            {selectedProducts.map((selectedItem, index) => (
              <View key={`${selectedItem.name}-${index}`} className="mt-3 flex-row justify-between">
                <Text className="text-sm text-slate-600">{selectedItem.name}</Text>
                <Text className="text-sm font-semibold text-slate-800">S/ {selectedItem.price.toFixed(2)}</Text>
              </View>
            ))}
          </Animated.View>
        ) : null}

        <Animated.View className="mb-6" entering={sectionEntering(6)}>
          <Text className="font-bold text-slate-800 mb-2">Fecha de entrega estimada</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white" onPress={() => setShowDate(true)}>
            <Text className="text-slate-800">{date.toLocaleDateString()}</Text>
            <Calendar color="#94a3b8" size={20} />
          </TouchableOpacity>
          {showDate ? <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} /> : null}
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
          />
          <View style={{ height: methodOpen ? dropdownSpacing : 0 }} />
        </Animated.View>

        {submitError ? <Text className="mb-4 text-sm font-medium text-rose-600">{submitError}</Text> : null}
      </Animated.ScrollView>

      <Animated.View className="border-t border-slate-100 bg-white px-4 pt-4 flex-row items-center justify-between" style={{ paddingBottom: Math.max(insets.bottom, 16) }} entering={sectionEntering(9)}>
        <View>
          <Text className="text-slate-500 font-medium">Total cotizado</Text>
          <Text className="text-lg font-bold text-slate-800">S/ {totalQuote.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          className={`px-8 py-3 rounded-xl ${client && product.length > 0 && method && !isSubmitting ? 'bg-violet-600' : 'bg-slate-200'}`}
          disabled={!client || product.length === 0 || !method || isSubmitting}
          onPress={() => {
            void handleSave();
          }}
        >
          <Text className={`font-bold ${client && product.length > 0 && method ? 'text-white' : 'text-slate-400'}`}>
            {isSubmitting ? 'Guardando...' : 'Guardar cotización'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

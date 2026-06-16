import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import {
  fetchCatalogItems,
  getReadableCatalogError,
  type CatalogItem,
  type CatalogItemKind,
} from '@/lib/catalog';
import { fetchClientes, getReadableClientesError } from '@/lib/clientes';
import { createCotizacion, getReadableVentasError } from '@/lib/ventas';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { formatCurrencyAmount } from '@/lib/runtime-config';

export default function NuevaOperacionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();

  const methodOptions = [
    { label: 'Entrega a domicilio', value: 'Entrega a domicilio' },
    { label: 'Recojo en tienda', value: 'Recojo en tienda' },
  ] as const;

  const [client, setClient] = useState<string | null>(null);
  const [clientOpen, setClientOpen] = useState(false);
  const [clientItems, setClientItems] = useState<{ label: string; value: string }[]>([]);
  const [itemKind, setItemKind] = useState<CatalogItemKind>('Producto');
  const [product, setProduct] = useState<string[]>([]);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [productOpen, setProductOpen] = useState(false);
  const [productItems, setProductItems] = useState<{ label: string; value: string }[]>([]);
  const [method, setMethod] = useState<'Entrega a domicilio' | 'Recojo en tienda' | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [methodItems, setMethodItems] = useState([...methodOptions]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogItemsById, setCatalogItemsById] = useState<Record<string, { name: string; price: number; kind: CatalogItemKind; stock: number | null }>>({});
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
          fetchCatalogItems(accessToken),
          fetchClientes(accessToken),
        ]);

        setCatalogItems(items);
        setCatalogItemsById(
          Object.fromEntries(
            items.map((item) => [
              item.id,
              { name: item.name, price: item.price, kind: item.kind, stock: item.stock },
            ]),
          ),
        );
        setClientItems(loadedClients.map((item) => ({ label: item.fullName, value: item.id })));
      } catch (dependencyError) {
        const message = dependencyError instanceof Error ? dependencyError.message : '';
        if (message.toLowerCase().includes('cliente')) {
          setClientsError(getReadableClientesError(dependencyError));
        } else {
          setProductsError(getReadableCatalogError(dependencyError));
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void loadDependencies();
  }, [accessToken]);

  useEffect(() => {
    const filteredItems = catalogItems.filter(
      (item) =>
        item.kind === itemKind &&
        (item.kind !== 'Producto' || (typeof item.stock === 'number' && item.stock > 0)),
    );
    setProductItems(
      filteredItems.map((item) => ({
        label: `${item.name} - ${formatCurrencyAmount(item.price)}${item.kind === 'Producto' ? ` · Stock: ${item.stock ?? 0}` : ''}`,
        value: item.id,
      })),
    );
  }, [catalogItems, itemKind]);

  useEffect(() => {
    setProductQuantities((previousQuantities) => {
      const nextQuantities: Record<string, number> = {};

      for (const itemId of product) {
        nextQuantities[itemId] = Math.max(previousQuantities[itemId] ?? 1, 1);
      }

      return nextQuantities;
    });
  }, [product]);

  const selectedProducts = useMemo(() => {
    return product
      .map((productId) => {
        const item = catalogItemsById[productId];

        if (!item || item.kind !== itemKind) {
          return null;
        }

        const maxQuantity = item.kind === 'Producto' ? item.stock ?? 0 : null;
        const quantity = Math.max(
          Math.min(productQuantities[productId] ?? 1, maxQuantity ?? Number.MAX_SAFE_INTEGER),
          1,
        );

        return {
          id: productId,
          name: item.name,
          price: item.price,
          kind: item.kind,
          stock: item.stock,
          quantity,
          subtotal: item.price * quantity,
        };
      })
      .filter(Boolean) as {
      id: string;
      name: string;
      price: number;
      kind: CatalogItemKind;
      stock: number | null;
      quantity: number;
      subtotal: number;
    }[];
  }, [catalogItemsById, itemKind, product, productQuantities]);

  const totalQuote = useMemo(
    () => selectedProducts.reduce((sum, item) => sum + item.subtotal, 0),
    [selectedProducts],
  );

  const handleItemKindChange = (nextKind: CatalogItemKind) => {
    if (nextKind === itemKind) return;
    setItemKind(nextKind);
    setProduct([]);
    setProductQuantities({});
    setProductOpen(false);
  };

  const updateProductQuantity = (itemId: string, nextQuantity: number) => {
    const item = catalogItemsById[itemId];
    const maxQuantity = item?.kind === 'Producto' ? item.stock ?? 0 : null;

    setProductQuantities((previousQuantities) => ({
      ...previousQuantities,
      [itemId]: Math.max(
        Math.min(nextQuantity, maxQuantity ?? Number.MAX_SAFE_INTEGER),
        1,
      ),
    }));
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
      const details = product
        .map((itemId) => {
          const item = catalogItemsById[itemId];

          if (!item) {
            return null;
          }

          return {
            itemId,
            quantity: Math.max(
              Math.min(
                productQuantities[itemId] ?? 1,
                item.kind === 'Producto' ? item.stock ?? 0 : Number.MAX_SAFE_INTEGER,
              ),
              1,
            ),
            unitPrice: item.price.toFixed(2),
          };
        })
        .filter(Boolean) as { itemId: string; quantity: number; unitPrice: string }[];

      if (details.length === 0) {
        setSubmitError('Selecciona al menos un item válido del catálogo.');
        setIsSubmitting(false);
        return;
      }

      await createCotizacion(accessToken, {
        customerId: client,
        details,
        description: description.trim() || undefined,
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
        className="px-4 pb-4 flex-row items-center"
        style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }}
        entering={sectionEntering(0)}
      >
        <TouchableOpacity onPress={() => router.replace('/(drawer)/(tabs)/cotizaciones')} className="mr-4">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold">Nueva cotización</Text>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        entering={sectionEntering(2)}
      >
        <Animated.View className="mb-6" entering={sectionEntering(3)}>
          <Text className="font-semibold text-slate-800 mb-2">Cliente</Text>
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
            <Text className="font-medium" style={{ color: palette.primaryText }}>+ Nuevo cliente</Text>
          </TouchableOpacity>
          {clientsError ? <Text className="mt-2 text-sm font-medium text-rose-600">{clientsError}</Text> : null}
        </Animated.View>

        <Animated.View className="mb-6" entering={sectionEntering(4)}>
          <Text className="text-sm font-semibold text-slate-700 mb-2">Tipo de items</Text>
          <View className="flex-row">
            <TouchableOpacity
              className="mr-3 flex-1 items-center rounded-2xl border px-4 py-3"
              style={{
                borderColor: itemKind === 'Producto' ? palette.primaryBorder : '#e2e8f0',
                backgroundColor: itemKind === 'Producto' ? palette.primarySoft : '#ffffff',
              }}
              onPress={() => handleItemKindChange('Producto')}
            >
              <Text
                className="font-semibold"
                style={{ color: itemKind === 'Producto' ? palette.primaryText : '#475569' }}
              >
                Productos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className={`flex-1 items-center rounded-2xl border px-4 py-3 ${itemKind === 'Servicio' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`} onPress={() => handleItemKindChange('Servicio')}>
              <Text className={`font-semibold ${itemKind === 'Servicio' ? 'text-emerald-700' : 'text-slate-600'}`}>Servicios</Text>
            </TouchableOpacity>
          </View>
          <Text className="font-semibold text-slate-800 mb-2 mt-4">{itemKind === 'Producto' ? 'Productos' : 'Servicios'}</Text>
            <DropDownPicker
             open={productOpen}
             value={product}
             items={productItems}
             setOpen={setProductOpen}
             setValue={setProduct}
             setItems={setProductItems}
             multiple
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
              <ActivityIndicator color={palette.primary} />
              <Text className="ml-3 text-sm text-slate-500">Cargando items...</Text>
            </View>
          ) : null}
          {productsError ? <Text className="mt-2 text-sm font-medium text-rose-600">{productsError}</Text> : null}
          <TouchableOpacity className="items-end mt-2" onPress={() => router.push('/(drawer)/(tabs)/catalog')}>
            <Text className="font-medium" style={{ color: palette.primaryText }}>+ Agregar item</Text>
          </TouchableOpacity>
          <Text className="mt-2 text-xs text-slate-400">
            Selecciona cada item una vez y ajusta la cantidad abajo.
          </Text>
        </Animated.View>

        {selectedProducts.length > 0 ? (
          <Animated.View className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4" entering={sectionEntering(5)}>
            <Text className="text-sm font-semibold text-slate-800">Items seleccionados</Text>
            {selectedProducts.map((selectedItem, index) => (
              <View key={`${selectedItem.id}-${index}`} className="mt-3 rounded-2xl bg-white px-4 py-3">
                <View className="flex-row items-center justify-between">
                  <View className="mr-3 flex-1">
                    <Text className="text-sm font-semibold text-slate-800">{selectedItem.name}</Text>
                    <Text className="mt-1 text-xs text-slate-500">
                      {formatCurrencyAmount(selectedItem.price)} c/u
                      {selectedItem.kind === 'Producto' ? ` · Stock: ${selectedItem.stock ?? 0}` : ''}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-slate-800">
                    {formatCurrencyAmount(selectedItem.subtotal)}
                  </Text>
                </View>

                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-xs font-medium text-slate-500">Cantidad</Text>
                  <View className="flex-row items-center rounded-full bg-slate-100 px-2 py-1">
                    <TouchableOpacity
                      className="h-8 w-8 items-center justify-center rounded-full bg-white"
                      onPress={() => updateProductQuantity(selectedItem.id, selectedItem.quantity - 1)}
                    >
                      <Text className="text-lg font-semibold text-slate-700">-</Text>
                    </TouchableOpacity>
                    <Text className="mx-4 min-w-[20px] text-center text-sm font-semibold text-slate-800">
                      {selectedItem.quantity}
                    </Text>
                    <TouchableOpacity
                      className="h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          selectedItem.kind === 'Producto' &&
                          typeof selectedItem.stock === 'number' &&
                          selectedItem.quantity >= selectedItem.stock
                            ? '#cbd5e1'
                            : palette.primary,
                      }}
                      disabled={
                        selectedItem.kind === 'Producto' &&
                        typeof selectedItem.stock === 'number' &&
                        selectedItem.quantity >= selectedItem.stock
                      }
                      onPress={() => updateProductQuantity(selectedItem.id, selectedItem.quantity + 1)}
                    >
                      <Text className="text-lg font-semibold text-white">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>
        ) : null}

        <Animated.View className="mb-6" entering={sectionEntering(6)}>
          <Text className="font-semibold text-slate-800 mb-2">Observación</Text>
          <TextInput
            className="min-h-[112px] rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-800"
            placeholder="Agrega detalles para el cliente, condiciones o notas de entrega"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={280}
          />
          <Text className="mt-2 text-xs text-slate-400">{description.trim().length}/280</Text>
        </Animated.View>

        <Animated.View className="mb-6" entering={sectionEntering(7)}>
          <Text className="font-semibold text-slate-800 mb-2">Fecha de entrega estimada</Text>
          <TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white" onPress={() => setShowDate(true)}>
            <Text className="text-slate-800">{date.toLocaleDateString()}</Text>
            <Calendar color="#94a3b8" size={20} />
          </TouchableOpacity>
          {showDate ? <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} /> : null}
        </Animated.View>

        <Animated.View className="mb-6" entering={sectionEntering(8)}>
          <Text className="font-semibold text-slate-800 mb-2">Método de entrega</Text>
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

      <Animated.View className="border-t border-slate-100 bg-white px-4 pt-4 flex-row items-center justify-between" style={{ paddingBottom: Math.max(insets.bottom, 16) }} entering={sectionEntering(10)}>
        <View>
          <Text className="text-slate-500 font-medium">Total cotizado</Text>
          <Text className="text-lg font-semibold text-slate-800">{formatCurrencyAmount(totalQuote)}</Text>
        </View>
        <TouchableOpacity
          className="px-8 py-3 rounded-xl"
          style={{
            backgroundColor:
              client && product.length > 0 && method && !isSubmitting ? palette.primary : '#e2e8f0',
          }}
          disabled={!client || product.length === 0 || !method || isSubmitting}
          onPress={() => {
            void handleSave();
          }}
        >
          <Text className={`font-semibold ${client && product.length > 0 && method ? 'text-white' : 'text-slate-400'}`}>
            {isSubmitting ? 'Guardando...' : 'Guardar cotización'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

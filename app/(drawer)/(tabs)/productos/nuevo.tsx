import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { ArrowLeft, Briefcase, Package } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import {
  createProductoServicio,
  fetchProductosServiciosCategories,
  fetchProductosServiciosItemById,
  fetchProductosServiciosUnits,
  getReadableProductosServiciosError,
  updateProductoServicio,
} from '@/lib/productos-servicios';
import { useAuthSession } from '@/lib/auth-session-context';

type ItemKind = 'Producto' | 'Servicio';

const kindOptions = [
  { label: 'Producto', value: 'Producto' },
  { label: 'Servicio', value: 'Servicio' },
];

export default function ProductosServiciosNuevoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuthSession();
  const [kind, setKind] = useState<ItemKind>('Producto');
  const [kindOpen, setKindOpen] = useState(false);
  const [kindItems, setKindItems] = useState(kindOptions);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('1');
  const [unit, setUnit] = useState<string | null>(null);
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitItems, setUnitItems] = useState<{ label: string; value: string }[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<{ label: string; value: string }[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currency = 'S/';
  const dropdownSpacing = 220;

  useEffect(() => {
    const loadOptions = async () => {
      if (!accessToken) {
        return;
      }

      setIsLoadingOptions(true);
      setSubmitError(null);

      try {
        const [units, categories] = await Promise.all([
          fetchProductosServiciosUnits(accessToken),
          fetchProductosServiciosCategories(accessToken),
        ]);

        setUnitItems(
          units.map((unitOption) => ({
            label: `${unitOption.unitName} (${unitOption.abbreviation})`,
            value: unitOption.unitId,
          })),
        );
        setCategoryItems(
          categories.map((categoryOption) => ({
            label: categoryOption.categoryName,
            value: categoryOption.categoryId,
          })),
        );
        if (id) {
          const item = await fetchProductosServiciosItemById(accessToken, id);
          setKind(item.kind);
          setName(item.name);
          setDescription(item.description);
          setPrice(item.price.toFixed(2));
          setSku(item.sku ?? '');
          setStock(item.stock?.toString() ?? '1');

          if (item.kind === 'Producto') {
            const matchingUnit = units.find(
              (unitOption) => unitOption.unitName === item.unit,
            );
            setUnit(matchingUnit?.unitId ?? null);
          } else {
            const matchingCategory = categories.find(
              (categoryOption) => categoryOption.categoryName === item.category,
            );
            setCategory(matchingCategory?.categoryId ?? null);
          }
        }
      } catch (productosServiciosError) {
        setSubmitError(getReadableProductosServiciosError(productosServiciosError));
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void loadOptions();
  }, [accessToken, id]);

  const selectedKindMeta = useMemo(() => {
    const isService = kind === 'Servicio';

    return {
      label: kind,
      accent: isService ? '#059669' : '#7c3aed',
      chipBg: isService ? 'bg-emerald-50' : 'bg-violet-50',
      chipText: isService ? 'text-emerald-700' : 'text-violet-700',
      iconBg: isService ? 'bg-emerald-50' : 'bg-violet-50',
      Icon: isService ? Briefcase : Package,
      hint: isService
        ? 'Define tu servicio y asígnalo a una categoría.'
        : 'Describe tu producto, unidad y stock inicial.',
    };
  }, [kind]);

  const isProduct = kind === 'Producto';

  const isFormValid =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    /^\d+(\.\d{1,2})?$/.test(price.trim()) &&
    (isProduct ? Boolean(unit) : Boolean(category));

  const handleSave = async () => {
    if (!accessToken || !isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        itemClass: isProduct ? ('Product' as const) : ('Service' as const),
        name: name.trim(),
        description: description.trim(),
        sku: sku.trim() || undefined,
        price: price.trim(),
        unitId: isProduct ? (unit ?? undefined) : undefined,
        stock: isProduct ? Number(stock || '1') : undefined,
        categoryId: !isProduct ? (category ?? undefined) : undefined,
      };

      const createdItem = id
        ? await updateProductoServicio(accessToken, id, payload)
        : await createProductoServicio(accessToken, payload);

      router.replace({
        pathname: '/(drawer)/(tabs)/productos/[id]',
        params: { id: createdItem.id },
      });
    } catch (productosServiciosError) {
      setSubmitError(getReadableProductosServiciosError(productosServiciosError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <Animated.View className="flex-1 items-center justify-center bg-white" entering={screenEntering}>
        <ActivityIndicator color="#7c3aed" />
      </Animated.View>
    );
  }

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.replace('/(drawer)/(tabs)/productos')} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">
            {id ? 'Editar item' : 'Nuevo item'}
          </Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.ScrollView
          className="flex-1 px-5 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          entering={sectionEntering(1)}
        >
          <View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-extrabold text-slate-800">Tipo de item</Text>
            <Text className="mt-1 text-sm text-slate-500">
              Selecciona si es producto o servicio.
            </Text>

            <View className="mt-4">
              <DropDownPicker
                open={kindOpen}
                value={kind}
                items={kindItems}
                setOpen={setKindOpen}
                setValue={setKind}
                setItems={setKindItems}
                placeholder="Seleccionar tipo"
                listMode="SCROLLVIEW"
                maxHeight={dropdownSpacing}
                zIndex={3000}
                zIndexInverse={1000}
                style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
                dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
                textStyle={{ color: kind ? '#0f172a' : '#94a3b8' }}
                onOpen={() => {
                  setUnitOpen(false);
                  setCategoryOpen(false);
                }}
              />
            </View>

            <View className="mt-4 flex-row items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <View
                className={`mr-3 h-10 w-10 items-center justify-center rounded-2xl ${selectedKindMeta.iconBg}`}
              >
                <selectedKindMeta.Icon size={20} color={selectedKindMeta.accent} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <View className={`rounded-full px-3 py-1.5 ${selectedKindMeta.chipBg}`}>
                    <Text className={`text-xs font-semibold ${selectedKindMeta.chipText}`}>
                      {selectedKindMeta.label}
                    </Text>
                  </View>
                  <Text className="ml-2 text-xs font-semibold text-slate-400">Seleccionado</Text>
                </View>
                <Text className="mt-1 text-sm text-slate-500">{selectedKindMeta.hint}</Text>
              </View>
            </View>
          </View>

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-extrabold text-slate-800">Información general</Text>
            <Text className="mt-1 text-sm text-slate-500">Completa los datos principales.</Text>

            <View className="mt-5">
              <Text className="text-sm font-bold text-slate-800 mb-2">Nombre</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                placeholder={isProduct ? 'Ej. Box de cupcakes' : 'Ej. Mesa dulce para evento'}
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">Descripción</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                placeholder={
                  isProduct
                    ? 'Describe materiales, tamaño o variantes'
                    : 'Describe alcance, entregables o duración'
                }
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">SKU (opcional)</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                placeholder="Ej. CAKE-CUSTOM"
                placeholderTextColor="#94a3b8"
                value={sku}
                onChangeText={setSku}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-extrabold text-slate-800">Precio y referencia</Text>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">Precio base</Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                <Text className="text-base font-semibold text-slate-500">{currency}</Text>
                <TextInput
                  className="ml-2 flex-1 text-base font-semibold text-slate-800"
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            {isProduct ? (
              <>
                <View className="mt-4">
                  <Text className="text-sm font-bold text-slate-800 mb-2">Unidad</Text>
                  <DropDownPicker
                    open={unitOpen}
                    value={unit}
                    items={unitItems}
                    setOpen={setUnitOpen}
                    setValue={setUnit}
                    setItems={setUnitItems}
                    placeholder="Seleccionar unidad de producto"
                    listMode="SCROLLVIEW"
                    maxHeight={dropdownSpacing}
                    zIndex={2000}
                    zIndexInverse={2000}
                    style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
                    dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
                    textStyle={{ color: unit ? '#0f172a' : '#94a3b8' }}
                    onOpen={() => {
                      setKindOpen(false);
                      setCategoryOpen(false);
                    }}
                  />
                </View>

                <View className="mt-4">
                  <Text className="text-sm font-bold text-slate-800 mb-2">Stock inicial</Text>
                  <TextInput
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                    placeholder="1"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={stock}
                    onChangeText={setStock}
                  />
                </View>
              </>
            ) : (
              <View className="mt-4">
                <Text className="text-sm font-bold text-slate-800 mb-2">Categoría</Text>
                <DropDownPicker
                  open={categoryOpen}
                  value={category}
                  items={categoryItems}
                  setOpen={setCategoryOpen}
                  setValue={setCategory}
                  setItems={setCategoryItems}
                  placeholder="Seleccionar categoría de servicio"
                  listMode="SCROLLVIEW"
                  maxHeight={dropdownSpacing}
                  zIndex={2000}
                  zIndexInverse={2000}
                  style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
                  dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
                  textStyle={{ color: category ? '#0f172a' : '#94a3b8' }}
                  onOpen={() => {
                    setKindOpen(false);
                    setUnitOpen(false);
                  }}
                />
              </View>
            )}

            <View className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Item</Text>
                <Text className="text-sm font-semibold text-slate-800">{kind}</Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Precio</Text>
                <Text className="text-lg font-extrabold text-slate-800">
                  {currency} {price.trim().length > 0 ? price : '0.00'}
                </Text>
              </View>
            </View>
          </View>

          {submitError ? (
            <View className="mt-6 rounded-[28px] border border-rose-100 bg-rose-50 p-5">
              <Text className="text-sm font-semibold text-rose-600">{submitError}</Text>
            </View>
          ) : null}
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <Animated.View
        className="border-t border-slate-100 bg-white px-5 pt-4 flex-row items-center justify-between"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        entering={sectionEntering(2)}
      >
        <View>
          <Text className="text-slate-500 font-medium">Tipo seleccionado</Text>
          <View className="mt-1 flex-row items-center">
            <View className={`mr-2 rounded-full px-3 py-1.5 ${selectedKindMeta.chipBg}`}>
              <Text className={`text-xs font-semibold ${selectedKindMeta.chipText}`}>
                {selectedKindMeta.label}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className={`rounded-2xl px-6 py-3 ${isFormValid && !isSubmitting ? 'bg-violet-600' : 'bg-slate-200'}`}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.85}
          onPress={() => {
            void handleSave();
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className={`font-semibold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>
              Guardar
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { ArrowLeft, Briefcase, Package } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';

type ItemKind = 'Producto' | 'Servicio';

const kindOptions = [
  { label: 'Producto', value: 'Producto' },
  { label: 'Servicio', value: 'Servicio' },
];

const currencyOptions = [
  { label: 'S/', value: 'S/' },
  { label: '$', value: '$' },
];

const productUnitOptions = [
  { label: 'Unidad', value: 'Unidad' },
  { label: 'Caja', value: 'Caja' },
  { label: 'Docena', value: 'Docena' },
  { label: 'Paquete', value: 'Paquete' },
];

const serviceUnitOptions = [
  { label: 'Servicio', value: 'Servicio' },
  { label: 'Evento', value: 'Evento' },
  { label: 'Hora', value: 'Hora' },
  { label: 'Sesión', value: 'Sesión' },
];

export default function CatalogoNuevoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<ItemKind>('Producto');
  const [kindOpen, setKindOpen] = useState(false);
  const [kindItems, setKindItems] = useState(kindOptions);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');

  const [currency, setCurrency] = useState('S/');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currencyItems, setCurrencyItems] = useState(currencyOptions);

  const [unit, setUnit] = useState<string | null>(null);
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitItems, setUnitItems] = useState(productUnitOptions);

  const [type, setType] = useState<'Simple' | 'Personalizado'>('Simple');

  const dropdownSpacing = 210;

  const selectedKindMeta = useMemo(() => {
    const isService = kind === 'Servicio';
    return {
      label: kind,
      accent: isService ? '#059669' : '#7c3aed',
      chipBg: isService ? 'bg-emerald-50' : 'bg-violet-50',
      chipText: isService ? 'text-emerald-700' : 'text-violet-700',
      iconBg: isService ? 'bg-emerald-50' : 'bg-violet-50',
      Icon: isService ? Briefcase : Package,
      hint: isService ? 'Define tu servicio y su alcance' : 'Describe tu producto y su detalle',
      unitOptions: isService ? serviceUnitOptions : productUnitOptions,
    };
  }, [kind]);

  useEffect(() => {
    setUnitItems(selectedKindMeta.unitOptions);
    setUnit(null);
  }, [selectedKindMeta.unitOptions]);

  const isFormValid = name.trim().length > 0 && price.trim().length > 0 && description.trim().length > 0;

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View
        className="bg-violet-600 px-4 pb-4"
        style={{ paddingTop: Math.max(insets.top, 16) + 16 }}
        entering={sectionEntering(0)}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Nuevo item</Text>
        </View>
      </Animated.View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.ScrollView
          className="flex-1 px-5 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          entering={sectionEntering(1)}
        >
          <View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-extrabold text-slate-800">Tipo de item</Text>
            <Text className="mt-1 text-sm text-slate-500">Selecciona si es producto o servicio.</Text>

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
                  setCurrencyOpen(false);
                  setUnitOpen(false);
                }}
              />
              <View style={{ height: kindOpen ? dropdownSpacing : 0 }} />
            </View>

            <View className="mt-4 flex-row items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <View className={`mr-3 h-10 w-10 items-center justify-center rounded-2xl ${selectedKindMeta.iconBg}`}>
                <selectedKindMeta.Icon size={20} color={selectedKindMeta.accent} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <View className={`rounded-full px-3 py-1.5 ${selectedKindMeta.chipBg}`}>
                    <Text className={`text-xs font-semibold ${selectedKindMeta.chipText}`}>{selectedKindMeta.label}</Text>
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
                placeholder={kind === 'Servicio' ? 'Ej. Mesa dulce para evento' : 'Ej. Box de cupcakes'}
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">Descripción</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                placeholder={kind === 'Servicio' ? 'Describe alcance, duración, entregables' : 'Describe materiales, tamaño, sabores'}
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">Tipo de {kind.toLowerCase()}</Text>
              <View className="flex-row">
                <TouchableOpacity
                  className={`mr-3 flex-1 items-center rounded-2xl border px-4 py-3 ${type === 'Simple' ? 'border-violet-200 bg-violet-50' : 'border-slate-200 bg-white'}`}
                  activeOpacity={0.85}
                  onPress={() => setType('Simple')}
                >
                  <Text className={`font-semibold ${type === 'Simple' ? 'text-violet-700' : 'text-slate-600'}`}>Simple</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 items-center rounded-2xl border px-4 py-3 ${type === 'Personalizado' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}
                  activeOpacity={0.85}
                  onPress={() => setType('Personalizado')}
                >
                  <Text className={`font-semibold ${type === 'Personalizado' ? 'text-amber-700' : 'text-slate-600'}`}>Personalizado</Text>
                </TouchableOpacity>
              </View>
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
            <Text className="text-lg font-extrabold text-slate-800">Precio y unidad</Text>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">Moneda</Text>
              <DropDownPicker
                open={currencyOpen}
                value={currency}
                items={currencyItems}
                setOpen={setCurrencyOpen}
                setValue={setCurrency}
                setItems={setCurrencyItems}
                placeholder="Seleccionar moneda"
                listMode="SCROLLVIEW"
                maxHeight={dropdownSpacing}
                zIndex={2500}
                zIndexInverse={1500}
                style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
                dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
                textStyle={{ color: currency ? '#0f172a' : '#94a3b8' }}
                onOpen={() => {
                  setKindOpen(false);
                  setUnitOpen(false);
                }}
              />
              <View style={{ height: currencyOpen ? dropdownSpacing : 0 }} />
            </View>

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

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">Unidad</Text>
              <DropDownPicker
                open={unitOpen}
                value={unit}
                items={unitItems}
                setOpen={setUnitOpen}
                setValue={setUnit}
                setItems={setUnitItems}
                placeholder={kind === 'Servicio' ? 'Seleccionar unidad de servicio' : 'Seleccionar unidad de producto'}
                listMode="SCROLLVIEW"
                maxHeight={dropdownSpacing}
                zIndex={2000}
                zIndexInverse={2000}
                style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }}
                dropDownContainerStyle={{ borderColor: '#e5e7eb' }}
                textStyle={{ color: unit ? '#0f172a' : '#94a3b8' }}
                onOpen={() => {
                  setKindOpen(false);
                  setCurrencyOpen(false);
                }}
              />
              <View style={{ height: unitOpen ? dropdownSpacing : 0 }} />
            </View>

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
              <Text className={`text-xs font-semibold ${selectedKindMeta.chipText}`}>{selectedKindMeta.label}</Text>
            </View>
            <Text className="text-xs font-semibold text-slate-400">{type}</Text>
          </View>
        </View>
        <TouchableOpacity
          className={`rounded-2xl px-6 py-3 ${isFormValid ? 'bg-violet-600' : 'bg-slate-200'}`}
          disabled={!isFormValid}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Text className={`font-semibold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>Guardar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

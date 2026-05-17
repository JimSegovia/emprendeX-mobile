import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import { useRouter } from 'expo-router';
import { ArrowLeft, Briefcase, Check, Package, PencilLine, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ItemKind = 'Producto' | 'Servicio';

const kindOptions = [
  { label: 'Producto', value: 'Producto' },
  { label: 'Servicio', value: 'Servicio' },
];

const DEFAULT_PRODUCT_UNITS = ['Unidad', 'Caja', 'Docena', 'Paquete', 'Kilogramos', 'Litros', 'Metros'];
const DEFAULT_SERVICE_CATEGORIES = ['Servicio', 'Evento', 'Hora', 'Sesión'];

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

  const currency = 'S/';

  // Producto: unidades (seleccion + lista editable)
  const [productUnits, setProductUnits] = useState<string[]>(DEFAULT_PRODUCT_UNITS);
  const [unit, setUnit] = useState<string | null>(null);
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitItems, setUnitItems] = useState<{ label: string; value: string }[]>(
    DEFAULT_PRODUCT_UNITS.map((u) => ({ label: u, value: u })),
  );
  const [newUnit, setNewUnit] = useState('');
  const [showUnitManager, setShowUnitManager] = useState(false);

  // Servicio: categorias (seleccion + lista editable)
  const [serviceCategories, setServiceCategories] = useState<string[]>(DEFAULT_SERVICE_CATEGORIES);
  const [category, setCategory] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<{ label: string; value: string }[]>(
    DEFAULT_SERVICE_CATEGORIES.map((c) => ({ label: c, value: c })),
  );
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // edicion inline (unidades/categorias)
  const [editing, setEditing] = useState<
    | null
    | { scope: 'unit'; original: string; draft: string }
    | { scope: 'category'; original: string; draft: string }
  >(null);
  // para cantidad/stock, solo productos
  const [quantity, setQuantity] = useState('');

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
    };
  }, [kind]);

  useEffect(() => {
    setUnitItems(productUnits.map((u) => ({ label: u, value: u })));
    // si eliminaron o renombraron, dejar la seleccion consistente
    if (unit && !productUnits.includes(unit)) setUnit(null);
  }, [productUnits, unit]);

  useEffect(() => {
    setCategoryItems(serviceCategories.map((c) => ({ label: c, value: c })));
    if (category && !serviceCategories.includes(category)) setCategory(null);
  }, [serviceCategories, category]);

  const normalize = (value: string) => value.trim();

  const listHasValueIgnoreCase = (list: string[], value: string) => {
    const v = value.trim().toLowerCase();
    return list.some((x) => x.trim().toLowerCase() === v);
  };

  const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
    ]);
  };

  const isFormValid =
    name.trim().length > 0 && price.trim().length > 0 && description.trim().length > 0 &&
    // seleccion obligatoria segun tipo (si la lista esta vacia, forzar agregar)
    (kind === 'Producto'
      ? productUnits.length > 0 && !!unit
      : serviceCategories.length > 0 && !!category) &&
    // cantidad obligatoria para productos
    (kind === 'Servicio' || (quantity.trim().length > 0 && !isNaN(Number(quantity)) && Number(quantity) >= 0));

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
          <Text className="text-white text-xl font-bold">Nuevo item</Text>
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
          <View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" style={{ zIndex: kindOpen ? 50 : 1 }}>
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

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" style={{ zIndex: 1 }}>
            <Text className="text-lg font-extrabold text-slate-800">Información general</Text>
            <Text className="mt-1 text-sm text-slate-500">Completa los datos principales.</Text>

            <View className="mt-5">
              <Text className="text-sm font-bold text-slate-800 mb-2">Nombre</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                placeholder={
                  kind === 'Servicio' ? 'Ej. Mesa dulce para evento' : 'Ej. Box de cupcakes'
                }
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
                  kind === 'Servicio'
                    ? 'Describe alcance, duración, entregables'
                    : 'Describe materiales, tamaño, sabores'
                }
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-800 mb-2">
                Tipo de {kind.toLowerCase()}
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  className={`mr-3 flex-1 items-center rounded-2xl border px-4 py-3 ${type === 'Simple' ? 'border-violet-200 bg-violet-50' : 'border-slate-200 bg-white'}`}
                  activeOpacity={0.85}
                  onPress={() => setType('Simple')}
                >
                  <Text
                    className={`font-semibold ${type === 'Simple' ? 'text-violet-700' : 'text-slate-600'}`}
                  >
                    Simple
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 items-center rounded-2xl border px-4 py-3 ${type === 'Personalizado' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}
                  activeOpacity={0.85}
                  onPress={() => setType('Personalizado')}
                >
                  <Text
                    className={`font-semibold ${type === 'Personalizado' ? 'text-amber-700' : 'text-slate-600'}`}
                  >
                    Personalizado
                  </Text>
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

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100" style={{ zIndex: (unitOpen || categoryOpen) ? 50 : 1 }}>
            <Text className="text-lg font-extrabold text-slate-800">Precio y unidad</Text>

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

            {/* Producto: UNIDADES (lista editable + selector) */}
            {kind === 'Producto' ? (
              <View className="mt-4">
                <Text className="text-sm font-bold text-slate-800 mb-2">Unidad</Text>
                {productUnits.length > 0 ? (
                  <>
                    <DropDownPicker
                      open={unitOpen}
                      value={unit}
                      items={unitItems}
                      setOpen={setUnitOpen}
                      setValue={setUnit}
                      setItems={setUnitItems}
                      placeholder="Seleccionar unidad"
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
                      onChangeValue={(val) => {
                        setUnit(val);
                      }}
                    />
                  </>
                ) : (
                  <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <Text className="text-sm font-semibold text-amber-800">
                      No tienes unidades. Agrega al menos una para continuar.
                    </Text>
                  </View>
                )}

                {/* Gestion de unidades (desplegable) */}
                <TouchableOpacity
                  className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Administrar unidades"
                  onPress={() => setShowUnitManager((v) => !v)}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-slate-700">Administrar unidades</Text>
                    <Text className="text-xs font-semibold text-slate-400">
                      {showUnitManager ? 'Ocultar' : 'Ver'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {showUnitManager && (
                  <View className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <Text className="text-xs font-bold uppercase tracking-wide text-slate-500">Unidades</Text>

                    {productUnits.length > 0 ? (
                      <View className="mt-3">
                        {productUnits.map((u) => {
                          const isEditing = editing?.scope === 'unit' && editing.original === u;
                          return (
                            <View key={u} className="mb-2 flex-row items-center justify-between rounded-2xl bg-white px-3 py-2 border border-slate-100">
                              <View className="flex-1 pr-2">
                                {isEditing ? (
                                  <TextInput
                                    className="text-base font-semibold text-slate-800"
                                    value={editing.draft}
                                    onChangeText={(t) => setEditing({ scope: 'unit', original: u, draft: t })}
                                    autoFocus
                                  />
                                ) : (
                                  <Text className="text-base font-semibold text-slate-800">{u}</Text>
                                )}
                              </View>

                              {isEditing ? (
                                <View className="flex-row items-center">
                                  <TouchableOpacity
                                    className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50"
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Guardar unidad ${u}`}
                                    onPress={() => {
                                      const next = normalize(editing.draft);
                                      if (!next) {
                                        Alert.alert('Nombre inválido', 'La unidad no puede estar vacía.');
                                        return;
                                      }
                                      if (u === next) {
                                        setEditing(null);
                                        return;
                                      }
                                      if (listHasValueIgnoreCase(productUnits, next)) {
                                        Alert.alert('Duplicado', 'Ya existe una unidad con ese nombre.');
                                        return;
                                      }
                                      setProductUnits((prev) => prev.map((x) => (x === u ? next : x)));
                                      if (unit === u) setUnit(next);
                                      setEditing(null);
                                      Alert.alert('Unidad actualizada', `Ahora es: ${next}`);
                                    }}
                                  >
                                    <Check size={18} color="#059669" />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Cancelar edición de ${u}`}
                                    onPress={() => setEditing(null)}
                                  >
                                    <X size={18} color="#334155" />
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <View className="flex-row items-center">
                                  <TouchableOpacity
                                    className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-violet-50"
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Editar unidad ${u}`}
                                    onPress={() => setEditing({ scope: 'unit', original: u, draft: u })}
                                  >
                                    <PencilLine size={18} color="#7c3aed" />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    className="h-9 w-9 items-center justify-center rounded-xl bg-rose-50"
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Eliminar unidad ${u}`}
                                    onPress={() => {
                                      if (DEFAULT_PRODUCT_UNITS.includes(u)) {
                                        Alert.alert('Acción no permitida', 'Por ahora no se pueden eliminar las unidades por defecto.');
                                        return;
                                      }
                                      confirmDelete('Eliminar unidad', `¿Eliminar "${u}"?`, () => {
                                        setProductUnits((prev) => prev.filter((x) => x !== u));
                                        if (unit === u) setUnit(null);
                                        Alert.alert('Unidad eliminada', `Se eliminó: ${u}`);
                                      });
                                    }}
                                  >
                                    <Trash2 size={18} color="#e11d48" />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <Text className="mt-2 text-sm text-slate-500">Aún no hay unidades.</Text>
                    )}

                    <View className="mt-3 flex-row items-center">
                      <TextInput
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800"
                        placeholder="Añadir nueva unidad"
                        placeholderTextColor="#94a3b8"
                        value={newUnit}
                        onChangeText={setNewUnit}
                      />
                      <TouchableOpacity
                        className="ml-2 rounded-xl bg-violet-600 px-4 py-3"
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Agregar unidad"
                        onPress={() => {
                          const next = normalize(newUnit);
                          if (!next) {
                            Alert.alert('Nombre inválido', 'Escribe el nombre de la unidad.');
                            return;
                          }
                          if (listHasValueIgnoreCase(productUnits, next)) {
                            Alert.alert('Duplicado', 'Esa unidad ya existe.');
                            return;
                          }
                          setProductUnits((prev) => [...prev, next]);
                          setNewUnit('');
                          if (!unit) setUnit(next);
                          Alert.alert('Unidad agregada', `Se agregó: ${next}`);
                        }}
                      >
                        <Text className="font-semibold text-white">Agregar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              /* Servicio: CATEGORIAS (reemplaza unidad) */
              <View className="mt-4">
                <Text className="text-sm font-bold text-slate-800 mb-2">Categoría de servicio</Text>
                {serviceCategories.length > 0 ? (
                  <>
                    <DropDownPicker
                      open={categoryOpen}
                      value={category}
                      items={categoryItems}
                      setOpen={setCategoryOpen}
                      setValue={setCategory}
                      setItems={setCategoryItems}
                      placeholder="Seleccionar categoría"
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
                      onChangeValue={(val) => {
                        setCategory(val);
                      }}
                    />
                  </>
                ) : (
                  <View className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <Text className="text-sm font-semibold text-amber-800">
                      No tienes categorías. Agrega al menos una para continuar.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Administrar categorías"
                  onPress={() => setShowCategoryManager((v) => !v)}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-slate-700">Administrar categorías</Text>
                    <Text className="text-xs font-semibold text-slate-400">
                      {showCategoryManager ? 'Ocultar' : 'Ver'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {showCategoryManager && (
                  <View className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <Text className="text-xs font-bold uppercase tracking-wide text-slate-500">Categorías</Text>

                    {serviceCategories.length > 0 ? (
                      <View className="mt-3">
                        {serviceCategories.map((c) => {
                          const isEditing = editing?.scope === 'category' && editing.original === c;
                          return (
                            <View key={c} className="mb-2 flex-row items-center justify-between rounded-2xl bg-white px-3 py-2 border border-slate-100">
                              <View className="flex-1 pr-2">
                                {isEditing ? (
                                  <TextInput
                                    className="text-base font-semibold text-slate-800"
                                    value={editing.draft}
                                    onChangeText={(t) => setEditing({ scope: 'category', original: c, draft: t })}
                                    autoFocus
                                  />
                                ) : (
                                  <Text className="text-base font-semibold text-slate-800">{c}</Text>
                                )}
                              </View>

                              {isEditing ? (
                                <View className="flex-row items-center">
                                  <TouchableOpacity
                                    className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50"
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Guardar categoría ${c}`}
                                    onPress={() => {
                                      const next = normalize(editing.draft);
                                      if (!next) {
                                        Alert.alert('Nombre inválido', 'La categoría no puede estar vacía.');
                                        return;
                                      }
                                      if (c === next) {
                                        setEditing(null);
                                        return;
                                      }
                                      if (listHasValueIgnoreCase(serviceCategories, next)) {
                                        Alert.alert('Duplicado', 'Ya existe una categoría con ese nombre.');
                                        return;
                                      }
                                      setServiceCategories((prev) => prev.map((x) => (x === c ? next : x)));
                                      if (category === c) setCategory(next);
                                      setEditing(null);
                                      Alert.alert('Categoría actualizada', `Ahora es: ${next}`);
                                    }}
                                  >
                                    <Check size={18} color="#059669" />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Cancelar edición de ${c}`}
                                    onPress={() => setEditing(null)}
                                  >
                                    <X size={18} color="#334155" />
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <View className="flex-row items-center">
                                  <TouchableOpacity
                                    className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-violet-50"
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Editar categoría ${c}`}
                                    onPress={() => setEditing({ scope: 'category', original: c, draft: c })}
                                  >
                                    <PencilLine size={18} color="#7c3aed" />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    className="h-9 w-9 items-center justify-center rounded-xl bg-rose-50"
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Eliminar categoría ${c}`}
                                    onPress={() => {
                                      if (DEFAULT_SERVICE_CATEGORIES.includes(c)) {
                                        Alert.alert('Acción no permitida', 'Por ahora no se pueden eliminar las categorías por defecto.');
                                        return;
                                      }
                                      confirmDelete('Eliminar categoría', `¿Eliminar "${c}"?`, () => {
                                        setServiceCategories((prev) => prev.filter((x) => x !== c));
                                        if (category === c) setCategory(null);
                                        Alert.alert('Categoría eliminada', `Se eliminó: ${c}`);
                                      });
                                    }}
                                  >
                                    <Trash2 size={18} color="#e11d48" />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <Text className="mt-2 text-sm text-slate-500">Aún no hay categorías.</Text>
                    )}

                    <View className="mt-3 flex-row items-center">
                      <TextInput
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800"
                        placeholder="Añadir nueva categoría"
                        placeholderTextColor="#94a3b8"
                        value={newCategory}
                        onChangeText={setNewCategory}
                      />
                      <TouchableOpacity
                        className="ml-2 rounded-xl bg-violet-600 px-4 py-3"
                        activeOpacity={0.85}
                        accessibilityRole="button"
                        accessibilityLabel="Agregar categoría"
                        onPress={() => {
                          const next = normalize(newCategory);
                          if (!next) {
                            Alert.alert('Nombre inválido', 'Escribe el nombre de la categoría.');
                            return;
                          }
                          if (listHasValueIgnoreCase(serviceCategories, next)) {
                            Alert.alert('Duplicado', 'Esa categoría ya existe.');
                            return;
                          }
                          setServiceCategories((prev) => [...prev, next]);
                          setNewCategory('');
                          if (!category) setCategory(next);
                          Alert.alert('Categoría agregada', `Se agregó: ${next}`);
                        }}
                      >
                        <Text className="font-semibold text-white">Agregar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Campo cantidad/stock SOLO para productos */}
            {kind === 'Producto' && (
              <View className="mt-4">
                <Text className="text-sm font-bold text-slate-800 mb-2">Cantidad en stock</Text>
                <TextInput
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                  placeholder="Ej: 12"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
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
            <Text className="text-xs font-semibold text-slate-400">{type}</Text>
          </View>
        </View>
        <TouchableOpacity
          className={`rounded-2xl px-6 py-3 ${isFormValid ? 'bg-violet-600' : 'bg-slate-200'}`}
          disabled={!isFormValid}
          activeOpacity={0.85}
          onPress={() => {
            // demo: console.log los datos, aquí iría el guardado real
            const dataToSave = {
              name,
              description,
              price: parseFloat(price),
              kind,
              type,
              unit: kind === 'Producto' ? unit : undefined,
              category: kind === 'Servicio' ? category : undefined,
              sku,
              stock: kind === 'Producto' ? Number(quantity) : undefined,
            };
            console.log(dataToSave);
            router.replace('/(drawer)/(tabs)/productos');
          }}
        >
          <Text className={`font-semibold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>
            Guardar
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

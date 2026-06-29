import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { ArrowLeft, Briefcase, Camera, Check, ImageIcon, Package, PencilLine, Trash2, X } from 'lucide-react-native';
import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import {
  createCatalogCategory,
  createCatalogItem,
  createCatalogUnit,
  deleteCatalogCategory,
  deleteCatalogUnit,
  fetchCatalogCategories,
  fetchCatalogItemById,
  fetchCatalogUnits,
  getReadableCatalogError,
  updateCatalogCategory,
  updateCatalogItem,
  updateCatalogUnit,
} from '@/lib/catalog';
import { AttachmentSheet } from '@/components/ui/attachment-sheet';
import { uploadCatalogImage } from '@/lib/catalog';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { DEFAULT_CURRENCY_SYMBOL, formatCurrencyValue } from '@/lib/runtime-config';

type ItemKind = 'Producto' | 'Servicio';

const kindOptions = [
  { label: 'Producto', value: 'Producto' },
  { label: 'Servicio', value: 'Servicio' },
];

export default function CatalogEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
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
  const [showUnitManager, setShowUnitManager] = useState(false);
  const [newUnit, setNewUnit] = useState('');
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingUnitName, setEditingUnitName] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<{ label: string; value: string }[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSavingOption, setIsSavingOption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);

  const currency = DEFAULT_CURRENCY_SYMBOL;
  const dropdownSpacing = 220;

  const mapUnitItems = (units: Awaited<ReturnType<typeof fetchCatalogUnits>>) =>
    units.map((unitOption) => ({
      label: unitOption.unitName,
      value: unitOption.unitId,
    }));

  const mapCategoryItems = (
    categories: Awaited<ReturnType<typeof fetchCatalogCategories>>,
  ) =>
    categories.map((categoryOption) => ({
      label: categoryOption.categoryName,
      value: categoryOption.categoryId,
    }));

  const loadMasterOptions = useCallback(
    async (selectedKind: ItemKind) => {
      if (!accessToken) {
        return null;
      }

      const [units, categories] = await Promise.all([
        fetchCatalogUnits(accessToken, selectedKind),
        fetchCatalogCategories(accessToken, selectedKind),
      ]);

      return { units, categories };
    },
    [accessToken],
  );

  useEffect(() => {
    const loadOptions = async () => {
      if (!accessToken) {
        return;
      }

      setIsLoadingOptions(true);
      setSubmitError(null);

      try {
        if (id) {
          const item = await fetchCatalogItemById(accessToken, id);
          const options = await loadMasterOptions(item.kind);

          if (!options) {
            return;
          }

          setUnitItems(mapUnitItems(options.units));
          setCategoryItems(mapCategoryItems(options.categories));
          setKind(item.kind);
          setName(item.name);
          setDescription(item.description);
          setPrice(item.price.toFixed(2));
          setSku(item.sku ?? '');
          setStock(item.stock?.toString() ?? '0');
          setUnit(item.unit.id);
          setCategory(item.category.id);

          return;
        }

        const options = await loadMasterOptions(kind);

        if (!options) {
          return;
        }

        setUnitItems(mapUnitItems(options.units));
        setCategoryItems(mapCategoryItems(options.categories));
      } catch (catalogError) {
        setSubmitError(getReadableCatalogError(catalogError));
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void loadOptions();
  }, [accessToken, id, kind, loadMasterOptions]);

  useEffect(() => {
    if (!id) {
      setUnit(null);
      setCategory(null);
    }
  }, [id, kind]);

  const selectedKindMeta = useMemo(() => {
    const isService = kind === 'Servicio';

    return {
      label: kind,
      accent: isService ? '#059669' : palette.primary,
      chipBg: isService ? '#ecfdf5' : palette.primarySoft,
      chipText: isService ? '#047857' : palette.primaryText,
      iconBg: isService ? '#ecfdf5' : palette.primarySoft,
      Icon: isService ? Briefcase : Package,
      hint: isService
        ? 'Define tu servicio y asígnale categoría y unidad.'
        : 'Describe tu producto y asígnale categoría, unidad y stock inicial.',
    };
  }, [kind, palette]);

  const isProduct = kind === 'Producto';

  const normalize = (value: string) => value.trim();

  const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
    ]);
  };

  const handleAddUnit = async () => {
    const next = normalize(newUnit);

    if (!accessToken) {
      return;
    }

    if (!next) {
      Alert.alert('Nombre inválido', 'Escribe el nombre de la unidad.');
      return;
    }

    if (
      unitItems.some(
        (item) => item.label.trim().toLowerCase() === next.toLowerCase(),
      )
    ) {
      Alert.alert('Duplicado', 'Esa unidad ya existe.');
      return;
    }

    setIsSavingOption(true);
    setSubmitError(null);

    try {
      const createdUnit = await createCatalogUnit(accessToken, {
        itemClass: kind,
        unitName: next,
      });

      setUnitItems((prev) => [
        ...prev,
        {
          label: createdUnit.unitName,
          value: createdUnit.unitId,
        },
      ]);
      setNewUnit('');
      setUnit(createdUnit.unitId);
      Alert.alert('Unidad agregada', `Se agregó: ${createdUnit.unitName}`);
    } catch (catalogError) {
      Alert.alert('No se pudo agregar la unidad', getReadableCatalogError(catalogError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleUpdateUnit = async (unitId: string) => {
    const next = normalize(editingUnitName);

    if (!accessToken) {
      return;
    }

    if (!next) {
      Alert.alert('Nombre inválido', 'La unidad no puede estar vacía.');
      return;
    }

    if (
      unitItems.some(
        (item) =>
          item.value !== unitId &&
          item.label.trim().toLowerCase() === next.toLowerCase(),
      )
    ) {
      Alert.alert('Duplicado', 'Ya existe una unidad con ese nombre.');
      return;
    }

    setIsSavingOption(true);
    setSubmitError(null);

    try {
      const updatedUnit = await updateCatalogUnit(accessToken, unitId, {
        unitName: next,
      });

      setUnitItems((prev) =>
        prev.map((item) =>
          item.value === unitId
            ? {
                label: updatedUnit.unitName,
                value: updatedUnit.unitId,
              }
            : item,
        ),
      );
      setEditingUnitId(null);
      setEditingUnitName('');
      Alert.alert('Unidad actualizada', `Ahora es: ${updatedUnit.unitName}`);
    } catch (catalogError) {
      Alert.alert('No se pudo actualizar la unidad', getReadableCatalogError(catalogError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleDeleteUnit = (unitId: string, label: string) => {
    if (!accessToken) {
      return;
    }

    confirmDelete('Eliminar unidad', `¿Eliminar "${label}"?`, () => {
      void (async () => {
        setIsSavingOption(true);
        setSubmitError(null);

        try {
          await deleteCatalogUnit(accessToken, unitId);
          setUnitItems((prev) => prev.filter((item) => item.value !== unitId));
          if (unit === unitId) {
            setUnit(null);
          }
          Alert.alert('Unidad eliminada', `Se eliminó: ${label}`);
        } catch (catalogError) {
          Alert.alert('No se pudo eliminar la unidad', getReadableCatalogError(catalogError));
        } finally {
          setIsSavingOption(false);
        }
      })();
    });
  };

  const handleAddCategory = async () => {
    const next = normalize(newCategory);

    if (!accessToken) {
      return;
    }

    if (!next) {
      Alert.alert('Nombre inválido', 'Escribe el nombre de la categoría.');
      return;
    }

    if (categoryItems.some((item) => item.label.trim().toLowerCase() === next.toLowerCase())) {
      Alert.alert('Duplicado', 'Esa categoría ya existe.');
      return;
    }

    setIsSavingOption(true);
    setSubmitError(null);

    try {
      const createdCategory = await createCatalogCategory(accessToken, {
        itemClass: kind,
        categoryName: next,
      });

      setCategoryItems((prev) => [
        ...prev,
        {
          label: createdCategory.categoryName,
          value: createdCategory.categoryId,
        },
      ]);
      setNewCategory('');
      setCategory(createdCategory.categoryId);
      Alert.alert('Categoría agregada', `Se agregó: ${createdCategory.categoryName}`);
    } catch (catalogError) {
      Alert.alert(
        'No se pudo agregar la categoría',
        getReadableCatalogError(catalogError),
      );
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleUpdateCategory = async (categoryId: string) => {
    const next = normalize(editingCategoryName);

    if (!accessToken) {
      return;
    }

    if (!next) {
      Alert.alert('Nombre inválido', 'La categoría no puede estar vacía.');
      return;
    }

    if (
      categoryItems.some(
        (item) => item.value !== categoryId && item.label.trim().toLowerCase() === next.toLowerCase(),
      )
    ) {
      Alert.alert('Duplicado', 'Ya existe una categoría con ese nombre.');
      return;
    }

    setIsSavingOption(true);
    setSubmitError(null);

    try {
      const updatedCategory = await updateCatalogCategory(accessToken, categoryId, {
        categoryName: next,
      });

      setCategoryItems((prev) =>
        prev.map((item) =>
          item.value === categoryId
            ? {
                label: updatedCategory.categoryName,
                value: updatedCategory.categoryId,
              }
            : item,
        ),
      );
      setEditingCategoryId(null);
      setEditingCategoryName('');
      Alert.alert('Categoría actualizada', `Ahora es: ${updatedCategory.categoryName}`);
    } catch (catalogError) {
      Alert.alert(
        'No se pudo actualizar la categoría',
        getReadableCatalogError(catalogError),
      );
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleDeleteCategory = (categoryId: string, label: string) => {
    if (!accessToken) {
      return;
    }

    confirmDelete('Eliminar categoría', `¿Eliminar "${label}"?`, () => {
      void (async () => {
        setIsSavingOption(true);
        setSubmitError(null);

        try {
          await deleteCatalogCategory(accessToken, categoryId);
          setCategoryItems((prev) => prev.filter((item) => item.value !== categoryId));
          if (category === categoryId) {
            setCategory(null);
          }
          Alert.alert('Categoría eliminada', `Se eliminó: ${label}`);
        } catch (catalogError) {
          Alert.alert(
            'No se pudo eliminar la categoría',
            getReadableCatalogError(catalogError),
          );
        } finally {
          setIsSavingOption(false);
        }
      })();
    });
  };

  const isFormValid =
    name.trim().length > 0 &&
    /^\d+(\.\d{1,2})?$/.test(price.trim()) &&
    Boolean(unit) &&
    Boolean(category) &&
    (!isProduct || /^\d+$/.test(stock.trim()));

  const handleSave = async () => {
    if (!accessToken || !isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        itemClass: isProduct ? ('Producto' as const) : ('Servicio' as const),
        name: name.trim(),
        description: description.trim() || undefined,
        sku: sku.trim() || undefined,
        price: price.trim(),
        unitId: unit!,
        categoryId: category!,
        stock: isProduct ? Number(stock || '0') : undefined,
      };

      const savedItem = id
        ? await updateCatalogItem(accessToken, id, payload)
        : await createCatalogItem(accessToken, payload);

      // Upload image if one was selected
      if (selectedImageUri) {
        try {
          await uploadCatalogImage(accessToken, savedItem.id, selectedImageUri);
        } catch {
          // Image upload failure is non-blocking; item was already saved
          setSubmitError('Item guardado, pero no se pudo subir la imagen.');
          return;
        }
      }

      router.replace({
        pathname: '/(drawer)/(tabs)/catalog/[id]',
        params: { id: savedItem.id },
      });
    } catch (catalogError) {
      setSubmitError(getReadableCatalogError(catalogError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <Animated.View className="flex-1 items-center justify-center bg-white" entering={screenEntering}>
        <ActivityIndicator color={palette.primary} />
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
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.replace('/(drawer)/(tabs)/catalog')} className="mr-4">
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">
            {id ? 'Editar item' : 'Nuevo item'}
          </Text>
        </View>
      </Animated.View>

      <Animated.View className="flex-1" entering={sectionEntering(1)}>
        <KeyboardAwareLayout
          style={{ paddingHorizontal: 20, paddingTop: 24 }}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        >
          <View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-semibold text-slate-800">Tipo de item</Text>
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
                disabled={Boolean(id)}
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
                className="mr-3 h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: selectedKindMeta.iconBg }}
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

          {/* ── Imagen ── */}
          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-semibold text-slate-800">Imagen</Text>
            <Text className="mt-1 text-sm text-slate-500">
              {isProduct
                ? 'Agrega una foto del producto para identificarlo mejor.'
                : 'Agrega una foto representativa del servicio.'}
            </Text>

            <TouchableOpacity
              className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              activeOpacity={0.85}
              onPress={() => setShowAttachmentSheet(true)}
            >
              {selectedImageUri ? (
                <View className="relative">
                  <Image
                    source={{ uri: selectedImageUri }}
                    style={{ width: '100%', height: 180 }}
                    contentFit="cover"
                    transition={220}
                  />
                  <View className="absolute inset-0 bg-black/0 active:bg-black/10" />
                  <View className="absolute bottom-3 left-3 flex-row items-center rounded-full bg-white/90 px-3 py-1.5 shadow-sm">
                    <Camera size={14} color="#334155" />
                    <Text className="ml-1.5 text-xs font-semibold text-slate-700">Cambiar foto</Text>
                  </View>
                </View>
              ) : (
                <View className="h-40 items-center justify-center">
                  <View className="h-14 w-14 rounded-2xl bg-slate-100 items-center justify-center">
                    <ImageIcon size={28} color="#94a3b8" />
                  </View>
                  <Text className="mt-3 text-sm font-semibold text-slate-500">Agregar foto</Text>
                  <Text className="mt-1 text-xs text-slate-400">Toca para adjuntar una imagen</Text>
                </View>
              )}
            </TouchableOpacity>

            {selectedImageUri ? (
              <TouchableOpacity
                className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2.5 items-center"
                activeOpacity={0.85}
                onPress={() => setSelectedImageUri(null)}
              >
                <Text className="text-sm font-semibold text-rose-600">Eliminar foto</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-semibold text-slate-800">Información general</Text>
            <Text className="mt-1 text-sm text-slate-500">Completa los datos principales.</Text>

            <View className="mt-5">
              <Text className="text-sm font-semibold text-slate-800 mb-2">Nombre</Text>
              <TextInput
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                placeholder={isProduct ? 'Ej. Box de cupcakes' : 'Ej. Mesa dulce para evento'}
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-slate-800 mb-2">Descripción</Text>
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
              <Text className="text-sm font-semibold text-slate-800 mb-2">SKU (opcional)</Text>
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
            <Text className="text-lg font-semibold text-slate-800">Precio y referencia</Text>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-slate-800 mb-2">Precio base</Text>
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
              <Text className="text-sm font-semibold text-slate-800 mb-2">Unidad</Text>
              <DropDownPicker
                open={unitOpen}
                value={unit}
                items={unitItems}
                setOpen={setUnitOpen}
                setValue={setUnit}
                setItems={setUnitItems}
                placeholder={`Seleccionar unidad de ${isProduct ? 'producto' : 'servicio'}`}
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

            {id ? (
              <Text className="mt-3 text-xs font-medium text-slate-400">
                El tipo de item no se puede cambiar durante la edición.
              </Text>
            ) : null}

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
                <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unidades</Text>

                {unitItems.length > 0 ? (
                  <View className="mt-3">
                    {unitItems.map((option) => {
                      const isEditing = editingUnitId === option.value;
                      return (
                        <View
                          key={option.value}
                          className="mb-2 flex-row items-center justify-between rounded-2xl bg-white px-3 py-2 border border-slate-100"
                        >
                          <View className="flex-1 pr-2">
                            {isEditing ? (
                              <TextInput
                                className="text-base font-semibold text-slate-800"
                                value={editingUnitName}
                                onChangeText={setEditingUnitName}
                                autoFocus
                              />
                            ) : (
                              <Text className="text-base font-semibold text-slate-800">
                                {option.label}
                              </Text>
                            )}
                          </View>

                          {isEditing ? (
                            <View className="flex-row items-center">
                              <TouchableOpacity
                                className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50"
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={`Guardar unidad ${option.label}`}
                                onPress={() => {
                                  void handleUpdateUnit(option.value);
                                }}
                              >
                                <Check size={18} color="#059669" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={`Cancelar edición de ${option.label}`}
                                onPress={() => {
                                  setEditingUnitId(null);
                                  setEditingUnitName('');
                                }}
                              >
                                <X size={18} color="#334155" />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View className="flex-row items-center">
                              <TouchableOpacity
                                className="mr-2 h-9 w-9 items-center justify-center rounded-xl"
                                style={{ backgroundColor: palette.primarySoft }}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={`Editar unidad ${option.label}`}
                                onPress={() => {
                                  setEditingUnitId(option.value);
                                  setEditingUnitName(option.label);
                                }}
                              >
                                <PencilLine size={18} color={palette.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                className="h-9 w-9 items-center justify-center rounded-xl bg-rose-50"
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={`Eliminar unidad ${option.label}`}
                                onPress={() => {
                                  handleDeleteUnit(option.value, option.label);
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
                    className="ml-2 rounded-xl px-4 py-3"
                    style={{ backgroundColor: palette.primary }}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Agregar unidad"
                    disabled={isSavingOption}
                    onPress={() => {
                      void handleAddUnit();
                    }}
                  >
                    <Text className="font-semibold text-white">Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View className="mt-4">
              <Text className="text-sm font-semibold text-slate-800 mb-2">Categoría</Text>
              <DropDownPicker
                open={categoryOpen}
                value={category}
                items={categoryItems}
                setOpen={setCategoryOpen}
                setValue={setCategory}
                setItems={setCategoryItems}
                placeholder={`Seleccionar categoría de ${isProduct ? 'producto' : 'servicio'}`}
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
                <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categorías</Text>

                {categoryItems.length > 0 ? (
                  <View className="mt-3">
                    {categoryItems.map((option) => {
                      const isEditing = editingCategoryId === option.value;
                      return (
                        <View
                          key={option.value}
                          className="mb-2 flex-row items-center justify-between rounded-2xl bg-white px-3 py-2 border border-slate-100"
                        >
                          <View className="flex-1 pr-2">
                            {isEditing ? (
                              <TextInput
                                className="text-base font-semibold text-slate-800"
                                value={editingCategoryName}
                                onChangeText={setEditingCategoryName}
                                autoFocus
                              />
                            ) : (
                              <Text className="text-base font-semibold text-slate-800">
                                {option.label}
                              </Text>
                            )}
                          </View>

                          {isEditing ? (
                            <View className="flex-row items-center">
                              <TouchableOpacity
                                className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50"
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={`Guardar categoría ${option.label}`}
                                onPress={() => {
                                  void handleUpdateCategory(option.value);
                                }}
                              >
                                <Check size={18} color="#059669" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100"
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={`Cancelar edición de ${option.label}`}
                                onPress={() => {
                                  setEditingCategoryId(null);
                                  setEditingCategoryName('');
                                }}
                              >
                                <X size={18} color="#334155" />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View className="flex-row items-center">
                              <TouchableOpacity
                                className="mr-2 h-9 w-9 items-center justify-center rounded-xl"
                                style={{ backgroundColor: palette.primarySoft }}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={`Editar categoría ${option.label}`}
                                onPress={() => {
                                  setEditingCategoryId(option.value);
                                  setEditingCategoryName(option.label);
                                }}
                              >
                                <PencilLine size={18} color={palette.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                className="h-9 w-9 items-center justify-center rounded-xl bg-rose-50"
                                activeOpacity={0.85}
                                accessibilityRole="button"
                                accessibilityLabel={`Eliminar categoría ${option.label}`}
                                onPress={() => {
                                  handleDeleteCategory(option.value, option.label);
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
                    className="ml-2 rounded-xl px-4 py-3"
                    style={{ backgroundColor: palette.primary }}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Agregar categoría"
                    disabled={isSavingOption}
                    onPress={() => {
                      void handleAddCategory();
                    }}
                  >
                    <Text className="font-semibold text-white">Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isProduct ? (
              <View className="mt-4">
                <Text className="text-sm font-semibold text-slate-800 mb-2">Stock inicial</Text>
                <TextInput
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-800"
                  placeholder="0"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  value={stock}
                  onChangeText={setStock}
                />
              </View>
            ) : null}

            <View className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Item</Text>
                <Text className="text-sm font-semibold text-slate-800">{kind}</Text>
              </View>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="text-sm text-slate-500">Precio</Text>
                <Text className="text-lg font-semibold text-slate-800">
                  {formatCurrencyValue(price.trim().length > 0 ? price : '0')}
                </Text>
              </View>
            </View>
          </View>

          {submitError ? (
            <View className="mt-6 rounded-[28px] border border-rose-100 bg-rose-50 p-5">
              <Text className="text-sm font-semibold text-rose-600">{submitError}</Text>
            </View>
          ) : null}
        </KeyboardAwareLayout>
      </Animated.View>

      <Animated.View
        className="border-t border-slate-100 bg-white px-5 pt-4 flex-row items-center justify-between"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        entering={sectionEntering(2)}
      >
        <View>
          <Text className="text-slate-500 font-medium">Tipo seleccionado</Text>
          <View className="mt-1 flex-row items-center">
            <View className="mr-2 rounded-full px-3 py-1.5" style={{ backgroundColor: selectedKindMeta.chipBg }}>
              <Text className="text-xs font-semibold" style={{ color: selectedKindMeta.chipText }}>
                {selectedKindMeta.label}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="rounded-2xl px-6 py-3"
          style={{ backgroundColor: isFormValid && !isSubmitting ? palette.primary : '#e2e8f0' }}
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

      <AttachmentSheet
        visible={showAttachmentSheet}
        onClose={() => setShowAttachmentSheet(false)}
        onAttach={(uris) => {
          if (uris.length > 0) {
            setSelectedImageUri(uris[0]);
          }
          setShowAttachmentSheet(false);
        }}
      />
    </Animated.View>
  );
}

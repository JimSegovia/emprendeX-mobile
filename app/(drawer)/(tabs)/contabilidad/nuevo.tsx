import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar as CalendarIcon, Check, CreditCard, PackageMinus, PencilLine, Receipt, Trash2, X } from 'lucide-react-native';
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createCategoriaFinanciera, createGasto, createMetodoPago, createPago, deleteCategoriaFinanciera, deleteMetodoPago, fetchCategoriasFinancieras, fetchMetodosPago, getReadableContabilidadError, updateCategoriaFinanciera, updateMetodoPago } from '@/lib/contabilidad';
import { fetchPedidosPendientes, getReadableVentasError, type PedidoPendiente } from '@/lib/ventas';
import { useAccountPreferences } from '@/lib/account-preferences-context';
import { useAuthSession } from '@/lib/auth-session-context';
import { DEFAULT_CURRENCY_SYMBOL, formatCurrencyAmount, formatCurrencyValue } from '@/lib/runtime-config';

type InlineSelectOption = { label: string; value: string };

function InlineSelect({
  value,
  items,
  placeholder,
  onSelect,
  isOpen,
  onToggle,
  activeColor,
}: {
  value: string | null;
  items: InlineSelectOption[];
  placeholder: string;
  onSelect: (v: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  activeColor: string;
}) {
  const selected = items.find((i) => i.value === value);
  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5"
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <Text className={`text-base font-medium ${selected ? 'text-slate-800' : 'text-slate-400'}`}>
          {selected?.label ?? placeholder}
        </Text>
        <Text className="text-slate-400 text-xs">{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isOpen ? (
        <View className="mt-2 rounded-xl border border-slate-200 bg-white max-h-[180px] overflow-hidden">
          {items.map((item) => {
            const isActive = item.value === value;
            return (
              <TouchableOpacity
                key={item.value}
                className={`px-4 py-3 border-b border-slate-100 ${isActive ? 'bg-slate-50' : ''}`}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(item.value);
                  onToggle();
                }}
              >
                <Text
                  className={`text-base ${isActive ? 'font-semibold' : 'font-medium'}`}
                  style={{ color: isActive ? activeColor : '#1e293b' }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

type ItemKind = 'Pago' | 'Gasto';

const kindOptions = [
  { label: 'Ingreso por Pago', value: 'Pago' },
  { label: 'Salida por Gasto', value: 'Gasto' },
];

export default function NuevoRegistroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useAccountPreferences();
  const { accessToken } = useAuthSession();
  const { tipo } = useLocalSearchParams<{ tipo?: 'pago' | 'gasto' }>();
  const [kind, setKind] = useState<ItemKind>(tipo === 'gasto' ? 'Gasto' : 'Pago');
  const [kindOpen, setKindOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [methodItems, setMethodItems] = useState<InlineSelectOption[]>([]);
  const [showMethodManager, setShowMethodManager] = useState(false);
  const [newMethod, setNewMethod] = useState('');
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [editingMethodName, setEditingMethodName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteItems, setQuoteItems] = useState<InlineSelectOption[]>([]);
  const [pendingQuotes, setPendingQuotes] = useState<PedidoPendiente[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<InlineSelectOption[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSavingOption, setIsSavingOption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalize = (value: string) => value.trim();

  const confirmDelete = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
    ]);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) return;

      setIsLoadingOptions(true);
      setError(null);

      try {
        const [ordersResult, methodsResult, categoriesResult] = await Promise.allSettled([
          fetchPedidosPendientes(accessToken),
          fetchMetodosPago(accessToken),
          fetchCategoriasFinancieras(accessToken),
        ]);

        if (ordersResult.status === 'fulfilled') {
          setPendingQuotes(ordersResult.value);
          setQuoteItems(
            ordersResult.value.map((item) => ({
              label: `${item.referenceCode} · ${item.customerName}`,
              value: item.id,
            })),
          );
        } else {
          setPendingQuotes([]);
          setQuoteItems([]);
        }

        if (methodsResult.status === 'fulfilled') {
          setMethodItems(
            methodsResult.value.map((item) => ({
              label: item.name,
              value: item.paymentMethodId,
            })),
          );
        } else {
          setMethodItems([]);
        }

        if (categoriesResult.status === 'fulfilled') {
          setCategoryItems(
            categoriesResult.value.map((item) => ({
              label: item.name,
              value: item.financialCategoryId,
            })),
          );
        } else {
          setCategoryItems([]);
        }

        const failedResult = [ordersResult, methodsResult, categoriesResult].find(
          (result) => result.status === 'rejected',
        );

        if (failedResult?.status === 'rejected') {
          setError(getReadableContabilidadError(failedResult.reason));
        }
      } catch (loadError) {
        setError(getReadableContabilidadError(loadError));
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void loadData();
  }, [accessToken]);

  const selectedQuote = useMemo(() => pendingQuotes.find((item) => item.id === quote), [pendingQuotes, quote]);
  const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
  const remainingBalance = selectedQuote ? Math.max(Number(selectedQuote.balance) - (Number.isNaN(parsedAmount) ? 0 : parsedAmount), 0) : 0;
  const isPago = kind === 'Pago';
  const isFormValid = isPago ? Boolean(quote && amount.trim() && method) : Boolean(category && amount.trim() && method);

  function handleDateChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    setShowDate(false);
    if (selectedDate) setDate(selectedDate);
  }

  const handleAddMethod = async () => {
    const next = normalize(newMethod);

    if (!accessToken) return;
    if (!next) {
      Alert.alert('Nombre inválido', 'Escribe el nombre del método de pago.');
      return;
    }
    if (methodItems.some((item) => item.label.trim().toLowerCase() === next.toLowerCase())) {
      Alert.alert('Duplicado', 'Ese método de pago ya existe.');
      return;
    }

    setIsSavingOption(true);
    setError(null);

    try {
      const createdMethod = await createMetodoPago(accessToken, { name: next });
      setMethodItems((prev) => [...prev, { label: createdMethod.name, value: createdMethod.paymentMethodId }]);
      setNewMethod('');
      setMethod(createdMethod.paymentMethodId);
      Alert.alert('Método agregado', `Se agregó: ${createdMethod.name}`);
    } catch (optionError) {
      Alert.alert('No se pudo agregar el método', getReadableContabilidadError(optionError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleUpdateMethod = async (paymentMethodId: string) => {
    const next = normalize(editingMethodName);

    if (!accessToken) return;
    if (!next) {
      Alert.alert('Nombre inválido', 'El método de pago no puede estar vacío.');
      return;
    }
    if (
      methodItems.some(
        (item) => item.value !== paymentMethodId && item.label.trim().toLowerCase() === next.toLowerCase(),
      )
    ) {
      Alert.alert('Duplicado', 'Ya existe un método de pago con ese nombre.');
      return;
    }

    setIsSavingOption(true);
    setError(null);

    try {
      const updatedMethod = await updateMetodoPago(accessToken, paymentMethodId, { name: next });
      setMethodItems((prev) =>
        prev.map((item) =>
          item.value === paymentMethodId
            ? { label: updatedMethod.name, value: updatedMethod.paymentMethodId }
            : item,
        ),
      );
      setEditingMethodId(null);
      setEditingMethodName('');
      Alert.alert('Método actualizado', `Ahora es: ${updatedMethod.name}`);
    } catch (optionError) {
      Alert.alert('No se pudo actualizar el método', getReadableContabilidadError(optionError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleDeleteMethod = (paymentMethodId: string, label: string) => {
    if (!accessToken) return;

    confirmDelete('Eliminar método', `¿Eliminar "${label}"?`, () => {
      void (async () => {
        setIsSavingOption(true);
        setError(null);

        try {
          await deleteMetodoPago(accessToken, paymentMethodId);
          setMethodItems((prev) => prev.filter((item) => item.value !== paymentMethodId));
          if (method === paymentMethodId) {
            setMethod(null);
          }
          Alert.alert('Método eliminado', `Se eliminó: ${label}`);
        } catch (optionError) {
          Alert.alert('No se pudo eliminar el método', getReadableContabilidadError(optionError));
        } finally {
          setIsSavingOption(false);
        }
      })();
    });
  };

  const handleAddCategory = async () => {
    const next = normalize(newCategory);

    if (!accessToken) return;
    if (!next) {
      Alert.alert('Nombre inválido', 'Escribe el nombre de la categoría.');
      return;
    }
    if (categoryItems.some((item) => item.label.trim().toLowerCase() === next.toLowerCase())) {
      Alert.alert('Duplicado', 'Esa categoría ya existe.');
      return;
    }

    setIsSavingOption(true);
    setError(null);

    try {
      const createdCategory = await createCategoriaFinanciera(accessToken, { name: next });
      setCategoryItems((prev) => [
        ...prev,
        { label: createdCategory.name, value: createdCategory.financialCategoryId },
      ]);
      setNewCategory('');
      setCategory(createdCategory.financialCategoryId);
      Alert.alert('Categoría agregada', `Se agregó: ${createdCategory.name}`);
    } catch (optionError) {
      Alert.alert('No se pudo agregar la categoría', getReadableContabilidadError(optionError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleUpdateCategory = async (financialCategoryId: string) => {
    const next = normalize(editingCategoryName);

    if (!accessToken) return;
    if (!next) {
      Alert.alert('Nombre inválido', 'La categoría no puede estar vacía.');
      return;
    }
    if (
      categoryItems.some(
        (item) => item.value !== financialCategoryId && item.label.trim().toLowerCase() === next.toLowerCase(),
      )
    ) {
      Alert.alert('Duplicado', 'Ya existe una categoría con ese nombre.');
      return;
    }

    setIsSavingOption(true);
    setError(null);

    try {
      const updatedCategory = await updateCategoriaFinanciera(accessToken, financialCategoryId, {
        name: next,
      });
      setCategoryItems((prev) =>
        prev.map((item) =>
          item.value === financialCategoryId
            ? { label: updatedCategory.name, value: updatedCategory.financialCategoryId }
            : item,
        ),
      );
      setEditingCategoryId(null);
      setEditingCategoryName('');
      Alert.alert('Categoría actualizada', `Ahora es: ${updatedCategory.name}`);
    } catch (optionError) {
      Alert.alert('No se pudo actualizar la categoría', getReadableContabilidadError(optionError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleDeleteCategory = (financialCategoryId: string, label: string) => {
    if (!accessToken) return;

    confirmDelete('Eliminar categoría', `¿Eliminar "${label}"?`, () => {
      void (async () => {
        setIsSavingOption(true);
        setError(null);

        try {
          await deleteCategoriaFinanciera(accessToken, financialCategoryId);
          setCategoryItems((prev) => prev.filter((item) => item.value !== financialCategoryId));
          if (category === financialCategoryId) {
            setCategory(null);
          }
          Alert.alert('Categoría eliminada', `Se eliminó: ${label}`);
        } catch (optionError) {
          Alert.alert('No se pudo eliminar la categoría', getReadableContabilidadError(optionError));
        } finally {
          setIsSavingOption(false);
        }
      })();
    });
  };

  const handleSubmit = async () => {
    if (!accessToken || !isFormValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (isPago && quote && method) {
        await createPago(accessToken, { orderId: quote, paymentMethodId: method, amount });
      }
      if (!isPago && category && method) {
        await createGasto(accessToken, {
          financialCategoryId: category,
          paymentMethodId: method,
          amount,
          description: nota.trim() || undefined,
        });
      }
      router.replace('/(drawer)/(tabs)/contabilidad' as never);
    } catch (submitError) {
      setError(isPago ? getReadableVentasError(submitError) : getReadableContabilidadError(submitError));
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
      <Animated.View className="px-4 pb-4 flex-row items-center" style={{ paddingTop: Math.max(insets.top, 16) + 16, backgroundColor: palette.primary }} entering={sectionEntering(0)}>
        <TouchableOpacity onPress={() => router.back()} className="mr-4"><ArrowLeft color="white" size={24} /></TouchableOpacity>
        <Text className="text-white text-xl font-semibold">Nuevo registro</Text>
      </Animated.View>

      <Animated.View className="flex-1" entering={sectionEntering(1)}>
        <KeyboardAwareLayout style={{ paddingHorizontal: 20, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
          <View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-semibold text-slate-800">Tipo de registro</Text>
            <View style={{ marginTop: 16 }}>
              <InlineSelect
                value={kind}
                items={kindOptions}
                placeholder="Seleccionar tipo"
                onSelect={(v) => setKind(v as ItemKind)}
                isOpen={kindOpen}
                onToggle={() => { setKindOpen(!kindOpen); setQuoteOpen(false); setCategoryOpen(false); setMethodOpen(false); }}
                activeColor={palette.primary}
              />
            </View>
          </View>

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            {isPago ? (
              <>
                <View className="mb-4 flex-row items-center justify-between"><Text className="text-lg font-semibold text-slate-800">Pedido pendiente</Text><Receipt size={20} color={palette.primary} /></View>
                <InlineSelect
                  value={quote}
                  items={quoteItems}
                  placeholder="Seleccionar pedido"
                  onSelect={setQuote}
                  isOpen={quoteOpen}
                  onToggle={() => { setQuoteOpen(!quoteOpen); setKindOpen(false); setCategoryOpen(false); setMethodOpen(false); }}
                  activeColor={palette.primary}
                />
                {selectedQuote ? (
                  <View className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <View className="flex-row justify-between"><Text className="text-sm text-slate-500">Cliente</Text><Text className="font-semibold text-slate-800">{selectedQuote.customerName}</Text></View>
                    <View className="mt-3 flex-row justify-between"><Text className="text-sm text-slate-500">Total</Text><Text className="font-semibold text-slate-800">{formatCurrencyValue(selectedQuote.total)}</Text></View>
                    <View className="mt-3 flex-row justify-between"><Text className="text-sm text-slate-500">Saldo</Text><Text className="font-semibold text-slate-800">{formatCurrencyValue(selectedQuote.balance)}</Text></View>
                  </View>
                ) : null}
              </>
            ) : (
              <>
                <View className="mb-4 flex-row items-center justify-between"><Text className="text-lg font-semibold text-slate-800">Detalles del gasto</Text><PackageMinus size={20} color={palette.primary} /></View>
                <Text className="text-sm font-semibold text-slate-800 mb-2">Categoría</Text>
                <InlineSelect
                  value={category}
                  items={categoryItems}
                  placeholder="Seleccionar categoría"
                  onSelect={setCategory}
                  isOpen={categoryOpen}
                  onToggle={() => { setCategoryOpen(!categoryOpen); setKindOpen(false); setQuoteOpen(false); setMethodOpen(false); }}
                  activeColor={palette.primary}
                />
                <TouchableOpacity className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Administrar categorías de gasto" onPress={() => setShowCategoryManager((v) => !v)}>
                  <View className="flex-row items-center justify-between"><Text className="text-sm font-semibold text-slate-700">Administrar categorías</Text><Text className="text-xs font-semibold text-slate-400">{showCategoryManager ? 'Ocultar' : 'Ver'}</Text></View>
                </TouchableOpacity>
                {showCategoryManager && (
                  <View className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categorías</Text>
                    {categoryItems.length > 0 ? (
                      <View className="mt-3">
                        {categoryItems.map((option) => {
                          const isEditing = editingCategoryId === option.value;
                          return (
                            <View key={option.value} className="mb-2 flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white px-3 py-2">
                              <View className="flex-1 pr-2">
                                {isEditing ? <TextInput className="text-base font-semibold text-slate-800" value={editingCategoryName} onChangeText={setEditingCategoryName} autoFocus /> : <Text className="text-base font-semibold text-slate-800">{option.label}</Text>}
                              </View>
                              {isEditing ? (
                                <View className="flex-row items-center">
                                  <TouchableOpacity className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Guardar categoría ${option.label}`} onPress={() => { void handleUpdateCategory(option.value); }}><Check size={18} color="#047857" /></TouchableOpacity>
                                  <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Cancelar edición de ${option.label}`} onPress={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}><X size={18} color="#334155" /></TouchableOpacity>
                                </View>
                              ) : (
                                <View className="flex-row items-center">
                                  <TouchableOpacity className="mr-2 h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: palette.primarySoft }} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Editar categoría ${option.label}`} onPress={() => { setEditingCategoryId(option.value); setEditingCategoryName(option.label); }}><PencilLine size={18} color={palette.primary} /></TouchableOpacity>
                                  <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-rose-50" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Eliminar categoría ${option.label}`} onPress={() => { handleDeleteCategory(option.value, option.label); }}><Trash2 size={18} color="#e11d48" /></TouchableOpacity>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ) : <Text className="mt-2 text-sm text-slate-500">Aún no hay categorías.</Text>}
                    <View className="mt-3 flex-row items-center">
                      <TextInput className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800" placeholder="Añadir nueva categoría" placeholderTextColor="#94a3b8" value={newCategory} onChangeText={setNewCategory} />
                      <TouchableOpacity className="ml-2 rounded-xl px-4 py-3" style={{ backgroundColor: palette.primary }} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Agregar categoría" disabled={isSavingOption} onPress={() => { void handleAddCategory(); }}><Text className="font-semibold text-white">Agregar</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
                <View className="mt-4"><Text className="text-sm font-semibold text-slate-800 mb-2">Descripción</Text><TextInput className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800" placeholder="Ej. Compra de empaques" placeholderTextColor="#94a3b8" value={nota} onChangeText={setNota} /></View>
              </>
            )}

            <View className="mt-4"><Text className="text-sm font-semibold text-slate-800 mb-2">Monto</Text><View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4 py-3.5"><Text className="text-base font-semibold text-slate-500">{DEFAULT_CURRENCY_SYMBOL}</Text><TextInput className="ml-2 flex-1 text-base font-semibold text-slate-800" placeholder="0.00" placeholderTextColor="#94a3b8" keyboardType="numeric" value={amount} onChangeText={setAmount} /></View></View>
            <View className="mt-4"><Text className="text-sm font-semibold text-slate-800 mb-2">Fecha</Text><TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white" onPress={() => setShowDate(true)}><Text className="text-slate-800">{date.toLocaleDateString()}</Text><CalendarIcon color="#94a3b8" size={20} /></TouchableOpacity>{showDate ? <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} /> : null}</View>
          </View>

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-sm font-semibold text-slate-800 mb-2">Método</Text>
            <InlineSelect
              value={method}
              items={methodItems}
              placeholder="Seleccionar método"
              onSelect={setMethod}
              isOpen={methodOpen}
              onToggle={() => { setMethodOpen(!methodOpen); setKindOpen(false); setQuoteOpen(false); setCategoryOpen(false); }}
              activeColor={palette.primary}
            />
            <TouchableOpacity className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Administrar métodos de pago" onPress={() => setShowMethodManager((v) => !v)}>
              <View className="flex-row items-center justify-between"><Text className="text-sm font-semibold text-slate-700">Administrar métodos</Text><Text className="text-xs font-semibold text-slate-400">{showMethodManager ? 'Ocultar' : 'Ver'}</Text></View>
            </TouchableOpacity>
            {showMethodManager && (
              <View className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">Métodos de pago</Text>
                {methodItems.length > 0 ? (
                  <View className="mt-3">
                    {methodItems.map((option) => {
                      const isEditing = editingMethodId === option.value;
                      return (
                        <View key={option.value} className="mb-2 flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white px-3 py-2">
                          <View className="flex-1 pr-2">
                            {isEditing ? <TextInput className="text-base font-semibold text-slate-800" value={editingMethodName} onChangeText={setEditingMethodName} autoFocus /> : <Text className="text-base font-semibold text-slate-800">{option.label}</Text>}
                          </View>
                          {isEditing ? (
                            <View className="flex-row items-center">
                              <TouchableOpacity className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Guardar método ${option.label}`} onPress={() => { void handleUpdateMethod(option.value); }}><Check size={18} color="#047857" /></TouchableOpacity>
                              <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Cancelar edición de ${option.label}`} onPress={() => { setEditingMethodId(null); setEditingMethodName(''); }}><X size={18} color="#334155" /></TouchableOpacity>
                            </View>
                          ) : (
                            <View className="flex-row items-center">
                              <TouchableOpacity className="mr-2 h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: palette.primarySoft }} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Editar método ${option.label}`} onPress={() => { setEditingMethodId(option.value); setEditingMethodName(option.label); }}><PencilLine size={18} color={palette.primary} /></TouchableOpacity>
                              <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-rose-50" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Eliminar método ${option.label}`} onPress={() => { handleDeleteMethod(option.value, option.label); }}><Trash2 size={18} color="#e11d48" /></TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : <Text className="mt-2 text-sm text-slate-500">Aún no hay métodos de pago.</Text>}
                <View className="mt-3 flex-row items-center">
                  <TextInput className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800" placeholder="Añadir nuevo método" placeholderTextColor="#94a3b8" value={newMethod} onChangeText={setNewMethod} />
                  <TouchableOpacity className="ml-2 rounded-xl px-4 py-3" style={{ backgroundColor: palette.primary }} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Agregar método" disabled={isSavingOption} onPress={() => { void handleAddMethod(); }}><Text className="font-semibold text-white">Agregar</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <View className="flex-row items-center justify-between"><Text className="text-sm text-slate-500">Operación</Text><Text className="text-sm font-semibold text-slate-800">{isPago ? 'Pago' : 'Gasto'}</Text></View>
            <View className="mt-2 flex-row items-center justify-between"><Text className="text-sm text-slate-500">Monto</Text><Text className={`text-lg font-semibold ${isPago ? 'text-emerald-700' : 'text-rose-700'}`}>{`${isPago ? '+' : '-'} ${formatCurrencyValue(amount.trim().length > 0 ? amount : '0')}`}</Text></View>
            {isPago && selectedQuote ? <View className="mt-2 flex-row items-center justify-between"><Text className="text-sm text-slate-500">Saldo restante</Text><Text className="text-sm font-semibold text-slate-800">{formatCurrencyAmount(remainingBalance)}</Text></View> : null}
          </View>

          {error ? <Text className="mt-4 text-sm font-medium text-rose-700">{error}</Text> : null}
        </KeyboardAwareLayout>
      </Animated.View>

      <Animated.View className="border-t border-slate-100 bg-white px-5 pt-4 flex-row items-center justify-between" style={{ paddingBottom: Math.max(insets.bottom, 16) }} entering={sectionEntering(2)}>
        <View className="flex-row items-center"><View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: palette.primarySoft }}><CreditCard size={20} color={palette.primary} /></View><View><Text className="text-slate-500 font-medium">{isPago ? 'Cobro' : 'Gasto'} a registrar</Text><Text className="text-lg font-semibold text-slate-800">{formatCurrencyValue(amount.trim().length > 0 ? amount : '0')}</Text></View></View>
        <TouchableOpacity className="rounded-2xl px-6 py-3" style={{ backgroundColor: isFormValid && !isSubmitting ? palette.primary : '#e2e8f0' }} disabled={!isFormValid || isSubmitting} onPress={() => { void handleSubmit(); }}><Text className={`font-semibold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>{isSubmitting ? 'Guardando...' : 'Registrar'}</Text></TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

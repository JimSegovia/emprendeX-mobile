import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar as CalendarIcon, Check, CreditCard, PackageMinus, PencilLine, Receipt, Trash2, X } from 'lucide-react-native';
import React, { useState, useMemo, useEffect } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareLayout } from '@/components/KeyboardAwareLayout';
import DropDownPicker from 'react-native-dropdown-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createCategoriaFinanciera, createGasto, createMetodoPago, createPago, deleteCategoriaFinanciera, deleteMetodoPago, fetchCategoriasFinancieras, fetchMetodosPago, getReadableContabilidadError, updateCategoriaFinanciera, updateMetodoPago } from '@/lib/contabilidad';
import { fetchPedidosPendientes, getReadableVentasError, type PedidoPendiente } from '@/lib/ventas';
import { useAuthSession } from '@/lib/auth-session-context';

type ItemKind = 'Pago' | 'Gasto';

const kindOptions = [
  { label: 'Ingreso por Pago', value: 'Pago' },
  { label: 'Salida por Gasto', value: 'Gasto' },
];

export default function NuevoRegistroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuthSession();
  const { tipo } = useLocalSearchParams<{ tipo?: 'pago' | 'gasto' }>();
  const [kind, setKind] = useState<ItemKind>(tipo === 'gasto' ? 'Gasto' : 'Pago');
  const [kindOpen, setKindOpen] = useState(false);
  const [kindItems, setKindItems] = useState(kindOptions);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [methodItems, setMethodItems] = useState<{ label: string; value: string }[]>([]);
  const [showMethodManager, setShowMethodManager] = useState(false);
  const [newMethod, setNewMethod] = useState('');
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [editingMethodName, setEditingMethodName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteItems, setQuoteItems] = useState<{ label: string; value: string }[]>([]);
  const [pendingQuotes, setPendingQuotes] = useState<PedidoPendiente[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<{ label: string; value: string }[]>([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSavingOption, setIsSavingOption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownSpacing = 220;

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
      Alert.alert('Nombre invalido', 'Escribe el nombre del metodo de pago.');
      return;
    }
    if (methodItems.some((item) => item.label.trim().toLowerCase() === next.toLowerCase())) {
      Alert.alert('Duplicado', 'Ese metodo de pago ya existe.');
      return;
    }

    setIsSavingOption(true);
    setError(null);

    try {
      const createdMethod = await createMetodoPago(accessToken, { name: next });
      setMethodItems((prev) => [...prev, { label: createdMethod.name, value: createdMethod.paymentMethodId }]);
      setNewMethod('');
      setMethod(createdMethod.paymentMethodId);
      Alert.alert('Metodo agregado', `Se agrego: ${createdMethod.name}`);
    } catch (optionError) {
      Alert.alert('No se pudo agregar el metodo', getReadableContabilidadError(optionError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleUpdateMethod = async (paymentMethodId: string) => {
    const next = normalize(editingMethodName);

    if (!accessToken) return;
    if (!next) {
      Alert.alert('Nombre invalido', 'El metodo de pago no puede estar vacio.');
      return;
    }
    if (
      methodItems.some(
        (item) => item.value !== paymentMethodId && item.label.trim().toLowerCase() === next.toLowerCase(),
      )
    ) {
      Alert.alert('Duplicado', 'Ya existe un metodo de pago con ese nombre.');
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
      Alert.alert('Metodo actualizado', `Ahora es: ${updatedMethod.name}`);
    } catch (optionError) {
      Alert.alert('No se pudo actualizar el metodo', getReadableContabilidadError(optionError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleDeleteMethod = (paymentMethodId: string, label: string) => {
    if (!accessToken) return;

    confirmDelete('Eliminar metodo', `¿Eliminar "${label}"?`, () => {
      void (async () => {
        setIsSavingOption(true);
        setError(null);

        try {
          await deleteMetodoPago(accessToken, paymentMethodId);
          setMethodItems((prev) => prev.filter((item) => item.value !== paymentMethodId));
          if (method === paymentMethodId) {
            setMethod(null);
          }
          Alert.alert('Metodo eliminado', `Se elimino: ${label}`);
        } catch (optionError) {
          Alert.alert('No se pudo eliminar el metodo', getReadableContabilidadError(optionError));
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
      Alert.alert('Nombre invalido', 'Escribe el nombre de la categoria.');
      return;
    }
    if (categoryItems.some((item) => item.label.trim().toLowerCase() === next.toLowerCase())) {
      Alert.alert('Duplicado', 'Esa categoria ya existe.');
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
      Alert.alert('Categoria agregada', `Se agrego: ${createdCategory.name}`);
    } catch (optionError) {
      Alert.alert('No se pudo agregar la categoria', getReadableContabilidadError(optionError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleUpdateCategory = async (financialCategoryId: string) => {
    const next = normalize(editingCategoryName);

    if (!accessToken) return;
    if (!next) {
      Alert.alert('Nombre invalido', 'La categoria no puede estar vacia.');
      return;
    }
    if (
      categoryItems.some(
        (item) => item.value !== financialCategoryId && item.label.trim().toLowerCase() === next.toLowerCase(),
      )
    ) {
      Alert.alert('Duplicado', 'Ya existe una categoria con ese nombre.');
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
      Alert.alert('Categoria actualizada', `Ahora es: ${updatedCategory.name}`);
    } catch (optionError) {
      Alert.alert('No se pudo actualizar la categoria', getReadableContabilidadError(optionError));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleDeleteCategory = (financialCategoryId: string, label: string) => {
    if (!accessToken) return;

    confirmDelete('Eliminar categoria', `¿Eliminar "${label}"?`, () => {
      void (async () => {
        setIsSavingOption(true);
        setError(null);

        try {
          await deleteCategoriaFinanciera(accessToken, financialCategoryId);
          setCategoryItems((prev) => prev.filter((item) => item.value !== financialCategoryId));
          if (category === financialCategoryId) {
            setCategory(null);
          }
          Alert.alert('Categoria eliminada', `Se elimino: ${label}`);
        } catch (optionError) {
          Alert.alert('No se pudo eliminar la categoria', getReadableContabilidadError(optionError));
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
        <ActivityIndicator color="#7c3aed" />
      </Animated.View>
    );
  }

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View className="bg-violet-600 px-4 pb-4 flex-row items-center" style={{ paddingTop: Math.max(insets.top, 16) + 16 }} entering={sectionEntering(0)}>
        <TouchableOpacity onPress={() => router.back()} className="mr-4"><ArrowLeft color="white" size={24} /></TouchableOpacity>
        <Text className="text-white text-xl font-bold">Nuevo registro</Text>
      </Animated.View>

      <Animated.View className="flex-1" entering={sectionEntering(1)}>
        <KeyboardAwareLayout style={{ paddingHorizontal: 20, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
          <View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-extrabold text-slate-800">Tipo de registro</Text>
            <DropDownPicker open={kindOpen} value={kind} items={kindItems} setOpen={setKindOpen} setValue={setKind} setItems={setKindItems} placeholder="Seleccionar tipo" listMode="SCROLLVIEW" maxHeight={dropdownSpacing} zIndex={3000} zIndexInverse={1000} style={{ borderColor: '#e5e7eb', backgroundColor: 'white', marginTop: 16 }} dropDownContainerStyle={{ borderColor: '#e5e7eb' }} textStyle={{ color: '#0f172a', fontWeight: '500' }} onOpen={() => { setQuoteOpen(false); setCategoryOpen(false); setMethodOpen(false); }} />
          </View>

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            {isPago ? (
              <>
                <View className="mb-4 flex-row items-center justify-between"><Text className="text-lg font-extrabold text-slate-800">Pedido pendiente</Text><Receipt size={20} color="#7c3aed" /></View>
                <DropDownPicker open={quoteOpen} value={quote} items={quoteItems} setOpen={setQuoteOpen} setValue={setQuote} setItems={setQuoteItems} placeholder="Seleccionar pedido" listMode="SCROLLVIEW" maxHeight={dropdownSpacing} zIndex={2000} zIndexInverse={2000} style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }} dropDownContainerStyle={{ borderColor: '#e5e7eb' }} textStyle={{ color: quote ? '#0f172a' : '#94a3b8' }} onOpen={() => { setKindOpen(false); setCategoryOpen(false); setMethodOpen(false); }} />
                {selectedQuote ? (
                  <View className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <View className="flex-row justify-between"><Text className="text-sm text-slate-500">Cliente</Text><Text className="font-semibold text-slate-800">{selectedQuote.customerName}</Text></View>
                    <View className="mt-3 flex-row justify-between"><Text className="text-sm text-slate-500">Total</Text><Text className="font-semibold text-slate-800">S/ {selectedQuote.total}</Text></View>
                    <View className="mt-3 flex-row justify-between"><Text className="text-sm text-slate-500">Saldo</Text><Text className="font-semibold text-slate-800">S/ {selectedQuote.balance}</Text></View>
                  </View>
                ) : null}
              </>
            ) : (
              <>
                <View className="mb-4 flex-row items-center justify-between"><Text className="text-lg font-extrabold text-slate-800">Detalles del gasto</Text><PackageMinus size={20} color="#e11d48" /></View>
                <Text className="text-sm font-bold text-slate-800 mb-2">Categoría</Text>
                <DropDownPicker open={categoryOpen} value={category} items={categoryItems} setOpen={setCategoryOpen} setValue={setCategory} setItems={setCategoryItems} placeholder="Seleccionar categoría" listMode="SCROLLVIEW" maxHeight={dropdownSpacing} zIndex={2000} zIndexInverse={2000} style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }} dropDownContainerStyle={{ borderColor: '#e5e7eb' }} textStyle={{ color: category ? '#0f172a' : '#94a3b8' }} onOpen={() => { setKindOpen(false); setQuoteOpen(false); setMethodOpen(false); }} />
                <TouchableOpacity className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Administrar categorías de gasto" onPress={() => setShowCategoryManager((v) => !v)}>
                  <View className="flex-row items-center justify-between"><Text className="text-sm font-semibold text-slate-700">Administrar categorías</Text><Text className="text-xs font-semibold text-slate-400">{showCategoryManager ? 'Ocultar' : 'Ver'}</Text></View>
                </TouchableOpacity>
                {showCategoryManager && (
                  <View className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <Text className="text-xs font-bold uppercase tracking-wide text-slate-500">Categorías</Text>
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
                                  <TouchableOpacity className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Guardar categoría ${option.label}`} onPress={() => { void handleUpdateCategory(option.value); }}><Check size={18} color="#059669" /></TouchableOpacity>
                                  <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Cancelar edición de ${option.label}`} onPress={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}><X size={18} color="#334155" /></TouchableOpacity>
                                </View>
                              ) : (
                                <View className="flex-row items-center">
                                  <TouchableOpacity className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-violet-50" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Editar categoría ${option.label}`} onPress={() => { setEditingCategoryId(option.value); setEditingCategoryName(option.label); }}><PencilLine size={18} color="#7c3aed" /></TouchableOpacity>
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
                      <TouchableOpacity className="ml-2 rounded-xl bg-violet-600 px-4 py-3" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Agregar categoría" disabled={isSavingOption} onPress={() => { void handleAddCategory(); }}><Text className="font-semibold text-white">Agregar</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
                <View className="mt-4"><Text className="text-sm font-bold text-slate-800 mb-2">Descripción</Text><TextInput className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800" placeholder="Ej. Compra de empaques" placeholderTextColor="#94a3b8" value={nota} onChangeText={setNota} /></View>
              </>
            )}

            <View className="mt-4"><Text className="text-sm font-bold text-slate-800 mb-2">Monto</Text><View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4 py-3.5"><Text className="text-base font-semibold text-slate-500">S/</Text><TextInput className="ml-2 flex-1 text-base font-semibold text-slate-800" placeholder="0.00" placeholderTextColor="#94a3b8" keyboardType="numeric" value={amount} onChangeText={setAmount} /></View></View>
            <View className="mt-4"><Text className="text-sm font-bold text-slate-800 mb-2">Fecha</Text><TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white" onPress={() => setShowDate(true)}><Text className="text-slate-800">{date.toLocaleDateString()}</Text><CalendarIcon color="#94a3b8" size={20} /></TouchableOpacity>{showDate ? <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} /> : null}</View>
          </View>

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-sm font-bold text-slate-800 mb-2">Método</Text>
            <DropDownPicker open={methodOpen} value={method} items={methodItems} setOpen={setMethodOpen} setValue={setMethod} setItems={setMethodItems} placeholder="Seleccionar método" listMode="SCROLLVIEW" maxHeight={dropdownSpacing} zIndex={1000} zIndexInverse={3000} style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }} dropDownContainerStyle={{ borderColor: '#e5e7eb' }} textStyle={{ color: method ? '#0f172a' : '#94a3b8' }} onOpen={() => { setKindOpen(false); setQuoteOpen(false); setCategoryOpen(false); }} />
            <TouchableOpacity className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Administrar métodos de pago" onPress={() => setShowMethodManager((v) => !v)}>
              <View className="flex-row items-center justify-between"><Text className="text-sm font-semibold text-slate-700">Administrar métodos</Text><Text className="text-xs font-semibold text-slate-400">{showMethodManager ? 'Ocultar' : 'Ver'}</Text></View>
            </TouchableOpacity>
            {showMethodManager && (
              <View className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="text-xs font-bold uppercase tracking-wide text-slate-500">Métodos de pago</Text>
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
                              <TouchableOpacity className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-emerald-50" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Guardar método ${option.label}`} onPress={() => { void handleUpdateMethod(option.value); }}><Check size={18} color="#059669" /></TouchableOpacity>
                              <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Cancelar edición de ${option.label}`} onPress={() => { setEditingMethodId(null); setEditingMethodName(''); }}><X size={18} color="#334155" /></TouchableOpacity>
                            </View>
                          ) : (
                            <View className="flex-row items-center">
                              <TouchableOpacity className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-violet-50" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Editar método ${option.label}`} onPress={() => { setEditingMethodId(option.value); setEditingMethodName(option.label); }}><PencilLine size={18} color="#7c3aed" /></TouchableOpacity>
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
                  <TouchableOpacity className="ml-2 rounded-xl bg-violet-600 px-4 py-3" activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Agregar método" disabled={isSavingOption} onPress={() => { void handleAddMethod(); }}><Text className="font-semibold text-white">Agregar</Text></TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <View className="flex-row items-center justify-between"><Text className="text-sm text-slate-500">Operación</Text><Text className="text-sm font-semibold text-slate-800">{isPago ? 'Pago' : 'Gasto'}</Text></View>
            <View className="mt-2 flex-row items-center justify-between"><Text className="text-sm text-slate-500">Monto</Text><Text className={`text-lg font-extrabold ${isPago ? 'text-emerald-600' : 'text-rose-600'}`}>{isPago ? '+' : '-'} S/ {amount.trim().length > 0 ? amount : '0.00'}</Text></View>
            {isPago && selectedQuote ? <View className="mt-2 flex-row items-center justify-between"><Text className="text-sm text-slate-500">Saldo restante</Text><Text className="text-sm font-semibold text-slate-800">S/ {remainingBalance.toFixed(2)}</Text></View> : null}
          </View>

          {error ? <Text className="mt-4 text-sm font-medium text-rose-600">{error}</Text> : null}
        </KeyboardAwareLayout>
      </Animated.View>

      <Animated.View className="border-t border-slate-100 bg-white px-5 pt-4 flex-row items-center justify-between" style={{ paddingBottom: Math.max(insets.bottom, 16) }} entering={sectionEntering(2)}>
        <View className="flex-row items-center"><View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-violet-50"><CreditCard size={20} color="#7c3aed" /></View><View><Text className="text-slate-500 font-medium">{isPago ? 'Cobro' : 'Gasto'} a registrar</Text><Text className="text-lg font-bold text-slate-800">S/ {amount.trim().length > 0 ? amount : '0.00'}</Text></View></View>
        <TouchableOpacity className={`rounded-2xl px-6 py-3 ${isFormValid && !isSubmitting ? 'bg-violet-600' : 'bg-slate-200'}`} disabled={!isFormValid || isSubmitting} onPress={() => { void handleSubmit(); }}><Text className={`font-semibold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>{isSubmitting ? 'Guardando...' : 'Registrar'}</Text></TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

import Animated, { screenEntering, sectionEntering } from '@/components/ui/motion';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar as CalendarIcon, CreditCard, Receipt, PackageMinus } from 'lucide-react-native';
import React, { useState, useMemo, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createGasto, createPago, fetchCategoriasFinancieras, fetchMetodosPago, getReadableContabilidadError } from '@/lib/contabilidad';
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
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteItems, setQuoteItems] = useState<{ label: string; value: string }[]>([]);
  const [pendingQuotes, setPendingQuotes] = useState<PedidoPendiente[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<{ label: string; value: string }[]>([]);
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownSpacing = 220;

  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) return;
      try {
        const [orders, methods, categories] = await Promise.all([
          fetchPedidosPendientes(accessToken),
          fetchMetodosPago(accessToken),
          fetchCategoriasFinancieras(accessToken),
        ]);
        setPendingQuotes(orders);
        setQuoteItems(orders.map((item) => ({ label: `${item.referenceCode} · ${item.customerName}`, value: item.id })));
        setMethodItems(methods.map((item) => ({ label: item.name, value: item.paymentMethodId })));
        setCategoryItems(categories.map((item) => ({ label: item.name, value: item.financialCategoryId })));
      } catch (loadError) {
        setError(getReadableContabilidadError(loadError));
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

  return (
    <Animated.View className="flex-1 bg-white" entering={screenEntering}>
      <Animated.View className="bg-violet-600 px-4 pb-4 flex-row items-center" style={{ paddingTop: Math.max(insets.top, 16) + 16 }} entering={sectionEntering(0)}>
        <TouchableOpacity onPress={() => router.back()} className="mr-4"><ArrowLeft color="white" size={24} /></TouchableOpacity>
        <Text className="text-white text-xl font-bold">Nuevo registro</Text>
      </Animated.View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }} entering={sectionEntering(1)}>
          <View className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-lg font-extrabold text-slate-800">Tipo de registro</Text>
            <DropDownPicker open={kindOpen} value={kind} items={kindItems} setOpen={setKindOpen} setValue={setKind} setItems={setKindItems} placeholder="Seleccionar tipo" listMode="SCROLLVIEW" maxHeight={dropdownSpacing} zIndex={3000} zIndexInverse={1000} style={{ borderColor: '#e5e7eb', backgroundColor: 'white', marginTop: 16 }} dropDownContainerStyle={{ borderColor: '#e5e7eb' }} textStyle={{ color: '#0f172a', fontWeight: '500' }} />
          </View>

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            {isPago ? (
              <>
                <View className="mb-4 flex-row items-center justify-between"><Text className="text-lg font-extrabold text-slate-800">Pedido pendiente</Text><Receipt size={20} color="#7c3aed" /></View>
                <DropDownPicker open={quoteOpen} value={quote} items={quoteItems} setOpen={setQuoteOpen} setValue={setQuote} setItems={setQuoteItems} placeholder="Seleccionar pedido" listMode="SCROLLVIEW" maxHeight={dropdownSpacing} zIndex={2000} zIndexInverse={2000} style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }} dropDownContainerStyle={{ borderColor: '#e5e7eb' }} textStyle={{ color: quote ? '#0f172a' : '#94a3b8' }} />
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
                <DropDownPicker open={categoryOpen} value={category} items={categoryItems} setOpen={setCategoryOpen} setValue={setCategory} setItems={setCategoryItems} placeholder="Seleccionar categoría" listMode="SCROLLVIEW" maxHeight={dropdownSpacing} zIndex={2000} zIndexInverse={2000} style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }} dropDownContainerStyle={{ borderColor: '#e5e7eb' }} textStyle={{ color: category ? '#0f172a' : '#94a3b8' }} />
                <View className="mt-4"><Text className="text-sm font-bold text-slate-800 mb-2">Descripción</Text><TextInput className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800" placeholder="Ej. Compra de empaques" placeholderTextColor="#94a3b8" value={nota} onChangeText={setNota} /></View>
              </>
            )}

            <View className="mt-4"><Text className="text-sm font-bold text-slate-800 mb-2">Monto</Text><View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4 py-3.5"><Text className="text-base font-semibold text-slate-500">S/</Text><TextInput className="ml-2 flex-1 text-base font-semibold text-slate-800" placeholder="0.00" placeholderTextColor="#94a3b8" keyboardType="numeric" value={amount} onChangeText={setAmount} /></View></View>
            <View className="mt-4"><Text className="text-sm font-bold text-slate-800 mb-2">Fecha</Text><TouchableOpacity className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 bg-white" onPress={() => setShowDate(true)}><Text className="text-slate-800">{date.toLocaleDateString()}</Text><CalendarIcon color="#94a3b8" size={20} /></TouchableOpacity>{showDate ? <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} /> : null}</View>
          </View>

          <View className="mt-6 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100">
            <Text className="text-sm font-bold text-slate-800 mb-2">Método</Text>
            <DropDownPicker open={methodOpen} value={method} items={methodItems} setOpen={setMethodOpen} setValue={setMethod} setItems={setMethodItems} placeholder="Seleccionar método" listMode="SCROLLVIEW" maxHeight={dropdownSpacing} zIndex={1000} zIndexInverse={3000} style={{ borderColor: '#e5e7eb', backgroundColor: 'white' }} dropDownContainerStyle={{ borderColor: '#e5e7eb' }} textStyle={{ color: method ? '#0f172a' : '#94a3b8' }} />
          </View>

          <View className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <View className="flex-row items-center justify-between"><Text className="text-sm text-slate-500">Operación</Text><Text className="text-sm font-semibold text-slate-800">{isPago ? 'Pago' : 'Gasto'}</Text></View>
            <View className="mt-2 flex-row items-center justify-between"><Text className="text-sm text-slate-500">Monto</Text><Text className={`text-lg font-extrabold ${isPago ? 'text-emerald-600' : 'text-rose-600'}`}>{isPago ? '+' : '-'} S/ {amount.trim().length > 0 ? amount : '0.00'}</Text></View>
            {isPago && selectedQuote ? <View className="mt-2 flex-row items-center justify-between"><Text className="text-sm text-slate-500">Saldo restante</Text><Text className="text-sm font-semibold text-slate-800">S/ {remainingBalance.toFixed(2)}</Text></View> : null}
          </View>

          {error ? <Text className="mt-4 text-sm font-medium text-rose-600">{error}</Text> : null}
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <Animated.View className="border-t border-slate-100 bg-white px-5 pt-4 flex-row items-center justify-between" style={{ paddingBottom: Math.max(insets.bottom, 16) }} entering={sectionEntering(2)}>
        <View className="flex-row items-center"><View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-violet-50"><CreditCard size={20} color="#7c3aed" /></View><View><Text className="text-slate-500 font-medium">{isPago ? 'Cobro' : 'Gasto'} a registrar</Text><Text className="text-lg font-bold text-slate-800">S/ {amount.trim().length > 0 ? amount : '0.00'}</Text></View></View>
        <TouchableOpacity className={`rounded-2xl px-6 py-3 ${isFormValid && !isSubmitting ? 'bg-violet-600' : 'bg-slate-200'}`} disabled={!isFormValid || isSubmitting} onPress={() => { void handleSubmit(); }}><Text className={`font-semibold ${isFormValid ? 'text-white' : 'text-slate-400'}`}>{isSubmitting ? 'Guardando...' : 'Registrar'}</Text></TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
